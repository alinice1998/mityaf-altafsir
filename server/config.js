export const TAFSIRS = [
  {
    id: 'ar-tafseer-al-saddi',
    quranComId: 91,
    name: 'تفسير السعدي',
    shortName: 'السعدي',
    fullName: 'تيسير الكريم الرحمن في تفسير كلام المنان',
    author: 'الشيخ عبد الرحمن السعدي',
    color: '#0F5C4D',
    fill: 'rgba(15, 92, 77, 0.17)',
  },
  {
    id: 'ar-tafseer-tahrir-al-tanwir',
    quranComId: null,
    name: 'التحرير والتنوير',
    shortName: 'التحرير والتنوير',
    fullName: 'التحرير والتنوير من التفسير',
    author: 'الإمام محمد الطاهر بن عاشور',
    color: '#B8732A',
    fill: 'rgba(184, 115, 42, 0.15)',
  },
  {
    id: 'ar-tafsir-ibn-kathir',
    quranComId: 14,
    name: 'تفسير ابن كثير',
    shortName: 'ابن كثير',
    fullName: 'تفسير القرآن العظيم',
    author: 'الحافظ ابن كثير',
    color: '#34518A',
    fill: 'rgba(52, 81, 138, 0.15)',
  },
  {
    id: 'ar-tafseer-al-qurtubi',
    quranComId: 90,
    name: 'تفسير القرطبي',
    shortName: 'القرطبي',
    fullName: 'الجامع لأحكام القرآن',
    author: 'الإمام القرطبي',
    color: '#7D3B5E',
    fill: 'rgba(125, 59, 94, 0.15)',
  },
  {
    id: 'ar-tafsir-muyassar',
    quranComId: 16,
    name: 'التفسير الميسّر',
    shortName: 'الميسّر',
    fullName: 'التفسير الميسّر (مجمع الملك فهد)',
    author: 'نخبة من علماء التفسير',
    color: '#4B6B3C',
    fill: 'rgba(75, 107, 60, 0.16)',
  },
];

export const DEFAULT_COMPARE_IDS = [
  'ar-tafseer-al-saddi',
  'ar-tafseer-tahrir-al-tanwir',
  'ar-tafsir-ibn-kathir',
];

export const RADAR_AXES = [
  { key: 'linguistic', label: 'اللغة والبلاغة' },
  { key: 'educational', label: 'الهدايات والتربية' },
  { key: 'narrations', label: 'الأثر والرواية' },
  { key: 'fiqh', label: 'الفقه والأحكام' },
  { key: 'creed', label: 'العقيدة والتوحيد' },
  { key: 'readability', label: 'سهولة الأسلوب' },
];

export const SIGNAL_META = [
  { key: 'has_asbab_nuzul', label: 'يذكر سبب نزول' },
  { key: 'has_hadith', label: 'يستشهد بحديث' },
  { key: 'has_ikhtilaf', label: 'يذكر خلاف مفسرين' },
  { key: 'has_vocab', label: 'يشرح مفردات' },
  { key: 'has_practical', label: 'هداية عملية' },
];

export const AUDIENCE_LABELS = {
  general: 'قارئ عام',
  student: 'طالب علم',
  specialist: 'باحث ومتخصص',
  other: 'خارج نطاق التفسير',
};

export const STYLE_LABELS = {
  educational: 'تربوي وتدبري',
  linguistic: 'لغوي وبلاغي',
  athari: 'أثري وبالمأثور',
  fiqhi: 'فقهي وأحكام',
  concise: 'موجز وميسّر',
  other: 'غير ذلك',
};

export const PRESET_AYAHS = [
  { surah: 2, ayah: 255, label: 'آية الكرسي', ref: 'البقرة 255' },
  { surah: 2, ayah: 177, label: 'آية البر', ref: 'البقرة 177' },
  { surah: 31, ayah: 13, label: 'وصية لقمان', ref: 'لقمان 13' },
];

export const RECOMMEND_FOCUSES = [
  { id: 'easy', label: 'أسلوب سهل ومباشر' },
  { id: 'educational', label: 'هدايات وتربية' },
  { id: 'linguistic', label: 'لغة وبلاغة' },
  { id: 'fiqh_athar', label: 'فقه وأثر ورواية' },
];
