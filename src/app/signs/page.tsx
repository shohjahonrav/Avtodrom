'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RoadSignSvg, TrafficLightCard } from '@/components/road-markings/RoadSignSvg';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/primitives';
import { ROAD_SIGNS_CATALOG } from '@/features/exercises/data/roadSigns';

export default function SignsPage() {
  const [category, setCategory] = useState<'all' | 'warning' | 'prohibitory' | 'information' | 'additional'>('all');

  const filtered = ROAD_SIGNS_CATALOG.filter(
    (s) => category === 'all' || s.category === category
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Yo‘l belgilari va svetofor katalogi</h1>
        <p className="text-sm text-slate-400">
          Avtodrom mashqlarida qo‘llaniladigan O‘zbekiston YHQ yo‘l belgilari va svetofor signallari.
        </p>
      </div>

      {/* Traffic Light States Panel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Svetofor signallari va qo‘shimcha yo‘nalish strelkasi</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <TrafficLightCard phase="red" />
            <div>
              <div className="font-semibold text-red-400">Qizil signal</div>
              <p className="text-slate-400">Harakatlanish taqiqlanadi. 1.12 chizig‘i oldida to‘xtang.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <TrafficLightCard phase="yellow" />
            <div>
              <div className="font-semibold text-amber-400">Sariq signal</div>
              <p className="text-slate-400">Harakatni taqiqlaydi (faqat keskin tormozsiz to‘xtay olmaganda istisno).</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <TrafficLightCard phase="green" />
            <div>
              <div className="font-semibold text-emerald-400">Yashil signal</div>
              <p className="text-slate-400">Harakatlanishga ruxsat beradi; piyodalarga yo‘l bering.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
            <TrafficLightCard phase="red" hasArrow arrowGreen />
            <div>
              <div className="font-semibold text-emerald-300">Qo‘shimcha strelka</div>
              <p className="text-slate-400">Asosiy qizil bilan yonganda boshqa oqimga yo‘l berib strelka yo‘nalishida yuriladi.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {[
          { id: 'all', label: 'Barcha belgilar' },
          { id: 'warning', label: 'Ogohlantiruvchi (1.x)' },
          { id: 'prohibitory', label: 'Taqiqlovchi / Imtiyoz (2.x, 3.x)' },
          { id: 'information', label: 'Axborot-ishora (5.x)' },
          { id: 'additional', label: 'Qo‘shimcha axborot (7.x)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCategory(tab.id as typeof category)}
            className={`px-3 py-1.5 rounded-lg font-medium ${
              category === tab.id
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Signs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sign) => (
          <Card key={sign.code} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="shrink-0 rounded-lg bg-slate-950 p-2 border border-slate-800">
                  <RoadSignSvg code={sign.code} size={64} />
                </div>
                <div className="space-y-1">
                  <Badge variant={sign.metadata.source.includes('3494') ? 'official' : 'default'}>
                    {sign.code}
                  </Badge>
                  <CardTitle className="text-sm">{sign.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-slate-300 flex-1 flex flex-col justify-between">
              <div className="space-y-1.5">
                <p>{sign.meaning}</p>
                <p className="text-emerald-300">
                  <strong className="text-emerald-400">Haydovchi amali:</strong> {sign.driverAction}
                </p>
                {sign.placementNote && (
                  <p className="text-[11px] text-amber-300">{sign.placementNote}</p>
                )}
              </div>
              <div className="pt-2 flex flex-wrap gap-1.5">
                {sign.usedInExercises.map((slug) => (
                  <Link
                    key={slug}
                    href={`/exercises/${slug}`}
                    className="rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-[10px] text-slate-300 hover:border-amber-500"
                  >
                    {slug}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
