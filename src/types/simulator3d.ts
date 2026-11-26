import type { MetadataTag } from './index';

export type CameraMode3D = 'chase' | 'driver' | 'topdown' | 'free';

export type DriveMode3D = 'free_drive' | 'exam';

export type Gear3D = 'R' | 'N' | '1' | '2' | '3' | '4' | '5';

export type ExamExerciseId =
  | 'start'
  | 'pedestrian-crossing'
  | 'estakada'
  | 'turn-90'
  | 'reverse-box'
  | 'regulated-intersection'
  | 'slalom'
  | 'parallel-parking'
  | 'railway-crossing'
  | 'acceleration-lane'
  | 'emergency-stop'
  | 'finish';

export interface VehiclePhysicsConfig {
  modelPath: string;
  modelScale: number;
  // Physical dimensions in meters (calibrated for Chevrolet Cobalt LTZ 2014 FWD)
  massKg: number;
  chassisLengthMeters: number;
  chassisWidthMeters: number;
  chassisHeightMeters: number;
  centerOfMassOffset: [number, number, number];
  wheelbaseMeters: number;
  frontTrackMeters: number;
  rearTrackMeters: number;
  wheelRadiusMeters: number;
  wheelWidthMeters: number;
  wheelMassKg: number;
  // Suspension
  suspensionRestLengthMeters: number;
  suspensionMaxTravelMeters: number;
  suspensionStiffness: number;
  suspensionCompression: number;
  suspensionRelaxation: number;
  maxSuspensionForce: number;
  // Steering
  maxSteerAngleDeg: number;
  highSpeedSteerAngleDeg: number;
  steerResponseRate: number;
  steerReturnRate: number;
  // Drivetrain & Engine
  idleRpm: number;
  maxRpm: number;
  stallRpm: number;
  peakTorqueNm: number;
  engineBrakingNm: number;
  finalDriveRatio: number;
  gearRatios: Record<Gear3D, number>;
  // Braking & Tires
  maxBrakeForceN: number;
  handbrakeForceN: number;
  tireFrictionSlip: number;
  sideFrictionStiffness: number;
  rollingResistanceCoeff: number;
  aerodynamicDragArea: number;
  // Calibration metadata
  metadata: MetadataTag;
}

export interface AutodromeRoadSegment {
  id: string;
  center: [number, number, number]; // meters
  size: [number, number]; // width (X or local), length (Z or local)
  rotationYDeg?: number;
  slopeRad?: number; // pitch for estakada ramps
  color?: string;
  hasCollider?: boolean;
}

export interface AutodromeMarking {
  id: string;
  kind: 'solid_1_1' | 'dashed_1_5' | 'stop_1_12' | 'start_line' | 'finish_line' | 'zebra' | 'arrow' | 'dashed_yellow';
  start: [number, number, number];
  end: [number, number, number];
  widthMeters: number;
  label?: string;
}

export interface AutodromeWall {
  id: string;
  center: [number, number, number];
  size: [number, number, number]; // [width, height, length]
  rotationYDeg?: number;
  kind: 'fence' | 'estakada_guard' | 'box_wall' | 'parked_car' | 'curb';
  color?: string;
}

export interface AutodromeCone {
  id: string;
  position: [number, number, number];
  radiusMeters: number;
  heightMeters: number;
}

export interface AutodromeSign3D {
  id: string;
  code: string;
  label: string;
  position: [number, number, number];
  rotationYDeg: number;
}

export interface BoundarySegment2D {
  id: string;
  exerciseId: ExamExerciseId;
  a: [number, number]; // [x, z]
  b: [number, number]; // [x, z]
  halfWidthMeters: number;
}

export interface ExamZonePolygon {
  id: string;
  exerciseId: ExamExerciseId;
  kind:
    | 'checkpoint'
    | 'stop_line'
    | 'parking_bay'
    | 'reverse_box'
    | 'pedestrian_zebra'
    | 'intersection'
    | 'railway_tracks'
    | 'speed_limit'
    | 'emergency_zone'
    | 'finish_box';
  center: [number, number]; // [x, z]
  size: [number, number]; // [width, length]
  rotationYDeg: number;
  maxSpeedKmh?: number;
  requiresFullStop?: boolean;
  requiresFullFit?: boolean;
}

export interface ExamExerciseSpec {
  id: ExamExerciseId;
  order: number;
  title: string;
  objective: string;
  checkpointCenter: [number, number, number];
  checkpointRadiusMeters: number;
  spawnPose: {
    position: [number, number, number];
    yawDeg: number;
  };
  speedLimitKmh?: number;
  metadata: MetadataTag;
}

export interface ExamRuleConfig {
  enablePointsScoring: boolean;
  initialPoints: number;
  passThresholdPoints: number;
  boundaryCrossPenalty: number;
  coneCollisionPenalty: number;
  wallCollisionPenalty: number;
  stopLineFailPenalty: number;
  redLightPenalty: number;
  pedestrianFailPenalty: number;
  speedViolationPenalty: number;
  wrongOrderPenalty: number;
  parkingFailPenalty: number;
  stallPenalty: number;
  timeLimitSeconds: number | null;
  metadata: MetadataTag;
}

export type ViolationEventType =
  | 'BOUNDARY_CROSSING'
  | 'CONE_COLLISION'
  | 'WALL_COLLISION'
  | 'PROHIBITED_ZONE'
  | 'PARKING_INVALID'
  | 'STOP_LINE_MISSED'
  | 'CHECKPOINT_SKIPPED'
  | 'WRONG_ORDER'
  | 'RED_LIGHT'
  | 'PEDESTRIAN_VIOLATION'
  | 'RAILWAY_VIOLATION'
  | 'SPEED_LIMIT'
  | 'ENGINE_STALL'
  | 'EMERGENCY_MISSED';

export interface ExamViolationEvent {
  id: string;
  type: ViolationEventType;
  timestampSec: number;
  position: [number, number, number];
  exerciseId: ExamExerciseId;
  penalty: number;
  description: string;
}

export interface VehicleTelemetry {
  speedKmh: number;
  signedSpeedMps: number;
  rpm: number;
  gear: Gear3D;
  throttle: number;
  brake: number;
  clutch: number;
  handbrake: boolean;
  steeringAngleDeg: number;
  steeringInput: number;
  engineRunning: boolean;
  stalled: boolean;
  leftIndicator: boolean;
  rightIndicator: boolean;
  hazardLights: boolean;
  headlights: boolean;
  position: [number, number, number];
  yawRad: number;
  wheelContacts: [boolean, boolean, boolean, boolean];
  wheelSuspensionLengths: [number, number, number, number];
}
