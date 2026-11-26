import { CUSTOM_TRAINING_META } from '@/lib/constants/regulations';
import type { VehiclePhysicsConfig } from '@/types/simulator3d';

/**
 * Calibrated physics baseline for Chevrolet Cobalt LTZ 2014 (FWD, 1.5L manual 5-speed).
 * Model file: public/models/cobalt.glb
 * Measured raw GLB bounds: size [2.251, 1.798, 5.232], center [0, 0.018, 0], forward = -Z.
 * Applied modelScale = 0.855 -> length ~4.47m, body width ~1.74m (1.92m w/ mirrors), wheel radius ~0.31m.
 */
export const COBALT_VEHICLE_CONFIG: VehiclePhysicsConfig = {
  modelPath: '/models/cobalt.glb',
  modelScale: 0.855,

  // Mass & Dimensions (m, kg)
  massKg: 1320, // ~1245 kg curb + ~75 kg driver
  chassisLengthMeters: 4.47,
  chassisWidthMeters: 1.74,
  chassisHeightMeters: 1.35,
  centerOfMassOffset: [0, -0.18, -0.08], // slightly low & front-biased for FWD stability
  wheelbaseMeters: 2.74, // matched to cobalt.glb wheel centers * 0.855
  frontTrackMeters: 1.49,
  rearTrackMeters: 1.48,
  wheelRadiusMeters: 0.315,
  wheelWidthMeters: 0.21,
  wheelMassKg: 18,

  // Suspension (tuned for Rapier DynamicRayCastVehicleController, 60 Hz)
  suspensionRestLengthMeters: 0.28,
  suspensionMaxTravelMeters: 0.16,
  suspensionStiffness: 42,
  suspensionCompression: 4.8,
  suspensionRelaxation: 5.4,
  maxSuspensionForce: 14000,

  // Speed-sensitive steering (FWD passenger car)
  maxSteerAngleDeg: 34, // low-speed parking precision
  highSpeedSteerAngleDeg: 12, // high-speed stability
  steerResponseRate: 3.4, // rad-equivalent normalized/sec
  steerReturnRate: 4.5,

  // 1.5L DOHC Engine + 5-speed manual + Reverse
  idleRpm: 800,
  maxRpm: 6200,
  stallRpm: 420,
  peakTorqueNm: 141,
  engineBrakingNm: 45,
  finalDriveRatio: 4.176,
  gearRatios: {
    R: -3.308,
    N: 0,
    '1': 3.727,
    '2': 2.048,
    '3': 1.393,
    '4': 1.029,
    '5': 0.821,
  },

  // Brakes & Tire Friction
  maxBrakeForceN: 42,
  handbrakeForceN: 65,
  tireFrictionSlip: 2.8,
  sideFrictionStiffness: 1.65,
  rollingResistanceCoeff: 0.014,
  aerodynamicDragArea: 0.68,

  metadata: CUSTOM_TRAINING_META(
    'Chevrolet Cobalt LTZ 2014 FWD bazaviy o‘quv parametrlari (real o‘lchov stendi ma’lumoti emas; g‘ildirak va o‘q o‘lchamlari public/models/cobalt.glb geometriyasi bilan moslashtirilgan).'
  ),
};

/**
 * Exact raw GLB local coordinates of the 4 wheel centers (before modelScale = 0.855).
 * Extracted directly from cobalt.glb node bounding boxes:
 * - FL (sentinel.012..015): [-0.881, -0.506, -1.596]
 * - FR (sentinel.001..003 + wheel_rf_dummy): [+0.840, -0.506, -1.619]
 * - RL (sentinel.008..011): [-0.861, -0.506, +1.544]
 * - RR (sentinel.004..007): [+0.835, -0.506, +1.587]
 */
export const COBALT_GLB_WHEEL_PIVOTS = {
  fl: { x: -0.881, y: -0.506, z: -1.596 },
  fr: { x: 0.84, y: -0.506, z: -1.619 },
  rl: { x: -0.861, y: -0.506, z: 1.544 },
  rr: { x: 0.835, y: -0.506, z: 1.587 },
} as const;

export const COBALT_DRIVER_EYE_LOCAL: [number, number, number] = [-0.30, 0.38, -0.10];
