import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import { Book } from '../types';
import { useLanguage } from '../utils/i18n';

interface AntiqueDeleteConfirmModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export const AntiqueDeleteConfirmModal: React.FC<AntiqueDeleteConfirmModalProps> = ({
  isOpen,
  book,
  onClose,
  onConfirm,
}) => {
  const { language } = useLanguage();

  if (!isOpen || !book) return null;

  const handleConfirm = () => {
    onConfirm(book.id);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm rounded-xl bg-gradient-to-b from-[#2d1408] via-[#200e05] to-[#140803] border-2 border-[#a64b38] shadow-2xl p-5 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brass Corner Screws */}
        <div className="absolute top-2 left-2 brass-screw" />
        <div className="absolute top-2 right-2 brass-screw" />
        <div className="absolute bottom-2 left-2 brass-screw" />
        <div className="absolute bottom-2 right-2 brass-screw" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#5e3818] pb-3 mb-4">
          <div className="flex items-center gap-2 text-[#ff9980]">
            <AlertTriangle className="w-5 h-5 text-[#ff7755]" />
            <h3 className="text-sm sm:text-base font-bold font-display text-[#ffd0c2] tracking-wide">
              {language === 'en' ? 'Remove Book from Shelf?' : 'Hapus Buku dari Rak?'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-[#381c0c] text-[#cfb697] hover:text-white transition"
            aria-label="Batal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Book Preview Card */}
        <div className="p-3 rounded-lg bg-[#1a0c04] border border-[#542d13] mb-4 flex items-center gap-3">
          {/* Miniature Spine */}
          <div 
            className="w-7 h-11 rounded-xs border border-[#ffd978]/30 shadow-sm flex flex-col justify-between p-0.5 shrink-0"
            style={{ backgroundColor: book.spineColor || '#4a2511' }}
          >
            <div className="w-full h-0.5 bg-[#ffd978]/40" />
            <div className="w-full h-0.5 bg-[#ffd978]/40" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-bold font-serif text-[#fbe9d0] truncate">
              {book.title}
            </h4>
            <p className="text-[10px] text-[#b39575] font-serif italic truncate mt-0.5">
              {book.author}
            </p>
            <span className="text-[9px] text-[#8c6d4d] font-serif">
              {book.totalPages} {language === 'en' ? 'pages' : 'halaman'} • {book.fileType === 'pdf' ? 'PDF' : 'Klasik'}
            </span>
          </div>
        </div>

        {/* Explanatory Note */}
        <p className="text-xs text-[#cfb497] font-serif leading-relaxed mb-5">
          {language === 'en'
            ? 'Are you sure you want to remove this manuscript from your bookshelf? It will be cleared from your library shelves.'
            : 'Apakah Anda yakin ingin menyingkirkan naskah ini dari rak buku? Buku ini akan dikeluarkan dari rak perpustakaan Anda.'}
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 rounded-lg bg-[#271408] border border-[#523013] text-[#e0cfb8] hover:bg-[#381c0c] text-xs font-serif font-bold transition active:scale-95"
          >
            {language === 'en' ? 'Cancel' : 'Batal'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="py-2 px-3 rounded-lg bg-gradient-to-r from-[#8a2416] to-[#b33624] hover:from-[#9c2b1a] hover:to-[#c73e29] border border-[#e05c48] text-white text-xs font-serif font-bold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Remove Book' : 'Hapus dari Rak'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
