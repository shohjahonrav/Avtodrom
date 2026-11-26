'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Flag } from 'lucide-react';
import { EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import { computeExamResults } from '@/features/examination/ExamResults';
import { RESULT_DISCLAIMER_UZ } from '@/lib/constants/regulations';
import { formatDuration } from '@/lib/utils/cn';
import { useSimulatorStore } from '@/store/simulatorStore';

export function ExaminationPanel() {
  const driveMode = useSimulatorStore((s) => s.driveMode);
  const currentExerciseIndex = useSimulatorStore((s) => s.currentExerciseIndex);
  const completedExerciseIds = useSimulatorStore((s) => s.completedExerciseIds);
  const violations = useSimulatorStore((s) => s.violations);
  const examElapsedSec = useSimulatorStore((s) => s.examElapsedSec);
  const examFinished = useSimulatorStore((s) => s.examFinished);
  const examRules = useSimulatorStore((s) => s.examRules);
  const trafficLightPhase = useSimulatorStore((s) => s.trafficLightPhase);
  const emergencyAlertActive = useSimulatorStore((s) => s.emergencyAlertActive);

  if (driveMode !== 'exam') return null;

  const currentSpec = EXAM_EXERCISES_ORDER[currentExerciseIndex];
  const summary = computeExamResults(violations, examFinished, examRules);

  return (
    <div className="pointer-events-auto w-72 sm:w-80 rounded-2xl border border-slate-700/70 bg-slate-950/85 backdrop-blur-md p-3.5 text-xs text-slate-100 shadow-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="font-bold text-amber-400 flex items-center gap-1.5">
          <Flag className="h-3.5 w-3.5" />
          Imtihon rejimi
        </span>
        <span className="font-mono text-slate-300">{formatDuration(examElapsedSec)}</span>
      </div>

      {emergencyAlertActive && (
        <div className="rounded-lg border border-red-500 bg-red-950/90 px-2.5 py-2 text-red-100 font-bold animate-pulse">
          AVARIYA SIGNALI! To‘xtang va X (avariya chiroqlari) ni yoqing!
        </div>
      )}

      {examFinished ? (
        <div className="space-y-2 rounded-xl border border-emerald-700/60 bg-emerald-950/30 p-3">
          <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            {summary.statusLabel}
          </div>
          <div className="text-slate-300">
            Yakunlangan mashqlar: {completedExerciseIds.length} / {EXAM_EXERCISES_ORDER.length}
          </div>
          <div className="text-slate-300">Jami xatolar: {summary.totalViolations}</div>
          {summary.customScore !== undefined && (
            <div className="text-amber-300 font-semibold">
              Ball (custom): {summary.customScore} ({summary.customPassed ? 'O‘tdi' : 'O‘tmadi'})
            </div>
          )}
          <p className="text-[10px] text-slate-400">{RESULT_DISCLAIMER_UZ}</p>
        </div>
      ) : (
        currentSpec && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-2.5 space-y-1">
            <div className="font-semibold text-white">{currentSpec.title}</div>
            <p className="text-[11px] text-slate-300">{currentSpec.objective}</p>
            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
              <span>
                Bajarildi: {completedExerciseIds.length} / {EXAM_EXERCISES_ORDER.length}
              </span>
              {currentSpec.id === 'regulated-intersection' && (
                <span>
                  Svetofor:{' '}
                  <strong
                    className={
                      trafficLightPhase === 'red'
                        ? 'text-red-400'
                        : trafficLightPhase === 'yellow'
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                    }
                  >
                    {trafficLightPhase.toUpperCase()}
                  </strong>
                </span>
              )}
            </div>
          </div>
        )
      )}

      {/* Violations Feed */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-400" /> Xatolar
          </span>
          <span>{violations.length} ta</span>
        </div>
        {violations.length > 0 && (
          <div className="max-h-28 overflow-y-auto space-y-1">
            {violations
              .slice()
              .reverse()
              .slice(0, 6)
              .map((v) => (
                <div
                  key={v.id}
                  className="rounded-md border border-red-800/60 bg-red-950/40 px-2 py-1 text-[10px] text-red-200"
                >
                  <span className="font-mono text-red-400">[{v.timestampSec.toFixed(1)}s]</span>{' '}
                  {v.description}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
