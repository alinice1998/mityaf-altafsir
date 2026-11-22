import React, { useState } from 'react';

const MAX_SCORE = 4;

function polarPoint(cx, cy, radius, angleRad) {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

export default function RadarChart({ axes, series }) {
  const [activeSeriesId, setActiveSeriesId] = useState(null);
  const [selectedAxisKey, setSelectedAxisKey] = useState(null);

  if (!axes?.length || !series?.length) return null;

  const width = 490;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2 + 4;
  const radius = 128;
  const count = axes.length;

  const getAngle = (index) => -Math.PI / 2 + (index * 2 * Math.PI) / count;

  const ringLevels = [1, 2, 3, 4];

  const makePolygonPoints = (scores) =>
    axes
      .map((axis, i) => {
        const val = Math.max(0.15, Math.min(MAX_SCORE, Number(scores?.[axis.key] ?? 0)));
        const r = (val / MAX_SCORE) * radius;
        const p = polarPoint(cx, cy, r, getAngle(i));
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      })
      .join(' ');

  const focusedAxis = axes.find((a) => a.key === selectedAxisKey) || null;

  return (
    <div className="radar-box">
      <div className="radar-svg-wrap">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="radar-svg"
          role="img"
          aria-label="رسم راداري يوضح أبعاد التفسير على ستة محاور"
        >
          {/* Concentric rings */}
          {ringLevels.map((lvl) => {
            const r = (lvl / MAX_SCORE) * radius;
            const pts = axes
              .map((_, i) => {
                const p = polarPoint(cx, cy, r, getAngle(i));
                return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
              })
              .join(' ');
            return (
              <polygon
                key={lvl}
                points={pts}
                className={lvl === 4 ? 'radar-ring radar-ring-outer' : 'radar-ring'}
              />
            );
          })}

          {/* Radial spokes */}
          {axes.map((axis, i) => {
            const outer = polarPoint(cx, cy, radius, getAngle(i));
            const isSelected = selectedAxisKey === axis.key;
            return (
              <line
                key={axis.key}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                className={isSelected ? 'radar-spoke radar-spoke-active' : 'radar-spoke'}
              />
            );
          })}

          {/* Scale numbers on top axis */}
          {[2, 4].map((lvl) => {
            const r = (lvl / MAX_SCORE) * radius;
            return (
              <text key={lvl} x={cx + 6} y={cy - r + 4} className="radar-scale-num">
                {lvl}
              </text>
            );
          })}

          {/* Data polygons */}
          {series.map((item) => {
            const isDimmed = activeSeriesId && activeSeriesId !== item.id;
            const isFocused = activeSeriesId === item.id;
            return (
              <g
                key={item.id}
                className="radar-series"
                style={{ opacity: isDimmed ? 0.16 : 1 }}
              >
                <polygon
                  points={makePolygonPoints(item.scores)}
                  fill={item.fill}
                  stroke={item.color}
                  strokeWidth={isFocused ? 2.8 : 2.1}
                  strokeLinejoin="round"
                />
                {axes.map((axis, i) => {
                  const val = Math.max(0.15, Math.min(MAX_SCORE, Number(item.scores?.[axis.key] ?? 0)));
                  const p = polarPoint(cx, cy, (val / MAX_SCORE) * radius, getAngle(i));
                  return (
                    <circle
                      key={axis.key}
                      cx={p.x}
                      cy={p.y}
                      r={isFocused ? 4.4 : 3.5}
                      fill={item.color}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Interactive Axis labels */}
          {axes.map((axis, i) => {
            const angle = getAngle(i);
            const labelR = radius + 30;
            const p = polarPoint(cx, cy, labelR, angle);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            let dy = 4;
            if (sin < -0.7) dy = -4;
            else if (sin > 0.7) dy = 12;

            let dx = 0;
            if (cos > 0.35) dx = 10;
            else if (cos < -0.35) dx = -10;

            const isSelected = selectedAxisKey === axis.key;

            return (
              <g
                key={axis.key}
                className="radar-label-group"
                onClick={() =>
                  setSelectedAxisKey((prev) => (prev === axis.key ? null : axis.key))
                }
              >
                <text
                  x={p.x + dx}
                  y={p.y + dy}
                  textAnchor="middle"
                  className={isSelected ? 'radar-label radar-label-active' : 'radar-label'}
                >
                  {axis.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend pills */}
      {series.length > 1 && (
        <div className="radar-legend" role="list" aria-label="التفاسير المعروضة">
          {series.map((item) => {
            const isActive = activeSeriesId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`legend-pill ${isActive ? 'legend-pill-active' : ''}`}
                onClick={() => setActiveSeriesId((prev) => (prev === item.id ? null : item.id))}
                onMouseEnter={() => setActiveSeriesId(item.id)}
                onMouseLeave={() => setActiveSeriesId(null)}
              >
                <span className="legend-dot" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Clean numeric axis breakdown when user taps an axis (or quick compact axis strip) */}
      <div className="axis-readout">
        {focusedAxis ? (
          <div className="axis-readout-inner">
            <span className="axis-readout-title">{focusedAxis.label} (من 4):</span>
            <div className="axis-readout-values">
              {series.map((item) => (
                <span key={item.id} className="axis-score-chip">
                  <span className="legend-dot" style={{ backgroundColor: item.color }} />
                  <span>{item.name}:</span>
                  <strong>{Number(item.scores?.[focusedAxis.key] ?? 0).toFixed(1)}</strong>
                </span>
              ))}
            </div>
          </div>
        ) : (
          <span className="axis-hint">اضغط على أي محور في الرسم لعرض درجاته الدقيقة</span>
        )}
      </div>
    </div>
  );
}
