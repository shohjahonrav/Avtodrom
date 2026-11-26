'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VehicleController } from '@/features/vehicle/VehicleController';
import { VehicleModel, type VehicleModelHandle } from '@/features/vehicle/VehicleModel';

export function Vehicle({
  controller,
  vehicleGroupRef,
}: {
  controller: VehicleController | null;
  vehicleGroupRef: React.RefObject<THREE.Group | null>;
}) {
  const modelHandleRef = useRef<VehicleModelHandle | null>(null);

  useFrame((state) => {
    if (!controller || !vehicleGroupRef.current) return;
    const t = controller.chassisBody.translation();
    const r = controller.chassisBody.rotation();
    vehicleGroupRef.current.position.set(t.x, t.y, t.z);
    vehicleGroupRef.current.quaternion.set(r.x, r.y, r.z, r.w);

    const tel = controller.getTelemetry();
    const blinkOn = Math.floor(state.clock.elapsedTime * 2) % 2 === 0;
    modelHandleRef.current?.updateVisuals({
      wheelPoses: controller.getWheelPoses(),
      steeringInput: tel.steeringInput,
      braking: tel.brake > 0.1 || tel.handbrake,
      headlights: tel.headlights,
      leftIndicator: tel.leftIndicator,
      rightIndicator: tel.rightIndicator,
      hazardLights: tel.hazardLights,
      blinkOn,
    });
  });

  return (
    <group ref={vehicleGroupRef} name="player-vehicle-root">
      <VehicleModel
        onReady={(h) => {
          modelHandleRef.current = h;
        }}
      />
      {/* Headlight Spotlight Cones */}
      <pointLight position={[0, 0.3, -2.1]} intensity={0.25} distance={10} color="#fffbeb" />
    </group>
  );
}
