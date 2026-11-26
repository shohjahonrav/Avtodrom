import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Navbar } from '@/components/layout/Navbar';
import { ControlDeck } from '@/components/vehicle/ControlDeck';

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('Responsive Layout & Vehicle Controls UI', () => {
  it('renders desktop links and toggles mobile navigation drawer', () => {
    render(<Navbar />);
    expect(screen.getByText('AVTODROM SIMULYATOR')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Menyuni ochish/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders vehicle cockpit controls including speedometer, pedals, and gearbox', () => {
    render(<ControlDeck />);
    expect(screen.getByText('Spidometr')).toBeInTheDocument();
    expect(screen.getByText('Taxometr')).toBeInTheDocument();
    expect(screen.getByText('Uzatma qutisi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'R' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
  });
});
