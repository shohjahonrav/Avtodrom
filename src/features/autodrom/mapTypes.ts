export type MapRegionId =
  | 'outer_perimeter'
  | 'north_left_complex'
  | 'north_right_serpentine'
  | 'central_intersection'
  | 'central_horizontal'
  | 'south_left_complex'
  | 'south_west_parking'
  | 'south_center_lanes'
  | 'south_right_complex';

export interface UVPoint {
  u: number;
  v: number;
}

export interface WorldPoint2D {
  x: number;
  z: number;
}

export interface MapDimensionsConfig {
  referenceImagePath: string;
  referenceImageWidthPx: number;
  referenceImageHeightPx: number;
  mapRectPx: { x0: number; x1: number; y0: number; y1: number };
  aspectRatio: number;
  mapWidthMeters: number;
  mapLengthMeters: number;
  islandHeightMeters: number;
  markingElevationOffsetY: number;
}

export interface IslandPolygonConfig {
  id: string;
  name: string;
  region: MapRegionId;
  outerUV: UVPoint[];
  curbHeightMeters: number;
  smoothIterations?: number;
}

export interface RoadCenterlineConfig {
  id: string;
  name: string;
  region: MapRegionId;
  pointsUV: UVPoint[];
  widthMeters: number;
  curveType: 'linear' | 'catmull_rom';
}

export interface RoadMarkingSegmentConfig {
  id: string;
  kind: 'solid_white' | 'dashed_white' | 'stop_line' | 'bay_yellow_border' | 'dashed_yellow';
  startUV: UVPoint;
  endUV: UVPoint;
  widthMeters: number;
  region: MapRegionId;
  elevationY?: number;
}

export interface ZebraCrossingConfig {
  id: string;
  region: MapRegionId;
  centerUV: UVPoint;
  widthMeters: number;
  lengthMeters: number;
  angleDeg: number;
  stripeCount: number;
}

export interface DirectionArrowConfig {
  id: string;
  region: MapRegionId;
  positionUV: UVPoint;
  headingDeg: number;
  kind?: 'straight' | 'left_turn' | 'right_turn';
}

export interface StripedChevronZoneConfig {
  id: string;
  region: MapRegionId;
  polygonUV: UVPoint[];
  stripeAngleDeg: number;
  stripeSpacingMeters: number;
}

export interface DiagonalParkingAreaConfig {
  id: string;
  region: MapRegionId;
  curbArcUV: UVPoint[];
  boundaryLoopUV: UVPoint[];
  stallLinesUV: { start: UVPoint; end: UVPoint }[];
  lineWidthMeters: number;
}

export interface ExerciseLabelConfig {
  id: string;
  code: string;
  confirmedFromReference: boolean;
  positionUV: UVPoint;
  region: MapRegionId;
}
