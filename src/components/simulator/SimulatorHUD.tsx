'use client';

import React, { useState } from 'react';
import { HelpCircle, Pause, Play, RotateCcw, X } from 'lucide-react';
import { EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import { CameraControls } from '@/components/simulator/CameraControls';
import { Dashboard } from '@/components/simulator/Dashboard';
import { ExaminationPanel } from '@/components/simulator/ExaminationPanel';
import { useSimulatorStore } from '@/store/simulatorStore';
import type { ExamExerciseId } from '@/types/simulator3d';

interface SimulatorHUDProps {
  onReset: () => void;
  onTeleportToExercise: (id: ExamExerciseId) => void;
}

export function SimulatorHUD({ onReset, onTeleportToExercise }: SimulatorHUDProps) {
  const [showGuide, setShowGuide] = useState(false);
  const driveMode = useSimulatorStore((s) => s.driveMode);
  const setDriveMode = useSimulatorStore((s) => s.setDriveMode);
  const paused = useSimulatorStore((s) => s.paused);
  const setPaused = useSimulatorStore((s) => s.setPaused);
  const statusHint = useSimulatorStore((s) => s.statusHint);

  return (
    <div className="pointer-events-none fixed inset-0 top-14 z-20 flex flex-col justify-between p-3 sm:p-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Free Drive / Exam Mode Switcher */}
          <div className="pointer-events-auto inline-flex rounded-xl border border-slate-700/70 bg-slate-950/85 backdrop-blur-md p-1 text-xs shadow-lg">
            <button
              type="button"
              onClick={() => {
                setDriveMode('free_drive');
                onReset();
              }}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                driveMode === 'free_drive'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Erkin haydash
            </button>
            <button
              type="button"
              onClick={() => {
                setDriveMode('exam');
                onReset();
              }}
              className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${
                driveMode === 'exam'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Imtihon rejimi
            </button>
          </div>

          <CameraControls />

          {driveMode === 'free_drive' && (
            <select
              aria-label="Mashq joyiga o‘tish"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onTeleportToExercise(e.target.value as ExamExerciseId);
              }}
              className="pointer-events-auto rounded-xl border border-slate-700/70 bg-slate-950/85 backdrop-blur-md px-2.5 py-1.5 text-xs text-slate-200 shadow-lg"
            >
              <option value="" disabled>
                Mashqqa o‘tish...
              </option>
              {EXAM_EXERCISES_ORDER.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          )}

          {/* Pause, Reset, Help */}
          <div className="pointer-events-auto inline-flex items-center gap-1 rounded-xl border border-slate-700/70 bg-slate-950/85 backdrop-blur-md p-1 text-xs shadow-lg">
            <button
              type="button"
              onClick={() => setPaused(!paused)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-200 hover:bg-slate-800 cursor-pointer"
              title="Pauza (P)"
            >
              {paused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{paused ? 'Davom' : 'Pauza'}</span>
            </button>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-200 hover:bg-slate-800 cursor-pointer"
              title="Qayta boshlash (Backspace)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Qayta</span>
            </button>
            <button
              type="button"
              onClick={() => setShowGuide((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-amber-400 hover:bg-slate-800 cursor-pointer"
              title="Klaviatura boshqaruvi"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Boshqaruv</span>
            </button>
          </div>
        </div>

        {/* Examination Panel (Top-Right) */}
        <ExaminationPanel />
      </div>

      {/* Center Status Hint / Pause / Guide */}
      <div className="flex flex-col items-center gap-2">
        {statusHint && (
          <div className="pointer-events-auto rounded-xl border border-amber-500/70 bg-slate-950/90 px-4 py-2 text-xs font-medium text-amber-300 shadow-lg">
            {statusHint}
          </div>
        )}

        {paused && (
          <div className="pointer-events-auto rounded-2xl border border-slate-700 bg-slate-950/95 px-6 py-4 text-center shadow-2xl">
            <div className="text-lg font-bold text-white">Simulyatsiya pauzada</div>
            <p className="text-xs text-slate-400 mt-1">Davom etish uchun P tugmasini bosing</p>
          </div>
        )}

        {showGuide && (
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950/95 p-4 text-xs text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-amber-400">Klaviatura boshqaruvi (Cobalt LTZ Mexanik)</span>
              <button type="button" onClick={() => setShowGuide(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <span><strong>W / ↑</strong> — Gaz</span>
              <span><strong>S / ↓</strong> — Tormoz</span>
              <span><strong>A / D</strong> — Rul (chap/o‘ng)</span>
              <span><strong>Shift</strong> — Ilashish (Ssepleniye)</span>
              <span><strong>1–5, R, N</strong> — Uzatma (Shift bilan)</span>
              <span><strong>Space</strong> — Qo‘l tormozi</span>
              <span><strong>I</strong> — Dvigatel (yoqish/o‘chirish)</span>
              <span><strong>Q / E / X / L</strong> — Chiroqlar</span>
              <span><strong>C / V</strong> — Kamera almashtirish</span>
              <span><strong>P / Backspace</strong> — Pauza / Qayta</span>
            </div>
            <p className="mt-2.5 text-[11px] text-emerald-300">
              Boshlash uchun: <strong>Space</strong> bilan qo‘l tormozini tushiring, <strong>Shift + 1</strong> bilan 1-uzatmaga o‘ting, <strong>Shift</strong>ni qo‘yib <strong>W</strong> bosing!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar: Realistic Vehicle Dashboard + Subtle Legal Footer Note */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <Dashboard />
        <div className="hidden xl:block rounded-xl border border-slate-800/80 bg-slate-950/75 px-3 py-1.5 text-[10px] text-slate-400">
          O‘quv simulyatori (rasmiy imtihon tizimi emas) • Chevrolet Cobalt LTZ 3D • 60 Hz Rapier3D fizika
        </div>
      </div>
    </div>
  );
}
