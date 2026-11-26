import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import type { ZebraCrossingConfig } from '@/features/autodrom/mapTypes';

export interface ZebraStripeMesh {
  id: string;
  position: [number, number, number];
  width: number;
  length: number;
  angleY: number;
}

export function buildZebraStripes(crossing: ZebraCrossingConfig): ZebraStripeMesh[] {
  const center = uvToWorld(crossing.centerUV, MAP_DIMENSIONS);
  const stripes: ZebraStripeMesh[] = [];
  const angleRad = (crossing.angleDeg * Math.PI) / 180;
  const step = crossing.lengthMeters / crossing.stripeCount;
  const stripeThick = step * 0.52;

  for (let i = 0; i < crossing.stripeCount; i++) {
    const offset = -crossing.lengthMeters / 2 + (i + 0.5) * step;
    const ox = -Math.sin(angleRad) * offset;
    const oz = Math.cos(angleRad) * offset;
    stripes.push({
      id: `${crossing.id}-s-${i}`,
      position: [center.x + ox, MAP_DIMENSIONS.markingElevationOffsetY + 0.002, center.z + oz],
      width: crossing.widthMeters,
      length: stripeThick,
      angleY: -angleRad,
    });
  }
  return stripes;
}
