export type ReadingTheme = 'parchment' | 'sepia' | 'night' | 'emerald' | 'romantic';

export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  coverDataUrl: string;
  fileSize: string;
  addedDate: number;
  lastReadDate: number;
  spineColor: string;
  spineTexture?: 'leather' | 'cloth' | 'worn';
  accentColor: string;
  bookmarkPages: number[];
  fileType: 'pdf' | 'sample';
  sampleContent?: SamplePage[];
}

export interface SamplePage {
  pageNumber: number;
  chapterTitle?: string;
  heading?: string;
  content: string[];
  illustration?: string;
}

export type ShelfDisplayMode = 'spines' | 'covers';

export type PdfBlendMode = 'parchment' | 'sepia' | 'night' | 'original';

export interface ReaderSettings {
  theme: ReadingTheme;
  brightness: number; // 0.4 to 1.0
  fontSize: number; // 14 to 28px
  zoomLevel: number; // 0.8 to 2.5 (1.0 = 100%)
  pdfBlendMode: PdfBlendMode;
  soundEnabled: boolean;
  spreadMode: 'single' | 'double' | 'auto';
  autoPageTurn: boolean;
}
