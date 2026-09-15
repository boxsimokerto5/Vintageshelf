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
      className="inline-flex items-center rounded-md bg-[#201005] border border-[#855c26] p-0.5 shadow-inner"
      title={language === 'id' ? 'Ganti Bahasa (Switch to English)' : 'Switch Language (Ganti ke Bahasa Indonesia)'}
    >
      <button
        id="lang-toggle-in"
        onClick={() => setLanguage('id')}
        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-serif font-bold transition ${
          language === 'id'
            ? 'bg-[#522d14] text-[#ffd978] shadow border border-[#a87d36]'
            : 'text-[#9c8163] hover:text-[#d4be9f]'
        }`}
      >
        <span className="leading-none">ID</span>
      </button>
      <button
        id="lang-toggle-en"
        onClick={() => setLanguage('en')}
        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-serif font-bold transition ${
          language === 'en'
            ? 'bg-[#522d14] text-[#ffd978] shadow border border-[#a87d36]'
            : 'text-[#9c8163] hover:text-[#d4be9f]'
        }`}
      >
        <span className="leading-none">EN</span>
      </button>
    </div>
  );
};
