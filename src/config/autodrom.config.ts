import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import {
  AUTODROM_MARKINGS_CONFIG,
  B_LANE_CENTER_Z,
  CD_LANE_CENTER_Z,
  ESTAKADA_M3_SPEC,
  EST_CLIMB_START_X,
  PED_STOP_LINE_X,
  PED_ZEBRA_CENTER_X,
  START_LINE_X,
} from '@/config/markings';
import { CUSTOM_TRAINING_META, OFFICIAL_3494_META } from '@/lib/constants/regulations';
import type {
  AutodromeCone,
  AutodromeRoadSegment,
  AutodromeSign3D,
  AutodromeWall,
  BoundarySegment2D,
  ExamExerciseSpec,
  ExamRuleConfig,
  ExamZonePolygon,
} from '@/types/simulator3d';

const toXZ = (u: number, v: number): [number, number] => {
  const p = uvToWorld({ u, v }, MAP_DIMENSIONS);
  return [p.x, p.z];
};

const HW = MAP_DIMENSIONS.mapWidthMeters / 2;
const HL = MAP_DIMENSIONS.mapLengthMeters / 2;

const EST_RAMP_LEN = Math.hypot(ESTAKADA_M3_SPEC.rampRunMeters, ESTAKADA_M3_SPEC.heightMeters);

export const AUTODROME_ROADS: AutodromeRoadSegment[] = [
  {
    id: 'ground-asphalt',
    center: [0, -0.05, 0],
    size: [MAP_DIMENSIONS.mapWidthMeters, MAP_DIMENSIONS.mapLengthMeters],
    color: '#525862',
    hasCollider: true,
  },
  // M3 Estakada 3D Climb, Top Plateau (3.5m), and Descent across both C/D and B lanes
  {
    id: 'estakada-climb-ramp',
    center: [ESTAKADA_M3_SPEC.climbCenter[0], ESTAKADA_M3_SPEC.heightMeters / 2 - 0.05, ESTAKADA_M3_SPEC.climbCenter[1]],
    size: [EST_RAMP_LEN, ESTAKADA_M3_SPEC.widthMeters],
    rotationYDeg: 90,
    slopeRad: -ESTAKADA_M3_SPEC.slopeRad,
    color: '#475569',
    hasCollider: true,
  },
  {
    id: 'estakada-top-plateau',
    center: [ESTAKADA_M3_SPEC.plateauCenter[0], ESTAKADA_M3_SPEC.heightMeters - 0.05, ESTAKADA_M3_SPEC.plateauCenter[1]],
    size: [ESTAKADA_M3_SPEC.plateauLengthMeters, ESTAKADA_M3_SPEC.widthMeters],
    rotationYDeg: 90,
    color: '#64748b',
    hasCollider: true,
  },
  {
    id: 'estakada-descent-ramp',
    center: [ESTAKADA_M3_SPEC.descentCenter[0], ESTAKADA_M3_SPEC.heightMeters / 2 - 0.05, ESTAKADA_M3_SPEC.descentCenter[1]],
    size: [EST_RAMP_LEN, ESTAKADA_M3_SPEC.widthMeters],
    rotationYDeg: 90,
    slopeRad: ESTAKADA_M3_SPEC.slopeRad,
    color: '#475569',
    hasCollider: true,
  },
];

export const AUTODROME_WALLS: AutodromeWall[] = [
  // Official >= 2.0m Perimeter Fence
  { id: 'fence-north', center: [0, 1.0, -HL], size: [MAP_DIMENSIONS.mapWidthMeters, 2.0, 0.3], kind: 'fence', color: '#475569' },
  { id: 'fence-south', center: [0, 1.0, HL], size: [MAP_DIMENSIONS.mapWidthMeters, 2.0, 0.3], kind: 'fence', color: '#475569' },
  { id: 'fence-west', center: [-HW, 1.0, 0], size: [0.3, 2.0, MAP_DIMENSIONS.mapLengthMeters], kind: 'fence', color: '#475569' },
  { id: 'fence-east', center: [HW, 1.0, 0], size: [0.3, 2.0, MAP_DIMENSIONS.mapLengthMeters], kind: 'fence', color: '#475569' },
  // Estakada Protective Guard Barriers along outer edges (north of C/D & south of B)
  {
    id: 'est-guard-n',
    center: [ESTAKADA_M3_SPEC.plateauCenter[0], ESTAKADA_M3_SPEC.heightMeters / 2 + 0.2, CD_LANE_CENTER_Z - 1.62],
    size: [17.5, 0.45, 0.28],
    kind: 'estakada_guard',
    color: '#f59e0b',
  },
  {
    id: 'est-guard-s',
    center: [ESTAKADA_M3_SPEC.plateauCenter[0], ESTAKADA_M3_SPEC.heightMeters / 2 + 0.2, B_LANE_CENTER_Z + 1.62],
    size: [17.5, 0.45, 0.28],
    kind: 'estakada_guard',
    color: '#f59e0b',
  },
];

export const AUTODROME_CONES: AutodromeCone[] = [
  { id: 'cone-m6-1', position: [toXZ(0.595, 0.19)[0], 0, toXZ(0.595, 0.19)[1]], radiusMeters: 0.2, heightMeters: 0.72 },
  { id: 'cone-m6-2', position: [toXZ(0.650, 0.32)[0], 0, toXZ(0.650, 0.32)[1]], radiusMeters: 0.2, heightMeters: 0.72 },
  { id: 'cone-m6-3', position: [toXZ(0.770, 0.28)[0], 0, toXZ(0.770, 0.28)[1]], radiusMeters: 0.2, heightMeters: 0.72 },
  { id: 'cone-m6-4', position: [toXZ(0.880, 0.33)[0], 0, toXZ(0.880, 0.33)[1]], radiusMeters: 0.2, heightMeters: 0.72 },
  { id: 'cone-m11-1', position: [toXZ(0.065, 0.585)[0], 0, toXZ(0.065, 0.585)[1]], radiusMeters: 0.18, heightMeters: 0.72 },
  { id: 'cone-m11-2', position: [toXZ(0.132, 0.585)[0], 0, toXZ(0.132, 0.585)[1]], radiusMeters: 0.18, heightMeters: 0.72 },
];

// Exact 3D Road Signs as described by the user:
// - Pedestrian crossing: 5.16.2 sign + STOP (2.5) at stop line
// - Estakada: 1.14 climb sign before ramp, STOP (2.5) at top stop line, 1.13 descent sign before downhill
// - Plus 3.243 (20 km/h), 1.2 & 2.5 at M8 railway, 5.15 at M11 parking
export const AUTODROME_SIGNS_3D: AutodromeSign3D[] = [
  // Pedestrian crossing (M2): STOP + 5.16.2
  { id: 's3d-stop-m2', code: '2.5', label: 'STOP (1.12 chizig‘i)', position: [PED_STOP_LINE_X, 0, B_LANE_CENTER_Z + 1.85], rotationYDeg: -90 },
  { id: 's3d-5162-m2', code: '5.16.2', label: 'Piyodalar o‘tish joyi (5.16.2)', position: [PED_ZEBRA_CENTER_X, 0, B_LANE_CENTER_Z + 1.85], rotationYDeg: -90 },
  { id: 's3d-5161-m2', code: '5.16.1', label: 'Piyodalar o‘tish joyi (5.16.1)', position: [PED_ZEBRA_CENTER_X, 0, CD_LANE_CENTER_Z - 1.9], rotationYDeg: -90 },

  // Estakada (M3): 1.14 climb, STOP at top stop line, 1.13 descent
  { id: 's3d-114-m3', code: '1.14', label: '1.14 Tik balandlik', position: [EST_CLIMB_START_X - 2.6, 0, B_LANE_CENTER_Z + 1.9], rotationYDeg: -90 },
  { id: 's3d-stop-m3', code: '2.5', label: 'STOP (Estakada 1.12)', position: [ESTAKADA_M3_SPEC.stopLineX, ESTAKADA_M3_SPEC.heightMeters - 0.1, B_LANE_CENTER_Z + 1.9], rotationYDeg: -90 },
  { id: 's3d-113-m3', code: '1.13', label: '1.13 Tik nishablik', position: [ESTAKADA_M3_SPEC.plateauCenter[0] + 1.6, ESTAKADA_M3_SPEC.heightMeters, B_LANE_CENTER_Z + 1.9], rotationYDeg: -90 },

  // Speed limit & other exercises
  { id: 's3d-3243-start', code: '3.243', label: '20 km/soat', position: [START_LINE_X + 2.5, 0, B_LANE_CENTER_Z + 1.85], rotationYDeg: -90 },
  { id: 's3d-12-m8', code: '1.2', label: 'Temir yo‘l kesishmasi', position: [toXZ(0.992, 0.30)[0], 0, toXZ(0.992, 0.30)[1]], rotationYDeg: 180 },
  { id: 's3d-25-m8', code: '2.5', label: 'STOP', position: [toXZ(0.992, 0.258)[0], 0, toXZ(0.992, 0.258)[1]], rotationYDeg: 180 },
  { id: 's3d-515-m11', code: '5.15', label: 'Parkovka', position: [toXZ(0.10, 0.54)[0], 0, toXZ(0.10, 0.54)[1]], rotationYDeg: 0 },
  { id: 's3d-3243-m9', code: '3.243', label: '20 km/soat', position: [toXZ(0.80, 0.01)[0], 0, toXZ(0.80, 0.01)[1]], rotationYDeg: -90 },
];

export const AUTODROME_BOUNDARY_SEGMENTS: BoundarySegment2D[] = AUTODROM_MARKINGS_CONFIG
  .filter((m) => m.kind === 'solid_white' || m.kind === 'bay_yellow_border')
  .map((m) => {
    const a = uvToWorld(m.startUV, MAP_DIMENSIONS);
    const b = uvToWorld(m.endUV, MAP_DIMENSIONS);
    return {
      id: m.id,
      exerciseId: 'start',
      a: [a.x, a.z],
      b: [b.x, b.z],
      halfWidthMeters: m.widthMeters / 2 + 0.05,
    };
  });

export const AUTODROME_ZONES: ExamZonePolygon[] = [
  // M2 Pedestrian Stop Line + Zebra
  { id: 'z-ped-stop', exerciseId: 'pedestrian-crossing', kind: 'stop_line', center: [PED_STOP_LINE_X, B_LANE_CENTER_Z], size: [1.8, 3.2], rotationYDeg: 0, requiresFullStop: true },
  { id: 'z-ped-zebra', exerciseId: 'pedestrian-crossing', kind: 'pedestrian_zebra', center: [PED_ZEBRA_CENTER_X, B_LANE_CENTER_Z], size: [2.4, 3.2], rotationYDeg: 0 },
  // M3 Estakada Stop Line
  { id: 'z-est-stop', exerciseId: 'estakada', kind: 'stop_line', center: [ESTAKADA_M3_SPEC.stopLineX - 0.5, B_LANE_CENTER_Z], size: [2.2, 3.0], rotationYDeg: 0, requiresFullStop: true },
  // M5 Central Intersection
  { id: 'z-int-stop', exerciseId: 'regulated-intersection', kind: 'stop_line', center: toXZ(0.550, 0.480), size: [2.2, 3.0], rotationYDeg: 0, requiresFullStop: true },
  { id: 'z-int-box', exerciseId: 'regulated-intersection', kind: 'intersection', center: toXZ(0.498, 0.498), size: [6.0, 5.8], rotationYDeg: 0 },
  // M7 Reverse Box (T-bay upper-left)
  { id: 'z-box-bay', exerciseId: 'reverse-box', kind: 'reverse_box', center: toXZ(0.100, 0.198), size: [4.2, 3.6], rotationYDeg: 0, requiresFullFit: true },
  // M8 Eastern Railway Crossing
  { id: 'z-rw-stop', exerciseId: 'railway-crossing', kind: 'stop_line', center: toXZ(0.968, 0.268), size: [5.2, 2.2], rotationYDeg: 0, requiresFullStop: true },
  { id: 'z-rw-tracks', exerciseId: 'railway-crossing', kind: 'railway_tracks', center: toXZ(0.968, 0.222), size: [5.6, 2.4], rotationYDeg: 0 },
  // M9 Northern Speed Limit
  { id: 'z-acc-speed', exerciseId: 'acceleration-lane', kind: 'speed_limit', center: toXZ(0.65, 0.042), size: [35.0, 4.8], rotationYDeg: 0, maxSpeedKmh: 20 },
  // M10 Western Emergency Stop
  { id: 'z-em-zone', exerciseId: 'emergency-stop', kind: 'emergency_zone', center: toXZ(0.028, 0.244), size: [4.8, 10.0], rotationYDeg: 0 },
  // M11 Parallel Parking Bay #1
  { id: 'z-pp-bay', exerciseId: 'parallel-parking', kind: 'parking_bay', center: toXZ(0.098, 0.596), size: [6.8, 2.6], rotationYDeg: 0, requiresFullFit: true },
  // M12 Finish Box
  { id: 'z-fin-box', exerciseId: 'finish', kind: 'finish_box', center: toXZ(0.115, 0.730), size: [5.0, 4.5], rotationYDeg: 0, requiresFullStop: true },
];

export const EXAM_EXERCISES_ORDER: ExamExerciseSpec[] = [
  {
    id: 'start',
    order: 1,
    title: 'M1. Harakatni boshlash — START (B tasmasi)',
    objective: 'O‘ng (B) tasmadan START chizig‘i oldidan qo‘zg‘aling (chap tasma C/D uchun).',
    checkpointCenter: [START_LINE_X + 2.0, 0, B_LANE_CENTER_Z],
    checkpointRadiusMeters: 2.6,
    // Spawn right before the START line (front bumper ~0.3m before line)
    spawnPose: { position: [START_LINE_X - 2.6, 0.38, B_LANE_CENTER_Z], yawDeg: -90 },
    speedLimitKmh: 20,
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'pedestrian-crossing',
    order: 2,
    title: 'M2. Piyodalar o‘tish joyi (5.16.2 + STOP)',
    objective: 'STARTdan 9–10 m naridagi zebra oldida STOP chizig‘ida to‘xtang, piyodaga yo‘l berib o‘ting.',
    checkpointCenter: [PED_ZEBRA_CENTER_X + 2.5, 0, B_LANE_CENTER_Z],
    checkpointRadiusMeters: 2.6,
    spawnPose: { position: [START_LINE_X + 1.0, 0.38, B_LANE_CENTER_Z], yawDeg: -90 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'estakada',
    order: 3,
    title: 'M3. Estakada (1.14 → STOP 1.12 → 3.5m tepalik → 1.13)',
    objective: '1.14 belgisidan chiqib STOP chizig‘ida to‘xtang, orqaga ketmay 3.5 m tekislikdan 1.13 bo‘ylab tushing.',
    checkpointCenter: [ESTAKADA_M3_SPEC.descentCenter[0] + 5.0, 0, B_LANE_CENTER_Z],
    checkpointRadiusMeters: 2.8,
    spawnPose: { position: [EST_CLIMB_START_X - 4.5, 0.38, B_LANE_CENTER_Z], yawDeg: -90 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'turn-90',
    order: 4,
    title: 'M4. 90° burchak ostida burilishlar',
    objective: 'Janubiy-sharqiy pog‘onali M4 yo‘lakchalaridan chiziqlarni bosmay o‘ting.',
    checkpointCenter: [toXZ(0.54, 0.840)[0], 0, toXZ(0.54, 0.840)[1]],
    checkpointRadiusMeters: 3.0,
    spawnPose: { position: [toXZ(0.95, 0.580)[0], 0.38, toXZ(0.95, 0.580)[1]], yawDeg: 90 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'regulated-intersection',
    order: 5,
    title: 'M5. Tartibga solingan chorraha (svetofor)',
    objective: 'Markaziy M5 chorrahasida svetofor va 4 tomonlama zebraga amal qilib o‘ting.',
    checkpointCenter: [toXZ(0.42, 0.480)[0], 0, toXZ(0.42, 0.480)[1]],
    checkpointRadiusMeters: 3.0,
    spawnPose: { position: [toXZ(0.58, 0.480)[0], 0.38, toXZ(0.58, 0.480)[1]], yawDeg: 90 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'slalom',
    order: 6,
    title: 'M6. Ilon izi (egri yo‘lak)',
    objective: 'Shimoliy-sharqiy M6 egri yo‘laklaridan konuslar va bordyurga tegmay o‘ting.',
    checkpointCenter: [toXZ(0.635, 0.075)[0], 0, toXZ(0.635, 0.075)[1]],
    checkpointRadiusMeters: 3.2,
    spawnPose: { position: [toXZ(0.680, 0.460)[0], 0.38, toXZ(0.680, 0.460)[1]], yawDeg: 0 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'reverse-box',
    order: 7,
    title: 'M7. Tor joyda qayrilib olish (Boks)',
    objective: 'Shimoliy-g‘arbiy M7 yo‘lagidan orqaga T-boks ichiga kiring va chiqing.',
    checkpointCenter: [toXZ(0.140, 0.42)[0], 0, toXZ(0.140, 0.42)[1]],
    checkpointRadiusMeters: 3.0,
    spawnPose: { position: [toXZ(0.140, 0.46)[0], 0.38, toXZ(0.140, 0.46)[1]], yawDeg: 0 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'railway-crossing',
    order: 8,
    title: 'M8. Temir yo‘l kesishmasi',
    objective: 'Sharqiy perimetrda M8 stop chizig‘ida to‘xtab poyezdni o‘tkazing.',
    checkpointCenter: [toXZ(0.968, 0.14)[0], 0, toXZ(0.968, 0.14)[1]],
    checkpointRadiusMeters: 3.0,
    spawnPose: { position: [toXZ(0.968, 0.36)[0], 0.38, toXZ(0.968, 0.36)[1]], yawDeg: 0 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'acceleration-lane',
    order: 9,
    title: 'M9. Tezlashish bo‘lagi',
    objective: 'Shimoliy perimetr bo‘ylab G‘arbga 20 km/soat cheklovidan oshirmay yuring.',
    checkpointCenter: [toXZ(0.12, 0.042)[0], 0, toXZ(0.12, 0.042)[1]],
    checkpointRadiusMeters: 3.2,
    spawnPose: { position: [toXZ(0.88, 0.042)[0], 0.38, toXZ(0.88, 0.042)[1]], yawDeg: 90 },
    speedLimitKmh: 20,
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'emergency-stop',
    order: 10,
    title: 'M10. Avariya holatida to‘xtash',
    objective: 'G‘arbiy perimetrda M10 signali berilganda to‘xtang va avariya chiroqlarini (X) yoqing.',
    checkpointCenter: [toXZ(0.028, 0.42)[0], 0, toXZ(0.028, 0.42)[1]],
    checkpointRadiusMeters: 3.0,
    spawnPose: { position: [toXZ(0.028, 0.10)[0], 0.38, toXZ(0.028, 0.10)[1]], yawDeg: 180 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'parallel-parking',
    order: 11,
    title: 'M11. Parallel parkovka',
    objective: 'Janubiy-g‘arbiy oroldagi M11 cho‘ntaklaridan biriga orqa bilan parallel joylashing.',
    checkpointCenter: [toXZ(0.20, 0.56)[0], 0, toXZ(0.20, 0.56)[1]],
    checkpointRadiusMeters: 3.0,
    spawnPose: { position: [toXZ(0.06, 0.56)[0], 0.38, toXZ(0.06, 0.56)[1]], yawDeg: -90 },
    metadata: OFFICIAL_3494_META,
  },
  {
    id: 'finish',
    order: 12,
    title: 'M12. Harakatni yakunlash — FINISH',
    objective: 'M12 chizig‘ida to‘xtang, uzatmani N ga oling, qo‘l tormozini tortib dvigatelni o‘chiring.',
    checkpointCenter: [toXZ(0.115, 0.730)[0], 0, toXZ(0.115, 0.730)[1]],
    checkpointRadiusMeters: 3.2,
    spawnPose: { position: [toXZ(0.32, 0.730)[0], 0.38, toXZ(0.32, 0.730)[1]], yawDeg: 90 },
    metadata: OFFICIAL_3494_META,
  },
];

export const DEFAULT_EXAM_RULES_3D: ExamRuleConfig = {
  enablePointsScoring: false,
  initialPoints: 100,
  passThresholdPoints: 80,
  boundaryCrossPenalty: 10,
  coneCollisionPenalty: 15,
  wallCollisionPenalty: 25,
  stopLineFailPenalty: 15,
  redLightPenalty: 30,
  pedestrianFailPenalty: 30,
  speedViolationPenalty: 10,
  wrongOrderPenalty: 15,
  parkingFailPenalty: 20,
  stallPenalty: 5,
  timeLimitSeconds: null,
  metadata: CUSTOM_TRAINING_META(
    'Ushbu ball va jarimalar rasmiy davlat me’yori emas (imtihon markazi reglamentiga bog‘liq); sukut bo‘yicha faqat qayd etilgan xatolar ko‘rsatiladi.'
  ),
};
