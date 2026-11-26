import type {
  AdminScoringConfig,
  ErrorSeverity,
  ExerciseConfig,
  Point2D,
  SimulationEvent,
} from '@/types';

export interface ScoringEvaluationSummary {
  outcome: 'success' | 'completed_with_errors' | 'incomplete';
  warningCount: number;
  seriousCount: number;
  safetyCriticalCount: number;
  customScore?: number;
  customPassed?: boolean;
}

export function createSimulationEvent(params: {
  timestampSec: number;
  exercise: ExerciseConfig;
  code: string;
  message: string;
  severity: ErrorSeverity;
  position: Point2D;
  adminConfig: AdminScoringConfig;
}): SimulationEvent {
  let pointsDeducted: number | undefined;
  if (params.adminConfig.enableCustomScoring) {
    if (params.severity === 'warning') {
      pointsDeducted = params.adminConfig.warningPenalty;
    } else if (params.severity === 'serious') {
      pointsDeducted = params.adminConfig.seriousPenalty;
    } else {
      pointsDeducted = params.adminConfig.failOnSafetyCritical
        ? params.adminConfig.startingScore
        : params.adminConfig.seriousPenalty * 2;
    }
  }

  return {
    id: `${params.code}-${Math.round(params.timestampSec * 100)}-${Math.random().toString(36).slice(2, 6)}`,
    timestampSec: Number(params.timestampSec.toFixed(2)),
    exerciseSlug: params.exercise.slug,
    exerciseTitle: params.exercise.shortTitle,
    code: params.code,
    message: params.message,
    severity: params.severity,
    position: { ...params.position },
    pointsDeducted,
  };
}

export function shouldLogEventWithCooldown(
  existingEvents: SimulationEvent[],
  code: string,
  currentTimestampSec: number,
  cooldownSec = 2.5
): boolean {
  for (let i = existingEvents.length - 1; i >= 0; i--) {
    const ev = existingEvents[i];
    if (ev.code === code) {
      return currentTimestampSec - ev.timestampSec >= cooldownSec;
    }
  }
  return true;
}

export function evaluateSessionResult(
  events: SimulationEvent[],
  completed: boolean,
  adminConfig: AdminScoringConfig
): ScoringEvaluationSummary {
  const warningCount = events.filter((e) => e.severity === 'warning').length;
  const seriousCount = events.filter((e) => e.severity === 'serious').length;
  const safetyCriticalCount = events.filter((e) => e.severity === 'safety_critical').length;

  let outcome: ScoringEvaluationSummary['outcome'];
  if (!completed) {
    outcome = 'incomplete';
  } else if (events.length === 0) {
    outcome = 'success';
  } else {
    outcome = 'completed_with_errors';
  }

  if (!adminConfig.enableCustomScoring) {
    return {
      outcome,
      warningCount,
      seriousCount,
      safetyCriticalCount,
    };
  }

  const deducted =
    warningCount * adminConfig.warningPenalty + seriousCount * adminConfig.seriousPenalty;
  const rawScore = Math.max(0, adminConfig.startingScore - deducted);
  const customScore =
    adminConfig.failOnSafetyCritical && safetyCriticalCount > 0 ? 0 : rawScore;
  const customPassed =
    completed &&
    customScore >= adminConfig.passThresholdScore &&
    (!adminConfig.failOnSafetyCritical || safetyCriticalCount === 0);

  return {
    outcome,
    warningCount,
    seriousCount,
    safetyCriticalCount,
    customScore,
    customPassed,
  };
}
