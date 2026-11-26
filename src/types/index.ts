export type VehicleCategory = 'B' | 'A' | 'A1' | 'C' | 'D' | 'BE' | 'CE' | 'DE';

export type TransmissionType = 'manual' | 'automatic';

export type SimulationMode = 'learn' | 'practice' | 'exam';

export type ErrorSeverity = 'warning' | 'serious' | 'safety_critical';

export type ExerciseSlug =
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

export interface MetadataTag {
  source: string;
  verifiedAt: string;
  isOfficial: boolean;
  note?: string;
}

export interface Point2D {
  x: number; // meters
  y: number; // meters
}

export interface LineSegment2D {
  id: string;
  start: Point2D;
  end: Point2D;
  markingCode: '1.1' | '1.4' | '1.5' | '1.12' | 'dashed-yellow' | 'curb' | 'barrier';
  widthMeters: number;
  label?: string;
  isSensorBoundary?: boolean;
}

export interface ConeObstacle {
  id: string;
  position: Point2D;
  radiusMeters: number;
  heightMeters?: number;
}

export interface BarrierObstacle {
  id: string;
  points: Point2D[];
  thicknessMeters: number;
  kind: 'estakada_guard' | 'parked_car' | 'box_wall' | 'curb_wall' | 'rail_barrier';
  label?: string;
}

export interface SensorZone {
  id: string;
  kind:
    | 'start_line'
    | 'stop_line'
    | 'finish_line'
    | 'exercise_entry'
    | 'exercise_exit'
    | 'pedestrian_zone'
    | 'estakada_climb'
    | 'estakada_stop_box'
    | 'estakada_descent'
    | 'intersection_box'
    | 'parking_bay'
    | 'reverse_box_bay'
    | 'railway_tracks'
    | 'speed_limit_zone'
    | 'emergency_trigger_zone';
  polygon: Point2D[];
  headingRad?: number;
  targetSpeedMaxKmh?: number;
  targetSpeedMinKmh?: number;
  label?: string;
}

export interface RoadSignPlacement {
  id: string;
  signCode: string;
  position: Point2D;
  rotationDeg?: number;
  label: string;
}

export interface PedestrianScenario {
  id: string;
  crosswalkStart: Point2D;
  crosswalkEnd: Point2D;
  triggerDistanceMeters: number;
  walkSpeedMps: number;
  waitDurationSec: number;
}

export interface TrafficLightConfig {
  id: string;
  position: Point2D;
  hasDirectionArrow: boolean;
  greenDurationSec: number;
  yellowDurationSec: number;
  redDurationSec: number;
  initialPhase: 'red' | 'yellow' | 'green';
}

export interface RailwayConfig {
  id: string;
  trackCenter: Point2D;
  trackAngleDeg: number;
  hasBarrier: boolean;
  trainTriggerSec: number;
  trainPassDurationSec: number;
}

export interface EstakadaConfig {
  slopePercent: number; // official 10 to 16%
  slopeMetadata: MetadataTag;
  climbStart: Point2D;
  climbEnd: Point2D;
  topPlateauEnd: Point2D;
  descentEnd: Point2D;
  stopLineOffsetFromTopEndMeters: number; // official 1.0 m
  stopLineWidthMeters: number; // official 0.4 m
  guardHeightMeters: number; // official 0.3 or 0.5 m
  guardThicknessMeters: number; // official >= 0.3 m
  maxAllowedRollbackMeters: number; // custom training setting
  rollbackMetadata: MetadataTag;
}

export interface ExerciseGeometry {
  bounds: { minX: number; minY: number; maxX: number; maxY: number }; // meters
  startPose: { x: number; y: number; headingDeg: number };
  directionArrows: { x: number; y: number; headingDeg: number }[];
  lines: LineSegment2D[];
  cones: ConeObstacle[];
  barriers: BarrierObstacle[];
  zones: SensorZone[];
  signs: RoadSignPlacement[];
  zebraCrossings?: {
    center: Point2D;
    widthMeters: number;
    lengthMeters: number;
    angleDeg: number;
  }[];
  pedestrianScenario?: PedestrianScenario;
  trafficLight?: TrafficLightConfig;
  railway?: RailwayConfig;
  estakada?: EstakadaConfig;
  geometryMetadata: MetadataTag;
}

export interface ExerciseStepInstruction {
  order: number;
  title: string;
  description: string;
}

export interface ExerciseConfig {
  id: string;
  order: number;
  slug: ExerciseSlug;
  category: VehicleCategory[];
  title: string;
  shortTitle: string;
  purpose: string;
  description: string;
  steps: ExerciseStepInstruction[];
  tips: string[];
  commonMistakes: string[];
  trackedEvents: string[];
  requiredPrepChecklist?: boolean;
  requiresFinishShutdown?: boolean;
  maxReverseMoves?: number; // e.g., for reverse-box (custom setting)
  maxReverseMovesMetadata?: MetadataTag;
  speedLimitKmh?: number;
  speedLimitMetadata?: MetadataTag;
  geometry: ExerciseGeometry;
  worldOffset: Point2D; // Placement in full 50x15+m autodrome
  orderMetadata: MetadataTag;
}

export interface VehicleDimensions {
  lengthMeters: number;
  widthMeters: number;
  wheelbaseMeters: number;
  frontOverhangMeters: number;
  rearOverhangMeters: number;
  maxSteeringAngleDeg: number;
  metadata: MetadataTag;
}

export type GearPosition = 'R' | 'N' | '1' | '2' | '3' | '4' | '5';

export interface VehicleControlsState {
  steeringInput: number; // -1 (left) to +1 (right)
  throttle: number; // 0 to 1
  brake: number; // 0 to 1
  clutch: number; // 0 (released) to 1 (fully pressed)
  gear: GearPosition;
  handbrake: boolean;
  leftIndicator: boolean;
  rightIndicator: boolean;
  headlights: boolean;
  hazardLights: boolean;
  seatbelt: boolean;
  mirrorsChecked: boolean;
  seatAdjusted: boolean;
  doorsClosed: boolean;
  engineRunning: boolean;
}

export interface VehiclePhysicsState {
  x: number; // meters
  y: number; // meters
  headingRad: number; // 0 = +X (east), +PI/2 = +Y (south in SVG coords)
  speedMps: number; // signed: positive forward, negative reverse
  steeringAngleRad: number;
  rpm: number;
  stalled: boolean;
  onSlopeGrade: number; // 0..0.16
  rollbackDistanceMeters: number;
  maxRollbackObservedMeters: number;
}

export interface SimulationEvent {
  id: string;
  timestampSec: number;
  exerciseSlug: ExerciseSlug;
  exerciseTitle: string;
  code: string;
  message: string;
  severity: ErrorSeverity;
  position: Point2D;
  pointsDeducted?: number; // only populated when custom scoring enabled
}

export interface ExerciseDynamicState {
  status: 'idle' | 'in_progress' | 'completed' | 'failed';
  startedAtSec: number | null;
  completedAtSec: number | null;
  crossedStart: boolean;
  stoppedAtStopLine: boolean;
  stopHoldDurationSec: number;
  reverseMoveCount: number;
  pedestrianPositionProgress: number; // 0..1 across crosswalk
  pedestrianActive: boolean;
  pedestrianCleared: boolean;
  trafficLightPhase: 'red' | 'yellow' | 'green';
  trafficLightArrowGreen: boolean;
  trafficLightTimerSec: number;
  railwayTrainActive: boolean;
  railwayTrainProgress: number; // -1..2
  railwayBarrierClosed: boolean;
  railwayTimerSec: number;
  emergencySignalTriggered: boolean;
  emergencyReactionTimerSec: number;
  emergencyStoppedSafely: boolean;
  estakadaStopCompleted: boolean;
  estakadaPeakYOrX: number | null;
  lastMovementDirection: 'forward' | 'reverse' | 'stopped';
  checklistConfirmed: boolean;
  finishShutdownConfirmed: boolean;
}

export interface SimulationSnapshot {
  mode: SimulationMode;
  category: VehicleCategory;
  transmission: TransmissionType;
  elapsedSec: number;
  currentExerciseSlug: ExerciseSlug;
  currentExerciseIndex: number;
  vehicle: VehiclePhysicsState;
  controls: VehicleControlsState;
  exerciseState: ExerciseDynamicState;
  events: SimulationEvent[];
  completedExercises: ExerciseSlug[];
  activeCollisionIds: string[];
  activeLineViolationIds: string[];
  sessionStatus: 'ready' | 'running' | 'paused' | 'completed' | 'aborted';
}

export interface RoadMarkingCatalogItem {
  code: string;
  name: string;
  group: 'autodrome_3494' | 'yhq_general';
  color: 'white' | 'yellow' | 'white-yellow' | 'white-red';
  patternType:
    | 'solid'
    | 'dashed'
    | 'double-solid'
    | 'approach-dashed'
    | 'short-dashed'
    | 'wide-dashed'
    | 'combined-solid-dashed'
    | 'stop-line'
    | 'zebra'
    | 'island'
    | 'arrows'
    | 'yield-warning-triangle'
    | 'start-finish-line';
  description: string;
  autodromeUsage: string;
  driverMeaning: string;
  usedInExercises: ExerciseSlug[];
  widthNote?: string;
  metadata: MetadataTag;
}

export interface RoadSignCatalogItem {
  code: string;
  name: string;
  category: 'warning' | 'prohibitory' | 'information' | 'additional';
  meaning: string;
  driverAction: string;
  usedInExercises: ExerciseSlug[];
  placementNote?: string;
  metadata: MetadataTag;
}

export interface AttemptRecord {
  id: string;
  timestampIso: string;
  mode: SimulationMode;
  category: VehicleCategory;
  transmission: TransmissionType;
  exerciseSlug: ExerciseSlug | 'full-exam';
  outcome: 'success' | 'completed_with_errors' | 'incomplete';
  durationSec: number;
  events: SimulationEvent[];
  customScore?: number;
  customPassed?: boolean;
}

export interface AdminScoringConfig {
  enableCustomScoring: boolean; // false by default to avoid inventing official rules
  startingScore: number;
  passThresholdScore: number;
  warningPenalty: number;
  seriousPenalty: number;
  failOnSafetyCritical: boolean;
  customTimeLimitSec: number | null;
  maxAllowedStalls: number | null;
  maxReverseMovesInBox: number;
  estakadaRollbackLimitCm: number;
  estakadaSlopePercent: number;
  speedLimitAutodromeKmh: number;
  difficulty: 'training' | 'standard' | 'strict';
  vehiclePreset: 'standard_sedan_b';
  vehicleDimensions: VehicleDimensions;
  metadata: MetadataTag;
}
