import React from 'react';
import { X, Globe, Volume2, VolumeX, Layers, Library, Info, Sparkles, Smartphone, Check } from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { ShelfDisplayMode } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface AntiqueSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayMode: ShelfDisplayMode;
  setDisplayMode: (mode: ShelfDisplayMode) => void;
}

export const AntiqueSettingsModal: React.FC<AntiqueSettingsModalProps> = ({
  isOpen,
  onClose,
  displayMode,
  setDisplayMode,
}) => {
  const { t, language, setLanguage } = useLanguage();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-xl bg-gradient-to-b from-[#2d160a] via-[#200e05] to-[#140803] border-2 border-[#875d27] shadow-2xl p-5 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brass corner screws */}
        <div className="absolute top-2 left-2 brass-screw" />
        <div className="absolute top-2 right-2 brass-screw" />
        <div className="absolute bottom-2 left-2 brass-screw" />
        <div className="absolute bottom-2 right-2 brass-screw" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#5e3b18] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#f5d77f]" />
            <h3 className="text-base font-bold font-display text-[#f5d77f] tracking-wide">
              {t('settingsTab')} • {t('vintageBadge')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#381c0c] border border-[#6f481f] text-[#cfb697] hover:text-[#fff] transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-4">
          {/* Language Selection */}
          <div className="p-3 rounded-lg bg-[#1a0c04] border border-[#523013]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif font-bold text-[#e8cfab] flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#d4af37]" />
                <span>{t('drawerLanguage')}</span>
              </span>
              <span className="text-[10px] text-[#9c8163] uppercase font-mono">{language}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage('id')}
                className={`py-2 px-3 rounded text-xs font-serif font-bold flex items-center justify-between transition ${
                  language === 'id'
                    ? 'bg-[#542911] text-[#ffd978] border border-[#c4983b] shadow-md'
                    : 'bg-[#241106] text-[#b09477] border border-[#4a2b12] hover:bg-[#361a0a]'
                }`}
              >
                <span>Bahasa Indonesia</span>
                {language === 'id' && <Check className="w-3.5 h-3.5 text-[#ffd978]" />}
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded text-xs font-serif font-bold flex items-center justify-between transition ${
                  language === 'en'
                    ? 'bg-[#542911] text-[#ffd978] border border-[#c4983b] shadow-md'
                    : 'bg-[#241106] text-[#b09477] border border-[#4a2b12] hover:bg-[#361a0a]'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-[#ffd978]" />}
              </button>
            </div>
          </div>

          {/* Bookshelf View Mode Toggle */}
          <div className="p-3 rounded-lg bg-[#1a0c04] border border-[#523013]">
            <span className="text-xs font-serif font-bold text-[#e8cfab] block mb-2">
              {language === 'en' ? 'Bookshelf Display Style' : 'Gaya Tampilan Rak Buku'}
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDisplayMode('spines')}
                className={`py-2 px-3 rounded text-xs font-serif flex items-center justify-center gap-2 transition ${
                  displayMode === 'spines'
                    ? 'bg-[#542911] text-[#ffd978] font-bold border border-[#c4983b]'
                    : 'bg-[#241106] text-[#b09477] border border-[#4a2b12] hover:bg-[#361a0a]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('spinesView')}</span>
              </button>
              <button
                onClick={() => setDisplayMode('covers')}
                className={`py-2 px-3 rounded text-xs font-serif flex items-center justify-center gap-2 transition ${
                  displayMode === 'covers'
                    ? 'bg-[#542911] text-[#ffd978] font-bold border border-[#c4983b]'
                    : 'bg-[#241106] text-[#b09477] border border-[#4a2b12] hover:bg-[#361a0a]'
                }`}
              >
                <Library className="w-3.5 h-3.5" />
                <span>{t('coversView')}</span>
              </button>
            </div>
          </div>

          {/* PWA / Android Install */}
          <div className="p-3 rounded-lg bg-[#1a0c04] border border-[#523013] flex items-center justify-between">
            <div>
              <p className="text-xs font-serif font-bold text-[#e8cfab]">
                {t('drawerInstall')}
              </p>
              <p className="text-[10px] text-[#91765a] font-serif">
                {language === 'en' ? 'Add app shortcut to Android Home Screen' : 'Simpan ikon pintasan aplikasi di HP'}
              </p>
            </div>
            <PWAInstallButton />
          </div>

          {/* About App Box */}
          <div className="p-3 rounded-lg bg-[#160a03] border border-[#47270e] text-center">
            <h4 className="text-xs font-bold font-display text-[#f5d77f] mb-1">
              {t('infoTitle')}
            </h4>
            <p className="text-[11px] text-[#a88f72] font-serif leading-relaxed">
              {t('infoDesc')}
            </p>
            <p className="text-[9px] text-[#785d43] mt-2 font-mono">
              Version 1.2.0 • Offline Ready (IndexedDB Storage)
            </p>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="mt-5 pt-3 border-t border-[#5e3b18] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded font-serif font-bold text-xs text-[#2b170c] bg-gradient-to-r from-[#e3bf60] to-[#caa146] hover:brightness-110 active:scale-95 transition shadow-lg"
          >
            {t('drawerClose')}
          </button>
        </div>
      </div>
    </div>
  );
};
