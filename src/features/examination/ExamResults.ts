import type { ExamRuleConfig, ExamViolationEvent } from '@/types/simulator3d';

export interface ExamResultSummary {
  completed: boolean;
  totalViolations: number;
  statusLabel: string;
  customScore?: number;
  customPassed?: boolean;
}

export function computeExamResults(
  violations: ExamViolationEvent[],
  completed: boolean,
  rules: ExamRuleConfig
): ExamResultSummary {
  const statusLabel = !completed
    ? 'Yakunlanmadi'
    : violations.length === 0
      ? 'Xatosiz yakunlandi'
      : 'Xatolar bilan yakunlandi';

  if (!rules.enablePointsScoring) {
    return {
      completed,
      totalViolations: violations.length,
      statusLabel,
    };
  }

  const totalPenalty = violations.reduce((acc, v) => acc + v.penalty, 0);
  const customScore = Math.max(0, rules.initialPoints - totalPenalty);
  return {
    completed,
    totalViolations: violations.length,
    statusLabel,
    customScore,
    customPassed: completed && customScore >= rules.passThresholdPoints,
  };
}
