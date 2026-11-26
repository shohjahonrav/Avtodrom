'use client';

import React from 'react';
import { COBALT_VEHICLE_CONFIG } from '@/config/vehicle.config';
import { useSimulatorStore } from '@/store/simulatorStore';

export function Dashboard() {
  const telemetry = useSimulatorStore((s) => s.telemetry);
  const rpmRatio = Math.min(1, telemetry.rpm / COBALT_VEHICLE_CONFIG.maxRpm);
  const steerWheelDeg = telemetry.steeringInput * 380;

  return (
    <div
      className="pointer-events-auto flex flex-wrap items-end gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/85 backdrop-blur-md px-4 py-3 text-slate-100 shadow-xl"
      aria-label="Avtomobil boshqaruv paneli"
    >
      {/* Speedometer & Gear */}
      <div className="flex items-center gap-3 pr-3 border-r border-slate-800">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Tezlik</div>
          <div className="text-3xl font-black tabular-nums leading-none text-white">
            {telemetry.speedKmh.toFixed(0)}
            <span className="ml-1 text-xs font-medium text-slate-400">km/s</span>
          </div>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/60 bg-amber-500/15 text-xl font-black text-amber-400">
          {telemetry.gear}
        </div>
      </div>

      {/* RPM & Engine Status */}
      <div className="min-w-[135px] space-y-1 pr-3 border-r border-slate-800">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">RPM: {telemetry.rpm}</span>
          <span
            className={`font-semibold ${
              telemetry.stalled
                ? 'text-red-400'
                : telemetry.engineRunning
                  ? 'text-emerald-400'
                  : 'text-slate-500'
            }`}
          >
            {telemetry.stalled ? 'O‘CHDI!' : telemetry.engineRunning ? 'YONIQ' : 'O‘CHIQ'}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              rpmRatio > 0.85 ? 'bg-red-500' : rpmRatio > 0.6 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${Math.round(rpmRatio * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>
            Qo‘l tormozi:{' '}
            <strong className={telemetry.handbrake ? 'text-red-400' : 'text-emerald-400'}>
              {telemetry.handbrake ? 'TOR' : 'BO‘SH'}
            </strong>
          </span>
          <span>
            {telemetry.leftIndicator && '◀ '}
            {telemetry.hazardLights && '⚠ '}
            {telemetry.rightIndicator && '▶'}
          </span>
        </div>
      </div>

      {/* Pedals: Clutch, Brake, Throttle */}
      <div className="flex items-end gap-2 pr-3 border-r border-slate-800">
        {[
          { label: 'Ilash', val: telemetry.clutch, color: 'bg-sky-400' },
          { label: 'Tormoz', val: telemetry.brake, color: 'bg-red-500' },
          { label: 'Gaz', val: telemetry.throttle, color: 'bg-emerald-400' },
        ].map((p) => (
          <div key={p.label} className="flex flex-col items-center gap-1">
            <div className="h-10 w-3 rounded-full bg-slate-800 overflow-hidden flex flex-col justify-end">
              <div
                className={`w-full ${p.color}`}
                style={{ height: `${Math.round(p.val * 100)}%` }}
              />
            </div>
            <span className="text-[9px] text-slate-400">{p.label}</span>
          </div>
        ))}
      </div>

      {/* Steering Direction */}
      <div className="flex flex-col items-center gap-0.5">
        <svg
          viewBox="0 0 60 60"
          className="h-9 w-9"
          style={{ transform: `rotate(${-steerWheelDeg}deg)` }}
          aria-hidden="true"
        >
          <circle cx="30" cy="30" r="22" fill="none" stroke="#cbd5e1" strokeWidth="5" />
          <circle cx="30" cy="8" r="3" fill="#f59e0b" />
          <line x1="10" y1="30" x2="50" y2="30" stroke="#94a3b8" strokeWidth="4" />
          <line x1="30" y1="30" x2="30" y2="50" stroke="#94a3b8" strokeWidth="4" />
        </svg>
        <span className="text-[10px] font-mono text-slate-400">
          {telemetry.steeringAngleDeg.toFixed(0)}°
        </span>
      </div>
    </div>
  );
}
