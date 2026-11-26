import * as THREE from 'three';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import type {
  RoadMarkingSegmentConfig,
  StripedChevronZoneConfig,
  WorldPoint2D,
} from '@/features/autodrom/mapTypes';

export interface LineInstanceTransform {
  id: string;
  position: [number, number, number];
  length: number;
  width: number;
  angleY: number;
  color: string;
}

export function expandMarkingSegment(seg: RoadMarkingSegmentConfig): LineInstanceTransform[] {
  const a = uvToWorld(seg.startUV, MAP_DIMENSIONS);
  const b = uvToWorld(seg.endUV, MAP_DIMENSIONS);
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const totalLen = Math.hypot(dx, dz);
  if (totalLen < 0.05) return [];

  const angleY = -Math.atan2(dz, dx);
  const y = seg.elevationY ?? MAP_DIMENSIONS.markingElevationOffsetY;
  const color =
    seg.kind === 'dashed_yellow' || seg.kind === 'bay_yellow_border' ? '#eab308' : '#f8fafc';

  if (seg.kind === 'dashed_white' || seg.kind === 'dashed_yellow') {
    const isShortYellow = seg.kind === 'dashed_yellow' && totalLen < 8.0;
    const dashLen = isShortYellow ? 0.42 : 1.3;
    const gapLen = isShortYellow ? 0.33 : 1.2;
    const step = dashLen + gapLen;
    const count = Math.max(1, Math.floor((totalLen + gapLen) / step));
    const span = count * dashLen + Math.max(0, count - 1) * gapLen;
    const startOffset = Math.max(0, (totalLen - span) / 2);
    const ux = dx / totalLen;
    const uz = dz / totalLen;
    const out: LineInstanceTransform[] = [];
    for (let i = 0; i < count; i++) {
      const dist = startOffset + i * step + dashLen / 2;
      if (dist + dashLen / 2 > totalLen + 0.02) break;
      out.push({
        id: `${seg.id}-${i}`,
        position: [a.x + ux * dist, y, a.z + uz * dist],
        length: dashLen,
        width: seg.widthMeters,
        angleY,
        color,
      });
    }
    return out;
  }

  return [
    {
      id: seg.id,
      position: [(a.x + b.x) / 2, y, (a.z + b.z) / 2],
      length: totalLen,
      width: seg.widthMeters,
      angleY,
      color,
    },
  ];
}

export function buildDirectionArrowGeometry(scaleMeters = 1.35): THREE.BufferGeometry {
  const s = scaleMeters;
  const shape = new THREE.Shape();
  shape.moveTo(-0.75 * s, -0.14 * s);
  shape.lineTo(0.25 * s, -0.14 * s);
  shape.lineTo(0.25 * s, -0.38 * s);
  shape.lineTo(0.85 * s, 0);
  shape.lineTo(0.25 * s, 0.38 * s);
  shape.lineTo(0.25 * s, 0.14 * s);
  shape.lineTo(-0.75 * s, 0.14 * s);
  shape.closePath();

  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export function buildLeftTurnArrowGeometry(scaleMeters = 1.35): THREE.BufferGeometry {
  const s = scaleMeters;
  const shape = new THREE.Shape();
  const cx = -0.18 * s;
  const cy = 0.17 * s;
  const rOut = 0.5 * s;
  const rIn = 0.28 * s;
  const arcSteps = 10;

  // Long straight stem -> smooth 90° circular arc bend -> crisp left arrowhead (+Y -> West)
  shape.moveTo(-1.1 * s, cy - rOut);
  shape.lineTo(cx, cy - rOut);
  for (let i = 1; i <= arcSteps; i++) {
    const a = -Math.PI / 2 + (Math.PI / 2) * (i / arcSteps);
    shape.lineTo(cx + rOut * Math.cos(a), cy + rOut * Math.sin(a));
  }
  shape.lineTo(cx + rOut, 0.36 * s);
  shape.lineTo(0.48 * s, 0.36 * s);
  shape.lineTo(0.21 * s, 0.86 * s);
  shape.lineTo(-0.06 * s, 0.36 * s);
  shape.lineTo(cx + rIn, 0.36 * s);
  shape.lineTo(cx + rIn, cy);
  for (let i = 1; i <= arcSteps; i++) {
    const a = 0 - (Math.PI / 2) * (i / arcSteps);
    shape.lineTo(cx + rIn * Math.cos(a), cy + rIn * Math.sin(a));
  }
  shape.lineTo(-1.1 * s, cy - rIn);
  shape.closePath();

  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export function generateChevronStripes(zone: StripedChevronZoneConfig): LineInstanceTransform[] {
  const poly: WorldPoint2D[] = zone.polygonUV.map((uv) => uvToWorld(uv, MAP_DIMENSIONS));
  if (poly.length < 3) return [];

  const y = MAP_DIMENSIONS.markingElevationOffsetY + 0.002;
  const out: LineInstanceTransform[] = [];

  // 1. Solid white perimeter outline around the safety island polygon (1.16.1-1.16.3)
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    if (len < 0.05) continue;
    out.push({
      id: `${zone.id}-border-${i}`,
      position: [(a.x + b.x) / 2, y, (a.z + b.z) / 2],
      length: len,
      width: 0.14,
      angleY: -Math.atan2(b.z - a.z, b.x - a.x),
      color: '#f8fafc',
    });
  }

  // 2. Parallel diagonal hatching clipped strictly inside the polygon
  const theta = (zone.stripeAngleDeg * Math.PI) / 180;
  const dx = Math.cos(theta);
  const dz = Math.sin(theta);
  const nx = -dz;
  const nz = dx;

  let nMin = Infinity;
  let nMax = -Infinity;
  for (const p of poly) {
    const proj = p.x * nx + p.z * nz;
    if (proj < nMin) nMin = proj;
    if (proj > nMax) nMax = proj;
  }

  const spacing = Math.max(0.35, zone.stripeSpacingMeters);
  let stripeIdx = 0;
  for (let d = nMin + spacing * 0.55; d <= nMax - spacing * 0.45; d += spacing) {
    const hits: number[] = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const da = a.x * nx + a.z * nz - d;
      const db = b.x * nx + b.z * nz - d;
      if ((da <= 0 && db > 0) || (db <= 0 && da > 0)) {
        const u = da / (da - db);
        const ix = a.x + (b.x - a.x) * u;
        const iz = a.z + (b.z - a.z) * u;
        hits.push(ix * dx + iz * dz);
      }
    }
    hits.sort((a, b) => a - b);
    for (let k = 0; k + 1 < hits.length; k += 2) {
      const len = hits[k + 1] - hits[k];
      if (len < 0.25) continue;
      const midT = (hits[k] + hits[k + 1]) / 2;
      out.push({
        id: `${zone.id}-${stripeIdx++}`,
        position: [midT * dx + d * nx, y, midT * dz + d * nz],
        length: len,
        width: 0.20,
        angleY: -theta,
        color: '#f1f5f9',
      });
    }
  }
  return out;
}
