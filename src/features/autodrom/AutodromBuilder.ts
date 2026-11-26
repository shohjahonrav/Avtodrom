import * as THREE from 'three';
import { AUTODROM_ISLANDS } from '@/config/islands';
import { MAP_DIMENSIONS } from '@/config/mapDimensions';
import {
  AUTODROM_ARROWS_CONFIG,
  AUTODROM_CHEVRONS_CONFIG,
  AUTODROM_EXERCISE_LABELS,
  AUTODROM_MARKINGS_CONFIG,
  AUTODROM_ZEBRAS_CONFIG,
} from '@/config/markings';
import { AUTODROM_PARKING_AREAS } from '@/config/parking';
import { AUTODROM_ROAD_NETWORK } from '@/config/roadNetwork';
import { buildZebraStripes } from '@/features/autodrom/IntersectionBuilder';
import {
  expandMarkingSegment,
  generateChevronStripes,
} from '@/features/autodrom/MarkingGenerator';
import { buildParkingStallLines } from '@/features/autodrom/ParkingBuilder';

export function buildAutodromSceneData() {
  const markingLines = [
    ...AUTODROM_MARKINGS_CONFIG.flatMap(expandMarkingSegment),
    ...AUTODROM_CHEVRONS_CONFIG.flatMap(generateChevronStripes),
    ...AUTODROM_PARKING_AREAS.flatMap(buildParkingStallLines),
  ];

  const zebraStripes = AUTODROM_ZEBRAS_CONFIG.flatMap(buildZebraStripes);

  return {
    dimensions: MAP_DIMENSIONS,
    islands: AUTODROM_ISLANDS,
    roads: AUTODROM_ROAD_NETWORK,
    markingLines,
    zebraStripes,
    arrows: AUTODROM_ARROWS_CONFIG,
    parkingAreas: AUTODROM_PARKING_AREAS,
    labels: AUTODROM_EXERCISE_LABELS,
  };
}

export function createSignTexture(code: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    if (code === '3.243') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(128, 128, 112, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 22;
      ctx.strokeStyle = '#dc2626';
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 96px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('20', 128, 134);
    } else if (code === '2.5') {
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        const px = 128 + 110 * Math.cos(a);
        const py = 128 + 110 * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 62px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('STOP', 128, 132);
    } else if (code === '5.15' || code === '5.16.1' || code === '5.16.2') {
      ctx.fillStyle = '#1d4ed8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 10;
      ctx.fillRect(18, 18, 220, 220);
      ctx.strokeRect(18, 18, 220, 220);
      if (code === '5.15') {
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 132px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('P', 128, 134);
      } else {
        // 5.16.1 / 5.16.2 Pedestrian crossing blue square + white triangle + crosswalk icon
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(128, 42);
        ctx.lineTo(212, 206);
        ctx.lineTo(44, 206);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 84px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚶', 128, 150);
        ctx.fillStyle = '#ffffff';
        ctx.font = '700 22px sans-serif';
        ctx.fillText(code, 128, 224);
      }
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(128, 24);
      ctx.lineTo(234, 218);
      ctx.lineTo(22, 218);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 40px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(code === '1.14' ? '12% ↑' : code === '1.13' ? '12% ↓' : 'RAIL', 128, 182);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createRoadPaintDecalTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
    ctx.font = '900 108px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
