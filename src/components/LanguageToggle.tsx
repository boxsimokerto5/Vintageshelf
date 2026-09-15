import React from 'react';
import { useLanguage } from '../utils/i18n';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  compact?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div 
      className="inline-flex items-center rounded-md bg-[#1d0d04] border border-[#855c26] p-0.5 shadow-inner select-none"
      title={language === 'id' ? 'Ganti Bahasa (Switch to English)' : 'Switch Language (Ganti ke Bahasa Indonesia)'}
      role="group"
      aria-label="Language Selector"
    >
      <div className="hidden sm:flex items-center px-1 text-[#d4af37]">
        <Globe className="w-3 h-3 opacity-80" />
      </div>
      <button
        id="lang-toggle-in"
        type="button"
        onClick={() => setLanguage('id')}
        className={`flex items-center justify-center px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-serif font-bold transition-all cursor-pointer active:scale-95 ${
          language === 'id'
            ? 'bg-[#5c3214] text-[#ffd978] shadow-md border border-[#c49746]'
            : 'text-[#9c8163] hover:text-[#e8dac1] hover:bg-black/20'
        }`}
        aria-pressed={language === 'id'}
      >
        <span className="leading-none">ID</span>
      </button>
      <button
        id="lang-toggle-en"
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center justify-center px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] font-serif font-bold transition-all cursor-pointer active:scale-95 ${
          language === 'en'
            ? 'bg-[#5c3214] text-[#ffd978] shadow-md border border-[#c49746]'
            : 'text-[#9c8163] hover:text-[#e8dac1] hover:bg-black/20'
        }`}
        aria-pressed={language === 'en'}
      >
        <span className="leading-none">EN</span>
      </button>
    </div>
  );
};
