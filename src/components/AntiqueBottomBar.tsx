import React from 'react';
import { BookOpen, Search, Settings, Plus } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface AntiqueBottomBarProps {
  onOpenImport: () => void;
  onToggleSearch: () => void;
  onOpenSettings: () => void;
  onOpenCollection: () => void;
  isSearchActive: boolean;
}

export const AntiqueBottomBar: React.FC<AntiqueBottomBarProps> = ({
  onOpenImport,
  onToggleSearch,
  onOpenSettings,
  onOpenCollection,
  isSearchActive,
}) => {
  const { t } = useLanguage();

  return (
    <nav 
      aria-label="Navigasi Pustaka Antik" 
      className="w-full relative z-30 pt-2 pb-1.5 select-none"
    >
      {/* Antique Brass Rail Bar with Finials & Center Ring */}
      <div className="relative w-full max-w-xl mx-auto px-4 flex items-center justify-between">
        
        {/* Left Brass Knob / Finial */}
        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-tr from-[#6b4710] via-[#ffd978] to-[#9c711a] shadow-md border border-[#fce092]/60 shrink-0" />

        {/* Left Brass Horizontal Rod */}
        <div className="flex-1 h-1.5 sm:h-2 brass-rail-rod mx-1 rounded-full shadow-inner" />

        {/* Center Ornate Brass Ring & Elevated Plus Button */}
        <div className="relative -my-3 px-2 flex items-center justify-center shrink-0">
          {/* Scrollwork Wing Flourish behind orb */}
          <div className="absolute w-18 sm:w-22 h-4 -top-0.5 bg-gradient-to-b from-[#875c18] via-[#caa146] to-[#452c04] rounded-full filter blur-[0.2px] opacity-80" />

          {/* Big Center Brass Plus Button */}
          <button
            id="btn-rail-add-book"
            onClick={onOpenImport}
            className="w-11 h-11 sm:w-13 sm:h-13 rounded-full brass-center-orb flex items-center justify-center shadow-[0_5px_14px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition-transform duration-150 relative z-20 group"
            title={t('loadPdf')}
            aria-label={t('loadPdf')}
          >
            {/* Concentric Inner Inset Ring */}
            <div className="w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-full border-2 border-[#fff0a8]/60 bg-gradient-to-b from-[#e3bf60] to-[#7a5312] flex items-center justify-center shadow-inner group-hover:brightness-110">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-[#2e1805] stroke-[3] filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]" />
            </div>
          </button>
        </div>

        {/* Right Brass Horizontal Rod */}
        <div className="flex-1 h-1.5 sm:h-2 brass-rail-rod mx-1 rounded-full shadow-inner" />

        {/* Right Brass Knob / Finial */}
        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-tr from-[#6b4710] via-[#ffd978] to-[#9c711a] shadow-md border border-[#fce092]/60 shrink-0" />
      </div>

      {/* 3 Nav Tabs Below Rail: Koleksi | Cari | Pengaturan */}
      <div className="max-w-md mx-auto grid grid-cols-3 gap-1 pt-1 px-4 sm:px-6">
        {/* Tab 1: Koleksi */}
        <button
          id="btn-nav-collection"
          onClick={onOpenCollection}
          className="flex flex-col items-center justify-center gap-0.5 py-0.5 text-[#caa87f] hover:text-[#ffd978] transition active:scale-95 group"
        >
          <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#caa87f] group-hover:text-[#ffd978] transition drop-shadow" />
          <span className="text-[10px] sm:text-[11px] font-serif font-medium tracking-wide">
            {t('collectionTab')}
          </span>
        </button>

        {/* Tab 2: Cari */}
        <button
          id="btn-nav-search"
          onClick={onToggleSearch}
          className={`flex flex-col items-center justify-center gap-0.5 py-0.5 transition active:scale-95 group ${
            isSearchActive ? 'text-[#ffd978]' : 'text-[#caa87f] hover:text-[#ffd978]'
          }`}
        >
          <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 drop-shadow" />
          <span className="text-[10px] sm:text-[11px] font-serif font-medium tracking-wide">
            {t('searchTab')}
          </span>
        </button>

        {/* Tab 3: Pengaturan */}
        <button
          id="btn-nav-settings"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center gap-0.5 py-0.5 text-[#caa87f] hover:text-[#ffd978] transition active:scale-95 group"
        >
          <Settings className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#caa87f] group-hover:text-[#ffd978] transition drop-shadow" />
          <span className="text-[10px] sm:text-[11px] font-serif font-medium tracking-wide">
            {t('settingsTab')}
          </span>
        </button>
      </div>
    </nav>
  );
};
