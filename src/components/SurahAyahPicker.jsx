import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDownIcon, SearchIcon } from './Icons.jsx';

export default function SurahAyahPicker({
  chapters,
  presets,
  surah,
  ayah,
  onChangeSurah,
  onChangeAyah,
  onSelectPreset,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === Number(surah)) || chapters[0],
    [chapters, surah]
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return chapters;
    return chapters.filter((c) => c.name.includes(q) || String(c.id) === q);
  }, [chapters, query]);

  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const maxAyah = activeChapter?.versesCount || 286;

  return (
    <>
      <div className="control-row">
        <div className="field-group surah-picker" ref={wrapRef}>
          <label className="field-label" htmlFor="surah-trigger">
            السورة
          </label>
          <button
            id="surah-trigger"
            type="button"
            className="picker-trigger"
            aria-expanded={open}
            aria-haspopup="listbox"
            onClick={() => setOpen((v) => !v)}
          >
            <span>
              {activeChapter ? `${activeChapter.id}. سورة ${activeChapter.name}` : 'اختر السورة'}
            </span>
            <ChevronDownIcon />
          </button>

          {open && (
            <div className="picker-menu" role="listbox" aria-label="قائمة السور">
              <div className="picker-search-wrap">
                <SearchIcon />
                <input
                  ref={inputRef}
                  type="text"
                  className="picker-search-input"
                  placeholder="ابحث باسم السورة أو رقمها..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="picker-list">
                {filtered.map((ch) => {
                  const selected = ch.id === Number(surah);
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`picker-option ${selected ? 'picker-option-selected' : ''}`}
                      onClick={() => {
                        onChangeSurah(ch.id);
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <span>
                        {ch.id}. {ch.name}
                      </span>
                      <span className="picker-option-meta">{ch.versesCount} آية</span>
                    </button>
                  );
                })}
                {!filtered.length && (
                  <div className="picker-option-meta" style={{ padding: '12px', textAlign: 'center' }}>
                    لا توجد سورة مطابقة
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="field-group ayah-field">
          <label className="field-label" htmlFor="ayah-number">
            رقم الآية (1–{maxAyah})
          </label>
          <input
            id="ayah-number"
            type="number"
            min={1}
            max={maxAyah}
            className="text-input"
            value={ayah}
            onChange={(e) => {
              const val = Math.max(1, Math.min(maxAyah, Number(e.target.value) || 1));
              onChangeAyah(val);
            }}
          />
        </div>

        <div className="presets-row" style={{ flex: '1 1 240px', paddingBottom: '6px' }}>
          <span className="presets-caption">جرّب سريعًا:</span>
          {presets.map((p) => {
            const isActive = Number(surah) === p.surah && Number(ayah) === p.ayah;
            return (
              <button
                key={`${p.surah}:${p.ayah}`}
                type="button"
                className={`preset-chip ${isActive ? 'preset-chip-active' : ''}`}
                onClick={() => onSelectPreset(p.surah, p.ayah)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
