'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Car,
  ClipboardCheck,
  Compass,
  Menu,
  Scale,
  Settings,
  ShieldAlert,
  TrendingUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { LEGAL_DISCLAIMER_UZ } from '@/lib/constants/regulations';

const NAV_ITEMS = [
  { href: '/', label: '3D Simulyator', icon: Compass },
  { href: '/learn', label: 'O‘rganish', icon: BookOpen },
  { href: '/practice', label: 'Mashq qilish', icon: Car },
  { href: '/exam', label: 'Imtihon', icon: ClipboardCheck },
  { href: '/road-markings', label: 'Chiziqlar', icon: Scale },
  { href: '/signs', label: 'Belgilar', icon: ShieldAlert },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/settings', label: 'Sozlamalar', icon: Settings },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-bold">
            UZ
          </div>
          <div>
            <div className="text-sm font-bold tracking-wide text-white">AVTODROM SIMULYATOR</div>
            <div className="text-[11px] text-slate-400">O‘zbekiston • B toifa o‘quv platformasi</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1" aria-label="Asosiy navigatsiya">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  active
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden rounded-lg border border-slate-800 p-2 text-slate-200 hover:bg-slate-800"
          aria-label="Menyuni ochish"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 grid grid-cols-2 gap-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                  active
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-900 text-slate-200 hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}

export function LegalBanner({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={cn(
        'border border-amber-700/50 bg-amber-950/30 text-amber-200 rounded-xl px-4 py-3 text-xs leading-relaxed',
        compact && 'py-2'
      )}
    >
      <span className="font-semibold text-amber-400">Huquqiy eslatma: </span>
      {LEGAL_DISCLAIMER_UZ}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950/90 py-6 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 space-y-3">
        <LegalBanner compact />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
          <p>
            Me’yoriy asos: IIV 3494-son (2024 / 2026-yil 3494-1-son o‘zgartirishlari), VM 272-son va 408-son qarorlari.
          </p>
          <p className="text-slate-500">O‘quv tayyorgarlik simulyatori • Rasmiy imtihon tizimi emas</p>
        </div>
      </div>
    </footer>
  );
}
