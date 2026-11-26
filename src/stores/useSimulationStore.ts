'use client';

import { create } from 'zustand';
import { EXERCISES_B, getExerciseBySlug } from '@/features/exercises/data/exercisesB';
import {
  createInitialExerciseDynamicState,
  stepSimulation,
} from '@/features/simulation/engine/simulationStep';
import type { CollisionReport } from '@/features/simulation/collision/collisionDetector';
import { degToRad } from '@/lib/utils/geometry';
import type {
  AdminScoringConfig,
  ExerciseConfig,
  ExerciseSlug,
  GearPosition,
  SimulationMode,
  SimulationSnapshot,
  TransmissionType,
  VehicleControlsState,
} from '@/types';

const INITIAL_CONTROLS: VehicleControlsState = {
  steeringInput: 0,
  throttle: 0,
  brake: 0,
  clutch: 1,
  gear: 'N',
  handbrake: true,
  leftIndicator: false,
  rightIndicator: false,
  headlights: false,
  hazardLights: false,
  seatbelt: false,
  mirrorsChecked: false,
  seatAdjusted: false,
  doorsClosed: true,
  engineRunning: false,
};

export function buildInitialSnapshot(
  exercise: ExerciseConfig,
  mode: SimulationMode,
  transmission: TransmissionType,
  skipPrep = false
): SimulationSnapshot {
  const readyControls: VehicleControlsState = skipPrep
    ? {
        ...INITIAL_CONTROLS,
        seatbelt: true,
        mirrorsChecked: true,
        seatAdjusted: true,
        doorsClosed: true,
        engineRunning: true,
        handbrake: false,
        gear: '1',
        clutch: transmission === 'automatic' ? 0 : 0.85,
      }
    : { ...INITIAL_CONTROLS };

  return {
    mode,
    category: 'B',
    transmission,
    elapsedSec: 0,
    currentExerciseSlug: exercise.slug,
    currentExerciseIndex: exercise.order - 1,
    vehicle: {
      x: exercise.geometry.startPose.x,
      y: exercise.geometry.startPose.y,
      headingRad: degToRad(exercise.geometry.startPose.headingDeg),
      speedMps: 0,
      steeringAngleRad: 0,
      rpm: readyControls.engineRunning ? 800 : 0,
      stalled: false,
      onSlopeGrade: 0,
      rollbackDistanceMeters: 0,
      maxRollbackObservedMeters: 0,
    },
    controls: readyControls,
    exerciseState: createInitialExerciseDynamicState(exercise),
    events: [],
    completedExercises: [],
    activeCollisionIds: [],
    activeLineViolationIds: [],
    sessionStatus: 'running',
  };
}

interface SimulationStoreState {
  snapshot: SimulationSnapshot;
  lastCollisionReport: CollisionReport | null;
  initSession: (params: {
    slug: ExerciseSlug;
    mode: SimulationMode;
    transmission: TransmissionType;
    skipPrep?: boolean;
  }) => void;
  setControls: (partial: Partial<VehicleControlsState>) => void;
  setGear: (gear: GearPosition) => void;
  toggleEngine: () => void;
  advanceExercise: (nextSlug: ExerciseSlug, skipPrep?: boolean) => void;
  completeSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  tick: (dt: number, adminConfig: AdminScoringConfig) => { exerciseJustCompleted: boolean };
}

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  snapshot: buildInitialSnapshot(EXERCISES_B[0], 'learn', 'manual', false),
  lastCollisionReport: null,

  initSession: ({ slug, mode, transmission, skipPrep }) => {
    const ex = getExerciseBySlug(slug) ?? EXERCISES_B[0];
    const autoReady = skipPrep ?? (slug !== 'start' && mode !== 'exam');
    set({
      snapshot: buildInitialSnapshot(ex, mode, transmission, autoReady),
      lastCollisionReport: null,
    });
  },

  setControls: (partial) =>
    set((state) => ({
      snapshot: {
        ...state.snapshot,
        controls: {
          ...state.snapshot.controls,
          ...partial,
        },
      },
    })),

  setGear: (gear) =>
    set((state) => {
      const { transmission, controls } = state.snapshot;
      if (transmission === 'manual' && controls.clutch < 0.55 && gear !== 'N' && controls.gear !== gear) {
        // Require pressing clutch in manual transmission to shift into gear
        return state;
      }
      return {
        snapshot: {
          ...state.snapshot,
          controls: {
            ...controls,
            gear,
          },
        },
      };
    }),

  toggleEngine: () =>
    set((state) => {
      const { controls, vehicle } = state.snapshot;
      const nextRunning = !controls.engineRunning;
      return {
        snapshot: {
          ...state.snapshot,
          controls: {
            ...controls,
            engineRunning: nextRunning,
          },
          vehicle: {
            ...vehicle,
            stalled: nextRunning ? false : vehicle.stalled,
            rpm: nextRunning ? 800 : 0,
          },
        },
      };
    }),

  advanceExercise: (nextSlug, skipPrep = true) => {
    const current = get().snapshot;
    const nextEx = getExerciseBySlug(nextSlug);
    if (!nextEx) return;
    const completed = current.completedExercises.includes(current.currentExerciseSlug)
      ? current.completedExercises
      : [...current.completedExercises, current.currentExerciseSlug];

    const nextSnap = buildInitialSnapshot(nextEx, current.mode, current.transmission, skipPrep);
    set({
      snapshot: {
        ...nextSnap,
        elapsedSec: current.elapsedSec,
        events: current.events,
        completedExercises: completed,
        controls: {
          ...nextSnap.controls,
          seatbelt: current.controls.seatbelt,
          mirrorsChecked: current.controls.mirrorsChecked,
          seatAdjusted: current.controls.seatAdjusted,
          headlights: current.controls.headlights,
        },
      },
      lastCollisionReport: null,
    });
  },

  completeSession: () =>
    set((state) => {
      const curSlug = state.snapshot.currentExerciseSlug;
      const completed = state.snapshot.completedExercises.includes(curSlug)
        ? state.snapshot.completedExercises
        : [...state.snapshot.completedExercises, curSlug];
      return {
        snapshot: {
          ...state.snapshot,
          completedExercises: completed,
          sessionStatus: 'completed',
        },
      };
    }),

  pauseSession: () =>
    set((state) => ({
      snapshot: { ...state.snapshot, sessionStatus: 'paused' },
    })),

  resumeSession: () =>
    set((state) => ({
      snapshot: { ...state.snapshot, sessionStatus: 'running' },
    })),

  tick: (dt, adminConfig) => {
    const current = get().snapshot;
    const exercise = getExerciseBySlug(current.currentExerciseSlug) ?? EXERCISES_B[0];
    const result = stepSimulation(current, exercise, adminConfig, dt, false);
    set({
      snapshot: result.snapshot,
      lastCollisionReport: result.collisionReport,
    });
    return { exerciseJustCompleted: result.exerciseJustCompleted };
  },
}));
