import React from 'react';

export function LogoPrism({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="10" fill="#0F5C4D" />
      <path
        d="M18 8.5L27.5 25.5H8.5L18 8.5Z"
        stroke="#FAF8F4"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="rgba(250, 248, 244, 0.08)"
      />
      <path d="M18 14.5L23 23.5" stroke="#E2B66A" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 14.5L18 23.5" stroke="#8AD6C5" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M18 14.5L13 23.5" stroke="#9DB5E8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function CompareIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3" />
      <polygon points="12 7.5 16.5 10 16.5 15 12 17.5 7.5 15 7.5 10 12 7.5" opacity="0.55" />
    </svg>
  );
}

export function CompassIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polygon points="15.5 8.5 13.7 13.7 8.5 15.5 10.3 10.3 15.5 8.5" />
    </svg>
  );
}

export function DocumentIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <polyline points="14 3 14 8 19 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

export function KeyIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15L19 4" />
      <path d="M16 7l2.5 2.5" />
      <path d="M18.5 4.5L21 7" />
    </svg>
  );
}

export function SearchIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.2" y2="16.2" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function CheckIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function EyeIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function EyeOffIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.9 17.9A10.2 10.2 0 0 1 12 19.5C5.8 19.5 2 12 2 12a18.2 18.2 0 0 1 4.6-5.4" />
      <path d="M9.9 5.3A9.6 9.6 0 0 1 12 5.5c6.2 0 10 6.5 10 6.5a18.6 18.6 0 0 1-2.2 3.1" />
      <line x1="3" y1="3" x2="21" y2="21" />
    </svg>
  );
}

export function BookOpenIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3H10a2 2 0 0 1 2 2v14.5a1.5 1.5 0 0 0-1.5-1.5H4.5A2.5 2.5 0 0 0 2 20.5z" />
      <path d="M22 5.5A2.5 2.5 0 0 0 19.5 3H14a2 2 0 0 0-2 2v14.5a1.5 1.5 0 0 1 1.5-1.5h6A2.5 2.5 0 0 1 22 20.5z" />
    </svg>
  );
}

export function UploadIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

export function AlertIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="12.5" />
      <circle cx="12" cy="16" r="0.8" fill="currentColor" />
    </svg>
  );
}
