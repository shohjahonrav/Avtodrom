import {
  AUTODROME_BOUNDARY_SEGMENTS,
  AUTODROME_ZONES,
} from '@/config/autodrom.config';
import {
  distancePointToSegment,
  pointInPolygon,
  polygonIntersectsSegment,
} from '@/lib/utils/geometry';
import type { ColliderTag } from '@/physics/CollisionManager';
import type { Point2D } from '@/types';
import type {
  ExamExerciseId,
  ExamZonePolygon,
  VehiclePhysicsConfig,
} from '@/types/simulator3d';

// Re-export geometry helper using XZ plane mapped to 2D (x, y = z)
export function getVehicleFootprintXZ(
  pos: [number, number, number],
  yawRad: number,
  config: VehiclePhysicsConfig
): Point2D[] {
  const halfLen = config.chassisLengthMeters / 2;
  const halfWid = config.chassisWidthMeters / 2;
  // When yaw = 0, forward is -Z, right is +X.
  // Rotating (localX, localZ) around Y by yawRad:
  // worldX = x + localX * cos(yaw) + localZ * sin(yaw)
  // worldZ = z - localX * sin(yaw) + localZ * cos(yaw)
  const cos = Math.cos(yawRad);
  const sin = Math.sin(yawRad);
  const local: [number, number][] = [
    [-halfWid, -halfLen], // FL
    [halfWid, -halfLen], // FR
    [halfWid, halfLen], // RR
    [-halfWid, halfLen], // RL
  ];
  return local.map(([lx, lz]) => ({
    x: pos[0] + lx * cos + lz * sin,
    y: pos[2] - lx * sin + lz * cos,
  }));
}

export function getZonePolygonXZ(zone: ExamZonePolygon): Point2D[] {
  const hw = zone.size[0] / 2;
  const hl = zone.size[1] / 2;
  const rad = (zone.rotationYDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const pts: [number, number][] = [
    [-hw, -hl],
    [hw, -hl],
    [hw, hl],
    [-hw, hl],
  ];
  return pts.map(([lx, lz]) => ({
    x: zone.center[0] + lx * cos + lz * sin,
    y: zone.center[1] - lx * sin + lz * cos,
  }));
}

export interface ViolationDetectionFrame {
  boundaryCrossingIds: string[];
  collidedConeIds: string[];
  collidedWallIds: string[];
  activeZones: ExamZonePolygon[];
  fullyInsideParkingBay: boolean;
  fullyInsideReverseBox: boolean;
}

export function detectFrameViolationsAndZones(params: {
  vehiclePos: [number, number, number];
  yawRad: number;
  vehicleConfig: VehiclePhysicsConfig;
  rapierContacts: ColliderTag[];
  activeExerciseId: ExamExerciseId;
}): ViolationDetectionFrame {
  const { vehiclePos, yawRad, vehicleConfig, rapierContacts } = params;
  const footprint = getVehicleFootprintXZ(vehiclePos, yawRad, vehicleConfig);

  // 1. Full 4-corner footprint check against boundary lines
  const boundaryCrossingIds: string[] = [];
  for (const seg of AUTODROME_BOUNDARY_SEGMENTS) {
    const a: Point2D = { x: seg.a[0], y: seg.a[1] };
    const b: Point2D = { x: seg.b[0], y: seg.b[1] };
    const hit = polygonIntersectsSegment(footprint, a, b, seg.halfWidthMeters);
    const cornerClose = footprint.some(
      (pt) => distancePointToSegment(pt, a, b) <= seg.halfWidthMeters
    );
    if (hit || cornerClose) {
      boundaryCrossingIds.push(seg.id);
    }
  }

  // 2. Actual Rapier3D physics contacts
  const collidedConeIds: string[] = [];
  const collidedWallIds: string[] = [];
  for (const c of rapierContacts) {
    if (c.kind === 'cone') {
      collidedConeIds.push(c.id);
    } else if (
      c.kind === 'fence' ||
      c.kind === 'estakada_guard' ||
      c.kind === 'box_wall' ||
      c.kind === 'parked_car' ||
      c.kind === 'curb'
    ) {
      collidedWallIds.push(c.id);
    }
  }

  // 3. Sensor & Parking / Stop / Speed / Railway zones
  const activeZones: ExamZonePolygon[] = [];
  let fullyInsideParkingBay = false;
  let fullyInsideReverseBox = false;

  for (const zone of AUTODROME_ZONES) {
    const poly = getZonePolygonXZ(zone);
    const anyIn = footprint.some((pt) => pointInPolygon(pt, poly));
    const allIn = footprint.every((pt) => pointInPolygon(pt, poly));
    if (anyIn) activeZones.push(zone);
    if (zone.kind === 'parking_bay' && allIn) fullyInsideParkingBay = true;
    if (zone.kind === 'reverse_box' && allIn) fullyInsideReverseBox = true;
  }

  return {
    boundaryCrossingIds,
    collidedConeIds,
    collidedWallIds,
    activeZones,
    fullyInsideParkingBay,
    fullyInsideReverseBox,
  };
}
