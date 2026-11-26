import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import type { LineInstanceTransform } from '@/features/autodrom/MarkingGenerator';
import type { DiagonalParkingAreaConfig } from '@/features/autodrom/mapTypes';

export function buildParkingStallLines(area: DiagonalParkingAreaConfig): LineInstanceTransform[] {
  const y = MAP_DIMENSIONS.markingElevationOffsetY + 0.002;
  const lines: LineInstanceTransform[] = [];

  area.stallLinesUV.forEach((line, idx) => {
    const a = uvToWorld(line.start, MAP_DIMENSIONS);
    const b = uvToWorld(line.end, MAP_DIMENSIONS);
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    lines.push({
      id: `${area.id}-stall-${idx}`,
      position: [(a.x + b.x) / 2, y, (a.z + b.z) / 2],
      length: Math.hypot(dx, dz),
      width: area.lineWidthMeters,
      angleY: -Math.atan2(dz, dx),
      color: '#f8fafc',
    });
  });

  const loop = area.boundaryLoopUV.map((uv) => uvToWorld(uv, MAP_DIMENSIONS));
  for (let i = 0; i < 3; i++) {
    const a = loop[i];
    const b = loop[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    lines.push({
      id: `${area.id}-frame-${i}`,
      position: [(a.x + b.x) / 2, y, (a.z + b.z) / 2],
      length: Math.hypot(dx, dz),
      width: area.lineWidthMeters,
      angleY: -Math.atan2(dz, dx),
      color: '#f8fafc',
    });
  }

  return lines;
}
