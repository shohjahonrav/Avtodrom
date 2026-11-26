'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/') {
    return <main className="flex-1 w-full">{children}</main>;
  }
  return <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">{children}</main>;
}
