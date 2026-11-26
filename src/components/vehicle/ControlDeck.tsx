'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Disc,
  Eye,
  Gauge,
  KeyRound,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useSimulationStore } from '@/stores/useSimulationStore';
import type { GearPosition } from '@/types';
import { Button } from '@/components/ui/primitives';

const GEARS: GearPosition[] = ['R', 'N', '1', '2', '3', '4', '5'];

export function ControlDeck({
  clutchHint,
  onClutchHint,
}: {
  clutchHint?: string | null;
  onClutchHint?: (msg: string) => void;
}) {
  const snapshot = useSimulationStore((s) => s.snapshot);
  const lastCollisionReport = useSimulationStore((s) => s.lastCollisionReport);
  const setControls = useSimulationStore((s) => s.setControls);
  const setGear = useSimulationStore((s) => s.setGear);
  const toggleEngine = useSimulationStore((s) => s.toggleEngine);

  const { controls, vehicle, transmission } = snapshot;
  const speedKmh = Math.abs(vehicle.speedMps * 3.6);
  const wheelAngleDeg = controls.steeringInput * 420;

  const handleGearClick = (g: GearPosition) => {
    if (transmission === 'manual' && controls.clutch < 0.55 && g !== 'N' && controls.gear !== g) {
      onClutchHint?.('Mexanik uzatmada uzatmani o‘zgartirish uchun avval Ilashish (Shift / C) pedalini bosing!');
      return;
    }
    setGear(g);
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/95 p-3 sm:p-4">
      {/* Telemetry Strip: Speed, RPM, Engine, Rollback */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Spidometr</span>
            <Gauge className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <div className="mt-1 text-xl font-bold tabular-nums text-white">
            {speedKmh.toFixed(0)} <span className="text-xs font-normal text-slate-400">km/s</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Taxometr</span>
            <span className="text-[10px] font-mono text-amber-400">RPM</span>
          </div>
          <div className="mt-1 text-xl font-bold tabular-nums text-white">
            {vehicle.rpm}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
          <div className="text-slate-400">Dvigatel</div>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                vehicle.stalled
                  ? 'bg-red-500'
                  : controls.engineRunning
                    ? 'bg-emerald-500'
                    : 'bg-slate-600'
              }`}
            />
            <span className="font-semibold text-white">
              {vehicle.stalled ? 'O‘chib qoldi' : controls.engineRunning ? 'Ishlamoqda' : 'O‘chiq'}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-2.5">
          <div className="text-slate-400">Xavfsizlik kamari</div>
          <div className="mt-1 flex items-center gap-1.5">
            <ShieldCheck
              className={`h-4 w-4 ${controls.seatbelt ? 'text-emerald-400' : 'text-red-400'}`}
            />
            <span className={controls.seatbelt ? 'text-emerald-300 font-semibold' : 'text-red-300 font-semibold'}>
              {controls.seatbelt ? 'Taqilgan' : 'Taqilmagan'}
            </span>
          </div>
        </div>
      </div>

      {/* Educational Prep / Mirrors / Indicators */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Button
          type="button"
          size="sm"
          variant={controls.engineRunning ? 'success' : 'secondary'}
          onClick={toggleEngine}
        >
          <KeyRound className="h-3.5 w-3.5" />
          {controls.engineRunning ? 'Dvigatelni o‘chirish (I)' : 'Ishga tushirish (I)'}
        </Button>

        <Button
          type="button"
          size="sm"
          variant={controls.seatbelt ? 'success' : 'destructive'}
          onClick={() => setControls({ seatbelt: !controls.seatbelt })}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          Kamar (B)
        </Button>

        <Button
          type="button"
          size="sm"
          variant={controls.mirrorsChecked ? 'success' : 'outline'}
          onClick={() => setControls({ mirrorsChecked: !controls.mirrorsChecked, seatAdjusted: true })}
        >
          <Eye className="h-3.5 w-3.5" />
          Ko‘zgular {controls.mirrorsChecked ? '✓' : ''}
        </Button>

        <Button
          type="button"
          size="sm"
          variant={controls.handbrake ? 'destructive' : 'outline'}
          onClick={() => setControls({ handbrake: !controls.handbrake })}
        >
          <Disc className="h-3.5 w-3.5" />
          Qo‘l tormozi: {controls.handbrake ? 'TORTILGAN' : 'Tushirilgan'} (H)
        </Button>

        <Button
          type="button"
          size="sm"
          variant={controls.leftIndicator ? 'default' : 'outline'}
          onClick={() =>
            setControls({ leftIndicator: !controls.leftIndicator, rightIndicator: false })
          }
          aria-label="Chap burilish ko‘rsatkichi"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Q
        </Button>

        <Button
          type="button"
          size="sm"
          variant={controls.rightIndicator ? 'default' : 'outline'}
          onClick={() =>
            setControls({ rightIndicator: !controls.rightIndicator, leftIndicator: false })
          }
          aria-label="O‘ng burilish ko‘rsatkichi"
        >
          E <ArrowRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={controls.hazardLights ? 'destructive' : 'outline'}
          onClick={() => setControls({ hazardLights: !controls.hazardLights })}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Avariya (X)
        </Button>

        <Button
          type="button"
          size="sm"
          variant={controls.headlights ? 'default' : 'outline'}
          onClick={() => setControls({ headlights: !controls.headlights })}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          Fara (L)
        </Button>
      </div>

      {clutchHint && (
        <div className="rounded-lg border border-amber-600/60 bg-amber-950/50 px-3 py-2 text-xs text-amber-200">
          {clutchHint}
        </div>
      )}

      {/* Main Driving Cockpit: Steering Wheel + Pedals + Gearbox */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        {/* Virtual Steering Wheel */}
        <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="flex w-full items-center justify-between text-xs text-slate-400">
            <span>Rul boshqaruvi (A/D)</span>
            <button
              type="button"
              onClick={() => setControls({ steeringInput: 0 })}
              className="inline-flex items-center gap-1 text-amber-400 hover:underline"
            >
              <RotateCcw className="h-3 w-3" /> Tekislash
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onPointerDown={() => setControls({ steeringInput: -1 })}
              onPointerUp={() => setControls({ steeringInput: 0 })}
              onPointerLeave={() => setControls({ steeringInput: 0 })}
              aria-label="Rulni chapga burish"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <svg
              viewBox="0 0 100 100"
              className="h-16 w-16 transition-transform duration-75"
              style={{ transform: `rotate(${wheelAngleDeg}deg)` }}
              aria-hidden="true"
            >
              <circle cx="50" cy="50" r="40" fill="none" stroke="#cbd5e1" strokeWidth="9" />
              <circle cx="50" cy="10" r="4" fill="#f59e0b" />
              <line x1="12" y1="50" x2="88" y2="50" stroke="#94a3b8" strokeWidth="7" />
              <line x1="50" y1="50" x2="50" y2="88" stroke="#94a3b8" strokeWidth="7" />
              <circle cx="50" cy="50" r="10" fill="#1e293b" stroke="#64748b" strokeWidth="3" />
            </svg>
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onPointerDown={() => setControls({ steeringInput: 1 })}
              onPointerUp={() => setControls({ steeringInput: 0 })}
              onPointerLeave={() => setControls({ steeringInput: 0 })}
              aria-label="Rulni o‘ngga burish"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.05}
            value={controls.steeringInput}
            onChange={(e) => setControls({ steeringInput: Number(e.target.value) })}
            className="w-full accent-amber-500"
            aria-label="Rul burchagi"
          />
        </div>

        {/* Pedals: Clutch, Brake, Throttle */}
        <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="text-xs text-slate-400">
            Pedallar ({transmission === 'manual' ? 'Mexanik' : 'Avtomat'})
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Clutch */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={transmission === 'automatic'}
                onPointerDown={() => setControls({ clutch: 1 })}
                onClick={() =>
                  setControls({ clutch: controls.clutch > 0.5 ? 0 : 1 })
                }
                className={`w-full h-16 rounded-lg border text-xs font-semibold transition-colors ${
                  transmission === 'automatic'
                    ? 'border-slate-800 bg-slate-900/40 text-slate-600 cursor-not-allowed'
                    : controls.clutch > 0.5
                      ? 'border-sky-400 bg-sky-900/60 text-sky-100'
                      : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                Ilashish
                <div className="text-[10px] opacity-75">
                  {transmission === 'automatic' ? 'Avto' : `${Math.round(controls.clutch * 100)}%`}
                </div>
              </button>
              {transmission === 'manual' && (
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={controls.clutch}
                  onChange={(e) => setControls({ clutch: Number(e.target.value) })}
                  className="w-full accent-sky-400"
                  aria-label="Ilashish pedali"
                />
              )}
            </div>

            {/* Brake */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onPointerDown={() => setControls({ brake: 0.95 })}
                onPointerUp={() => setControls({ brake: 0 })}
                onPointerLeave={() => setControls({ brake: 0 })}
                className={`w-full h-16 rounded-lg border text-xs font-semibold transition-colors ${
                  controls.brake > 0.2
                    ? 'border-red-400 bg-red-800/70 text-white'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                Tormoz
                <div className="text-[10px] opacity-75">Space / S</div>
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={controls.brake}
                onChange={(e) => setControls({ brake: Number(e.target.value) })}
                className="w-full accent-red-500"
                aria-label="Tormoz pedali"
              />
            </div>

            {/* Throttle */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onPointerDown={() => setControls({ throttle: 0.75, clutch: transmission === 'manual' && controls.clutch > 0.7 ? 0.15 : controls.clutch })}
                onPointerUp={() => setControls({ throttle: 0 })}
                onPointerLeave={() => setControls({ throttle: 0 })}
                className={`w-full h-16 rounded-lg border text-xs font-semibold transition-colors ${
                  controls.throttle > 0.1
                    ? 'border-emerald-400 bg-emerald-800/70 text-white'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                Gaz
                <div className="text-[10px] opacity-75">W / ↑</div>
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={controls.throttle}
                onChange={(e) => setControls({ throttle: Number(e.target.value) })}
                className="w-full accent-emerald-500"
                aria-label="Gaz pedali"
              />
            </div>
          </div>
        </div>

        {/* Gearbox */}
        <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Uzatma qutisi</span>
            <span className="font-mono text-amber-400">Joriy: {controls.gear}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {GEARS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleGearClick(g)}
                className={`h-9 rounded-md border text-xs font-bold transition-colors ${
                  controls.gear === g
                    ? 'border-amber-400 bg-amber-500 text-slate-950'
                    : 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {/* Clearances & Slope */}
          {lastCollisionReport && (
            <div className="mt-1 grid grid-cols-4 gap-1 text-[10px] text-slate-400">
              <span>Old: {lastCollisionReport.clearancesMeters.front ?? '—'}m</span>
              <span>Orqa: {lastCollisionReport.clearancesMeters.rear ?? '—'}m</span>
              <span>Chap: {lastCollisionReport.clearancesMeters.left ?? '—'}m</span>
              <span>O‘ng: {lastCollisionReport.clearancesMeters.right ?? '—'}m</span>
            </div>
          )}
          {vehicle.onSlopeGrade > 0 && (
            <div className="text-[11px] text-amber-300">
              Estakada qiyaligi: {(vehicle.onSlopeGrade * 100).toFixed(0)}% • Orqaga ketish:{' '}
              {Math.round(vehicle.rollbackDistanceMeters * 100)} sm
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
