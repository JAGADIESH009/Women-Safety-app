import React from 'react';

export const LandscapeIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden pointer-events-none select-none flex items-end justify-end ${className}`}>
      <svg
        viewBox="0 0 540 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain object-bottom opacity-85"
        preserveAspectRatio="xMaxYMax meet"
      >
        {/* Soft Sun in Warm Pink */}
        <circle cx="380" cy="70" r="46" fill="#F8CCD7" fillOpacity="0.45" />

        {/* Birds in distance */}
        <path d="M310 45 Q315 40 320 45 Q325 40 330 45" stroke="#C4788C" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
        <path d="M335 38 Q339 34 343 38 Q347 34 351 38" stroke="#C4788C" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5" />

        {/* Distant Mountains / Hills */}
        <path
          d="M160 160 C210 120 260 105 320 125 C370 142 410 115 480 135 L540 145 L540 160 Z"
          fill="#F5DCE3"
          fillOpacity="0.5"
        />
        <path
          d="M0 160 L0 150 C70 130 140 138 210 152 C260 162 310 140 370 148 C430 156 480 148 540 160 Z"
          fill="#F1CFD8"
          fillOpacity="0.65"
        />

        {/* Midground Trees on right */}
        <path d="M470 160 L482 122 L494 160 Z" fill="#DFA8B6" fillOpacity="0.8" />
        <path d="M488 160 L498 132 L508 160 Z" fill="#DFA8B6" fillOpacity="0.75" />
        <path d="M455 160 L463 138 L471 160 Z" fill="#DFA8B6" fillOpacity="0.7" />

        {/* Town & University Silhouette */}
        {/* Clock tower & Spire */}
        <rect x="272" y="96" width="16" height="64" fill="#C98194" fillOpacity="0.75" rx="1" />
        <path d="M270 96 L280 72 L290 96 Z" fill="#B96E83" fillOpacity="0.8" />
        <circle cx="280" cy="108" r="3" fill="#FFF" fillOpacity="0.85" />
        <rect x="278" y="118" width="4" height="12" fill="#FFF" fillOpacity="0.6" />

        {/* Campus Buildings & Rooflines */}
        <rect x="252" y="120" width="20" height="40" fill="#D794A6" fillOpacity="0.75" />
        <path d="M250 120 L262 108 L274 120 Z" fill="#C98194" fillOpacity="0.8" />
        
        <rect x="288" y="122" width="44" height="38" fill="#D794A6" fillOpacity="0.75" />
        <path d="M288 122 L310 112 L332 122 Z" fill="#C98194" fillOpacity="0.8" />

        <rect x="332" y="128" width="28" height="32" fill="#D794A6" fillOpacity="0.75" />
        <path d="M330 128 L346 118 L362 128 Z" fill="#C98194" fillOpacity="0.8" />

        <rect x="228" y="132" width="24" height="28" fill="#DFA8B6" fillOpacity="0.7" />
        
        {/* Little window cuts in silhouette */}
        <rect x="294" y="130" width="4" height="5" fill="#FFF" fillOpacity="0.6" />
        <rect x="304" y="130" width="4" height="5" fill="#FFF" fillOpacity="0.6" />
        <rect x="314" y="130" width="4" height="5" fill="#FFF" fillOpacity="0.6" />
        <rect x="324" y="130" width="4" height="5" fill="#FFF" fillOpacity="0.6" />
        <rect x="294" y="142" width="4" height="5" fill="#FFF" fillOpacity="0.6" />
        <rect x="304" y="142" width="4" height="5" fill="#FFF" fillOpacity="0.6" />
        <rect x="314" y="142" width="4" height="5" fill="#FFF" fillOpacity="0.6" />
        <rect x="324" y="142" width="4" height="5" fill="#FFF" fillOpacity="0.6" />

        {/* Trees & Foliage scattered */}
        <circle cx="224" cy="144" r="8" fill="#C98194" fillOpacity="0.6" />
        <circle cx="214" cy="148" r="6" fill="#C98194" fillOpacity="0.55" />
        <circle cx="368" cy="146" r="9" fill="#C98194" fillOpacity="0.6" />
        <circle cx="380" cy="150" r="7" fill="#C98194" fillOpacity="0.55" />
        <circle cx="430" cy="152" r="8" fill="#C98194" fillOpacity="0.5" />
        
        {/* Ground baseline */}
        <rect x="0" y="158" width="540" height="2" fill="#E8BDC8" fillOpacity="0.6" />
      </svg>
    </div>
  );
};
