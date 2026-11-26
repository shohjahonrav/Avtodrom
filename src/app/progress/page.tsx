'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, RotateCcw, TrendingUp, AlertCircle } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/primitives';
import { EXERCISES_B } from '@/features/exercises/data/exercisesB';
import { formatDuration } from '@/lib/utils/cn';
import { useAppStore } from '@/stores/useAppStore';

export default function ProgressPage() {
  const attempts = useAppStore((s) => s.attempts);
  const clearAttempts = useAppStore((s) => s.clearAttempts);

  const completedSuccessSlugs = new Set(
    attempts.filter((a) => a.outcome === 'success').map((a) => a.exerciseSlug)
  );

  // Aggregate frequent errors across all attempts
  const errorCounts = new Map<string, { message: string; count: number; slug: string }>();
  for (const att of attempts) {
    for (const ev of att.events) {
      const existing = errorCounts.get(ev.code);
      if (existing) {
        existing.count += 1;
      } else {
        errorCounts.set(ev.code, {
          message: ev.message,
          count: 1,
          slug: ev.exerciseSlug,
        });
      }
    }
  }
  const topErrors = Array.from(errorCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);

  const progressPercent = Math.round(
    (EXERCISES_B.filter((e) => completedSuccessSlugs.has(e.slug)).length / EXERCISES_B.length) * 100
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">O‘rganish progressi va xatolar tahlili</h1>
          <p className="text-sm text-slate-400">
            Urinishlar tarixi, eng ko‘p takrorlanayotgan xatolar va “Xatolarimni o‘rganish” bo‘limi.
          </p>
        </div>
        {attempts.length > 0 && (
          <Button type="button" variant="outline" size="sm" onClick={clearAttempts}>
            <Trash2 className="h-3.5 w-3.5" /> Tarixni tozalash
          </Button>
        )}
      </div>

      {/* Overall KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400">B toifasi progressi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{progressPercent}%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400">Jami urinishlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{attempts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-400">Xatosiz urinishlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {attempts.filter((a) => a.outcome === 'success').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Exercise Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            Mashqlar bo‘yicha natijalar
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {EXERCISES_B.map((ex) => {
            const exAttempts = attempts.filter((a) => a.exerciseSlug === ex.slug);
            const bestSuccess = exAttempts.some((a) => a.outcome === 'success');
            const latest = exAttempts[0];
            return (
              <div
                key={ex.slug}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <div>
                  <div className="font-semibold text-white">
                    {ex.order}. {ex.shortTitle}
                  </div>
                  <div className="text-slate-400">
                    Urinishlar: {exAttempts.length}
                    {latest ? ` • Oxirgi: ${formatDuration(latest.durationSec)}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bestSuccess && <Badge variant="official">✓</Badge>}
                  <Link href={`/practice?exercise=${ex.slug}`}>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]">
                      <RotateCcw className="h-3 w-3" /> Mashq
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Learn My Mistakes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400" />
            Xatolarimni o‘rganish (ko‘p takrorlanayotgan xatolar)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {topErrors.length === 0 ? (
            <div className="text-slate-400 py-4 text-center">
              Hali urinishlar tarixi mavjud emas. Mashq yoki imtihon simulyatsiyasini ishga tushiring.
            </div>
          ) : (
            topErrors.map(([code, info]) => (
              <div
                key={code}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3"
              >
                <div>
                  <span className="font-semibold text-red-300">{info.count}×</span>{' '}
                  <span className="text-slate-200">{info.message}</span>
                </div>
                <Link href={`/learn?exercise=${info.slug}`} className="text-amber-400 hover:underline">
                  Ko‘rsatmani o‘rganish →
                </Link>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Attempts History */}
      {attempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">So‘nggi urinishlar tarixi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {attempts.slice(0, 20).map((att) => (
              <div
                key={att.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      att.outcome === 'success'
                        ? 'official'
                        : att.outcome === 'completed_with_errors'
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {att.outcome === 'success'
                      ? 'Muvaffaqiyatli'
                      : att.outcome === 'completed_with_errors'
                        ? 'Xatolar mavjud'
                        : 'Tugatilmadi'}
                  </Badge>
                  <span className="font-medium text-white">{att.exerciseSlug}</span>
                  <span className="text-slate-400">
                    ({att.mode} • {att.transmission === 'manual' ? 'Mexanik' : 'Avtomat'})
                  </span>
                </div>
                <div className="text-slate-400">
                  {formatDuration(att.durationSec)} • {att.events.length} xato
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
