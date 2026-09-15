import React, { useState } from 'react';
import { 
  X, 
  Search, 
  BookOpen, 
  Trash2, 
  Library, 
  Plus, 
  FileText, 
  Bookmark,
  Sparkles
} from 'lucide-react';
import { Book } from '../types';
import { useLanguage } from '../utils/i18n';

interface VintageBookCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  onSelectBook: (book: Book) => void;
  onOpenImportModal: () => void;
  onDeleteBook: (id: string, e: React.MouseEvent) => void;
}

export const VintageBookCatalogModal: React.FC<VintageBookCatalogModalProps> = ({
  isOpen,
  onClose,
  books,
  onSelectBook,
  onOpenImportModal,
  onDeleteBook,
}) => {
  const { t, language } = useLanguage();
  const [catalogQuery, setCatalogQuery] = useState('');

  if (!isOpen) return null;

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(catalogQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(catalogQuery.toLowerCase())
  );

  const totalPagesSum = books.reduce((acc, b) => acc + (b.totalPages || 0), 0);

  const handleBookClick = (book: Book) => {
    onSelectBook(book);
    onClose();
  };

  const handleAddClick = () => {
    onClose();
    onOpenImportModal();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-xl bg-gradient-to-b from-[#2a1307] via-[#1f0d04] to-[#120702] border-2 border-[#855c25] shadow-[0_15px_50px_rgba(0,0,0,0.95)] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brass Corner Screws */}
        <div className="absolute top-2 left-2 brass-screw z-20" />
        <div className="absolute top-2 right-2 brass-screw z-20" />
        <div className="absolute bottom-2 left-2 brass-screw z-20" />
        <div className="absolute bottom-2 right-2 brass-screw z-20" />

        {/* Ornate Header */}
        <div className="relative shrink-0 px-4 sm:px-6 pt-4 pb-3 border-b border-[#5e3816] bg-[#220f05] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6b4710] via-[#ffd978] to-[#9c711a] p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#271408] flex items-center justify-center">
                <Library className="w-4 h-4 text-[#ffd978]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold font-display text-[#ffd978] tracking-wider uppercase">
                  {t('catalogTitle')}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#3d200d] border border-[#7a4c1e] text-[#e8c89b]">
                  {books.length} {t('catalogBookUnit')}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#baa080] font-serif italic">
                {t('catalogSubtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#381c0c] border border-[#6f481f] text-[#cfb697] hover:text-[#fff] hover:bg-[#4d2710] transition active:scale-95"
            aria-label="Tutup Katalog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Vintage Parchment Search Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 bg-[#1a0c04] border-b border-[#47260d]">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8a6840] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={catalogQuery}
              onChange={(e) => setCatalogQuery(e.target.value)}
              placeholder={t('catalogSearchPlaceholder')}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#271408] border border-[#5a3615] text-[#faedd4] placeholder-[#7d5d3b] text-xs font-serif focus:outline-none focus:border-[#c4983b] focus:ring-1 focus:ring-[#c4983b] transition"
            />
            {catalogQuery && (
              <button
                onClick={() => setCatalogQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a88863] hover:text-[#ffd978] p-0.5"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Catalog Ledger List (Scrollable, Clean & Organized) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-2.5 scrollbar-thin">
          {filteredBooks.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <BookOpen className="w-10 h-10 text-[#543417] mb-2 stroke-[1.5]" />
              <p className="text-xs sm:text-sm text-[#caa67f] font-serif italic mb-3">
                {catalogQuery ? `${t('emptySearch')} "${catalogQuery}"` : t('catalogEmpty')}
              </p>
              {catalogQuery ? (
                <button
                  onClick={() => setCatalogQuery('')}
                  className="text-xs text-[#ffd978] underline"
                >
                  {language === 'en' ? 'Show all books' : 'Tampilkan seluruh arsip'}
                </button>
              ) : (
                <button
                  onClick={handleAddClick}
                  className="px-3 py-1.5 rounded bg-[#4d2810] border border-[#8a5d28] text-[#ffd978] text-xs font-serif hover:bg-[#633415] transition"
                >
                  {t('catalogAddBook')}
                </button>
              )}
            </div>
          ) : (
            filteredBooks.map((book, idx) => {
              const progressPercent = Math.min(100, Math.round((book.currentPage / (book.totalPages || 1)) * 100));
              const isPdf = book.fileType === 'pdf';
              const indexFormatted = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={book.id}
                  id={`catalog-book-item-${book.id}`}
                  onClick={() => handleBookClick(book)}
                  className="group relative rounded-lg bg-gradient-to-r from-[#eadecb] via-[#f4ecd8] to-[#eee4ce] border border-[#af8951] shadow-md p-2.5 sm:p-3 flex items-center justify-between gap-3 cursor-pointer hover:border-[#dfba6d] hover:shadow-[0_4px_14px_rgba(0,0,0,0.45)] hover:-translate-y-0.5 transition-all duration-150"
                >
                  {/* Left Section: Index Number + Spine/Cover Swatch */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    {/* Index Number Stamp */}
                    <div className="shrink-0 w-7 text-center">
                      <span className="text-[11px] font-mono font-bold text-[#7d562b] opacity-80">
                        №{indexFormatted}
                      </span>
                    </div>

                    {/* Miniature Book Spine/Cover Swatch */}
                    <div 
                      className="w-7 sm:w-8 h-10 sm:h-12 rounded-xs border border-[#381c0c]/60 shadow-inner flex flex-col justify-between p-0.5 relative overflow-hidden shrink-0"
                      style={{ backgroundColor: book.spineColor || '#522915' }}
                    >
                      <div className="w-full h-0.5 bg-[#ffd978]/40" />
                      <div className="w-full h-0.5 bg-[#ffd978]/40" />
                    </div>

                    {/* Book Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold font-serif text-[#2a1408] truncate group-hover:text-[#6e370a] transition">
                          {book.title}
                        </h4>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-xs font-serif shrink-0 border ${
                          isPdf 
                            ? 'bg-[#ffe8b3] text-[#6b4712] border-[#c29640]' 
                            : 'bg-[#d8c2a3] text-[#4d2f13] border-[#9c784e]'
                        }`}>
                          {isPdf ? t('localPdfTag') : t('classicManuscriptTag')}
                        </span>
                      </div>

                      <p className="text-[10px] sm:text-[11px] text-[#634526] font-serif italic truncate mt-0.5">
                        {book.author}
                      </p>

                      {/* Reading Progress Indicator */}
                      <div className="mt-1 flex items-center gap-2 max-w-[200px] sm:max-w-xs">
                        <div className="flex-1 h-1.5 bg-[#cbbaa2] rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-[#a87428] to-[#e0b04a] rounded-full"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-[#5c3e1e] shrink-0 font-medium">
                          {book.currentPage}/{book.totalPages} {t('pagesUnit')} ({progressPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Read Book Button */}
                    <button
                      onClick={() => handleBookClick(book)}
                      className="px-2.5 py-1.5 rounded bg-[#331707] hover:bg-[#4d230b] text-[#ffd978] text-[11px] font-serif font-bold flex items-center gap-1 shadow-sm border border-[#784f1d] active:scale-95 transition"
                      title={t('catalogOpenBook')}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#ffd978]" />
                      <span className="hidden sm:inline">{t('catalogOpenBook')}</span>
                    </button>

                    {/* Delete Book from Shelf Button */}
                    <button
                      id={`btn-catalog-delete-${book.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBook(book.id, e);
                      }}
                      className="p-1.5 rounded text-[#9c4232] hover:text-red-700 hover:bg-red-200/50 transition active:scale-95 border border-transparent hover:border-red-400/40"
                      title={t('deleteBook')}
                      aria-label={t('deleteBook')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ledger Bottom Summary Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-2.5 border-t border-[#4f290e] bg-[#1a0c04] flex items-center justify-between text-[#cbb193] text-xs font-serif">
          <div className="flex items-center gap-2">
            <span className="text-[11px]">
              {t('catalogTotalBooks')}: <strong className="text-[#ffd978]">{books.length}</strong> {t('catalogBookUnit')}
            </span>
            <span className="text-[#5e3816]">•</span>
            <span className="text-[11px] hidden sm:inline">
              <strong className="text-[#ffd978]">{totalPagesSum}</strong> {t('pagesUnit')}
            </span>
          </div>

          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-[#6e4610] to-[#9c711a] hover:from-[#7e5214] hover:to-[#b0801e] text-[#fff] text-[11px] font-serif font-bold border border-[#fce092]/40 shadow-sm active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('catalogAddBook')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
