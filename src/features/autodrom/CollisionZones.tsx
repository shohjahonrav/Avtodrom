'use client';

import React from 'react';
import { EXAM_EXERCISES_ORDER } from '@/config/autodrom.config';
import { useSimulatorStore } from '@/store/simulatorStore';

export function CollisionZones() {
  const driveMode = useSimulatorStore((s) => s.driveMode);
  const currentExerciseIndex = useSimulatorStore((s) => s.currentExerciseIndex);
  const examFinished = useSimulatorStore((s) => s.examFinished);

  if (driveMode !== 'exam' || examFinished) return null;

  const activeEx = EXAM_EXERCISES_ORDER[currentExerciseIndex];
  if (!activeEx) return null;

  return (
    <group name="active-checkpoint-beacon">
      <mesh
        position={[
          activeEx.checkpointCenter[0],
          0.03,
          activeEx.checkpointCenter[2],
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[activeEx.checkpointRadiusMeters - 0.25, activeEx.checkpointRadiusMeters, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}
