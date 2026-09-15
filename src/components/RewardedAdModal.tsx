import React, { useState, useEffect } from 'react';
import { X, Play, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../utils/i18n';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  isOpen,
  onClose,
  onRewardGranted,
}) => {
  const { t, language } = useLanguage();
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsPlayingAd(false);
      setCountdown(5);
      setIsCompleted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAd && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (isPlayingAd && countdown === 0) {
      setIsCompleted(true);
      setIsPlayingAd(false);
      onRewardGranted();
    }
    return () => clearTimeout(timer);
  }, [isPlayingAd, countdown, onRewardGranted]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-xl bg-gradient-to-b from-[#2a150a] via-[#1a0c05] to-[#100602] border-2 border-[#b38539] shadow-2xl p-5 relative select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brass corner studs */}
        <div className="absolute top-2 left-2 brass-screw" />
        <div className="absolute top-2 right-2 brass-screw" />
        <div className="absolute bottom-2 left-2 brass-screw" />
        <div className="absolute bottom-2 right-2 brass-screw" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#5e3814] pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ffd978]" />
            <h3 className="text-sm font-bold font-display text-[#ffd978] tracking-wide">
              {t('rewardedAdModalTitle')}
            </h3>
          </div>
          {!isPlayingAd && (
            <button
              onClick={onClose}
              className="p-1 rounded bg-[#381c0c] text-[#d6be9f] hover:text-white transition"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="py-2">
          {isPlayingAd ? (
            /* Active Ad Video Simulation */
            <div className="space-y-4 text-center">
              <div className="relative w-full h-40 rounded-lg bg-black flex flex-col items-center justify-center overflow-hidden border border-[#875d27]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#381a0b] via-[#1f0d05] to-[#45220c] opacity-80" />
                
                {/* Floating Candlelight Graphic */}
                <Sparkles className="w-10 h-10 text-[#ffd978] animate-bounce mb-2 relative z-10" />
                <p className="text-xs font-display font-bold text-[#fff] relative z-10 px-4">
                  {language === 'en' ? 'Vintage Reading Club • Global Sponsor' : 'Pustaka Nusantara • Sponsor Resmi'}
                </p>
                <p className="text-[10px] text-[#ffd978] font-mono mt-1 relative z-10">
                  {t('rewardedAdWatching')}
                </p>

                {/* Top Corner Timer Badge */}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 border border-[#d4af37] text-[10px] font-mono text-[#ffd978] z-20">
                  00:0{countdown}s
                </div>

                {/* Progress Bar at Bottom */}
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/50">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d4af37] to-[#ffe082] transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#caa87f] font-serif italic">
                {language === 'en' ? 'Reward will unlock automatically after countdown' : 'Hadiah akan otomatis terbuka setelah hitungan mundur'}
              </p>
            </div>
          ) : isCompleted ? (
            /* Completed Success State */
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-in zoom-in-50" />
              <h4 className="text-sm font-bold font-display text-[#ffd978]">
                {t('rewardedAdSuccess')}
              </h4>
              <p className="text-xs text-[#d6c2a8] font-serif">
                {language === 'en' 
                  ? 'The warm candlelight and romantic reading night atmosphere has been applied.' 
                  : 'Nuansa kertas malam romantis dan lilin temaram kini telah aktif.'}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-lg font-serif font-bold text-xs text-[#200e04] bg-[#ffd978] hover:bg-white transition shadow-lg"
              >
                {language === 'en' ? 'Enjoy Reading' : 'Mulai Membaca'}
              </button>
            </div>
          ) : (
            /* Initial Prompt State */
            <div className="space-y-3 text-center">
              <div className="p-3 rounded-lg bg-[#200e05] border border-[#5c3717] text-left">
                <p className="text-xs text-[#ebd8bc] font-serif leading-relaxed">
                  {t('rewardedAdDesc')}
                </p>
              </div>

              <div className="py-2 flex flex-col items-center gap-1">
                <span className="text-xs font-serif font-bold text-[#ffd978] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ffd978]" />
                  <span>{t('rewardedAdPromptTitle')}</span>
                </span>
                <span className="text-[11px] text-[#9c8163] font-serif">
                  {language === 'en' ? 'Get romantic candle night atmosphere' : 'Dapatkan pencahayaan lilin romantis'}
                </span>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded border border-[#5e3814] text-xs font-serif text-[#caa87f] hover:bg-[#2b160b] transition"
                >
                  {language === 'en' ? 'Later' : 'Nanti Saja'}
                </button>
                <button
                  onClick={() => setIsPlayingAd(true)}
                  className="flex-1 py-2 rounded font-serif font-bold text-xs text-[#200e04] bg-gradient-to-r from-[#ffd978] to-[#caa146] hover:brightness-110 active:scale-95 transition shadow-lg flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t('rewardedAdWatchBtn')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
