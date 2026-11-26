import type { Point2D, VehicleDimensions } from '@/types';

/**
 * Computes the 4 corners of the vehicle's oriented bounding box (OBB) in meters.
 * Center (x, y) represents the geometric center of the vehicle body.
 * Order: [frontLeft, frontRight, rearRight, rearLeft]
 */
export function getVehicleCorners(
  x: number,
  y: number,
  headingRad: number,
  dims: VehicleDimensions
): [Point2D, Point2D, Point2D, Point2D] {
  const halfLen = dims.lengthMeters / 2;
  const halfWid = dims.widthMeters / 2;
  const cos = Math.cos(headingRad);
  const sin = Math.sin(headingRad);

  const localCorners: [number, number][] = [
    [halfLen, -halfWid], // front-left (in screen-down Y coords)
    [halfLen, halfWid], // front-right
    [-halfLen, halfWid], // rear-right
    [-halfLen, -halfWid], // rear-left
  ];

  return localCorners.map(([lx, ly]) => ({
    x: x + lx * cos - ly * sin,
    y: y + lx * sin + ly * cos,
  })) as [Point2D, Point2D, Point2D, Point2D];
}

/**
 * Computes the 4 wheel contact points (inset slightly from body corners) in meters.
 */
export function getWheelPoints(
  x: number,
  y: number,
  headingRad: number,
  dims: VehicleDimensions
): [Point2D, Point2D, Point2D, Point2D] {
  const halfWheelbase = dims.wheelbaseMeters / 2;
  const halfTrack = Math.max(0.2, dims.widthMeters / 2 - 0.12);
  const cos = Math.cos(headingRad);
  const sin = Math.sin(headingRad);

  const localWheels: [number, number][] = [
    [halfWheelbase, -halfTrack],
    [halfWheelbase, halfTrack],
    [-halfWheelbase, halfTrack],
    [-halfWheelbase, -halfTrack],
  ];

  return localWheels.map(([lx, ly]) => ({
    x: x + lx * cos - ly * sin,
    y: y + lx * sin + ly * cos,
  })) as [Point2D, Point2D, Point2D, Point2D];
}

export function pointInPolygon(point: Point2D, polygon: Point2D[]): boolean {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function distancePointToSegment(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-10) {
    return Math.hypot(p.x - a.x, p.y - a.y);
  }
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
  const projX = a.x + t * dx;
  const projY = a.y + t * dy;
  return Math.hypot(p.x - projX, p.y - projY);
}

function orientation(p: Point2D, q: Point2D, r: Point2D): number {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
  if (Math.abs(val) < 1e-9) return 0;
  return val > 0 ? 1 : 2;
}

function onSegment(p: Point2D, q: Point2D, r: Point2D): boolean {
  return (
    q.x <= Math.max(p.x, r.x) + 1e-9 &&
    q.x >= Math.min(p.x, r.x) - 1e-9 &&
    q.y <= Math.max(p.y, r.y) + 1e-9 &&
    q.y >= Math.min(p.y, r.y) - 1e-9
  );
}

export function segmentsIntersect(p1: Point2D, q1: Point2D, p2: Point2D, q2: Point2D): boolean {
  const o1 = orientation(p1, q1, p2);
  const o2 = orientation(p1, q1, q2);
  const o3 = orientation(p2, q2, p1);
  const o4 = orientation(p2, q2, q1);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(p1, p2, q1)) return true;
  if (o2 === 0 && onSegment(p1, q2, q1)) return true;
  if (o3 === 0 && onSegment(p2, p1, q2)) return true;
  if (o4 === 0 && onSegment(p2, q1, q2)) return true;
  return false;
}

/**
 * Checks whether an oriented polygon (vehicle body) intersects a line segment (e.g., road line or barrier)
 * within a given half-thickness in meters.
 */
export function polygonIntersectsSegment(
  poly: Point2D[],
  segA: Point2D,
  segB: Point2D,
  halfThicknessMeters = 0.05
): boolean {
  // 1. Check edge-segment intersection
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    if (segmentsIntersect(p1, p2, segA, segB)) return true;
  }

  // 2. Check endpoints inside polygon
  if (pointInPolygon(segA, poly) || pointInPolygon(segB, poly)) return true;

  // 3. Check distance from polygon vertices or edges to segment within halfThickness
  for (const v of poly) {
    if (distancePointToSegment(v, segA, segB) <= halfThicknessMeters) return true;
  }

  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    if (
      distancePointToSegment(segA, p1, p2) <= halfThicknessMeters ||
      distancePointToSegment(segB, p1, p2) <= halfThicknessMeters
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a circle (e.g. cone or pedestrian) intersects a polygon (vehicle OBB).
 */
export function polygonIntersectsCircle(
  poly: Point2D[],
  center: Point2D,
  radiusMeters: number
): boolean {
  if (pointInPolygon(center, poly)) return true;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    if (distancePointToSegment(center, a, b) <= radiusMeters) {
      return true;
    }
  }
  return false;
}

export function allCornersInsidePolygon(corners: Point2D[], zone: Point2D[]): boolean {
  return corners.every((c) => pointInPolygon(c, zone));
}

export function anyCornerInsidePolygon(corners: Point2D[], zone: Point2D[]): boolean {
  return corners.some((c) => pointInPolygon(c, zone));
}

export function normalizeAngleRad(rad: number): number {
  let a = rad;
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function translatePoint(p: Point2D, offset: Point2D): Point2D {
  return { x: p.x + offset.x, y: p.y + offset.y };
}

export function translatePolygon(poly: Point2D[], offset: Point2D): Point2D[] {
  return poly.map((p) => translatePoint(p, offset));
}
