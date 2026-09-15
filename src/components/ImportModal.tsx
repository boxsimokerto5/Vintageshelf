import React, { useState, useRef } from 'react';
import { Upload, X, BookOpen, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { PdfService } from '../utils/pdfRenderer';
import { saveBookRecord } from '../utils/storage';
import { Book } from '../types';
import { useLanguage } from '../utils/i18n';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookAdded: (newBook: Book) => void;
}

const SPINE_COLOR_PALETTES = [
  { key: 'paletteBurgundy', nameId: 'Burgundy Kuno', nameEn: 'Aged Burgundy', hex: '#631f17', accent: '#d4af37' },
  { key: 'paletteNavy', nameId: 'Navy Ningrat', nameEn: 'Noble Navy', hex: '#1c2e42', accent: '#e5c158' },
  { key: 'paletteEmerald', nameId: 'Zamrud Hutan', nameEn: 'Velvet Forest', hex: '#1c3d25', accent: '#d8b671' },
  { key: 'paletteCharcoal', nameId: 'Arang Gelap', nameEn: 'Obsidian Black', hex: '#262220', accent: '#c9a050' },
  { key: 'paletteCognac', nameId: 'Kayu Cognac', nameEn: 'Antique Cognac', hex: '#542911', accent: '#f3d38c' },
  { key: 'paletteGold', nameId: 'Kuning Kuningan', nameEn: 'Imperial Gold', hex: '#7a5a1e', accent: '#fff0a8' },
];

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onBookAdded }) => {
  const { t, language } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [selectedColor, setSelectedColor] = useState(SPINE_COLOR_PALETTES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewCover, setPreviewCover] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setError(t('pdfOnlyError'));
      return;
    }

    setError(null);
    setLoading(true);
    setFile(selectedFile);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      // Extract PDF summary & first page cover with cloned slice
      const summary = await PdfService.getPdfSummary(arrayBuffer.slice(0));
      setTotalPages(summary.totalPages);
      setPreviewCover(summary.coverDataUrl);
      
      // Auto-fill title from filename or PDF metadata
      const cleanName = selectedFile.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      setTitle(summary.title || cleanName);
      setAuthor(language === 'en' ? 'Personal Collection' : 'Koleksi Pribadi');
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError(t('loadPdfError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!file || totalPages === 0) {
      setError(t('selectPdfError'));
      return;
    }

    try {
      setLoading(true);
      const newBook: Book = {
        id: `pdf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim() || t('untitledBook'),
        author: author.trim() || t('anonymousAuthor'),
        totalPages,
        currentPage: 1,
        coverDataUrl: previewCover || '',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        addedDate: Date.now(),
        lastReadDate: Date.now(),
        spineColor: selectedColor.hex,
        spineTexture: 'leather',
        accentColor: selectedColor.accent,
        bookmarkPages: [],
        fileType: 'pdf',
      };

      // Pass the File object (which is an immutable Blob) to guarantee it can never be detached
      await saveBookRecord(newBook, file);
      onBookAdded(newBook);
      onClose();
    } catch (err) {
      console.error('Error saving book:', err);
      setError(t('saveError') + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="import-modal-card"
        className="w-full max-w-lg rounded-xl bg-[#23140a] border-2 border-[#8f6429] p-6 shadow-2xl relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.1) 0%, transparent 80%)'
        }}
      >
        {/* Brass Header Plate */}
        <div className="flex items-center justify-between border-b border-[#63441c] pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#3b2010] border border-[#d4af37] flex items-center justify-center shadow-inner">
              <BookOpen className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f5d77f] font-serif tracking-wide">
                {t('importModalTitle')}
              </h2>
              <p className="text-xs text-[#b89f7f]">{t('importModalSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#3a2012] border border-[#754e1e] flex items-center justify-center text-[#c9a66b] hover:text-[#fff] hover:bg-[#522f18] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-serif">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Dropzone */}
        {!file ? (
          <div
            id="pdf-dropzone"
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-7 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              dragActive 
                ? 'border-[#d4af37] bg-[#3a2211]/80 scale-[1.01]' 
                : 'border-[#6c4820] bg-[#1a0e07]/70 hover:border-[#a67b36] hover:bg-[#2c170b]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
                <span className="text-xs font-serif text-[#d6be9a]">{t('processingPdf')}</span>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-[#381f10] border border-[#a17830] flex items-center justify-center mb-3 shadow-lg">
                  <Upload className="w-6 h-6 text-[#d4af37]" />
                </div>
                <p className="text-sm font-serif font-semibold text-[#f8ecc2]">
                  {t('dropzoneTitle')}
                </p>
                <p className="text-xs text-[#aa9175] mt-1 max-w-xs">
                  {t('dropzoneDesc')}
                </p>
                <span className="mt-3 inline-block px-3 py-1 rounded bg-[#331c0e] border border-[#7e5520] text-[11px] text-[#e5c789] font-serif">
                  {t('dropzoneSupported')}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* File loaded preview */}
            <div className="flex items-center gap-4 p-3 rounded-lg bg-[#180e07] border border-[#6b471f]">
              {previewCover ? (
                <img
                  src={previewCover}
                  alt="Cover preview"
                  className="w-14 h-18 object-cover rounded shadow-md border border-[#8f6429]"
                />
              ) : (
                <div className="w-14 h-18 bg-[#331c0e] rounded flex items-center justify-center border border-[#6b471f]">
                  <BookOpen className="w-6 h-6 text-[#d4af37]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#a38768]">{t('selectedDoc')} ({totalPages} {t('pagesUnit')})</p>
                <p className="text-sm font-semibold text-[#f5d77f] truncate font-serif">{file.name}</p>
                <p className="text-xs text-[#8f7556]">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewCover(null);
                  setTotalPages(0);
                }}
                className="text-xs text-[#bf9b68] hover:text-[#f5d77f] underline"
              >
                {t('changeFile')}
              </button>
            </div>

            {/* Book Info Inputs */}
            <div>
              <label className="block text-xs font-serif text-[#d6be9a] mb-1">{t('bookTitleLabel')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('bookTitlePlaceholder')}
                className="w-full px-3 py-2 rounded bg-[#180e07] border border-[#6b471f] text-[#f8ecc2] text-sm font-serif focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif text-[#d6be9a] mb-1">{t('bookAuthorLabel')}</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={t('bookAuthorPlaceholder')}
                className="w-full px-3 py-2 rounded bg-[#180e07] border border-[#6b471f] text-[#f8ecc2] text-sm font-serif focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {/* Spine Color Selection */}
            <div>
              <label className="block text-xs font-serif text-[#d6be9a] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{t('spineColorLabel')}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SPINE_COLOR_PALETTES.map((palette) => (
                  <button
                    key={palette.hex}
                    type="button"
                    onClick={() => setSelectedColor(palette)}
                    className={`flex items-center gap-2 p-2 rounded border text-left transition ${
                      selectedColor.hex === palette.hex
                        ? 'border-[#d4af37] bg-[#3a2012] shadow-sm'
                        : 'border-[#543516] bg-[#1a0e07] hover:border-[#8f6429]'
                    }`}
                  >
                    <span
                      className="w-4 h-6 rounded-xs shadow-inner shrink-0 border border-black/40"
                      style={{ backgroundColor: palette.hex }}
                    />
                    <span className="text-[11px] font-serif text-[#d9c4a7] truncate">
                      {language === 'en' ? palette.nameEn : palette.nameId}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-[#63441c] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif font-medium text-[#bfa482] hover:text-[#fff] transition"
          >
            {t('cancelBtn')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!file || loading || totalPages === 0}
            className="px-5 py-2 text-xs font-serif font-bold text-[#201004] bg-gradient-to-r from-[#e3bf60] via-[#ffd978] to-[#c79a32] rounded shadow-lg hover:brightness-110 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{t('displayOnShelfBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
