import React, { useState } from 'react';
import { CloseIcon, EyeIcon, EyeOffIcon } from './Icons.jsx';

export default function ApiKeyModal({
  open,
  hasServerKey,
  savedKey,
  preferUserKey,
  reasonMessage,
  onSave,
  onClear,
  onClose,
}) {
  const [draftKey, setDraftKey] = useState(savedKey || '');
  const [draftPrefer, setDraftPrefer] = useState(Boolean(preferUserKey));
  const [showKey, setShowKey] = useState(false);

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave(draftKey.trim(), draftPrefer);
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="key-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="modal-sheet" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2 id="key-modal-title">مفتاح Gemini الاحتياطي</h2>
          <button type="button" className="icon-close-btn" aria-label="إغلاق" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {reasonMessage && (
          <div className="low-conf-note" style={{ margin: 0 }}>
            {reasonMessage}
          </div>
        )}

        <p className="modal-desc">
          {hasServerKey
            ? 'يعمل التطبيق تلقائيًا بالمفتاح المدمج على الخادم. يمكنك إضافة مفتاح Google AI Studio المجاني الخاص بك كاحتياطي تلقائي في حال امتلأت حصة الخادم، أو استخدامه دائمًا.'
            : 'أضف مفتاح Google AI Studio المجاني الخاص بك لتفعيل التحليل الحي لكل الآيات والنصوص وملفات PDF. يُحفظ المفتاح محليًا في متصفحك فقط ولا يُخزَّن على الخادم.'}
        </p>

        <div className="field-group">
          <label className="field-label" htmlFor="user-gemini-key">
            مفتاح Google AI Studio
          </label>
          <div className="password-wrap">
            <input
              id="user-gemini-key"
              type={showKey ? 'text' : 'password'}
              className="text-input"
              placeholder="AIza..."
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              autoComplete="off"
            />
            <button
              type="button"
              className="password-toggle"
              aria-label={showKey ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
              onClick={() => setShowKey((v) => !v)}
            >
              {showKey ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <span className="presets-caption">
            احصل على مفتاح مجاني في ثوانٍ من{' '}
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
              Google AI Studio
            </a>
          </span>
        </div>

        {hasServerKey && (
          <label className="check-label">
            <input
              type="checkbox"
              checked={draftPrefer}
              onChange={(e) => setDraftPrefer(e.target.checked)}
            />
            <span>استخدم مفتاحي الخاص دائمًا (بدل الانتظار لحالة الاحتياطي فقط)</span>
          </label>
        )}

        <div className="modal-footer">
          {savedKey && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setDraftKey('');
                setDraftPrefer(false);
                onClear();
              }}
            >
              مسح المفتاح
            </button>
          )}
          <button type="submit" className="btn-primary">
            حفظ المفتاح
          </button>
        </div>
      </form>
    </div>
  );
}
