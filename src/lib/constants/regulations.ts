import type { MetadataTag, VehicleCategory, VehicleDimensions } from '@/types';

export const OFFICIAL_DOCUMENTS = [
  {
    id: 'order-3494',
    title:
      'IIVning 2024-yil 18-yanvardagi 27-son buyrug‘i (Adliya vazirligida 2024-yil 1-fevralda 3494-son bilan ro‘yxatdan o‘tgan)',
    subtitle:
      'Avtomototransport vositalarida amaliy mashg‘ulotlarni va imtihonlarni o‘tkazishga mo‘ljallangan o‘quv avtodromiga qo‘yiladigan talablar (2026-yil yanvardagi 3494-1-son o‘zgartirishlari — A1 toifasi kiritilishi bilan)',
    url: 'https://lex.uz/uz/docs/-6787886',
  },
  {
    id: 'decree-272',
    title: 'Vazirlar Mahkamasining 2021-yil 4-maydagi 272-son qarori',
    subtitle:
      'Haydovchilik guvohnomalarini olish uchun imtihonlarni o‘tkazish sohasiga xususiy sektorni jalb etish va imtihon tartibiga oid qoidalar',
    url: 'https://lex.uz/docs/-5409444',
  },
  {
    id: 'decree-408',
    title: 'Vazirlar Mahkamasining 2018-yil 31-maydagi 408-son qarori',
    subtitle:
      'Haydovchilarni tayyorlash, qayta tayyorlash va malakasini oshirish hamda avtomatlashtirilgan avtodromlar tartibi',
    url: 'https://lex.uz/docs/3765840',
  },
] as const;

export const LEGAL_DISCLAIMER_UZ =
  'Ushbu veb-ilova rasmiy davlat organi yoki imtihon markazining mahsuloti emas — faqat haydovchilik amaliy imtihoniga tayyorgarlik o‘quv simulyatoridir. Real avtomobil fizikasi va avtomatlashtirilgan sensor tizimini to‘liq takrorlamaydi; baholash mezonlari, urinishlar soni va vaqt limitlari tegishli imtihon markazi reglamentiga bog‘liq.';

export const RESULT_DISCLAIMER_UZ =
  'Bu simulyator natijasi rasmiy imtihon bahosi emas. Rasmiy imtihon natijasi faqat vakolatli imtihon markazining tasdiqlangan reglamenti va avtomatlashtirilgan tizimi orqali belgilanadi.';

export const OFFICIAL_3494_META: MetadataTag = {
  source: 'IIV 27-son buyrug‘i / Ro‘yxat raqami 3494 (lex.uz/uz/docs/-6787886)',
  verifiedAt: '2026-11-26',
  isOfficial: true,
};

export const OFFICIAL_YHQ_META: MetadataTag = {
  source: 'O‘zbekiston Respublikasi Yo‘l harakati qoidalari (amaldagi tahrir)',
  verifiedAt: '2026-11-26',
  isOfficial: true,
};

export const CUSTOM_TRAINING_META = (note: string): MetadataTag => ({
  source: 'Custom training setting (imtihon markazi reglamentiga bog‘liq)',
  verifiedAt: '2026-11-26',
  isOfficial: false,
  note,
});

export const AUTODROME_PHYSICAL_REQUIREMENTS = {
  minLengthMeters: 50,
  minWidthMeters: 15,
  minFenceHeightMeters: 2.0,
  surfaceTypes: ['Asfalt', 'Sement-beton'],
  requiresDrainage: true,
  requiresSurveillance: true,
  requiresMainAndReserveAccess: true,
  estakadaSlopePercentRange: [10, 16] as const,
  estakadaGuardHeightOptionsMeters: [0.3, 0.5] as const,
  estakadaMinGuardThicknessMeters: 0.3,
  estakadaStopLineWidthMeters: 0.4,
  estakadaStopLineOffsetFromTopMeters: 1.0,
  estakadaSignDistanceMeters: 3.0,
  speedLimitSign3243Kmh: 20,
  speedLimitSign3243DistanceFromStartMeters: 10,
  startStopFinishLineWidthMeters: 0.4,
  startFinishLabelGapMeters: 1.0,
  startFinishLabelLengthMetersBCD: [0.6, 1.0] as const,
  startFinishLabelLengthMetersAA1: 0.6,
  dashedYellowWidthMetersBCD: [0.1, 0.2] as const,
  dashedYellowWidthMetersAA1: 0.1,
  metadata: OFFICIAL_3494_META,
};

export const DEFAULT_B_VEHICLE_DIMENSIONS: VehicleDimensions = {
  lengthMeters: 4.35,
  widthMeters: 1.75,
  wheelbaseMeters: 2.6,
  frontOverhangMeters: 0.85,
  rearOverhangMeters: 0.9,
  maxSteeringAngleDeg: 34,
  metadata: CUSTOM_TRAINING_META(
    'B toifasidagi o‘rtacha yengil sedan gabariti (o‘quv modeli; aniq avtomobil modeli markazda farq qilishi mumkin).'
  ),
};

export interface CategoryDescriptor {
  code: VehicleCategory;
  name: string;
  description: string;
  supportedNow: boolean;
  regulatoryNote: string;
}

export const VEHICLE_CATEGORIES: CategoryDescriptor[] = [
  {
    code: 'B',
    name: 'B toifasi — Yengil avtomobil',
    description:
      'Ruxsat etilgan maksimal vazni 3 500 kg dan oshmaydigan va o‘rindiqlar soni 8 tadan ko‘p bo‘lmagan avtomobillar (asosiy fokus: mexanik uzatma).',
    supportedNow: true,
    regulatoryNote: '3494-son hujjat 2-ilovasidagi 12 ta element to‘liq amalga oshirilgan.',
  },
  {
    code: 'A',
    name: 'A toifasi — Mototsikl',
    description: 'Ikki g‘ildirakli mototransport vositalari.',
    supportedNow: false,
    regulatoryNote:
      'Arxitektura tayyor. 3494-son hujjatda 1.4 sariq chiziq va alohida chizma talab etiladi — alohida normativ sxema bilan qo‘shiladi.',
  },
  {
    code: 'A1',
    name: 'A1 toifasi — Yengil mototsikl (2026-yil o‘zgartirish)',
    description:
      '3494-1-son (2026-yil yanvar) o‘zgartirishiga ko‘ra kiritilgan yengil mototransport toifasi (2027-yil 27-yanvardan kuchga kiradi).',
    supportedNow: false,
    regulatoryNote:
      'Arxitektura tayyor. Rasmiy A/A1 chizmasiga mos alohida konfiguratsiya qo‘shish rejalashtirilgan.',
  },
  {
    code: 'C',
    name: 'C toifasi — Yuk avtomobili',
    description: 'Ruxsat etilgan maksimal vazni 3 500 kg dan ortiq yuk avtomobillari.',
    supportedNow: false,
    regulatoryNote:
      'B/C/D umumiy 12 element ketma-ketligini ulashadi, ammo 90° burilish, boks va parkovka gabaritlari C chizmasi bo‘yicha alohida kiritilishi kerak.',
  },
  {
    code: 'D',
    name: 'D toifasi — Avtobus',
    description: 'Yo‘lovchi tashishga mo‘ljallangan avtobuslar.',
    supportedNow: false,
    regulatoryNote:
      'B/C/D ketma-ketligida ishlaydi, lekin D toifasining uzun gabariti uchun alohida ilova sxemasi talab etiladi.',
  },
  {
    code: 'BE',
    name: 'BE / CE / DE — Tirkamali tarkiblar',
    description: 'Tirkamali yengil, yuk avtomobillari va avtobuslar.',
    supportedNow: false,
    regulatoryNote:
      'Tirkama artikulyatsiyasi (ulama burchagi) fizikasi alohida modul sifatida kengaytiriladi.',
  },
];
