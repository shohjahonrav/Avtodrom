'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, ZoomIn, ZoomOut, Grid3X3 } from 'lucide-react';
import { AUTODROME_WORLD_BOUNDS, EXERCISES_B } from '@/features/exercises/data/exercisesB';
import { getPedestrianWorldPosition } from '@/features/simulation/engine/simulationStep';
import { radToDeg } from '@/lib/utils/geometry';
import type {
  ExerciseConfig,
  ExerciseSlug,
  SimulationSnapshot,
  VehicleDimensions,
} from '@/types';
import { Button } from '@/components/ui/primitives';

interface AutodromeMapProps {
  mode: 'single' | 'full';
  onModeChange?: (mode: 'single' | 'full') => void;
  activeExercise: ExerciseConfig;
  snapshot?: SimulationSnapshot;
  vehicleDimensions: VehicleDimensions;
  showDevGrid?: boolean;
  onToggleDevGrid?: () => void;
  onSelectExercise?: (slug: ExerciseSlug) => void;
  interactive?: boolean;
}

export function AutodromeMapSvg({
  mode,
  onModeChange,
  activeExercise,
  snapshot,
  vehicleDimensions,
  showDevGrid = false,
  onToggleDevGrid,
  onSelectExercise,
  interactive = true,
}: AutodromeMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const baseViewBox = useMemo(() => {
    if (mode === 'full') {
      return {
        x: 0,
        y: 0,
        w: AUTODROME_WORLD_BOUNDS.widthMeters,
        h: AUTODROME_WORLD_BOUNDS.heightMeters,
      };
    }
    const b = activeExercise.geometry.bounds;
    const pad = 1.2;
    return {
      x: b.minX - pad,
      y: b.minY - pad,
      w: b.maxX - b.minX + pad * 2,
      h: b.maxY - b.minY + pad * 2,
    };
  }, [mode, activeExercise]);

  const viewBoxStr = useMemo(() => {
    const w = baseViewBox.w / zoom;
    const h = baseViewBox.h / zoom;
    const cx = baseViewBox.x + baseViewBox.w / 2 - pan.x;
    const cy = baseViewBox.y + baseViewBox.h / 2 - pan.y;
    return `${(cx - w / 2).toFixed(2)} ${(cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`;
  }, [baseViewBox, zoom, pan]);

  const exercisesToRender = mode === 'full' ? EXERCISES_B : [activeExercise];

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!interactive) return;
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pan.x,
      origY: pan.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.dragging) return;
    const scale = baseViewBox.w / zoom / 600;
    const dx = (e.clientX - dragRef.current.startX) * scale;
    const dy = (e.clientY - dragRef.current.startY) * scale;
    setPan({
      x: dragRef.current.origX + dx,
      y: dragRef.current.origY + dy,
    });
  };

  const handlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  // Compute vehicle world/local position
  const vehiclePose = useMemo(() => {
    if (!snapshot) {
      const off = mode === 'full' ? activeExercise.worldOffset : { x: 0, y: 0 };
      return {
        x: off.x + activeExercise.geometry.startPose.x,
        y: off.y + activeExercise.geometry.startPose.y,
        headingDeg: activeExercise.geometry.startPose.headingDeg,
        steerDeg: 0,
      };
    }
    const off = mode === 'full' ? activeExercise.worldOffset : { x: 0, y: 0 };
    return {
      x: off.x + snapshot.vehicle.x,
      y: off.y + snapshot.vehicle.y,
      headingDeg: radToDeg(snapshot.vehicle.headingRad),
      steerDeg: radToDeg(snapshot.vehicle.steeringAngleRad),
    };
  }, [snapshot, mode, activeExercise]);

  const hasCollision = (snapshot?.activeCollisionIds.length ?? 0) > 0;
  const hasLineViolation = (snapshot?.activeLineViolationIds.length ?? 0) > 0;

  return (
    <div className="relative flex flex-col rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
      {/* Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-3 py-2 text-xs">
        <div className="flex items-center gap-2">
          {onModeChange && (
            <div className="inline-flex rounded-lg border border-slate-700 bg-slate-950 p-0.5">
              <button
                type="button"
                onClick={() => {
                  onModeChange('single');
                  handleResetView();
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'single'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <Minimize2 className="h-3 w-3" /> Joriy mashq
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onModeChange('full');
                  handleResetView();
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  mode === 'full'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" /> To‘liq avtodrom (68×44 m)
                </span>
              </button>
            </div>
          )}
          <span className="hidden sm:inline text-slate-400">
            {mode === 'full'
              ? '3494-son halqasimon sxema (min. 50×15 m talabidan katta)'
              : `${activeExercise.order}. ${activeExercise.shortTitle}`}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onToggleDevGrid && (
            <Button
              type="button"
              size="sm"
              variant={showDevGrid ? 'default' : 'outline'}
              onClick={onToggleDevGrid}
              title="Metr koordinata to‘ri (Dev grid)"
              className="h-7 px-2 text-[11px]"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span className="hidden md:inline">To‘r (m)</span>
            </Button>
          )}
          {interactive && (
            <>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setZoom((z) => Math.min(4, Number((z + 0.25).toFixed(2))))}
                className="h-7 w-7"
                aria-label="Yaqinlashtirish"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.25).toFixed(2))))}
                className="h-7 w-7"
                aria-label="Uzoqlashtirish"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleResetView}
                className="h-7 w-7"
                aria-label="Ko‘rinishni tiklash"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* SVG Viewport */}
      <div className="relative w-full bg-[#1e232a] select-none touch-none">
        <svg
          viewBox={viewBoxStr}
          className="w-full h-[320px] sm:h-[420px] lg:h-[500px] block cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Full Autodrome Perimeter Fence & Ring Track */}
          {mode === 'full' && (
            <g>
              {/* Outer 2m Fence */}
              <rect
                x="0.3"
                y="0.3"
                width={AUTODROME_WORLD_BOUNDS.widthMeters - 0.6}
                height={AUTODROME_WORLD_BOUNDS.heightMeters - 0.6}
                fill="#22272f"
                stroke="#64748b"
                strokeWidth="0.35"
                strokeDasharray="1.2 0.4"
                rx="0.6"
              />
              {/* Main loop connecting asphalt ring */}
              <path
                d="M 10 31.5 L 58 31.5 L 58 10 L 9 10 L 9 39"
                fill="none"
                stroke="#2c323d"
                strokeWidth="5.2"
                strokeLinejoin="round"
                opacity="0.85"
              />
              <path
                d="M 10 31.5 L 58 31.5 L 58 10 L 9 10 L 9 39"
                fill="none"
                stroke="#facc15"
                strokeWidth="0.12"
                strokeDasharray="1.2 1.2"
                opacity="0.45"
              />
              <text x="1.5" y="43.1" fill="#94a3b8" fontSize="0.95" fontWeight="600">
                Panjara ≥ 2,0 m • Asfalt qoplama • Kuzatuv tizimi • Asosiy kirish/chiqish (START/FINISH yonma-yon)
              </text>
            </g>
          )}

          {/* Optional Meter Grid */}
          {showDevGrid && (
            <g opacity="0.25">
              {Array.from({ length: 70 }).map((_, gx) => (
                <line
                  key={`gx-${gx}`}
                  x1={gx}
                  y1={-5}
                  x2={gx}
                  y2={50}
                  stroke="#94a3b8"
                  strokeWidth={gx % 5 === 0 ? 0.08 : 0.03}
                />
              ))}
              {Array.from({ length: 50 }).map((_, gy) => (
                <line
                  key={`gy-${gy}`}
                  x1={-5}
                  y1={gy}
                  x2={70}
                  y2={gy}
                  stroke="#94a3b8"
                  strokeWidth={gy % 5 === 0 ? 0.08 : 0.03}
                />
              ))}
            </g>
          )}

          {/* Render Each Exercise */}
          {exercisesToRender.map((ex) => {
            const off = mode === 'full' ? ex.worldOffset : { x: 0, y: 0 };
            const isActive = ex.slug === activeExercise.slug;
            const exState = isActive ? snapshot?.exerciseState : undefined;
            const pedPos =
              isActive && exState
                ? getPedestrianWorldPosition(ex, exState, mode === 'full')
                : null;

            return (
              <g
                key={ex.id}
                transform={`translate(${off.x}, ${off.y})`}
                onClick={() => mode === 'full' && onSelectExercise?.(ex.slug)}
                className={mode === 'full' ? 'cursor-pointer' : ''}
              >
                {/* Exercise asphalt pad */}
                <rect
                  x={ex.geometry.bounds.minX}
                  y={ex.geometry.bounds.minY}
                  width={ex.geometry.bounds.maxX - ex.geometry.bounds.minX}
                  height={ex.geometry.bounds.maxY - ex.geometry.bounds.minY}
                  fill="#2b313c"
                  stroke={isActive && mode === 'full' ? '#f59e0b' : '#3b4252'}
                  strokeWidth={isActive && mode === 'full' ? 0.25 : 0.08}
                  rx="0.4"
                />

                {/* Sensor Zones (subtle training visual overlays) */}
                {ex.geometry.zones.map((z) => {
                  const pts = z.polygon.map((p) => `${p.x},${p.y}`).join(' ');
                  let fill = 'transparent';
                  if (z.kind === 'estakada_climb') fill = 'rgba(245, 158, 11, 0.14)';
                  if (z.kind === 'estakada_descent') fill = 'rgba(56, 189, 248, 0.12)';
                  if (z.kind === 'parking_bay' || z.kind === 'reverse_box_bay')
                    fill = 'rgba(16, 185, 129, 0.14)';
                  if (z.kind === 'emergency_trigger_zone') fill = 'rgba(239, 68, 68, 0.10)';
                  if (z.kind === 'railway_tracks') fill = 'rgba(100, 116, 139, 0.25)';

                  return (
                    <polygon
                      key={z.id}
                      points={pts}
                      fill={fill}
                      stroke={z.kind === 'parking_bay' || z.kind === 'reverse_box_bay' ? '#10b981' : 'none'}
                      strokeWidth="0.06"
                      strokeDasharray="0.3 0.2"
                    />
                  );
                })}

                {/* Railway Tracks Visual */}
                {ex.geometry.railway && (
                  <g>
                    <line
                      x1={ex.geometry.railway.trackCenter.x - 0.7}
                      y1={0.3}
                      x2={ex.geometry.railway.trackCenter.x - 0.7}
                      y2={6.5}
                      stroke="#cbd5e1"
                      strokeWidth="0.14"
                    />
                    <line
                      x1={ex.geometry.railway.trackCenter.x + 0.7}
                      y1={0.3}
                      x2={ex.geometry.railway.trackCenter.x + 0.7}
                      y2={6.5}
                      stroke="#cbd5e1"
                      strokeWidth="0.14"
                    />
                    {Array.from({ length: 12 }).map((_, idx) => (
                      <line
                        key={idx}
                        x1={ex.geometry.railway!.trackCenter.x - 1.05}
                        y1={0.5 + idx * 0.55}
                        x2={ex.geometry.railway!.trackCenter.x + 1.05}
                        y2={0.5 + idx * 0.55}
                        stroke="#78350f"
                        strokeWidth="0.16"
                      />
                    ))}
                    {/* Train when active */}
                    {exState?.railwayTrainActive && (
                      <rect
                        x={ex.geometry.railway.trackCenter.x - 1.05}
                        y={-2 + exState.railwayTrainProgress * 7.5}
                        width="2.1"
                        height="4.4"
                        rx="0.3"
                        fill="#ef4444"
                        stroke="#fde047"
                        strokeWidth="0.14"
                      />
                    )}
                  </g>
                )}

                {/* Zebra Crossings */}
                {ex.geometry.zebraCrossings?.map((z, idx) => (
                  <g key={idx}>
                    {[-1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8].map((dy, bIdx) => (
                      <rect
                        key={bIdx}
                        x={z.center.x - z.widthMeters / 2}
                        y={z.center.y + dy - 0.2}
                        width={z.widthMeters}
                        height={0.36}
                        fill="#f8fafc"
                      />
                    ))}
                  </g>
                ))}

                {/* Road Lines (1.1, 1.4, 1.5, 1.12, dashed-yellow) */}
                {ex.geometry.lines.map((line) => {
                  const isViolated = isActive && snapshot?.activeLineViolationIds.includes(line.id);
                  const stroke = isViolated
                    ? '#ef4444'
                    : line.markingCode === '1.4' || line.markingCode === 'dashed-yellow'
                      ? '#facc15'
                      : '#f8fafc';
                  const dash =
                    line.markingCode === '1.5' || line.markingCode === 'dashed-yellow'
                      ? '0.7 0.5'
                      : undefined;

                  return (
                    <g key={line.id}>
                      <line
                        x1={line.start.x}
                        y1={line.start.y}
                        x2={line.end.x}
                        y2={line.end.y}
                        stroke={stroke}
                        strokeWidth={line.widthMeters}
                        strokeDasharray={dash}
                        strokeLinecap="butt"
                      />
                      {line.label && (
                        <text
                          x={line.start.x - 0.85}
                          y={(line.start.y + line.end.y) / 2}
                          fill="#f8fafc"
                          fontSize="0.58"
                          fontWeight="800"
                          textAnchor="middle"
                          transform={`rotate(-90 ${line.start.x - 0.85} ${(line.start.y + line.end.y) / 2})`}
                        >
                          {line.label}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Barriers (Estakada guards, Parked Cars, Box Walls) */}
                {ex.geometry.barriers.map((bar) => {
                  const isHit = isActive && snapshot?.activeCollisionIds.includes(bar.id);
                  const stroke = isHit
                    ? '#ef4444'
                    : bar.kind === 'parked_car'
                      ? '#3b82f6'
                      : bar.kind === 'estakada_guard'
                        ? '#f59e0b'
                        : '#94a3b8';
                  const pts = bar.points.map((p) => `${p.x},${p.y}`).join(' ');
                  return (
                    <g key={bar.id}>
                      <polyline
                        points={pts}
                        fill="none"
                        stroke={stroke}
                        strokeWidth={bar.thicknessMeters}
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}

                {/* Cones */}
                {ex.geometry.cones.map((cone) => {
                  const isHit = isActive && snapshot?.activeCollisionIds.includes(cone.id);
                  return (
                    <g key={cone.id}>
                      <circle
                        cx={cone.position.x}
                        cy={cone.position.y}
                        r={cone.radiusMeters}
                        fill={isHit ? '#ef4444' : '#f97316'}
                        stroke="#ffffff"
                        strokeWidth="0.06"
                      />
                    </g>
                  );
                })}

                {/* Direction Arrows */}
                {ex.geometry.directionArrows.map((arr, idx) => (
                  <g
                    key={idx}
                    transform={`translate(${arr.x}, ${arr.y}) rotate(${arr.headingDeg})`}
                    opacity="0.7"
                  >
                    <line x1="-0.8" y1="0" x2="0.6" y2="0" stroke="#93c5fd" strokeWidth="0.14" />
                    <polygon points="0.95,0 0.3,-0.32 0.3,0.32" fill="#93c5fd" />
                  </g>
                ))}

                {/* Road Sign Markers */}
                {ex.geometry.signs.map((s) => (
                  <g key={s.id} transform={`translate(${s.position.x}, ${s.position.y})`}>
                    <circle cx="0" cy="0" r="0.45" fill="#1e293b" stroke="#f8fafc" strokeWidth="0.08" />
                    <text x="0" y="0.16" textAnchor="middle" fill="#facc15" fontSize="0.34" fontWeight="800">
                      {s.signCode}
                    </text>
                  </g>
                ))}

                {/* Traffic Light */}
                {ex.geometry.trafficLight && (
                  <g
                    transform={`translate(${ex.geometry.trafficLight.position.x}, ${ex.geometry.trafficLight.position.y})`}
                  >
                    <rect x="-0.45" y="-0.45" width="2.0" height="0.9" rx="0.2" fill="#0f172a" stroke="#475569" strokeWidth="0.08" />
                    <circle
                      cx="0"
                      cy="0"
                      r="0.25"
                      fill={(exState?.trafficLightPhase ?? ex.geometry.trafficLight.initialPhase) === 'red' ? '#ef4444' : '#450a0a'}
                    />
                    <circle
                      cx="0.55"
                      cy="0"
                      r="0.25"
                      fill={(exState?.trafficLightPhase ?? ex.geometry.trafficLight.initialPhase) === 'yellow' ? '#facc15' : '#422006'}
                    />
                    <circle
                      cx="1.1"
                      cy="0"
                      r="0.25"
                      fill={(exState?.trafficLightPhase ?? ex.geometry.trafficLight.initialPhase) === 'green' ? '#22c55e' : '#052e16'}
                    />
                  </g>
                )}

                {/* Pedestrian */}
                {pedPos && (
                  <g transform={`translate(${mode === 'full' ? pedPos.x - off.x : pedPos.x}, ${mode === 'full' ? pedPos.y - off.y : pedPos.y})`}>
                    <circle cx="0" cy="0" r="0.38" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.09" />
                    <circle cx="0" cy="0" r="0.16" fill="#0f172a" />
                  </g>
                )}

                {/* Exercise Label */}
                <text
                  x={ex.geometry.bounds.minX + 0.45}
                  y={ex.geometry.bounds.minY + 0.72}
                  fill={isActive ? '#fbbf24' : '#cbd5e1'}
                  fontSize={mode === 'full' ? '0.82' : '0.52'}
                  fontWeight="700"
                >
                  {ex.order}. {ex.shortTitle}
                </text>

                {/* Dev Dimension Labels */}
                {showDevGrid && (
                  <text
                    x={ex.geometry.bounds.maxX - 0.4}
                    y={ex.geometry.bounds.maxY - 0.3}
                    textAnchor="end"
                    fill="#38bdf8"
                    fontSize="0.45"
                  >
                    {(ex.geometry.bounds.maxX - ex.geometry.bounds.minX).toFixed(1)}×
                    {(ex.geometry.bounds.maxY - ex.geometry.bounds.minY).toFixed(1)} m
                  </text>
                )}
              </g>
            );
          })}

          {/* Vehicle OBB + Wheels + Lights */}
          <g transform={`translate(${vehiclePose.x}, ${vehiclePose.y}) rotate(${vehiclePose.headingDeg})`}>
            {/* Front turning wheels */}
            <g transform={`translate(${vehicleDimensions.wheelbaseMeters / 2}, ${-vehicleDimensions.widthMeters / 2 + 0.08}) rotate(${vehiclePose.steerDeg})`}>
              <rect x="-0.32" y="-0.11" width="0.64" height="0.22" rx="0.05" fill="#0f172a" />
            </g>
            <g transform={`translate(${vehicleDimensions.wheelbaseMeters / 2}, ${vehicleDimensions.widthMeters / 2 - 0.08}) rotate(${vehiclePose.steerDeg})`}>
              <rect x="-0.32" y="-0.11" width="0.64" height="0.22" rx="0.05" fill="#0f172a" />
            </g>
            {/* Rear wheels */}
            <rect
              x={-vehicleDimensions.wheelbaseMeters / 2 - 0.32}
              y={-vehicleDimensions.widthMeters / 2 - 0.03}
              width="0.64"
              height="0.22"
              rx="0.05"
              fill="#0f172a"
            />
            <rect
              x={-vehicleDimensions.wheelbaseMeters / 2 - 0.32}
              y={vehicleDimensions.widthMeters / 2 - 0.19}
              width="0.64"
              height="0.22"
              rx="0.05"
              fill="#0f172a"
            />

            {/* Car Body */}
            <rect
              x={-vehicleDimensions.lengthMeters / 2}
              y={-vehicleDimensions.widthMeters / 2}
              width={vehicleDimensions.lengthMeters}
              height={vehicleDimensions.widthMeters}
              rx="0.35"
              fill={hasCollision ? '#dc2626' : hasLineViolation ? '#f59e0b' : '#e2e8f0'}
              stroke={hasCollision || hasLineViolation ? '#fef08a' : '#0f172a'}
              strokeWidth="0.1"
            />
            {/* Windshield & Roof */}
            <rect
              x={-vehicleDimensions.lengthMeters * 0.22}
              y={-vehicleDimensions.widthMeters * 0.38}
              width={vehicleDimensions.lengthMeters * 0.48}
              height={vehicleDimensions.widthMeters * 0.76}
              rx="0.18"
              fill="#1e293b"
            />
            {/* Headlight cones */}
            {snapshot?.controls.headlights && (
              <polygon
                points={`${vehicleDimensions.lengthMeters / 2},-0.6 ${vehicleDimensions.lengthMeters / 2 + 3.5},-1.4 ${vehicleDimensions.lengthMeters / 2 + 3.5},1.4 ${vehicleDimensions.lengthMeters / 2},0.6`}
                fill="rgba(254, 240, 138, 0.22)"
              />
            )}
            {/* Brake lights */}
            {(snapshot?.controls.brake ?? 0) > 0.1 && (
              <>
                <rect x={-vehicleDimensions.lengthMeters / 2 - 0.05} y={-0.65} width="0.12" height="0.32" fill="#ef4444" />
                <rect x={-vehicleDimensions.lengthMeters / 2 - 0.05} y={0.33} width="0.12" height="0.32" fill="#ef4444" />
              </>
            )}
            {/* Turn / Hazard Indicators */}
            {(snapshot?.controls.leftIndicator || snapshot?.controls.hazardLights) && (
              <>
                <circle cx={vehicleDimensions.lengthMeters / 2 - 0.15} cy={-vehicleDimensions.widthMeters / 2 + 0.15} r="0.14" fill="#f59e0b" />
                <circle cx={-vehicleDimensions.lengthMeters / 2 + 0.15} cy={-vehicleDimensions.widthMeters / 2 + 0.15} r="0.14" fill="#f59e0b" />
              </>
            )}
            {(snapshot?.controls.rightIndicator || snapshot?.controls.hazardLights) && (
              <>
                <circle cx={vehicleDimensions.lengthMeters / 2 - 0.15} cy={vehicleDimensions.widthMeters / 2 - 0.15} r="0.14" fill="#f59e0b" />
                <circle cx={-vehicleDimensions.lengthMeters / 2 + 0.15} cy={vehicleDimensions.widthMeters / 2 - 0.15} r="0.14" fill="#f59e0b" />
              </>
            )}
          </g>
        </svg>

        {/* Bottom-left Scale Bar & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-900/90 px-3 py-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-10 border-x-2 border-b-2 border-white" />
              <span>5 m o‘lchov</span>
            </div>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-white" /> 1.1 / 1.12
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-yellow-400" /> Sariq chegara
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Konus
            </span>
          </div>
          {mode === 'full' && (
            <span className="text-amber-300">Mashq ustiga bosing — yaqinlashtirish / tanlash</span>
          )}
        </div>
      </div>
    </div>
  );
}
