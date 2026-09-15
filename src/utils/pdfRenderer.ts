import * as pdfjsLib from 'pdfjs-dist';
// Import worker directly so Vite bundles it locally for 100% offline Capacitor APK support
import localWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure pdfjs worker: prefer local bundled worker for offline APK, fallback to CDN if needed
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerUrl || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }
}

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string; // Can be a Blob URL (blob:...) or data URL for maximum RAM efficiency
  width: number;
  height: number;
  isBlobUrl?: boolean;
}

export class PdfService {
  /**
   * Free memory of rendered Blob URL when no longer in view
   */
  static revokePageUrl(url: string) {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // silent
      }
    }
  }

  /**
   * Load a PDF document from ArrayBuffer
   */
  static async loadDocument(arrayBuffer: ArrayBuffer) {
    // Clone buffer using slice(0) so worker transfer doesn't detach caller's ArrayBuffer
    const safeBuffer = arrayBuffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(safeBuffer),
      cMapPacked: true,
    });
    return await loadingTask.promise;
  }

  /**
   * Render a specific page to an HTML Canvas with dynamic screen optimization.
   * Uses Blob URL (instead of huge Base64 strings) to reduce RAM usage by up to 60% on Android.
   */
  static async renderPageToDataUrl(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    targetWidth: number = 1000,
    fastMode: boolean = false
  ): Promise<RenderedPdfPage> {
    const page = await pdfDoc.getPage(pageNumber);
    const originalViewport = page.getViewport({ scale: 1 });
    
    // Dynamic width capped to device resolution to prevent mobile RAM spikes
    const screenWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth * 2, targetWidth) : targetWidth;
    const maxBound = fastMode ? 800 : 1300;
    const optimalWidth = Math.max(500, Math.min(screenWidth, maxBound));

    const scale = Math.max(0.8, optimalWidth / originalViewport.width);
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

    // Convert to Blob URL for instant rendering and minimal memory pressure
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            resolve({
              pageNumber,
              dataUrl: blobUrl,
              width: canvas.width,
              height: canvas.height,
              isBlobUrl: true,
            });
          } else {
            // Fallback to dataURL if toBlob is unsupported
            resolve({
              pageNumber,
              dataUrl: canvas.toDataURL('image/jpeg', fastMode ? 0.75 : 0.85),
              width: canvas.width,
              height: canvas.height,
              isBlobUrl: false,
            });
          }
        },
        'image/jpeg',
        fastMode ? 0.75 : 0.85
      );
    });
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
