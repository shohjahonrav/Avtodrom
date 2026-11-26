'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { RoadMarkingSvg } from '@/components/road-markings/RoadMarkingSvg';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/primitives';
import { ROAD_MARKINGS_CATALOG } from '@/features/exercises/data/roadMarkings';

export default function RoadMarkingsPage() {
  const [groupFilter, setGroupFilter] = useState<'all' | 'autodrome_3494' | 'yhq_general'>('all');
  const [query, setQuery] = useState('');

  const filtered = ROAD_MARKINGS_CATALOG.filter((item) => {
    const matchesGroup = groupFilter === 'all' || item.group === groupFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q);
    return matchesGroup && matchesQuery;
  });

  const autodromeItems = filtered.filter((i) => i.group === 'autodrome_3494');
  const yhqItems = filtered.filter((i) => i.group === 'yhq_general');

  const renderSection = (title: string, subtitle: string, items: typeof filtered) => {
    if (items.length === 0) return null;
    return (
      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.code} className="flex flex-col">
              <CardHeader className="pb-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={item.group === 'autodrome_3494' ? 'official' : 'default'}>
                    {item.code}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    Rang: {item.color === 'yellow' ? 'Sariq' : item.color === 'white-yellow' ? 'Oq / sariq' : 'Oq'}
                  </span>
                </div>
                <RoadMarkingSvg item={item} />
                <CardTitle className="text-sm pt-1">{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-slate-300 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <p>{item.description}</p>
                  <p className="text-slate-400">
                    <strong className="text-slate-200">Avtodromda:</strong> {item.autodromeUsage}
                  </p>
                  <p className="text-amber-200">
                    <strong className="text-amber-400">Haydovchi uchun:</strong> {item.driverMeaning}
                  </p>
                  {item.widthNote && (
                    <p className="text-[11px] text-sky-300">O‘lcham: {item.widthNote}</p>
                  )}
                </div>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {item.usedInExercises.map((slug) => (
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
      </section>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Yo‘l chiziqlari — vizual katalog</h1>
        <p className="text-sm text-slate-400">
          3494-son hujjatdagi avtodrom maxsus chiziqlari (B/C/D va A/A1 farqlari bilan) hamda O‘zbekiston YHQ umumiy chiziqlari.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 p-3">
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'autodrome_3494', label: '3494-son avtodrom chiziqlari' },
            { id: 'yhq_general', label: 'Umumiy YHQ chiziqlari' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setGroupFilter(tab.id as typeof groupFilter)}
              className={`px-3 py-1.5 rounded-lg font-medium ${
                groupFilter === tab.id
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kod yoki nom bo‘yicha qidirish..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-sm text-slate-400">
          Qidiruv bo‘yicha mos yo‘l chizig‘i topilmadi.
        </div>
      ) : (
        <div className="space-y-8">
          {renderSection(
            '1. Avtodrom uchun 3494-son hujjat chiziqlari',
            'B/C/D (1.1 oq chegara) va A/A1 (1.4 sariq chegara) hamda 0,4 m START/STOP/FINISH chiziqlari.',
            autodromeItems
          )}
          {renderSection(
            '2. O‘zbekiston YHQ umumiy chiziqlari katalogi',
            'Amaldagi YHQ tahriri asosidagi ajratuvchi, ogohlantiruvchi va yo‘naltiruvchi chiziqlar.',
            yhqItems
          )}
        </div>
      )}
    </div>
  );
}
