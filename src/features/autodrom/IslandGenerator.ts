import * as THREE from 'three';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import type { IslandPolygonConfig, WorldPoint2D } from '@/features/autodrom/mapTypes';

export function chaikinSmoothPolygon(pts: WorldPoint2D[], iterations: number): WorldPoint2D[] {
  let current = pts;
  for (let it = 0; it < iterations; it++) {
    const next: WorldPoint2D[] = [];
    for (let i = 0; i < current.length; i++) {
      const a = current[i];
      const b = current[(i + 1) % current.length];
      next.push({ x: 0.75 * a.x + 0.25 * b.x, z: 0.75 * a.z + 0.25 * b.z });
      next.push({ x: 0.25 * a.x + 0.75 * b.x, z: 0.25 * a.z + 0.75 * b.z });
    }
    current = next;
  }
  return current;
}

export function getIslandWorldPolygon(island: IslandPolygonConfig): WorldPoint2D[] {
  const worldPts = island.outerUV.map((uv) => uvToWorld(uv, MAP_DIMENSIONS));
  return chaikinSmoothPolygon(worldPts, island.smoothIterations ?? 0);
}

export function buildIslandGeometry(island: IslandPolygonConfig): {
  geometry: THREE.BufferGeometry;
  polygonXZ: WorldPoint2D[];
} {
  const polygonXZ = getIslandWorldPolygon(island);
  const shape = new THREE.Shape();
  polygonXZ.forEach((p, idx) => {
    if (idx === 0) shape.moveTo(p.x, -p.z);
    else shape.lineTo(p.x, -p.z);
  });
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: island.curbHeightMeters,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return { geometry, polygonXZ };
}
