'use client';

import React, { useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/primitives';
import { AdminScoringConfigSchema } from '@/lib/validators/configSchema';
import { DEFAULT_ADMIN_CONFIG, useAppStore } from '@/stores/useAppStore';

export default function SettingsPage() {
  const adminConfig = useAppStore((s) => s.adminConfig);
  const updateAdminConfig = useAppStore((s) => s.updateAdminConfig);
  const resetAdminConfig = useAppStore((s) => s.resetAdminConfig);
  const devGridEnabled = useAppStore((s) => s.devGridEnabled);
  const setDevGridEnabled = useAppStore((s) => s.setDevGridEnabled);

  const [draft, setDraft] = useState(adminConfig);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = AdminScoringConfigSchema.safeParse(draft);
    if (!parsed.success) {
      setStatusMessage({
        type: 'error',
        text: `Validatsiya xatosi: ${parsed.error.issues[0]?.message ?? 'Noto‘g‘ri qiymat'}`,
      });
      return;
    }
    updateAdminConfig(parsed.data);
    setStatusMessage({
      type: 'success',
      text: 'Sozlamalar saqlandi va localStorage’da yangilandi.',
    });
  };

  const handleReset = () => {
    resetAdminConfig();
    setDraft(DEFAULT_ADMIN_CONFIG);
    setStatusMessage({
      type: 'success',
      text: 'Barcha parametrlar standart o‘quv holatiga qaytarildi.',
    });
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Sozlamalar va Admin konfiguratsiyasi</h1>
          <p className="text-sm text-slate-400">
            Rasmiy hujjatda qat’iy belgilanmagan barcha parametrlar “Custom training setting” sifatida ajratilgan va imtihon markazi reglamentiga moslashtirilishi mumkin.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" /> Tiklash
          </Button>
          <Button type="submit" size="sm">
            <Save className="h-3.5 w-3.5" /> Saqlash
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`rounded-lg border px-4 py-2.5 text-xs ${
            statusMessage.type === 'success'
              ? 'border-emerald-700 bg-emerald-950/40 text-emerald-200'
              : 'border-red-700 bg-red-950/40 text-red-200'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Official vs Custom Physical Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Avtodrom va mashq parametrlari</CardTitle>
              <Badge variant="custom">Custom training setting</Badge>
            </div>
            <CardDescription className="text-xs">
              Estakada qiyaligi 10–16% oralig‘ida rasmiy (3494-son); qolgan chegaralar imtihon markazi reglamentiga bog‘liq.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <label className="block space-y-1">
              <span className="text-slate-300 font-medium">
                Estakada qiyaligi (10–16% — 3494-son rasmiy oraliq)
              </span>
              <input
                type="number"
                min={10}
                max={16}
                step={1}
                value={draft.estakadaSlopePercent}
                onChange={(e) =>
                  setDraft({ ...draft, estakadaSlopePercent: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-slate-300 font-medium">
                Estakadada ruxsat etilgan orqaga ketish (sm) — Custom training setting
              </span>
              <input
                type="number"
                min={5}
                max={100}
                value={draft.estakadaRollbackLimitCm}
                onChange={(e) =>
                  setDraft({ ...draft, estakadaRollbackLimitCm: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-slate-300 font-medium">
                Boksga kirishda ruxsat etilgan orqaga urinishlar — Custom training setting
              </span>
              <input
                type="number"
                min={1}
                max={10}
                value={draft.maxReverseMovesInBox}
                onChange={(e) =>
                  setDraft({ ...draft, maxReverseMovesInBox: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </label>

            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div>
                <div className="font-medium text-white">Metr to‘ri va o‘lcham label’lari (Dev grid)</div>
                <div className="text-slate-400">Xaritada metr koordinata to‘rini ko‘rsatish</div>
              </div>
              <input
                type="checkbox"
                checked={devGridEnabled}
                onChange={(e) => setDevGridEnabled(e.target.checked)}
                className="h-4 w-4 accent-amber-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Optional Custom Scoring */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Baholash va ball tizimi</CardTitle>
              <Badge variant="custom">Reglamentga bog‘liq</Badge>
            </div>
            <CardDescription className="text-xs">
              Sukut bo‘yicha ball tizimi o‘chiq (rasmiy bo‘lmagan ballar to‘qilmaydi). Imtihon markazingiz reglamentiga ko‘ra yoqishingiz mumkin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
              <div>
                <div className="font-medium text-white">Custom ball tizimini yoqish</div>
                <div className="text-slate-400">Yoqilmasa faqat xatolar soni va holat ko‘rsatiladi</div>
              </div>
              <input
                type="checkbox"
                checked={draft.enableCustomScoring}
                onChange={(e) =>
                  setDraft({ ...draft, enableCustomScoring: e.target.checked })
                }
                className="h-4 w-4 accent-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-slate-300">Boshlang‘ich ball</span>
                <input
                  type="number"
                  disabled={!draft.enableCustomScoring}
                  value={draft.startingScore}
                  onChange={(e) => setDraft({ ...draft, startingScore: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:opacity-40"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-slate-300">O‘tish balli</span>
                <input
                  type="number"
                  disabled={!draft.enableCustomScoring}
                  value={draft.passThresholdScore}
                  onChange={(e) =>
                    setDraft({ ...draft, passThresholdScore: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:opacity-40"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-slate-300">Ogohlantirish jarimasi</span>
                <input
                  type="number"
                  disabled={!draft.enableCustomScoring}
                  value={draft.warningPenalty}
                  onChange={(e) => setDraft({ ...draft, warningPenalty: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:opacity-40"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-slate-300">Jiddiy xato jarimasi</span>
                <input
                  type="number"
                  disabled={!draft.enableCustomScoring}
                  value={draft.seriousPenalty}
                  onChange={(e) => setDraft({ ...draft, seriousPenalty: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:opacity-40"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <label className="block space-y-1">
                <span className="text-slate-300">Avtomobil uzunligi (m)</span>
                <input
                  type="number"
                  step={0.05}
                  value={draft.vehicleDimensions.lengthMeters}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      vehicleDimensions: {
                        ...draft.vehicleDimensions,
                        lengthMeters: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-slate-300">Avtomobil kengligi (m)</span>
                <input
                  type="number"
                  step={0.05}
                  value={draft.vehicleDimensions.widthMeters}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      vehicleDimensions: {
                        ...draft.vehicleDimensions,
                        widthMeters: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
