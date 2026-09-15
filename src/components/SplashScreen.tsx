import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 2000,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Keep splash visible for minimum duration, then smoothly fade out
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        onFinish();
      }, 500); // 500ms fade duration
      return () => clearTimeout(exitTimer);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onFinish]);

  const handleSkip = () => {
    if (!isFadingOut) {
      setIsFadingOut(true);
      setTimeout(onFinish, 350);
    }
  };

  return (
    <div
      id="splash-screen"
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center select-none cursor-pointer overflow-hidden transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #2a150a 0%, #170b04 60%, #0d0602 100%)',
      }}
      role="banner"
      aria-label="Vintage Bookshelf Splash Screen"
    >
      {/* Subtle Warm Candlelight Ambient Glow in Center */}
      <div 
        className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(245, 190, 80, 0.15) 0%, rgba(212, 175, 55, 0.05) 50%, transparent 70%)',
          animationDuration: '3s',
        }}
      />

      {/* Decorative Outer Border Frame */}
      <div className="absolute inset-4 sm:inset-8 border border-[#7d5628]/40 pointer-events-none rounded-lg flex flex-col justify-between p-2">
        <div className="flex justify-between text-[#caa146]/50 text-xs">
          <span>╔</span>
          <span>╗</span>
        </div>
        <div className="flex justify-between text-[#caa146]/50 text-xs">
          <span>╚</span>
          <span>╝</span>
        </div>
      </div>

      {/* Center Content: Minimalist & Strictly Themed */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Antique Emblem Logo */}
        <div className="relative mb-5 sm:mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-b from-[#caa146] via-[#6f451a] to-[#2e1608] shadow-[0_8px_25px_rgba(0,0,0,0.9)]">
            <img
              src="/assets/logo.jpg"
              alt="Vintage Bookshelf Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full rounded-full object-cover border border-[#f5d77f]/60"
            />
          </div>
          {/* Subtle Golden Halo Ring */}
          <div className="absolute -inset-1 rounded-full border border-[#d4af37]/30 pointer-events-none animate-ping opacity-30" style={{ animationDuration: '3s' }} />
        </div>

        {/* The Exact Requested Title: "vintage bookshelf" */}
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-[0.2em] text-[#f5d77f] uppercase font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] gold-foil mb-3 text-center">
          vintage bookshelf
        </h1>

        {/* Minimal Antique Divider Ornament */}
        <div className="flex items-center gap-2.5 text-[#caa146]/70 my-1">
          <span className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-[#caa146]/80" />
          <span className="text-xs">✦</span>
          <span className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-[#caa146]/80" />
        </div>

        {/* Minimalist Subtitle */}
        <p className="font-serif italic text-xs sm:text-sm text-[#caa87f]/80 tracking-wider mt-2">
          antique library edition
        </p>
      </div>

      {/* Gentle Tap Hint at Bottom */}
      <div className="absolute bottom-6 text-[10px] sm:text-xs font-serif text-[#9e7d58]/60 tracking-widest uppercase animate-pulse">
        • • •
      </div>
    </div>
  );
};
