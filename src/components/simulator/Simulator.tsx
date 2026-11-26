'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import { COBALT_VEHICLE_CONFIG } from '@/config/vehicle.config';
import { SimulatorCanvas } from '@/components/simulator/SimulatorCanvas';
import { SimulatorHUD } from '@/components/simulator/SimulatorHUD';
import { ExamManager } from '@/features/examination/ExamManager';
import { VehicleController } from '@/features/vehicle/VehicleController';
import { VehicleInputManager } from '@/features/vehicle/VehicleInput';
import { PhysicsWorld } from '@/physics/PhysicsWorld';
import { useSimulatorStore } from '@/store/simulatorStore';
import type { ExamExerciseId } from '@/types/simulator3d';

interface EngineRuntime {
  physicsWorld: PhysicsWorld;
  controller: VehicleController;
  inputManager: VehicleInputManager;
  examManager: ExamManager;
}

export function Simulator() {
  const [runtime, setRuntime] = useState<EngineRuntime | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runtimeRef = useRef<EngineRuntime | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHint = useCallback((msg: string) => {
    useSimulatorStore.getState().setStatusHint(msg);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      useSimulatorStore.getState().setStatusHint(null);
    }, 3200);
  }, []);

  const handleReset = useCallback(() => {
    const rt = runtimeRef.current;
    if (!rt) return;
    rt.controller.reset(EXAM_EXERCISES_ORDER[0].spawnPose);
    rt.physicsWorld.resetCones();
    rt.examManager.reset();
    useSimulatorStore.getState().resetExamState();
    useSimulatorStore.getState().setTelemetry(rt.controller.getTelemetry());
    showHint('Avtomobil START nuqtasiga qaytarildi (Qo‘l tormozi tortilgan).');
  }, [showHint]);

  const handleTeleportToExercise = useCallback(
    (id: ExamExerciseId) => {
      const rt = runtimeRef.current;
      const spec = EXAM_EXERCISES_ORDER.find((e) => e.id === id);
      if (!rt || !spec) return;
      rt.controller.reset(spec.spawnPose);
      useSimulatorStore.getState().setTelemetry(rt.controller.getTelemetry());
      showHint(`${spec.title} nuqtasiga o‘tildi.`);
    },
    [showHint]
  );

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const pw = await PhysicsWorld.create();
        if (cancelled) {
          pw.dispose();
          return;
        }
        const spawn = EXAM_EXERCISES_ORDER[0].spawnPose;
        const ctrl = new VehicleController(
          pw,
          spawn.position,
          spawn.yawDeg,
          COBALT_VEHICLE_CONFIG
        );
        const examMgr = new ExamManager();

        const inputMgr = new VehicleInputManager({
          onGearRequest: (gear) => {
            const res = ctrl.requestGear(gear);
            if (!res.accepted && res.reason) {
              showHint(res.reason);
            }
          },
          onCameraCycle: () => useSimulatorStore.getState().cycleCameraMode(),
          onFreeCamera: () => useSimulatorStore.getState().setCameraMode('free'),
          onPauseToggle: () => {
            const s = useSimulatorStore.getState();
            s.setPaused(!s.paused);
          },
          onResetVehicle: () => handleReset(),
          onToggleIgnition: () => ctrl.toggleIgnition(),
          onToggleHandbrake: () => ctrl.toggleHandbrake(),
          onToggleLeftIndicator: () => ctrl.toggleLeftIndicator(),
          onToggleRightIndicator: () => ctrl.toggleRightIndicator(),
          onToggleHazard: () => ctrl.toggleHazardLights(),
          onToggleHeadlights: () => ctrl.toggleHeadlights(),
        });
        inputMgr.attach();

        const rt: EngineRuntime = {
          physicsWorld: pw,
          controller: ctrl,
          inputManager: inputMgr,
          examManager: examMgr,
        };
        runtimeRef.current = rt;
        setRuntime(rt);
        useSimulatorStore.getState().setTelemetry(ctrl.getTelemetry());
        showHint('Space — qo‘l tormozi • Shift + 1 — uzatma • W/A/S/D — haydash');
      } catch (err) {
        setError(err instanceof Error ? err.message : '3D fizika dvigatelini ishga tushirishda xatolik');
      }
    }

    boot();

    return () => {
      cancelled = true;
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
      runtimeRef.current?.inputManager.detach();
      runtimeRef.current?.physicsWorld.dispose();
      runtimeRef.current = null;
    };
  }, [handleReset, showHint]);

  if (error) {
    return (
      <div className="flex h-[calc(100vh-56px)] items-center justify-center bg-slate-950 p-6 text-center">
        <div className="max-w-md rounded-xl border border-red-800 bg-red-950/30 p-6 text-sm text-red-200">
          <div className="font-bold text-base mb-2">Simulyator ishga tushmadi</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-56px)] overflow-hidden bg-slate-950">
      {!runtime && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 text-slate-200 gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <p className="text-sm font-medium">3D Avtodrom va Chevrolet Cobalt yuklanmoqda...</p>
        </div>
      )}

      <SimulatorCanvas
        physicsWorld={runtime?.physicsWorld ?? null}
        controller={runtime?.controller ?? null}
        inputManager={runtime?.inputManager ?? null}
        examManager={runtime?.examManager ?? null}
      />

      <SimulatorHUD
        onReset={handleReset}
        onTeleportToExercise={handleTeleportToExercise}
      />
    </div>
  );
}
