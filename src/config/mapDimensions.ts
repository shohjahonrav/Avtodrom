import type { MapDimensionsConfig, UVPoint, WorldPoint2D } from '@/features/autodrom/mapTypes';

/**
 * Unified 3D Simulator + Reference Blueprint Coordinate System (Y-up, meters):
 * - Origin (0, 0, 0): Center of the 96.0m x 59.82m autodrom ground (Y = 0).
 * - +X: East, -X: West, +Z: South, -Z: North, +Y: Up.
 * - Aspect ratio 1.60487 matches autodrom-reference.jpg (857:534 px).
 */
export const MAP_DIMENSIONS: MapDimensionsConfig = {
  referenceImagePath: '/reference/autodrom-reference.jpg',
  referenceImageWidthPx: 866,
  referenceImageHeightPx: 566,
  mapRectPx: { x0: 4, x1: 861, y0: 27, y1: 561 },
  aspectRatio: 857 / 534,
  mapWidthMeters: 96.0,
  mapLengthMeters: 59.82,
  islandHeightMeters: 0.14,
  markingElevationOffsetY: 0.014,
};

export function uvToWorld(
  uv: UVPoint,
  dims: MapDimensionsConfig = MAP_DIMENSIONS
): WorldPoint2D {
  return {
    x: (uv.u - 0.5) * dims.mapWidthMeters,
    z: (uv.v - 0.5) * dims.mapLengthMeters,
  };
}
