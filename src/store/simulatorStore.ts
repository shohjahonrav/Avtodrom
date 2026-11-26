'use client';

import { create } from 'zustand';
import { DEFAULT_EXAM_RULES_3D, EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import { COBALT_VEHICLE_CONFIG } from '@/config/vehicle.config';
import type {
  CameraMode3D,
  DriveMode3D,
  ExamExerciseId,
  ExamRuleConfig,
  ExamViolationEvent,
  VehicleTelemetry,
} from '@/types/simulator3d';

const INITIAL_TELEMETRY: VehicleTelemetry = {
  speedKmh: 0,
  signedSpeedMps: 0,
  rpm: COBALT_VEHICLE_CONFIG.idleRpm,
  gear: 'N',
  throttle: 0,
  brake: 0,
  clutch: 0,
  handbrake: true,
  steeringAngleDeg: 0,
  steeringInput: 0,
  engineRunning: true,
  stalled: false,
  leftIndicator: false,
  rightIndicator: false,
  hazardLights: false,
  headlights: false,
  position: EXAM_EXERCISES_ORDER[0].spawnPose.position,
  yawRad: (EXAM_EXERCISES_ORDER[0].spawnPose.yawDeg * Math.PI) / 180,
  wheelContacts: [true, true, true, true],
  wheelSuspensionLengths: [0.22, 0.22, 0.22, 0.22],
};

interface SimulatorStoreState {
  driveMode: DriveMode3D;
  cameraMode: CameraMode3D;
  paused: boolean;
  telemetry: VehicleTelemetry;
  statusHint: string | null;

  // Examination state
  examRules: ExamRuleConfig;
  examActive: boolean;
  examFinished: boolean;
  examElapsedSec: number;
  currentExerciseIndex: number;
  completedExerciseIds: ExamExerciseId[];
  violations: ExamViolationEvent[];
  trafficLightPhase: 'red' | 'yellow' | 'green';
  pedestrianCrossingActive: boolean;
  pedestrianProgress: number;
  railwayTrainActive: boolean;
  railwayTrainProgress: number;
  emergencyAlertActive: boolean;

  // Actions
  setDriveMode: (mode: DriveMode3D) => void;
  setCameraMode: (mode: CameraMode3D) => void;
  cycleCameraMode: () => void;
  setPaused: (paused: boolean) => void;
  setTelemetry: (telemetry: VehicleTelemetry) => void;
  setStatusHint: (hint: string | null) => void;
  setExamRules: (partial: Partial<ExamRuleConfig>) => void;
  setExamProgress: (patch: {
    examActive?: boolean;
    examFinished?: boolean;
    examElapsedSec?: number;
    currentExerciseIndex?: number;
    completedExerciseIds?: ExamExerciseId[];
    violations?: ExamViolationEvent[];
    trafficLightPhase?: 'red' | 'yellow' | 'green';
    pedestrianCrossingActive?: boolean;
    pedestrianProgress?: number;
    railwayTrainActive?: boolean;
    railwayTrainProgress?: number;
    emergencyAlertActive?: boolean;
  }) => void;
  resetExamState: () => void;
}

const CAMERA_ORDER: CameraMode3D[] = ['chase', 'driver', 'topdown', 'free'];

export const useSimulatorStore = create<SimulatorStoreState>((set) => ({
  driveMode: 'free_drive',
  cameraMode: 'chase',
  paused: false,
  telemetry: INITIAL_TELEMETRY,
  statusHint: null,

  examRules: DEFAULT_EXAM_RULES_3D,
  examActive: false,
  examFinished: false,
  examElapsedSec: 0,
  currentExerciseIndex: 0,
  completedExerciseIds: [],
  violations: [],
  trafficLightPhase: 'red',
  pedestrianCrossingActive: false,
  pedestrianProgress: 0,
  railwayTrainActive: false,
  railwayTrainProgress: -0.5,
  emergencyAlertActive: false,

  setDriveMode: (driveMode) =>
    set({
      driveMode,
      examActive: driveMode === 'exam',
      examFinished: false,
      examElapsedSec: 0,
      currentExerciseIndex: 0,
      completedExerciseIds: [],
      violations: [],
    }),
  setCameraMode: (cameraMode) => set({ cameraMode }),
  cycleCameraMode: () =>
    set((s) => {
      const idx = CAMERA_ORDER.indexOf(s.cameraMode);
      return { cameraMode: CAMERA_ORDER[(idx + 1) % CAMERA_ORDER.length] };
    }),
  setPaused: (paused) => set({ paused }),
  setTelemetry: (telemetry) => set({ telemetry }),
  setStatusHint: (statusHint) => set({ statusHint }),
  setExamRules: (partial) =>
    set((s) => ({ examRules: { ...s.examRules, ...partial } })),
  setExamProgress: (patch) => set((s) => ({ ...s, ...patch })),
  resetExamState: () =>
    set((s) => ({
      examActive: s.driveMode === 'exam',
      examFinished: false,
      examElapsedSec: 0,
      currentExerciseIndex: 0,
      completedExerciseIds: [],
      violations: [],
      pedestrianCrossingActive: false,
      pedestrianProgress: 0,
      railwayTrainActive: false,
      railwayTrainProgress: -0.5,
      emergencyAlertActive: false,
    })),
}));
