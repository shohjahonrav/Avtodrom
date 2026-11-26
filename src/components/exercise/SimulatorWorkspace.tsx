'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Info,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { AutodromeMapSvg } from '@/components/autodrome/ExerciseSceneSvg';
import { ControlDeck } from '@/components/vehicle/ControlDeck';
import { TrafficLightCard } from '@/components/road-markings/RoadSignSvg';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/primitives';
import { EXERCISES_B, getExerciseBySlug } from '@/features/exercises/data/exercisesB';
import { evaluateSessionResult } from '@/features/simulation/scoring/ruleEvaluator';
import { useVehicleInput } from '@/hooks/useVehicleInput';
import { RESULT_DISCLAIMER_UZ } from '@/lib/constants/regulations';
import { formatDuration } from '@/lib/utils/cn';
import { useAppStore } from '@/stores/useAppStore';
import { useSimulationStore } from '@/stores/useSimulationStore';
import type { ExerciseSlug, SimulationMode, TransmissionType } from '@/types';

interface SimulatorWorkspaceProps {
  initialSlug: ExerciseSlug;
  mode: SimulationMode;
  transmission?: TransmissionType;
  allowExerciseSelect?: boolean;
  onSessionFinished?: (summary: {
    outcome: 'success' | 'completed_with_errors' | 'incomplete';
    durationSec: number;
    events: ReturnType<typeof useSimulationStore.getState>['snapshot']['events'];
  }) => void;
}

export function SimulatorWorkspace({
  initialSlug,
  mode,
  transmission: initialTransmission = 'manual',
  allowExerciseSelect = true,
  onSessionFinished,
}: SimulatorWorkspaceProps) {
  const [mapMode, setMapMode] = useState<'single' | 'full'>('single');
  const [transmission, setTransmission] = useState<TransmissionType>(initialTransmission);
  const [clutchHint, setClutchHint] = useState<string | null>(null);
  const savedRef = useRef(false);

  const adminConfig = useAppStore((s) => s.adminConfig);
  const devGridEnabled = useAppStore((s) => s.devGridEnabled);
  const setDevGridEnabled = useAppStore((s) => s.setDevGridEnabled);
  const addAttempt = useAppStore((s) => s.addAttempt);

  const snapshot = useSimulationStore((s) => s.snapshot);
  const initSession = useSimulationStore((s) => s.initSession);
  const advanceExercise = useSimulationStore((s) => s.advanceExercise);
  const completeSession = useSimulationStore((s) => s.completeSession);
  const pauseSession = useSimulationStore((s) => s.pauseSession);
  const resumeSession = useSimulationStore((s) => s.resumeSession);

  const activeExercise = getExerciseBySlug(snapshot.currentExerciseSlug) ?? EXERCISES_B[0];

  useEffect(() => {
    savedRef.current = false;
    initSession({
      slug: initialSlug,
      mode,
      transmission,
      skipPrep: mode !== 'exam' && initialSlug !== 'start',
    });
  }, [initialSlug, mode, transmission, initSession]);

  const handleExerciseCompleted = useCallback(() => {
    const curState = useSimulationStore.getState().snapshot;
    if (mode === 'exam') {
      const idx = EXERCISES_B.findIndex((e) => e.slug === curState.currentExerciseSlug);
      if (idx >= 0 && idx < EXERCISES_B.length - 1) {
        advanceExercise(EXERCISES_B[idx + 1].slug, true);
        return;
      }
      completeSession();
    } else {
      completeSession();
    }
  }, [mode, advanceExercise, completeSession]);

  // Persist finished attempt once
  useEffect(() => {
    if (snapshot.sessionStatus === 'completed' && !savedRef.current) {
      savedRef.current = true;
      const evaluation = evaluateSessionResult(snapshot.events, true, adminConfig);
      addAttempt({
        id: `att-${Date.now()}`,
        timestampIso: new Date().toISOString(),
        mode,
        category: 'B',
        transmission: snapshot.transmission,
        exerciseSlug: mode === 'exam' ? 'full-exam' : snapshot.currentExerciseSlug,
        outcome: evaluation.outcome,
        durationSec: snapshot.elapsedSec,
        events: snapshot.events,
        customScore: evaluation.customScore,
        customPassed: evaluation.customPassed,
      });
      onSessionFinished?.({
        outcome: evaluation.outcome,
        durationSec: snapshot.elapsedSec,
        events: snapshot.events,
      });
    }
  }, [snapshot.sessionStatus, snapshot.events, snapshot.elapsedSec, snapshot.transmission, snapshot.currentExerciseSlug, mode, adminConfig, addAttempt, onSessionFinished]);

  useVehicleInput({
    enabled: snapshot.sessionStatus === 'running',
    onGearShiftRejected: () => {
      setClutchHint('Mexanik uzatmada uzatmani o‘zgartirish uchun avval Ilashish (Shift / C) ni bosing!');
      setTimeout(() => setClutchHint(null), 2800);
    },
    onExerciseCompleted: handleExerciseCompleted,
  });

  const handleRestart = () => {
    savedRef.current = false;
    initSession({
      slug: mode === 'exam' ? 'start' : activeExercise.slug,
      mode,
      transmission,
      skipPrep: mode !== 'exam' && activeExercise.slug !== 'start',
    });
  };

  const handleSelectExercise = (slug: ExerciseSlug) => {
    if (!allowExerciseSelect || mode === 'exam') return;
    savedRef.current = false;
    initSession({
      slug,
      mode,
      transmission,
      skipPrep: slug !== 'start',
    });
  };

  const evaluation = evaluateSessionResult(
    snapshot.events,
    snapshot.sessionStatus === 'completed',
    adminConfig
  );

  return (
    <div className="space-y-4">
      {/* Top Action & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={mode === 'exam' ? 'custom' : 'official'}>
            {mode === 'learn'
              ? 'O‘rganish rejimi'
              : mode === 'practice'
                ? 'Mashq qilish rejimi'
                : 'Imtihon simulyatsiyasi'}
          </Badge>
          <span className="text-sm font-semibold text-white">
            {activeExercise.order}/12: {activeExercise.shortTitle}
          </span>
          <span className="text-xs font-mono text-slate-400">
            Vaqt: {formatDuration(snapshot.elapsedSec)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-700 bg-slate-950 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTransmission('manual')}
              className={`px-2.5 py-1 rounded-md ${
                transmission === 'manual' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300'
              }`}
            >
              Mexanik
            </button>
            <button
              type="button"
              onClick={() => setTransmission('automatic')}
              className={`px-2.5 py-1 rounded-md ${
                transmission === 'automatic' ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300'
              }`}
            >
              Avtomat
            </button>
          </div>

          {snapshot.sessionStatus === 'running' ? (
            <Button type="button" size="sm" variant="outline" onClick={pauseSession}>
              <Pause className="h-3.5 w-3.5" /> Pauza
            </Button>
          ) : snapshot.sessionStatus === 'paused' ? (
            <Button type="button" size="sm" variant="success" onClick={resumeSession}>
              <Play className="h-3.5 w-3.5" /> Davom etish
            </Button>
          ) : null}

          <Button type="button" size="sm" variant="secondary" onClick={handleRestart}>
            <RotateCcw className="h-3.5 w-3.5" /> Qayta boshlash
          </Button>
        </div>
      </div>

      {/* Live Scenario Alerts */}
      {snapshot.exerciseState.emergencySignalTriggered && !snapshot.exerciseState.emergencyStoppedSafely && (
        <div className="flex items-center justify-between rounded-xl border-2 border-red-500 bg-red-950/90 px-4 py-3 text-red-100 animate-pulse">
          <div className="flex items-center gap-2 font-bold">
            <AlertOctagon className="h-5 w-5 text-red-400" />
            AVARIYA TO‘XTASH SIGNALI! Darhol tormoz bosing va avariya chiroqlarini (X) yoqing!
          </div>
          <span className="font-mono text-sm">
            {snapshot.exerciseState.emergencyReactionTimerSec.toFixed(1)} s
          </span>
        </div>
      )}

      {snapshot.exerciseState.railwayTrainActive && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500 bg-amber-950/80 px-4 py-2.5 text-sm text-amber-200 font-semibold">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          Poyezd yaqinlashmoqda! 1.12 stop chizig‘i oldida to‘liq to‘xtab kuting.
        </div>
      )}

      {/* Main Responsive Layout: Desktop Map Center + Right Side Panel; Mobile Map First + Controls Below */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left/Center Column: Map + Controls */}
        <div className="lg:col-span-8 space-y-4">
          <AutodromeMapSvg
            mode={mapMode}
            onModeChange={setMapMode}
            activeExercise={activeExercise}
            snapshot={snapshot}
            vehicleDimensions={adminConfig.vehicleDimensions}
            showDevGrid={devGridEnabled}
            onToggleDevGrid={() => setDevGridEnabled(!devGridEnabled)}
            onSelectExercise={handleSelectExercise}
          />

          <ControlDeck clutchHint={clutchHint} onClutchHint={setClutchHint} />
        </div>

        {/* Right Side Panel: Instructions, Traffic Light, Error Log, Completion Summary */}
        <div className="lg:col-span-4 space-y-4">
          {/* Exercise Selector (Learn / Practice only) */}
          {allowExerciseSelect && mode !== 'exam' && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Mashqni tanlash (B toifa)</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  value={activeExercise.slug}
                  onChange={(e) => handleSelectExercise(e.target.value as ExerciseSlug)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                  aria-label="Mashqni tanlash"
                >
                  {EXERCISES_B.map((ex) => (
                    <option key={ex.slug} value={ex.slug}>
                      {ex.order}. {ex.shortTitle}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          )}

          {/* Traffic Light live indicator when at intersection */}
          {activeExercise.geometry.trafficLight && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Svetofor holati</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <TrafficLightCard
                  phase={snapshot.exerciseState.trafficLightPhase}
                  hasArrow={activeExercise.geometry.trafficLight.hasDirectionArrow}
                  arrowGreen={snapshot.exerciseState.trafficLightArrowGreen}
                />
                <div className="text-xs text-slate-300 max-w-[180px]">
                  {snapshot.exerciseState.trafficLightPhase === 'red'
                    ? 'QIZIL: 1.12 chizig‘i oldida to‘xtang.'
                    : snapshot.exerciseState.trafficLightPhase === 'yellow'
                      ? 'SARIQ: Harakatlanishni taqiqlaydi (to‘xtashga tayyorlaning).'
                      : 'YASHIL: Xavfsiz harakatlanishingiz mumkin.'}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mode-dependent guidance */}
          {mode === 'learn' ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-sky-400" />
                  Bajarish bosqichlari va tavsiya
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <p className="text-slate-300">{activeExercise.purpose}</p>
                <ol className="space-y-1.5">
                  {activeExercise.steps.map((st) => (
                    <li key={st.order} className="rounded-md bg-slate-950/70 p-2 border border-slate-800">
                      <span className="font-semibold text-amber-400">{st.order}. {st.title}:</span>{' '}
                      <span className="text-slate-300">{st.description}</span>
                    </li>
                  ))}
                </ol>
                <div className="rounded-md border border-emerald-800/50 bg-emerald-950/30 p-2.5 text-emerald-200">
                  <div className="font-semibold mb-1">Maslahatlar:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {activeExercise.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {mode === 'exam' ? 'Imtihon ko‘rsatmasi (cheklangan)' : 'Mashq vazifasi'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-300 space-y-2">
                <p>{activeExercise.purpose}</p>
                {mode === 'exam' && (
                  <p className="text-amber-300">
                    Imtihon rejimida bosqichma-bosqich yordam yashirilgan. Barcha xatolar sensorlar orqali qayd etiladi.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Session Completion Card */}
          {snapshot.sessionStatus === 'completed' && (
            <Card className="border-emerald-700/70 bg-emerald-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  {evaluation.outcome === 'success'
                    ? 'Mashq xatosiz bajarildi!'
                    : 'Mashq yakunlandi (xatolar mavjud)'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-slate-950 p-2">
                    <div className="text-amber-300 font-bold">{evaluation.warningCount}</div>
                    <div className="text-slate-400">Ogohlantirish</div>
                  </div>
                  <div className="rounded bg-slate-950 p-2">
                    <div className="text-orange-400 font-bold">{evaluation.seriousCount}</div>
                    <div className="text-slate-400">Jiddiy xato</div>
                  </div>
                  <div className="rounded bg-slate-950 p-2">
                    <div className="text-red-400 font-bold">{evaluation.safetyCriticalCount}</div>
                    <div className="text-slate-400">Xavfli</div>
                  </div>
                </div>
                {adminConfig.enableCustomScoring && evaluation.customScore !== undefined && (
                  <div className="rounded-lg border border-amber-700/60 bg-amber-950/40 p-2.5 text-amber-200">
                    Sozlangan ball (custom): <strong>{evaluation.customScore}</strong> •{' '}
                    {evaluation.customPassed ? 'O‘tdi' : 'O‘tmadi'}
                  </div>
                )}
                <p className="text-[11px] text-slate-400">{RESULT_DISCLAIMER_UZ}</p>
                <Button type="button" size="sm" onClick={handleRestart} className="w-full">
                  Qayta urinib ko‘rish
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Live Event / Error Log */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>Hodisalar va xatolar jurnali</span>
                <Badge variant={snapshot.events.length === 0 ? 'official' : 'error'}>
                  {snapshot.events.length} ta
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto space-y-1.5 text-xs">
              {snapshot.events.length === 0 ? (
                <div className="flex items-center gap-2 text-slate-400 py-2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  Hozircha xato qayd etilmadi.
                </div>
              ) : (
                snapshot.events.map((ev) => (
                  <div
                    key={ev.id}
                    className={`rounded-lg border p-2 ${
                      ev.severity === 'safety_critical'
                        ? 'border-red-700/70 bg-red-950/40 text-red-200'
                        : ev.severity === 'serious'
                          ? 'border-orange-700/60 bg-orange-950/30 text-orange-200'
                          : 'border-amber-700/50 bg-amber-950/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>
                        {ev.severity === 'safety_critical'
                          ? 'Xavfsizlikka tahdid'
                          : ev.severity === 'serious'
                            ? 'Jiddiy xato'
                            : 'Ogohlantirish'}
                      </span>
                      <span className="font-mono text-[10px]">{ev.timestampSec.toFixed(1)}s</span>
                    </div>
                    <div className="mt-0.5">{ev.message}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
