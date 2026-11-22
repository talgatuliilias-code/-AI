import React from 'react';

export const DermaSenseLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="dermaLogoGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0284C7" />
        <stop offset="100%" stopColor="#0D9488" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#dermaLogoGrad)" />
    <circle cx="20" cy="20" r="9.5" stroke="white" strokeWidth="2.2" strokeOpacity="0.92" />
    <path
      d="M20 14.2V25.8M14.2 20H25.8"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <circle cx="28.5" cy="11.5" r="2" fill="#BAE6FD" />
  </svg>
);
