import { degToRad, normalizeAngleRad } from '@/lib/utils/geometry';
import type {
  GearPosition,
  TransmissionType,
  VehicleControlsState,
  VehicleDimensions,
  VehiclePhysicsState,
} from '@/types';

const GEAR_RATIOS: Record<GearPosition, number> = {
  R: -3.2,
  N: 0,
  '1': 3.5,
  '2': 2.1,
  '3': 1.4,
  '4': 1.0,
  '5': 0.8,
};

const GEAR_MAX_SPEED_MPS: Record<GearPosition, number> = {
  R: 5.5, // ~20 km/h
  N: 0,
  '1': 6.0, // ~21.6 km/h
  '2': 11.5, // ~41 km/h
  '3': 17.5,
  '4': 24.0,
  '5': 32.0,
};

export interface PhysicsStepResult {
  nextVehicle: VehiclePhysicsState;
  justStalled: boolean;
  stallReason?: string;
}

export function stepVehiclePhysics(
  vehicle: VehiclePhysicsState,
  controls: VehicleControlsState,
  dims: VehicleDimensions,
  transmission: TransmissionType,
  slopeGrade: number, // e.g. 0.12 for 12% uphill, -0.12 for downhill, 0 flat
  dt: number
): PhysicsStepResult {
  const clampedDt = Math.min(Math.max(dt, 0.001), 0.05);
  const maxSteerRad = degToRad(dims.maxSteeringAngleDeg);
  const targetSteerRad = controls.steeringInput * maxSteerRad;

  // Smooth steering actuator
  const steerRate = 3.6; // rad/s
  const steerDiff = targetSteerRad - vehicle.steeringAngleRad;
  const maxSteerDelta = steerRate * clampedDt;
  const nextSteeringAngleRad =
    Math.abs(steerDiff) <= maxSteerDelta
      ? targetSteerRad
      : vehicle.steeringAngleRad + Math.sign(steerDiff) * maxSteerDelta;

  const effectiveClutch =
    transmission === 'automatic'
      ? controls.gear === 'N'
        ? 1
        : controls.brake > 0.25 && Math.abs(vehicle.speedMps) < 0.8
          ? 0.9
          : 0
      : controls.clutch;

  const clutchEngagement = Math.max(0, Math.min(1, 1 - effectiveClutch));
  const gearRatio = GEAR_RATIOS[controls.gear];
  const isInDriveGear = controls.gear !== 'N';

  let speedMps = vehicle.speedMps;
  let rpm = vehicle.rpm;
  let stalled = vehicle.stalled;
  let justStalled = false;
  let stallReason: string | undefined;

  if (!controls.engineRunning || stalled) {
    rpm = 0;
  }

  // Gravity acceleration along slope (positive slopeGrade = uphill facing +heading)
  // Uphill pulls vehicle backward (negative acceleration)
  const gravityAccel = -9.81 * slopeGrade;

  // Drive force from engine
  let driveAccel = 0;
  if (controls.engineRunning && !stalled && isInDriveGear && clutchEngagement > 0.08) {
    const isReverse = controls.gear === 'R';
    const maxGearSpeed = GEAR_MAX_SPEED_MPS[controls.gear];
    const idleCreep = transmission === 'automatic' ? 0.35 : 0.24;
    const pedalDemand = Math.max(idleCreep, controls.throttle);

    // Check stall condition for manual transmission
    if (transmission === 'manual') {
      const wheelSpeedForGear = Math.abs(speedMps);
      const isHighGearFromStop =
        (controls.gear === '3' || controls.gear === '4' || controls.gear === '5') &&
        wheelSpeedForGear < 1.2 &&
        clutchEngagement > 0.78 &&
        controls.throttle < 0.35;
      const droppedClutchWithNoGasOnHill =
        slopeGrade > 0.06 &&
        wheelSpeedForGear < 0.25 &&
        clutchEngagement > 0.88 &&
        controls.throttle < 0.12 &&
        controls.brake < 0.2 &&
        !controls.handbrake;

      if (isHighGearFromStop || droppedClutchWithNoGasOnHill) {
        stalled = true;
        justStalled = true;
        rpm = 0;
        stallReason = isHighGearFromStop
          ? `${controls.gear}-uzatmada joyidan qo‘zg‘alishda dvigatel o‘chib qoldi`
          : 'Estakadada gaz bermasdan ilashish keskin qo‘yib yuborildi — dvigatel o‘chib qoldi';
      }
    }

    if (!stalled) {
      const torqueFactor = Math.abs(gearRatio) * 1.45;
      const directionSign = isReverse ? -1 : 1;
      const forwardSpeedInGearDir = speedMps * directionSign;

      if (forwardSpeedInGearDir < maxGearSpeed) {
        const headroom = Math.max(0, 1 - Math.max(0, forwardSpeedInGearDir) / maxGearSpeed);
        driveAccel = directionSign * pedalDemand * torqueFactor * clutchEngagement * (0.45 + 0.55 * headroom);
      }
    }
  }

  // Braking & Handbrake
  const serviceBrakeDecel = controls.brake * 8.5;
  const handbrakeDecel = controls.handbrake ? 7.2 : 0;
  const totalBrakeDecel = serviceBrakeDecel + handbrakeDecel;
  const rollingFriction = 0.35;

  // Apply forces
  let netAccel = driveAccel + gravityAccel;

  // Rolling drag opposing current motion
  if (Math.abs(speedMps) > 0.02) {
    netAccel -= Math.sign(speedMps) * rollingFriction;
  }

  // Apply braking opposing motion (or holding stationary against gravity/drive)
  if (Math.abs(speedMps) <= 0.05) {
    const netHoldForce = Math.abs(netAccel);
    if (totalBrakeDecel >= netHoldForce) {
      speedMps = 0;
      netAccel = 0;
    } else {
      netAccel -= Math.sign(netAccel || 1) * totalBrakeDecel;
    }
  } else {
    const brakeSign = Math.sign(speedMps);
    netAccel -= brakeSign * totalBrakeDecel;
  }

  const prevSpeed = speedMps;
  speedMps += netAccel * clampedDt;

  // Prevent braking from reversing direction when holding stop
  if (totalBrakeDecel > 0.5 && Math.abs(driveAccel) < 0.2 && Math.sign(prevSpeed) !== Math.sign(speedMps) && Math.abs(prevSpeed) < 0.5) {
    speedMps = 0;
  }

  // Clamp tiny speeds to zero when braking
  if (Math.abs(speedMps) < 0.015 && totalBrakeDecel > 0.5) {
    speedMps = 0;
  }

  // Compute RPM
  if (controls.engineRunning && !stalled) {
    const idleRpm = 800;
    const freeRevRpm = idleRpm + controls.throttle * 4200;
    if (!isInDriveGear || clutchEngagement < 0.15) {
      rpm = vehicle.rpm + (freeRevRpm - vehicle.rpm) * Math.min(1, clampedDt * 8);
    } else {
      const wheelBasedRpm = idleRpm + Math.abs(speedMps) * Math.abs(gearRatio) * 140;
      const targetRpm = Math.min(6500, Math.max(idleRpm, wheelBasedRpm + controls.throttle * 900));
      rpm = vehicle.rpm + (targetRpm - vehicle.rpm) * Math.min(1, clampedDt * 10);
    }
  }

  // Bicycle kinematics
  const distanceMoved = speedMps * clampedDt;
  let nextX = vehicle.x;
  let nextY = vehicle.y;
  let nextHeading = vehicle.headingRad;

  if (Math.abs(distanceMoved) > 1e-6) {
    const angularVelocity = (speedMps / dims.wheelbaseMeters) * Math.tan(nextSteeringAngleRad);
    const midHeading = vehicle.headingRad + (angularVelocity * clampedDt) / 2;
    nextX = vehicle.x + distanceMoved * Math.cos(midHeading);
    nextY = vehicle.y + distanceMoved * Math.sin(midHeading);
    nextHeading = normalizeAngleRad(vehicle.headingRad + angularVelocity * clampedDt);
  }

  // Track estakada rollback (moving backward when on uphill slope)
  let rollbackDistanceMeters = vehicle.rollbackDistanceMeters;
  let maxRollbackObservedMeters = vehicle.maxRollbackObservedMeters;

  if (slopeGrade > 0.04) {
    if (speedMps < -0.02 && controls.gear !== 'R') {
      rollbackDistanceMeters += Math.abs(distanceMoved);
      maxRollbackObservedMeters = Math.max(maxRollbackObservedMeters, rollbackDistanceMeters);
    } else if (speedMps > 0.15) {
      rollbackDistanceMeters = 0;
    }
  } else {
    rollbackDistanceMeters = 0;
  }

  return {
    nextVehicle: {
      x: nextX,
      y: nextY,
      headingRad: nextHeading,
      speedMps,
      steeringAngleRad: nextSteeringAngleRad,
      rpm: Math.round(rpm),
      stalled,
      onSlopeGrade: slopeGrade,
      rollbackDistanceMeters,
      maxRollbackObservedMeters,
    },
    justStalled,
    stallReason,
  };
}
