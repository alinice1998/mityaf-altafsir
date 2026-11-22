import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertIcon,
  BookOpenIcon,
  CheckIcon,
  CompareIcon,
  CompassIcon,
  DocumentIcon,
  KeyIcon,
  LogoPrism,
  UploadIcon,
} from './components/Icons.jsx';
import RadarChart from './components/RadarChart.jsx';
import SurahAyahPicker from './components/SurahAyahPicker.jsx';
import TafsirCard from './components/TafsirCard.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';

const LS_KEY = 'mityaf_user_gemini_key';
const LS_PREFER = 'mityaf_prefer_user_key';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('تعذّرت قراءة ملف PDF.'));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [meta, setMeta] = useState(null);
  const [mode, setMode] = useState('compare'); // 'compare' | 'recommend' | 'custom'

  // Shared Surah / Ayah state
  const [surah, setSurah] = useState(2);
  const [ayah, setAyah] = useState(255);

  // Compare state
  const [selectedTafsirs, setSelectedTafsirs] = useState([
    'ar-tafseer-al-saddi',
    'ar-tafseer-tahrir-al-tanwir',
    'ar-tafsir-ibn-kathir',
  ]);
  const [compareData, setCompareData] = useState(null);
  const [compareLoading, setCompareLoading] = useState(false);

  // Recommend state
  const [focus, setFocus] = useState('easy');
  const [wantVocab, setWantVocab] = useState(false);
  const [avoidDebate, setAvoidDebate] = useState(false);
  const [recommendData, setRecommendData] = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [openRecId, setOpenRecId] = useState(null);

  // Custom Text / PDF state
  const [customType, setCustomType] = useState('text'); // 'text' | 'pdf'
  const [customText, setCustomText] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [customData, setCustomData] = useState(null);
  const [customLoading, setCustomLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Error & Key Modal state
  const [errorMsg, setErrorMsg] = useState('');
  const [userKey, setUserKey] = useState(() => localStorage.getItem(LS_KEY) || '');
  const [preferUserKey, setPreferUserKey] = useState(() => localStorage.getItem(LS_PREFER) === '1');
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyModalReason, setKeyModalReason] = useState('');

  const buildHeaders = useCallback(
    (overrideKey = userKey, overridePrefer = preferUserKey) => {
      const headers = { 'Content-Type': 'application/json' };
      if (overrideKey) headers['X-User-Gemini-Key'] = overrideKey;
      if (overridePrefer) headers['X-Prefer-User-Key'] = '1';
      return headers;
    },
    [userKey, preferUserKey]
  );

  const handleApiError = useCallback((data, fallbackMsg) => {
    const msg = data?.error || fallbackMsg;
    setErrorMsg(msg);
    if (
      data?.code === 'KEY_REQUIRED' ||
      data?.code === 'SERVER_QUOTA_EXCEEDED' ||
      data?.code === 'SERVER_KEY_ERROR' ||
      data?.code === 'USER_KEY_INVALID'
    ) {
      setKeyModalReason(msg);
      setKeyModalOpen(true);
    }
  }, []);

  const runCompare = useCallback(
    async (s, a, ids, overrideKey, overridePrefer) => {
      setCompareLoading(true);
      setErrorMsg('');
      try {
        const resp = await fetch('/api/analyze-ayah', {
          method: 'POST',
          headers: buildHeaders(overrideKey ?? userKey, overridePrefer ?? preferUserKey),
          body: JSON.stringify({ surah: s, ayah: a, tafsirIds: ids }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          handleApiError(data, 'تعذّر تحليل هذه الآية حاليًا.');
          return;
        }
        setCompareData(data);
      } catch {
        setErrorMsg('تعذّر الاتصال بالخادم، تحقّق من الاتصال وحاول مجددًا.');
      } finally {
        setCompareLoading(false);
      }
    },
    [buildHeaders, handleApiError, preferUserKey, userKey]
  );

  const runRecommend = useCallback(
    async (s, a, f, vocab, noDebate, overrideKey, overridePrefer) => {
      setRecommendLoading(true);
      setErrorMsg('');
      try {
        const resp = await fetch('/api/recommend', {
          method: 'POST',
          headers: buildHeaders(overrideKey ?? userKey, overridePrefer ?? preferUserKey),
          body: JSON.stringify({
            surah: s,
            ayah: a,
            focus: f,
            wantVocab: vocab,
            avoidDebate: noDebate,
          }),
        });
        const data = await resp.json();
        if (!resp.ok) {
          handleApiError(data, 'تعذّر ترشيح التفسير الأنسب حاليًا.');
          return;
        }
        setRecommendData(data);
        setOpenRecId(data.ranked?.[0]?.tafsir?.id || null);
      } catch {
        setErrorMsg('تعذّر الاتصال بالخادم، تحقّق من الاتصال وحاول مجددًا.');
      } finally {
        setRecommendLoading(false);
      }
    },
    [buildHeaders, handleApiError, preferUserKey, userKey]
  );

  const runCustomAnalyze = useCallback(
    async (overrideKey, overridePrefer) => {
      setErrorMsg('');
      if (customType === 'text' && customText.trim().length < 25) {
        setErrorMsg('أدخل نصًا لا يقل عن 25 حرفًا ليتم تحليل أبعاده بدقة.');
        return;
      }
      if (customType === 'pdf' && !pdfFile) {
        setErrorMsg('اختر ملف PDF أولًا ليتم تحليله.');
        return;
      }

      setCustomLoading(true);
      try {
        const body =
          customType === 'pdf'
            ? { pdfBase64: await fileToBase64(pdfFile), filename: pdfFile.name }
            : { text: customText.trim() };

        const resp = await fetch('/api/analyze-custom', {
          method: 'POST',
          headers: buildHeaders(overrideKey ?? userKey, overridePrefer ?? preferUserKey),
          body: JSON.stringify(body),
        });
        const data = await resp.json();
        if (!resp.ok) {
          handleApiError(data, 'تعذّر تحليل المحتوى حاليًا.');
          return;
        }
        setCustomData(data);
      } catch (e) {
        setErrorMsg(e.message || 'تعذّر الاتصال بالخادم.');
      } finally {
        setCustomLoading(false);
      }
    },
    [buildHeaders, customText, customType, handleApiError, pdfFile, preferUserKey, userKey]
  );

  // Load metadata and default compare on first visit
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/meta');
        const m = await r.json();
        if (!mounted) return;
        setMeta(m);
        setSelectedTafsirs(m.defaultCompareIds);
        runCompare(2, 255, m.defaultCompareIds);
      } catch {
        if (mounted) setErrorMsg('تعذّر تحميل بيانات السور والتفاسير.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTafsir(id) {
    setSelectedTafsirs((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least 1
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  }

  function handleSelectSurah(newSurahId) {
    setSurah(newSurahId);
    setAyah(1);
  }

  function handleSelectPreset(s, a) {
    setSurah(s);
    setAyah(a);
    if (mode === 'compare') {
      runCompare(s, a, selectedTafsirs);
    } else if (mode === 'recommend') {
      runRecommend(s, a, focus, wantVocab, avoidDebate);
    }
  }

  function handleSaveKey(newKey, newPrefer) {
    setUserKey(newKey);
    setPreferUserKey(newPrefer);
    if (newKey) localStorage.setItem(LS_KEY, newKey);
    else localStorage.removeItem(LS_KEY);
    localStorage.setItem(LS_PREFER, newPrefer ? '1' : '0');
    setKeyModalOpen(false);
    setKeyModalReason('');
    setErrorMsg('');

    // Re-run current active view smoothly with the new key
    if (mode === 'compare') runCompare(surah, ayah, selectedTafsirs, newKey, newPrefer);
    else if (mode === 'recommend') runRecommend(surah, ayah, focus, wantVocab, avoidDebate, newKey, newPrefer);
    else if (mode === 'custom' && (customText.trim().length >= 25 || pdfFile)) {
      runCustomAnalyze(newKey, newPrefer);
    }
  }

  function handleClearKey() {
    setUserKey('');
    setPreferUserKey(false);
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_PREFER);
    setKeyModalOpen(false);
  }

  function handlePdfChosen(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('يرجى اختيار ملف بصيغة PDF فقط.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setErrorMsg('الحد الأقصى لحجم ملف PDF هو 12 ميجابايت.');
      return;
    }
    setErrorMsg('');
    setPdfFile(file);
  }

  const keyReady = Boolean(meta?.hasServerKey || userKey);

  const compareSeries = (compareData?.items || []).map((item) => ({
    id: item.tafsir.id,
    name: item.tafsir.name,
    color: item.tafsir.color,
    fill: item.tafsir.fill,
    scores: item.analysis.scores,
  }));

  const modeButtons = [
    { id: 'compare', label: 'مقارنة التفاسير', icon: <CompareIcon /> },
    { id: 'recommend', label: 'رشّح لي الأنسب', icon: <CompassIcon /> },
    { id: 'custom', label: 'افحص نصًا أو PDF', icon: <DocumentIcon /> },
  ];

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <LogoPrism size={34} />
            <div className="brand-text">
              <span className="brand-title">مطياف التفسير</span>
              <span className="brand-sub">قراءة أبعاد التفسير وترشيح الأنسب</span>
            </div>
          </div>

          <nav className="mode-tabs desktop-tabs" aria-label="أوضاع التطبيق">
            {modeButtons.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`mode-tab ${mode === tab.id ? 'mode-tab-active' : ''}`}
                onClick={() => {
                  setMode(tab.id);
                  setErrorMsg('');
                  if (tab.id === 'recommend' && !recommendData) {
                    runRecommend(surah, ayah, focus, wantVocab, avoidDebate);
                  }
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <button
            type="button"
            className="key-btn"
            aria-label="إعدادات مفتاح Gemini الاحتياطي"
            onClick={() => {
              setKeyModalReason('');
              setKeyModalOpen(true);
            }}
          >
            <span className={`key-status-dot ${keyReady ? 'key-status-dot-ready' : ''}`} />
            <KeyIcon />
            <span className="key-btn-label">{userKey ? 'مفتاحك مفعّل' : 'مفتاح احتياطي'}</span>
          </button>
        </div>

        <div className="mobile-tabs-wrap">
          <nav className="mode-tabs" aria-label="أوضاع التطبيق للجوال">
            {modeButtons.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`mode-tab ${mode === tab.id ? 'mode-tab-active' : ''}`}
                onClick={() => {
                  setMode(tab.id);
                  setErrorMsg('');
                  if (tab.id === 'recommend' && !recommendData) {
                    runRecommend(surah, ayah, focus, wantVocab, avoidDebate);
                  }
                }}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main-container">
        {/* MODE 1: COMPARE TAFSIRS */}
        {mode === 'compare' && meta && (
          <>
            <section className="control-panel" aria-label="اختيار الآية والتفاسير">
              <SurahAyahPicker
                chapters={meta.chapters}
                presets={meta.presets}
                surah={surah}
                ayah={ayah}
                onChangeSurah={handleSelectSurah}
                onChangeAyah={setAyah}
                onSelectPreset={handleSelectPreset}
              />

              <div className="panel-divider" />

              <div className="tafsir-select-row">
                <div className="field-group" style={{ flex: '1 1 360px' }}>
                  <span className="field-label">التفاسير للمقارنة (اختر حتى 3 تفاسير)</span>
                  <div className="tafsir-chips">
                    {meta.tafsirs.map((t) => {
                      const active = selectedTafsirs.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`tafsir-chip ${active ? 'tafsir-chip-selected' : ''}`}
                          aria-pressed={active}
                          onClick={() => toggleTafsir(t.id)}
                        >
                          <span className="tafsir-chip-dot" style={{ backgroundColor: t.color }} />
                          <span>{t.shortName || t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  disabled={compareLoading}
                  onClick={() => runCompare(surah, ayah, selectedTafsirs)}
                >
                  {compareLoading ? 'جارٍ استخراج الطيف...' : 'استخرج الطيف'}
                </button>
              </div>
            </section>

            {errorMsg && (
              <div className="notice-banner notice-banner-error" role="alert">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  className="notice-link-btn"
                  onClick={() => setKeyModalOpen(true)}
                >
                  إدخال مفتاح Gemini
                </button>
              </div>
            )}

            {compareData?.usedSample && !errorMsg && (
              <div className="notice-banner">
                <span>
                  عرض عينة استرشادية — أضف مفتاح Google AI Studio المجاني للتحليل الحي لكل الآيات وملفات PDF.
                </span>
                <button
                  type="button"
                  className="notice-link-btn"
                  onClick={() => setKeyModalOpen(true)}
                >
                  إدخال المفتاح
                </button>
              </div>
            )}

            {compareLoading && (
              <div className="loading-state">
                <div className="spinner" />
                <span>جارٍ جلب التفاسير وقراءة أبعادها...</span>
              </div>
            )}

            {!compareLoading && compareData && (
              <>
                <section className="verse-banner" aria-label="نص الآية">
                  <p className="verse-text">﴿{compareData.verse.text}﴾</p>
                  <span className="verse-ref">
                    سورة {compareData.verse.surahName} — الآية {compareData.verse.ayah}
                  </span>
                </section>

                <section className="results-stage" aria-label="نتائج المقارنة">
                  <div className="stage-card">
                    <h2 className="stage-title">طيف أبعاد التفاسير</h2>
                    <RadarChart axes={meta.axes} series={compareSeries} />
                  </div>

                  <div className="cards-stack">
                    {compareData.items.map((item) => (
                      <TafsirCard key={item.tafsir.id} item={item} signalsMeta={meta.signals} />
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {/* MODE 2: RECOMMEND BEST TAFSIR */}
        {mode === 'recommend' && meta && (
          <>
            <section className="control-panel" aria-label="اختيار الآية وتفضيلاتك">
              <SurahAyahPicker
                chapters={meta.chapters}
                presets={meta.presets}
                surah={surah}
                ayah={ayah}
                onChangeSurah={handleSelectSurah}
                onChangeAyah={setAyah}
                onSelectPreset={handleSelectPreset}
              />

              <div className="panel-divider" />

              <div className="field-group">
                <span className="field-label">ما الذي تبحث عنه في التفسير الآن؟</span>
                <div className="focus-pills">
                  {meta.focuses.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`focus-pill ${focus === f.id ? 'focus-pill-active' : ''}`}
                      onClick={() => setFocus(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="checks-row">
                <div className="check-options">
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={wantVocab}
                      onChange={(e) => setWantVocab(e.target.checked)}
                    />
                    <span>أفضّل أن يشرح المفردات</span>
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={avoidDebate}
                      onChange={(e) => setAvoidDebate(e.target.checked)}
                    />
                    <span>دون توسّع في خلافات المفسرين</span>
                  </label>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  disabled={recommendLoading}
                  onClick={() => runRecommend(surah, ayah, focus, wantVocab, avoidDebate)}
                >
                  {recommendLoading ? 'جارٍ الترشيح...' : 'رشّح الأنسب الآن'}
                </button>
              </div>
            </section>

            {errorMsg && (
              <div className="notice-banner notice-banner-error" role="alert">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  className="notice-link-btn"
                  onClick={() => setKeyModalOpen(true)}
                >
                  إدخال مفتاح Gemini
                </button>
              </div>
            )}

            {recommendLoading && (
              <div className="loading-state">
                <div className="spinner" />
                <span>جارٍ مقارنة التفاسير الخمسة وترتيب الأنسب لك...</span>
              </div>
            )}

            {!recommendLoading && recommendData?.ranked?.length > 0 && (
              <>
                <section className="verse-banner" aria-label="نص الآية">
                  <p className="verse-text">﴿{recommendData.verse.text}﴾</p>
                  <span className="verse-ref">
                    سورة {recommendData.verse.surahName} — الآية {recommendData.verse.ayah}
                  </span>
                </section>

                {(() => {
                  const [winner, ...rest] = recommendData.ranked;
                  const winnerSignals = meta.signals.filter(
                    (s) => winner.analysis?.signals?.[s.key]?.present
                  );
                  return (
                    <section className="results-stage" aria-label="نتائج الترشيح">
                      <article className="winner-card">
                        <div className="winner-header">
                          <div>
                            <span className="winner-badge">الترشيح الأنسب لاختيارك</span>
                            <h2 style={{ margin: '8px 0 2px', fontSize: '1.15rem' }}>
                              {winner.tafsir.name}
                            </h2>
                            <span className="tafsir-card-style">
                              {winner.tafsir.author} · {winner.analysis.audience.label}
                            </span>
                          </div>
                          <span className="match-score">{winner.matchPercent}% تطابق</span>
                        </div>

                        <div className="bars-grid">
                          {meta.axes.map((ax) => {
                            const val = Number(winner.analysis.scores?.[ax.key] ?? 0);
                            return (
                              <div key={ax.key} className="bar-item">
                                <div className="bar-item-head">
                                  <span>{ax.label}</span>
                                  <strong>{val.toFixed(1)} / 4</strong>
                                </div>
                                <div className="bar-track">
                                  <div
                                    className="bar-fill"
                                    style={{
                                      width: `${Math.min(100, (val / 4) * 100)}%`,
                                      backgroundColor: winner.tafsir.color,
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {winnerSignals.length > 0 && (
                          <div className="signals-list">
                            {winnerSignals.map((sig) => (
                              <span key={sig.key} className="signal-pill">
                                <CheckIcon size={13} />
                                <span>{sig.label}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="tafsir-reading-pane">{winner.text}</div>
                      </article>

                      <div className="ranked-others">
                        <h3 className="stage-title" style={{ marginBottom: 4 }}>
                          ترتيب بقية التفاسير
                        </h3>
                        {rest.map((item, idx) => {
                          const isOpen = openRecId === item.tafsir.id;
                          return (
                            <div key={item.tafsir.id} className="ranked-row">
                              <div className="ranked-row-top">
                                <div className="ranked-row-left">
                                  <span className="rank-num">{idx + 2}</span>
                                  <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>
                                      {item.tafsir.name}
                                    </div>
                                    <div className="tafsir-card-style">
                                      {item.analysis.dominantStyle.label} · {item.analysis.audience.label}
                                    </div>
                                  </div>
                                </div>
                                <span className="match-pill">{item.matchPercent}%</span>
                              </div>

                              <button
                                type="button"
                                className="read-toggle-btn"
                                aria-expanded={isOpen}
                                onClick={() =>
                                  setOpenRecId((prev) =>
                                    prev === item.tafsir.id ? null : item.tafsir.id
                                  )
                                }
                              >
                                <BookOpenIcon />
                                <span>{isOpen ? 'إخفاء النص' : 'قراءة التفسير'}</span>
                              </button>

                              {isOpen && <div className="tafsir-reading-pane">{item.text}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })()}
              </>
            )}
          </>
        )}

        {/* MODE 3: CUSTOM TEXT OR PDF */}
        {mode === 'custom' && meta && (
          <>
            <section className="control-panel" aria-label="تحليل نص مخصص أو ملف PDF">
              <div className="tafsir-select-row">
                <div className="custom-switcher" role="tablist" aria-label="نوع الإدخال">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={customType === 'text'}
                    className={`mode-tab ${customType === 'text' ? 'mode-tab-active' : ''}`}
                    onClick={() => {
                      setCustomType('text');
                      setErrorMsg('');
                    }}
                  >
                    لصق نص
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={customType === 'pdf'}
                    className={`mode-tab ${customType === 'pdf' ? 'mode-tab-active' : ''}`}
                    onClick={() => {
                      setCustomType('pdf');
                      setErrorMsg('');
                    }}
                  >
                    ملف PDF
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  disabled={customLoading}
                  onClick={() => runCustomAnalyze()}
                >
                  {customLoading ? 'جارٍ استخراج الطيف...' : 'استخرج الطيف'}
                </button>
              </div>

              {customType === 'text' ? (
                <div className="field-group">
                  <label className="field-label" htmlFor="custom-tafsir-text">
                    ألصق مقطع تفسير أو مقالة تدبرية أو تفريغ درس
                  </label>
                  <textarea
                    id="custom-tafsir-text"
                    className="custom-textarea"
                    placeholder="اكتب أو ألصق النص التفسيري أو التدبري هنا..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                </div>
              ) : (
                <div className="field-group">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    hidden
                    onChange={(e) => handlePdfChosen(e.target.files?.[0])}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    className={`pdf-dropzone ${dragActive ? 'pdf-dropzone-active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      handlePdfChosen(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <UploadIcon />
                    <span className="pdf-dropzone-title">
                      {pdfFile ? pdfFile.name : 'اسحب ملف PDF هنا أو اضغط لاختياره'}
                    </span>
                    <span className="pdf-dropzone-sub">
                      {pdfFile
                        ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} ميجابايت — جاهز للتحليل مباشرةً`
                        : 'يقرأ الملف مباشرةً حتى 12 ميجابايت (يُفضّل عدم رفع مستندات خاصة في الطبقة المجانية)'}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {errorMsg && (
              <div className="notice-banner notice-banner-error" role="alert">
                <span>{errorMsg}</span>
                <button
                  type="button"
                  className="notice-link-btn"
                  onClick={() => setKeyModalOpen(true)}
                >
                  إدخال مفتاح Gemini
                </button>
              </div>
            )}

            {customLoading && (
              <div className="loading-state">
                <div className="spinner" />
                <span>جارٍ فحص المحتوى واستخراج طيف أبعاده...</span>
              </div>
            )}

            {!customLoading && customData && !customData.analysis.isTafsirContent && (
              <section className="offtopic-card" aria-live="polite">
                <AlertIcon size={28} />
                <h3>المحتوى لا يبدو تفسيرًا أو نصًا تدبريًا</h3>
                <p>
                  مطياف التفسير مخصّص لتحليل نصوص التفسير والتدبر وعلوم القرآن الكريم؛ جرّب إدخال مقطع تفسير أو ملف درس قرآني.
                </p>
              </section>
            )}

            {!customLoading && customData && customData.analysis.isTafsirContent && (
              <section className="results-stage" aria-label="نتائج تحليل المحتوى المخصص">
                <div className="stage-card">
                  <h2 className="stage-title">طيف أبعاد: {customData.title}</h2>
                  <RadarChart
                    axes={meta.axes}
                    series={[
                      {
                        id: 'custom',
                        name: customData.title,
                        color: '#0F5C4D',
                        fill: 'rgba(15, 92, 77, 0.17)',
                        scores: customData.analysis.scores,
                      },
                    ]}
                  />
                </div>

                <div className="cards-stack">
                  <TafsirCard
                    item={{
                      tafsir: { id: 'custom', name: customData.title, color: '#0F5C4D' },
                      text: '',
                      analysis: customData.analysis,
                    }}
                    signalsMeta={meta.signals}
                  />
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <footer className="site-footer">
        مطياف التفسير — مثال عملي مفتوح المصدر على نماذج اتخاذ القرار (Gemini Decision 1)
      </footer>

      <ApiKeyModal
        open={keyModalOpen}
        hasServerKey={Boolean(meta?.hasServerKey)}
        savedKey={userKey}
        preferUserKey={preferUserKey}
        reasonMessage={keyModalReason}
        onSave={handleSaveKey}
        onClear={handleClearKey}
        onClose={() => setKeyModalOpen(false)}
      />
    </div>
  );
}
