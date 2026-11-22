import { AUDIENCE_LABELS, STYLE_LABELS } from './config.js';

function makeSample(scores, signalMap, audienceKey, styleKey, avgConfidence = 0.89) {
  const signals = {};
  for (const [k, prob] of Object.entries(signalMap)) {
    signals[k] = {
      present: prob >= 0.55,
      probability: prob,
      confidence: avgConfidence,
    };
  }
  return {
    isTafsirContent: true,
    isTafsirProbability: 0.99,
    scores,
    signals,
    audience: {
      key: audienceKey,
      label: AUDIENCE_LABELS[audienceKey],
      confidence: avgConfidence,
    },
    dominantStyle: {
      key: styleKey,
      label: STYLE_LABELS[styleKey],
    },
    avgConfidence,
    lowConfidence: avgConfidence < 0.72,
    latencyMs: 0,
    isSample: true,
    keySource: 'preset_sample',
  };
}

// عينات استرشادية تُعرض فقط في حال عدم إعداد مفتاح Gemini بعد
export const SAMPLE_PRESETS = {
  '2:255': {
    'ar-tafseer-al-saddi': makeSample(
      { linguistic: 1.4, educational: 3.6, narrations: 1.8, fiqh: 0.6, creed: 3.9, readability: 3.7 },
      { has_asbab_nuzul: 0.14, has_hadith: 0.68, has_ikhtilaf: 0.18, has_vocab: 0.76, has_practical: 0.88 },
      'general',
      'educational',
      0.92
    ),
    'ar-tafseer-tahrir-al-tanwir': makeSample(
      { linguistic: 3.9, educational: 1.7, narrations: 2.1, fiqh: 1.2, creed: 3.4, readability: 1.4 },
      { has_asbab_nuzul: 0.22, has_hadith: 0.64, has_ikhtilaf: 0.89, has_vocab: 0.95, has_practical: 0.31 },
      'specialist',
      'linguistic',
      0.91
    ),
    'ar-tafsir-ibn-kathir': makeSample(
      { linguistic: 1.7, educational: 2.4, narrations: 3.9, fiqh: 1.1, creed: 3.7, readability: 2.6 },
      { has_asbab_nuzul: 0.42, has_hadith: 0.97, has_ikhtilaf: 0.74, has_vocab: 0.63, has_practical: 0.62 },
      'student',
      'athari',
      0.93
    ),
    'ar-tafseer-al-qurtubi': makeSample(
      { linguistic: 3.2, educational: 2.0, narrations: 3.3, fiqh: 3.1, creed: 3.4, readability: 1.9 },
      { has_asbab_nuzul: 0.38, has_hadith: 0.92, has_ikhtilaf: 0.91, has_vocab: 0.86, has_practical: 0.54 },
      'student',
      'fiqhi',
      0.9
    ),
    'ar-tafsir-muyassar': makeSample(
      { linguistic: 0.9, educational: 2.1, narrations: 0.2, fiqh: 0.2, creed: 3.2, readability: 3.9 },
      { has_asbab_nuzul: 0.04, has_hadith: 0.05, has_ikhtilaf: 0.03, has_vocab: 0.68, has_practical: 0.38 },
      'general',
      'concise',
      0.86
    ),
  },
  '2:177': {
    'ar-tafseer-al-saddi': makeSample(
      { linguistic: 1.5, educational: 3.8, narrations: 1.2, fiqh: 2.4, creed: 3.2, readability: 3.7 },
      { has_asbab_nuzul: 0.28, has_hadith: 0.24, has_ikhtilaf: 0.32, has_vocab: 0.78, has_practical: 0.94 },
      'general',
      'educational',
      0.91
    ),
    'ar-tafseer-tahrir-al-tanwir': makeSample(
      { linguistic: 3.8, educational: 2.2, narrations: 2.0, fiqh: 2.7, creed: 2.8, readability: 1.5 },
      { has_asbab_nuzul: 0.66, has_hadith: 0.58, has_ikhtilaf: 0.88, has_vocab: 0.94, has_practical: 0.48 },
      'specialist',
      'linguistic',
      0.9
    ),
    'ar-tafsir-ibn-kathir': makeSample(
      { linguistic: 1.8, educational: 2.5, narrations: 3.8, fiqh: 2.6, creed: 2.9, readability: 2.5 },
      { has_asbab_nuzul: 0.82, has_hadith: 0.94, has_ikhtilaf: 0.81, has_vocab: 0.72, has_practical: 0.65 },
      'student',
      'athari',
      0.92
    ),
    'ar-tafseer-al-qurtubi': makeSample(
      { linguistic: 2.9, educational: 1.9, narrations: 3.1, fiqh: 3.9, creed: 2.4, readability: 1.8 },
      { has_asbab_nuzul: 0.78, has_hadith: 0.89, has_ikhtilaf: 0.94, has_vocab: 0.84, has_practical: 0.59 },
      'specialist',
      'fiqhi',
      0.92
    ),
    'ar-tafsir-muyassar': makeSample(
      { linguistic: 0.8, educational: 2.4, narrations: 0.2, fiqh: 1.6, creed: 2.5, readability: 3.9 },
      { has_asbab_nuzul: 0.08, has_hadith: 0.04, has_ikhtilaf: 0.04, has_vocab: 0.62, has_practical: 0.71 },
      'general',
      'concise',
      0.88
    ),
  },
  '31:13': {
    'ar-tafseer-al-saddi': makeSample(
      { linguistic: 1.2, educational: 3.7, narrations: 0.9, fiqh: 0.5, creed: 3.8, readability: 3.8 },
      { has_asbab_nuzul: 0.1, has_hadith: 0.18, has_ikhtilaf: 0.12, has_vocab: 0.66, has_practical: 0.91 },
      'general',
      'educational',
      0.9
    ),
    'ar-tafseer-tahrir-al-tanwir': makeSample(
      { linguistic: 3.9, educational: 2.4, narrations: 1.7, fiqh: 0.7, creed: 3.1, readability: 1.5 },
      { has_asbab_nuzul: 0.16, has_hadith: 0.45, has_ikhtilaf: 0.76, has_vocab: 0.95, has_practical: 0.52 },
      'specialist',
      'linguistic',
      0.9
    ),
    'ar-tafsir-ibn-kathir': makeSample(
      { linguistic: 1.5, educational: 2.7, narrations: 3.7, fiqh: 0.6, creed: 3.6, readability: 2.7 },
      { has_asbab_nuzul: 0.34, has_hadith: 0.93, has_ikhtilaf: 0.62, has_vocab: 0.58, has_practical: 0.74 },
      'student',
      'athari',
      0.91
    ),
    'ar-tafseer-al-qurtubi': makeSample(
      { linguistic: 2.8, educational: 2.5, narrations: 2.9, fiqh: 1.8, creed: 3.2, readability: 2.1 },
      { has_asbab_nuzul: 0.25, has_hadith: 0.84, has_ikhtilaf: 0.79, has_vocab: 0.78, has_practical: 0.66 },
      'student',
      'athari',
      0.88
    ),
    'ar-tafsir-muyassar': makeSample(
      { linguistic: 0.7, educational: 2.5, narrations: 0.1, fiqh: 0.2, creed: 3.1, readability: 3.9 },
      { has_asbab_nuzul: 0.03, has_hadith: 0.03, has_ikhtilaf: 0.02, has_vocab: 0.52, has_practical: 0.62 },
      'general',
      'concise',
      0.69
    ),
  },
};

export function getSamplePreset(surah, ayah, tafsirId) {
  return SAMPLE_PRESETS[`${surah}:${ayah}`]?.[tafsirId] || null;
}
