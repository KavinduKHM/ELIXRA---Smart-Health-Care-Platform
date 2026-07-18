import React, { useId } from 'react';

/**
 * ELIXRA brand mark — a rounded gradient tile with a heartbeat/pulse line and a
 * medical plus. Crisp at any size (SVG), matches the sky-blue theme.
 */
const BrandLogo = ({ size = 40, title = 'ELIXRA' }) => {
  const rawId = useId();
  const gradientId = `elixra-${rawId.replace(/:/g, '')}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="0.55" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0369a1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="48" height="48" rx="13" fill={`url(#${gradientId})`} />
      {/* Heartbeat / pulse line */}
      <path
        d="M7 27 H16 L20 18 L26 32 L30 25 H41"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      {/* Medical plus */}
      <g fill="#ffffff" opacity="0.95">
        <rect x="32.5" y="9" width="4" height="12" rx="2" />
        <rect x="28.5" y="13" width="12" height="4" rx="2" />
      </g>
    </svg>
  );
};

export default BrandLogo;
