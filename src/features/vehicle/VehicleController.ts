import RAPIER from '@dimforge/rapier3d-compat';
import { COBALT_VEHICLE_CONFIG } from '@/config/vehicle.config';
import { stepDrivetrain, type DrivetrainState } from '@/features/vehicle/Transmission';
import { PHYSICS_CONFIG } from '@/physics/PhysicsConfig';
import { PhysicsWorld } from '@/physics/PhysicsWorld';
import type { Gear3D, VehiclePhysicsConfig, VehicleTelemetry } from '@/types/simulator3d';

export interface WheelPose {
  position: [number, number, number];
  steerAngleRad: number;
  spinAngleRad: number;
  suspensionLength: number;
  inContact: boolean;
}

export class VehicleController {
  readonly chassisBody: RAPIER.RigidBody;
  readonly chassisCollider: RAPIER.Collider;
  readonly rapierVehicle: RAPIER.DynamicRayCastVehicleController;
  readonly config: VehiclePhysicsConfig;

  private drivetrain: DrivetrainState;
  private steeringNormalized = 0; // -1 (right) .. +1 (left)
  private throttleSmoothed = 0;
  private brakeSmoothed = 0;
  private clutchSmoothed = 1;
  private handbrake = true;
  private leftIndicator = false;
  private rightIndicator = false;
  private hazardLights = false;
  private headlights = false;

  private wheelConnectionYs: number[] = [];

  constructor(
    physicsWorld: PhysicsWorld,
    spawnPos: [number, number, number],
    spawnYawDeg: number,
    config: VehiclePhysicsConfig = COBALT_VEHICLE_CONFIG
  ) {
    this.config = config;

    const halfYaw = ((spawnYawDeg * Math.PI) / 180) / 2;
    this.chassisBody = physicsWorld.world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(spawnPos[0], spawnPos[1] + 0.4, spawnPos[2])
        .setRotation({ x: 0, y: Math.sin(halfYaw), z: 0, w: Math.cos(halfYaw) })
        .setLinearDamping(0.08)
        .setAngularDamping(0.45)
        .setCanSleep(false)
    );

    const ext = PHYSICS_CONFIG.chassisHalfExtents;
    this.chassisCollider = physicsWorld.world.createCollider(
      RAPIER.ColliderDesc.cuboid(ext.x, ext.y, ext.z)
        .setTranslation(0, PHYSICS_CONFIG.chassisColliderOffsetY, 0)
        .setMass(config.massKg)
        .setFriction(0.5)
        .setRestitution(0.05),
      this.chassisBody
    );
    physicsWorld.setChassisCollider(this.chassisCollider);

    this.rapierVehicle = physicsWorld.world.createVehicleController(this.chassisBody);

    const dir = { x: 0, y: -1, z: 0 };
    const axle = { x: 1, y: 0, z: 0 }; // +engineForce pushes along -Z (cobalt.glb forward), +steer turns left
    const halfWb = config.wheelbaseMeters / 2;
    const halfFrontTrack = config.frontTrackMeters / 2;
    const halfRearTrack = config.rearTrackMeters / 2;
    const connY = -0.22;

    const wheelPoints = [
      { x: -halfFrontTrack, y: connY, z: -halfWb }, // 0: FL
      { x: halfFrontTrack, y: connY, z: -halfWb }, // 1: FR
      { x: -halfRearTrack, y: connY, z: halfWb }, // 2: RL
      { x: halfRearTrack, y: connY, z: halfWb }, // 3: RR
    ];

    for (let i = 0; i < 4; i++) {
      const wp = wheelPoints[i];
      this.wheelConnectionYs.push(wp.y);
      this.rapierVehicle.addWheel(
        wp,
        dir,
        axle,
        config.suspensionRestLengthMeters,
        config.wheelRadiusMeters
      );
      this.rapierVehicle.setWheelSuspensionStiffness(i, config.suspensionStiffness);
      this.rapierVehicle.setWheelSuspensionCompression(i, config.suspensionCompression);
      this.rapierVehicle.setWheelSuspensionRelaxation(i, config.suspensionRelaxation);
      this.rapierVehicle.setWheelMaxSuspensionTravel(i, config.suspensionMaxTravelMeters);
      this.rapierVehicle.setWheelMaxSuspensionForce(i, config.maxSuspensionForce);
      this.rapierVehicle.setWheelFrictionSlip(i, config.tireFrictionSlip);
      this.rapierVehicle.setWheelSideFrictionStiffness(i, config.sideFrictionStiffness);
    }

    this.drivetrain = {
      gear: 'N',
      rpm: config.idleRpm,
      engineRunning: true,
      stalled: false,
      clutchEngagement: 0,
    };
  }

  requestGear(gear: Gear3D): { accepted: boolean; reason?: string } {
    if (gear === this.drivetrain.gear) return { accepted: true };
    if (gear !== 'N' && this.clutchSmoothed < 0.5) {
      return {
        accepted: false,
        reason: 'Uzatmani almashtirish uchun Ilashish (Shift) pedalini bosing!',
      };
    }
    this.drivetrain.gear = gear;
    return { accepted: true };
  }

  toggleIgnition(): void {
    if (this.drivetrain.engineRunning && !this.drivetrain.stalled) {
      this.drivetrain.engineRunning = false;
      this.drivetrain.rpm = 0;
    } else {
      this.drivetrain.engineRunning = true;
      this.drivetrain.stalled = false;
      this.drivetrain.rpm = this.config.idleRpm;
    }
  }

  toggleHandbrake(): void {
    this.handbrake = !this.handbrake;
  }

  setHandbrake(val: boolean): void {
    this.handbrake = val;
  }

  toggleLeftIndicator(): void {
    this.leftIndicator = !this.leftIndicator;
    if (this.leftIndicator) this.rightIndicator = false;
  }

  toggleRightIndicator(): void {
    this.rightIndicator = !this.rightIndicator;
    if (this.rightIndicator) this.leftIndicator = false;
  }

  toggleHazardLights(): void {
    this.hazardLights = !this.hazardLights;
  }

  toggleHeadlights(): void {
    this.headlights = !this.headlights;
  }

  reset(pose: { position: [number, number, number]; yawDeg: number }): void {
    const halfYaw = ((pose.yawDeg * Math.PI) / 180) / 2;
    this.chassisBody.setTranslation(
      { x: pose.position[0], y: pose.position[1] + 0.4, z: pose.position[2] },
      true
    );
    this.chassisBody.setRotation(
      { x: 0, y: Math.sin(halfYaw), z: 0, w: Math.cos(halfYaw) },
      true
    );
    this.chassisBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    this.chassisBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
    this.steeringNormalized = 0;
    this.throttleSmoothed = 0;
    this.brakeSmoothed = 0;
    this.handbrake = true;
    this.drivetrain = {
      gear: 'N',
      rpm: this.config.idleRpm,
      engineRunning: true,
      stalled: false,
      clutchEngagement: 0,
    };
  }

  step(
    input: { throttle: number; brake: number; steerLeft: boolean; steerRight: boolean; clutch: number },
    dt: number
  ): { justStalled: boolean } {
    // Smooth pedal inputs for natural feel
    this.throttleSmoothed += (input.throttle - this.throttleSmoothed) * Math.min(1, dt * 10);
    this.brakeSmoothed += (input.brake - this.brakeSmoothed) * Math.min(1, dt * 14);
    this.clutchSmoothed += (input.clutch - this.clutchSmoothed) * Math.min(1, dt * 12);

    // Steering response + automatic return to center
    const targetSteerDir = (input.steerLeft ? 1 : 0) - (input.steerRight ? 1 : 0);
    if (targetSteerDir !== 0) {
      this.steeringNormalized +=
        targetSteerDir * this.config.steerResponseRate * dt;
      this.steeringNormalized = Math.max(-1, Math.min(1, this.steeringNormalized));
    } else {
      const returnDelta = this.config.steerReturnRate * dt;
      if (Math.abs(this.steeringNormalized) <= returnDelta) {
        this.steeringNormalized = 0;
      } else {
        this.steeringNormalized -= Math.sign(this.steeringNormalized) * returnDelta;
      }
    }

    // Exact signed forward speed along vehicle's local -Z forward vector
    const signedSpeedMps = this.getSignedForwardSpeedMps();
    const speedKmh = Math.abs(signedSpeedMps) * 3.6;

    // Speed-sensitive maximum steering angle
    const speedRatio = Math.min(1, speedKmh / 65);
    const maxAngleDeg =
      this.config.maxSteerAngleDeg +
      (this.config.highSpeedSteerAngleDeg - this.config.maxSteerAngleDeg) * speedRatio;
    const steerAngleRad = (this.steeringNormalized * maxAngleDeg * Math.PI) / 180;

    // Front wheels steer (0, 1); rear wheels do not (2, 3)
    this.rapierVehicle.setWheelSteering(0, steerAngleRad);
    this.rapierVehicle.setWheelSteering(1, steerAngleRad);

    // Drivetrain / Transmission
    const dtOut = stepDrivetrain({
      state: this.drivetrain,
      throttle: this.throttleSmoothed,
      clutchPedal: this.clutchSmoothed,
      signedForwardSpeedMps: signedSpeedMps,
      config: this.config,
      dt,
    });

    this.drivetrain.rpm = dtOut.nextRpm;
    if (dtOut.justStalled) {
      this.drivetrain.stalled = true;
      this.drivetrain.engineRunning = false;
    }

    // Apply FWD force equally to front wheels (0 & 1)
    const frontWheelForce = dtOut.driveForceN * 0.5;
    this.rapierVehicle.setWheelEngineForce(0, frontWheelForce);
    this.rapierVehicle.setWheelEngineForce(1, frontWheelForce);
    this.rapierVehicle.setWheelEngineForce(2, 0);
    this.rapierVehicle.setWheelEngineForce(3, 0);

    // Apply rolling resistance + aerodynamic drag directly on chassis along velocity
    const lv = this.chassisBody.linvel();
    const speedMag = Math.hypot(lv.x, lv.y, lv.z);
    if (speedMag > 0.05) {
      const aeroDrag = 0.5 * 1.225 * this.config.aerodynamicDragArea * speedMag * speedMag;
      const rollingDrag = this.config.rollingResistanceCoeff * this.config.massKg * 9.81;
      const totalDrag = aeroDrag + rollingDrag + dtOut.engineBrakeForceN;
      const factor = (-totalDrag * dt) / (this.config.massKg * speedMag);
      this.chassisBody.applyImpulse(
        { x: lv.x * factor * this.config.massKg, y: 0, z: lv.z * factor * this.config.massKg },
        true
      );
    }

    // Apply service brake (all 4 wheels) & handbrake (rear wheels 2 & 3)
    const frontBrake = this.brakeSmoothed * this.config.maxBrakeForceN;
    const rearBrake =
      this.brakeSmoothed * this.config.maxBrakeForceN * 0.75 +
      (this.handbrake ? this.config.handbrakeForceN : 0);

    this.rapierVehicle.setWheelBrake(0, frontBrake);
    this.rapierVehicle.setWheelBrake(1, frontBrake);
    this.rapierVehicle.setWheelBrake(2, rearBrake);
    this.rapierVehicle.setWheelBrake(3, rearBrake);

    this.rapierVehicle.updateVehicle(dt);

    return { justStalled: dtOut.justStalled };
  }

  getWheelPoses(): WheelPose[] {
    const poses: WheelPose[] = [];
    for (let i = 0; i < 4; i++) {
      const suspLen =
        this.rapierVehicle.wheelSuspensionLength(i) ?? this.config.suspensionRestLengthMeters;
      const hp = this.rapierVehicle.wheelChassisConnectionPointCs(i);
      const steer = this.rapierVehicle.wheelSteering(i) ?? 0;
      const rot = this.rapierVehicle.wheelRotation(i) ?? 0;
      const contact = this.rapierVehicle.wheelIsInContact(i);

      poses.push({
        position: [hp?.x ?? 0, (hp?.y ?? -0.22) - suspLen, hp?.z ?? 0],
        steerAngleRad: steer,
        spinAngleRad: rot,
        suspensionLength: suspLen,
        inContact: contact,
      });
    }
    return poses;
  }

  private getSignedForwardSpeedMps(): number {
    const lv = this.chassisBody.linvel();
    const q = this.chassisBody.rotation();
    const fx = -2 * (q.x * q.z + q.w * q.y);
    const fy = -2 * (q.y * q.z - q.w * q.x);
    const fz = -(1 - 2 * (q.x * q.x + q.y * q.y));
    return lv.x * fx + lv.y * fy + lv.z * fz;
  }

  getTelemetry(): VehicleTelemetry {
    const t = this.chassisBody.translation();
    const r = this.chassisBody.rotation();
    // Extract Y yaw from quaternion
    const yawRad = Math.atan2(2 * (r.w * r.y + r.x * r.z), 1 - 2 * (r.y * r.y + r.z * r.z));
    const signedSpeedMps = this.getSignedForwardSpeedMps();
    const speedKmh = Math.abs(signedSpeedMps) * 3.6;

    const speedRatio = Math.min(1, speedKmh / 65);
    const maxAngleDeg =
      this.config.maxSteerAngleDeg +
      (this.config.highSpeedSteerAngleDeg - this.config.maxSteerAngleDeg) * speedRatio;

    return {
      speedKmh,
      signedSpeedMps,
      rpm: this.drivetrain.rpm,
      gear: this.drivetrain.gear,
      throttle: this.throttleSmoothed,
      brake: this.brakeSmoothed,
      clutch: this.clutchSmoothed,
      handbrake: this.handbrake,
      steeringAngleDeg: this.steeringNormalized * maxAngleDeg,
      steeringInput: this.steeringNormalized,
      engineRunning: this.drivetrain.engineRunning,
      stalled: this.drivetrain.stalled,
      leftIndicator: this.leftIndicator,
      rightIndicator: this.rightIndicator,
      hazardLights: this.hazardLights,
      headlights: this.headlights,
      position: [t.x, t.y, t.z],
      yawRad,
      wheelContacts: [
        this.rapierVehicle.wheelIsInContact(0),
        this.rapierVehicle.wheelIsInContact(1),
        this.rapierVehicle.wheelIsInContact(2),
        this.rapierVehicle.wheelIsInContact(3),
      ],
      wheelSuspensionLengths: [
        this.rapierVehicle.wheelSuspensionLength(0) ?? this.config.suspensionRestLengthMeters,
        this.rapierVehicle.wheelSuspensionLength(1) ?? this.config.suspensionRestLengthMeters,
        this.rapierVehicle.wheelSuspensionLength(2) ?? this.config.suspensionRestLengthMeters,
        this.rapierVehicle.wheelSuspensionLength(3) ?? this.config.suspensionRestLengthMeters,
      ],
    };
  }
}
