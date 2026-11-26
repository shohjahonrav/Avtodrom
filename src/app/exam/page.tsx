'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ClipboardCheck, ShieldAlert } from 'lucide-react';
import { SimulatorWorkspace } from '@/components/exercise/SimulatorWorkspace';
import { LegalBanner } from '@/components/layout/Navbar';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/primitives';
import { EXERCISES_B } from '@/features/exercises/data/exercisesB';
import { RESULT_DISCLAIMER_UZ, VEHICLE_CATEGORIES } from '@/lib/constants/regulations';
import { formatDuration } from '@/lib/utils/cn';
import { useAppStore } from '@/stores/useAppStore';
import { useSimulationStore } from '@/stores/useSimulationStore';
import type { SimulationEvent, TransmissionType, VehicleCategory } from '@/types';

export default function ExamPage() {
  const [stage, setStage] = useState<'setup' | 'running' | 'report'>('setup');
  const [category, setCategory] = useState<VehicleCategory>('B');
  const [transmission, setTransmission] = useState<TransmissionType>('manual');
  const [finalResult, setFinalResult] = useState<{
    outcome: 'success' | 'completed_with_errors' | 'incomplete';
    durationSec: number;
    events: SimulationEvent[];
  } | null>(null);

  const adminConfig = useAppStore((s) => s.adminConfig);
  const snapshot = useSimulationStore((s) => s.snapshot);

  const handleFinish = (summary: {
    outcome: 'success' | 'completed_with_errors' | 'incomplete';
    durationSec: number;
    events: SimulationEvent[];
  }) => {
    setFinalResult(summary);
    setStage('report');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Imtihon simulyatsiyasi</h1>
          <p className="text-sm text-slate-400">
            STARTdan FINISHgacha 12 ta elementning ketma-ket avtomatik sinov oqimi.
          </p>
        </div>
        {stage === 'running' && (
          <Badge variant="custom">
            Bosqich: {snapshot.currentExerciseIndex + 1} / {EXERCISES_B.length}
          </Badge>
        )}
      </div>

      <LegalBanner compact />

      {stage === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Sessiya parametrlarini tanlang</CardTitle>
              <CardDescription>
                272-son qarorga ko‘ra amaliy bosqich nazariy imtihondan muvaffaqiyatli o‘tgandan so‘ng o‘tkaziladi.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Toifa</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {VEHICLE_CATEGORIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      disabled={!c.supportedNow}
                      onClick={() => setCategory(c.code)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium text-left ${
                        category === c.code
                          ? 'border-amber-500 bg-amber-950/40 text-white'
                          : c.supportedNow
                            ? 'border-slate-800 bg-slate-950 text-slate-300'
                            : 'border-slate-900 bg-slate-950/40 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {c.code} {!c.supportedNow && '(Tez kunda)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Uzatma turi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransmission('manual')}
                    className={`rounded-lg border p-3 text-xs font-semibold ${
                      transmission === 'manual'
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-300'
                    }`}
                  >
                    Mexanik uzatma (asosiy)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransmission('automatic')}
                    className={`rounded-lg border p-3 text-xs font-semibold ${
                      transmission === 'automatic'
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-300'
                    }`}
                  >
                    Avtomat uzatma
                  </button>
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => setStage('running')}
              >
                <ClipboardCheck className="h-4 w-4" />
                Imtihon simulyatsiyasini boshlash (START)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
                Xavfsizlik va imtihon eslatmasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-300">
              <p>
                Imtihon rejimida bosqichma-bosqich yordam ko‘rsatilmaydi. START nuqtasida tayyorgarlik amallarini
                (kamar, ko‘zgular, dvigatelni ishga tushirish, 1-uzatma, qo‘l tormozini tushirish) mustaqil bajaring.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                <li>12 ta mashq 3494-son hujjatdagi rasmiy ketma-ketlikda ishga tushadi.</li>
                <li>Sensorlar chiziq bosish, to‘siq/konusga urilish, svetofor, piyoda va tezlikni kuzatadi.</li>
                <li>
                  Baholash rejimi:{' '}
                  <strong className="text-slate-200">
                    {adminConfig.enableCustomScoring
                      ? 'Sozlangan ball tizimi (Custom training setting)'
                      : 'Rasmiy bo‘lmagan ball to‘qilmagan (faqat xatolar va holat)'}
                  </strong>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {stage === 'running' && (
        <SimulatorWorkspace
          initialSlug="start"
          mode="exam"
          transmission={transmission}
          allowExerciseSelect={false}
          onSessionFinished={handleFinish}
        />
      )}

      {stage === 'report' && finalResult && (
        <Card className="border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              Imtihon simulyatsiyasi hisoboti
            </CardTitle>
            <CardDescription>
              Umumiy vaqt: {formatDuration(finalResult.durationSec)} • Jami qayd etilgan hodisalar:{' '}
              {finalResult.events.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-700/50 bg-amber-950/30 p-3 text-xs text-amber-200">
              {RESULT_DISCLAIMER_UZ}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="text-xs text-slate-400">Umumiy holat</div>
                <div className="mt-1 font-bold text-white">
                  {finalResult.outcome === 'success'
                    ? 'Xatosiz yakunlandi'
                    : 'Xatolar bilan yakunlandi'}
                </div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="text-xs text-slate-400">Ogohlantirish / Jiddiy / Xavfli</div>
                <div className="mt-1 font-bold text-white">
                  {finalResult.events.filter((e) => e.severity === 'warning').length} /{' '}
                  {finalResult.events.filter((e) => e.severity === 'serious').length} /{' '}
                  {finalResult.events.filter((e) => e.severity === 'safety_critical').length}
                </div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="text-xs text-slate-400">Mashqlar qamrovi</div>
                <div className="mt-1 font-bold text-emerald-400">12 / 12 bajarildi</div>
              </div>
            </div>

            {finalResult.events.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Qayd etilgan xatolar va tavsiyalar</h3>
                <div className="space-y-1.5">
                  {finalResult.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-amber-300">[{ev.exerciseTitle}]</span>{' '}
                        <span className="text-slate-200">{ev.message}</span>
                      </div>
                      <Link
                        href={`/practice?exercise=${ev.exerciseSlug}`}
                        className="text-sky-400 hover:underline"
                      >
                        Qayta mashq qilish →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => setStage('setup')}>
                Yangi imtihon boshlash
              </Button>
              <Link href="/progress">
                <Button type="button" variant="outline">
                  Progress sahifasiga o‘tish
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
