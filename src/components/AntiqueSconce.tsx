import React from 'react';
import { useLanguage } from '../utils/i18n';

interface AntiqueSconceProps {
  side: 'left' | 'right';
  isOn: boolean;
  onToggle: () => void;
}

export const AntiqueSconce: React.FC<AntiqueSconceProps> = ({ side, isOn, onToggle }) => {
  const { language } = useLanguage();

  const titleText = language === 'en'
    ? (isOn ? `Click to turn off ${side} wall lantern` : `Click to turn on ${side} wall lantern`)
    : (isOn ? `Klik untuk mematikan lentera ${side === 'left' ? 'kiri' : 'kanan'}` : `Klik untuk menyalakan lentera ${side === 'left' ? 'kiri' : 'kanan'}`);

  const ariaLabelText = language === 'en'
    ? (isOn ? `Turn off ${side} lantern` : `Turn on ${side} lantern`)
    : (isOn ? `Matikan lentera ${side === 'left' ? 'kiri' : 'kanan'}` : `Nyalakan lentera ${side === 'left' ? 'kiri' : 'kanan'}`);

  return (
    <button 
      id={`btn-sconce-${side}`}
      type="button"
      onClick={onToggle}
      className={`absolute top-1/2 -translate-y-1/2 z-30 select-none flex items-center cursor-pointer group focus:outline-none touch-manipulation transition-transform duration-200 ${
        side === 'left' ? '-left-2 sm:left-1' : '-right-2 sm:right-1'
      }`}
      title={titleText}
      aria-label={ariaLabelText}
    >
      {/* Brass Mount Bracket */}
      <div className={`relative flex items-center transition-all duration-300 group-hover:scale-105 active:scale-95 ${
        side === 'right' ? 'flex-row-reverse' : 'flex-row'
      }`}>
        {/* Wall Backplate on Wood Column */}
        <div className={`w-2.5 sm:w-3.5 h-10 sm:h-12 rounded-sm border shadow-lg flex flex-col justify-between items-center py-1 transition-colors duration-300 ${
          isOn 
            ? 'bg-gradient-to-b from-[#b58b29] via-[#855e16] to-[#402a06] border-[#d4af37]' 
            : 'bg-gradient-to-b from-[#6b5016] via-[#4d360c] to-[#241804] border-[#7d5d1c]'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full shadow-xs transition-colors duration-300 ${isOn ? 'bg-[#fce092]' : 'bg-[#7a6128]'}`} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#1f1202]" />
        </div>

        {/* Curved Brass Arm */}
        <svg 
          className={`w-4 sm:w-6 h-10 sm:h-12 transition-colors duration-300 filter drop-shadow-md ${
            isOn ? 'text-[#caa146]' : 'text-[#6b5220]'
          } ${side === 'right' ? 'scale-x-[-1]' : ''}`}
          viewBox="0 0 24 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M2 30 C12 30, 20 25, 20 12 L20 8" 
            stroke="currentColor" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
          />
          <path 
            d="M16 6 L24 6 L22 10 L18 10 Z" 
            fill={isOn ? '#e5c158' : '#73571a'} 
          />
        </svg>

        {/* Glass Hurricane Lamp & Flame */}
        <div className="relative -ml-1 flex flex-col items-center">
          {/* Glass Top Vent / Cap with Tiny Ring Handle */}
          <div className={`w-3.5 sm:w-4.5 h-1.5 rounded-t-sm shadow-xs transition-colors duration-300 ${
            isOn 
              ? 'bg-gradient-to-r from-[#69480e] via-[#e5c158] to-[#593d0a]' 
              : 'bg-gradient-to-r from-[#3b2707] via-[#7a5c1b] to-[#2e1d04]'
          }`} />

          {/* Glass Chimney Bulb */}
          <div className={`relative w-5 sm:w-7 h-11 sm:h-14 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 sconce-glass ${
            isOn 
              ? 'border border-[#ffeaa7]/60 shadow-[0_0_15px_rgba(255,180,60,0.4)]' 
              : 'border border-[#5c4015]/40 bg-black/35 opacity-75'
          }`}>
            {/* Candle Stem (Wax Pillar) */}
            <div className={`absolute bottom-1 w-2 sm:w-2.5 h-4 sm:h-5 rounded-xs shadow-inner transition-colors duration-300 ${
              isOn ? 'bg-[#fef5e7]' : 'bg-[#9c8e7c]'
            }`} />
            
            {/* Flame when ON / Charred Wick when OFF */}
            {isOn ? (
              <div className="relative bottom-0 flex flex-col items-center">
                {/* Flickering Warm Flame */}
                <div className="absolute bottom-4 sm:bottom-5 w-2 sm:w-2.5 h-4 sm:h-5 bg-gradient-to-t from-[#ff7700] via-[#ffcc00] to-[#ffffff] rounded-full filter blur-[0.5px] shadow-[0_0_10px_#ffae19,0_0_20px_rgba(255,150,0,0.5)] animate-pulse" />
                {/* Inner white flame core */}
                <div className="absolute bottom-4 sm:bottom-5 w-1 h-2 bg-white/90 rounded-full blur-[0.2px]" />
              </div>
            ) : (
              /* Extinguished charred candle wick */
              <div className="absolute bottom-4.5 sm:bottom-5.5 w-0.5 h-1.5 bg-[#211710] rounded-t-full shadow-xs" />
            )}

            {/* Subtle glass reflection highlight */}
            <div className="absolute inset-y-1.5 left-1 w-0.5 rounded-full bg-white/20 pointer-events-none" />
          </div>

          {/* Brass Base Cup */}
          <div className={`w-4 sm:w-5 h-2 rounded-b-sm border-t shadow-md transition-colors duration-300 ${
            isOn 
              ? 'bg-gradient-to-r from-[#875d15] via-[#caa146] to-[#593d0a] border-[#fce092]' 
              : 'bg-gradient-to-r from-[#47300a] via-[#705217] to-[#362205] border-[#5e4314]'
          }`} />

          {/* Click Hint Indicator on Hover */}
          <div className="absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none text-[8px] font-mono text-[#ffd978] bg-black/80 px-1 py-0.5 rounded whitespace-nowrap z-40">
            {isOn ? (language === 'en' ? 'OFF' : 'PADAM') : (language === 'en' ? 'ON' : 'NYALAKAN')}
          </div>
        </div>
      </div>
    </button>
  );
};
