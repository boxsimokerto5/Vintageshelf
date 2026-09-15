import React, { useState } from 'react';
import { Book, ShelfDisplayMode } from '../types';
import { 
  Menu, 
  Info, 
  Search, 
  X, 
  Coffee, 
  BookOpen, 
  Trash2, 
  Sparkles,
  Layers,
  Library,
  FileText
} from 'lucide-react';
import { useLanguage } from '../utils/i18n';
import { playLampSwitchSound } from '../utils/audio';
import { AntiqueSconce } from './AntiqueSconce';
import { AntiqueBottomBar } from './AntiqueBottomBar';
import { AntiqueSettingsModal } from './AntiqueSettingsModal';
import { VintageBookCatalogModal } from './VintageBookCatalogModal';
import { LanguageToggle } from './LanguageToggle';

interface VintageBookshelfProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onOpenImportModal: () => void;
  onDeleteBook: (id: string, e: React.MouseEvent) => void;
}

export const VintageBookshelf: React.FC<VintageBookshelfProps> = ({
  books,
  onSelectBook,
  onOpenImportModal,
  onDeleteBook,
}) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<ShelfDisplayMode>('spines');
  const [isShelfLampOn, setIsShelfLampOn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vintage_shelf_lamp_on');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isLeftSconceOn, setIsLeftSconceOn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vintage_sconce_left_on');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isRightSconceOn, setIsRightSconceOn] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vintage_sconce_right_on');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleShelfLamp = () => {
    setIsShelfLampOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vintage_shelf_lamp_on', String(next));
      } catch {
        // ignore
      }
      playLampSwitchSound(next);
      return next;
    });
  };

  const toggleLeftSconce = () => {
    setIsLeftSconceOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vintage_sconce_left_on', String(next));
      } catch {
        // ignore
      }
      playLampSwitchSound(next);
      return next;
    });
  };

  const toggleRightSconce = () => {
    setIsRightSconceOn((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('vintage_sconce_right_on', String(next));
      } catch {
        // ignore
      }
      playLampSwitchSound(next);
      return next;
    });
  };

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Split books into 2 realistic tiers for the cabinet
  const midPoint = Math.ceil(filteredBooks.length / 2);
  const tier1Books = filteredBooks.slice(0, Math.max(midPoint, 1));
  const tier2Books = filteredBooks.slice(Math.max(midPoint, 1));

  // Determine leaning books for authentic antique library charm
  const getBookTiltStyle = (index: number, total: number) => {
    // Lean 4th book on tier slightly if there are enough books
    if (index === 3 && total > 4) {
      return {
        transform: 'rotate(9deg)',
        transformOrigin: 'bottom left',
        marginRight: '8px',
      };
    }
    if (index === total - 2 && total > 5) {
      return {
        transform: 'rotate(-7deg)',
        transformOrigin: 'bottom right',
        marginLeft: '6px',
      };
    }
    return {};
  };

  return (
    <div className="h-full w-full bg-[#110804] flex flex-col items-center justify-center relative overflow-hidden font-serif">
      {/* Ambient Overhead Library Lamp Glow */}
      <div 
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] pointer-events-none blur-3xl rounded-full z-0 transition-opacity duration-700 ${
          isShelfLampOn ? 'opacity-35' : 'opacity-10'
        }`}
        style={{ background: 'radial-gradient(circle, rgba(255, 195, 100, 0.5) 0%, rgba(180, 95, 20, 0.15) 55%, transparent 75%)' }}
      />

      {/* Main Cabinet Framing - Exactly 100% Height */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl h-full flex flex-col bg-[#1c0d05] shadow-[0_0_50px_rgba(0,0,0,0.9)] border-x-4 border-[#3d1f0c] relative z-10 overflow-hidden">
        
        {/* Top App Bar (Header with Menu, Title, Language Toggle, Info) */}
        <header className="relative w-full h-11 sm:h-13 shrink-0 ornate-wood-cornice flex items-center justify-between px-2 sm:px-4 select-none z-30">
          {/* Left: 3-line Menu -> Opens Vintage Book Archive Catalog */}
          <button
            id="btn-menu-drawer"
            onClick={() => setIsCatalogOpen(true)}
            className="p-1.5 rounded hover:bg-black/30 text-[#e8c89b] hover:text-[#ffd978] transition active:scale-95 shrink-0"
            title={language === 'en' ? 'Book Archive Catalog' : 'Katalog Arsip Buku'}
            aria-label="Katalog Buku"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Center: App Title with Vintage Library Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-center min-w-0 px-1">
            <img 
              src="/assets/logo.jpg" 
              alt="Logo Perpustakaan Vintage" 
              referrerPolicy="no-referrer"
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full border border-[#d4af37]/70 shadow-[0_2px_4px_rgba(0,0,0,0.8)] object-cover shrink-0"
            />
            <h1 className="text-xs sm:text-sm md:text-base font-bold font-display tracking-wider text-[#f5d77f] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] truncate max-w-[130px] sm:max-w-[230px] md:max-w-none">
              {language === 'en' ? 'Vintage Bookshelf' : 'Pustaka Kuno'}
            </h1>
          </div>

          {/* Right: Global Language Toggle (EN - ID) & Info Button */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LanguageToggle />
            <button
              id="btn-info-modal"
              onClick={() => setIsInfoOpen(true)}
              className="p-1 sm:p-1.5 rounded hover:bg-black/30 text-[#e8c89b] hover:text-[#ffd978] transition active:scale-95"
              title={language === 'en' ? 'About App' : 'Informasi Aplikasi'}
              aria-label="Informasi"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Expandable Search Bar Overlay */}
        {isSearchOpen && (
          <div className="shrink-0 bg-[#241107] border-b border-[#71481e] p-2 px-4 flex items-center gap-2 animate-in slide-in-from-top duration-200 z-20">
            <Search className="w-4 h-4 text-[#d4af37] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              autoFocus
              className="flex-1 bg-[#140702] border border-[#5a3314] rounded px-3 py-1 text-xs text-[#f5ecd5] placeholder-[#8c7054] focus:outline-none focus:border-[#d4af37]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#b89c79] hover:text-[#fff] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="text-xs text-[#d4af37] font-serif hover:underline px-1"
            >
              {language === 'en' ? 'Done' : 'Selesai'}
            </button>
          </div>
        )}

        {/* Bookcase Body flanked by Classical Wood Columns with Glowing Sconces */}
        <div className="relative flex-1 min-h-0 w-full flex flex-row overflow-hidden">
          
          {/* Left Wood Pillar with Interactive Sconce */}
          <aside className="w-7 sm:w-11 lg:w-13 wood-pillar flex flex-col justify-between items-center py-2 relative z-20 shrink-0 h-full">
            {/* Fluting Line Indents */}
            <div className="w-1 h-full bg-black/40 rounded-full border-r border-white/5 pointer-events-none" />
            <AntiqueSconce 
              side="left" 
              isOn={isLeftSconceOn}
              onToggle={toggleLeftSconce}
            />
          </aside>

          {/* Central Shelf Compartment with Deep Wood Backing */}
          <main className="flex-1 min-h-0 h-full wood-backboard relative overflow-hidden flex flex-col justify-between p-1.5 sm:p-2.5">
            
            {/* Glowing Lantern Light Bleed Insets with Smooth Transitions */}
            <div 
              className={`absolute inset-y-0 left-0 w-20 sm:w-32 sconce-glow-left pointer-events-none z-10 transition-opacity duration-500 ${
                isLeftSconceOn ? 'opacity-100' : 'opacity-0'
              }`} 
            />
            <div 
              className={`absolute inset-y-0 right-0 w-20 sm:w-32 sconce-glow-right pointer-events-none z-10 transition-opacity duration-500 ${
                isRightSconceOn ? 'opacity-100' : 'opacity-0'
              }`} 
            />

            {/* Classical Carved Arch & Interactive Antique Shelf Lamp */}
            <div className="relative w-full pb-0.5 shrink-0 select-none flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Carved Wood Relief Scallop Motif */}
                <svg 
                  className="w-36 sm:w-52 h-5 sm:h-7 text-[#542d13] opacity-80 filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" 
                  viewBox="0 0 200 30" 
                  fill="currentColor"
                >
                  <path d="M0 0 Q100 28 200 0 Q150 15 100 8 Q50 15 0 0 Z" />
                  <path d="M85 14 Q100 4 115 14 Q100 18 85 14 Z" fill="#7a461c" />
                </svg>

                {/* Clickable Small Antique Brass Library Lamp */}
                <button
                  id="btn-shelf-upper-lamp"
                  type="button"
                  onClick={toggleShelfLamp}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 group p-1.5 flex flex-col items-center justify-center cursor-pointer focus:outline-none touch-manipulation"
                  title={
                    language === 'en'
                      ? (isShelfLampOn ? 'Click to turn off shelf lamp' : 'Click to turn on shelf lamp')
                      : (isShelfLampOn ? 'Klik untuk mematikan lampu rak' : 'Klik untuk menyalakan lampu rak')
                  }
                  aria-label={isShelfLampOn ? 'Matikan Lampu Rak' : 'Nyalakan Lampu Rak'}
                >
                  {/* Brass Fixture Assembly */}
                  <div className="relative flex flex-col items-center transition-transform duration-150 group-hover:scale-115 active:scale-90">
                    {/* Brass Mount Rosette */}
                    <div className="w-3.5 sm:w-4 h-1 rounded-t-full bg-gradient-to-r from-[#6e4610] via-[#ffd978] to-[#6e4610] shadow-sm border-t border-[#fce092]/60" />

                    {/* Miniature Curved Brass Hood / Lampshade */}
                    <div className="w-4.5 sm:w-5 h-2 rounded-t-sm bg-gradient-to-b from-[#8f6420] via-[#cfa344] to-[#63410e] border border-[#ffec99]/50 shadow-sm flex items-center justify-center relative">
                      {/* Tiny Rotary Switch Pin on right */}
                      <div 
                        className={`absolute -right-1 top-0.5 w-1 h-1.5 rounded-xs transition-transform duration-200 ${
                          isShelfLampOn 
                            ? 'rotate-15 bg-[#ffd978] shadow-[0_0_3px_#ffbf33]' 
                            : '-rotate-15 bg-[#7a551b]'
                        }`} 
                      />
                    </div>

                    {/* Small Light Bulb / Filament */}
                    <div 
                      className={`w-3 sm:w-3.5 h-3 sm:h-3.5 -mt-0.5 rounded-full border transition-all duration-300 flex items-center justify-center relative ${
                        isShelfLampOn
                          ? 'bg-gradient-to-t from-[#ffb300] via-[#fff5d0] to-[#ffffff] border-[#ffeaa7] shadow-[0_0_10px_#ffbf33,0_0_20px_rgba(255,190,40,0.7)]'
                          : 'bg-[#291708] border-[#5e3814] shadow-inner'
                      }`}
                    >
                      {/* Glowing Core Filament */}
                      <div 
                        className={`w-1 h-1 rounded-full transition-colors duration-200 ${
                          isShelfLampOn ? 'bg-[#ffffff] shadow-[0_0_3px_#ffffff]' : 'bg-[#5e3914]'
                        }`}
                      />
                    </div>

                    {/* Soft Warm Radial Bloom when ON */}
                    {isShelfLampOn && (
                      <div className="absolute -inset-1.5 rounded-full bg-amber-300/35 filter blur-xs pointer-events-none animate-pulse" />
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Empty Search Result Notice */}
            {filteredBooks.length === 0 && (
              <div className="w-full py-10 flex flex-col items-center justify-center text-center px-4 z-20">
                <p className="text-xs sm:text-sm text-[#e8c89b] font-serif italic mb-2">
                  {t('emptySearch')} "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-[#ffd978] underline"
                >
                  {language === 'en' ? 'Show all books' : 'Tampilkan semua buku'}
                </button>
              </div>
            )}

            {/* TIER 1: Upper Shelf */}
            <div className="flex-1 min-h-0 flex flex-col justify-end relative pb-0.5">
              {/* Dynamic Downward Spotlight Cone on Upper Books */}
              <div 
                className={`absolute inset-x-0 top-0 h-44 pointer-events-none z-10 transition-opacity duration-700 ${
                  isShelfLampOn ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 220, 140, 0.32) 0%, rgba(255, 180, 60, 0.12) 50%, transparent 80%)',
                }}
              />

              {/* Row of Books - Horizontal scroll if many books */}
              <div className="flex-1 min-h-0 flex items-end justify-start gap-1 sm:gap-2.5 px-2 pb-0 overflow-x-auto overflow-y-hidden scrollbar-none z-10">
                {tier1Books.map((book, idx) => renderBookItem(book, idx, tier1Books.length))}
              </div>

              {/* Wooden Shelf Slab Ledge 1 */}
              <div className="w-full h-4 sm:h-5 wood-shelf-slab relative rounded-xs shrink-0">
                <div className="absolute top-0.5 left-2 brass-screw" />
                <div className="absolute top-0.5 right-2 brass-screw" />
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 brass-screw" />
              </div>
              <div className="w-full h-2 sm:h-2.5 wood-shelf-bevel shrink-0" />
            </div>

            {/* TIER 2: Lower Shelf */}
            <div className="flex-1 min-h-0 flex flex-col justify-end relative pb-0.5">
              {/* Row of Books - Horizontal scroll if many books */}
              <div className="flex-1 min-h-0 flex items-end justify-start gap-1 sm:gap-2.5 px-2 pb-0 overflow-x-auto overflow-y-hidden scrollbar-none z-10">
                {tier2Books.length > 0 ? (
                  tier2Books.map((book, idx) => renderBookItem(book, idx, tier2Books.length))
                ) : (
                  tier1Books.length > 0 && (
                    <div className="w-full h-16 sm:h-20 flex items-center justify-center opacity-40">
                      <span className="text-[11px] text-[#876a4f] italic">
                        {t('emptyShelf')}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Wooden Shelf Slab Ledge 2 */}
              <div className="w-full h-4 sm:h-5 wood-shelf-slab relative rounded-xs shrink-0">
                <div className="absolute top-0.5 left-2 brass-screw" />
                <div className="absolute top-0.5 right-2 brass-screw" />
                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 brass-screw" />
              </div>
              <div className="w-full h-2 sm:h-2.5 wood-shelf-bevel shrink-0" />
            </div>
          </main>

          {/* Right Wood Pillar with Interactive Sconce */}
          <aside className="w-7 sm:w-11 lg:w-13 wood-pillar-right flex flex-col justify-between items-center py-2 relative z-20 shrink-0 h-full">
            {/* Fluting Line Indents */}
            <div className="w-1 h-full bg-black/40 rounded-full border-l border-white/5 pointer-events-none" />
            <AntiqueSconce 
              side="right" 
              isOn={isRightSconceOn}
              onToggle={toggleRightSconce}
            />
          </aside>
        </div>

        {/* Lower Cabinet Panel (Wainscoting with Framed AD Box from Mockup) */}
        <section aria-label="Panel Lemari Bawah" className="w-full shrink-0 wainscot-wood py-1.5 px-3 sm:px-5 flex flex-col items-center justify-center relative select-none">
          {/* Framed Wooden Panel Inset */}
          <div 
            onClick={() => setIsAdModalOpen(true)}
            className="w-full max-w-xs sm:max-w-sm p-1 sm:p-1.5 rounded-lg bg-[#271206] border-2 border-[#69421c] shadow-[inset_0_2px_8px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.6)] cursor-pointer hover:border-[#a87834] transition duration-200 group"
          >
            {/* Inner Antique Parchment Card */}
            <div className="w-full py-1.5 sm:py-2 px-3 rounded bg-[#e8dac0] border border-[#a37937] shadow-inner text-center flex flex-col items-center justify-center relative overflow-hidden group-hover:bg-[#f2e7d3] transition">
              {/* Subtle vintage watermark background */}
              <div className="flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-[#5c3716] opacity-80 shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold font-serif text-[#2c1706] tracking-wide truncate">
                  {t('adBannerText')}
                </h2>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#6e4e2d] font-serif mt-0.5 truncate">
                {t('adBannerSub')}
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Antique Brass Rail & 3-Tab Navigation Bar */}
        <footer className="w-full shrink-0 bg-gradient-to-b from-[#1c0d05] to-[#0d0502] border-t border-[#4f2a11]">
          <AntiqueBottomBar 
            onOpenImport={onOpenImportModal}
            onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenCollection={() => setIsCatalogOpen(true)}
            isSearchActive={isSearchOpen}
          />
        </footer>
      </div>

      {/* Vintage Book Archive Catalog Modal */}
      <VintageBookCatalogModal 
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        books={books}
        onSelectBook={onSelectBook}
        onOpenImportModal={onOpenImportModal}
        onDeleteBook={onDeleteBook}
      />

      {/* Settings & Language Modal */}
      <AntiqueSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
      />

      {/* About Application Information Modal */}
      {isInfoOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsInfoOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-xl bg-gradient-to-b from-[#2d160a] to-[#120702] border-2 border-[#875d27] shadow-2xl p-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#5e3b18] pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/logo.jpg"
                  alt="Emblem Perpustakaan"
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border-2 border-[#d4af37] shadow-[0_2px_8px_rgba(0,0,0,0.8)] object-cover"
                />
                <div>
                  <h3 className="text-base font-bold font-display text-[#f5d77f]">
                    {t('infoTitle')}
                  </h3>
                  <p className="text-[10px] text-[#caa87f] font-serif">Antique Library Edition • Offline Ready</p>
                </div>
              </div>
              <button
                onClick={() => setIsInfoOpen(false)}
                className="p-1 rounded bg-[#381c0c] text-[#cfb697] hover:text-white"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#ebd7bc] font-serif leading-relaxed">
              <p>
                {t('infoDesc')}
              </p>
              <div className="p-2.5 rounded bg-[#1f0d04] border border-[#5e3814] space-y-1 text-[11px] text-[#caa87f]">
                <p>• <strong>{language === 'en' ? 'Local PDF Support' : 'Dukungan PDF Lokal'}</strong>: {language === 'en' ? 'Import documents directly from device storage.' : 'Muat dokumen PDF langsung dari perangkat.'}</p>
                <p>• <strong>{language === 'en' ? 'Realistic Page-Turn' : 'Lembaran Otentik'}</strong>: {language === 'en' ? 'Smooth page flip with audio sound effect.' : 'Efek membalik lembaran kertas dengan audio natural.'}</p>
                <p>• <strong>{language === 'en' ? 'PWA & Android' : 'PWA & Android'}</strong>: {language === 'en' ? 'Add to home screen for offline reading.' : 'Dapat dipasang ke layar utama HP.'}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#5e3b18] flex justify-end">
              <button
                onClick={() => setIsInfoOpen(false)}
                className="px-4 py-1.5 rounded text-xs font-serif font-bold text-[#200e04] bg-[#ffd978] hover:bg-[#fff]"
              >
                {language === 'en' ? 'Close' : 'Tutup'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AD / Sponsor Information Modal */}
      {isAdModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setIsAdModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm rounded-xl bg-gradient-to-b from-[#2d160a] to-[#120702] border-2 border-[#875d27] shadow-2xl p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-[#401f0d] border border-[#caa146] mx-auto flex items-center justify-center mb-3">
              <Coffee className="w-6 h-6 text-[#ffd978]" />
            </div>
            <h3 className="text-base font-bold font-display text-[#f5d77f] mb-1">
              {t('adBannerText')}
            </h3>
            <p className="text-xs text-[#caa87f] font-serif mb-4 leading-relaxed">
              {language === 'en'
                ? 'This space is reserved for local sponsorships and Google AdMob banners when publishing to the Google Play Store.'
                : 'Area ini disediakan untuk sponsor lokal dan slot banner Google AdMob saat aplikasi dirilis ke Google Play Store.'}
            </p>
            <button
              onClick={() => setIsAdModalOpen(false)}
              className="px-5 py-2 rounded text-xs font-serif font-bold text-[#200e04] bg-[#ffd978] hover:bg-[#fff]"
            >
              {language === 'en' ? 'Understood' : 'Mengerti'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Subroutine to render individual books (Spine vs Cover Mode)
  function renderBookItem(book: Book, idx: number, total: number) {
    if (displayMode === 'covers') {
      return (
        <div
          key={book.id}
          id={`book-cover-${book.id}`}
          onClick={() => onSelectBook(book)}
          className="group relative cursor-pointer select-none shrink-0 transition-transform duration-200 hover:-translate-y-1.5"
        >
          <div className="w-24 sm:w-32 h-32 sm:h-44 rounded-r-md rounded-l-xs bg-[#24140a] border-2 border-[#6c4820] shadow-xl overflow-hidden relative flex flex-col justify-between">
            {/* Book Spine Crease on Left */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/60 to-transparent z-20" />

            {book.coverDataUrl ? (
              <img
                src={book.coverDataUrl}
                alt={book.title}
                className="w-full h-full object-cover filter brightness-95 contrast-105"
              />
            ) : (
              <div 
                className="w-full h-full p-2 sm:p-2.5 flex flex-col justify-between"
                style={{ backgroundColor: book.spineColor }}
              >
                <div className="border border-[#d4af37]/40 p-1.5 h-full flex flex-col justify-between rounded">
                  <h3 className="text-[11px] sm:text-xs font-bold font-serif text-[#f8ecc2] line-clamp-2 sm:line-clamp-3 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-[#cbb393] font-serif italic truncate">
                    {book.author}
                  </p>
                </div>
              </div>
            )}

            {/* Reading Progress Badge */}
            <div className="absolute bottom-0 inset-x-0 bg-black/85 px-1.5 py-0.5 flex items-center justify-between text-[8px] sm:text-[9px] font-serif text-[#f5d77f] z-20">
              <span className="flex items-center gap-1 truncate">
                <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#d4af37] shrink-0" />
                <span>{book.currentPage}/{book.totalPages}</span>
              </span>
              <button
                id={`btn-delete-cover-${book.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBook(book.id, e);
                }}
                className="text-red-400 hover:text-red-200 p-0.5 transition active:scale-90"
                title={t('deleteBook')}
                aria-label={t('deleteBook')}
              >
                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default: Realistic 3D Antique Book Spine - Sized proportionally for single-screen view
    const spineHeight = Math.min(170, Math.max(126, 126 + ((book.title.length * 4) % 35)));
    const spineWidth = Math.min(48, Math.max(32, 30 + Math.floor(book.totalPages / 12)));
    const tiltStyle = getBookTiltStyle(idx, total);

    return (
      <div
        key={book.id}
        id={`book-spine-${book.id}`}
        onClick={() => onSelectBook(book)}
        style={tiltStyle}
        className="group relative cursor-pointer select-none shrink-0 transition-transform duration-200"
        title={`${book.title} • ${book.author}`}
      >
        {/* Bookmark ribbon hanging below */}
        {book.bookmarkPages.length > 0 && (
          <div 
            className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-2 h-5 bg-[#b22222] shadow-md z-30 pointer-events-none bookmark-ribbon"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%)' }}
          />
        )}

        {/* 3D Antique Spine */}
        <div
          className="book-spine-3d rounded-t-sm flex flex-col items-center justify-between py-2 px-1 relative overflow-hidden"
          style={{
            height: `${spineHeight}px`,
            width: `${spineWidth}px`,
            backgroundColor: book.spineColor,
            borderLeft: '1px solid rgba(255,255,255,0.18)',
            borderRight: '1px solid rgba(0,0,0,0.5)',
          }}
        >
          {/* Top Rib */}
          <div className="spine-rib" />

          {/* Top Emblem */}
          <div className="text-[8px] font-display text-center opacity-75 gold-foil">
            ✦
          </div>

          {/* Vertical Gold Title */}
          <div 
            className="flex-1 flex items-center justify-center py-1"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            <span 
              className="font-display text-[11px] sm:text-xs font-bold tracking-widest gold-foil uppercase truncate max-h-[125px]"
              style={{ color: book.accentColor }}
            >
              {book.title}
            </span>
          </div>

          {/* Middle Rib */}
          <div className="spine-rib my-0.5" />

          {/* Bottom Rib & Page count */}
          <div className="w-full flex flex-col items-center">
            <span className="text-[8px] text-[#f2dfb8] font-serif truncate w-full text-center opacity-70">
              {book.totalPages} {t('pagesUnit')}
            </span>
          </div>

          {/* Bottom Rib */}
          <div className="spine-rib mt-0.5" />
        </div>

        {/* Hover Tooltip Card */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 z-40 whitespace-nowrap bg-[#1c0d05] border border-[#b38539] p-1.5 rounded shadow-2xl text-center">
          <p className="text-[11px] font-serif font-bold text-[#f5d77f] max-w-[180px] truncate">
            {book.title}
          </p>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="text-[9px] text-[#a89073] font-serif">
              {book.fileType === 'pdf' ? t('localPdfTag') : t('classicManuscriptTag')}
            </span>
            <button
              id={`btn-delete-spine-${book.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteBook(book.id, e);
              }}
              className="text-[9px] text-red-400 hover:text-red-300 underline cursor-pointer flex items-center gap-0.5"
              title={t('deleteBook')}
            >
              <Trash2 className="w-2.5 h-2.5" />
              <span>{t('deleteBook')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
};
