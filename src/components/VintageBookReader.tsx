import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Bookmark as BookmarkIcon, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  BookOpen, 
  Loader2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { Book, ReadingTheme, ReaderSettings, PdfBlendMode } from '../types';
import { playPageFlipSound, toggleAmbiance, startAmbiance, stopAmbiance, isAmbiancePlaying } from '../utils/audio';
import { PdfService } from '../utils/pdfRenderer';
import { getBookPdfBlob, updateBookProgress } from '../utils/storage';
import { useLanguage } from '../utils/i18n';
import { LanguageToggle } from './LanguageToggle';
import { AntiqueCandlePlay } from './AntiqueCandlePlay';
import { RewardedAdModal } from './RewardedAdModal';
import * as pdfjsLib from 'pdfjs-dist';

interface VintageBookReaderProps {
  book: Book;
  onClose: () => void;
  onUpdateBook: (updatedBook: Book) => void;
}

export const VintageBookReader: React.FC<VintageBookReaderProps> = ({
  book,
  onClose,
  onUpdateBook,
}) => {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(book.currentPage || 1);
  const [settings, setSettings] = useState<ReaderSettings>({
    theme: 'parchment',
    brightness: 1.0,
    fontSize: 18,
    zoomLevel: 1.0,
    pdfBlendMode: 'parchment',
    soundEnabled: true,
    spreadMode: 'auto',
    autoPageTurn: false,
  });

  const [isPdfLandscape, setIsPdfLandscape] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlipping, setIsFlipping] = useState<'next' | 'prev' | null>(null);
  const [flippingFromPage, setFlippingFromPage] = useState<number>(book.currentPage || 1);
  const [flippingTargetPage, setFlippingTargetPage] = useState<number>(book.currentPage || 1);
  const [isBookmarked, setIsBookmarked] = useState(book.bookmarkPages.includes(book.currentPage));
  
  // Ambient Sound & Rewarded Ad States from Reference Image
  const [isAmbianceActive, setIsAmbianceActive] = useState(isAmbiancePlaying());
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [hasRomanticUnlocked, setHasRomanticUnlocked] = useState(false);

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      stopAmbiance();
    };
  }, []);

  const handleToggleAmbiance = useCallback(() => {
    const newState = toggleAmbiance((playing) => setIsAmbianceActive(playing));
    setIsAmbianceActive(newState);
  }, []);

  const handleRewardGranted = useCallback(() => {
    setHasRomanticUnlocked(true);
    setSettings((s) => ({ ...s, theme: 'romantic' }));
    startAmbiance();
    setIsAmbianceActive(true);
  }, []);
  
  // PDF state
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfLoading, setPdfLoading] = useState(book.fileType === 'pdf');
  const [renderedPages, setRenderedPages] = useState<Record<number, string>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [touchPullOffset, setTouchPullOffset] = useState<number>(0);
  const [touchPullSide, setTouchPullSide] = useState<'right' | 'left' | null>(null);

  // Responsive two-page spread detection
  const [isWideScreen, setIsWideScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isDoublePage = isWideScreen && !isPdfLandscape && settings.spreadMode !== 'single';

  // Load PDF if book is PDF type
  useEffect(() => {
    let active = true;
    if (book.fileType === 'pdf') {
      setPdfLoading(true);
      getBookPdfBlob(book.id).then(async (buffer) => {
        if (!buffer || !active) return;
        try {
          const doc = await PdfService.loadDocument(buffer);
          if (active) {
            setPdfDoc(doc);
            // Check orientation of first page to detect landscape
            try {
              const firstPage = await doc.getPage(1);
              const viewport = firstPage.getViewport({ scale: 1 });
              if (viewport.width > viewport.height * 1.1) {
                setIsPdfLandscape(true);
              }
            } catch (e) {
              console.warn('Orientation check failed:', e);
            }
            setPdfLoading(false);
          }
        } catch (err) {
          console.error('Failed to load PDF doc:', err);
          if (active) setPdfLoading(false);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [book.id, book.fileType]);

  // Pre-render current & adjacent PDF pages with Sliding Window LRU Cache
  const renderPdfPageNumber = useCallback(
    async (pageNum: number) => {
      if (!pdfDoc || pageNum < 1 || pageNum > book.totalPages || renderedPages[pageNum]) {
        return;
      }
      try {
        const rendered = await PdfService.renderPageToDataUrl(pdfDoc, pageNum, 1100);
        setRenderedPages((prev) => {
          const next = { ...prev, [pageNum]: rendered.dataUrl };
          // Keep only pages within window [pageNum - 4, pageNum + 4] to prevent mobile RAM spikes
          const minAllowed = Math.max(1, pageNum - 4);
          const maxAllowed = Math.min(book.totalPages, pageNum + 4);
          for (const key of Object.keys(next)) {
            const p = Number(key);
            if (p < minAllowed || p > maxAllowed) {
              delete next[p];
            }
          }
          return next;
        });
      } catch (err) {
        console.error(`Failed to render page ${pageNum}:`, err);
      }
    },
    [pdfDoc, book.totalPages, renderedPages]
  );

  useEffect(() => {
    if (!pdfDoc) return;
    renderPdfPageNumber(currentPage);
    if (isDoublePage && currentPage + 1 <= book.totalPages) {
      renderPdfPageNumber(currentPage + 1);
    }
    // Pre-cache next pages for smooth flipping
    if (currentPage + 2 <= book.totalPages) {
      renderPdfPageNumber(currentPage + 2);
    }
    if (currentPage - 1 >= 1) {
      renderPdfPageNumber(currentPage - 1);
    }
  }, [pdfDoc, currentPage, isDoublePage, renderPdfPageNumber, book.totalPages]);

  // Sync bookmark state when page changes
  useEffect(() => {
    setIsBookmarked(book.bookmarkPages.includes(currentPage));
  }, [currentPage, book.bookmarkPages]);

  // Save reading progress to storage
  const saveProgress = (page: number, bookmarks = book.bookmarkPages) => {
    updateBookProgress(book.id, page, bookmarks);
    onUpdateBook({
      ...book,
      currentPage: page,
      bookmarkPages: bookmarks,
      lastReadDate: Date.now(),
    });
  };

  const handleNextPage = () => {
    const increment = isDoublePage ? 2 : 1;
    if (currentPage + increment > book.totalPages + (isDoublePage ? 1 : 0) || isFlipping) {
      return;
    }

    const nextTarget = Math.min(book.totalPages, currentPage + increment);

    if (settings.soundEnabled) {
      playPageFlipSound();
    }

    setFlippingFromPage(currentPage);
    setFlippingTargetPage(nextTarget);
    setIsFlipping('next');

    // 1020ms slow, weighted antique page turning cycle
    setTimeout(() => {
      setCurrentPage(nextTarget);
      saveProgress(nextTarget);
      setIsFlipping(null);
      setTouchPullOffset(0);
      setTouchPullSide(null);
    }, 1020);
  };

  const handlePrevPage = () => {
    const decrement = isDoublePage ? 2 : 1;
    if (currentPage <= 1 || isFlipping) {
      return;
    }

    const prevTarget = Math.max(1, currentPage - decrement);

    if (settings.soundEnabled) {
      playPageFlipSound();
    }

    setFlippingFromPage(currentPage);
    setFlippingTargetPage(prevTarget);
    setIsFlipping('prev');

    // 1020ms slow, weighted antique page turning cycle
    setTimeout(() => {
      setCurrentPage(prevTarget);
      saveProgress(prevTarget);
      setIsFlipping(null);
      setTouchPullOffset(0);
      setTouchPullSide(null);
    }, 1020);
  };

  // Touch Drag & Swipe for tactile antique book feel
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFlipping) return;
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;

    const screenWidth = window.innerWidth;
    if (touch.clientX > screenWidth * 0.6) {
      setTouchPullSide('right');
    } else if (touch.clientX < screenWidth * 0.4) {
      setTouchPullSide('left');
    } else {
      setTouchPullSide(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || isFlipping || !touchPullSide) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - touchStartX.current;

    // Pulling right-side corner to left (next page)
    if (touchPullSide === 'right' && deltaX < 0) {
      setTouchPullOffset(Math.min(50, Math.abs(deltaX)));
    } else if (touchPullSide === 'left' && deltaX > 0) {
      setTouchPullOffset(Math.min(50, deltaX));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX.current;

    setTouchPullOffset(0);
    setTouchPullSide(null);

    // Swipe / drag past 40px triggers slow page turn
    if (deltaX < -40) {
      handleNextPage();
    } else if (deltaX > 40) {
      handlePrevPage();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const toggleBookmark = () => {
    let updatedBookmarks: number[];
    if (isBookmarked) {
      updatedBookmarks = book.bookmarkPages.filter((p) => p !== currentPage);
      setIsBookmarked(false);
    } else {
      updatedBookmarks = [...book.bookmarkPages, currentPage].sort((a, b) => a - b);
      setIsBookmarked(true);
    }
    saveProgress(currentPage, updatedBookmarks);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Theme styling helpers
  const getThemeClass = () => {
    switch (settings.theme) {
      case 'sepia': return 'theme-sepia';
      case 'night': return 'theme-night';
      case 'emerald': return 'theme-emerald';
      case 'romantic': return 'theme-romantic-night';
      default: return 'theme-parchment';
    }
  };

  const getPdfFilterClass = () => {
    switch (settings.pdfBlendMode) {
      case 'sepia': return 'pdf-blend-sepia';
      case 'night': return 'pdf-blend-night';
      case 'original': return 'pdf-blend-none';
      case 'parchment':
      default: {
        if (settings.theme === 'night' || settings.theme === 'romantic') return 'pdf-blend-night';
        if (settings.theme === 'emerald') return 'pdf-blend-emerald';
        if (settings.theme === 'sepia') return 'pdf-blend-sepia';
        return 'pdf-blend-parchment';
      }
    }
  };

  // Render content of a specific page (PDF or Sample Classic)
  const renderSinglePageContent = (pageNum: number, side: 'left' | 'right' | 'single') => {
    if (pageNum > book.totalPages) {
      return (
        <div className="h-full flex items-center justify-center text-xs opacity-30 font-serif italic">
          {t('endOfBook')}
        </div>
      );
    }

    // PDF Document Page Render
    if (book.fileType === 'pdf') {
      const pageImage = renderedPages[pageNum];
      return (
        <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 font-serif select-text relative overflow-hidden">
          {/* Top Header Row with Title & Brass Candle PLAY control */}
          <div className="flex items-start justify-between gap-3 mb-2 border-b border-current/15 pb-1.5 shrink-0 z-10">
            <div className="max-w-[70%]">
              <h2 className="text-base sm:text-xl font-serif font-bold tracking-tight text-current leading-tight truncate">
                {book.title}
              </h2>
              <p className="text-[10px] sm:text-[11px] opacity-70 italic font-serif flex items-center gap-2">
                <span>{book.author} • {t('pageOf')} {pageNum} {t('of')} {book.totalPages}</span>
                {isPdfLandscape && (
                  <span className="px-1.5 py-0.2 rounded bg-[#b87333]/20 border border-[#b87333]/40 text-[9px] uppercase tracking-wider text-[#b87333]">
                    {t('landscapeModeDetected')}
                  </span>
                )}
              </p>
            </div>
            <AntiqueCandlePlay 
              isPlaying={isAmbianceActive} 
              onTogglePlay={handleToggleAmbiance} 
            />
          </div>

          {/* PDF Page Canvas with Zoom Container & Paper Blend */}
          <div className="flex-1 min-h-0 w-full overflow-auto pdf-zoom-viewport flex items-center justify-center p-1 rounded">
            {pageImage ? (
              <div 
                className="transition-transform duration-200 origin-center flex items-center justify-center"
                style={{
                  transform: `scale(${settings.zoomLevel})`,
                  minWidth: settings.zoomLevel > 1 ? `${settings.zoomLevel * 90}%` : 'auto',
                }}
              >
                <img
                  src={pageImage}
                  alt={`${t('pageOf')} ${pageNum}`}
                  className={`max-h-[64vh] max-w-full object-contain rounded-xs shadow-md transition-all duration-300 ${getPdfFilterClass()}`}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-[#a8875e] py-16">
                <Loader2 className="w-7 h-7 animate-spin text-[#d4af37]" />
                <span className="text-xs font-serif italic">{t('renderingPage')} {pageNum}...</span>
              </div>
            )}
          </div>

          {/* Bottom Rewarded Ad Monetization Prompt matching Reference Image */}
          <div 
            onClick={() => setIsRewardedAdOpen(true)}
            className="mt-1 text-center select-none cursor-pointer group py-1 px-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition active:scale-98 shrink-0 z-10"
          >
            <p className="font-serif italic text-xs font-bold opacity-90 group-hover:text-[#b87333] transition">
              {t('rewardedAdPromptTitle')}
            </p>
            <p className="font-serif italic text-[10px] opacity-75 group-hover:underline">
              {t('rewardedAdPromptSub')}
            </p>
          </div>

          {/* Page Folio Footer */}
          <div className="border-t border-current/15 pt-1.5 flex items-center justify-between text-[11px] opacity-70 shrink-0 z-10">
            <span className="text-[10px] tracking-widest">✦ ✦ ✦</span>
            <span className="font-serif font-bold">
              {side === 'left' ? `${pageNum}` : `— ${pageNum} —`}
            </span>
            <span className="text-[10px] tracking-widest">✦ ✦ ✦</span>
          </div>
        </div>
      );
    }

    // Sample Classic Literature / Manuscript Layout
    const samplePageData = book.sampleContent?.find((p) => p.pageNumber === pageNum) || {
      pageNumber: pageNum,
      chapterTitle: `Bagian ${pageNum}`,
      heading: book.title,
      content: [
        'Aksara demi aksara terukir tenang di lembaran kertas tua ini.',
        'Membaca dalam ketenangan malam mengalirkan kedamaian ke dalam kalbu, menyingkap tirai rahasia masa silam.',
        'Setiap lembar halaman yang dibalik bagaikan melangkah melintasi lorong waktu yang penuh pesona.'
      ]
    };

    // Parse title for classical two-line display like in reference image ("Arsitektur Klasik" / "Javanese")
    const titleWords = (samplePageData.heading || book.title).split(' ');
    let titleLine1 = book.title;
    let titleLine2 = '';
    if (titleWords.length >= 3) {
      titleLine1 = titleWords.slice(0, 2).join(' ');
      titleLine2 = titleWords.slice(2).join(' ');
    } else if (titleWords.length === 2) {
      titleLine1 = titleWords[0];
      titleLine2 = titleWords[1];
    }

    return (
      <div className="w-full h-full flex flex-col justify-between p-6 sm:p-10 font-serif select-text">
        {/* Top Antique Header: Title on Left + Brass Candlestick PLAY button on Right */}
        <div className="flex items-start justify-between gap-3 mb-4 border-b border-current/10 pb-3">
          <div className="max-w-[70%]">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-current tracking-tight leading-tight">
              {titleLine1}
              {titleLine2 && (
                <>
                  <br />
                  <span>{titleLine2}</span>
                </>
              )}
            </h1>
            {samplePageData.chapterTitle && (
              <p className="text-xs italic opacity-70 mt-1 font-serif">
                {samplePageData.chapterTitle}
              </p>
            )}
          </div>

          {/* Candleholder with PLAY/PAUSE button from screenshot */}
          <AntiqueCandlePlay 
            isPlaying={isAmbianceActive} 
            onTogglePlay={handleToggleAmbiance} 
          />
        </div>

        {/* Page Body with Justified Classic Typesetting */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-justify leading-relaxed">
          {samplePageData.content.map((paragraph, pIdx) => {
            return (
              <p 
                key={pIdx} 
                style={{ fontSize: `${settings.fontSize}px` }} 
                className="indent-6 sm:indent-8 leading-relaxed font-serif text-current opacity-95 text-justify"
              >
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Bottom Promoted Monetization Box (Rewarded Ad for Romantic Night Mode) */}
        <div 
          onClick={() => setIsRewardedAdOpen(true)}
          className="mt-6 mb-2 text-center select-none cursor-pointer group py-2 px-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition active:scale-98"
        >
          <p className="font-serif italic text-xs sm:text-sm font-bold opacity-90 group-hover:text-[#b87333] transition">
            {t('rewardedAdPromptTitle')}
          </p>
          <p className="font-serif italic text-[11px] sm:text-xs opacity-75 group-hover:underline">
            {t('rewardedAdPromptSub')}
          </p>
        </div>

        {/* Antique Page Footer with Page Number */}
        <div className="border-t border-current/15 pt-2.5 flex items-center justify-between text-xs opacity-70">
          <span className="font-display text-[10px] tracking-widest">✦ ✦ ✦</span>
          <span className="font-serif font-bold text-xs">
            {side === 'left' ? `${pageNum}` : `— ${pageNum} —`}
          </span>
          <span className="font-display text-[10px] tracking-widest">✦ ✦ ✦</span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      id="vintage-book-reader"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 flex flex-col bg-[#140b06] select-none overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(ellipse at 50% 30%, rgba(200, 140, 60, 0.08) 0%, transparent 80%)'
      }}
    >
      {/* Candlelight Dimmer Screen Filter */}
      <div 
        className="fixed inset-0 pointer-events-none z-30 transition-opacity duration-300"
        style={{
          backgroundColor: '#000000',
          opacity: 1 - settings.brightness
        }}
      />

      {/* Top Collapsible Vintage Header Bar */}
      <div 
        className={`z-40 transition-all duration-300 bg-gradient-to-b from-[#211208] to-[#160b05] border-b border-[#633f1b] px-4 py-2.5 flex items-center justify-between shadow-2xl ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Back to Shelf Button */}
        <button
          id="btn-back-to-shelf"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#331c0e] border border-[#855c26] text-[#e8dac1] hover:text-[#fff] hover:bg-[#4a2914] text-xs font-serif transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#d4af37]" />
          <span className="font-bold">{t('backToShelf')}</span>
        </button>

        {/* Center Book Details */}
        <div className="text-center truncate px-2 sm:px-4">
          <h2 className="text-xs sm:text-sm font-bold font-display text-[#f5d77f] truncate">
            {book.title}
          </h2>
          <p className="text-[10px] text-[#a89073] font-serif truncate flex items-center justify-center gap-1.5">
            <span>{book.author} • {t('pageOf')} {currentPage} {t('of')} {book.totalPages}</span>
            {isPdfLandscape && (
              <span className="px-1 py-0.2 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[8px] uppercase tracking-wider text-[#ffd700]">
                Landscape
              </span>
            )}
          </p>
        </div>

        {/* Right Quick Controls & Language Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Zoom In/Out Controls */}
          <div className="flex items-center rounded bg-[#2b170c] border border-[#6b471f] overflow-hidden text-[#c9a66b]">
            <button
              onClick={() => setSettings((s) => ({ ...s, zoomLevel: Math.max(0.8, Number((s.zoomLevel - 0.15).toFixed(2))) }))}
              className="px-1.5 py-1.5 hover:bg-[#3d1f0d] hover:text-white transition"
              title="Perkecil Zoom (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, zoomLevel: 1.0 }))}
              className="px-1.5 py-1 text-[10px] font-mono hover:bg-[#3d1f0d] hover:text-white transition border-x border-[#6b471f]/50"
              title="Reset Zoom 100%"
            >
              {Math.round(settings.zoomLevel * 100)}%
            </button>
            <button
              onClick={() => setSettings((s) => ({ ...s, zoomLevel: Math.min(2.5, Number((s.zoomLevel + 0.15).toFixed(2))) }))}
              className="px-1.5 py-1.5 hover:bg-[#3d1f0d] hover:text-white transition"
              title="Perbesar Zoom (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Language Toggle */}
          <LanguageToggle compact />

          {/* Bookmark Button */}
          <button
            id="btn-toggle-bookmark"
            onClick={toggleBookmark}
            className={`p-2 rounded border transition ${
              isBookmarked 
                ? 'bg-[#6b1e1e] border-[#d4af37] text-[#ffd700]' 
                : 'bg-[#2b170c] border-[#6b471f] text-[#c9a66b] hover:text-[#fff]'
            }`}
            title={isBookmarked ? t('bookmarkRemove') : t('bookmarkAdd')}
          >
            <BookmarkIcon className="w-4 h-4 fill-current" />
          </button>

          {/* Sound Effect Toggle */}
          <button
            onClick={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
            className="p-2 rounded bg-[#2b170c] border border-[#6b471f] text-[#c9a66b] hover:text-[#fff] transition"
            title={settings.soundEnabled ? t('soundOn') : t('soundOff')}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#d4af37]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#8a7256]" />
            )}
          </button>

          {/* Reading Mode Settings Toggle */}
          <button
            id="btn-reader-settings"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="p-2 rounded bg-[#2b170c] border border-[#6b471f] text-[#c9a66b] hover:text-[#fff] transition"
            title={t('readingSettings')}
          >
            <Sliders className="w-4 h-4 text-[#d4af37]" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded bg-[#2b170c] border border-[#6b471f] text-[#c9a66b] hover:text-[#fff] transition hidden sm:block"
            title={t('fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Settings Dropdown Popover */}
      {showSettingsMenu && (
        <div 
          id="reader-settings-panel"
          className="absolute top-14 right-4 z-50 w-80 max-h-[85vh] overflow-y-auto rounded-xl bg-[#241309] border-2 border-[#825927] p-4 shadow-2xl text-[#ebdcc2] font-serif animate-fade-in"
        >
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#5e3816]">
            <span className="text-xs font-bold font-display text-[#f5d77f] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('paperAndNightMode')}</span>
            </span>
            <button
              onClick={() => setShowSettingsMenu(false)}
              className="text-xs text-[#a68a6b] hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Theme Palette Buttons */}
          <div className="mb-4">
            <label className="block text-[11px] text-[#c2a988] mb-2 font-bold">{t('vintagePaperColor')}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettings((s) => ({ ...s, theme: 'parchment' }))}
                className={`px-2.5 py-2 rounded text-xs flex items-center gap-2 border transition ${
                  settings.theme === 'parchment'
                    ? 'border-[#d4af37] ring-1 ring-[#d4af37] font-bold'
                    : 'border-[#5e3b1c]'
                } bg-[#f6eedb] text-[#2c1f14]`}
              >
                <Sun className="w-3.5 h-3.5 text-[#b8860b]" />
                <span>{t('parchmentTheme')}</span>
              </button>

              <button
                onClick={() => setSettings((s) => ({ ...s, theme: 'sepia' }))}
                className={`px-2.5 py-2 rounded text-xs flex items-center gap-2 border transition ${
                  settings.theme === 'sepia'
                    ? 'border-[#d4af37] ring-1 ring-[#d4af37] font-bold'
                    : 'border-[#5e3b1c]'
                } bg-[#ebd8b6] text-[#2e1a0c]`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#8c5720] inline-block" />
                <span>{t('sepiaTheme')}</span>
              </button>

              <button
                onClick={() => setSettings((s) => ({ ...s, theme: 'night' }))}
                className={`px-2.5 py-2 rounded text-xs flex items-center gap-2 border transition ${
                  settings.theme === 'night'
                    ? 'border-[#d4af37] ring-1 ring-[#d4af37] font-bold'
                    : 'border-[#5e3b1c]'
                } bg-[#191715] text-[#d6c6ad]`}
              >
                <Moon className="w-3.5 h-3.5 text-[#e5c158]" />
                <span>{t('nightTheme')}</span>
              </button>

              <button
                onClick={() => setSettings((s) => ({ ...s, theme: 'emerald' }))}
                className={`px-2.5 py-2 rounded text-xs flex items-center gap-2 border transition ${
                  settings.theme === 'emerald'
                    ? 'border-[#d4af37] ring-1 ring-[#d4af37] font-bold'
                    : 'border-[#5e3b1c]'
                } bg-[#111713] text-[#d0d9cd]`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#1b3b24] inline-block" />
                <span>{t('emeraldTheme')}</span>
              </button>

              {/* Romantic Night Mode Theme Button */}
              {hasRomanticUnlocked ? (
                <button
                  onClick={() => setSettings((s) => ({ ...s, theme: 'romantic' }))}
                  className={`col-span-2 px-2.5 py-2 rounded text-xs flex items-center justify-between border transition ${
                    settings.theme === 'romantic'
                      ? 'border-[#ffd978] ring-1 ring-[#ffd978] font-bold bg-[#381c0d]'
                      : 'border-[#5e3b1c] bg-[#221006]'
                  } text-[#ffd978]`}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffd978]" />
                    <span>{t('romanticNightModeActive')}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#ffd978]/20 text-[#ffd978]">
                    Active
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    setIsRewardedAdOpen(true);
                  }}
                  className="col-span-2 px-2.5 py-2 rounded text-xs flex items-center justify-between border border-[#ffd978]/40 bg-[#2b1609] text-[#ffd978] hover:bg-[#3d1f0d] transition"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#ffd978] animate-pulse" />
                    <span>{t('rewardedAdPromptTitle')}</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#ffd978] text-[#221005] font-bold">
                    Ad
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* PDF Background Color Tint Adapter (For White PDFs) */}
          {book.fileType === 'pdf' && (
            <div className="mb-4 pb-3 border-b border-[#5e3816]">
              <label className="block text-[11px] text-[#c2a988] mb-1.5 font-bold">
                {t('pdfPaperBlendLabel')}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSettings((s) => ({ ...s, pdfBlendMode: 'parchment' }))}
                  className={`px-2 py-1.5 rounded text-[11px] border transition text-center ${
                    settings.pdfBlendMode === 'parchment'
                      ? 'border-[#d4af37] bg-[#422510] text-[#ffd700] font-bold ring-1 ring-[#d4af37]'
                      : 'border-[#5e3b1c] bg-[#2a170b] text-[#c2a988]'
                  }`}
                >
                  📜 {t('pdfBlendVintage')}
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, pdfBlendMode: 'sepia' }))}
                  className={`px-2 py-1.5 rounded text-[11px] border transition text-center ${
                    settings.pdfBlendMode === 'sepia'
                      ? 'border-[#d4af37] bg-[#422510] text-[#ffd700] font-bold ring-1 ring-[#d4af37]'
                      : 'border-[#5e3b1c] bg-[#2a170b] text-[#c2a988]'
                  }`}
                >
                  🍂 {t('pdfBlendSepia')}
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, pdfBlendMode: 'night' }))}
                  className={`px-2 py-1.5 rounded text-[11px] border transition text-center ${
                    settings.pdfBlendMode === 'night'
                      ? 'border-[#d4af37] bg-[#422510] text-[#ffd700] font-bold ring-1 ring-[#d4af37]'
                      : 'border-[#5e3b1c] bg-[#2a170b] text-[#c2a988]'
                  }`}
                >
                  🌙 {t('pdfBlendNight')}
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, pdfBlendMode: 'original' }))}
                  className={`px-2 py-1.5 rounded text-[11px] border transition text-center ${
                    settings.pdfBlendMode === 'original'
                      ? 'border-[#d4af37] bg-[#422510] text-[#ffd700] font-bold ring-1 ring-[#d4af37]'
                      : 'border-[#5e3b1c] bg-[#2a170b] text-[#c2a988]'
                  }`}
                >
                  📄 {t('pdfBlendOriginal')}
                </button>
              </div>
            </div>
          )}

          {/* Zoom Level Magnifier Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-[#c2a988] mb-1">
              <span className="font-bold flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-[#d4af37]" />
                {t('zoomLabel')}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[#ffd700]">{Math.round(settings.zoomLevel * 100)}%</span>
                {settings.zoomLevel !== 1.0 && (
                  <button
                    onClick={() => setSettings((s) => ({ ...s, zoomLevel: 1.0 }))}
                    className="text-[9px] text-[#d4af37] underline hover:text-white"
                  >
                    {t('zoomReset')}
                  </button>
                )}
              </div>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.5"
              step="0.05"
              value={settings.zoomLevel}
              onChange={(e) => setSettings((s) => ({ ...s, zoomLevel: parseFloat(e.target.value) }))}
              className="w-full accent-[#d4af37] cursor-pointer"
            />
          </div>

          {/* Candlelight Brightness Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-[11px] text-[#c2a988] mb-1">
              <span>{t('candlelightDimmer')}</span>
              <span>{Math.round(settings.brightness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="1.0"
              step="0.05"
              value={settings.brightness}
              onChange={(e) => setSettings((s) => ({ ...s, brightness: parseFloat(e.target.value) }))}
              className="w-full accent-[#d4af37] cursor-pointer"
            />
          </div>

          {/* Font Size Scaling (for text manuscripts) */}
          {book.fileType !== 'pdf' && (
            <div className="mb-2">
              <div className="flex items-center justify-between text-[11px] text-[#c2a988] mb-1">
                <span>{t('fontSizeLabel')}</span>
                <span>{settings.fontSize}px</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSettings((s) => ({ ...s, fontSize: Math.max(14, s.fontSize - 2) }))}
                  className="flex-1 py-1 rounded bg-[#361e11] border border-[#6b471f] text-xs font-bold hover:bg-[#482816]"
                >
                  A-
                </button>
                <button
                  onClick={() => setSettings((s) => ({ ...s, fontSize: Math.min(28, s.fontSize + 2) }))}
                  className="flex-1 py-1 rounded bg-[#361e11] border border-[#6b471f] text-xs font-bold hover:bg-[#482816]"
                >
                  A+
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Book Stage Area */}
      <div 
        className="flex-1 relative flex items-center justify-center p-2 sm:p-6 md:p-10 book-stage-3d overflow-hidden"
        onClick={() => setShowControls((prev) => !prev)}
      >
        {/* Silk Bookmark Ribbon Hanging from Top */}
        {isBookmarked && (
          <div 
            className="absolute top-0 right-16 sm:right-28 w-4 sm:w-6 h-16 sm:h-24 bg-gradient-to-b from-[#8b0000] via-[#c41e3a] to-[#780000] shadow-2xl z-40 bookmark-ribbon pointer-events-none transition-all duration-300"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)',
              borderLeft: '1px solid rgba(255,215,0,0.5)',
              borderRight: '1px solid rgba(0,0,0,0.4)',
            }}
          />
        )}

        {/* Outer Heavy Leather Book Cover Layer */}
        <div 
          className={`relative w-full ${isPdfLandscape ? 'max-w-6xl' : 'max-w-5xl'} h-[84vh] max-h-[820px] rounded-lg p-2 sm:p-4 flex items-stretch shadow-[0_20px_50px_rgba(0,0,0,0.95)] transition-all duration-300`}
          style={{
            backgroundColor: book.spineColor || '#3d1c0c',
            backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.4) 100%)',
            boxShadow: '0 0 0 2px #5c381c, inset 0 0 15px rgba(0,0,0,0.8), 0 25px 50px rgba(0,0,0,0.9)'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent clicking book from closing header
        >
          {/* Deckle Paper Stack Thickness Effect on Side */}
          <div className="absolute top-2 bottom-2 -left-1.5 w-1.5 bg-gradient-to-r from-[#d9caa3] via-[#b39f75] to-[#7d6b4a] rounded-l-xs shadow-inner" />
          <div className="absolute top-2 bottom-2 -right-1.5 w-1.5 bg-gradient-to-l from-[#d9caa3] via-[#b39f75] to-[#7d6b4a] rounded-r-xs shadow-inner" />

          {/* Open Book Inner Parchment Spread */}
          <div 
            className={`w-full h-full rounded-sm flex relative overflow-hidden transition-colors duration-300 ${getThemeClass()}`}
          >
            {/* Center Book Crease Shadow (Physical depth of binding) - only in double page */}
            {isDoublePage && (
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 z-20 pointer-events-none book-crease-shadow hidden lg:block" />
            )}

            {/* If Double Page (Desktop / Tablet Spread) */}
            {isDoublePage ? (
              <div className="w-full h-full flex relative book-stage-3d">
                {/* Left Page Leaf */}
                <div 
                  className="w-1/2 h-full relative border-r border-current/10 flex flex-col antique-open-leaf"
                >
                  <div className="absolute inset-y-0 right-0 w-8 pointer-events-none book-center-gutter z-10" />
                  
                  {/* Underneath content: if flipping prev, shows the prev spread left page */}
                  {renderSinglePageContent(
                    isFlipping === 'prev' ? flippingTargetPage : currentPage,
                    'left'
                  )}

                  {/* Dynamic cast shadow on left leaf when flipping prev */}
                  {isFlipping === 'prev' && <div className="cast-shadow-underlay-prev" />}

                  {/* Interactive Bottom-Left Curled Dog-Ear (Pull point for Prev Page) */}
                  {currentPage > 1 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevPage();
                      }}
                      className="absolute bottom-0 left-0 w-16 h-16 z-30 cursor-pointer group flex items-end justify-start select-none"
                      title="Sentuh atau tarik sudut ini untuk kembali"
                    >
                      <div className="relative w-12 h-12 overflow-hidden transition-all duration-300 group-hover:w-14 group-hover:h-14 dog-ear-idle-pulse">
                        <div className="absolute inset-0 bg-black/40 pointer-events-none transform -rotate-45 -translate-x-3 translate-y-3 filter blur-[2.5px]" />
                        <div 
                          className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-[#cbba96] via-[#ede1c7] to-[#d6c49f] border-t border-r border-[#8b6528]/60 shadow-lg transform transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-105"
                          style={{
                            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
                            boxShadow: '4px -4px 10px rgba(0,0,0,0.3)'
                          }}
                        >
                          <div className="absolute bottom-1 left-1 text-[10px] text-[#8b6528] font-serif select-none pointer-events-none opacity-80 group-hover:opacity-100">
                            ☙
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Left Page Turn Click Zone */}
                  <button
                    id="page-turn-left-zone"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1 || isFlipping !== null}
                    className="absolute inset-y-0 left-0 w-16 opacity-0 hover:opacity-100 flex items-center justify-start pl-2 transition-opacity z-20 group disabled:hidden cursor-w-resize"
                    title="Halaman Sebelumnya"
                  >
                    <div className="p-2 rounded-full bg-black/40 text-white shadow-lg group-hover:scale-110 transition">
                      <ChevronLeft className="w-5 h-5" />
                    </div>
                  </button>
                </div>

                {/* Right Page Leaf */}
                <div 
                  className="w-1/2 h-full relative flex flex-col antique-open-leaf deckled-paper-border"
                >
                  <div className="absolute inset-y-0 left-0 w-8 pointer-events-none book-center-gutter-right z-10" />
                  
                  {/* Underneath content: if flipping next, shows the next spread right page */}
                  {renderSinglePageContent(
                    isFlipping === 'next' ? Math.min(book.totalPages, flippingTargetPage + 1) : currentPage + 1,
                    'right'
                  )}

                  {/* Dynamic cast shadow on right leaf when flipping next */}
                  {isFlipping === 'next' && <div className="cast-shadow-underlay-next" />}

                  {/* Interactive Bottom-Right Curled Dog-Ear (Pull point for Next Page) */}
                  {currentPage + 1 < book.totalPages && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextPage();
                      }}
                      className="absolute bottom-0 right-0 w-16 h-16 z-30 cursor-pointer group flex items-end justify-end select-none"
                      title="Sentuh atau tarik sudut ini untuk membuka halaman berikutnya"
                    >
                      <div className="relative w-12 h-12 overflow-hidden transition-all duration-300 group-hover:w-14 group-hover:h-14 dog-ear-idle-pulse">
                        <div className="absolute inset-0 bg-black/40 pointer-events-none transform rotate-45 translate-x-3 translate-y-3 filter blur-[2.5px]" />
                        <div 
                          className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-[#cbba96] via-[#ede1c7] to-[#d6c49f] border-t border-l border-[#8b6528]/60 shadow-lg transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:scale-105"
                          style={{
                            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                            boxShadow: '-4px -4px 10px rgba(0,0,0,0.3)'
                          }}
                        >
                          <div className="absolute bottom-1 right-1 text-[10px] text-[#8b6528] font-serif select-none pointer-events-none opacity-80 group-hover:opacity-100">
                            ❧
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right Page Turn Click Zone */}
                  <button
                    id="page-turn-right-zone"
                    onClick={handleNextPage}
                    disabled={currentPage + 1 >= book.totalPages || isFlipping !== null}
                    className="absolute inset-y-0 right-0 w-16 opacity-0 hover:opacity-100 flex items-center justify-end pr-2 transition-opacity z-20 group disabled:hidden cursor-e-resize"
                    title="Halaman Berikutnya"
                  >
                    <div className="p-2 rounded-full bg-black/40 text-white shadow-lg group-hover:scale-110 transition">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                </div>

                {/* 3D Turning Leaf (Moving Page with slow paper curl & pulled corner) */}
                {isFlipping === 'next' && (
                  <div className="absolute top-0 bottom-0 right-0 w-1/2 h-full pointer-events-none z-40 turning-leaf-double-next">
                    {/* Front Face: The outgoing right page with pulled corner fold */}
                    <div className={`leaf-face leaf-face-front antique-open-leaf deckled-paper-border ${getThemeClass()}`}>
                      {renderSinglePageContent(flippingFromPage + 1, 'right')}
                      
                      {/* Visible Pulled Dog-Ear Corner on turning paper */}
                      <div className="absolute bottom-0 right-0 w-14 h-14 pointer-events-none z-20">
                        <div 
                          className="w-full h-full bg-gradient-to-tl from-[#c2af8a] via-[#e5d8be] to-[#ad966d] border-t border-l border-[#785420]/70"
                          style={{
                            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                            boxShadow: '-6px -6px 14px rgba(0,0,0,0.45)'
                          }}
                        />
                      </div>

                      <div className="paper-curl-sheen" />
                    </div>
                    {/* Back Face: The incoming left page */}
                    <div className={`leaf-face leaf-face-back antique-open-leaf ${getThemeClass()}`}>
                      {renderSinglePageContent(flippingTargetPage, 'left')}
                      <div className="paper-curl-sheen" />
                    </div>
                  </div>
                )}

                {isFlipping === 'prev' && (
                  <div className="absolute top-0 bottom-0 left-0 w-1/2 h-full pointer-events-none z-40 turning-leaf-double-prev">
                    {/* Front Face */}
                    <div className={`leaf-face leaf-face-front antique-open-leaf ${getThemeClass()}`}>
                      {renderSinglePageContent(flippingFromPage, 'left')}

                      {/* Visible Pulled Corner on turning paper */}
                      <div className="absolute bottom-0 left-0 w-14 h-14 pointer-events-none z-20">
                        <div 
                          className="w-full h-full bg-gradient-to-tr from-[#c2af8a] via-[#e5d8be] to-[#ad966d] border-t border-r border-[#785420]/70"
                          style={{
                            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
                            boxShadow: '6px -6px 14px rgba(0,0,0,0.45)'
                          }}
                        />
                      </div>

                      <div className="paper-curl-sheen" />
                    </div>
                    {/* Back Face */}
                    <div className={`leaf-face leaf-face-back antique-open-leaf deckled-paper-border ${getThemeClass()}`}>
                      {renderSinglePageContent(flippingTargetPage + 1, 'right')}
                      <div className="paper-curl-sheen" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Single Page Mode (Mobile / Phone View) */
              <div 
                className="w-full h-full relative book-stage-3d overflow-hidden"
              >
                {/* The Static Base Page (Revealed under the turning page) */}
                <div className="w-full h-full relative flex flex-col antique-open-leaf deckled-paper-border">
                  {/* Subtle side vignettes */}
                  <div className="absolute inset-y-0 left-0 w-4 pointer-events-none book-center-gutter z-10" />
                  <div className="absolute inset-y-0 right-0 w-4 pointer-events-none book-center-gutter-right z-10" />
                  
                  {/* Dynamic cast shadow as page curls up */}
                  {isFlipping === 'next' && <div className="cast-shadow-underlay-next" />}
                  {isFlipping === 'prev' && <div className="cast-shadow-underlay-prev" />}

                  {renderSinglePageContent(
                    isFlipping === 'next' ? flippingTargetPage : currentPage,
                    'single'
                  )}

                  {/* Single Page Dog-Ear: Bottom-Right for Next Page */}
                  {currentPage < book.totalPages && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextPage();
                      }}
                      className="absolute bottom-0 right-0 w-16 h-16 z-30 cursor-pointer group flex items-end justify-end select-none"
                      title="Sentuh atau tarik sudut ini untuk halaman berikutnya"
                    >
                      <div className="relative w-12 h-12 overflow-hidden transition-all duration-300 group-hover:w-14 group-hover:h-14 dog-ear-idle-pulse">
                        <div className="absolute inset-0 bg-black/40 pointer-events-none transform rotate-45 translate-x-3 translate-y-3 filter blur-[2.5px]" />
                        <div 
                          className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-tl from-[#cbba96] via-[#ede1c7] to-[#d6c49f] border-t border-l border-[#8b6528]/60 shadow-lg transform transition-all duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:scale-105"
                          style={{
                            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
                            boxShadow: '-4px -4px 10px rgba(0,0,0,0.3)'
                          }}
                        >
                          <div className="absolute bottom-1 right-1 text-[10px] text-[#8b6528] font-serif select-none pointer-events-none opacity-80 group-hover:opacity-100">
                            ❧
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Single Page Dog-Ear: Bottom-Left for Prev Page */}
                  {currentPage > 1 && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevPage();
                      }}
                      className="absolute bottom-0 left-0 w-16 h-16 z-30 cursor-pointer group flex items-end justify-start select-none"
                      title="Sentuh atau tarik sudut ini untuk kembali"
                    >
                      <div className="relative w-12 h-12 overflow-hidden transition-all duration-300 group-hover:w-14 group-hover:h-14 dog-ear-idle-pulse">
                        <div className="absolute inset-0 bg-black/40 pointer-events-none transform -rotate-45 -translate-x-3 translate-y-3 filter blur-[2.5px]" />
                        <div 
                          className="absolute bottom-0 left-0 w-10 h-10 bg-gradient-to-tr from-[#cbba96] via-[#ede1c7] to-[#d6c49f] border-t border-r border-[#8b6528]/60 shadow-lg transform transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-105"
                          style={{
                            clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
                            boxShadow: '4px -4px 10px rgba(0,0,0,0.3)'
                          }}
                        >
                          <div className="absolute bottom-1 left-1 text-[10px] text-[#8b6528] font-serif select-none pointer-events-none opacity-80 group-hover:opacity-100">
                            ☙
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3D Dynamic Turning Leaf */}
                {isFlipping && (
                  <div 
                    className={`turning-leaf-3d-container ${
                      isFlipping === 'next' ? 'turning-leaf-next' : 'turning-leaf-prev'
                    }`}
                  >
                    {/* Front Face of Curling Leaf with visible pulled fold */}
                    <div className={`leaf-face leaf-face-front antique-open-leaf deckled-paper-border ${getThemeClass()}`}>
                      {renderSinglePageContent(
                        isFlipping === 'next' ? flippingFromPage : flippingTargetPage,
                        'single'
                      )}

                      {/* Visible Pulled Dog-Ear Corner on the lifted page */}
                      <div className={`absolute bottom-0 ${isFlipping === 'next' ? 'right-0' : 'left-0'} w-14 h-14 pointer-events-none z-20`}>
                        <div 
                          className="w-full h-full bg-gradient-to-tl from-[#c2af8a] via-[#e5d8be] to-[#ad966d] border-t border-l border-[#785420]/70"
                          style={{
                            clipPath: isFlipping === 'next' 
                              ? 'polygon(100% 0, 0 100%, 100% 100%)' 
                              : 'polygon(0 0, 0 100%, 100% 100%)',
                            boxShadow: isFlipping === 'next' 
                              ? '-6px -6px 14px rgba(0,0,0,0.45)' 
                              : '6px -6px 14px rgba(0,0,0,0.45)'
                          }}
                        />
                      </div>

                      <div className="paper-curl-sheen" />
                    </div>

                    {/* Back Face: Parchment reverse texture with vintage book watermark */}
                    <div className="leaf-face leaf-face-back antique-open-leaf">
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 opacity-40 select-none">
                        <div className="text-4xl text-[#825c27] mb-2 font-display">✦</div>
                        <div className="text-xs font-serif italic text-[#543b17] tracking-widest">{book.title}</div>
                      </div>
                      <div className="paper-curl-sheen" />
                    </div>
                  </div>
                )}

                {/* Left & Right Tap Zones */}
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || isFlipping !== null}
                  className="absolute inset-y-0 left-0 w-16 opacity-0 hover:opacity-100 flex items-center justify-start pl-2 transition-opacity z-30 disabled:hidden"
                  title="Halaman Sebelumnya"
                >
                  <div className="p-2 rounded-full bg-black/40 text-white">
                    <ChevronLeft className="w-5 h-5" />
                  </div>
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= book.totalPages || isFlipping !== null}
                  className="absolute inset-y-0 right-0 w-16 opacity-0 hover:opacity-100 flex items-center justify-end pr-2 transition-opacity z-30 disabled:hidden"
                  title="Halaman Berikutnya"
                >
                  <div className="p-2 rounded-full bg-black/40 text-white">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Page Slider & Navigation Bar */}
      <div 
        className={`z-40 transition-all duration-300 bg-gradient-to-t from-[#211208] via-[#1c0e06] to-transparent px-4 py-3 flex flex-col items-center justify-center gap-2 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-full max-w-lg flex items-center justify-between gap-4 bg-[#29160a]/90 border border-[#6b471f] px-4 py-2 rounded-full shadow-2xl backdrop-blur-xs">
          {/* Previous Page Button */}
          <button
            id="btn-prev-page"
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isFlipping !== null}
            className="flex items-center gap-1 text-xs font-serif font-bold text-[#e5cfab] hover:text-[#fff] disabled:opacity-30 disabled:cursor-not-allowed transition p-1"
          >
            <ChevronLeft className="w-4 h-4 text-[#d4af37]" />
            <span className="hidden sm:inline">{t('prevPage')}</span>
          </button>

          {/* Interactive Page Slider */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#aa9175] min-w-[24px] text-right">
              {currentPage}
            </span>
            <input
              id="reader-page-slider"
              type="range"
              min="1"
              max={book.totalPages}
              value={currentPage}
              onChange={(e) => {
                const p = parseInt(e.target.value, 10);
                setCurrentPage(p);
                saveProgress(p);
              }}
              className="flex-1 accent-[#d4af37] h-1.5 rounded-lg bg-[#422511] cursor-pointer"
            />
            <span className="text-[11px] font-mono text-[#aa9175] min-w-[24px]">
              {book.totalPages}
            </span>
          </div>

          {/* Next Page Button */}
          <button
            id="btn-next-page"
            onClick={handleNextPage}
            disabled={
              currentPage + (isDoublePage ? 1 : 0) >= book.totalPages || 
              isFlipping !== null
            }
            className="flex items-center gap-1 text-xs font-serif font-bold text-[#e5cfab] hover:text-[#fff] disabled:opacity-30 disabled:cursor-not-allowed transition p-1"
          >
            <span className="hidden sm:inline">{t('nextPage')}</span>
            <ChevronRight className="w-4 h-4 text-[#d4af37]" />
          </button>
        </div>

        {/* Mobile Swipe Hint */}
        <p className="text-[10px] text-[#91765a] font-serif tracking-wide hidden sm:block">
          {t('swipeHint')}
        </p>
      </div>

      {/* Rewarded Ad Simulation Modal */}
      <RewardedAdModal
        isOpen={isRewardedAdOpen}
        onClose={() => setIsRewardedAdOpen(false)}
        onRewardGranted={handleRewardGranted}
      />
    </div>
  );
};
