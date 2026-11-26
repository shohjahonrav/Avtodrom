import type {
  DirectionArrowConfig,
  ExerciseLabelConfig,
  RoadMarkingSegmentConfig,
  StripedChevronZoneConfig,
  UVPoint,
  ZebraCrossingConfig,
} from '@/features/autodrom/mapTypes';

const pt = (u: number, v: number): UVPoint => ({ u, v });

/**
 * Exact meter conversion helpers for 96.0m x 59.82m world:
 * - u = 0.5 + x / 96.0
 * - v = 0.5 + z / 59.82
 *
 * South corridor 2-lane layout (START -> M6 Ilon izi):
 * - Left lane (C/D category): z = +24.85m (v = 0.915), width ~3.0m
 * - Lane divider (1.5 dashed white): z = +26.40m (v = 0.941)
 * - Right lane (B category): z = +28.00m (v = 0.968), width ~3.2m
 *
 * Exact distances along B lane:
 * - START line: x = -19.0m (u = 0.3021)
 * - +9.5m (9-10m real-world spec) after START -> Pedestrian crossing (zebra center x = -9.5m, u = 0.4010)
 *   with 1.12 Stop line at x = -11.5m (u = 0.3802) + STOP & 5.16.2 signs
 * - +7.6m (7-8m spec) after Zebra end (x = -8.4 + 7.6 = -0.8m) -> Estakada climb starts at x = -0.8m
 *   - Climb: x = -0.8m -> +6.2m (7.0m run, 0 -> 0.85m, ~12.1% slope)
 *   - 1.12 Stop line on climb at x = +5.2m (u = 0.5542) + STOP sign
 *   - Top flat plateau: x = +6.2m -> +9.7m (3.5m length, 3-4m spec)
 *   - Descent: x = +9.7m -> +16.7m (7.0m run, 0.85 -> 0m) with 1.13 sign
 */
const xToU = (x: number): number => 0.5 + x / 96.0;
const zToV = (z: number): number => 0.5 + z / 59.82;

export const B_LANE_CENTER_Z = 28.0;
export const CD_LANE_CENTER_Z = 24.85;
export const LANE_DIVIDER_Z = 26.4;

export const START_LINE_X = -19.0;
export const PED_STOP_LINE_X = -11.5;
export const PED_ZEBRA_CENTER_X = -9.5; // +9.5m from START (9-10m spec; zebra -10.6..-8.4m)
export const EST_CLIMB_START_X = -0.8; // +7.6m after zebra end (-8.4m)
export const EST_CLIMB_RUN_M = 7.0;
export const EST_PLATEAU_LEN_M = 3.5; // 3-4m spec
export const EST_HEIGHT_M = 0.85; // ~12.1% slope

export const ESTAKADA_M3_SPEC = {
  climbCenter: [EST_CLIMB_START_X + EST_CLIMB_RUN_M / 2, LANE_DIVIDER_Z] as [number, number],
  plateauCenter: [EST_CLIMB_START_X + EST_CLIMB_RUN_M + EST_PLATEAU_LEN_M / 2, LANE_DIVIDER_Z] as [number, number],
  descentCenter: [EST_CLIMB_START_X + EST_CLIMB_RUN_M + EST_PLATEAU_LEN_M + EST_CLIMB_RUN_M / 2, LANE_DIVIDER_Z] as [number, number],
  rampRunMeters: EST_CLIMB_RUN_M,
  plateauLengthMeters: EST_PLATEAU_LEN_M,
  widthMeters: 6.1, // Spans both C/D (left) and B (right) lanes
  heightMeters: EST_HEIGHT_M,
  slopeRad: Math.atan2(EST_HEIGHT_M, EST_CLIMB_RUN_M),
  stopLineX: EST_CLIMB_START_X + EST_CLIMB_RUN_M - 1.0, // 1.0m before climb end (Order 3494)
};

export const SE_CORNER_CENTER = { x: 37.27, z: 19.85 };

function buildQuarterArcMarkings(
  idPrefix: string,
  cx: number,
  cz: number,
  radiusMeters: number,
  steps: number,
  widthMeters: number,
  region: RoadMarkingSegmentConfig['region']
): RoadMarkingSegmentConfig[] {
  const segs: RoadMarkingSegmentConfig[] = [];
  for (let i = 0; i < steps; i++) {
    // 90 deg (South tangent: x=cx, z=cz+R) -> 0 deg (East tangent: x=cx+R, z=cz)
    const a0 = ((90 - (90 * i) / steps) * Math.PI) / 180;
    const a1 = ((90 - (90 * (i + 1)) / steps) * Math.PI) / 180;
    segs.push({
      id: `${idPrefix}-${i}`,
      kind: 'solid_white',
      startUV: pt(xToU(cx + radiusMeters * Math.cos(a0)), zToV(cz + radiusMeters * Math.sin(a0))),
      endUV: pt(xToU(cx + radiusMeters * Math.cos(a1)), zToV(cz + radiusMeters * Math.sin(a1))),
      widthMeters,
      region,
    });
  }
  return segs;
}

export const AUTODROM_MARKINGS_CONFIG: RoadMarkingSegmentConfig[] = [
  { id: 'm-outer-n', kind: 'solid_white', startUV: pt(0.015, 0.015), endUV: pt(0.985, 0.015), widthMeters: 0.15, region: 'outer_perimeter' },
  { id: 'm-outer-s', kind: 'solid_white', startUV: pt(0.015, 0.992), endUV: pt(xToU(SE_CORNER_CENTER.x), 0.992), widthMeters: 0.15, region: 'outer_perimeter' },
  ...buildQuarterArcMarkings('m-outer-se-arc', SE_CORNER_CENTER.x, SE_CORNER_CENTER.z, 9.58, 12, 0.15, 'outer_perimeter'),
  { id: 'm-outer-w', kind: 'solid_white', startUV: pt(0.015, 0.015), endUV: pt(0.015, 0.992), widthMeters: 0.15, region: 'outer_perimeter' },
  { id: 'm-outer-e', kind: 'solid_white', startUV: pt(0.988, 0.015), endUV: pt(0.988, zToV(SE_CORNER_CENTER.z)), widthMeters: 0.15, region: 'outer_perimeter' },

  // Opposing-direction continuous solid white 1.1 / 1.3 centerlines (central roads & intersection approaches)
  { id: 'm-horiz-w-solid', kind: 'solid_white', startUV: pt(0.055, 0.498), endUV: pt(0.452, 0.498), widthMeters: 0.15, region: 'central_horizontal' },
  { id: 'm-horiz-e-solid', kind: 'solid_white', startUV: pt(0.545, 0.498), endUV: pt(0.948, 0.498), widthMeters: 0.15, region: 'central_horizontal' },
  { id: 'm-vert-n-solid', kind: 'solid_white', startUV: pt(0.498, 0.080), endUV: pt(0.498, 0.442), widthMeters: 0.15, region: 'central_intersection' },
  { id: 'm-vert-s-solid', kind: 'solid_white', startUV: pt(0.498, 0.556), endUV: pt(0.498, 0.882), widthMeters: 0.15, region: 'central_intersection' },

  // Stop lines at Central Intersection (4 approaches)
  { id: 'm-int-stop-n', kind: 'stop_line', startUV: pt(0.468, 0.442), endUV: pt(0.498, 0.442), widthMeters: 0.35, region: 'central_intersection' },
  { id: 'm-int-stop-s', kind: 'stop_line', startUV: pt(0.498, 0.556), endUV: pt(0.528, 0.556), widthMeters: 0.35, region: 'central_intersection' },
  { id: 'm-int-stop-w', kind: 'stop_line', startUV: pt(0.452, 0.498), endUV: pt(0.452, 0.535), widthMeters: 0.35, region: 'central_intersection' },
  { id: 'm-int-stop-e', kind: 'stop_line', startUV: pt(0.545, 0.462), endUV: pt(0.545, 0.498), widthMeters: 0.35, region: 'central_intersection' },

  // Continuous solid white 1.1 separator between C/D and B lanes (rounded SE left turn after Estakada -> M6)
  {
    id: 'm-2lane-south-div',
    kind: 'solid_white',
    startUV: pt(0.110, zToV(LANE_DIVIDER_Z)),
    endUV: pt(xToU(SE_CORNER_CENTER.x), zToV(LANE_DIVIDER_Z)),
    widthMeters: 0.14,
    region: 'south_center_lanes',
  },
  ...buildQuarterArcMarkings('m-2lane-se-arc', SE_CORNER_CENTER.x, SE_CORNER_CENTER.z, 6.55, 12, 0.14, 'outer_perimeter'),
  {
    id: 'm-2lane-east-solid',
    kind: 'solid_white',
    startUV: pt(xToU(SE_CORNER_CENTER.x + 6.55), zToV(SE_CORNER_CENTER.z)),
    endUV: pt(xToU(SE_CORNER_CENTER.x + 6.55), zToV(SE_CORNER_CENTER.z - 2.0)),
    widthMeters: 0.14,
    region: 'outer_perimeter',
  },
  // 2.0m after turning left from Estakada, divider becomes 1.5 dashed white and ends right before B's 90° left turn
  {
    id: 'm-2lane-east-dash',
    kind: 'dashed_white',
    startUV: pt(xToU(SE_CORNER_CENTER.x + 6.55), zToV(SE_CORNER_CENTER.z - 2.0)),
    endUV: pt(xToU(SE_CORNER_CENTER.x + 6.55), 0.612),
    widthMeters: 0.14,
    region: 'outer_perimeter',
  },

  // START (M1) transverse 0.4m line across B lane (and C/D line)
  {
    id: 'm-bot-m1-start',
    kind: 'stop_line',
    startUV: pt(xToU(START_LINE_X), zToV(23.3)),
    endUV: pt(xToU(START_LINE_X), zToV(29.5)),
    widthMeters: 0.40,
    region: 'south_center_lanes',
  },

  // Pedestrian Crossing Stop Line 1.12 (before Zebra)
  {
    id: 'm-bot-m2-stop',
    kind: 'stop_line',
    startUV: pt(xToU(PED_STOP_LINE_X), zToV(23.3)),
    endUV: pt(xToU(PED_STOP_LINE_X), zToV(29.5)),
    widthMeters: 0.40,
    region: 'south_center_lanes',
  },

  // Estakada Stop Line 1.12 on climb across both C/D and B lanes (1.0m before plateau)
  {
    id: 'm-est-stop-112',
    kind: 'stop_line',
    startUV: pt(xToU(ESTAKADA_M3_SPEC.stopLineX), zToV(CD_LANE_CENTER_Z - 1.45)),
    endUV: pt(xToU(ESTAKADA_M3_SPEC.stopLineX), zToV(B_LANE_CENTER_Z + 1.4)),
    widthMeters: 0.40,
    region: 'south_center_lanes',
    elevationY: (EST_HEIGHT_M * (EST_CLIMB_RUN_M - 1.0)) / EST_CLIMB_RUN_M + 0.025,
  },

  // FINISH (M12) horizontal road divider + finish line
  { id: 'm-sl-mid-dash', kind: 'dashed_white', startUV: pt(0.060, 0.730), endUV: pt(0.470, 0.730), widthMeters: 0.13, region: 'south_center_lanes' },
  { id: 'm-sl-m12-finish', kind: 'stop_line', startUV: pt(0.115, 0.692), endUV: pt(0.115, 0.768), widthMeters: 0.40, region: 'south_center_lanes' },

  // Railway Stop Line (M8)
  { id: 'm-rw-stop-112', kind: 'stop_line', startUV: pt(0.936, 0.258), endUV: pt(0.988, 0.258), widthMeters: 0.40, region: 'north_right_serpentine' },

  // Yellowish exercise boundary lines (M7, M11, M4)
  { id: 'm-yel-nl-1a', kind: 'bay_yellow_border', startUV: pt(0.088, 0.172), endUV: pt(0.120, 0.172), widthMeters: 0.16, region: 'north_left_complex' },
  { id: 'm-yel-nl-1b', kind: 'bay_yellow_border', startUV: pt(0.088, 0.224), endUV: pt(0.120, 0.224), widthMeters: 0.16, region: 'north_left_complex' },
  { id: 'm-yel-nl-2a', kind: 'bay_yellow_border', startUV: pt(0.208, 0.320), endUV: pt(0.246, 0.320), widthMeters: 0.16, region: 'north_left_complex' },
  { id: 'm-yel-nl-2b', kind: 'bay_yellow_border', startUV: pt(0.208, 0.376), endUV: pt(0.246, 0.376), widthMeters: 0.16, region: 'north_left_complex' },
  { id: 'm-yel-nl-3a', kind: 'bay_yellow_border', startUV: pt(0.232, 0.215), endUV: pt(0.292, 0.215), widthMeters: 0.16, region: 'north_left_complex' },
  { id: 'm-yel-nl-3b', kind: 'bay_yellow_border', startUV: pt(0.232, 0.290), endUV: pt(0.292, 0.290), widthMeters: 0.16, region: 'north_left_complex' },
  { id: 'm-yel-nl-4a', kind: 'bay_yellow_border', startUV: pt(0.406, 0.214), endUV: pt(0.444, 0.214), widthMeters: 0.16, region: 'north_left_complex' },
  { id: 'm-yel-nl-4b', kind: 'bay_yellow_border', startUV: pt(0.406, 0.262), endUV: pt(0.444, 0.262), widthMeters: 0.16, region: 'north_left_complex' },

  { id: 'm-yel-m11-1', kind: 'bay_yellow_border', startUV: pt(0.065, 0.610), endUV: pt(0.132, 0.610), widthMeters: 0.16, region: 'south_left_complex' },
  { id: 'm-yel-m11-2', kind: 'bay_yellow_border', startUV: pt(0.190, 0.610), endUV: pt(0.256, 0.610), widthMeters: 0.16, region: 'south_left_complex' },
  { id: 'm-yel-m11-3', kind: 'bay_yellow_border', startUV: pt(0.312, 0.610), endUV: pt(0.380, 0.610), widthMeters: 0.16, region: 'south_left_complex' },
  { id: 'm-yel-m11-4', kind: 'bay_yellow_border', startUV: pt(0.302, 0.644), endUV: pt(0.422, 0.644), widthMeters: 0.16, region: 'south_left_complex' },

  // M4 90° dangerous turn (B corridor: entry gate 2m before 1st turn @ u=0.7819, exit gate 2m after last turn @ u=0.7011)
  { id: 'm-yel-m4-b-in', kind: 'dashed_yellow', startUV: pt(0.7819, 0.563), endUV: pt(0.7819, 0.607), widthMeters: 0.16, region: 'south_right_complex' },
  { id: 'm-yel-m4-b-out', kind: 'dashed_yellow', startUV: pt(0.7011, 0.695), endUV: pt(0.7011, 0.743), widthMeters: 0.16, region: 'south_right_complex' },
  // Continuous solid yellow borders along BOTH edges between entry & exit gates (B corridor)
  { id: 'm-yel-m4-b-r1', kind: 'bay_yellow_border', startUV: pt(0.7819, 0.563), endUV: pt(0.724, 0.563), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-b-r2', kind: 'bay_yellow_border', startUV: pt(0.724, 0.563), endUV: pt(0.724, 0.695), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-b-r3', kind: 'bay_yellow_border', startUV: pt(0.724, 0.695), endUV: pt(0.7011, 0.695), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-b-l1', kind: 'bay_yellow_border', startUV: pt(0.7819, 0.607), endUV: pt(0.759, 0.607), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-b-l2', kind: 'bay_yellow_border', startUV: pt(0.759, 0.607), endUV: pt(0.759, 0.743), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-b-l3', kind: 'bay_yellow_border', startUV: pt(0.759, 0.743), endUV: pt(0.7011, 0.743), widthMeters: 0.14, region: 'south_right_complex' },

  // M4 90° dangerous turn (C/D corridor: entry gate 2m before 1st turn @ u=0.8548, exit gate 2m after last turn @ u=0.7672)
  { id: 'm-yel-m4-cd-in', kind: 'dashed_yellow', startUV: pt(0.8548, 0.647), endUV: pt(0.8548, 0.709), widthMeters: 0.16, region: 'south_right_complex' },
  { id: 'm-yel-m4-cd-out', kind: 'dashed_yellow', startUV: pt(0.7672, 0.819), endUV: pt(0.7672, 0.863), widthMeters: 0.16, region: 'south_right_complex' },
  // Continuous solid yellow borders along BOTH edges between entry & exit gates (C/D corridor)
  { id: 'm-yel-m4-cd-r1', kind: 'bay_yellow_border', startUV: pt(0.8548, 0.647), endUV: pt(0.790, 0.647), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-cd-r2', kind: 'bay_yellow_border', startUV: pt(0.790, 0.647), endUV: pt(0.790, 0.819), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-cd-r3', kind: 'bay_yellow_border', startUV: pt(0.790, 0.819), endUV: pt(0.7672, 0.819), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-cd-l1', kind: 'bay_yellow_border', startUV: pt(0.8548, 0.709), endUV: pt(0.832, 0.709), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-cd-l2', kind: 'bay_yellow_border', startUV: pt(0.832, 0.709), endUV: pt(0.832, 0.863), widthMeters: 0.14, region: 'south_right_complex' },
  { id: 'm-yel-m4-cd-l3', kind: 'bay_yellow_border', startUV: pt(0.832, 0.863), endUV: pt(0.7672, 0.863), widthMeters: 0.14, region: 'south_right_complex' },
];

export const AUTODROM_ZEBRAS_CONFIG: ZebraCrossingConfig[] = [
  { id: 'zebra-int-n', region: 'central_intersection', centerUV: pt(0.498, 0.456), widthMeters: 1.9, lengthMeters: 4.8, angleDeg: 90, stripeCount: 7 },
  { id: 'zebra-int-s', region: 'central_intersection', centerUV: pt(0.498, 0.542), widthMeters: 1.9, lengthMeters: 4.8, angleDeg: 90, stripeCount: 7 },
  { id: 'zebra-int-w', region: 'central_intersection', centerUV: pt(0.464, 0.498), widthMeters: 1.9, lengthMeters: 4.6, angleDeg: 0, stripeCount: 7 },
  { id: 'zebra-int-e', region: 'central_intersection', centerUV: pt(0.532, 0.498), widthMeters: 1.9, lengthMeters: 4.6, angleDeg: 0, stripeCount: 7 },
  // M2 Pedestrian Crossing (+9.5m after START, across both C/D and B lanes)
  {
    id: 'zebra-south-center',
    region: 'south_center_lanes',
    centerUV: pt(xToU(PED_ZEBRA_CENTER_X), zToV(26.4)),
    widthMeters: 2.2,
    lengthMeters: 5.8,
    angleDeg: 0,
    stripeCount: 8,
  },
];

export const AUTODROM_ARROWS_CONFIG: DirectionArrowConfig[] = [
  // North perimeter (West-bound)
  { id: 'arr-n-1', region: 'outer_perimeter', positionUV: pt(0.28, 0.042), headingDeg: 180 },
  { id: 'arr-n-2', region: 'outer_perimeter', positionUV: pt(0.84, 0.042), headingDeg: 180 },
  // West perimeter (South-bound)
  { id: 'arr-w-1', region: 'outer_perimeter', positionUV: pt(0.024, 0.36), headingDeg: 90 },
  // East perimeter 2-lane after SE turn:
  // - At C/D 90° corridor (v~0.68): C/D lane (left, u=0.938) turns LEFT; B lane (right, u=0.972) goes STRAIGHT (no straight arrow in C/D!)
  // - At B 90° corridor (v~0.585): B lane (right, u=0.972) turns LEFT
  { id: 'arr-e-cd', region: 'outer_perimeter', positionUV: pt(0.938, 0.700), headingDeg: -90, kind: 'left_turn' },
  { id: 'arr-e-b', region: 'outer_perimeter', positionUV: pt(0.972, 0.700), headingDeg: -90, kind: 'straight' },
  { id: 'arr-e-b-m4', region: 'outer_perimeter', positionUV: pt(0.972, 0.592), headingDeg: -90, kind: 'left_turn' },
  { id: 'arr-e-2', region: 'outer_perimeter', positionUV: pt(0.974, 0.12), headingDeg: -90 },
  // South 2-lane START -> M3 (C/D left lane & B right lane)
  { id: 'arr-sb-cd1', region: 'south_center_lanes', positionUV: pt(xToU(-26.5), zToV(CD_LANE_CENTER_Z)), headingDeg: 0 },
  { id: 'arr-sb-b1', region: 'south_center_lanes', positionUV: pt(xToU(-26.5), zToV(B_LANE_CENTER_Z)), headingDeg: 0 },
  { id: 'arr-sb-cd2', region: 'south_center_lanes', positionUV: pt(xToU(22), zToV(CD_LANE_CENTER_Z)), headingDeg: 0 },
  { id: 'arr-sb-b2', region: 'south_center_lanes', positionUV: pt(xToU(22), zToV(B_LANE_CENTER_Z)), headingDeg: 0 },
  // Central horizontal & M12 return
  { id: 'arr-ch-1', region: 'central_horizontal', positionUV: pt(0.18, 0.478), headingDeg: 0 },
  { id: 'arr-ch-2', region: 'central_horizontal', positionUV: pt(0.36, 0.518), headingDeg: 180 },
  { id: 'arr-ch-3', region: 'central_horizontal', positionUV: pt(0.65, 0.518), headingDeg: 0 },
  { id: 'arr-ch-4', region: 'central_horizontal', positionUV: pt(0.89, 0.518), headingDeg: 0 },
  { id: 'arr-sh-1', region: 'south_center_lanes', positionUV: pt(0.22, 0.715), headingDeg: 180 },
  { id: 'arr-sh-2', region: 'south_center_lanes', positionUV: pt(0.22, 0.750), headingDeg: 180 },
];

export const AUTODROM_CHEVRONS_CONFIG: StripedChevronZoneConfig[] = [
  {
    id: 'chev-north-center',
    region: 'outer_perimeter',
    polygonUV: [pt(0.455, 0.042), pt(0.518, 0.042), pt(0.495, 0.090)],
    stripeAngleDeg: -45,
    stripeSpacingMeters: 0.7,
  },
  {
    id: 'chev-west-edge',
    region: 'outer_perimeter',
    polygonUV: [pt(0.015, 0.545), pt(0.032, 0.545), pt(0.032, 0.625), pt(0.015, 0.625)],
    stripeAngleDeg: 45,
    stripeSpacingMeters: 0.7,
  },
  // Safety island (1.16): left corner flush with green island (0.915, 0.540), rounded bottom arc funneling 90° turn
  {
    id: 'chev-east-edge',
    region: 'north_right_serpentine',
    polygonUV: [
      pt(0.915, 0.540),
      pt(0.986, 0.452),
      pt(0.986, 0.596),
      pt(0.983, 0.578),
      pt(0.975, 0.563),
      pt(0.962, 0.551),
      pt(0.946, 0.544),
      pt(0.930, 0.541),
    ],
    stripeAngleDeg: -38,
    stripeSpacingMeters: 0.7,
  },
];

export const AUTODROM_EXERCISE_LABELS: ExerciseLabelConfig[] = [
  { id: 'lbl-m1', code: 'M1', confirmedFromReference: true, positionUV: pt(xToU(START_LINE_X), zToV(B_LANE_CENTER_Z)), region: 'south_center_lanes' },
  { id: 'lbl-m2-bot', code: 'M2', confirmedFromReference: true, positionUV: pt(xToU(PED_ZEBRA_CENTER_X), zToV(B_LANE_CENTER_Z)), region: 'south_center_lanes' },
  { id: 'lbl-m2-nl', code: 'M2', confirmedFromReference: true, positionUV: pt(0.393, 0.241), region: 'north_left_complex' },
  { id: 'lbl-m3', code: 'M3', confirmedFromReference: true, positionUV: pt(xToU(ESTAKADA_M3_SPEC.plateauCenter[0]), zToV(B_LANE_CENTER_Z)), region: 'south_center_lanes' },
  { id: 'lbl-m4-a', code: 'M4', confirmedFromReference: true, positionUV: pt(0.744, 0.594), region: 'south_right_complex' },
  { id: 'lbl-m4-b', code: 'M4', confirmedFromReference: true, positionUV: pt(0.814, 0.686), region: 'south_right_complex' },
  { id: 'lbl-m5', code: 'M5', confirmedFromReference: true, positionUV: pt(0.498, 0.498), region: 'central_intersection' },
  { id: 'lbl-m6-a', code: 'M6', confirmedFromReference: true, positionUV: pt(0.592, 0.269), region: 'north_right_serpentine' },
  { id: 'lbl-m6-b', code: 'M6', confirmedFromReference: true, positionUV: pt(0.712, 0.210), region: 'north_right_serpentine' },
  { id: 'lbl-m7-a', code: 'M7', confirmedFromReference: true, positionUV: pt(0.134, 0.197), region: 'north_left_complex' },
  { id: 'lbl-m7-b', code: 'M7', confirmedFromReference: true, positionUV: pt(0.192, 0.354), region: 'north_left_complex' },
  { id: 'lbl-m7-c', code: 'M7', confirmedFromReference: true, positionUV: pt(0.317, 0.253), region: 'north_left_complex' },
  { id: 'lbl-m8', code: 'M8', confirmedFromReference: true, positionUV: pt(0.984, 0.227), region: 'north_right_serpentine' },
  { id: 'lbl-m9', code: 'M9', confirmedFromReference: false, positionUV: pt(0.652, 0.024), region: 'outer_perimeter' },
  { id: 'lbl-m10', code: 'M10', confirmedFromReference: true, positionUV: pt(0.017, 0.244), region: 'outer_perimeter' },
  { id: 'lbl-m11-a', code: 'M11', confirmedFromReference: true, positionUV: pt(0.100, 0.554), region: 'south_left_complex' },
  { id: 'lbl-m11-b', code: 'M11', confirmedFromReference: true, positionUV: pt(0.222, 0.554), region: 'south_left_complex' },
  { id: 'lbl-m11-c', code: 'M11', confirmedFromReference: true, positionUV: pt(0.345, 0.553), region: 'south_left_complex' },
  { id: 'lbl-m11-d', code: 'M11', confirmedFromReference: true, positionUV: pt(0.365, 0.674), region: 'south_left_complex' },
  { id: 'lbl-m12-a', code: 'M12', confirmedFromReference: true, positionUV: pt(0.142, 0.730), region: 'south_center_lanes' },
];
