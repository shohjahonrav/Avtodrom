'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CUSTOM_TRAINING_META,
  DEFAULT_B_VEHICLE_DIMENSIONS,
} from '@/lib/constants/regulations';
import type { AdminScoringConfig, AttemptRecord, VehicleCategory } from '@/types';

export const DEFAULT_ADMIN_CONFIG: AdminScoringConfig = {
  enableCustomScoring: false,
  startingScore: 100,
  passThresholdScore: 80,
  warningPenalty: 5,
  seriousPenalty: 15,
  failOnSafetyCritical: true,
  customTimeLimitSec: null,
  maxAllowedStalls: null,
  maxReverseMovesInBox: 2,
  estakadaRollbackLimitCm: 30,
  estakadaSlopePercent: 12,
  speedLimitAutodromeKmh: 20,
  difficulty: 'standard',
  vehiclePreset: 'standard_sedan_b',
  vehicleDimensions: DEFAULT_B_VEHICLE_DIMENSIONS,
  metadata: CUSTOM_TRAINING_META(
    'Ushbu parametrlar standart o‘quv sozlamalaridir. Rasmiy ball, vaqt va urinish limitlari imtihon markazining tasdiqlangan reglamentiga bog‘liq.'
  ),
};

interface AppStoreState {
  selectedCategory: VehicleCategory;
  setSelectedCategory: (cat: VehicleCategory) => void;
  devGridEnabled: boolean;
  setDevGridEnabled: (val: boolean) => void;
  adminConfig: AdminScoringConfig;
  updateAdminConfig: (partial: Partial<AdminScoringConfig>) => void;
  resetAdminConfig: () => void;
  attempts: AttemptRecord[];
  addAttempt: (record: AttemptRecord) => void;
  clearAttempts: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      selectedCategory: 'B',
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      devGridEnabled: false,
      setDevGridEnabled: (devGridEnabled) => set({ devGridEnabled }),
      adminConfig: DEFAULT_ADMIN_CONFIG,
      updateAdminConfig: (partial) =>
        set((state) => ({
          adminConfig: {
            ...state.adminConfig,
            ...partial,
          },
        })),
      resetAdminConfig: () => set({ adminConfig: DEFAULT_ADMIN_CONFIG }),
      attempts: [],
      addAttempt: (record) =>
        set((state) => ({
          attempts: [record, ...state.attempts].slice(0, 100),
        })),
      clearAttempts: () => set({ attempts: [] }),
    }),
    {
      name: 'avtodrom-uz-storage-v1',
    }
  )
);
