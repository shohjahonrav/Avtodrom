export const PHYSICS_CONFIG = {
  fixedTimestep: 1 / 60,
  maxAccumulatorSec: 0.1,
  gravity: { x: 0, y: -9.81, z: 0 },
  chassisHalfExtents: { x: 0.87, y: 0.36, z: 2.15 },
  chassisColliderOffsetY: 0.08,
} as const;
