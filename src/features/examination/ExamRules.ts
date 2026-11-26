import { EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import type { ExamRuleConfig, ViolationEventType } from '@/types/simulator3d';

export function getPenaltyForViolation(type: ViolationEventType, rules: ExamRuleConfig): number {
  if (!rules.enablePointsScoring) return 0;
  switch (type) {
    case 'BOUNDARY_CROSSING':
      return rules.boundaryCrossPenalty;
    case 'CONE_COLLISION':
      return rules.coneCollisionPenalty;
    case 'WALL_COLLISION':
      return rules.wallCollisionPenalty;
    case 'STOP_LINE_MISSED':
      return rules.stopLineFailPenalty;
    case 'RED_LIGHT':
      return rules.redLightPenalty;
    case 'PEDESTRIAN_VIOLATION':
      return rules.pedestrianFailPenalty;
    case 'SPEED_LIMIT':
      return rules.speedViolationPenalty;
    case 'WRONG_ORDER':
    case 'CHECKPOINT_SKIPPED':
      return rules.wrongOrderPenalty;
    case 'PARKING_INVALID':
      return rules.parkingFailPenalty;
    case 'ENGINE_STALL':
      return rules.stallPenalty;
    default:
      return rules.boundaryCrossPenalty;
  }
}

export function getActiveExerciseSpec(index: number) {
  return EXAM_EXERCISES_ORDER[Math.max(0, Math.min(EXAM_EXERCISES_ORDER.length - 1, index))];
}
