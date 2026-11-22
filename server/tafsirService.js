import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TAFSIRS } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.resolve(__dirname, '..', 'data', 'cache');
const CHAPTERS_PATH = path.resolve(__dirname, 'data', 'chapters.json');

fs.mkdirSync(CACHE_DIR, { recursive: true });

let chaptersCache = null;

export function getChapters() {
  if (!chaptersCache) {
    chaptersCache = JSON.parse(fs.readFileSync(CHAPTERS_PATH, 'utf8'));
  }
  return chaptersCache;
}

export function validateAyah(surah, ayah) {
  const s = Number(surah);
  const a = Number(ayah);
  const chapters = getChapters();
  const chapter = chapters.find((c) => c.id === s);
  if (!chapter) return { valid: false, error: 'رقم السورة غير صحيح.' };
  if (!Number.isInteger(a) || a < 1 || a > chapter.versesCount) {
    return { valid: false, error: `رقم الآية يجب أن يكون بين 1 و ${chapter.versesCount} في سورة ${chapter.name}.` };
  }
  return { valid: true, surah: s, ayah: a, chapter };
}

function readJsonCache(key) {
  const file = path.join(CACHE_DIR, `${key}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeJsonCache(key, value) {
  const file = path.join(CACHE_DIR, `${key}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(value), 'utf8');
  } catch {
    // Non-fatal cache write error
  }
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

export async function fetchVerseText(surah, ayah) {
  const cacheKey = `verse_${surah}_${ayah}`;
  const cached = readJsonCache(cacheKey);
  if (cached?.text) return cached;

  const url = `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?fields=text_uthmani`;
  const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!resp.ok) {
    throw new Error(`تعذّر جلب نص الآية (${resp.status})`);
  }
  const data = await resp.json();
  const text = data?.verse?.text_uthmani || '';
  if (!text) throw new Error('لم يُعثر على نص الآية.');

  const result = { surah, ayah, text };
  writeJsonCache(cacheKey, result);
  return result;
}

export async function fetchTafsirText(tafsirId, surah, ayah) {
  const tafsir = TAFSIRS.find((t) => t.id === tafsirId);
  if (!tafsir) throw new Error(`التفسير غير معروف: ${tafsirId}`);

  const cacheKey = `tafsir_${tafsirId}_${surah}_${ayah}`;
  const cached = readJsonCache(cacheKey);
  if (cached?.text) return cached.text;

  let text = '';

  // Source 1: jsDelivr CDN (spa5k/tafsir_api)
  try {
    const cdnUrl = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${tafsirId}/${surah}/${ayah}.json`;
    const r = await fetch(cdnUrl, { signal: AbortSignal.timeout(9000) });
    if (r.ok) {
      const d = await r.json();
      if (d?.text) text = stripHtml(d.text);
    }
  } catch {
    // fallback below
  }

  // Source 2: GitHub raw (for large files that exceed jsDelivr limit)
  if (!text) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/spa5k/tafsir_api/main/tafsir/${tafsirId}/${surah}/${ayah}.json`;
      const r = await fetch(rawUrl, { signal: AbortSignal.timeout(10000) });
      if (r.ok) {
        const d = await r.json();
        if (d?.text) text = stripHtml(d.text);
      }
    } catch {
      // fallback below
    }
  }

  // Source 3: QuranCDN / Quran.com API v4
  if (!text && tafsir.quranComId) {
    try {
      const qUrl = `https://api.qurancdn.com/api/v4/tafsirs/${tafsir.quranComId}/by_ayah/${surah}:${ayah}`;
      const r = await fetch(qUrl, { signal: AbortSignal.timeout(10000) });
      if (r.ok) {
        const d = await r.json();
        if (d?.tafsir?.text) text = stripHtml(d.tafsir.text);
      }
    } catch {
      // handled below
    }
  }

  if (!text) {
    throw new Error(`تعذّر جلب نص ${tafsir.name} لهذه الآية حاليًا.`);
  }

  writeJsonCache(cacheKey, { text });
  return text;
}
