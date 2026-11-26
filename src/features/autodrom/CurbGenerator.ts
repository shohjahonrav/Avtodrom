import * as THREE from 'three';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import type { UVPoint, WorldPoint2D } from '@/features/autodrom/mapTypes';

export function buildCurbRibbonGeometry(
  pointsXZ: WorldPoint2D[],
  curbWidth = 0.22,
  curbHeight = 0.14,
  closed = true
): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const halfW = curbWidth / 2;

  const pushQuad = (
    p0: [number, number, number],
    p1: [number, number, number],
    p2: [number, number, number],
    p3: [number, number, number]
  ) => {
    const base = positions.length / 3;
    positions.push(...p0, ...p1, ...p2, ...p3);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  const count = closed ? pointsXZ.length : pointsXZ.length - 1;
  for (let i = 0; i < count; i++) {
    const a = pointsXZ[i];
    const b = pointsXZ[(i + 1) % pointsXZ.length];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 1e-4) continue;
    const nx = (-dz / len) * halfW;
    const nz = (dx / len) * halfW;

    pushQuad(
      [a.x - nx, curbHeight, a.z - nz],
      [b.x - nx, curbHeight, b.z - nz],
      [b.x + nx, curbHeight, b.z + nz],
      [a.x + nx, curbHeight, a.z + nz]
    );
    pushQuad(
      [a.x - nx, 0, a.z - nz],
      [b.x - nx, 0, b.z - nz],
      [b.x - nx, curbHeight, b.z - nz],
      [a.x - nx, curbHeight, a.z - nz]
    );
    pushQuad(
      [a.x + nx, curbHeight, a.z + nz],
      [b.x + nx, curbHeight, b.z + nz],
      [b.x + nx, 0, b.z + nz],
      [a.x + nx, 0, a.z + nz]
    );
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function buildCurbArcFromUV(
  arcUV: UVPoint[],
  curbWidth = 0.25,
  curbHeight = 0.14
): THREE.BufferGeometry {
  const pts = arcUV.map((uv) => uvToWorld(uv, MAP_DIMENSIONS));
  return buildCurbRibbonGeometry(pts, curbWidth, curbHeight, false);
}
