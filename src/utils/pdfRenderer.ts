import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  // Use official CDN worker matching pdfjs-dist version or standard worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

export class PdfService {
  /**
   * Load a PDF document from ArrayBuffer
   */
  static async loadDocument(arrayBuffer: ArrayBuffer) {
    // Clone buffer using slice(0) so worker transfer doesn't detach caller's ArrayBuffer
    const safeBuffer = arrayBuffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(safeBuffer),
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@legacy/cmaps/',
      cMapPacked: true,
    });
    return await loadingTask.promise;
  }

  /**
   * Render a specific page to an HTML Canvas with dynamic screen optimization
   * Designed for ultra-fast, lightweight mobile rendering across low-to-high end devices
   */
  static async renderPageToDataUrl(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    targetWidth: number = 1000
  ): Promise<RenderedPdfPage> {
    const page = await pdfDoc.getPage(pageNumber);
    const originalViewport = page.getViewport({ scale: 1 });
    
    // Dynamic width capped to device resolution to prevent mobile RAM spikes
    const screenWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 2, targetWidth) : targetWidth;
    const optimalWidth = Math.max(600, Math.min(screenWidth, 1400));

    const scale = Math.max(1, optimalWidth / originalViewport.width);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    if (!context) {
      throw new Error('Canvas 2D context unavailable');
    }

    // Fill background with warm vintage paper base tint
    context.fillStyle = '#f8f3e6';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    return {
      pageNumber,
      // 0.88 quality achieves clear crisp text when zoomed
      dataUrl: canvas.toDataURL('image/jpeg', 0.88),
      width: canvas.width,
      height: canvas.height,
    };
  }

  /**
   * Extract basic metadata and cover from PDF
   */
  static async getPdfSummary(arrayBuffer: ArrayBuffer) {
    const pdfDoc = await this.loadDocument(arrayBuffer);
    const totalPages = pdfDoc.numPages;
    
    let title = '';
    try {
      const metadata = await pdfDoc.getMetadata();
      const info = metadata.info as Record<string, unknown> | undefined;
      if (info && typeof info.Title === 'string' && info.Title.trim().length > 0) {
        title = info.Title.trim();
      }
    } catch {
      // fallback
    }

    // Render first page as cover thumbnail
    const coverPage = await this.renderPageToDataUrl(pdfDoc, 1, 400);

    return {
      totalPages,
      title,
      coverDataUrl: coverPage.dataUrl,
    };
  }
}
