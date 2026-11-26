'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import { COBALT_VEHICLE_CONFIG } from '@/config/vehicle.config';
import { Autodrom } from '@/features/autodrom/Autodrom';
import { CameraManager } from '@/features/camera/CameraManager';
import { ExamManager } from '@/features/examination/ExamManager';
import { Vehicle } from '@/features/vehicle/Vehicle';
import { VehicleController } from '@/features/vehicle/VehicleController';
import { VehicleInputManager } from '@/features/vehicle/VehicleInput';
import { PHYSICS_CONFIG } from '@/physics/PhysicsConfig';
import { PhysicsWorld } from '@/physics/PhysicsWorld';
import { useSimulatorStore } from '@/store/simulatorStore';

function SimulationLoop({
  physicsWorld,
  controller,
  inputManager,
  examManager,
  vehicleGroupRef,
}: {
  physicsWorld: PhysicsWorld;
  controller: VehicleController;
  inputManager: VehicleInputManager;
  examManager: ExamManager;
  vehicleGroupRef: React.RefObject<THREE.Group | null>;
}) {
  const accumulatorRef = useRef(0);
  const hudTimerRef = useRef(0);

  const paused = useSimulatorStore((s) => s.paused);
  const driveMode = useSimulatorStore((s) => s.driveMode);
  const examRules = useSimulatorStore((s) => s.examRules);
  const setTelemetry = useSimulatorStore((s) => s.setTelemetry);
  const setExamProgress = useSimulatorStore((s) => s.setExamProgress);
  const setStatusHint = useSimulatorStore((s) => s.setStatusHint);

  useFrame((_, delta) => {
    if (paused) return;

    const frameDt = Math.min(PHYSICS_CONFIG.maxAccumulatorSec, delta);
    accumulatorRef.current += frameDt;

    const input = inputManager.getContinuousState();
    let stalledThisFrame = false;

    // Fixed 60 Hz physics step independent of rendering FPS
    while (accumulatorRef.current >= PHYSICS_CONFIG.fixedTimestep) {
      const stepRes = controller.step(input, PHYSICS_CONFIG.fixedTimestep);
      if (stepRes.justStalled) stalledThisFrame = true;

      physicsWorld.step();

      const tel = controller.getTelemetry();
      const contacts = physicsWorld.getActiveVehicleContacts();

      examManager.step({
        dt: PHYSICS_CONFIG.fixedTimestep,
        mode: driveMode,
        telemetry: tel,
        vehicleConfig: COBALT_VEHICLE_CONFIG,
        rapierContacts: contacts,
        rules: examRules,
        justStalled: stepRes.justStalled,
      });

      accumulatorRef.current -= PHYSICS_CONFIG.fixedTimestep;
    }

    if (stalledThisFrame) {
      setStatusHint('Dvigatel o‘chib qoldi! Shift + N ga olib I tugmasi bilan qayta yoqing.');
    }

    // Throttle React/Zustand HUD updates to ~20 Hz to prevent unnecessary React rerenders
    hudTimerRef.current += frameDt;
    if (hudTimerRef.current >= 0.05) {
      hudTimerRef.current = 0;
      setTelemetry(controller.getTelemetry());
      const es = examManager.state;
      setExamProgress({
        examElapsedSec: es.elapsedSec,
        currentExerciseIndex: es.currentExerciseIndex,
        completedExerciseIds: es.completedExerciseIds,
        violations: es.violations,
        examFinished: es.finished,
        trafficLightPhase: es.trafficLightPhase,
        pedestrianCrossingActive: es.pedestrianCrossingActive,
        pedestrianProgress: es.pedestrianProgress,
        railwayTrainActive: es.railwayTrainActive,
        railwayTrainProgress: es.railwayTrainProgress,
        emergencyAlertActive: es.emergencyAlertActive,
      });
    }
  });

  return (
    <>
      <Autodrom physicsWorld={physicsWorld} />
      <Vehicle controller={controller} vehicleGroupRef={vehicleGroupRef} />
      <CameraManager vehicleGroupRef={vehicleGroupRef} />
    </>
  );
}

export function SimulatorCanvas({
  physicsWorld,
  controller,
  inputManager,
  examManager,
}: {
  physicsWorld: PhysicsWorld | null;
  controller: VehicleController | null;
  inputManager: VehicleInputManager | null;
  examManager: ExamManager | null;
}) {
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const startPose = EXAM_EXERCISES_ORDER[0].spawnPose;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        fov: 58,
        near: 0.15,
        far: 320,
        position: [startPose.position[0] - 6, 3.0, startPose.position[2]],
      }}
      className="w-full h-full block bg-sky-950"
    >
      <color attach="background" args={['#87b5d9']} />
      <fog attach="fog" args={['#87b5d9', 85, 210]} />

      <ambientLight intensity={0.65} />
      <hemisphereLight args={['#e0f2fe', '#334155', 0.6]} />
      <directionalLight
        position={[35, 55, 28]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-65}
        shadow-camera-right={65}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-near={5}
        shadow-camera-far={160}
        shadow-bias={-0.0005}
      />

      <Suspense fallback={null}>
        {physicsWorld && controller && inputManager && examManager ? (
          <SimulationLoop
            physicsWorld={physicsWorld}
            controller={controller}
            inputManager={inputManager}
            examManager={examManager}
            vehicleGroupRef={vehicleGroupRef}
          />
        ) : (
          <Autodrom physicsWorld={null} />
        )}
      </Suspense>
    </Canvas>
  );
}
