import { CUSTOM_TRAINING_META, OFFICIAL_3494_META } from '@/lib/constants/regulations';
import type { ExerciseConfig, ExerciseSlug } from '@/types';

const B_ORDER_NOTE = OFFICIAL_3494_META;

/**
 * Full B-category autodrome layout is placed in a 68m x 32m world (>= 50m x 15m official minimum).
 * Ring-shaped flow:
 * - Bottom corridor (y = 22..28): #1 START -> #2 Pedestrian Crossing -> #3 Estakada
 * - Right turn upward & top/central zones: #4 90° Turn -> #5 Reverse Box -> #6 Regulated Intersection
 * - Central/Upper track: #7 Slalom -> #8 Parallel Parking -> #9 Railway Crossing
 * - Left return corridor: #10 Acceleration Lane -> #11 Emergency Stop -> #12 FINISH (close to START)
 */
export const EXERCISES_B: ExerciseConfig[] = [
  // 1. START
  {
    id: 'ex-01-start',
    order: 1,
    slug: 'start',
    category: ['B', 'C', 'D'],
    title: '1. Harakatni boshlash — START',
    shortTitle: 'START',
    purpose:
      'Avtomobilni xavfsiz harakatga tayyorlash, mexanik uzatmada joyidan silliq qo‘zg‘alish va START chizig‘idan to‘g‘ri o‘tish.',
    description:
      '3494-son hujjat 2-ilovasidagi 1-element. Nomzod o‘rindiq va ko‘zgularni moslaydi, xavfsizlik kamarini taqadi, eshiklar yopiqligini tekshiradi, mexanik uzatmada neytral/ilashish/tormozni nazorat qilib dvigatelni ishga tushiradi va START chizig‘idan o‘tadi.',
    steps: [
      { order: 1, title: 'O‘rindiq va ko‘zgularni moslash', description: 'Yon va ichki ko‘zgularni sozlang.' },
      { order: 2, title: 'Xavfsizlik kamarini taqish', description: 'Kamarni taqing (B tugmasi yoki paneldan).' },
      { order: 3, title: 'Eshiklar va qo‘l tormozini tekshirish', description: 'Eshiklar yopiq, uzatma N holatda ekanini tekshiring.' },
      { order: 4, title: 'Dvigatelni ishga tushirish', description: 'Ilashish va tormozni bosib dvigatelni yoqing (E tugmasi).' },
      { order: 5, title: '1-uzatmaga o‘tish va qo‘l tormozini tushirish', description: 'Ilashishni bosib 1-uzatmaga o‘ting, burilish ko‘rsatkichini yoqing.' },
      { order: 6, title: 'START chizig‘idan o‘tish', description: 'Silliq qo‘zg‘alib 0,4 m enli START chizig‘idan o‘ting.' },
    ],
    tips: [
      'Ilashish pedalini birdan qo‘yib yubormang — “tortish nuqtasi”da ushlab gaz bering.',
      'START chizig‘idan 10 m narida 3.243 (20 km/soat) tezlik cheklovi belgisi o‘rnatilganini unutmang.',
    ],
    commonMistakes: [
      'Xavfsizlik kamarini taqmasdan harakatni boshlash.',
      'Qo‘l tormozini tushirmasdan yurishga urinish yoki dvigatelni o‘chirib qo‘yish.',
      'Chegaraviy 1.1 chiziqni bosish.',
    ],
    trackedEvents: [
      'Xavfsizlik kamari holati',
      'Tayyorgarlik bosqichlari',
      'START chizig‘ini kesib o‘tish',
      'Dvigatel o‘chib qolishi',
      '1.1 chegara chizig‘i nazorati',
    ],
    requiredPrepChecklist: true,
    speedLimitKmh: 20,
    speedLimitMetadata: OFFICIAL_3494_META,
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 2, y: 28 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 16, maxY: 7 },
      startPose: { x: 2.6, y: 3.5, headingDeg: 0 },
      directionArrows: [
        { x: 5.5, y: 3.5, headingDeg: 0 },
        { x: 11.5, y: 3.5, headingDeg: 0 },
      ],
      lines: [
        { id: 'start-top-11', start: { x: 0, y: 1.2 }, end: { x: 16, y: 1.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'start-bot-11', start: { x: 0, y: 5.8 }, end: { x: 16, y: 5.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'start-zone-dashed', start: { x: 0.5, y: 1.4 }, end: { x: 0.5, y: 5.6 }, markingCode: 'dashed-yellow', widthMeters: 0.15 },
        { id: 'start-line-04', start: { x: 7.5, y: 1.2 }, end: { x: 7.5, y: 5.8 }, markingCode: '1.1', widthMeters: 0.4, label: 'START' },
      ],
      cones: [],
      barriers: [],
      zones: [
        {
          id: 'start-line-zone',
          kind: 'start_line',
          polygon: [
            { x: 7.3, y: 1.2 },
            { x: 8.1, y: 1.2 },
            { x: 8.1, y: 5.8 },
            { x: 7.3, y: 5.8 },
          ],
          label: 'START',
        },
        {
          id: 'start-speed-zone',
          kind: 'speed_limit_zone',
          polygon: [
            { x: 7.5, y: 1.2 },
            { x: 16, y: 1.2 },
            { x: 16, y: 5.8 },
            { x: 7.5, y: 5.8 },
          ],
          targetSpeedMaxKmh: 20,
          label: '3.243 (20 km/soat)',
        },
        {
          id: 'start-exit-zone',
          kind: 'exercise_exit',
          polygon: [
            { x: 13.5, y: 1.2 },
            { x: 16, y: 1.2 },
            { x: 16, y: 5.8 },
            { x: 13.5, y: 5.8 },
          ],
        },
      ],
      signs: [
        { id: 'sign-3243-start', signCode: '3.243', position: { x: 14.5, y: 6.3 }, label: '20 km/soat (STARTdan 10 m)' },
      ],
      geometryMetadata: CUSTOM_TRAINING_META(
        'START chizig‘i eni (0,4 m) va yozuv masofasi (1 m) 3494-son hujjatdan; yo‘lak kengligi (4,6 m) o‘quv konfiguratsiyasi.'
      ),
    },
  },

  // 2. Piyodalar o'tish joyi
  {
    id: 'ex-02-pedestrian',
    order: 2,
    slug: 'pedestrian-crossing',
    category: ['B', 'C', 'D'],
    title: '2. Piyodalar o‘tish joyi',
    shortTitle: 'Piyodalar o‘tish joyi',
    purpose: 'Zebra chiziqlari oldida tezlikni kamaytirish, piyodani aniqlash va xavfsiz yo‘l berish.',
    description:
      '5.16.1 va 5.16.2 belgilari hamda 1.14.1 oq zebra chizig‘i bilan jihozlangan o‘tish joyi. Simulyatsiyada boshqariladigan piyoda ssenariysi ishga tushadi.',
    steps: [
      { order: 1, title: 'Belgini ko‘rib tezlikni kamaytiring', description: '5.16.1/5.16.2 belgisiga yaqinlashganda gazni qo‘ying.' },
      { order: 2, title: 'Piyodani kuzating', description: 'Piyoda zebra tomon harakatlanganda 1.12/zebra oldida to‘xtang.' },
      { order: 3, title: 'To‘liq yo‘l bering', description: 'Piyoda o‘tish joyini to‘liq tark etguncha kuting.' },
      { order: 4, title: 'Xavfsiz davom eting', description: 'Piyoda o‘tgach silliq harakatni davom ettiring.' },
    ],
    tips: [
      'Zebra ustida to‘xtab qolmang — taxminan 1–1,5 m oldin to‘xtang.',
      'Piyoda to‘liq narigi tomonga o‘tganiga ishonch hosil qiling.',
    ],
    commonMistakes: [
      'Piyodaga yo‘l bermaslik yoki uning yo‘lini kesib o‘tish.',
      'Zebra chiziqlari ustida to‘xtab qolish.',
    ],
    trackedEvents: ['Piyodaga yo‘l berish', 'Zebra ustida to‘xtamaslik', '1.1 chegara nazorati'],
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 20, y: 29 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 14, maxY: 7 },
      startPose: { x: 1.8, y: 3.5, headingDeg: 0 },
      directionArrows: [
        { x: 3.5, y: 3.5, headingDeg: 0 },
        { x: 11.5, y: 3.5, headingDeg: 0 },
      ],
      lines: [
        { id: 'ped-top-11', start: { x: 0, y: 1.2 }, end: { x: 14, y: 1.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'ped-bot-11', start: { x: 0, y: 5.8 }, end: { x: 14, y: 5.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'ped-stop-112', start: { x: 5.6, y: 1.2 }, end: { x: 5.6, y: 5.8 }, markingCode: '1.12', widthMeters: 0.35 },
      ],
      cones: [],
      barriers: [],
      zebraCrossings: [{ center: { x: 8.0, y: 3.5 }, widthMeters: 2.8, lengthMeters: 4.4, angleDeg: 0 }],
      pedestrianScenario: {
        id: 'ped-scenario-1',
        crosswalkStart: { x: 8.0, y: 0.5 },
        crosswalkEnd: { x: 8.0, y: 6.5 },
        triggerDistanceMeters: 5.0,
        walkSpeedMps: 1.35,
        waitDurationSec: 0.5,
      },
      zones: [
        {
          id: 'ped-zebra-zone',
          kind: 'pedestrian_zone',
          polygon: [
            { x: 6.6, y: 1.2 },
            { x: 9.4, y: 1.2 },
            { x: 9.4, y: 5.8 },
            { x: 6.6, y: 5.8 },
          ],
          label: 'Zebra',
        },
        {
          id: 'ped-exit',
          kind: 'exercise_exit',
          polygon: [
            { x: 11.5, y: 1.2 },
            { x: 14, y: 1.2 },
            { x: 14, y: 5.8 },
            { x: 11.5, y: 5.8 },
          ],
        },
      ],
      signs: [
        { id: 'sign-5161', signCode: '5.16.1', position: { x: 6.4, y: 6.3 }, label: 'Piyodalar o‘tish joyi' },
        { id: 'sign-5162', signCode: '5.16.2', position: { x: 9.6, y: 0.7 }, label: 'Piyodalar o‘tish joyi' },
      ],
      geometryMetadata: CUSTOM_TRAINING_META(
        '5.16.1/5.16.2 belgilari va zebra chizig‘i 3494-son talabiga mos; yo‘lak uzunligi o‘quv sxemasidir.'
      ),
    },
  },

  // 3. Estakada
  {
    id: 'ex-03-estakada',
    order: 3,
    slug: 'estakada',
    category: ['B', 'C', 'D'],
    title: '3. To‘xtash va tik balandlikka ko‘tarilish — Estakada',
    shortTitle: 'Estakada',
    purpose: 'Tik ko‘tarilishda to‘xtab, qo‘l tormozi va ilashish yordamida orqaga ketmasdan joyidan qo‘zg‘alish.',
    description:
      '3494-son hujjat bo‘yicha qiyaligi 10–16%, temir koleyasiz, ikki tomoni kamida 0,3 m qalinlikdagi himoya to‘siqli estakada. Ko‘tarilish oxirigacha 1 m masofada 0,4 m enli 1.12 chizig‘i chiziladi.',
    steps: [
      { order: 1, title: 'Ko‘tarilishga kirish', description: '1.14 belgisidan o‘tib 1-uzatmada tekis ko‘tariling.' },
      { order: 2, title: '1.12 chizig‘i oldida to‘xtash', description: 'Ko‘tarilish tugashidan 1 m oldingi 1.12 chizig‘ini kesmasdan to‘xtang.' },
      { order: 3, title: 'Qo‘l tormozini tortish', description: 'Avtomobil orqaga ketmasligi uchun qo‘l tormozini torting (H tugmasi).' },
      { order: 4, title: 'Tortish nuqtasini topib qo‘zg‘alish', description: 'Ilashishni ko‘tarib gaz bering, tortish sezilganda qo‘l tormozini tushiring.' },
      { order: 5, title: 'Nazoratli tushish', description: '1.13 belgisidan keyin tezlikni oshirmay tushing.' },
    ],
    tips: [
      'Dvigatel aylanishi (RPM) biroz pasayib kuzov titrashni boshlaganda qo‘l tormozini tushiring.',
      'Himoya to‘siqlariga tegmaslik uchun rulni to‘g‘ri ushlang.',
    ],
    commonMistakes: [
      'Orqaga nazoratsiz sirpanib ketish.',
      '1.12 to‘xtash chizig‘idan o‘tib ketish yoki unga yetmasdan juda uzoqda to‘xtash.',
      'Ilashishni keskin qo‘yib dvigatelni o‘chirib qo‘yish.',
    ],
    trackedEvents: [
      '1.12 chizig‘i oldida to‘xtash',
      'Orqaga ketish masofasi (sm)',
      'Himoya to‘siqlariga tegish',
      'Dvigatel o‘chishi',
    ],
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 36, y: 29 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 20, maxY: 7 },
      startPose: { x: 1.8, y: 3.5, headingDeg: 0 },
      directionArrows: [
        { x: 4.2, y: 3.5, headingDeg: 0 },
        { x: 10.5, y: 3.5, headingDeg: 0 },
        { x: 17.0, y: 3.5, headingDeg: 0 },
      ],
      lines: [
        { id: 'est-top-11', start: { x: 0, y: 1.4 }, end: { x: 20, y: 1.4 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'est-bot-11', start: { x: 0, y: 5.6 }, end: { x: 20, y: 5.6 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'est-stop-112', start: { x: 8.6, y: 1.6 }, end: { x: 8.6, y: 5.4 }, markingCode: '1.12', widthMeters: 0.4, label: '1.12' },
      ],
      cones: [],
      barriers: [
        { id: 'est-guard-top', points: [{ x: 3.5, y: 1.55 }, { x: 16.5, y: 1.55 }], thicknessMeters: 0.35, kind: 'estakada_guard', label: 'Himoya to‘sig‘i (≥0,3 m)' },
        { id: 'est-guard-bot', points: [{ x: 3.5, y: 5.45 }, { x: 16.5, y: 5.45 }], thicknessMeters: 0.35, kind: 'estakada_guard', label: 'Himoya to‘sig‘i (≥0,3 m)' },
      ],
      estakada: {
        slopePercent: 12,
        slopeMetadata: OFFICIAL_3494_META,
        climbStart: { x: 3.8, y: 3.5 },
        climbEnd: { x: 9.6, y: 3.5 },
        topPlateauEnd: { x: 11.4, y: 3.5 },
        descentEnd: { x: 16.5, y: 3.5 },
        stopLineOffsetFromTopEndMeters: 1.0,
        stopLineWidthMeters: 0.4,
        guardHeightMeters: 0.3,
        guardThicknessMeters: 0.35,
        maxAllowedRollbackMeters: 0.3,
        rollbackMetadata: CUSTOM_TRAINING_META(
          '3494-son hujjatda aniq ruxsat etilgan orqaga ketish santimetri ko‘rsatilmagan; 30 sm o‘quv chegarasi sifatida sozlangan.'
        ),
      },
      zones: [
        {
          id: 'est-climb-zone',
          kind: 'estakada_climb',
          polygon: [{ x: 3.8, y: 1.7 }, { x: 9.6, y: 1.7 }, { x: 9.6, y: 5.3 }, { x: 3.8, y: 5.3 }],
          label: 'Ko‘tarilish (10–16%)',
        },
        {
          id: 'est-stop-box',
          kind: 'estakada_stop_box',
          polygon: [{ x: 4.5, y: 1.7 }, { x: 8.6, y: 1.7 }, { x: 8.6, y: 5.3 }, { x: 4.5, y: 5.3 }],
          label: '1.12 to‘xtash zonasi',
        },
        {
          id: 'est-stop-line-zone',
          kind: 'stop_line',
          polygon: [{ x: 8.4, y: 1.6 }, { x: 9.0, y: 1.6 }, { x: 9.0, y: 5.4 }, { x: 8.4, y: 5.4 }],
        },
        {
          id: 'est-descent-zone',
          kind: 'estakada_descent',
          polygon: [{ x: 11.4, y: 1.7 }, { x: 16.5, y: 1.7 }, { x: 16.5, y: 5.3 }, { x: 11.4, y: 5.3 }],
          label: 'Nishablik',
        },
        {
          id: 'est-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 17.5, y: 1.4 }, { x: 20, y: 1.4 }, { x: 20, y: 5.6 }, { x: 17.5, y: 5.6 }],
        },
      ],
      signs: [
        { id: 'sign-114', signCode: '1.14', position: { x: 0.8, y: 6.2 }, label: '1.14 Tik balandlik (3 m oldin)' },
        { id: 'sign-113', signCode: '1.13', position: { x: 8.4, y: 6.2 }, label: '1.13 Tik nishablik (3 m oldin)' },
      ],
      geometryMetadata: CUSTOM_TRAINING_META(
        'Qiyalik (10–16%), 1.12 eni (0,4 m), ko‘tarilish oxiridan 1 m masofa, to‘siq qalinligi (>=0,3 m) va 1.14/1.13 belgilarining 3 m masofasi 3494-son hujjatdan; umumiy uzunlik o‘quv sxemasi.'
      ),
    },
  },

  // 4. 90° burchak ostida burilishlar
  {
    id: 'ex-04-turn-90',
    order: 4,
    slug: 'turn-90',
    category: ['B'],
    title: '4. 90° burchak ostida burilishlar',
    shortTitle: '90° burilishlar',
    purpose: 'Tor L-simon yo‘lakda B toifali avtomobil gabaritini hisobga olib ichki va tashqi chegaralarga tegmasdan 90° burilish.',
    description:
      'B toifasi uchun alohida sxema (C/D ga nisbatan ixchamroq yo‘lak). Nomzod ketma-ket 90° chap va o‘ng burilishlarni chiziqlarni bosmasdan bajaradi.',
    steps: [
      { order: 1, title: 'Burilish oldidan tezlikni pasaytirish', description: '1-uzatmada past tezlikda kirib keling.' },
      { order: 2, title: 'Tashqi tomonga yaqinroq joylashish', description: 'Ichki orqa g‘ildirak burchakni kesib ketmasligi uchun tashqi chiziqqa yaqinroq kiring.' },
      { order: 3, title: 'Orqa oyna/ustun mo‘ljali bo‘yicha burilish', description: 'Ichki burchak yon ko‘zgudan o‘tgach rulni to‘liq buring.' },
      { order: 4, title: 'Rulni tekislash', description: 'Avtomobil yo‘lakka parallel bo‘lishidan oldin rulni to‘g‘rilashni boshlang.' },
    ],
    tips: [
      'C/D toifasidan farqli ravishda B toifasida burilish radiusi kichikroq, ammo orqa g‘ildirak ichkariga siljishini unutmang.',
      'Rulni joyida emas, sekin harakatda aylantiring.',
    ],
    commonMistakes: [
      'Burilishni erta boshlab ichki chegarani bosish.',
      'Burilishni kech boshlab old bamper bilan tashqi chiziqdan chiqish.',
    ],
    trackedEvents: ['1.1 ichki/tashqi chiziq nazorati', 'Konusga tegish', 'Yo‘nalishga rioya'],
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 49, y: 2 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 16, maxY: 16 },
      startPose: { x: 2.2, y: 13.0, headingDeg: 0 },
      directionArrows: [
        { x: 5.5, y: 13.0, headingDeg: 0 },
        { x: 12.0, y: 9.5, headingDeg: -90 },
        { x: 7.5, y: 3.0, headingDeg: 180 },
      ],
      lines: [
        // Outer perimeter of S/U-shaped two 90-degree turns (corridor width 4.0m)
        { id: 't90-outer-bot', start: { x: 0, y: 15.0 }, end: { x: 14.0, y: 15.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 't90-outer-right', start: { x: 14.0, y: 15.0 }, end: { x: 14.0, y: 1.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 't90-outer-top', start: { x: 14.0, y: 1.0 }, end: { x: 1.0, y: 1.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        // Inner corners
        { id: 't90-inner-bot', start: { x: 0, y: 11.0 }, end: { x: 10.0, y: 11.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 't90-inner-mid', start: { x: 10.0, y: 11.0 }, end: { x: 10.0, y: 5.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 't90-inner-top', start: { x: 10.0, y: 5.0 }, end: { x: 1.0, y: 5.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
      ],
      cones: [
        { id: 't90-cone-1', position: { x: 10.0, y: 11.0 }, radiusMeters: 0.2 },
        { id: 't90-cone-2', position: { x: 10.0, y: 5.0 }, radiusMeters: 0.2 },
      ],
      barriers: [],
      zones: [
        {
          id: 't90-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 1.0, y: 1.0 }, { x: 3.8, y: 1.0 }, { x: 3.8, y: 5.0 }, { x: 1.0, y: 5.0 }],
        },
      ],
      signs: [{ id: 'sign-1122-t90', signCode: '1.12.2', position: { x: 0.8, y: 15.5 }, label: '90° burilishlar' }],
      geometryMetadata: CUSTOM_TRAINING_META(
        '3494-son hujjat 2-ilovasidagi B toifasi chizma geometriyasi ilova tasvirida; 4,0 m yo‘lak kengligi o‘quv konfiguratsiyasi (admin panelda sozlanadi).'
      ),
    },
  },

  // 5. Tor joyda qayrilib olish uchun boksga kirish
  {
    id: 'ex-05-reverse-box',
    order: 5,
    slug: 'reverse-box',
    category: ['B'],
    title: '5. Tor joyda qayrilib olish uchun boksga kirish',
    shortTitle: 'Boksga kirish',
    purpose: 'Oldinga va orqaga harakatlanib tor hududda boks (garaj) ichiga orqa bilan to‘g‘ri joylashish va chiqish.',
    description:
      'Nomzod boks qarshisidagi manevr maydonchasiga kiradi, orqa uzatmaga o‘tib boks ichiga chiziqlar va to‘siqlarga tegmasdan joylashadi, so‘ng oldinga chiqib ketadi.',
    steps: [
      { order: 1, title: 'Boks oldidan o‘tib to‘xtash', description: 'Manevr yo‘lagiga kirib, boks chizig‘idan biroz o‘tib to‘xtang.' },
      { order: 2, title: 'Orqa uzatma (R)ga o‘tish', description: 'To‘liq to‘xtab ilashishni bosing va R uzatmasiga o‘ting.' },
      { order: 3, title: 'Ko‘zgular orqali boksga kirish', description: 'Chap va o‘ng ko‘zgularda boks chegaralarini kuzatib orqaga kiring.' },
      { order: 4, title: 'Boks ichida tekislanib to‘xtash', description: 'Avtomobil to‘liq boks zonasi ichida joylashgach to‘xtang.' },
      { order: 5, title: 'Boksni tark etish', description: '1-uzatmada chiqish tomonga harakatlaning.' },
    ],
    tips: [
      'Boksga kirishda birinchi navbatda yaqin burchakni ko‘zgudan kuzating.',
      'Ruxsat etilgan qayta urinishlar soni imtihon markazi reglamentiga bog‘liq (sozlamalarda o‘zgartiriladi).',
    ],
    commonMistakes: [
      'Old bamper bilan manevr maydoni tashqi chizig‘idan chiqib ketish.',
      'Boksning yon yoki orqa chegaralarini bosish.',
      'To‘liq ichkariga kirmasdan chiqib ketish.',
    ],
    trackedEvents: ['Boks bay ichida to‘liq joylashish', '1.1 chegara va devorga tegish', 'Orqaga urinishlar soni'],
    maxReverseMoves: 2,
    maxReverseMovesMetadata: CUSTOM_TRAINING_META(
      'Ruxsat etilgan oldinga-orqaga urinishlar soni imtihon markazi reglamentiga bog‘liq.'
    ),
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 32, y: 2 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 16, maxY: 14 },
      startPose: { x: 14.0, y: 3.2, headingDeg: 180 },
      directionArrows: [
        { x: 11.5, y: 3.2, headingDeg: 180 },
        { x: 8.0, y: 7.8, headingDeg: 90 },
        { x: 2.5, y: 3.2, headingDeg: 180 },
      ],
      lines: [
        // Maneuver lane top & bottom
        { id: 'box-lane-top', start: { x: 0, y: 0.8 }, end: { x: 16, y: 0.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'box-lane-bot-l', start: { x: 0, y: 6.8 }, end: { x: 6.3, y: 6.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'box-lane-bot-r', start: { x: 9.7, y: 6.8 }, end: { x: 16, y: 6.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        // Box walls (3.4m wide x 6.0m deep)
        { id: 'box-wall-left', start: { x: 6.3, y: 6.8 }, end: { x: 6.3, y: 12.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'box-wall-right', start: { x: 9.7, y: 6.8 }, end: { x: 9.7, y: 12.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'box-wall-back', start: { x: 6.3, y: 12.8 }, end: { x: 9.7, y: 12.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
      ],
      cones: [
        { id: 'box-c1', position: { x: 6.3, y: 6.8 }, radiusMeters: 0.2 },
        { id: 'box-c2', position: { x: 9.7, y: 6.8 }, radiusMeters: 0.2 },
        { id: 'box-c3', position: { x: 6.3, y: 12.8 }, radiusMeters: 0.2 },
        { id: 'box-c4', position: { x: 9.7, y: 12.8 }, radiusMeters: 0.2 },
      ],
      barriers: [
        { id: 'box-back-barrier', points: [{ x: 6.1, y: 13.1 }, { x: 9.9, y: 13.1 }], thicknessMeters: 0.25, kind: 'box_wall', label: 'Orqa chegara' },
      ],
      zones: [
        {
          id: 'reverse-box-bay-zone',
          kind: 'reverse_box_bay',
          polygon: [{ x: 6.4, y: 7.0 }, { x: 9.6, y: 7.0 }, { x: 9.6, y: 12.7 }, { x: 6.4, y: 12.7 }],
          label: 'Boks',
        },
        {
          id: 'box-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 0, y: 0.8 }, { x: 2.4, y: 0.8 }, { x: 2.4, y: 6.8 }, { x: 0, y: 6.8 }],
        },
      ],
      signs: [{ id: 'sign-515-box', signCode: '5.15', position: { x: 10.3, y: 7.2 }, label: 'Boks' }],
      geometryMetadata: CUSTOM_TRAINING_META(
        '3,4 × 6,0 m boks o‘lchami o‘quv modeli sifatida olingan (rasmiy chizma 3494-son ilovasi tasviriga muvofiq sozlanishi mumkin).'
      ),
    },
  },

  // 6. Harakat tartibga solingan chorraha
  {
    id: 'ex-06-intersection',
    order: 6,
    slug: 'regulated-intersection',
    category: ['B', 'C', 'D'],
    title: '6. Harakat tartibga solingan chorraha',
    shortTitle: 'Chorraha (svetofor)',
    purpose: 'Svetofor signallari (qizil, sariq, yashil va qo‘shimcha strelka), 1.12 stop chizig‘i va 1.18 yo‘nalish strelkalariga rioya qilish.',
    description:
      'Svetofor bilan tartibga solingan chorraha. Nomzod qizil chiroqda 1.12 stop chizig‘i oldida to‘xtashi, yashil chiroq yoki ruxsat beruvchi strelka yonganda xavfsiz o‘tishi kerak.',
    steps: [
      { order: 1, title: 'Svetoforni kuzating', description: 'Chorraha oldida svetofor signalini tekshiring.' },
      { order: 2, title: 'Qizilda 1.12 oldida to‘xtang', description: 'Qizil yoki ogohlantiruvchi sariqda stop chizig‘ini kesmay to‘xtang.' },
      { order: 3, title: 'Yashil va strelkani kuting', description: 'Yashil chiroq yonganda chap/to‘g‘ri yo‘nalishni tekshiring.' },
      { order: 4, title: 'Chorrahadan o‘ting', description: 'Belgilangan bo‘lakdan chiqmasdan chorrahadan o‘ting.' },
    ],
    tips: [
      'Sariq chiroq yonganda xavfsiz to‘xtash imkoni bo‘lsa albatta stop chizig‘i oldida to‘xtang.',
      'Burilishdan oldin burilish ko‘rsatkichini yoqishni unutmang.',
    ],
    commonMistakes: [
      'Qizil chiroqda stop chizig‘idan o‘tib ketish (jiddiy xato / xavfsizlikka tahdid).',
      'Qarama-qarshi bo‘lakka chiqib ketish.',
    ],
    trackedEvents: ['Qizil/sariq signalda stop chizig‘i nazorati', 'Burilish ko‘rsatkichi', '1.1/1.3 chiziqlar'],
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 17, y: 2 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 14, maxY: 14 },
      startPose: { x: 12.2, y: 3.2, headingDeg: 180 },
      directionArrows: [
        { x: 10.5, y: 3.2, headingDeg: 180 },
        { x: 5.5, y: 3.2, headingDeg: 180 },
      ],
      lines: [
        { id: 'int-top-11', start: { x: 0, y: 1.0 }, end: { x: 14, y: 1.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'int-bot-11-l', start: { x: 0, y: 6.2 }, end: { x: 4.5, y: 6.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'int-bot-11-r', start: { x: 9.5, y: 6.2 }, end: { x: 14, y: 6.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'int-cross-l', start: { x: 4.5, y: 6.2 }, end: { x: 4.5, y: 12.5 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'int-cross-r', start: { x: 9.5, y: 6.2 }, end: { x: 9.5, y: 12.5 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'int-center-15', start: { x: 0, y: 4.8 }, end: { x: 4.5, y: 4.8 }, markingCode: '1.5', widthMeters: 0.1 },
        { id: 'int-stop-112', start: { x: 9.5, y: 1.0 }, end: { x: 9.5, y: 6.2 }, markingCode: '1.12', widthMeters: 0.4, label: '1.12' },
      ],
      cones: [],
      barriers: [],
      trafficLight: {
        id: 'tl-main',
        position: { x: 4.2, y: 0.6 },
        hasDirectionArrow: true,
        greenDurationSec: 6,
        yellowDurationSec: 2,
        redDurationSec: 6,
        initialPhase: 'red',
      },
      zones: [
        {
          id: 'int-stop-zone',
          kind: 'stop_line',
          polygon: [{ x: 9.0, y: 1.0 }, { x: 9.7, y: 1.0 }, { x: 9.7, y: 6.2 }, { x: 9.0, y: 6.2 }],
        },
        {
          id: 'int-box-zone',
          kind: 'intersection_box',
          polygon: [{ x: 4.5, y: 1.0 }, { x: 9.5, y: 1.0 }, { x: 9.5, y: 6.2 }, { x: 4.5, y: 6.2 }],
        },
        {
          id: 'int-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 0, y: 1.0 }, { x: 2.5, y: 1.0 }, { x: 2.5, y: 6.2 }, { x: 0, y: 6.2 }],
        },
      ],
      signs: [],
      geometryMetadata: CUSTOM_TRAINING_META('Svetofor fazalari davomiyligi o‘quv ssenariysiga ko‘ra sozlangan.'),
    },
  },

  // 7. Ilon izi
  {
    id: 'ex-07-slalom',
    order: 7,
    slug: 'slalom',
    category: ['B', 'A', 'A1', 'C', 'D'],
    title: '7. Ilon izi',
    shortTitle: 'Ilon izi',
    purpose: 'Konuslar orasidan navbatma-navbat chap va o‘ngga rulni silliq aylantirib, avtomobil gabaritini his qilib o‘tish.',
    description:
      'B toifasi uchun ajratilgan yo‘lakda bir qator joylashgan konuslar orasidan ilon izi shaklida burilib o‘tish mashqi.',
    steps: [
      { order: 1, title: 'Kirish tezligini pasaytirish', description: '1-uzatmada bir tekis past tezlikda kiring.' },
      { order: 2, title: 'Birinchi konusni aylanib o‘tish', description: 'Birinchi konusning o‘ng/chap tomonidan kengroq trayektoriya oling.' },
      { order: 3, title: 'Navbatma-navbat rul burish', description: 'Avtomobil yon eshigi konusdan o‘tishi bilan rulni qarama-qarshi tomonga aylantiring.' },
      { order: 4, title: 'Chiqish chizig‘iga tekislanish', description: 'Oxirgi konusdan keyin to‘g‘ri yo‘nalishga chiqing.' },
    ],
    tips: [
      'Konusga juda yaqin bormang — orqa g‘ildirak konusni ilib ketishi mumkin.',
      'Rulni bir maromda, shoshmasdan aylantiring.',
    ],
    commonMistakes: [
      'Konusga tegish yoki uni yiqitish.',
      'Yo‘lak chegarasidagi 1.1 chizig‘ini bosish.',
      'Konusni aylanmay to‘g‘ri o‘tib ketish.',
    ],
    trackedEvents: ['Konus to‘qnashuvi', '1.1 chegara nazorati', 'Ilon izi yo‘nalishi'],
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 19, y: 18 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 28, maxY: 8 },
      startPose: { x: 1.8, y: 4.0, headingDeg: 0 },
      directionArrows: [
        { x: 4.5, y: 2.3, headingDeg: -20 },
        { x: 11.0, y: 5.7, headingDeg: 20 },
        { x: 17.5, y: 2.3, headingDeg: -20 },
        { x: 24.5, y: 4.0, headingDeg: 0 },
      ],
      lines: [
        { id: 'sl-top-11', start: { x: 0, y: 0.8 }, end: { x: 28, y: 0.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'sl-bot-11', start: { x: 0, y: 7.2 }, end: { x: 28, y: 7.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
      ],
      cones: [
        { id: 'sl-c1', position: { x: 7.5, y: 4.0 }, radiusMeters: 0.24 },
        { id: 'sl-c2', position: { x: 14.0, y: 4.0 }, radiusMeters: 0.24 },
        { id: 'sl-c3', position: { x: 20.5, y: 4.0 }, radiusMeters: 0.24 },
      ],
      barriers: [],
      zones: [
        {
          id: 'sl-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 25.0, y: 0.8 }, { x: 28, y: 0.8 }, { x: 28, y: 7.2 }, { x: 25.0, y: 7.2 }],
        },
      ],
      signs: [{ id: 'sign-1121-sl', signCode: '1.12.1', position: { x: 1.0, y: 7.6 }, label: 'Ilon izi' }],
      geometryMetadata: CUSTOM_TRAINING_META(
        'Konuslar oralig‘i (6,5 m) va yo‘lak kengligi (6,4 m) B toifasi o‘quv konfiguratsiyasi; admin panelda sozlanadi.'
      ),
    },
  },

  // 8. Orqaga harakatlanib parallel to'xtash - parkovka
  {
    id: 'ex-08-parallel-parking',
    order: 8,
    slug: 'parallel-parking',
    category: ['B'],
    title: '8. Orqaga harakatlanib parallel to‘xtash — Parkovka',
    shortTitle: 'Parallel parkovka',
    purpose: 'Oldinda va orqada turgan transport vositalari orasidagi cheklangan joyga orqaga yurib parallel joylashish.',
    description:
      '3494-son hujjat 4-ilovasining 7-mashqiga asoslangan B toifasi parallel parkovka maydonchasi. Yon, old va orqa masofalar real vaqtda ko‘rsatiladi.',
    steps: [
      { order: 1, title: 'Oldingi avtomobil bilan yonma-yon to‘xtash', description: 'Parkovka joyidan oldinga o‘tib, yon oraliq ~0,6–1,0 m qoldirib to‘xtang.' },
      { order: 2, title: 'R uzatma va o‘ngga to‘liq burilish', description: 'Orqa o‘ng g‘ildirak bay boshiga kelganda rulni o‘ngga buring.' },
      { order: 3, title: '45° burchakda to‘g‘ri orqaga yurish', description: 'Chap ko‘zguda orqa avtomobilning tashqi burchagi ko‘ringanda rulni tekislang.' },
      { order: 4, title: 'Chapga burib bay ichiga tekislash', description: 'Old qanot bayga kirishi bilan rulni chapga burib parallel holatga keltiring.' },
      { order: 5, title: 'To‘xtash va chiqish', description: 'Bay ichida 1.1 chizig‘ini bosmay to‘xtang, so‘ng oldinga chiqing.' },
    ],
    tips: [
      'Yon, old va orqa masofa indikatorlarini kuzating.',
      'Oldinga-orqaga to‘g‘irlash kerak bo‘lsa chegaralarga tegmasdan bajarishingiz mumkin.',
    ],
    commonMistakes: [
      'Oldingi yoki orqadagi avtomobil gabariti to‘sig‘iga urilish.',
      'Yo‘l cheti (bordyur/1.1) chizig‘idan chiqib ketish.',
      'Bay ichiga qiyshiq yoki to‘liq kirmasdan yakunlash.',
    ],
    trackedEvents: [
      'Bay ichiga to‘liq joylashish',
      'Old/orqa avtomobil to‘sig‘i bilan to‘qnashuv',
      'Bordyur/chiziq nazorati',
    ],
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 48, y: 18 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 18, maxY: 10 },
      startPose: { x: 2.0, y: 2.8, headingDeg: 0 },
      directionArrows: [
        { x: 5.0, y: 2.8, headingDeg: 0 },
        { x: 14.5, y: 2.8, headingDeg: 0 },
      ],
      lines: [
        { id: 'pp-top-11', start: { x: 0, y: 0.6 }, end: { x: 18, y: 0.6 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'pp-bot-lane-l', start: { x: 0, y: 5.2 }, end: { x: 5.6, y: 5.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'pp-bot-lane-r', start: { x: 12.6, y: 5.2 }, end: { x: 18, y: 5.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        // Bay perimeter (7.0m length x 2.7m depth)
        { id: 'pp-bay-left', start: { x: 5.6, y: 5.2 }, end: { x: 5.6, y: 7.9 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'pp-bay-right', start: { x: 12.6, y: 5.2 }, end: { x: 12.6, y: 7.9 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'pp-bay-curb', start: { x: 5.6, y: 7.9 }, end: { x: 12.6, y: 7.9 }, markingCode: '1.1', widthMeters: 0.14, isSensorBoundary: true },
      ],
      cones: [
        { id: 'pp-c1', position: { x: 5.6, y: 5.2 }, radiusMeters: 0.18 },
        { id: 'pp-c2', position: { x: 12.6, y: 5.2 }, radiusMeters: 0.18 },
      ],
      barriers: [
        {
          id: 'pp-rear-car',
          points: [{ x: 1.5, y: 6.5 }, { x: 5.2, y: 6.5 }],
          thicknessMeters: 1.75,
          kind: 'parked_car',
          label: 'Orqa avtomobil',
        },
        {
          id: 'pp-front-car',
          points: [{ x: 13.0, y: 6.5 }, { x: 16.7, y: 6.5 }],
          thicknessMeters: 1.75,
          kind: 'parked_car',
          label: 'Oldingi avtomobil',
        },
      ],
      zones: [
        {
          id: 'pp-bay-zone',
          kind: 'parking_bay',
          polygon: [{ x: 5.7, y: 5.1 }, { x: 12.5, y: 5.1 }, { x: 12.5, y: 7.8 }, { x: 5.7, y: 7.8 }],
          label: 'Parkovka joyi',
        },
        {
          id: 'pp-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 15.2, y: 0.6 }, { x: 18, y: 0.6 }, { x: 18, y: 5.2 }, { x: 15.2, y: 5.2 }],
        },
      ],
      signs: [
        { id: 'sign-515-pp', signCode: '5.15', position: { x: 9.1, y: 8.6 }, label: '5.15 + 7.4.3 + 7.6.1' },
      ],
      geometryMetadata: CUSTOM_TRAINING_META(
        '3494-son hujjat 4-ilovasi 7-mashq B toifasi sxemasi tasviriga tayangan o‘quv o‘lchamlari (7,0 × 2,7 m bay); admin paneldan tahrirlanadi.'
      ),
    },
  },

  // 9. Tartibga solinmagan temir yo'l kesishmasi
  {
    id: 'ex-09-railway',
    order: 9,
    slug: 'railway-crossing',
    category: ['B', 'C', 'D'],
    title: '9. Tartibga solinmagan temir yo‘l kesishmasi',
    shortTitle: 'Temir yo‘l kesishmasi',
    purpose: 'Temir yo‘l kesishmasiga yaqinlashganda to‘liq to‘xtash, poyezdni o‘tkazib yuborish va relslar ustida to‘xtab qolmaslik.',
    description:
      '1.2 va 1.3.1 hamda 2.5 (STOP) belgilari o‘rnatilgan temir yo‘l kesishmasi. Yaqinlashayotgan poyezd ssenariysida 1.12 stop chizig‘i oldida kutish majburiy.',
    steps: [
      { order: 1, title: '1.2 va 2.5 belgilariga e’tibor bering', description: 'Tezlikni pasaytiring va to‘xtashga tayyorlaning.' },
      { order: 2, title: '1.12 stop chizig‘i oldida to‘xtang', description: 'Har qanday holatda stop chizig‘i oldida to‘liq to‘xtang.' },
      { order: 3, title: 'Poyezd va signalni kuting', description: 'Ogohlantirish chirog‘i o‘chib, poyezd to‘liq o‘tib ketguncha joyingizda turing.' },
      { order: 4, title: 'Kesishmani to‘xtamasdan kesib o‘ting', description: 'Izlar ustida to‘xtab qolmay xavfsiz o‘ting.' },
    ],
    tips: [
      'Poyezd o‘tib ketgandan keyin ham ikkala tomonga qarab ishonch hosil qiling.',
      'Temir yo‘l izlari ustida uzatmani almashtirmang — 1-uzatmada o‘ting.',
    ],
    commonMistakes: [
      'Stop chizig‘ida to‘xtamasdan yoki poyezd yaqinlashganda kesishmaga kirish.',
      'Temir yo‘l izi ustida to‘xtab qolish.',
    ],
    trackedEvents: ['1.12 stop chizig‘i', 'Poyezd ssenariysi xavfsizligi', 'Relssiz to‘xtash zonasi'],
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 2, y: 2 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 14, maxY: 10 },
      startPose: { x: 12.2, y: 3.2, headingDeg: 180 },
      directionArrows: [
        { x: 10.5, y: 3.2, headingDeg: 180 },
        { x: 3.0, y: 3.2, headingDeg: 180 },
      ],
      lines: [
        { id: 'rw-top-11', start: { x: 0, y: 0.8 }, end: { x: 14, y: 0.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'rw-bot-11', start: { x: 0, y: 5.6 }, end: { x: 14, y: 5.6 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'rw-stop-112', start: { x: 9.2, y: 0.8 }, end: { x: 9.2, y: 5.6 }, markingCode: '1.12', widthMeters: 0.4, label: '1.12' },
      ],
      cones: [],
      barriers: [],
      railway: {
        id: 'rw-main',
        trackCenter: { x: 6.4, y: 3.2 },
        trackAngleDeg: 90,
        hasBarrier: false,
        trainTriggerSec: 2.0,
        trainPassDurationSec: 5.5,
      },
      zones: [
        {
          id: 'rw-stop-zone',
          kind: 'stop_line',
          polygon: [{ x: 8.8, y: 0.8 }, { x: 9.5, y: 0.8 }, { x: 9.5, y: 5.6 }, { x: 8.8, y: 5.6 }],
        },
        {
          id: 'rw-tracks-zone',
          kind: 'railway_tracks',
          polygon: [{ x: 5.2, y: 0.8 }, { x: 7.6, y: 0.8 }, { x: 7.6, y: 5.6 }, { x: 5.2, y: 5.6 }],
          label: 'Temir yo‘l izi',
        },
        {
          id: 'rw-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 0, y: 0.8 }, { x: 2.5, y: 0.8 }, { x: 2.5, y: 5.6 }, { x: 0, y: 5.6 }],
        },
      ],
      signs: [
        { id: 'sign-12-rw', signCode: '1.2', position: { x: 12.2, y: 6.2 }, label: '1.2 Shlagbaumsiz kesishma' },
        { id: 'sign-131-rw', signCode: '1.3.1', position: { x: 8.2, y: 6.2 }, label: '1.3.1 Bir izli temir yo‘l' },
        { id: 'sign-25-rw', signCode: '2.5', position: { x: 9.2, y: 0.3 }, label: '2.5 STOP' },
      ],
      geometryMetadata: CUSTOM_TRAINING_META('YHQ belgilari (1.2, 1.3.1, 2.5) va 1.12 stop chizig‘i rasmiy; maydon o‘lchami o‘quv modeli.'),
    },
  },

  // 10. Tezlashish bo'lagi
  {
    id: 'ex-10-acceleration',
    order: 10,
    slug: 'acceleration-lane',
    category: ['B', 'C', 'D'],
    title: '10. Tezlashish bo‘lagi',
    shortTitle: 'Tezlashish bo‘lagi',
    purpose: 'Ajratilgan bo‘lakda uzatmalarni ketma-ket oshirib (1→2) tezlashish va 20 km/soat tezlik cheklovini buzmasdan nazoratli boshqarish.',
    description:
      'B/C/D avtodromining tezlanish bo‘lagi. Ushbu bo‘lakda tezlikni barqaror oshirib, 3.243 (20 km/soat) cheklovini oshirmasdan keyingi avariya to‘xtashiga tayyorlaniladi.',
    steps: [
      { order: 1, title: 'Bo‘lakka to‘g‘ri kirish', description: '1-uzatmada tezlashish bo‘lagi boshiga kiring.' },
      { order: 2, title: 'Tezlikni oshirish va 2-uzatmaga o‘tish', description: 'Gazni tekis bosib ~15–19 km/soat gacha tezlaning.' },
      { order: 3, title: 'Tezlik cheklovini nazorat qilish', description: '20 km/soat cheklovidan oshirmang.' },
      { order: 4, title: 'Keyingi elementga tayyorlanish', description: 'Bo‘lak oxirida keyingi mashqqa silliq o‘ting.' },
    ],
    tips: [
      'Spidometrni kuzatib 14–19 km/soat oralig‘ini ushlang.',
      '20 km/soat cheklovi aynan belgilangan avtodrom bo‘lagi uchun amal qiladi.',
    ],
    commonMistakes: [
      'Belgilangan 20 km/soat cheklovidan oshib ketish.',
      'Uzatma almashtirishda avtomobilni siltab yuborish yoki chegaradan chiqish.',
    ],
    trackedEvents: ['Maksimal tezlik nazorati (20 km/soat)', 'Minimal tezlanishga erishish', '1.8/1.1 chiziq nazorati'],
    speedLimitKmh: 20,
    speedLimitMetadata: OFFICIAL_3494_META,
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 2, y: 13 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 16, maxY: 7 },
      startPose: { x: 2.0, y: 3.5, headingDeg: 0 },
      directionArrows: [
        { x: 5.0, y: 3.5, headingDeg: 0 },
        { x: 11.0, y: 3.5, headingDeg: 0 },
      ],
      lines: [
        { id: 'acc-top-11', start: { x: 0, y: 1.0 }, end: { x: 16, y: 1.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'acc-bot-11', start: { x: 0, y: 6.0 }, end: { x: 16, y: 6.0 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'acc-lane-15', start: { x: 3.0, y: 3.5 }, end: { x: 12.0, y: 3.5 }, markingCode: '1.5', widthMeters: 0.1 },
      ],
      cones: [],
      barriers: [],
      zones: [
        {
          id: 'acc-speed-zone',
          kind: 'speed_limit_zone',
          polygon: [{ x: 2.0, y: 1.0 }, { x: 15.0, y: 1.0 }, { x: 15.0, y: 6.0 }, { x: 2.0, y: 6.0 }],
          targetSpeedMaxKmh: 20,
          targetSpeedMinKmh: 12,
          label: 'Tezlanish (12–20 km/soat)',
        },
        {
          id: 'acc-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 13.5, y: 1.0 }, { x: 16, y: 1.0 }, { x: 16, y: 6.0 }, { x: 13.5, y: 6.0 }],
        },
      ],
      signs: [{ id: 'sign-3243-acc', signCode: '3.243', position: { x: 3.0, y: 6.5 }, label: '3.243 (20 km/soat)' }],
      geometryMetadata: CUSTOM_TRAINING_META('3.243 (20 km/soat) rasmiy belgi; yo‘lak uzunligi o‘quv konfiguratsiyasi.'),
    },
  },

  // 11. Avariya holatida to'xtash
  {
    id: 'ex-11-emergency-stop',
    order: 11,
    slug: 'emergency-stop',
    category: ['B', 'C', 'D'],
    title: '11. Avariya holatida to‘xtash',
    shortTitle: 'Avariya to‘xtashi',
    purpose: 'Kutilmagan avariya signali berilganda avtomobilni tez, nazoratli to‘xtatish va avariya chiroqlarini yoqish.',
    description:
      'Harakat davomida maxsus signal berilganda haydovchi tormoz va ilashishni bosib avtomobilni xavfsiz to‘xtatadi hamda avariya yorug‘lik ishorasini yoqadi.',
    steps: [
      { order: 1, title: 'Harakatni boshlash', description: 'Yo‘lak bo‘ylab 10–15 km/soat tezlikda harakatlaning.' },
      { order: 2, title: 'Signalni kutish', description: 'Qizil “AVARIYA TO‘XTASH SIGNALI!” ogohlantirishi paydo bo‘lishini kuzating.' },
      { order: 3, title: 'Tez va nazoratli tormozlash', description: 'Tormoz (Space/Past) va ilashishni bosib to‘liq to‘xtang.' },
      { order: 4, title: 'Avariya chiroqlarini yoqish', description: 'To‘xtagach avariya chiroqlarini yoqing (X tugmasi).' },
      { order: 5, title: 'Signal bekor bo‘lgach davom etish', description: 'Chiroqlarni o‘chirib chiqish zonasiga o‘ting.' },
    ],
    tips: [
      'Signal berilgandan so‘ng rulni burib yubormay to‘g‘ri yo‘nalishda tormozlang.',
      'Reaksiya vaqti va tormoz masofasi o‘quv ko‘rsatkichi sifatida ko‘rsatiladi (rasmiy mezon markaz reglamentiga bog‘liq).',
    ],
    commonMistakes: [
      'Signal berilgandan keyin to‘xtamasdan yurishda davom etish.',
      'To‘xtagandan keyin avariya chiroqlarini yoqmaslik.',
    ],
    trackedEvents: ['Reaksiya va tormozlash', 'Avariya chiroqlari yoqilishi', '1.1 chiziq nazorati'],
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 2, y: 21 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 16, maxY: 6 },
      startPose: { x: 2.0, y: 3.0, headingDeg: 0 },
      directionArrows: [
        { x: 5.5, y: 3.0, headingDeg: 0 },
        { x: 12.0, y: 3.0, headingDeg: 0 },
      ],
      lines: [
        { id: 'em-top-11', start: { x: 0, y: 0.8 }, end: { x: 16, y: 0.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'em-bot-11', start: { x: 0, y: 5.2 }, end: { x: 16, y: 5.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
      ],
      cones: [],
      barriers: [],
      zones: [
        {
          id: 'em-trigger-zone',
          kind: 'emergency_trigger_zone',
          polygon: [{ x: 5.5, y: 0.8 }, { x: 11.5, y: 0.8 }, { x: 11.5, y: 5.2 }, { x: 5.5, y: 5.2 }],
          label: 'Signal zonasi',
        },
        {
          id: 'em-exit',
          kind: 'exercise_exit',
          polygon: [{ x: 13.5, y: 0.8 }, { x: 16, y: 0.8 }, { x: 16, y: 5.2 }, { x: 13.5, y: 5.2 }],
        },
      ],
      signs: [],
      geometryMetadata: CUSTOM_TRAINING_META('Avariya signali zonasi va reaksiya vaqti o‘quv konfiguratsiyasi (rasmiy reglamentga bog‘liq).'),
    },
  },

  // 12. FINISH
  {
    id: 'ex-12-finish',
    order: 12,
    slug: 'finish',
    category: ['B', 'C', 'D'],
    title: '12. Harakatni yakunlash — FINISH',
    shortTitle: 'FINISH',
    purpose: 'FINISH chizig‘ida to‘xtash, uzatmani neytralga o‘tkazish, qo‘l tormozini tortish va dvigatelni o‘chirish.',
    description:
      '3494-son hujjatga ko‘ra START va FINISH bir-biriga yaqin joylashtiriladi. FINISH chizig‘idan o‘tib to‘xtash joyida avtomobilni xavfsiz o‘chirish bilan imtihon sessiyasi yakunlanadi.',
    steps: [
      { order: 1, title: 'FINISH chizig‘iga yaqinlashish', description: 'Past tezlikda 0,4 m enli FINISH chizig‘idan o‘ting.' },
      { order: 2, title: 'To‘xtash zonasida to‘liq to‘xtash', description: 'Avtomobilni to‘xtash zonasida to‘xtating.' },
      { order: 3, title: 'Uzatmani N holatga o‘tkazish', description: 'Ilashishni bosib uzatmani neytral (N)ga qo‘ying.' },
      { order: 4, title: 'Qo‘l tormozini tortish', description: 'Qo‘l tormozini torting (H tugmasi).' },
      { order: 5, title: 'Dvigatelni o‘chirish', description: 'Dvigatelni o‘chirib sessiyani yakunlang (E tugmasi).' },
    ],
    tips: [
      'FINISH chizig‘ini kesib o‘tganingizdan so‘ng uzatmani N ga o‘tkazmasdan ilashishni qo‘yib yubormang.',
    ],
    commonMistakes: [
      'FINISH chizig‘iga yetmasdan to‘xtab qolish.',
      'Qo‘l tormozini tortmasdan yoki uzatmani N ga o‘tkazmasdan yakunlash.',
    ],
    trackedEvents: ['FINISH chizig‘ini kesib o‘tish', 'Neytral holat (N)', 'Qo‘l tormozi', 'Dvigatel o‘chirilishi'],
    requiresFinishShutdown: true,
    orderMetadata: B_ORDER_NOTE,
    worldOffset: { x: 2, y: 36 },
    geometry: {
      bounds: { minX: 0, minY: 0, maxX: 16, maxY: 6 },
      startPose: { x: 2.0, y: 3.0, headingDeg: 0 },
      directionArrows: [
        { x: 5.0, y: 3.0, headingDeg: 0 },
        { x: 10.5, y: 3.0, headingDeg: 0 },
      ],
      lines: [
        { id: 'fin-top-11', start: { x: 0, y: 0.8 }, end: { x: 16, y: 0.8 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'fin-bot-11', start: { x: 0, y: 5.2 }, end: { x: 16, y: 5.2 }, markingCode: '1.1', widthMeters: 0.12, isSensorBoundary: true },
        { id: 'fin-line-04', start: { x: 8.5, y: 0.8 }, end: { x: 8.5, y: 5.2 }, markingCode: '1.1', widthMeters: 0.4, label: 'FINISH' },
        { id: 'fin-end-dashed', start: { x: 14.5, y: 1.0 }, end: { x: 14.5, y: 5.0 }, markingCode: 'dashed-yellow', widthMeters: 0.15 },
      ],
      cones: [],
      barriers: [],
      zones: [
        {
          id: 'fin-line-zone',
          kind: 'finish_line',
          polygon: [{ x: 8.3, y: 0.8 }, { x: 13.8, y: 0.8 }, { x: 13.8, y: 5.2 }, { x: 8.3, y: 5.2 }],
          label: 'FINISH zonasi',
        },
      ],
      signs: [],
      geometryMetadata: CUSTOM_TRAINING_META(
        'FINISH chizig‘i eni (0,4 m) va yozuv masofasi (1 m) 3494-son hujjatdan; STOP zonasi o‘quv konfiguratsiyasi.'
      ),
    },
  },
];

export function getExerciseBySlug(slug: string): ExerciseConfig | undefined {
  return EXERCISES_B.find((ex) => ex.slug === slug);
}

export function getExerciseOrderIndex(slug: ExerciseSlug): number {
  return EXERCISES_B.findIndex((ex) => ex.slug === slug);
}

export const AUTODROME_WORLD_BOUNDS = {
  widthMeters: 68,
  heightMeters: 44,
  fenceHeightMeters: 2.0,
  surface: 'Asfalt / sement-beton',
  metadata: OFFICIAL_3494_META,
};
