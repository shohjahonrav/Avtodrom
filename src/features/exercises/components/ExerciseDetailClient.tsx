'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { SimulatorWorkspace } from '@/components/exercise/SimulatorWorkspace';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/primitives';
import { EXERCISES_B } from '@/features/exercises/data/exercisesB';
import type { ExerciseConfig } from '@/types';

export function ExerciseDetailClient({ exercise }: { exercise: ExerciseConfig }) {
  const idx = EXERCISES_B.findIndex((e) => e.slug === exercise.slug);
  const prevEx = idx > 0 ? EXERCISES_B[idx - 1] : null;
  const nextEx = idx >= 0 && idx < EXERCISES_B.length - 1 ? EXERCISES_B[idx + 1] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="official">Element #{exercise.order}</Badge>
            <Badge variant={exercise.geometry.geometryMetadata.isOfficial ? 'official' : 'custom'}>
              {exercise.geometry.geometryMetadata.isOfficial
                ? 'Rasmiy o‘lcham'
                : 'O‘quv sxemasi (reglament/ilova asosida)'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{exercise.title}</h1>
          <p className="text-sm text-slate-300 max-w-3xl">{exercise.description}</p>
        </div>

        <div className="flex items-center gap-2">
          {prevEx && (
            <Link href={`/exercises/${prevEx.slug}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" /> #{prevEx.order}
              </Button>
            </Link>
          )}
          {nextEx && (
            <Link href={`/exercises/${nextEx.slug}`}>
              <Button variant="outline" size="sm">
                #{nextEx.order} <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Interactive Simulator */}
      <SimulatorWorkspace initialSlug={exercise.slug} mode="learn" allowExerciseSelect={false} />

      {/* Detailed Theory, Common Mistakes, Tracked Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              To‘g‘ri bajarish bo‘yicha maslahat
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-300 space-y-2">
            <ul className="list-disc pl-4 space-y-1.5">
              {exercise.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Ko‘p uchraydigan xatolar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-300 space-y-2">
            <ul className="list-disc pl-4 space-y-1.5">
              {exercise.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-400" />
              Simulyatsiyada qayd etiladigan hodisalar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-300 space-y-2">
            <ul className="list-disc pl-4 space-y-1.5">
              {exercise.trackedEvents.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))}
            </ul>
            {exercise.geometry.geometryMetadata.note && (
              <p className="mt-3 rounded bg-slate-950 p-2 text-[11px] text-slate-400 border border-slate-800">
                {exercise.geometry.geometryMetadata.note}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
