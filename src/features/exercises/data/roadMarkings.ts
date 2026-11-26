import { OFFICIAL_3494_META, OFFICIAL_YHQ_META } from '@/lib/constants/regulations';
import type { RoadMarkingCatalogItem } from '@/types';

export const ROAD_MARKINGS_CATALOG: RoadMarkingCatalogItem[] = [
  // ============================================
  // 3494-SON HUJJATDAGI AVTODROM CHIZIQLARI
  // ============================================
  {
    code: '1.1',
    name: 'Uzluksiz oq chiziq (avtodrom chegarasi va bo‘laklar)',
    group: 'autodrome_3494',
    color: 'white',
    patternType: 'solid',
    description:
      'Qarama-qarshi oqimlarni, bo‘laklar chegarasini va avtodrom yo‘l qatnov qismining tashqi/ichki chegaralarini belgilovchi uzluksiz oq yotiq chiziq.',
    autodromeUsage:
      '3494-son hujjatga ko‘ra B, C, D toifali avtodrom maydonining chegara chiziqlari 1.1 oq chiziq bilan belgilanadi. START, STOP va FINISH chiziqlari ham 1.1 ko‘rinishida chiziladi.',
    driverMeaning:
      'Chiziqni g‘ildirak yoki kuzov bilan bosish va kesib o‘tish taqiqlanadi. Simulyatsiyada barcha 4 g‘ildirak va kuzov perimetri bo‘yicha nazorat qilinadi.',
    usedInExercises: [
      'start',
      'turn-90',
      'reverse-box',
      'regulated-intersection',
      'slalom',
      'parallel-parking',
      'acceleration-lane',
      'finish',
    ],
    widthNote: 'Standart chegara chizig‘i; START/STOP/FINISH ko‘ndalang chizig‘i — 0,4 m.',
    metadata: OFFICIAL_3494_META,
  },
  {
    code: '1.4',
    name: 'Uzluksiz sariq chiziq (A/A1 toifa chegarasi / to‘xtash taqiqlangan joy)',
    group: 'autodrome_3494',
    color: 'yellow',
    patternType: 'solid',
    description:
      'YHQda to‘xtash taqiqlangan joyni bildiradi; 3494-son hujjatda esa A va A1 toifali mototransport avtodrom maydonining chegara chizig‘i sifatida belgilangan.',
    autodromeUsage:
      'Faqat A/A1 toifali maydonlar va alohida rasmiy sxemada ko‘rsatilgan zonalar chegarasi uchun qo‘llanadi. B/C/D maydonining umumiy chegara chizig‘i sifatida ishlatilmaydi.',
    driverMeaning:
      'Mototsikl mashqlari chegarasidan chiqmaslik yoki umumiy yo‘lda to‘xtash taqiqlangan hududni bildiradi.',
    usedInExercises: ['start'],
    widthNote: 'A/A1 toifalari uchun maydon chegara chizig‘i (3494-son va 3494-1-son).',
    metadata: OFFICIAL_3494_META,
  },
  {
    code: 'Sariq uzuq-uzuq',
    name: 'Uzuq-uzuq sariq chegara chizig‘i (boshlanish/tugash maydoni)',
    group: 'autodrome_3494',
    color: 'yellow',
    patternType: 'dashed',
    description:
      'Avtodrom mashq hududining boshlanish va tugallanish zonalarini ajratuvchi uzuq-uzuq sariq chiziq.',
    autodromeUsage:
      'B/C/D avtodrom yo‘lining boshlanish va tugallanish maydoni chegarasi kengligi 0,1 yoki 0,2 m bo‘lgan uzuq-uzuq sariq chiziq bilan belgilanadi. A/A1 uchun kengligi 0,10 m.',
    driverMeaning:
      'Mashq zonasiga kirish va chiqish chegaralarini aniq ajratib turadi (B/C/D va A/A1 orasida eni bo‘yicha farq bor).',
    usedInExercises: ['start', 'finish', 'reverse-box', 'parallel-parking'],
    widthNote: 'B/C/D: 0,1–0,2 m; A/A1: 0,10 m.',
    metadata: OFFICIAL_3494_META,
  },
  {
    code: 'START / FINISH',
    name: 'START, STOP va FINISH ko‘ndalang chiziqlari hamda yozuvlari',
    group: 'autodrome_3494',
    color: 'white',
    patternType: 'start-finish-line',
    description:
      'Mashq va imtihon marshrutining boshlanishi (START), majburiy to‘xtash nuqtasi (STOP) va yakuni (FINISH)ni bildiruvchi 0,4 m kenglikdagi ko‘ndalang oq 1.1 chiziq.',
    autodromeUsage:
      'B/C/D maydonida START va FINISH yozuvlari bilan chiziq oralig‘i 1 m, yozuv uzunligi 0,6 yoki 1 m (A/A1 da 0,6 m). Chiziq va yozuv alohida elementlar hisoblanadi.',
    driverMeaning:
      'START — harakat boshlanish chegarasi; FINISH — to‘liq to‘xtab sessiyani yakunlash joyi.',
    usedInExercises: ['start', 'finish'],
    widthNote: 'Chiziq eni: 0,4 m; yozuv masofasi: 1,0 m.',
    metadata: OFFICIAL_3494_META,
  },
  {
    code: '1.12',
    name: 'To‘xtash chizig‘i (STOP chizig‘i)',
    group: 'autodrome_3494',
    color: 'white',
    patternType: 'stop-line',
    description:
      'Svetoforning taqiqlovchi signali, temir yo‘l kesishmasi yoki estakada ko‘tarilishi oldida avtomobil old gabariti o‘tmasdan to‘xtashi shart bo‘lgan ko‘ndalang oq chiziq.',
    autodromeUsage:
      'Estakada mashqida ko‘tarilish oxirigacha 1,0 m masofada eni 0,4 m qilib chiziladi; shuningdek tartibga solingan chorraha va temir yo‘l kesishmasi oldida qo‘llanadi.',
    driverMeaning:
      'Avtomobilning old bamperi 1.12 chizig‘ini kesib o‘tmasdan to‘xtashi shart.',
    usedInExercises: ['estakada', 'regulated-intersection', 'railway-crossing'],
    widthNote: 'Eni 0,4 m (estakadada ko‘tarilish tugashidan 1 m oldin).',
    metadata: OFFICIAL_3494_META,
  },
  {
    code: '1.14.1 / 1.14.2',
    name: 'Piyodalar o‘tish joyi — “Zebra”',
    group: 'autodrome_3494',
    color: 'white-yellow',
    patternType: 'zebra',
    description:
      'Piyodalar kesib o‘tishi uchun mo‘ljallangan ketma-ket oq parallel bloklar (1.14.1/1.14.2; ayrim joylarda oq-sariq yoki maktab oldida 1.14.4 oq-qizil).',
    autodromeUsage:
      'Ikki tomonida 5.16.1 va 5.16.2 belgilari o‘rnatiladi. Piyoda paydo bo‘lganda yo‘l berish nazorat qilinadi.',
    driverMeaning:
      'Yaqinlashganda tezlikni pasaytiring, piyoda bo‘lsa zebra oldida to‘xtang; zebra ustida to‘xtab qolmang.',
    usedInExercises: ['pedestrian-crossing', 'regulated-intersection'],
    metadata: OFFICIAL_3494_META,
  },

  // ============================================
  // UMUMIY O'ZBEKISTON YHQ CHIZIQLARI KATALOGI
  // ============================================
  {
    code: '1.3',
    name: 'Ikki uzluksiz ajratuvchi chiziq',
    group: 'yhq_general',
    color: 'white',
    patternType: 'double-solid',
    description:
      'To‘rt va undan ortiq harakatlanish bo‘lagi bo‘lgan yo‘llarda qarama-qarshi yo‘nalishdagi transport oqimlarini ajratadi.',
    autodromeUsage: 'Ko‘p tasmali yo‘llar va chorraha yondashuvlarini o‘rgatishda qo‘llanadi.',
    driverMeaning: 'Kesib o‘tish va ustida yurish qat’iyan taqiqlanadi.',
    usedInExercises: ['regulated-intersection'],
    metadata: OFFICIAL_YHQ_META,
  },
  {
    code: '1.5',
    name: 'Uzuq-uzuq ajratuvchi chiziq',
    group: 'yhq_general',
    color: 'white',
    patternType: 'dashed',
    description:
      'Bir yo‘nalishdagi ikki va undan ortiq bo‘laklarni yoki 2–3 tasmali yo‘lda qarama-qarshi oqimlarni ajratadi (chiziq uzunligi bo‘shliqdan kichik, odatda 1:3 nisbatda).',
    autodromeUsage: 'Tezlashish bo‘lagi va chorraha bo‘laklarini ajratishda ishlatiladi.',
    driverMeaning: 'Xavfsizlikni tekshirib qayta tizilish uchun kesib o‘tishga ruxsat beriladi.',
    usedInExercises: ['acceleration-lane', 'regulated-intersection'],
    metadata: OFFICIAL_YHQ_META,
  },
  {
    code: '1.6',
    name: 'Yaqinlashish chizig‘i',
    group: 'yhq_general',
    color: 'white',
    patternType: 'approach-dashed',
    description:
      'Shtrix uzunligi orasidagi masofadan 3 barobar katta bo‘lgan uzuq-uzuq chiziq. Oldinda 1.1 yoki 1.11 uzluksiz chiziq boshlanishidan ogohlantiradi.',
    autodromeUsage: 'Chorraha va burilish oldidagi qayta tizilishni o‘rgatishda ko‘rsatiladi.',
    driverMeaning: 'Qayta tizilishni yakunlash va uzluksiz chiziqqa tayyorlanish kerak.',
    usedInExercises: ['regulated-intersection', 'acceleration-lane'],
    metadata: OFFICIAL_YHQ_META,
  },
  {
    code: '1.7',
    name: 'Chorraha ichidagi qisqa uzuq-uzuq chiziq',
    group: 'yhq_general',
    color: 'white',
    patternType: 'short-dashed',
    description:
      'Shtrix uzunligi va orasidagi bo‘shliq teng bo‘lgan qisqa uzuq-uzuq chiziq. Chorraha hududida bo‘laklar trayektoriyasini ko‘rsatadi.',
    autodromeUsage: 'Tartibga solingan chorrahada burilish trayektoriyasini ko‘rsatishda ishlatiladi.',
    driverMeaning: 'Burilishda o‘z bo‘lagingizni yo‘qotmaslik uchun yo‘nalish beradi; kesib o‘tish mumkin.',
    usedInExercises: ['regulated-intersection'],
    metadata: OFFICIAL_YHQ_META,
  },
  {
    code: '1.8',
    name: 'Tezlashish / sekinlashish bo‘lagi chegarasi',
    group: 'yhq_general',
    color: 'white',
    patternType: 'wide-dashed',
    description:
      'Asosiy yo‘l qatnov qismi bilan tezlashish yoki sekinlashish bo‘lagi orasidagi chegarani bildiruvchi keng uzuq-uzuq chiziq.',
    autodromeUsage: '10-mashq (Tezlashish bo‘lagi)da asosiy oqimga qo‘shilish zonasida ko‘rsatiladi.',
    driverMeaning: 'Tezlikni moslashtirib asosiy bo‘lakka xavfsiz qo‘shilish yoki undan chiqish joyi.',
    usedInExercises: ['acceleration-lane'],
    metadata: OFFICIAL_YHQ_META,
  },
  {
    code: '1.11',
    name: 'Qo‘shma chiziq (uzluksiz + uzuq-uzuq)',
    group: 'yhq_general',
    color: 'white',
    patternType: 'combined-solid-dashed',
    description:
      'Bir tomondan uzluksiz (1.1), ikkinchi tomondan uzuq-uzuq (1.5) chiziqdan iborat juft chiziq.',
    autodromeUsage: 'Yo‘l qismlarida bir tomonlama qayta tizilish qoidasini tushuntirish uchun.',
    driverMeaning: 'Faqat uzuq-uzuq chiziq joylashgan tomondan kesib o‘tishga ruxsat etiladi.',
    usedInExercises: ['acceleration-lane'],
    metadata: OFFICIAL_YHQ_META,
  },
  {
    code: '1.16.1–1.16.3',
    name: 'Yo‘naltiruvchi orolchalar',
    group: 'yhq_general',
    color: 'white',
    patternType: 'island',
    description:
      'Transport oqimlari ajraladigan (1.16.2) yoki qo‘shiladigan (1.16.3) va qarama-qarshi oqimlar ajraladigan (1.16.1) joylardagi shtrixlangan orolchalar.',
    autodromeUsage: 'Tezlashish bo‘lagi va keng chorrahalarda oqim ajralishini ko‘rsatishda.',
    driverMeaning: 'Yo‘naltiruvchi orolchaning ustiga chiqish va bosib o‘tish taqiqlanadi.',
    usedInExercises: ['acceleration-lane'],
    metadata: OFFICIAL_YHQ_META,
  },
  {
    code: '1.18',
    name: 'Bo‘laklar bo‘yicha harakat yo‘nalishi strelkalari',
    group: 'yhq_general',
    color: 'white',
    patternType: 'arrows',
    description:
      'Chorraha oldida har bir bo‘lakdan ruxsat etilgan harakat yo‘nalishini (to‘g‘riga, chapga, o‘ngga, qayrilib olish) ko‘rsatuvchi oq strelkalar.',
    autodromeUsage: 'Tartibga solingan chorraha va barcha mashq yo‘nalishlarida.',
    driverMeaning: 'Burilishdan oldin strelka ko‘rsatgan tegishli bo‘lakni egallash shart.',
    usedInExercises: ['regulated-intersection', 'turn-90', 'start'],
    metadata: OFFICIAL_YHQ_META,
  },
  {
    code: '1.20',
    name: '1.13 (“Yo‘l bering”) chizig‘iga yaqinlashish ogohlantirishi',
    group: 'yhq_general',
    color: 'white',
    patternType: 'yield-warning-triangle',
    description:
      'O‘zbekiston YHQ amaldagi tahririga ko‘ra 1.20 yotiq chizig‘i — haydovchini oldinda 1.13 (“Yo‘l bering” uchburchaklar qatori) chizig‘iga yaqinlashayotgani haqida ogohlantiruvchi yirik oq uchburchakdir. (Eslatma: 1.1/1.11 uzluksiz chizig‘iga yaqinlashish esa 1.6 chizig‘i bilan ogohlantiriladi.)',
    autodromeUsage: 'Chorraha va asosiy yo‘lga chiqish yondashuvlarini o‘rgatishda qiyosiy tushuntiriladi.',
    driverMeaning: 'Oldinda “Yo‘l bering” chegarasi bor — tezlikni pasaytirib ustunlikka ega transportni o‘tkazib yuborishga tayyorlaning.',
    usedInExercises: ['regulated-intersection'],
    metadata: OFFICIAL_YHQ_META,
  },
];
