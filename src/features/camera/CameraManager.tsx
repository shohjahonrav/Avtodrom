'use client';

import React, { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { updateChaseCamera } from '@/features/camera/ChaseCamera';
import { updateDriverCamera } from '@/features/camera/DriverCamera';
import { updateTopDownCamera } from '@/features/camera/TopDownCamera';
import { useSimulatorStore } from '@/store/simulatorStore';

export function CameraManager({
  vehicleGroupRef,
}: {
  vehicleGroupRef: React.RefObject<THREE.Group | null>;
}) {
  const cameraMode = useSimulatorStore((s) => s.cameraMode);
  const { camera, gl } = useThree();
  const chaseZoomRef = useRef(6.2);
  const topZoomRef = useRef(26.0);
  const orbitRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const dom = gl.domElement;
    const onWheel = (e: WheelEvent) => {
      if (cameraMode === 'chase') {
        chaseZoomRef.current = Math.max(3.8, Math.min(13.0, chaseZoomRef.current + e.deltaY * 0.004));
      } else if (cameraMode === 'topdown') {
        topZoomRef.current = Math.max(12.0, Math.min(60.0, topZoomRef.current + e.deltaY * 0.015));
      }
    };
    dom.addEventListener('wheel', onWheel, { passive: true });
    return () => dom.removeEventListener('wheel', onWheel);
  }, [gl.domElement, cameraMode]);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    const vGroup = vehicleGroupRef.current;
    if (!vGroup) return;

    const perspCam = camera as THREE.PerspectiveCamera;
    if (cameraMode === 'chase') {
      updateChaseCamera({
        camera: perspCam,
        vehiclePos: vGroup.position,
        vehicleQuat: vGroup.quaternion,
        distance: chaseZoomRef.current,
        height: 2.3 + (chaseZoomRef.current - 6.2) * 0.25,
        dt,
      });
    } else if (cameraMode === 'driver') {
      updateDriverCamera({
        camera: perspCam,
        vehiclePos: vGroup.position,
        vehicleQuat: vGroup.quaternion,
      });
    } else if (cameraMode === 'topdown') {
      updateTopDownCamera({
        camera: perspCam,
        vehiclePos: vGroup.position,
        height: topZoomRef.current,
        dt,
      });
    } else if (cameraMode === 'free' && orbitRef.current) {
      orbitRef.current.target.lerp(vGroup.position, 0.12);
      orbitRef.current.update();
    }
  });

  if (cameraMode === 'free') {
    return (
      <OrbitControls
        ref={orbitRef}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2 - 0.04}
        minDistance={3}
        maxDistance={75}
      />
    );
  }

  return null;
}
