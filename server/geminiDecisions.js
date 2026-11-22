import { AUDIENCE_LABELS, RADAR_AXES, SIGNAL_META, STYLE_LABELS } from './config.js';

const DECISIONS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/decisions';
const MODEL_NAME = 'gemini-decision-1';

export function buildTafsirQuestions() {
  return {
    is_tafsir_content: {
      type: 'noul',
      instructions:
        'هل هذا النص أو المستند يتعلق بتفسير القرآن الكريم أو تدبر آياته أو علومه الشرعية أو شرح معانيه؟',
    },
    linguistic: {
      type: 'score',
      instructions:
        'قيّم مدى تركيز النص على البعد اللغوي والبلاغي (الإعراب، الاشتقاق، جذور الكلمات، الدقائق البلاغية والنحوية).',
      criteria: [
        'لا يتطرق للجانب اللغوي أو البلاغي تقريبًا.',
        'إشارات لغوية عابرة ومحدودة جدًا.',
        'حضور متوسط لشرح الألفاظ وبعض التراكيب.',
        'تركيز واضح وبارز على اللغة والبلاغة والنحو.',
        'عمق لغوي وبلاغي مكثّف يغلب على المقطع.',
      ],
    },
    educational: {
      type: 'score',
      instructions:
        'قيّم مدى تركيز النص على الهدايات التربوية والإيمانية وتزكية النفس والعبر والتوجيهات السلوكية.',
      criteria: [
        'غائب تقريبًا؛ النص وصفي أو فني صرف.',
        'لمحة تربوية أو وعظية عابرة فقط.',
        'توازن متوسط بين الشرح والهدايات التربوية.',
        'تركيز قوي وواضح على المعاني التربوية والإيمانية.',
        'طابع تربوي وتدبري عميق يغلب على المقطع كله.',
      ],
    },
    narrations: {
      type: 'score',
      instructions:
        'قيّم مدى اعتماد النص على الأثر والرواية (الأحاديث النبوية، أقوال الصحابة والتابعين، الآثار المسندة، أسباب النزول).',
      criteria: [
        'لا يعتمد على روايات أو آثار مأثورة.',
        'إشارة نادرة أو مقتضبة جدًا لأثر أو رواية.',
        'يستشهد ببعض الأحاديث أو أقوال السلف بقدر متوسط.',
        'اعتماد واضح وكثيف على الأحاديث وأقوال السلف.',
        'منهج أثري غني جدًا بالروايات والأسانيد وأقوال المفسرين الأوائل.',
      ],
    },
    fiqh: {
      type: 'score',
      instructions:
        'قيّم مدى تركيز النص على الأحكام الفقهية والاستنباطات التشريعية ومسائل الحلال والحرام وأقوال الفقهاء.',
      criteria: [
        'لا يتعرض لمسائل أو أحكام فقهية.',
        'إشارة فقهية عابرة جدًا.',
        'يتضمن بعض الأحكام أو الفوائد الفقهية بقدر متوسط.',
        'تركيز واضح على استنباط الأحكام ومناقشة المسائل الفقهية.',
        'طابع فقهي تفصيلي عميق يعرض أقوال المذاهب وأدلتها.',
      ],
    },
    creed: {
      type: 'score',
      instructions:
        'قيّم مدى تركيز النص على البعد العقدي (التوحيد، الأسماء والصفات، الإيمان بالغيب، النبوة، الرد على الشبهات العقدية).',
      criteria: [
        'لا يناقش مسائل عقدية بشكل مباشر.',
        'إشارة عقدية عابرة فقط.',
        'حضور متوسط للمعاني العقدية والإيمانية.',
        'تركيز واضح ومفصّل على قضايا العقيدة والتوحيد.',
        'عمق عقدي وتأصيل توحيدي بارز يغلب على النص.',
      ],
    },
    readability: {
      type: 'score',
      instructions:
        'قيّم سهولة الأسلوب ووضوح العبارة للقارئ العربي المعاصر غير المتخصص في العلوم الشرعية.',
      criteria: [
        'عبارة تراثية أو تخصصية صعبة جدًا على القارئ العام.',
        'أسلوب علمي ثقيل يحتاج خلفية لغوية وشرعية جيدة.',
        'أسلوب متوسط الوضوح، مفهوم مع بعض المصطلحات.',
        'أسلوب واضح وسلس وميسّر لعموم القراء.',
        'أسلوب بالغ السهولة والوضوح والإيجاز المباشر لكل قارئ.',
      ],
    },
    has_asbab_nuzul: {
      type: 'noul',
      instructions: 'هل يذكر النص سبب نزول للآية أو سياقًا تاريخيًا محددًا لنزولها؟',
    },
    has_hadith: {
      type: 'noul',
      instructions: 'هل يستشهد النص بحديث نبوي شريف أو أثر صريح عن النبي صلى الله عليه وسلم؟',
    },
    has_ikhtilaf: {
      type: 'noul',
      instructions: 'هل يعرض النص خلافًا أو تعدد أقوال بين المفسرين أو العلماء في المعنى أو الحكم؟',
    },
    has_vocab: {
      type: 'noul',
      instructions: 'هل يشرح النص معاني مفردات لغوية أو يفسّر كلمات محددة من الآية؟',
    },
    has_practical: {
      type: 'noul',
      instructions: 'هل يتضمن النص تطبيقًا عمليًا أو ثمرة سلوكية واضحة يعمل بها القارئ في حياته؟',
    },
    audience: {
      type: 'choice',
      instructions: 'من هو الجمهور الأنسب لقراءة هذا النص بناءً على أسلوبه وعمقه العلمي؟',
      criteria: {
        general: 'القارئ العام أو المبتدئ الباحث عن فهم واضح وميسّر دون تعقيد.',
        student: 'طالب العلم المتوسط المعتاد على مصطلحات التفسير والأثر والفقه.',
        specialist: 'الباحث والمتخصص المتعمق في دقائق اللغة والبلاغة والخلاف العلمي.',
        other: 'النص ليس تفسيرًا قرآنيًا ولا محتوى تدبريًا شرعيًا أصلًا.',
      },
    },
    dominant_style: {
      type: 'choice',
      instructions: 'ما الطابع المنهجي الأبرز والغالب على هذا النص؟',
      criteria: {
        educational: 'تربوي وتدبري يركز على الهدايات الإيمانية والعمل بالآية.',
        linguistic: 'لغوي وبلاغي يركز على الألفاظ والنحو ووجوه البيان.',
        athari: 'أثري وبالمأثور يعتمد على الأحاديث وأقوال الصحابة والتابعين.',
        fiqhi: 'فقهي يركز على استنباط الأحكام الشرعية والمسائل العملية.',
        concise: 'موجز وميسّر يشرح المعنى الإجمالي بإيجاز مباشر.',
        other: 'غير ذلك أو خارج نطاق التفسير والتدبر القرآني.',
      },
    },
  };
}

function computeExpectedScore(answer) {
  if (!answer) return 0;
  const probs = answer.probabilities;
  if (probs && typeof probs === 'object') {
    let weighted = 0;
    let totalP = 0;
    for (const [levelKey, prob] of Object.entries(probs)) {
      const idx = Number(levelKey);
      const p = Number(prob);
      if (!Number.isNaN(idx) && !Number.isNaN(p)) {
        weighted += idx * p;
        totalP += p;
      }
    }
    if (totalP > 0) {
      return Number((weighted / totalP).toFixed(1));
    }
  }
  const raw = Number(answer.score ?? 0);
  return Number.isNaN(raw) ? 0 : Number(raw.toFixed(1));
}

function pickChoiceWinner(answer) {
  if (!answer) return 'other';
  if (typeof answer.winner === 'string') return answer.winner;
  if (typeof answer.choice === 'string') return answer.choice;
  if (answer.probabilities && typeof answer.probabilities === 'object') {
    let bestKey = 'other';
    let bestVal = -1;
    for (const [k, v] of Object.entries(answer.probabilities)) {
      if (Number(v) > bestVal) {
        bestVal = Number(v);
        bestKey = k;
      }
    }
    return bestKey;
  }
  return 'other';
}

function parseDecisionResponse(raw, latencyMs) {
  const answers = raw?.answers || {};

  const isTafsirProb = Number(answers.is_tafsir_content?.noul ?? 1);
  const audienceKey = pickChoiceWinner(answers.audience);
  const styleKey = pickChoiceWinner(answers.dominant_style);

  const scores = {};
  const confidences = [];

  for (const axis of RADAR_AXES) {
    const ans = answers[axis.key];
    scores[axis.key] = computeExpectedScore(ans);
    if (typeof ans?.confidence === 'number') confidences.push(ans.confidence);
  }

  const signals = {};
  for (const sig of SIGNAL_META) {
    const ans = answers[sig.key];
    const prob = Number(ans?.noul ?? 0);
    signals[sig.key] = {
      present: prob >= 0.55,
      probability: Number(prob.toFixed(2)),
      confidence: Number((ans?.confidence ?? 0.8).toFixed(2)),
    };
    if (typeof ans?.confidence === 'number') confidences.push(ans.confidence);
  }

  if (typeof answers.audience?.confidence === 'number') {
    confidences.push(answers.audience.confidence);
  }

  const avgConfidence = confidences.length
    ? Number((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2))
    : 0.85;

  const isTafsirContent = isTafsirProb >= 0.45 && audienceKey !== 'other' && styleKey !== 'other';

  return {
    isTafsirContent,
    isTafsirProbability: Number(isTafsirProb.toFixed(2)),
    scores,
    signals,
    audience: {
      key: audienceKey,
      label: AUDIENCE_LABELS[audienceKey] || AUDIENCE_LABELS.general,
      confidence: Number((answers.audience?.confidence ?? avgConfidence).toFixed(2)),
    },
    dominantStyle: {
      key: styleKey,
      label: STYLE_LABELS[styleKey] || STYLE_LABELS.educational,
    },
    avgConfidence,
    lowConfidence: avgConfidence < 0.72,
    latencyMs,
    isSample: false,
  };
}

async function callSingleKey(apiKey, inputPayload, questions) {
  const started = Date.now();
  const response = await fetch(DECISIONS_ENDPOINT, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      input: inputPayload,
      questions,
    }),
    signal: AbortSignal.timeout(25000),
  });

  const latencyMs = Date.now() - started;

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    const err = new Error(`Gemini Decisions API error (${response.status})`);
    err.status = response.status;
    err.details = errText.slice(0, 300);
    throw err;
  }

  const json = await response.json();
  return parseDecisionResponse(json, latencyMs);
}

export async function evaluateWithDecisions({
  inputPayload,
  serverKey,
  userKey,
  preferUserKey = false,
}) {
  const questions = buildTafsirQuestions();
  const cleanServerKey = (serverKey || '').trim();
  const cleanUserKey = (userKey || '').trim();

  // Case 1: User explicitly prefers their own key
  if (preferUserKey && cleanUserKey) {
    try {
      const result = await callSingleKey(cleanUserKey, inputPayload, questions);
      return { ...result, keySource: 'user' };
    } catch (err) {
      const e = new Error(
        err.status === 401 || err.status === 403
          ? 'مفتاح Gemini الخاص بك غير صالح أو لا يملك صلاحية الوصول.'
          : err.status === 429
            ? 'وصل مفتاحك الخاص إلى حد الطلبات المؤقت في Google AI Studio، جرّب بعد دقيقة.'
            : 'تعذّر الاتصال بخدمة Gemini بمفتاحك الخاص حاليًا.'
      );
      e.code = err.status === 429 ? 'USER_QUOTA_EXCEEDED' : 'USER_KEY_INVALID';
      e.httpStatus = err.status === 429 ? 429 : 401;
      throw e;
    }
  }

  // Case 2: Try built-in server key first
  if (cleanServerKey) {
    try {
      const result = await callSingleKey(cleanServerKey, inputPayload, questions);
      return { ...result, keySource: 'server' };
    } catch (serverErr) {
      const canFallback =
        cleanUserKey &&
        (serverErr.status === 429 ||
          serverErr.status === 401 ||
          serverErr.status === 403 ||
          serverErr.status >= 500);

      if (canFallback) {
        try {
          const result = await callSingleKey(cleanUserKey, inputPayload, questions);
          return { ...result, keySource: 'user_fallback' };
        } catch (userErr) {
          const e = new Error(
            userErr.status === 401 || userErr.status === 403
              ? 'توقف المفتاح المدمج مؤقتًا، ومفتاحك الاحتياطي غير صالح.'
              : 'وصل كل من المفتاح المدمج ومفتاحك الاحتياطي إلى حد الطلبات حاليًا.'
          );
          e.code = 'FALLBACK_FAILED';
          e.httpStatus = 429;
          throw e;
        }
      }

      const e = new Error(
        serverErr.status === 429
          ? 'امتلأت حصة الخادم المؤقتة الآن — يمكنك إدخال مفتاح Google AI Studio المجاني الخاص بك للمتابعة فورًا.'
          : 'تعذّر تشغيل المفتاح المدمج حاليًا — يمكنك إدخال مفتاح Google AI Studio المجاني الخاص بك للمتابعة.'
      );
      e.code = serverErr.status === 429 ? 'SERVER_QUOTA_EXCEEDED' : 'SERVER_KEY_ERROR';
      e.httpStatus = 503;
      throw e;
    }
  }

  // Case 3: No server key configured — use user key if provided
  if (cleanUserKey) {
    try {
      const result = await callSingleKey(cleanUserKey, inputPayload, questions);
      return { ...result, keySource: 'user' };
    } catch (userErr) {
      const e = new Error(
        userErr.status === 401 || userErr.status === 403
          ? 'مفتاح Gemini المُدخل غير صالح، تحقّق منه من Google AI Studio.'
          : 'تعذّر الاتصال بخدمة Gemini بمفتاحك حاليًا.'
      );
      e.code = 'USER_KEY_INVALID';
      e.httpStatus = userErr.status === 429 ? 429 : 401;
      throw e;
    }
  }

  // Case 4: Neither server key nor user key available
  const e = new Error(
    'يلزم إعداد مفتاح Gemini على الخادم أو إدخال مفتاح Google AI Studio المجاني الخاص بك للتحليل الحي.'
  );
  e.code = 'KEY_REQUIRED';
  e.httpStatus = 401;
  throw e;
}

export function scoreRecommendation(analysis, { focus = 'easy', wantVocab = false, avoidDebate = false }) {
  const s = analysis.scores || {};
  const sig = analysis.signals || {};

  let focusScore = 0;
  if (focus === 'easy') {
    focusScore = (s.readability || 0) * 0.65 + (s.educational || 0) * 0.35;
  } else if (focus === 'educational') {
    focusScore = (s.educational || 0) * 0.7 + (s.readability || 0) * 0.3;
  } else if (focus === 'linguistic') {
    focusScore = (s.linguistic || 0) * 0.8 + (s.readability || 0) * 0.2;
  } else if (focus === 'fiqh_athar') {
    focusScore = Math.max(s.fiqh || 0, s.narrations || 0) * 0.65 + ((s.fiqh || 0) + (s.narrations || 0)) * 0.175;
  } else {
    focusScore = (s.readability || 0) * 0.5 + (s.educational || 0) * 0.5;
  }

  // Normalize base to 0..100
  let total = (focusScore / 4) * 80;

  if (wantVocab) {
    total += (sig.has_vocab?.probability ?? 0) * 14;
  } else {
    total += 7;
  }

  if (avoidDebate) {
    const debateProb = sig.has_ikhtilaf?.probability ?? 0;
    total += (1 - debateProb) * 14;
  } else {
    total += 7;
  }

  return Math.max(12, Math.min(99, Math.round(total)));
}
