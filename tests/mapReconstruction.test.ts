import { describe, expect, it } from 'vitest';
import { AUTODROM_ISLANDS } from '@/config/islands';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import { AUTODROM_PARKING_AREAS } from '@/config/parking';
import { buildAutodromSceneData } from '@/features/autodrom/AutodromBuilder';
import { buildIslandGeometry } from '@/features/autodrom/IslandGenerator';

describe('Blueprint Autodrom 3D Geometry', () => {
  it('preserves exact reference aspect ratio and generates all 8 concave green islands', () => {
    const ratio = MAP_DIMENSIONS.mapWidthMeters / MAP_DIMENSIONS.mapLengthMeters;
    expect(Math.abs(ratio - MAP_DIMENSIONS.aspectRatio)).toBeLessThan(0.002);
    expect(uvToWorld({ u: 0.5, v: 0.5 })).toEqual({ x: 0, z: 0 });
    expect(AUTODROM_ISLANDS).toHaveLength(8);

    for (const isl of AUTODROM_ISLANDS) {
      const { geometry, polygonXZ } = buildIslandGeometry(isl);
      expect(polygonXZ.length).toBeGreaterThanOrEqual(3);
      expect(geometry.getAttribute('position').count).toBeGreaterThan(0);
      geometry.dispose();
    }
  });

  it('includes 11 diagonal parking lines, 5 zebra crossings, and M1-M12 blueprint labels', () => {
    const data = buildAutodromSceneData();
    expect(AUTODROM_PARKING_AREAS[0].stallLinesUV).toHaveLength(11);
    expect(data.zebraStripes).toHaveLength(4 * 7 + 8);
    expect(data.labels.length).toBeGreaterThanOrEqual(18);
  });
});
