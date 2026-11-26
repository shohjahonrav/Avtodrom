'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import {
  COBALT_GLB_WHEEL_PIVOTS,
  COBALT_VEHICLE_CONFIG,
} from '@/config/vehicle.config';
import type { WheelPose } from '@/features/vehicle/VehicleController';

const WHEEL_GROUP_MAP: Record<string, keyof typeof COBALT_GLB_WHEEL_PIVOTS> = {
  'sentinel.012': 'fl',
  'sentinel.013': 'fl',
  'sentinel.014': 'fl',
  'sentinel.015': 'fl',
  'sentinel.001': 'fr',
  'sentinel.002': 'fr',
  'sentinel.003': 'fr',
  wheel_rf_dummy: 'fr',
  'sentinel.008': 'rl',
  'sentinel.009': 'rl',
  'sentinel.010': 'rl',
  'sentinel.011': 'rl',
  'sentinel.004': 'rr',
  'sentinel.005': 'rr',
  'sentinel.006': 'rr',
  'sentinel.007': 'rr',
};

export interface VehicleModelHandle {
  updateVisuals: (params: {
    wheelPoses: WheelPose[];
    steeringInput: number;
    braking: boolean;
    headlights: boolean;
    leftIndicator: boolean;
    rightIndicator: boolean;
    hazardLights: boolean;
    blinkOn: boolean;
  }) => void;
}

export function VehicleModel({
  onReady,
}: {
  onReady?: (handle: VehicleModelHandle) => void;
}) {
  const gltf = useGLTF(COBALT_VEHICLE_CONFIG.modelPath, true, true, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  const containerRef = useRef<THREE.Group>(null);

  const setup = useMemo(() => {
    const cloned = gltf.scene.clone(true);
    cloned.updateMatrixWorld(true);

    const steerGroups: Record<'fl' | 'fr' | 'rl' | 'rr', THREE.Group> = {
      fl: new THREE.Group(),
      fr: new THREE.Group(),
      rl: new THREE.Group(),
      rr: new THREE.Group(),
    };
    const spinGroups: Record<'fl' | 'fr' | 'rl' | 'rr', THREE.Group> = {
      fl: new THREE.Group(),
      fr: new THREE.Group(),
      rl: new THREE.Group(),
      rr: new THREE.Group(),
    };

    (Object.keys(COBALT_GLB_WHEEL_PIVOTS) as Array<keyof typeof COBALT_GLB_WHEEL_PIVOTS>).forEach(
      (key) => {
        const p = COBALT_GLB_WHEEL_PIVOTS[key];
        steerGroups[key].name = `steer_${key}`;
        steerGroups[key].position.set(p.x, p.y, p.z);
        spinGroups[key].name = `spin_${key}`;
        steerGroups[key].add(spinGroups[key]);
        cloned.add(steerGroups[key]);
      }
    );
    cloned.updateMatrixWorld(true);

    const wheelNodesToAttach: { node: THREE.Object3D; corner: 'fl' | 'fr' | 'rl' | 'rr' }[] = [];
    let steeringWheelNode: THREE.Object3D | null = null;
    const brakeLightMaterials: THREE.MeshStandardMaterial[] = [];
    const frontLightMaterials: THREE.MeshStandardMaterial[] = [];

    cloned.traverse((obj) => {
      if (obj.name in WHEEL_GROUP_MAP) {
        wheelNodesToAttach.push({ node: obj, corner: WHEEL_GROUP_MAP[obj.name] });
      }
      if (obj.name === 'steering_ok') {
        steeringWheelNode = obj;
      }
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        const mat = obj.material as THREE.MeshStandardMaterial | undefined;
        if (mat && mat.name) {
          if (/rear_light/i.test(mat.name)) {
            const clonedMat = mat.clone();
            obj.material = clonedMat;
            brakeLightMaterials.push(clonedMat);
          } else if (/front_light/i.test(mat.name)) {
            const clonedMat = mat.clone();
            obj.material = clonedMat;
            frontLightMaterials.push(clonedMat);
          }
        }
      }
    });

    for (const item of wheelNodesToAttach) {
      spinGroups[item.corner].attach(item.node);
    }

    const initialSteerQuat = steeringWheelNode
      ? (steeringWheelNode as THREE.Object3D).quaternion.clone()
      : null;

    return {
      cloned,
      steerGroups,
      spinGroups,
      steeringWheelNode: steeringWheelNode as THREE.Object3D | null,
      initialSteerQuat,
      brakeLightMaterials,
      frontLightMaterials,
    };
  }, [gltf.scene]);

  useEffect(() => {
    const handle: VehicleModelHandle = {
      updateVisuals: ({
        wheelPoses,
        steeringInput,
        braking,
        headlights,
      }) => {
        const order: Array<'fl' | 'fr' | 'rl' | 'rr'> = ['fl', 'fr', 'rl', 'rr'];
        for (let i = 0; i < 4; i++) {
          const key = order[i];
          const pose = wheelPoses[i];
          if (!pose) continue;
          const basePivotY = COBALT_GLB_WHEEL_PIVOTS[key].y;
          // Map physics suspension delta onto wheel vertical travel
          const targetY = pose.position[1] / COBALT_VEHICLE_CONFIG.modelScale + 0.08;
          setup.steerGroups[key].position.y = THREE.MathUtils.lerp(
            basePivotY,
            targetY,
            0.85
          );
          if (i < 2) {
            setup.steerGroups[key].rotation.y = pose.steerAngleRad;
          }
          setup.spinGroups[key].rotation.x = -pose.spinAngleRad;
        }

        if (setup.steeringWheelNode && setup.initialSteerQuat) {
          const wheelRot = new THREE.Quaternion().setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            -steeringInput * Math.PI * 1.4
          );
          setup.steeringWheelNode.quaternion.copy(setup.initialSteerQuat).multiply(wheelRot);
        }

        for (const m of setup.brakeLightMaterials) {
          m.emissive.setHex(braking ? 0xff1a1a : 0x330000);
          m.emissiveIntensity = braking ? 2.4 : 0.25;
        }
        for (const m of setup.frontLightMaterials) {
          m.emissive.setHex(headlights ? 0xfffbeb : 0x222222);
          m.emissiveIntensity = headlights ? 2.2 : 0.1;
        }
      },
    };
    onReady?.(handle);
  }, [setup, onReady]);

  return (
    <group
      ref={containerRef}
      scale={COBALT_VEHICLE_CONFIG.modelScale}
      name="cobalt-vehicle-model"
    >
      <primitive object={setup.cloned} />
    </group>
  );
}

useGLTF.preload(COBALT_VEHICLE_CONFIG.modelPath);
