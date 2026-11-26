'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SimulatorWorkspace } from '@/components/exercise/SimulatorWorkspace';
import { LegalBanner } from '@/components/layout/Navbar';
import { getExerciseBySlug } from '@/features/exercises/data/exercisesB';
import type { ExerciseSlug } from '@/types';

function PracticeContent() {
  const searchParams = useSearchParams();
  const slugParam = searchParams.get('exercise') ?? 'start';
  const valid = getExerciseBySlug(slugParam)?.slug ?? 'start';

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Mashq qilish rejimi</h1>
        <p className="text-sm text-slate-400">
          Mashqni mustaqil bajaring; sensor tizimi xatolarni real vaqtda qayd etadi va istalgan vaqtda qayta urinish imkonini beradi.
        </p>
      </div>
      <LegalBanner compact />
      <SimulatorWorkspace initialSlug={valid as ExerciseSlug} mode="practice" />
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Yuklanmoqda...</div>}>
      <PracticeContent />
    </Suspense>
  );
}
