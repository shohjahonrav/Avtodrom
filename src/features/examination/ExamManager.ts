import { EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import { B_LANE_CENTER_Z, PED_ZEBRA_CENTER_X } from '@/config/markings';
import { evaluateCheckpointAdvance } from '@/features/examination/CheckpointSystem';
import { getPenaltyForViolation } from '@/features/examination/ExamRules';
import { detectFrameViolationsAndZones } from '@/features/examination/ViolationDetector';
import type { ColliderTag } from '@/physics/CollisionManager';
import type {
  DriveMode3D,
  ExamExerciseId,
  ExamRuleConfig,
  ExamViolationEvent,
  VehiclePhysicsConfig,
  VehicleTelemetry,
  ViolationEventType,
} from '@/types/simulator3d';

export interface ExamDynamicWorldState {
  elapsedSec: number;
  currentExerciseIndex: number;
  completedExerciseIds: ExamExerciseId[];
  violations: ExamViolationEvent[];
  finished: boolean;
  trafficLightPhase: 'red' | 'yellow' | 'green';
  pedestrianCrossingActive: boolean;
  pedestrianProgress: number;
  pedestrianDone: boolean;
  railwayTrainActive: boolean;
  railwayTrainProgress: number;
  railwayDone: boolean;
  emergencyAlertActive: boolean;
  emergencyCleared: boolean;
  stoppedAtCurrentStopLine: boolean;
  parkedInBox: boolean;
  parkedParallel: boolean;
  lastViolationTimes: Map<string, number>;
}

export function createInitialExamDynamicState(): ExamDynamicWorldState {
  return {
    elapsedSec: 0,
    currentExerciseIndex: 0,
    completedExerciseIds: [],
    violations: [],
    finished: false,
    trafficLightPhase: 'red',
    pedestrianCrossingActive: false,
    pedestrianProgress: 0,
    pedestrianDone: false,
    railwayTrainActive: false,
    railwayTrainProgress: -0.5,
    railwayDone: false,
    emergencyAlertActive: false,
    emergencyCleared: false,
    stoppedAtCurrentStopLine: false,
    parkedInBox: false,
    parkedParallel: false,
    lastViolationTimes: new Map(),
  };
}

export class ExamManager {
  state: ExamDynamicWorldState = createInitialExamDynamicState();

  reset(): void {
    this.state = createInitialExamDynamicState();
  }

  private pushViolation(
    type: ViolationEventType,
    exerciseId: ExamExerciseId,
    pos: [number, number, number],
    description: string,
    rules: ExamRuleConfig,
    cooldownKey?: string
  ): void {
    const key = cooldownKey ?? `${type}:${exerciseId}`;
    const last = this.state.lastViolationTimes.get(key) ?? -999;
    if (this.state.elapsedSec - last < 2.5) return;

    this.state.lastViolationTimes.set(key, this.state.elapsedSec);
    this.state.violations = [
      ...this.state.violations,
      {
        id: `${key}-${Math.round(this.state.elapsedSec * 100)}`,
        type,
        timestampSec: Number(this.state.elapsedSec.toFixed(2)),
        position: [...pos] as [number, number, number],
        exerciseId,
        penalty: getPenaltyForViolation(type, rules),
        description,
      },
    ];
  }

  step(params: {
    dt: number;
    mode: DriveMode3D;
    telemetry: VehicleTelemetry;
    vehicleConfig: VehiclePhysicsConfig;
    rapierContacts: ColliderTag[];
    rules: ExamRuleConfig;
    justStalled: boolean;
  }): void {
    const { dt, mode, telemetry, vehicleConfig, rapierContacts, rules, justStalled } = params;
    this.state.elapsedSec += dt;

    // 1. Cycle dynamic traffic light (always active visually)
    const tlCycle = this.state.elapsedSec % 14;
    if (tlCycle < 6) this.state.trafficLightPhase = 'red';
    else if (tlCycle < 8) this.state.trafficLightPhase = 'yellow';
    else this.state.trafficLightPhase = 'green';

    // 2. Pedestrian crossing trigger near M2 South Zebra
    const distToPed = Math.hypot(
      telemetry.position[0] - PED_ZEBRA_CENTER_X,
      telemetry.position[2] - B_LANE_CENTER_Z
    );
    if (!this.state.pedestrianDone && !this.state.pedestrianCrossingActive && distToPed < 7.5) {
      this.state.pedestrianCrossingActive = true;
    }
    if (this.state.pedestrianCrossingActive) {
      this.state.pedestrianProgress += dt * 0.24;
      if (this.state.pedestrianProgress >= 1) {
        this.state.pedestrianProgress = 1;
        this.state.pedestrianCrossingActive = false;
        this.state.pedestrianDone = true;
      }
    }

    // 3. Railway train trigger near M8 Eastern Railway (uv: 0.968, 0.222)
    const m8World = uvToWorld({ u: 0.968, v: 0.222 }, MAP_DIMENSIONS);
    const distToRail = Math.hypot(
      telemetry.position[0] - m8World.x,
      telemetry.position[2] - m8World.z
    );
    if (!this.state.railwayDone && !this.state.railwayTrainActive && distToRail < 8.5) {
      this.state.railwayTrainActive = true;
    }
    if (this.state.railwayTrainActive) {
      this.state.railwayTrainProgress += dt * 0.25;
      if (this.state.railwayTrainProgress >= 1.5) {
        this.state.railwayTrainActive = false;
        this.state.railwayDone = true;
      }
    }

    if (mode !== 'exam' || this.state.finished) return;

    const activeSpec = EXAM_EXERCISES_ORDER[this.state.currentExerciseIndex];
    if (!activeSpec) return;

    const frameCheck = detectFrameViolationsAndZones({
      vehiclePos: telemetry.position,
      yawRad: telemetry.yawRad,
      vehicleConfig,
      rapierContacts,
      activeExerciseId: activeSpec.id,
    });

    // Violations from physics & full-footprint checks
    if (frameCheck.boundaryCrossingIds.length > 0) {
      this.pushViolation(
        'BOUNDARY_CROSSING',
        activeSpec.id,
        telemetry.position,
        '1.1 chegara chizig‘i bosildi yoki kesib o‘tildi.',
        rules
      );
    }

    if (frameCheck.collidedConeIds.length > 0) {
      this.pushViolation(
        'CONE_COLLISION',
        activeSpec.id,
        telemetry.position,
        'Konusga urilish qayd etildi.',
        rules
      );
    }

    if (frameCheck.collidedWallIds.length > 0) {
      this.pushViolation(
        'WALL_COLLISION',
        activeSpec.id,
        telemetry.position,
        'To‘siq, panjara yoki turgan avtomobilga urilish qayd etildi.',
        rules
      );
    }

    if (justStalled) {
      this.pushViolation(
        'ENGINE_STALL',
        activeSpec.id,
        telemetry.position,
        'Dvigatel o‘chib qoldi (ilashish/uzatma xatosi).',
        rules
      );
    }

    // Speed limit check (3.243 = 20 km/h)
    const speedZone = frameCheck.activeZones.find((z) => z.kind === 'speed_limit');
    const maxSpeed = speedZone?.maxSpeedKmh ?? activeSpec.speedLimitKmh;
    if (maxSpeed && telemetry.speedKmh > maxSpeed + 1.0) {
      this.pushViolation(
        'SPEED_LIMIT',
        activeSpec.id,
        telemetry.position,
        `Tezlik cheklovi (${maxSpeed} km/soat) oshirildi (${telemetry.speedKmh.toFixed(1)} km/soat).`,
        rules
      );
    }

    // Stop lines & special zones
    const inStopZone = frameCheck.activeZones.some(
      (z) => z.kind === 'stop_line' && z.exerciseId === activeSpec.id
    );
    if (inStopZone && telemetry.speedKmh < 0.8) {
      this.state.stoppedAtCurrentStopLine = true;
    }

    if (
      activeSpec.id === 'pedestrian-crossing' &&
      this.state.pedestrianCrossingActive &&
      frameCheck.activeZones.some((z) => z.kind === 'pedestrian_zebra')
    ) {
      this.pushViolation(
        'PEDESTRIAN_VIOLATION',
        activeSpec.id,
        telemetry.position,
        'Piyodaga yo‘l berilmadi — piyoda o‘tayotganda zebra ustiga chiqildi!',
        rules
      );
    }

    if (
      activeSpec.id === 'regulated-intersection' &&
      frameCheck.activeZones.some((z) => z.kind === 'intersection') &&
      this.state.trafficLightPhase === 'red'
    ) {
      this.pushViolation(
        'RED_LIGHT',
        activeSpec.id,
        telemetry.position,
        'Svetoforning qizil chirog‘ida chorrahaga kirildi!',
        rules
      );
    }

    if (
      activeSpec.id === 'railway-crossing' &&
      frameCheck.activeZones.some((z) => z.kind === 'railway_tracks') &&
      (this.state.railwayTrainActive || telemetry.speedKmh < 0.5)
    ) {
      this.pushViolation(
        'RAILWAY_VIOLATION',
        activeSpec.id,
        telemetry.position,
        this.state.railwayTrainActive
          ? 'Poyezd o‘tayotganda temir yo‘l kesishmasiga kirildi!'
          : 'Temir yo‘l izlari ustida to‘xtab qolindi!',
        rules
      );
    }

    if (frameCheck.fullyInsideReverseBox && telemetry.speedKmh < 0.8) {
      this.state.parkedInBox = true;
    }
    if (frameCheck.fullyInsideParkingBay && telemetry.speedKmh < 0.8) {
      this.state.parkedParallel = true;
    }

    // Emergency Stop trigger
    if (
      activeSpec.id === 'emergency-stop' &&
      !this.state.emergencyCleared &&
      frameCheck.activeZones.some((z) => z.kind === 'emergency_zone')
    ) {
      this.state.emergencyAlertActive = true;
      if (telemetry.speedKmh < 0.8 && telemetry.hazardLights) {
        this.state.emergencyAlertActive = false;
        this.state.emergencyCleared = true;
      }
    }

    // Exercise completion extra condition
    let extraOk = true;
    if (activeSpec.id === 'finish') {
      extraOk =
        telemetry.speedKmh < 0.6 &&
        telemetry.gear === 'N' &&
        telemetry.handbrake &&
        !telemetry.engineRunning;
    }

    const cp = evaluateCheckpointAdvance(
      telemetry.position,
      this.state.currentExerciseIndex,
      this.state.completedExerciseIds,
      extraOk
    );

    if (cp.skippedAheadId) {
      this.pushViolation(
        'WRONG_ORDER',
        activeSpec.id,
        telemetry.position,
        `Mashqlar ketma-ketligi buzildi (avval ${activeSpec.title} bajarilishi kerak).`,
        rules
      );
    }

    if (cp.justCompletedId) {
      if (
        (cp.justCompletedId === 'estakada' ||
          cp.justCompletedId === 'regulated-intersection' ||
          cp.justCompletedId === 'railway-crossing') &&
        !this.state.stoppedAtCurrentStopLine
      ) {
        this.pushViolation(
          'STOP_LINE_MISSED',
          cp.justCompletedId,
          telemetry.position,
          '1.12 to‘xtash chizig‘i oldida majburiy to‘xtash bajarilmadi.',
          rules
        );
      }
      if (cp.justCompletedId === 'reverse-box' && !this.state.parkedInBox) {
        this.pushViolation(
          'PARKING_INVALID',
          cp.justCompletedId,
          telemetry.position,
          'Boks ichiga to‘liq joylashmasdan chiqib ketildi.',
          rules
        );
      }
      if (cp.justCompletedId === 'parallel-parking' && !this.state.parkedParallel) {
        this.pushViolation(
          'PARKING_INVALID',
          cp.justCompletedId,
          telemetry.position,
          'Parallel parkovka joyiga to‘liq joylashilmadi.',
          rules
        );
      }
      if (cp.justCompletedId === 'emergency-stop' && !this.state.emergencyCleared) {
        this.pushViolation(
          'EMERGENCY_MISSED',
          cp.justCompletedId,
          telemetry.position,
          'Avariya to‘xtash signalida to‘liq to‘xtash va avariya chiroqlari bajarilmadi.',
          rules
        );
      }

      this.state.stoppedAtCurrentStopLine = false;
      this.state.currentExerciseIndex = cp.nextIndex;
      this.state.completedExerciseIds = cp.nextCompletedIds;
      this.state.finished = cp.finished;
    }
  }
}
