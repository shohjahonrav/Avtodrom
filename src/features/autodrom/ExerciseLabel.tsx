'use client';

import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { MAP_DIMENSIONS, uvToWorld } from '@/config/mapDimensions';
import type { ExerciseLabelConfig } from '@/features/autodrom/mapTypes';

function createLabelCircleTexture(text: string, confirmed: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, 128, 128);
    ctx.fillStyle = confirmed ? '#1e3a8a' : '#475569';
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = confirmed ? '#93c5fd' : '#cbd5e1';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 66);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function ExerciseLabel({ label }: { label: ExerciseLabelConfig }) {
  const pos = useMemo(() => uvToWorld(label.positionUV, MAP_DIMENSIONS), [label.positionUV]);
  const tex = useMemo(
    () => createLabelCircleTexture(label.code, label.confirmedFromReference),
    [label.code, label.confirmedFromReference]
  );

  useEffect(() => () => tex.dispose(), [tex]);

  return (
    <mesh position={[pos.x, 0.17, pos.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.1, 24]} />
      <meshBasicMaterial map={tex} transparent polygonOffset polygonOffsetFactor={-4} />
    </mesh>
  );
}
