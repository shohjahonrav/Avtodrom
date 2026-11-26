'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  AUTODROME_CONES,
  AUTODROME_SIGNS_3D,
  AUTODROME_WALLS,
} from '@/config/autodrom.config';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import {
  B_LANE_CENTER_Z,
  CD_LANE_CENTER_Z,
  PED_ZEBRA_CENTER_X,
} from '@/config/markings';
import { createSignTexture } from '@/features/autodrom/AutodromBuilder';
import { PhysicsWorld } from '@/physics/PhysicsWorld';
import { useSimulatorStore } from '@/store/simulatorStore';

function RoadSignMesh({
  code,
  position,
  rotationYDeg,
}: {
  code: string;
  position: [number, number, number];
  rotationYDeg: number;
}) {
  const tex = useMemo(() => createSignTexture(code), [code]);
  useEffect(() => () => tex.dispose(), [tex]);

  return (
    <group position={position} rotation={[0, (rotationYDeg * Math.PI) / 180, 0]}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2.3, 10]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.1, 0.045]} castShadow>
        <planeGeometry args={[0.72, 0.72]} />
        <meshStandardMaterial map={tex} transparent roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function Obstacles({ physicsWorld }: { physicsWorld: PhysicsWorld | null }) {
  const coneRefs = useRef<(THREE.Mesh | null)[]>([]);
  const trafficLightPhase = useSimulatorStore((s) => s.trafficLightPhase);
  const pedestrianCrossingActive = useSimulatorStore((s) => s.pedestrianCrossingActive);
  const pedestrianProgress = useSimulatorStore((s) => s.pedestrianProgress);
  const railwayTrainActive = useSimulatorStore((s) => s.railwayTrainActive);
  const railwayTrainProgress = useSimulatorStore((s) => s.railwayTrainProgress);

  useFrame(() => {
    if (!physicsWorld) return;
    for (let i = 0; i < physicsWorld.cones.length; i++) {
      const c = physicsWorld.cones[i];
      const mesh = coneRefs.current[i];
      if (!mesh) continue;
      const t = c.body.translation();
      const r = c.body.rotation();
      mesh.position.set(t.x, t.y, t.z);
      mesh.quaternion.set(r.x, r.y, r.z, r.w);
    }
  });

  // Central M5 intersection position + M2 South Zebra + M8 Eastern Railway
  const intCenter = useMemo(() => uvToWorld({ u: 0.498, v: 0.498 }, MAP_DIMENSIONS), []);
  const m8Rail = useMemo(() => uvToWorld({ u: 0.968, v: 0.222 }, MAP_DIMENSIONS), []);

  const pedZ = (CD_LANE_CENTER_Z - 1.3) + pedestrianProgress * (B_LANE_CENTER_Z - CD_LANE_CENTER_Z + 2.6);
  const trainX = m8Rail.x - 6.0 + railwayTrainProgress * 12.0;

  // 2 traffic light poles at diagonal corners of Central M5 intersection
  const tlPoles: [number, number][] = [
    [intCenter.x - 3.6, intCenter.z - 3.6],
    [intCenter.x + 3.6, intCenter.z + 3.6],
  ];

  return (
    <group name="autodrom-obstacles">
      {AUTODROME_WALLS.map((w) => (
        <mesh
          key={w.id}
          position={w.center}
          rotation={[0, ((w.rotationYDeg ?? 0) * Math.PI) / 180, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={w.size} />
          <meshStandardMaterial color={w.color ?? '#64748b'} roughness={0.8} metalness={0.1} />
        </mesh>
      ))}

      {AUTODROME_CONES.map((c, idx) => (
        <mesh
          key={c.id}
          ref={(el) => {
            coneRefs.current[idx] = el;
          }}
          position={[c.position[0], c.position[1] + c.heightMeters / 2, c.position[2]]}
          castShadow
        >
          <coneGeometry args={[c.radiusMeters, c.heightMeters, 14]} />
          <meshStandardMaterial color="#f97316" roughness={0.5} />
        </mesh>
      ))}

      {AUTODROME_SIGNS_3D.map((s) => (
        <RoadSignMesh
          key={s.id}
          code={s.code}
          position={s.position}
          rotationYDeg={s.rotationYDeg}
        />
      ))}

      {/* Central Intersection (M5) Traffic Lights */}
      {tlPoles.map(([px, pz], idx) => (
        <group key={idx} position={[px, 0, pz]} rotation={[0, idx === 0 ? 0 : Math.PI, 0]}>
          <mesh position={[0, 1.9, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 3.8, 10]} />
            <meshStandardMaterial color="#334155" metalness={0.6} />
          </mesh>
          <mesh position={[0, 3.5, 0]} castShadow>
            <boxGeometry args={[0.45, 1.15, 0.35]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 3.85, 0.19]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color={trafficLightPhase === 'red' ? '#ef4444' : '#450a0a'}
              emissive={trafficLightPhase === 'red' ? '#ef4444' : '#000000'}
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[0, 3.5, 0.19]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color={trafficLightPhase === 'yellow' ? '#facc15' : '#422006'}
              emissive={trafficLightPhase === 'yellow' ? '#facc15' : '#000000'}
              emissiveIntensity={2}
            />
          </mesh>
          <mesh position={[0, 3.15, 0.19]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color={trafficLightPhase === 'green' ? '#22c55e' : '#052e16'}
              emissive={trafficLightPhase === 'green' ? '#22c55e' : '#000000'}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {/* M8 Eastern Railway Crossing Tracks */}
      <group position={[m8Rail.x, 0.02, m8Rail.z]} name="eastern-railway-crossing">
        <mesh position={[0, 0, -0.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.2, 0.12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[6.2, 0.12]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.35} />
        </mesh>
        {[-2.5, -1.7, -0.9, -0.1, 0.7, 1.5, 2.3].map((rx, idx) => (
          <mesh key={idx} position={[rx, -0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.2, 1.8]} />
            <meshStandardMaterial color="#52525b" />
          </mesh>
        ))}
      </group>

      {railwayTrainActive && (
        <mesh position={[trainX, 1.2, m8Rail.z]} castShadow>
          <boxGeometry args={[7.5, 2.4, 2.2]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.4} />
        </mesh>
      )}

      {/* Animated Pedestrian at M2 South Zebra */}
      {pedestrianCrossingActive && (
        <group position={[PED_ZEBRA_CENTER_X, 0, pedZ]}>
          <mesh position={[0, 0.8, 0]} castShadow>
            <capsuleGeometry args={[0.2, 0.8, 6, 12]} />
            <meshStandardMaterial color="#38bdf8" />
          </mesh>
          <mesh position={[0, 1.55, 0]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#fde68a" />
          </mesh>
        </group>
      )}
    </group>
  );
}
