'use client';

import React, { useEffect, useMemo } from 'react';
import { AUTODROME_ROADS } from '@/config/autodrom.config';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import {
  B_LANE_CENTER_Z,
  CD_LANE_CENTER_Z,
  EST_CLIMB_RUN_M,
  EST_HEIGHT_M,
  ESTAKADA_M3_SPEC,
  LANE_DIVIDER_Z,
  START_LINE_X,
} from '@/config/markings';
import {
  buildAutodromSceneData,
  createRoadPaintDecalTexture,
} from '@/features/autodrom/AutodromBuilder';
import { CollisionZones } from '@/features/autodrom/CollisionZones';
import { buildCurbArcFromUV, buildCurbRibbonGeometry } from '@/features/autodrom/CurbGenerator';
import { buildIslandGeometry } from '@/features/autodrom/IslandGenerator';
import {
  buildDirectionArrowGeometry,
  buildLeftTurnArrowGeometry,
} from '@/features/autodrom/MarkingGenerator';
import { Obstacles } from '@/features/autodrom/Obstacles';
import {
  buildRoadRibbonGeometry,
  createAsphaltMapTexture,
  createGrassIslandTexture,
  sampleRoadCenterline,
} from '@/features/autodrom/RoadGenerator';
import { PhysicsWorld } from '@/physics/PhysicsWorld';

export function Autodrom({ physicsWorld }: { physicsWorld: PhysicsWorld | null }) {
  const sceneData = useMemo(() => buildAutodromSceneData(), []);
  const asphaltTex = useMemo(() => createAsphaltMapTexture(), []);
  const grassTex = useMemo(() => createGrassIslandTexture(), []);
  const arrowGeo = useMemo(() => buildDirectionArrowGeometry(1.35), []);
  const leftArrowGeo = useMemo(() => buildLeftTurnArrowGeometry(1.35), []);
  const startDecalTex = useMemo(() => createRoadPaintDecalTexture('START'), []);
  const stopDecalTex = useMemo(() => createRoadPaintDecalTexture('STOP'), []);
  const bDecalTex = useMemo(() => createRoadPaintDecalTexture('B'), []);
  const cdDecalTex = useMemo(() => createRoadPaintDecalTexture('C/D'), []);

  const islandMeshes = useMemo(
    () =>
      sceneData.islands.map((isl) => {
        const built = buildIslandGeometry(isl);
        const curbGeo = buildCurbRibbonGeometry(
          built.polygonXZ,
          0.22,
          isl.curbHeightMeters + 0.015,
          true
        );
        return { isl, geometry: built.geometry, curbGeo };
      }),
    [sceneData.islands]
  );

  const roadGeometries = useMemo(
    () =>
      sceneData.roads.map((road) => ({
        id: road.id,
        geometry: buildRoadRibbonGeometry(sampleRoadCenterline(road), road.widthMeters, 0.004),
      })),
    [sceneData.roads]
  );

  const parkingCurbGeos = useMemo(
    () =>
      sceneData.parkingAreas.map((area) => ({
        id: area.id,
        geometry: buildCurbArcFromUV(area.curbArcUV, 0.26, 0.14),
      })),
    [sceneData.parkingAreas]
  );

  useEffect(() => {
    return () => {
      asphaltTex.dispose();
      grassTex.dispose();
      arrowGeo.dispose();
      leftArrowGeo.dispose();
      startDecalTex.dispose();
      stopDecalTex.dispose();
      bDecalTex.dispose();
      cdDecalTex.dispose();
      islandMeshes.forEach((m) => {
        m.geometry.dispose();
        m.curbGeo.dispose();
      });
      roadGeometries.forEach((r) => r.geometry.dispose());
      parkingCurbGeos.forEach((p) => p.geometry.dispose());
    };
  }, [
    asphaltTex,
    grassTex,
    arrowGeo,
    leftArrowGeo,
    startDecalTex,
    stopDecalTex,
    bDecalTex,
    cdDecalTex,
    islandMeshes,
    roadGeometries,
    parkingCurbGeos,
  ]);

  return (
    <group name="autodrom-world">
      {/* Surrounding exterior ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[200, 150]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.95} />
      </mesh>

      {/* Main Asphalt Base Pad (110.0m x 68.54m) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[MAP_DIMENSIONS.mapWidthMeters, MAP_DIMENSIONS.mapLengthMeters]} />
        <meshStandardMaterial map={asphaltTex} roughness={0.88} metalness={0.04} />
      </mesh>

      {/* Estakada (M3) 3D Ramps & Plateau */}
      {AUTODROME_ROADS.filter((r) => r.id !== 'ground-asphalt').map((road) => (
        <mesh
          key={road.id}
          position={road.center}
          rotation={[0, 0, road.slopeRad ? -road.slopeRad : 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[road.size[0], 0.1, road.size[1]]} />
          <meshStandardMaterial color={road.color ?? '#475569'} roughness={0.82} />
        </mesh>
      ))}

      {/* Procedural Road Ribbons */}
      {roadGeometries.map((r) => (
        <mesh key={r.id} geometry={r.geometry} receiveShadow>
          <meshStandardMaterial
            map={asphaltTex}
            color="#666d78"
            roughness={0.86}
            polygonOffset
            polygonOffsetFactor={-1}
          />
        </mesh>
      ))}

      {/* 8 Concave/Curved Green Islands + Curbs */}
      {islandMeshes.map(({ isl, geometry, curbGeo }) => (
        <group key={isl.id}>
          <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial map={grassTex} color="#2c742f" roughness={0.94} />
          </mesh>
          <mesh geometry={curbGeo} castShadow receiveShadow>
            <meshStandardMaterial color="#9ca3af" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* South-West Diagonal Parking Rounded Curb */}
      {parkingCurbGeos.map((p) => (
        <mesh key={p.id} geometry={p.geometry} castShadow receiveShadow>
          <meshStandardMaterial color="#cbd5e1" roughness={0.75} />
        </mesh>
      ))}

      {/* Markings, Yellow Boundaries, Chevrons, Parking Stall Lines */}
      {sceneData.markingLines.map((m) => (
        <mesh key={m.id} position={m.position} rotation={[-Math.PI / 2, 0, m.angleY]}>
          <planeGeometry args={[m.length, m.width]} />
          <meshBasicMaterial color={m.color} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}

      {/* 5 Zebra Crossings */}
      {sceneData.zebraStripes.map((s) => (
        <mesh key={s.id} position={s.position} rotation={[-Math.PI / 2, 0, s.angleY]}>
          <planeGeometry args={[s.width, s.length]} />
          <meshBasicMaterial color="#f8fafc" polygonOffset polygonOffsetFactor={-3} />
        </mesh>
      ))}

      {/* Directional Arrows */}
      {sceneData.arrows.map((arr) => {
        const p = uvToWorld(arr.positionUV, MAP_DIMENSIONS);
        return (
          <mesh
            key={arr.id}
            geometry={arr.kind === 'left_turn' ? leftArrowGeo : arrowGeo}
            position={[p.x, MAP_DIMENSIONS.markingElevationOffsetY + 0.004, p.z]}
            rotation={[0, (-arr.headingDeg * Math.PI) / 180, 0]}
          >
            <meshBasicMaterial color="#f8fafc" polygonOffset polygonOffsetFactor={-3} />
          </mesh>
        );
      })}

      {/* Asphalt Paint Decals: START, STOP (M3 Estakada), B & C/D 2-lane indicators */}
      {(() => {
        const yGround = MAP_DIMENSIONS.markingElevationOffsetY + 0.006;
        const estStopDecalX = ESTAKADA_M3_SPEC.stopLineX - 1.0;
        const estStopDecalY =
          (EST_HEIGHT_M * (estStopDecalX - ESTAKADA_M3_SPEC.climbCenter[0] + EST_CLIMB_RUN_M / 2)) /
            EST_CLIMB_RUN_M +
          0.025;
        const eastCD = uvToWorld({ u: 0.938, v: 0.745 }, MAP_DIMENSIONS);
        const eastB = uvToWorld({ u: 0.972, v: 0.745 }, MAP_DIMENSIONS);
        const eastBM4 = uvToWorld({ u: 0.972, v: 0.630 }, MAP_DIMENSIONS);
        return (
          <group name="road-paint-decals">
            {/* START decal right before START line */}
            <mesh
              position={[START_LINE_X - 1.15, yGround, B_LANE_CENTER_Z]}
              rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            >
              <planeGeometry args={[2.3, 0.86]} />
              <meshBasicMaterial map={startDecalTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
            </mesh>
            {/* Continuous solid white 1.1 divider line over Estakada climb, plateau & descent */}
            <group
              position={[ESTAKADA_M3_SPEC.climbCenter[0], EST_HEIGHT_M / 2 + 0.012, LANE_DIVIDER_Z]}
              rotation={[0, 0, ESTAKADA_M3_SPEC.slopeRad]}
            >
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[Math.hypot(EST_CLIMB_RUN_M, EST_HEIGHT_M), 0.14]} />
                <meshBasicMaterial color="#f8fafc" polygonOffset polygonOffsetFactor={-4} />
              </mesh>
            </group>
            <mesh
              position={[ESTAKADA_M3_SPEC.plateauCenter[0], EST_HEIGHT_M + 0.012, LANE_DIVIDER_Z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[ESTAKADA_M3_SPEC.plateauLengthMeters, 0.14]} />
              <meshBasicMaterial color="#f8fafc" polygonOffset polygonOffsetFactor={-4} />
            </mesh>
            <group
              position={[ESTAKADA_M3_SPEC.descentCenter[0], EST_HEIGHT_M / 2 + 0.012, LANE_DIVIDER_Z]}
              rotation={[0, 0, -ESTAKADA_M3_SPEC.slopeRad]}
            >
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[Math.hypot(EST_CLIMB_RUN_M, EST_HEIGHT_M), 0.14]} />
                <meshBasicMaterial color="#f8fafc" polygonOffset polygonOffsetFactor={-4} />
              </mesh>
            </group>
            {/* STOP decals on Estakada climb before upper stop line (C/D & B lanes) */}
            {[CD_LANE_CENTER_Z, B_LANE_CENTER_Z].map((laneZ, idx) => (
              <group
                key={idx}
                position={[estStopDecalX, estStopDecalY, laneZ]}
                rotation={[0, 0, ESTAKADA_M3_SPEC.slopeRad]}
              >
                <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                  <planeGeometry args={[2.0, 0.78]} />
                  <meshBasicMaterial map={stopDecalTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
                </mesh>
              </group>
            ))}
            {/* C/D and B 2-lane road labels along southern corridor & east curve toward M6 */}
            {[-24.5, -14.5, 21.5].map((lx, idx) => (
              <React.Fragment key={idx}>
                <mesh
                  position={[lx, yGround, CD_LANE_CENTER_Z]}
                  rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                >
                  <planeGeometry args={[1.6, 0.65]} />
                  <meshBasicMaterial map={cdDecalTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
                </mesh>
                <mesh
                  position={[lx, yGround, B_LANE_CENTER_Z]}
                  rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                >
                  <planeGeometry args={[1.5, 0.65]} />
                  <meshBasicMaterial map={bDecalTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
                </mesh>
              </React.Fragment>
            ))}
            <mesh position={[eastCD.x, yGround, eastCD.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.5, 0.65]} />
              <meshBasicMaterial map={cdDecalTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
            </mesh>
            <mesh position={[eastB.x, yGround, eastB.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.4, 0.65]} />
              <meshBasicMaterial map={bDecalTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
            </mesh>
            <mesh position={[eastBM4.x, yGround, eastBM4.z]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[1.4, 0.65]} />
              <meshBasicMaterial map={bDecalTex} transparent depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
            </mesh>
          </group>
        );
      })()}

      <Obstacles physicsWorld={physicsWorld} />
      <CollisionZones />
    </group>
  );
}
