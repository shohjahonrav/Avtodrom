import { z } from 'zod';

export const MetadataTagSchema = z.object({
  source: z.string().min(1),
  verifiedAt: z.string().min(1),
  isOfficial: z.boolean(),
  note: z.string().optional(),
});

export const Point2DSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
});

export const LineSegment2DSchema = z.object({
  id: z.string().min(1),
  start: Point2DSchema,
  end: Point2DSchema,
  markingCode: z.enum(['1.1', '1.4', '1.5', '1.12', 'dashed-yellow', 'curb', 'barrier']),
  widthMeters: z.number().positive().max(2),
  label: z.string().optional(),
  isSensorBoundary: z.boolean().optional(),
});

export const ConeObstacleSchema = z.object({
  id: z.string().min(1),
  position: Point2DSchema,
  radiusMeters: z.number().positive().max(1.5),
  heightMeters: z.number().positive().optional(),
});

export const BarrierObstacleSchema = z.object({
  id: z.string().min(1),
  points: z.array(Point2DSchema).min(2),
  thicknessMeters: z.number().positive().max(3),
  kind: z.enum(['estakada_guard', 'parked_car', 'box_wall', 'curb_wall', 'rail_barrier']),
  label: z.string().optional(),
});

export const SensorZoneSchema = z.object({
  id: z.string().min(1),
  kind: z.enum([
    'start_line',
    'stop_line',
    'finish_line',
    'exercise_entry',
    'exercise_exit',
    'pedestrian_zone',
    'estakada_climb',
    'estakada_stop_box',
    'estakada_descent',
    'intersection_box',
    'parking_bay',
    'reverse_box_bay',
    'railway_tracks',
    'speed_limit_zone',
    'emergency_trigger_zone',
  ]),
  polygon: z.array(Point2DSchema).min(3),
  headingRad: z.number().optional(),
  targetSpeedMaxKmh: z.number().positive().optional(),
  targetSpeedMinKmh: z.number().nonnegative().optional(),
  label: z.string().optional(),
});

export const ExerciseConfigSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1).max(12),
  slug: z.enum([
    'start',
    'pedestrian-crossing',
    'estakada',
    'turn-90',
    'reverse-box',
    'regulated-intersection',
    'slalom',
    'parallel-parking',
    'railway-crossing',
    'acceleration-lane',
    'emergency-stop',
    'finish',
  ]),
  category: z.array(z.enum(['B', 'A', 'A1', 'C', 'D', 'BE', 'CE', 'DE'])).min(1),
  title: z.string().min(2),
  shortTitle: z.string().min(2),
  purpose: z.string().min(5),
  description: z.string().min(5),
  steps: z
    .array(
      z.object({
        order: z.number().int().positive(),
        title: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .min(1),
  tips: z.array(z.string().min(1)).min(1),
  commonMistakes: z.array(z.string().min(1)).min(1),
  trackedEvents: z.array(z.string().min(1)).min(1),
  requiredPrepChecklist: z.boolean().optional(),
  requiresFinishShutdown: z.boolean().optional(),
  maxReverseMoves: z.number().int().positive().optional(),
  maxReverseMovesMetadata: MetadataTagSchema.optional(),
  speedLimitKmh: z.number().positive().optional(),
  speedLimitMetadata: MetadataTagSchema.optional(),
  geometry: z.object({
    bounds: z.object({
      minX: z.number(),
      minY: z.number(),
      maxX: z.number(),
      maxY: z.number(),
    }),
    startPose: z.object({
      x: z.number(),
      y: z.number(),
      headingDeg: z.number(),
    }),
    directionArrows: z.array(
      z.object({
        x: z.number(),
        y: z.number(),
        headingDeg: z.number(),
      })
    ),
    lines: z.array(LineSegment2DSchema),
    cones: z.array(ConeObstacleSchema),
    barriers: z.array(BarrierObstacleSchema),
    zones: z.array(SensorZoneSchema).min(1),
    signs: z.array(
      z.object({
        id: z.string(),
        signCode: z.string(),
        position: Point2DSchema,
        rotationDeg: z.number().optional(),
        label: z.string(),
      })
    ),
    geometryMetadata: MetadataTagSchema,
  }),
  worldOffset: Point2DSchema,
  orderMetadata: MetadataTagSchema,
});

export const VehicleDimensionsSchema = z.object({
  lengthMeters: z.number().min(2.5).max(12),
  widthMeters: z.number().min(1.2).max(2.8),
  wheelbaseMeters: z.number().min(1.6).max(8),
  frontOverhangMeters: z.number().min(0.3).max(2.5),
  rearOverhangMeters: z.number().min(0.3).max(3.0),
  maxSteeringAngleDeg: z.number().min(20).max(50),
  metadata: MetadataTagSchema,
});

export const AdminScoringConfigSchema = z.object({
  enableCustomScoring: z.boolean(),
  startingScore: z.number().min(10).max(1000),
  passThresholdScore: z.number().min(0).max(1000),
  warningPenalty: z.number().min(0).max(100),
  seriousPenalty: z.number().min(0).max(100),
  failOnSafetyCritical: z.boolean(),
  customTimeLimitSec: z.number().positive().nullable(),
  maxAllowedStalls: z.number().int().nonnegative().nullable(),
  maxReverseMovesInBox: z.number().int().min(1).max(10),
  estakadaRollbackLimitCm: z.number().min(5).max(100),
  estakadaSlopePercent: z.number().min(10).max(16),
  speedLimitAutodromeKmh: z.number().min(5).max(60),
  difficulty: z.enum(['training', 'standard', 'strict']),
  vehiclePreset: z.literal('standard_sedan_b'),
  vehicleDimensions: VehicleDimensionsSchema,
  metadata: MetadataTagSchema,
});
