import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { useLanguage } from '../utils/i18n';
import { Download, Smartphone } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { t } = useLanguage();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-serif font-semibold text-[#f8ecc2] bg-[#3a2012] border border-[#a17830] rounded shadow-md hover:bg-[#4d2c18] active:scale-95 transition"
        title={t('installAndroid')}
      >
        <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
        <span>{t('installAndroid')}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-guide-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-serif font-semibold text-[#f8ecc2] bg-[#3a2012] border border-[#a17830] rounded shadow-md hover:bg-[#4d2c18] active:scale-95 transition"
        >
          <Download className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>{t('installMobile')}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-sm rounded-lg bg-[#27170c] border-2 border-[#875d27] p-6 shadow-2xl text-[#e8dac1]">
              <h3 className="text-lg font-bold text-[#f5d77f] font-serif">{t('installGuideTitle')}</h3>
              <p className="mt-2 text-sm text-[#d4c3a3] font-serif leading-relaxed">
                {t('installGuideStep1')}<br />
                {t('installGuideStep2')}
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded bg-[#4a2b16] py-2 text-sm font-serif font-semibold text-[#f8ecc2] border border-[#a17830] hover:bg-[#5e371c]"
              >
                {t('understandBtn')}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
