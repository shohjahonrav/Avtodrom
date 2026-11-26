import type { Gear3D, VehiclePhysicsConfig } from '@/types/simulator3d';

export interface DrivetrainState {
  gear: Gear3D;
  rpm: number;
  engineRunning: boolean;
  stalled: boolean;
  clutchEngagement: number; // 0 = fully pressed (disengaged), 1 = fully released (engaged)
}

export interface DrivetrainOutput {
  driveForceN: number;
  engineBrakeForceN: number;
  nextRpm: number;
  justStalled: boolean;
}

/**
 * Evaluates manual 5-speed + Reverse drivetrain torque, clutch engagement, RPM, and stall physics.
 */
export function stepDrivetrain(params: {
  state: DrivetrainState;
  throttle: number; // 0..1
  clutchPedal: number; // 0 = released, 1 = pressed
  signedForwardSpeedMps: number;
  config: VehiclePhysicsConfig;
  dt: number;
}): DrivetrainOutput {
  const { state, throttle, clutchPedal, signedForwardSpeedMps, config, dt } = params;
  const clutchEngagement = Math.max(0, Math.min(1, 1 - clutchPedal));

  if (!state.engineRunning || state.stalled) {
    return {
      driveForceN: 0,
      engineBrakeForceN: 0,
      nextRpm: 0,
      justStalled: false,
    };
  }

  const gearRatio = config.gearRatios[state.gear];
  const isNeutral = state.gear === 'N' || gearRatio === 0;

  if (isNeutral || clutchEngagement < 0.05) {
    // Free-revving engine
    const targetFreeRpm = config.idleRpm + throttle * (config.maxRpm - config.idleRpm) * 0.85;
    const nextRpm = state.rpm + (targetFreeRpm - state.rpm) * Math.min(1, dt * 8);
    return {
      driveForceN: 0,
      engineBrakeForceN: 0,
      nextRpm: Math.round(nextRpm),
      justStalled: false,
    };
  }

  // Wheel angular speed -> equivalent engine RPM
  const wheelCircumference = 2 * Math.PI * config.wheelRadiusMeters;
  const wheelRpm = (signedForwardSpeedMps / wheelCircumference) * 60;
  const coupledEngineRpm = wheelRpm * gearRatio * config.finalDriveRatio;

  // Torque curve multiplier (peaking around 3800 RPM)
  const effectiveRpm = Math.max(config.idleRpm, Math.abs(coupledEngineRpm));
  const normalizedRpm = Math.min(1, effectiveRpm / config.maxRpm);
  const torqueCurveFactor =
    0.65 + 0.35 * Math.sin(Math.min(1, normalizedRpm * 1.35) * Math.PI * 0.65);

  // Stall detection: clutch mostly engaged while in gear with negligible throttle and very low speed
  const isWrongHighGearLaunch =
    (state.gear === '3' || state.gear === '4' || state.gear === '5') &&
    Math.abs(signedForwardSpeedMps) < 1.3 &&
    clutchEngagement > 0.72 &&
    throttle < 0.35;

  const isLowSpeedStall =
    Math.abs(signedForwardSpeedMps) < 0.28 &&
    clutchEngagement > 0.88 &&
    throttle < 0.05 &&
    Math.abs(coupledEngineRpm) < config.stallRpm;

  if (isWrongHighGearLaunch || isLowSpeedStall) {
    return {
      driveForceN: 0,
      engineBrakeForceN: 0,
      nextRpm: 0,
      justStalled: true,
    };
  }

  // Anti-stall idle creep torque at bite point when throttle is gently applied or biting
  const creepDemand = clutchEngagement > 0.25 && clutchEngagement < 0.85 ? 0.22 : 0.14;
  const throttleDemand = Math.max(creepDemand, throttle);

  // RPM limit cut near redline
  const revLimiterFactor = effectiveRpm >= config.maxRpm ? 0 : 1;

  const engineTorqueNm = config.peakTorqueNm * torqueCurveFactor * throttleDemand * revLimiterFactor;
  const wheelTorqueNm = engineTorqueNm * gearRatio * config.finalDriveRatio * clutchEngagement;
  const driveForceN = wheelTorqueNm / config.wheelRadiusMeters;

  // Engine braking when off throttle and coupled
  const engineBrakeForceN =
    throttle < 0.04 && Math.abs(signedForwardSpeedMps) > 0.5
      ? ((config.engineBrakingNm * Math.abs(gearRatio) * config.finalDriveRatio) /
          config.wheelRadiusMeters) *
        clutchEngagement *
        0.18
      : 0;

  const targetRpm = Math.min(
    config.maxRpm,
    Math.max(
      config.idleRpm + throttle * 1600 * (1 - clutchEngagement * 0.5),
      Math.abs(coupledEngineRpm) + throttle * 650
    )
  );
  const nextRpm = state.rpm + (targetRpm - state.rpm) * Math.min(1, dt * 10);

  return {
    driveForceN,
    engineBrakeForceN,
    nextRpm: Math.round(nextRpm),
    justStalled: false,
  };
}
