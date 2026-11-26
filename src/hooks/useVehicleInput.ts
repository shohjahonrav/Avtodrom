'use client';

import { useEffect, useRef } from 'react';
import { useSimulationStore } from '@/stores/useSimulationStore';
import { useAppStore } from '@/stores/useAppStore';
import type { GearPosition } from '@/types';

interface UseVehicleInputOptions {
  enabled: boolean;
  onGearShiftRejected?: () => void;
  onExerciseCompleted?: () => void;
}

export function useVehicleInput({
  enabled,
  onGearShiftRejected,
  onExerciseCompleted,
}: UseVehicleInputOptions) {
  const keysRef = useRef<Set<string>>(new Set());
  const setControls = useSimulationStore((s) => s.setControls);
  const setGear = useSimulationStore((s) => s.setGear);
  const toggleEngine = useSimulationStore((s) => s.toggleEngine);
  const tick = useSimulationStore((s) => s.tick);
  const adminConfig = useAppStore((s) => s.adminConfig);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      const code = e.code;
      keysRef.current.add(code);

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        e.preventDefault();
      }

      const snap = useSimulationStore.getState().snapshot;
      const tryGear = (g: GearPosition) => {
        if (snap.transmission === 'manual' && snap.controls.clutch < 0.55 && g !== 'N' && snap.controls.gear !== g) {
          onGearShiftRejected?.();
          return;
        }
        setGear(g);
      };

      if (code === 'Digit1') tryGear('1');
      if (code === 'Digit2') tryGear('2');
      if (code === 'Digit3') tryGear('3');
      if (code === 'Digit4') tryGear('4');
      if (code === 'Digit5') tryGear('5');
      if (code === 'KeyR') tryGear('R');
      if (code === 'KeyN') tryGear('N');

      if (code === 'KeyH') {
        setControls({ handbrake: !snap.controls.handbrake });
      }
      if (code === 'KeyI') {
        toggleEngine();
      }
      if (code === 'KeyB') {
        setControls({ seatbelt: !snap.controls.seatbelt });
      }
      if (code === 'KeyQ') {
        setControls({ leftIndicator: !snap.controls.leftIndicator, rightIndicator: false });
      }
      if (code === 'KeyE') {
        setControls({ rightIndicator: !snap.controls.rightIndicator, leftIndicator: false });
      }
      if (code === 'KeyX') {
        setControls({ hazardLights: !snap.controls.hazardLights });
      }
      if (code === 'KeyL') {
        setControls({ headlights: !snap.controls.headlights });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    const keys = keysRef.current;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      keys.clear();
    };
  }, [enabled, setControls, setGear, toggleEngine, onGearShiftRejected]);

  // Animation loop for continuous steering, pedals, gamepad, and physics tick
  useEffect(() => {
    if (!enabled) return;

    let rafId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const keys = keysRef.current;
      const snap = useSimulationStore.getState().snapshot;

      // Read keyboard continuous inputs
      const hasSteerKey =
        keys.has('KeyA') || keys.has('ArrowLeft') || keys.has('KeyD') || keys.has('ArrowRight');
      const hasThrottleKey = keys.has('KeyW') || keys.has('ArrowUp');
      const hasBrakeKey = keys.has('KeyS') || keys.has('ArrowDown') || keys.has('Space');
      const hasClutchKey = keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('KeyC');

      // Optional Gamepad support
      let gpSteer = 0;
      let gpThrottle = 0;
      let gpBrake = 0;
      let hasGamepad = false;
      if (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function') {
        const pads = navigator.getGamepads();
        const pad = pads?.[0];
        if (pad) {
          hasGamepad = true;
          gpSteer = Math.abs(pad.axes[0] ?? 0) > 0.08 ? pad.axes[0] : 0;
          gpThrottle = pad.buttons[7]?.value ?? 0;
          gpBrake = pad.buttons[6]?.value ?? 0;
        }
      }

      const patch: Partial<typeof snap.controls> = {};
      if (hasSteerKey) {
        let s = 0;
        if (keys.has('KeyA') || keys.has('ArrowLeft')) s -= 1;
        if (keys.has('KeyD') || keys.has('ArrowRight')) s += 1;
        patch.steeringInput = s;
      } else if (hasGamepad && Math.abs(gpSteer) > 0.08) {
        patch.steeringInput = gpSteer;
      } else if (snap.controls.steeringInput !== 0 && !keys.size) {
        // Gentle auto-return only if keyboard/gamepad were driving and released
      }

      if (hasThrottleKey) {
        patch.throttle = 0.78;
      } else if (hasGamepad && gpThrottle > 0.05) {
        patch.throttle = gpThrottle;
      } else if (!hasThrottleKey && snap.controls.throttle === 0.78) {
        patch.throttle = 0;
      }

      if (hasBrakeKey) {
        patch.brake = 0.9;
      } else if (hasGamepad && gpBrake > 0.05) {
        patch.brake = gpBrake;
      } else if (!hasBrakeKey && snap.controls.brake === 0.9) {
        patch.brake = 0;
      }

      if (hasClutchKey) {
        patch.clutch = 1;
      } else if (!hasClutchKey && snap.controls.clutch === 1 && snap.controls.gear !== 'N' && hasThrottleKey) {
        // Smooth bite release when driving off with keyboard
        patch.clutch = Math.max(0, snap.controls.clutch - dt * 2.2);
      }

      if (Object.keys(patch).length > 0) {
        setControls(patch);
      }

      const { exerciseJustCompleted } = tick(dt, adminConfig);
      if (exerciseJustCompleted) {
        onExerciseCompleted?.();
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [enabled, adminConfig, setControls, tick, onExerciseCompleted]);
}
