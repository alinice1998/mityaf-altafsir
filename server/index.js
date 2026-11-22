import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_COMPARE_IDS,
  PRESET_AYAHS,
  RADAR_AXES,
  RECOMMEND_FOCUSES,
  SIGNAL_META,
  TAFSIRS,
} from './config.js';
import { fetchTafsirText, fetchVerseText, getChapters, validateAyah } from './tafsirService.js';
import { evaluateWithDecisions, scoreRecommendation } from './geminiDecisions.js';
import { getSamplePreset } from './samplePresets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const CACHE_DIR = path.join(ROOT_DIR, 'data', 'cache');

fs.mkdirSync(CACHE_DIR, { recursive: true });

const app = express();
const PORT = Number(process.env.PORT || 3000);
const RATE_LIMIT_PER_HOUR = Number(process.env.RATE_LIMIT_PER_HOUR || 40);

app.set('trust proxy', 1);
app.use(express.json({ limit: '20mb' }));

// Simple sliding-window in-memory rate limiter for live server-key calls only
const ipHits = new Map();

function checkRateLimit(req, usingUserKey) {
  if (usingUserKey) return { allowed: true };
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const history = (ipHits.get(ip) || []).filter((ts) => now - ts < windowMs);
  if (history.length >= RATE_LIMIT_PER_HOUR) {
    ipHits.set(ip, history);
    return { allowed: false };
  }
  history.push(now);
  ipHits.set(ip, history);
  return { allowed: true };
}

function readAnalysisCache(cacheKey) {
  const file = path.join(CACHE_DIR, `analysis_${cacheKey}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function writeAnalysisCache(cacheKey, data) {
  const file = path.join(CACHE_DIR, `analysis_${cacheKey}.json`);
  try {
    fs.writeFileSync(file, JSON.stringify(data), 'utf8');
  } catch {
    // Non-fatal
  }
}

function getKeyOptions(req) {
  const serverKey = (process.env.GEMINI_API_KEY || '').trim();
  const userKey = String(req.headers['x-user-gemini-key'] || '').trim();
  const preferUserKey = String(req.headers['x-prefer-user-key'] || '') === '1';
  return { serverKey, userKey, preferUserKey };
}

async function analyzeSingleTafsir({ surah, ayah, verseText, tafsir, keyOpts, req }) {
  const text = await fetchTafsirText(tafsir.id, surah, ayah);
  const cacheKey = `${tafsir.id}_${surah}_${ayah}_v1`;
  const cached = readAnalysisCache(cacheKey);
  if (cached) {
    return {
      tafsir,
      text,
      analysis: { ...cached, fromCache: true },
    };
  }

  const hasAnyKey = Boolean(keyOpts.serverKey || keyOpts.userKey);
  if (!hasAnyKey) {
    const sample = getSamplePreset(surah, ayah, tafsir.id);
    if (sample) {
      return { tafsir, text, analysis: { ...sample, fromCache: false } };
    }
    const err = new Error(
      'يلزم إدخال مفتاح Google AI Studio المجاني الخاص بك لتحليل هذه الآية مباشرةً.'
    );
    err.code = 'KEY_REQUIRED';
    err.httpStatus = 401;
    throw err;
  }

  const limit = checkRateLimit(req, Boolean(keyOpts.preferUserKey && keyOpts.userKey));
  if (!limit.allowed) {
    if (keyOpts.userKey) {
      const promptInput = `نص الآية (${surah}:${ayah}):\n${verseText}\n\nنص التفسير (${tafsir.name}):\n${text}`;
      const analysis = await evaluateWithDecisions({
        inputPayload: promptInput,
        serverKey: '',
        userKey: keyOpts.userKey,
        preferUserKey: true,
      });
      writeAnalysisCache(cacheKey, analysis);
      return { tafsir, text, analysis: { ...analysis, keySource: 'user_fallback', fromCache: false } };
    }
    const err = new Error(
      'بلغت الحد الساعي للاستخدام المجاني على الخادم — يمكنك إدخال مفتاح Google AI Studio الخاص بك للمتابعة فورًا.'
    );
    err.code = 'SERVER_QUOTA_EXCEEDED';
    err.httpStatus = 429;
    throw err;
  }

  const promptInput = `نص الآية (${surah}:${ayah}):\n${verseText}\n\nنص التفسير (${tafsir.name}):\n${text}`;
  const analysis = await evaluateWithDecisions({
    inputPayload: promptInput,
    serverKey: keyOpts.serverKey,
    userKey: keyOpts.userKey,
    preferUserKey: keyOpts.preferUserKey,
  });

  writeAnalysisCache(cacheKey, analysis);
  return { tafsir, text, analysis: { ...analysis, fromCache: false } };
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'mityaf-altafsir',
    hasServerKey: Boolean((process.env.GEMINI_API_KEY || '').trim()),
  });
});

app.get('/api/meta', (_req, res) => {
  res.json({
    chapters: getChapters(),
    tafsirs: TAFSIRS,
    defaultCompareIds: DEFAULT_COMPARE_IDS,
    axes: RADAR_AXES,
    signals: SIGNAL_META,
    presets: PRESET_AYAHS,
    focuses: RECOMMEND_FOCUSES,
    hasServerKey: Boolean((process.env.GEMINI_API_KEY || '').trim()),
  });
});

app.post('/api/analyze-ayah', async (req, res) => {
  try {
    const { surah, ayah, tafsirIds } = req.body || {};
    const check = validateAyah(surah, ayah);
    if (!check.valid) return res.status(400).json({ error: check.error });

    const requestedIds = Array.isArray(tafsirIds) && tafsirIds.length
      ? tafsirIds.slice(0, 3)
      : DEFAULT_COMPARE_IDS;

    const selectedTafsirs = requestedIds
      .map((id) => TAFSIRS.find((t) => t.id === id))
      .filter(Boolean);

    if (!selectedTafsirs.length) {
      return res.status(400).json({ error: 'اختر تفسيرًا واحدًا على الأقل للمقارنة.' });
    }

    const verse = await fetchVerseText(check.surah, check.ayah);
    const keyOpts = getKeyOptions(req);

    const results = await Promise.all(
      selectedTafsirs.map((tafsir) =>
        analyzeSingleTafsir({
          surah: check.surah,
          ayah: check.ayah,
          verseText: verse.text,
          tafsir,
          keyOpts,
          req,
        })
      )
    );

    const usedSample = results.some((r) => r.analysis.isSample);
    const usedFallback = results.some((r) => r.analysis.keySource === 'user_fallback');

    res.json({
      verse: {
        surah: check.surah,
        ayah: check.ayah,
        surahName: check.chapter.name,
        revelationPlace: check.chapter.revelationPlace,
        text: verse.text,
      },
      items: results,
      usedSample,
      usedFallback,
    });
  } catch (err) {
    res.status(err.httpStatus || 500).json({
      error: err.message || 'حدث خطأ غير متوقع أثناء التحليل.',
      code: err.code || 'ANALYZE_ERROR',
    });
  }
});

app.post('/api/recommend', async (req, res) => {
  try {
    const { surah, ayah, focus = 'easy', wantVocab = false, avoidDebate = false } = req.body || {};
    const check = validateAyah(surah, ayah);
    if (!check.valid) return res.status(400).json({ error: check.error });

    const verse = await fetchVerseText(check.surah, check.ayah);
    const keyOpts = getKeyOptions(req);

    const settled = await Promise.allSettled(
      TAFSIRS.map((tafsir) =>
        analyzeSingleTafsir({
          surah: check.surah,
          ayah: check.ayah,
          verseText: verse.text,
          tafsir,
          keyOpts,
          req,
        })
      )
    );

    const items = [];
    let firstFatalErr = null;

    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        items.push(outcome.value);
      } else if (!firstFatalErr) {
        firstFatalErr = outcome.reason;
      }
    }

    if (!items.length && firstFatalErr) {
      throw firstFatalErr;
    }

    const ranked = items
      .map((item) => ({
        ...item,
        matchPercent: scoreRecommendation(item.analysis, { focus, wantVocab, avoidDebate }),
      }))
      .sort((a, b) => b.matchPercent - a.matchPercent);

    res.json({
      verse: {
        surah: check.surah,
        ayah: check.ayah,
        surahName: check.chapter.name,
        revelationPlace: check.chapter.revelationPlace,
        text: verse.text,
      },
      preferences: { focus, wantVocab, avoidDebate },
      ranked,
      usedSample: ranked.some((r) => r.analysis.isSample),
      usedFallback: ranked.some((r) => r.analysis.keySource === 'user_fallback'),
    });
  } catch (err) {
    res.status(err.httpStatus || 500).json({
      error: err.message || 'حدث خطأ أثناء ترشيح التفسير الأنسب.',
      code: err.code || 'RECOMMEND_ERROR',
    });
  }
});

app.post('/api/analyze-custom', async (req, res) => {
  try {
    const { text, pdfBase64, filename } = req.body || {};
    const hasPdf = typeof pdfBase64 === 'string' && pdfBase64.length > 20;
    const cleanText = typeof text === 'string' ? text.trim() : '';

    if (!hasPdf && cleanText.length < 25) {
      return res.status(400).json({
        error: 'أدخل نصًا لا يقل عن 25 حرفًا، أو ارفع ملف PDF ليتم تحليله.',
      });
    }

    if (hasPdf && pdfBase64.length > 18 * 1024 * 1024) {
      return res.status(400).json({
        error: 'حجم ملف PDF كبير جدًا؛ الحد الأقصى المدعوم هنا هو 12 ميجابايت.',
      });
    }

    const keyOpts = getKeyOptions(req);
    const hasAnyKey = Boolean(keyOpts.serverKey || keyOpts.userKey);
    if (!hasAnyKey) {
      return res.status(401).json({
        error: 'يلزم إدخال مفتاح Google AI Studio المجاني الخاص بك لتحليل النصوص المخصصة وملفات PDF.',
        code: 'KEY_REQUIRED',
      });
    }

    const contentHash = crypto
      .createHash('sha256')
      .update(hasPdf ? pdfBase64.slice(0, 200000) + pdfBase64.length : cleanText)
      .digest('hex')
      .slice(0, 16);

    const cacheKey = `custom_${contentHash}_v1`;
    const cached = readAnalysisCache(cacheKey);
    if (cached) {
      return res.json({
        title: hasPdf ? filename || 'ملف PDF' : 'نص مخصّص',
        inputType: hasPdf ? 'pdf' : 'text',
        analysis: { ...cached, fromCache: true },
        usedFallback: false,
      });
    }

    const limit = checkRateLimit(req, Boolean(keyOpts.preferUserKey && keyOpts.userKey));
    if (!limit.allowed && !keyOpts.userKey) {
      return res.status(429).json({
        error: 'بلغت الحد الساعي على الخادم — أدخل مفتاح Google AI Studio الخاص بك للمتابعة فورًا.',
        code: 'SERVER_QUOTA_EXCEEDED',
      });
    }

    const inputPayload = hasPdf
      ? [
          {
            type: 'text',
            text: 'افحص مستند PDF المرفق التالي وأجب عن الأسئلة المحددة حول أبعاده التفسيرية والتدبرية.',
          },
          {
            type: 'document',
            mime_type: 'application/pdf',
            data: pdfBase64,
          },
        ]
      : cleanText;

    const analysis = await evaluateWithDecisions({
      inputPayload,
      serverKey: limit.allowed ? keyOpts.serverKey : '',
      userKey: keyOpts.userKey,
      preferUserKey: keyOpts.preferUserKey || !limit.allowed,
    });

    writeAnalysisCache(cacheKey, analysis);

    res.json({
      title: hasPdf ? filename || 'ملف PDF' : 'نص مخصّص',
      inputType: hasPdf ? 'pdf' : 'text',
      analysis: { ...analysis, fromCache: false },
      usedFallback: analysis.keySource === 'user_fallback',
    });
  } catch (err) {
    res.status(err.httpStatus || 500).json({
      error: err.message || 'تعذّر تحليل المحتوى حاليًا.',
      code: err.code || 'CUSTOM_ANALYZE_ERROR',
    });
  }
});

// Serve production frontend bundle when built
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Mityaf Al-Tafsir running on http://127.0.0.1:${PORT}`);
});
