import { detectCollisionsAndZones, type CollisionReport } from '@/features/simulation/collision/collisionDetector';
import { stepVehiclePhysics } from '@/features/simulation/engine/vehiclePhysics';
import {
  createSimulationEvent,
  shouldLogEventWithCooldown,
} from '@/features/simulation/scoring/ruleEvaluator';
import { degToRad } from '@/lib/utils/geometry';
import type {
  AdminScoringConfig,
  ExerciseConfig,
  ExerciseDynamicState,
  Point2D,
  SimulationEvent,
  SimulationSnapshot,
} from '@/types';

export function createInitialExerciseDynamicState(exercise: ExerciseConfig): ExerciseDynamicState {
  const tl = exercise.geometry.trafficLight;
  return {
    status: 'in_progress',
    startedAtSec: 0,
    completedAtSec: null,
    crossedStart: false,
    stoppedAtStopLine: false,
    stopHoldDurationSec: 0,
    reverseMoveCount: 0,
    pedestrianPositionProgress: 0,
    pedestrianActive: false,
    pedestrianCleared: false,
    trafficLightPhase: tl?.initialPhase ?? 'green',
    trafficLightArrowGreen: tl?.initialPhase === 'green',
    trafficLightTimerSec: 0,
    railwayTrainActive: false,
    railwayTrainProgress: -0.6,
    railwayBarrierClosed: false,
    railwayTimerSec: 0,
    emergencySignalTriggered: false,
    emergencyReactionTimerSec: 0,
    emergencyStoppedSafely: false,
    estakadaStopCompleted: false,
    estakadaPeakYOrX: null,
    lastMovementDirection: 'stopped',
    checklistConfirmed: !exercise.requiredPrepChecklist,
    finishShutdownConfirmed: false,
  };
}

export function getPedestrianWorldPosition(
  exercise: ExerciseConfig,
  state: ExerciseDynamicState,
  useWorldCoords = false
): Point2D | null {
  const scenario = exercise.geometry.pedestrianScenario;
  if (!scenario || !state.pedestrianActive) return null;
  const offset = useWorldCoords ? exercise.worldOffset : { x: 0, y: 0 };
  const t = Math.max(0, Math.min(1, state.pedestrianPositionProgress));
  return {
    x: offset.x + scenario.crosswalkStart.x + (scenario.crosswalkEnd.x - scenario.crosswalkStart.x) * t,
    y: offset.y + scenario.crosswalkStart.y + (scenario.crosswalkEnd.y - scenario.crosswalkStart.y) * t,
  };
}

export interface StepOutput {
  snapshot: SimulationSnapshot;
  collisionReport: CollisionReport;
  exerciseJustCompleted: boolean;
}

export function stepSimulation(
  snapshot: SimulationSnapshot,
  exercise: ExerciseConfig,
  adminConfig: AdminScoringConfig,
  dt: number,
  useWorldCoords = false
): StepOutput {
  if (snapshot.sessionStatus !== 'running') {
    const pedPos = getPedestrianWorldPosition(exercise, snapshot.exerciseState, useWorldCoords);
    const collisionReport = detectCollisionsAndZones(
      snapshot.vehicle,
      adminConfig.vehicleDimensions,
      exercise,
      pedPos,
      useWorldCoords
    );
    return { snapshot, collisionReport, exerciseJustCompleted: false };
  }

  const nextElapsed = snapshot.elapsedSec + dt;
  const exState: ExerciseDynamicState = { ...snapshot.exerciseState };
  const events: SimulationEvent[] = [...snapshot.events];
  const offset = useWorldCoords ? exercise.worldOffset : { x: 0, y: 0 };

  const pushEvent = (
    code: string,
    message: string,
    severity: SimulationEvent['severity'],
    cooldownSec = 2.5
  ) => {
    if (shouldLogEventWithCooldown(events, code, nextElapsed, cooldownSec)) {
      events.push(
        createSimulationEvent({
          timestampSec: nextElapsed,
          exercise,
          code,
          message,
          severity,
          position: { x: snapshot.vehicle.x, y: snapshot.vehicle.y },
          adminConfig,
        })
      );
    }
  };

  // 1. Update dynamic scenarios (pedestrian, traffic light, railway, emergency signal)
  if (exercise.geometry.pedestrianScenario) {
    const scenario = exercise.geometry.pedestrianScenario;
    const zebraCenterX = offset.x + scenario.crosswalkStart.x;
    const distToCrosswalk = zebraCenterX - snapshot.vehicle.x;

    if (!exState.pedestrianActive && !exState.pedestrianCleared && distToCrosswalk <= scenario.triggerDistanceMeters) {
      exState.pedestrianActive = true;
    }
    if (exState.pedestrianActive) {
      const pathLen = Math.hypot(
        scenario.crosswalkEnd.x - scenario.crosswalkStart.x,
        scenario.crosswalkEnd.y - scenario.crosswalkStart.y
      );
      exState.pedestrianPositionProgress += (scenario.walkSpeedMps * dt) / Math.max(1, pathLen);
      if (exState.pedestrianPositionProgress >= 1) {
        exState.pedestrianPositionProgress = 1;
        exState.pedestrianActive = false;
        exState.pedestrianCleared = true;
      }
    }
  }

  if (exercise.geometry.trafficLight) {
    const tl = exercise.geometry.trafficLight;
    exState.trafficLightTimerSec += dt;
    const { redDurationSec, yellowDurationSec, greenDurationSec } = tl;
    const cycle = redDurationSec + yellowDurationSec + greenDurationSec + yellowDurationSec;
    const phaseTime = exState.trafficLightTimerSec % cycle;
    if (phaseTime < redDurationSec) {
      exState.trafficLightPhase = 'red';
      exState.trafficLightArrowGreen = false;
    } else if (phaseTime < redDurationSec + yellowDurationSec) {
      exState.trafficLightPhase = 'yellow';
      exState.trafficLightArrowGreen = false;
    } else if (phaseTime < redDurationSec + yellowDurationSec + greenDurationSec) {
      exState.trafficLightPhase = 'green';
      exState.trafficLightArrowGreen = true;
    } else {
      exState.trafficLightPhase = 'yellow';
      exState.trafficLightArrowGreen = false;
    }
  }

  if (exercise.geometry.railway) {
    const rw = exercise.geometry.railway;
    exState.railwayTimerSec += dt;
    if (exState.railwayTimerSec >= rw.trainTriggerSec && exState.railwayTrainProgress < 1.6) {
      exState.railwayTrainActive = true;
      exState.railwayBarrierClosed = rw.hasBarrier;
      exState.railwayTrainProgress += (dt / rw.trainPassDurationSec) * 2.2;
      if (exState.railwayTrainProgress >= 1.6) {
        exState.railwayTrainActive = false;
        exState.railwayBarrierClosed = false;
      }
    }
  }

  // 2. Determine slope grade if inside estakada zones
  const pedPos = getPedestrianWorldPosition(exercise, exState, useWorldCoords);
  const preCollision = detectCollisionsAndZones(
    snapshot.vehicle,
    adminConfig.vehicleDimensions,
    exercise,
    pedPos,
    useWorldCoords
  );

  let slopeGrade = 0;
  if (exercise.geometry.estakada) {
    const estSlope = adminConfig.estakadaSlopePercent / 100;
    const inClimb = preCollision.insideZones.some((z) => z.kind === 'estakada_climb');
    const inDescent = preCollision.insideZones.some((z) => z.kind === 'estakada_descent');
    if (inClimb) slopeGrade = estSlope;
    else if (inDescent) slopeGrade = -estSlope;
  }

  // 3. Step vehicle physics
  const physicsResult = stepVehiclePhysics(
    snapshot.vehicle,
    snapshot.controls,
    adminConfig.vehicleDimensions,
    snapshot.transmission,
    slopeGrade,
    dt
  );
  const nextVehicle = physicsResult.nextVehicle;
  const nextControls = physicsResult.justStalled
    ? { ...snapshot.controls, engineRunning: false }
    : snapshot.controls;

  if (physicsResult.justStalled && physicsResult.stallReason) {
    pushEvent('ENGINE_STALL', physicsResult.stallReason, 'warning', 1.5);
  }

  // Track movement direction & reverse attempt count (for reverse box / parallel parking)
  if (nextVehicle.speedMps > 0.15) {
    exState.lastMovementDirection = 'forward';
  } else if (nextVehicle.speedMps < -0.15) {
    if (exState.lastMovementDirection !== 'reverse') {
      exState.reverseMoveCount += 1;
    }
    exState.lastMovementDirection = 'reverse';
  }

  // 4. Post-step collision & zone check
  const collisionReport = detectCollisionsAndZones(
    nextVehicle,
    adminConfig.vehicleDimensions,
    exercise,
    pedPos,
    useWorldCoords
  );

  const speedKmh = Math.abs(nextVehicle.speedMps) * 3.6;

  // 5. Evaluate safety & rule violations
  if (!nextControls.seatbelt && Math.abs(nextVehicle.speedMps) > 0.4) {
    pushEvent(
      'NO_SEATBELT',
      'Xavfsizlik kamari taqilmasdan harakat boshlandi.',
      'serious',
      4
    );
  }

  if (collisionReport.violatedLineIds.length > 0) {
    pushEvent(
      'LINE_CROSSING',
      '1.1 chegara chizig‘i bosildi yoki kesib o‘tildi.',
      'serious',
      2.2
    );
  }

  if (collisionReport.collidedConeIds.length > 0) {
    pushEvent(
      'CONE_COLLISION',
      'Konus / ustunga tegish qayd etildi.',
      'serious',
      2.0
    );
  }

  if (collisionReport.collidedBarrierIds.length > 0) {
    pushEvent(
      'BARRIER_COLLISION',
      'To‘siqqa (himoya devori yoki turgan avtomobilga) urilish qayd etildi.',
      'safety_critical',
      2.5
    );
  }

  if (collisionReport.hitPedestrian) {
    pushEvent(
      'PEDESTRIAN_COLLISION',
      'Piyodalar o‘tish joyida piyodaga xavf tug‘dirildi!',
      'safety_critical',
      2.0
    );
  }

  // Speed limit check (3.243 20 km/h zone or configured autodrome limit)
  const speedZone = collisionReport.insideZones.find((z) => z.kind === 'speed_limit_zone');
  const activeSpeedLimit = speedZone?.targetSpeedMaxKmh ?? exercise.speedLimitKmh;
  if (activeSpeedLimit && speedKmh > activeSpeedLimit + 0.8) {
    pushEvent(
      'SPEED_LIMIT_EXCEEDED',
      `Ruxsat etilgan tezlik (${activeSpeedLimit} km/soat) oshirildi (${speedKmh.toFixed(1)} km/soat).`,
      'serious',
      2.5
    );
  }

  // Exercise-specific logic
  let exerciseJustCompleted = false;
  const inExitZone = collisionReport.insideZones.some((z) => z.kind === 'exercise_exit');

  switch (exercise.slug) {
    case 'start': {
      if (collisionReport.insideZones.some((z) => z.kind === 'start_line')) {
        exState.crossedStart = true;
      }
      if (inExitZone && exState.crossedStart) {
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'pedestrian-crossing': {
      const inZebra = collisionReport.insideZones.some((z) => z.kind === 'pedestrian_zone');
      if (inZebra && exState.pedestrianActive) {
        pushEvent(
          'PEDESTRIAN_YIELD_FAIL',
          'Piyoda o‘tish joyida piyodaga yo‘l berilmadi yoki zebra ustiga chiqildi.',
          'safety_critical',
          2.5
        );
      }
      if (inZebra && Math.abs(nextVehicle.speedMps) < 0.08) {
        pushEvent(
          'STOPPED_ON_ZEBRA',
          'Zebra chiziqlari ustida to‘xtab qolindi.',
          'warning',
          3.0
        );
      }
      if (inExitZone) {
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'estakada': {
      const inStopBox = collisionReport.insideZones.some((z) => z.kind === 'estakada_stop_box');
      const crossedStopLine = collisionReport.insideZones.some((z) => z.kind === 'stop_line');
      if (crossedStopLine && !exState.estakadaStopCompleted && nextVehicle.speedMps > 0.2) {
        pushEvent(
          'ESTAKADA_STOP_LINE_OVERSHOOT',
          'Estakadada 1.12 to‘xtash chizig‘i to‘xtamasdan kesib o‘tildi.',
          'serious',
          3.0
        );
      }
      if (inStopBox && Math.abs(nextVehicle.speedMps) < 0.06) {
        exState.stopHoldDurationSec += dt;
        if (exState.stopHoldDurationSec >= 0.6) {
          exState.estakadaStopCompleted = true;
          exState.stoppedAtStopLine = true;
        }
      }
      const maxRollbackMeters = adminConfig.estakadaRollbackLimitCm / 100;
      if (nextVehicle.rollbackDistanceMeters > maxRollbackMeters) {
        pushEvent(
          'ESTAKADA_ROLLBACK',
          `Estakadada orqaga ketish o‘quv chegarasidan (${adminConfig.estakadaRollbackLimitCm} sm) oshdi.`,
          'serious',
          2.5
        );
      }
      if (inExitZone) {
        if (!exState.estakadaStopCompleted) {
          pushEvent(
            'ESTAKADA_NO_STOP',
            'Estakada tepasida 1.12 chizig‘i oldida majburiy to‘xtash bajarilmadi.',
            'serious',
            4.0
          );
        }
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'turn-90':
    case 'slalom': {
      if (inExitZone) {
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'reverse-box': {
      if (collisionReport.isFullyInsideReverseBox && Math.abs(nextVehicle.speedMps) < 0.08) {
        exState.stoppedAtStopLine = true;
      }
      if (exState.reverseMoveCount > adminConfig.maxReverseMovesInBox) {
        pushEvent(
          'BOX_MAX_REVERSE_EXCEEDED',
          `Boksga kirishda sozlangan orqaga urinishlar limiti (${adminConfig.maxReverseMovesInBox}) oshdi.`,
          'warning',
          4.0
        );
      }
      if (inExitZone && exState.stoppedAtStopLine) {
        exerciseJustCompleted = true;
      } else if (inExitZone && !exState.stoppedAtStopLine) {
        pushEvent(
          'BOX_NOT_ENTERED',
          'Boks ichiga to‘liq joylashmasdan chiqib ketildi.',
          'serious',
          4.0
        );
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'regulated-intersection': {
      const inIntersection = collisionReport.insideZones.some((z) => z.kind === 'intersection_box');
      const atStopLine = collisionReport.insideZones.some((z) => z.kind === 'stop_line');
      if (atStopLine && Math.abs(nextVehicle.speedMps) < 0.08) {
        exState.stoppedAtStopLine = true;
      }
      if (
        inIntersection &&
        (exState.trafficLightPhase === 'red' ||
          (exState.trafficLightPhase === 'yellow' && !exState.stoppedAtStopLine && nextVehicle.speedMps > 1.0))
      ) {
        pushEvent(
          'RED_LIGHT_VIOLATION',
          exState.trafficLightPhase === 'red'
            ? 'Svetoforning qizil chirog‘ida stop chizig‘idan o‘tildi!'
            : 'Svetoforning sariq signalida stop chizig‘idan o‘tildi.',
          exState.trafficLightPhase === 'red' ? 'safety_critical' : 'serious',
          3.0
        );
      }
      if (inExitZone) {
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'parallel-parking': {
      if (collisionReport.isFullyInsideParkingBay && Math.abs(nextVehicle.speedMps) < 0.08) {
        exState.stopHoldDurationSec += dt;
        if (exState.stopHoldDurationSec >= 0.6) {
          exState.stoppedAtStopLine = true;
        }
      }
      if (inExitZone) {
        if (!exState.stoppedAtStopLine) {
          pushEvent(
            'PARKING_INCOMPLETE',
            'Parallel parkovka joyiga to‘liq joylashmasdan chiqib ketildi.',
            'serious',
            4.0
          );
        }
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'railway-crossing': {
      const atStop = collisionReport.insideZones.some((z) => z.kind === 'stop_line');
      const onTracks = collisionReport.insideZones.some((z) => z.kind === 'railway_tracks');
      if (atStop && Math.abs(nextVehicle.speedMps) < 0.08) {
        exState.stopHoldDurationSec += dt;
        if (exState.stopHoldDurationSec >= 0.6) {
          exState.stoppedAtStopLine = true;
        }
      }
      if (onTracks && exState.railwayTrainActive) {
        pushEvent(
          'RAILWAY_TRAIN_DANGER',
          'Poyezd yaqinlashayotgan/o‘tayotgan vaqtda temir yo‘l kesishmasiga kirildi!',
          'safety_critical',
          2.5
        );
      }
      if (onTracks && Math.abs(nextVehicle.speedMps) < 0.05) {
        pushEvent(
          'STOPPED_ON_RAILWAY_TRACKS',
          'Temir yo‘l izlari ustida to‘xtab qolindi!',
          'safety_critical',
          2.5
        );
      }
      if (inExitZone) {
        if (!exState.stoppedAtStopLine) {
          pushEvent(
            'RAILWAY_NO_STOP',
            '2.5 (STOP) belgisi va 1.12 chizig‘i oldida majburiy to‘xtash bajarilmadi.',
            'serious',
            4.0
          );
        }
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'acceleration-lane': {
      if (inExitZone) {
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'emergency-stop': {
      const inTrigger = collisionReport.insideZones.some((z) => z.kind === 'emergency_trigger_zone');
      if (inTrigger && !exState.emergencySignalTriggered) {
        exState.emergencySignalTriggered = true;
        exState.emergencyReactionTimerSec = 0;
      }
      if (exState.emergencySignalTriggered && !exState.emergencyStoppedSafely) {
        exState.emergencyReactionTimerSec += dt;
        if (Math.abs(nextVehicle.speedMps) < 0.08 && nextControls.hazardLights) {
          exState.emergencyStoppedSafely = true;
        }
      }
      if (inExitZone) {
        if (exState.emergencySignalTriggered && !exState.emergencyStoppedSafely) {
          pushEvent(
            'EMERGENCY_STOP_MISSED',
            'Avariya signali paytida to‘liq to‘xtash va avariya chiroqlarini yoqish bajarilmadi.',
            'serious',
            4.0
          );
        }
        exerciseJustCompleted = true;
      }
      break;
    }

    case 'finish': {
      const inFinish = collisionReport.insideZones.some((z) => z.kind === 'finish_line');
      if (
        inFinish &&
        Math.abs(nextVehicle.speedMps) < 0.05 &&
        nextControls.gear === 'N' &&
        nextControls.handbrake &&
        !nextControls.engineRunning
      ) {
        exState.finishShutdownConfirmed = true;
        exerciseJustCompleted = true;
      }
      break;
    }
  }

  if (exerciseJustCompleted) {
    exState.status = 'completed';
    exState.completedAtSec = nextElapsed;
  }

  // Keep vehicle clamped reasonably inside bounds + margin
  const bounds = exercise.geometry.bounds;
  const clampedX = Math.max(offset.x + bounds.minX - 2, Math.min(offset.x + bounds.maxX + 2, nextVehicle.x));
  const clampedY = Math.max(offset.y + bounds.minY - 2, Math.min(offset.y + bounds.maxY + 2, nextVehicle.y));

  return {
    snapshot: {
      ...snapshot,
      elapsedSec: nextElapsed,
      vehicle: {
        ...nextVehicle,
        x: clampedX,
        y: clampedY,
        headingRad: nextVehicle.headingRad ?? degToRad(exercise.geometry.startPose.headingDeg),
      },
      controls: nextControls,
      exerciseState: exState,
      events,
      activeCollisionIds: [...collisionReport.collidedConeIds, ...collisionReport.collidedBarrierIds],
      activeLineViolationIds: collisionReport.violatedLineIds,
    },
    collisionReport,
    exerciseJustCompleted,
  };
}
