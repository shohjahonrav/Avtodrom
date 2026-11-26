'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SimulatorWorkspace } from '@/components/exercise/SimulatorWorkspace';
import { LegalBanner } from '@/components/layout/Navbar';
import { getExerciseBySlug } from '@/features/exercises/data/exercisesB';
import type { ExerciseSlug } from '@/types';

function LearnContent() {
  const searchParams = useSearchParams();
  const slugParam = searchParams.get('exercise') ?? 'start';
  const valid = getExerciseBySlug(slugParam)?.slug ?? 'start';

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">O‘rganish rejimi</h1>
        <p className="text-sm text-slate-400">
          Har bir mashq bo‘yicha bosqichma-bosqich ko‘rsatmalar, yo‘l chiziqlari va tavsiyalar bilan mashq qiling.
        </p>
      </div>
      <LegalBanner compact />
      <SimulatorWorkspace initialSlug={valid as ExerciseSlug} mode="learn" />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Yuklanmoqda...</div>}>
      <LearnContent />
    </Suspense>
  );
}
