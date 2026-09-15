import React from 'react';
import { useLanguage } from '../utils/i18n';

interface AntiqueCandlePlayProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  className?: string;
}

export const AntiqueCandlePlay: React.FC<AntiqueCandlePlayProps> = ({
  isPlaying,
  onTogglePlay,
  className = '',
}) => {
  const { t } = useLanguage();

  return (
    <div 
      className={`flex flex-col items-end select-none group cursor-pointer ${className}`}
      onClick={onTogglePlay}
      title={isPlaying ? t('pauseAmbiance') : t('playAmbiance')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTogglePlay();
        }
      }}
    >
      {/* PLAY / PAUSE Text Header matching the reference image typography */}
      <div className="flex items-center gap-1 text-[#2e1d0f] hover:text-[#784d1c] transition mb-1 pr-1">
        <span className="font-serif tracking-widest text-[11px] sm:text-xs font-bold font-display uppercase">
          {isPlaying ? t('pauseAmbiance') : t('playAmbiance')}
        </span>
      </div>

      {/* Classical Brass Chamberstick with Handle & Candle from Reference Image */}
      <div className="relative w-12 sm:w-14 h-14 sm:h-16 flex items-center justify-center">
        {/* Ambient Candle Glow Diffusion */}
        <div 
          className={`absolute -top-3 w-12 h-12 rounded-full pointer-events-none transition-opacity duration-500 ${
            isPlaying ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(255, 180, 50, 0.45) 0%, rgba(255, 120, 20, 0.15) 50%, transparent 80%)'
          }}
        />

        <svg 
          viewBox="0 0 64 64" 
          className="w-full h-full filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)]"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Flame */}
          <g className={`transition-transform duration-200 ${isPlaying ? 'animate-pulse scale-105' : 'group-hover:scale-105'}`}>
            {/* Outer Warm Glow Flame */}
            <path
              d="M32 6 C30 11, 27 15, 27 19 C27 23, 29.5 25, 32 25 C34.5 25, 37 23, 37 19 C37 15, 34 11, 32 6 Z"
              fill="url(#outerFlame)"
            />
            {/* Inner Core Bright White/Yellow Flame */}
            <path
              d="M32 11 C31 14, 29 17, 29 20 C29 22.5, 30.5 24, 32 24 C33.5 24, 35 22.5, 35 20 C35 17, 33 14, 32 11 Z"
              fill="url(#innerFlame)"
            />
            {/* Candle Wick */}
            <line x1="32" y1="23" x2="32" y2="26" stroke="#221204" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Candle Wax Pillar */}
          <rect 
            x="28" 
            y="25" 
            width="8" 
            height="15" 
            rx="1.5" 
            fill="url(#waxGrad)" 
            stroke="#bda481" 
            strokeWidth="0.5" 
          />
          {/* Wax Drip Accent */}
          <path d="M30 25 Q29 32 30 35" stroke="#fdf8ed" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

          {/* Brass Candle Socket Cup */}
          <path 
            d="M26 39 L38 39 L36 44 L28 44 Z" 
            fill="url(#brassDark)" 
            stroke="#9c7526" 
            strokeWidth="0.8" 
          />

          {/* Brass Stem Collet */}
          <rect x="29" y="44" width="6" height="4" fill="url(#brassLight)" />

          {/* Brass Finger Ring Handle (Loop on Right Side) */}
          <path 
            d="M38 43 C49 40, 56 46, 50 54 C46 58, 38 55, 36 53" 
            stroke="url(#brassLight)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
          />
          <path 
            d="M38 43 C49 40, 56 46, 50 54 C46 58, 38 55, 36 53" 
            stroke="#472e09" 
            strokeWidth="0.8" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Wide Ornate Brass Saucer Pan */}
          <ellipse cx="32" cy="54" rx="20" ry="5.5" fill="url(#brassLight)" stroke="#6e4f16" strokeWidth="1" />
          <ellipse cx="32" cy="53.5" rx="17" ry="4" fill="url(#brassDark)" />
          <ellipse cx="32" cy="53" rx="10" ry="2.5" fill="url(#brassLight)" />

          {/* Gradients */}
          <defs>
            <linearGradient id="outerFlame" x1="32" y1="6" x2="32" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#ffb300" />
              <stop offset="70%" stopColor="#ff6f00" />
              <stop offset="100%" stopColor="#dd2c00" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="innerFlame" x1="32" y1="11" x2="32" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#fff9c4" />
              <stop offset="100%" stopColor="#ffe082" />
            </linearGradient>
            <linearGradient id="waxGrad" x1="28" y1="25" x2="36" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#f7ecd7" />
              <stop offset="100%" stopColor="#dfcca6" />
            </linearGradient>
            <linearGradient id="brassLight" x1="16" y1="40" x2="52" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#d4af37" />
              <stop offset="35%" stopColor="#ffd978" />
              <stop offset="70%" stopColor="#a37e28" />
              <stop offset="100%" stopColor="#543c0c" />
            </linearGradient>
            <linearGradient id="brassDark" x1="24" y1="40" x2="40" y2="55" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#875e18" />
              <stop offset="50%" stopColor="#54390b" />
              <stop offset="100%" stopColor="#2e1d05" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};
