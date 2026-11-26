import type { Metadata } from 'next';
import './globals.css';
import { MainShell } from '@/components/layout/MainShell';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'AVTODROM 3D — O‘zbekiston haydovchilik amaliy imtihoni simulyatori',
  description:
    'Chevrolet Cobalt 3D modeli va Rapier3D fizikasi bilan O‘zbekiston avtodrom amaliy imtihoni simulyatori.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="uz" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Navbar />
        <MainShell>{children}</MainShell>
      </body>
    </html>
  );
}
