import type { Gear3D } from '@/types/simulator3d';

export interface InputActionCallbacks {
  onGearRequest: (gear: Gear3D) => void;
  onCameraCycle: () => void;
  onFreeCamera: () => void;
  onPauseToggle: () => void;
  onResetVehicle: () => void;
  onToggleIgnition: () => void;
  onToggleHandbrake: () => void;
  onToggleLeftIndicator: () => void;
  onToggleRightIndicator: () => void;
  onToggleHazard: () => void;
  onToggleHeadlights: () => void;
}

export interface ContinuousInputState {
  throttle: number;
  brake: number;
  steerLeft: boolean;
  steerRight: boolean;
  clutch: number;
}

const PREVENT_SCROLL_CODES = new Set([
  'Space',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
]);

export class VehicleInputManager {
  private held = new Set<string>();
  private callbacks: InputActionCallbacks;
  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  private boundBlur: () => void;
  private boundVisibility: () => void;

  constructor(callbacks: InputActionCallbacks) {
    this.callbacks = callbacks;

    this.boundKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        return;
      }

      if (PREVENT_SCROLL_CODES.has(e.code)) {
        e.preventDefault();
      }

      const wasHeld = this.held.has(e.code);
      this.held.add(e.code);

      if (wasHeld) return; // Fire discrete toggles/gears once per keydown

      switch (e.code) {
        case 'Digit1':
          this.callbacks.onGearRequest('1');
          break;
        case 'Digit2':
          this.callbacks.onGearRequest('2');
          break;
        case 'Digit3':
          this.callbacks.onGearRequest('3');
          break;
        case 'Digit4':
          this.callbacks.onGearRequest('4');
          break;
        case 'Digit5':
          this.callbacks.onGearRequest('5');
          break;
        case 'KeyR':
          this.callbacks.onGearRequest('R');
          break;
        case 'KeyN':
          this.callbacks.onGearRequest('N');
          break;
        case 'Space':
          this.callbacks.onToggleHandbrake();
          break;
        case 'KeyC':
          this.callbacks.onCameraCycle();
          break;
        case 'KeyV':
          this.callbacks.onFreeCamera();
          break;
        case 'KeyP':
          this.callbacks.onPauseToggle();
          break;
        case 'Backspace':
          e.preventDefault();
          this.callbacks.onResetVehicle();
          break;
        case 'KeyI':
          this.callbacks.onToggleIgnition();
          break;
        case 'KeyQ':
          this.callbacks.onToggleLeftIndicator();
          break;
        case 'KeyE':
          this.callbacks.onToggleRightIndicator();
          break;
        case 'KeyX':
          this.callbacks.onToggleHazard();
          break;
        case 'KeyL':
          this.callbacks.onToggleHeadlights();
          break;
      }
    };

    this.boundKeyUp = (e: KeyboardEvent) => {
      this.held.delete(e.code);
    };

    this.boundBlur = () => {
      this.held.clear();
    };

    this.boundVisibility = () => {
      if (document.hidden) this.held.clear();
    };
  }

  attach(): void {
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
    window.addEventListener('blur', this.boundBlur);
    document.addEventListener('visibilitychange', this.boundVisibility);
  }

  detach(): void {
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
    window.removeEventListener('blur', this.boundBlur);
    document.removeEventListener('visibilitychange', this.boundVisibility);
    this.held.clear();
  }

  clearAll(): void {
    this.held.clear();
  }

  getContinuousState(): ContinuousInputState {
    const throttle = this.held.has('KeyW') || this.held.has('ArrowUp') ? 1 : 0;
    const brake = this.held.has('KeyS') || this.held.has('ArrowDown') ? 1 : 0;
    const steerLeft = this.held.has('KeyA') || this.held.has('ArrowLeft');
    const steerRight = this.held.has('KeyD') || this.held.has('ArrowRight');
    const clutch = this.held.has('ShiftLeft') || this.held.has('ShiftRight') ? 1 : 0;
    return { throttle, brake, steerLeft, steerRight, clutch };
  }
}
