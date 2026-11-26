import { EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import type { ExamExerciseId } from '@/types/simulator3d';

export interface CheckpointProgress {
  currentIndex: number;
  completedIds: ExamExerciseId[];
  finished: boolean;
}

export function evaluateCheckpointAdvance(
  vehiclePos: [number, number, number],
  currentIndex: number,
  completedIds: ExamExerciseId[],
  extraConditionMet = true
): {
  nextIndex: number;
  nextCompletedIds: ExamExerciseId[];
  justCompletedId: ExamExerciseId | null;
  skippedAheadId: ExamExerciseId | null;
  finished: boolean;
} {
  const currentSpec = EXAM_EXERCISES_ORDER[currentIndex];
  if (!currentSpec) {
    return {
      nextIndex: currentIndex,
      nextCompletedIds: completedIds,
      justCompletedId: null,
      skippedAheadId: null,
      finished: true,
    };
  }

  const dx = vehiclePos[0] - currentSpec.checkpointCenter[0];
  const dz = vehiclePos[2] - currentSpec.checkpointCenter[2];
  const dist = Math.hypot(dx, dz);

  if (dist <= currentSpec.checkpointRadiusMeters && extraConditionMet) {
    const nextCompleted = completedIds.includes(currentSpec.id)
      ? completedIds
      : [...completedIds, currentSpec.id];
    const isLast = currentIndex >= EXAM_EXERCISES_ORDER.length - 1;
    return {
      nextIndex: isLast ? currentIndex : currentIndex + 1,
      nextCompletedIds: nextCompleted,
      justCompletedId: currentSpec.id,
      skippedAheadId: null,
      finished: isLast,
    };
  }

  // Detect if player skipped current checkpoint and entered a later checkpoint out of order
  for (let i = currentIndex + 1; i < EXAM_EXERCISES_ORDER.length; i++) {
    const future = EXAM_EXERCISES_ORDER[i];
    const fDist = Math.hypot(
      vehiclePos[0] - future.checkpointCenter[0],
      vehiclePos[2] - future.checkpointCenter[2]
    );
    if (fDist <= future.checkpointRadiusMeters) {
      return {
        nextIndex: currentIndex,
        nextCompletedIds: completedIds,
        justCompletedId: null,
        skippedAheadId: future.id,
        finished: false,
      };
    }
  }

  return {
    nextIndex: currentIndex,
    nextCompletedIds: completedIds,
    justCompletedId: null,
    skippedAheadId: null,
    finished: false,
  };
}
