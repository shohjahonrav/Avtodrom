import {
  allCornersInsidePolygon,
  anyCornerInsidePolygon,
  distancePointToSegment,
  getVehicleCorners,
  getWheelPoints,
  pointInPolygon,
  polygonIntersectsCircle,
  polygonIntersectsSegment,
} from '@/lib/utils/geometry';
import type {
  ExerciseConfig,
  Point2D,
  SensorZone,
  VehicleDimensions,
  VehiclePhysicsState,
} from '@/types';

export interface CollisionReport {
  collidedConeIds: string[];
  collidedBarrierIds: string[];
  violatedLineIds: string[];
  hitPedestrian: boolean;
  insideZones: SensorZone[];
  wheelInsideZones: SensorZone[];
  isFullyInsideParkingBay: boolean;
  isFullyInsideReverseBox: boolean;
  clearancesMeters: {
    front: number | null;
    rear: number | null;
    left: number | null;
    right: number | null;
  };
}

export function detectCollisionsAndZones(
  vehicle: VehiclePhysicsState,
  dims: VehicleDimensions,
  exercise: ExerciseConfig,
  pedestrianPos: Point2D | null,
  useWorldCoords = false
): CollisionReport {
  const offset = useWorldCoords ? exercise.worldOffset : { x: 0, y: 0 };
  const shift = (p: Point2D): Point2D => ({ x: p.x + offset.x, y: p.y + offset.y });

  const corners = getVehicleCorners(vehicle.x, vehicle.y, vehicle.headingRad, dims);
  const wheels = getWheelPoints(vehicle.x, vehicle.y, vehicle.headingRad, dims);

  const collidedConeIds: string[] = [];
  for (const cone of exercise.geometry.cones) {
    const pos = shift(cone.position);
    if (polygonIntersectsCircle(corners, pos, cone.radiusMeters)) {
      collidedConeIds.push(cone.id);
    }
  }

  const collidedBarrierIds: string[] = [];
  for (const barrier of exercise.geometry.barriers) {
    const halfThick = barrier.thicknessMeters / 2;
    let hit = false;
    for (let i = 0; i < barrier.points.length - 1; i++) {
      const a = shift(barrier.points[i]);
      const b = shift(barrier.points[i + 1]);
      if (polygonIntersectsSegment(corners, a, b, halfThick)) {
        hit = true;
        break;
      }
    }
    if (hit) collidedBarrierIds.push(barrier.id);
  }

  const violatedLineIds: string[] = [];
  for (const line of exercise.geometry.lines) {
    if (!line.isSensorBoundary) continue;
    const a = shift(line.start);
    const b = shift(line.end);
    const halfWidth = Math.max(0.04, line.widthMeters / 2);

    // Check both body corners and wheel contact points against solid boundary lines
    const bodyTouched = polygonIntersectsSegment(corners, a, b, halfWidth);
    const wheelCrossed = wheels.some((w) => distancePointToSegment(w, a, b) <= halfWidth + 0.05);
    if (bodyTouched || wheelCrossed) {
      violatedLineIds.push(line.id);
    }
  }

  let hitPedestrian = false;
  if (pedestrianPos) {
    hitPedestrian = polygonIntersectsCircle(corners, pedestrianPos, 0.35);
  }

  const insideZones: SensorZone[] = [];
  const wheelInsideZones: SensorZone[] = [];
  let isFullyInsideParkingBay = false;
  let isFullyInsideReverseBox = false;

  for (const zone of exercise.geometry.zones) {
    const poly = zone.polygon.map(shift);
    const centerIn = pointInPolygon({ x: vehicle.x, y: vehicle.y }, poly);
    const anyCorner = anyCornerInsidePolygon(corners, poly);
    const allCorners = allCornersInsidePolygon(corners, poly);

    if (centerIn || anyCorner) {
      insideZones.push(zone);
    }
    if (wheels.some((w) => pointInPolygon(w, poly))) {
      wheelInsideZones.push(zone);
    }
    if (zone.kind === 'parking_bay' && allCorners) {
      isFullyInsideParkingBay = true;
    }
    if (zone.kind === 'reverse_box_bay' && allCorners) {
      isFullyInsideReverseBox = true;
    }
  }

  // Compute directional clearances for UI distance HUD (especially parallel parking & box)
  const cos = Math.cos(vehicle.headingRad);
  const sin = Math.sin(vehicle.headingRad);
  const frontPoint = {
    x: vehicle.x + (dims.lengthMeters / 2) * cos,
    y: vehicle.y + (dims.lengthMeters / 2) * sin,
  };
  const rearPoint = {
    x: vehicle.x - (dims.lengthMeters / 2) * cos,
    y: vehicle.y - (dims.lengthMeters / 2) * sin,
  };
  const leftPoint = {
    x: vehicle.x + (dims.widthMeters / 2) * sin,
    y: vehicle.y - (dims.widthMeters / 2) * cos,
  };
  const rightPoint = {
    x: vehicle.x - (dims.widthMeters / 2) * sin,
    y: vehicle.y + (dims.widthMeters / 2) * cos,
  };

  const minDistToObstacles = (pt: Point2D): number | null => {
    let minD = Infinity;
    for (const line of exercise.geometry.lines) {
      if (!line.isSensorBoundary) continue;
      const d = distancePointToSegment(pt, shift(line.start), shift(line.end));
      if (d < minD) minD = d;
    }
    for (const b of exercise.geometry.barriers) {
      for (let i = 0; i < b.points.length - 1; i++) {
        const d = distancePointToSegment(pt, shift(b.points[i]), shift(b.points[i + 1])) - b.thicknessMeters / 2;
        if (d < minD) minD = Math.max(0, d);
      }
    }
    return Number.isFinite(minD) ? Number(minD.toFixed(2)) : null;
  };

  return {
    collidedConeIds,
    collidedBarrierIds,
    violatedLineIds,
    hitPedestrian,
    insideZones,
    wheelInsideZones,
    isFullyInsideParkingBay,
    isFullyInsideReverseBox,
    clearancesMeters: {
      front: minDistToObstacles(frontPoint),
      rear: minDistToObstacles(rearPoint),
      left: minDistToObstacles(leftPoint),
      right: minDistToObstacles(rightPoint),
    },
  };
}
