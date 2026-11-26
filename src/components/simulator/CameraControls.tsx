'use client';

import React from 'react';
import { Camera } from 'lucide-react';
import { useSimulatorStore } from '@/store/simulatorStore';
import type { CameraMode3D } from '@/types/simulator3d';

const CAMERAS: { id: CameraMode3D; label: string }[] = [
  { id: 'chase', label: 'Tashqi (C)' },
  { id: 'driver', label: 'Salon' },
  { id: 'topdown', label: 'Yuqoridan' },
  { id: 'free', label: 'Erkin (V)' },
];

export function CameraControls() {
  const cameraMode = useSimulatorStore((s) => s.cameraMode);
  const setCameraMode = useSimulatorStore((s) => s.setCameraMode);

  return (
    <div className="pointer-events-auto inline-flex items-center gap-1 rounded-xl border border-slate-700/70 bg-slate-950/85 backdrop-blur-md p-1 text-xs shadow-lg">
      <Camera className="h-3.5 w-3.5 text-amber-400 ml-1.5 mr-1 hidden sm:block" />
      {CAMERAS.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => setCameraMode(c.id)}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
            cameraMode === c.id
              ? 'bg-amber-500 text-slate-950 font-semibold'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
