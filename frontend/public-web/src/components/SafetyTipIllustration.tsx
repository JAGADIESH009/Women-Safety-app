import React from 'react';

export const SafetyTipIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 select-none pointer-events-none ${className}`}>
      <svg
        viewBox="0 0 160 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Soft Background Leaf / Plant Accent */}
        <path
          d="M20 110 C15 95 25 80 40 85 C42 100 30 115 20 110 Z"
          fill="#FDE6ED"
        />
        <path
          d="M32 125 C26 112 36 102 48 106 C50 118 40 128 32 125 Z"
          fill="#FCE0E8"
        />

        {/* Woman with backpack walking */}
        {/* Head & Neck */}
        <circle cx="96" cy="46" r="14" fill="#FAD1C0" />
        <rect x="92" y="56" width="7" height="12" fill="#F6C5B1" rx="2" />

        {/* Hair - Dark flowing hair */}
        <path
          d="M94 32 C82 32 74 42 70 54 C66 66 60 76 52 84 C50 86 52 88 55 87 C65 83 75 75 80 64 C86 52 92 48 104 46 C108 42 106 32 94 32 Z"
          fill="#2C1B22"
        />
        <path
          d="M86 42 C92 40 102 38 106 46 C100 48 94 48 86 42 Z"
          fill="#3B2630"
        />

        {/* Face features silhouette */}
        <path d="M106 44 C108 46 108 49 105 50" stroke="#E5A691" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="102" cy="45" r="1.5" fill="#2C1B22" />

        {/* Backpack strap & body */}
        <path
          d="M66 66 C64 74 65 92 72 98 C76 100 80 96 80 90 L76 70 Z"
          fill="#6C283B"
          rx="4"
        />

        {/* Jacket / Hoodie - Warm Pink/Rose */}
        <path
          d="M88 66 C80 68 76 78 76 92 L98 94 L102 76 C102 70 96 66 88 66 Z"
          fill="#C43D68"
        />
        <path
          d="M88 66 L98 84 L114 88 C118 89 120 85 116 82 L104 74 C100 70 94 66 88 66 Z"
          fill="#D64D78"
        />

        {/* Hand in confident walking pose */}
        <circle cx="116" cy="86" r="4.5" fill="#FAD1C0" />

        {/* Collar line */}
        <path d="M92 66 L94 74 L99 68" stroke="#FDE6ED" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
