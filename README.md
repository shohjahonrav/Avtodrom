# AVTODROM 3D — O‘zbekiston haydovchilik amaliy imtihoni simulyatori

Browser-based **3D driving examination autodrom simulator** built with **Next.js, TypeScript, Three.js, React Three Fiber, Drei, Rapier3D (`@dimforge/rapier3d-compat`), Tailwind CSS, and Zustand**, featuring the user-provided **Chevrolet Cobalt LTZ (`public/models/cobalt.glb`)** vehicle model.

> **Disclaimer:** This is an educational driving training simulator, not an official government or exam center system. Official scoring thresholds and time limits not fixed in published norms are marked as configurable training parameters (`isOfficial: false`).

## Coordinate System & 3D Architecture

- **World Coordinates**: Right-handed `Y`-up, **1 unit = 1 meter**. Origin `(0, 0, 0)` sits at the center of the `86 m × 56 m` asphalt autodrom ground (`Y = 0`).
- **Vehicle Forward Axis**: `-Z` (matching `cobalt.glb`'s native forward orientation).
- **Fixed Physics Timestep**: `60 Hz` (`1/60 s` accumulator) powered by Rapier3D `DynamicRayCastVehicleController` (independent of rendering FPS).
- **GLB Integration**: `public/models/cobalt.glb` (meshopt-compressed) is loaded with `MeshoptDecoder`, preserving all original body, interior, glass, lights, and 4 independent wheel pivots (`FL, FR, RL, RR`) that steer, spin, and compress vertically with suspension travel.

## Controls

| Key | Action |
|---|---|
| `W` / `↑` | Accelerator |
| `S` / `↓` | Service Brake |
| `A` / `D` (or `←` / `→`) | Steer Left / Right (speed-sensitive + return to center) |
| `Shift` | Clutch Pedal (required to shift gears) |
| `1–5`, `R`, `N` | Manual Gearbox (5-speed + Reverse + Neutral) |
| `Space` | Handbrake toggle |
| `I` | Ignition (Start / Stop engine) |
| `Q` / `E` / `X` / `L` | Turn Indicators / Hazard Lights / Headlights |
| `C` / `V` | Cycle Camera (`Chase`, `Driver`, `Top-Down`, `Free Orbit`) / Free Camera |
| `P` / `Backspace` | Pause / Reset Vehicle |

## Project Structure

```text
src/
├── app/                   # Next.js App Router (3D simulator at /, plus catalogs & settings)
├── components/simulator/  # Simulator, SimulatorCanvas, SimulatorHUD, Dashboard, CameraControls, ExaminationPanel
├── config/                # vehicle.config.ts (Cobalt LTZ), autodrom.config.ts (12-exercise 3D layout)
├── features/
│   ├── autodrom/          # Autodrom, Road, Markings, Obstacles, CollisionZones, AutodromBuilder
│   ├── camera/            # CameraManager, ChaseCamera, DriverCamera, TopDownCamera
│   ├── examination/       # ExamManager, ExamRules, CheckpointSystem, ViolationDetector, ExamResults
│   └── vehicle/           # Vehicle, VehicleModel (GLB), VehicleController, Transmission, VehicleInput
├── physics/               # PhysicsWorld (Rapier3D), PhysicsConfig, CollisionManager
├── store/                 # simulatorStore.ts (Zustand)
└── types/                 # simulator3d.ts & index.ts
public/models/cobalt.glb   # Provided Chevrolet Cobalt LTZ 3D model
tests/                     # Vitest 3D physics, collision, exam & UI tests
```

## Running & Testing

```bash
npm install
npm run dev
npm test
npx tsc --noEmit
npm run lint
npm run build
```
# Avtodrom
