import React, { useState } from 'react';
import { AlertIcon, BookOpenIcon, CheckIcon } from './Icons.jsx';

export default function TafsirCard({ item, signalsMeta }) {
  const [expanded, setExpanded] = useState(false);
  const { tafsir, text, analysis } = item;

  const activeSignals = signalsMeta.filter((s) => analysis?.signals?.[s.key]?.present);

  return (
    <article className="tafsir-card">
      <div className="tafsir-card-top">
        <div className="tafsir-card-identity">
          <span className="legend-dot" style={{ backgroundColor: tafsir.color, width: 10, height: 10 }} />
          <div>
            <h3 className="tafsir-card-name">{tafsir.name}</h3>
            <span className="tafsir-card-style">
              الطابع الغالب: {analysis?.dominantStyle?.label || 'تفسيري'}
            </span>
          </div>
        </div>
        <span className="audience-tag">{analysis?.audience?.label || 'قارئ عام'}</span>
      </div>

      <div className="signals-list">
        {activeSignals.length > 0 ? (
          activeSignals.map((sig) => (
            <span key={sig.key} className="signal-pill">
              <CheckIcon size={13} />
              <span>{sig.label}</span>
            </span>
          ))
        ) : (
          <span className="signal-empty">تفسير موجز يركّز على المعنى الإجمالي المباشر</span>
        )}
      </div>

      {analysis?.lowConfidence && (
        <div className="low-conf-note">
          <AlertIcon size={15} />
          <span>النص موجز جدًا في هذه الآية؛ قد تكون دقة التفريق بين المحاور أقل من المعتاد.</span>
        </div>
      )}

      {text && (
        <>
          <button
            type="button"
            className="read-toggle-btn"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            <BookOpenIcon />
            <span>{expanded ? 'إخفاء نص التفسير' : 'اقرأ نص التفسير'}</span>
          </button>

          {expanded && <div className="tafsir-reading-pane">{text}</div>}
        </>
      )}
    </article>
  );
}
