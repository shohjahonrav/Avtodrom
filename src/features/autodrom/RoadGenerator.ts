import * as THREE from 'three';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import type { RoadCenterlineConfig, WorldPoint2D } from '@/features/autodrom/mapTypes';

export function sampleRoadCenterline(road: RoadCenterlineConfig): WorldPoint2D[] {
  const worldPts = road.pointsUV.map((uv) => uvToWorld(uv, MAP_DIMENSIONS));
  if (road.curveType === 'linear' || worldPts.length < 3) {
    return worldPts;
  }
  const curve = new THREE.CatmullRomCurve3(
    worldPts.map((p) => new THREE.Vector3(p.x, 0, p.z)),
    false,
    'catmullrom',
    0.45
  );
  return curve.getPoints(Math.max(24, worldPts.length * 10)).map((v) => ({ x: v.x, z: v.z }));
}

export function buildRoadRibbonGeometry(
  pointsXZ: WorldPoint2D[],
  widthMeters: number,
  elevationY = 0.004
): THREE.BufferGeometry {
  const halfW = widthMeters / 2;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  let accumDist = 0;

  for (let i = 0; i < pointsXZ.length; i++) {
    const prev = pointsXZ[Math.max(0, i - 1)];
    const cur = pointsXZ[i];
    const next = pointsXZ[Math.min(pointsXZ.length - 1, i + 1)];
    if (i > 0) accumDist += Math.hypot(cur.x - prev.x, cur.z - prev.z);

    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = (-dz / len) * halfW;
    const nz = (dx / len) * halfW;

    positions.push(cur.x - nx, elevationY, cur.z - nz);
    positions.push(cur.x + nx, elevationY, cur.z + nz);
    uvs.push(0, accumDist / 4, 1, accumDist / 4);

    if (i < pointsXZ.length - 1) {
      const base = i * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function createAsphaltMapTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#525862';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 7500; i++) {
      const x = (i * 73) % 512;
      const y = (i * 151) % 512;
      ctx.fillStyle = i % 3 === 0 ? '#5f6671' : i % 2 === 0 ? '#484e57' : '#4e545e';
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(24, 15);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createGrassIslandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#2d7530';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 3200; i++) {
      const x = (i * 61) % 256;
      const y = (i * 113) % 256;
      ctx.fillStyle = i % 2 === 0 ? '#27672a' : '#358539';
      ctx.fillRect(x, y, 2, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
