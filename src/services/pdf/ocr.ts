/**
 * OCR for scanned / image-only PDF pages.
 * Uses Tesseract.js in the browser (English + Arabic + Urdu).
 */

import { createWorker, PSM, type Worker } from 'tesseract.js';
import { pageHasUsableText } from './documentType';
import type { PdfTextItem } from './layout';

export interface OcrPageRequest {
  pageNum: number;
  /** Canvas or image source for OCR */
  image: HTMLCanvasElement | string;
  /** Render scale of the image — positioned items are returned in PDF units (÷ scale) */
  scale?: number;
  /**
   * English only: used to repair damaged fonts and read chapter banners. The
   * Arabic models misread Latin text there (e.g. "(65)" comes back as ")56(").
   */
  englishOnly?: boolean;
}

export interface OcrPageResult {
  pageNum: number;
  text: string;
  engine?: string;
  languages?: Array<'en' | 'ar' | 'ur'>;
  /** Recognised words with positions — fed through the same layout engine as PDF text */
  items?: PdfTextItem[];
  /** Recognised words in canvas pixels (used to repair damaged fonts) */
  words?: Array<{ text: string; bbox: OcrBox }>;
}

export interface OcrRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface OcrBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface OcrLine {
  bbox: OcrBox;
  rowAttributes?: { row_height?: number };
  words: Array<{ text: string; bbox: OcrBox; direction?: string; confidence?: number }>;
}

/**
 * Convert Tesseract lines/words into PDF.js-style text items (y grows upwards,
 * font size = line height) so columns, headings and paragraphs are detected
 * exactly like on a normal text PDF.
 */
export function ocrLinesToItems(lines: OcrLine[], scale = 1): PdfTextItem[] {
  const pageHeight = (Math.max(0, ...lines.map((l) => l.bbox.y1)) + 10) / scale;
  const items: PdfTextItem[] = [];
  for (const line of lines) {
    // Same units as PDF text (points), so font sizes compare with the rest of the book
    const size = Math.max(4, ((line.bbox.y1 - line.bbox.y0) * 0.8) / scale);
    const baseline = pageHeight - line.bbox.y1 / scale;
    for (const word of line.words) {
      const str = word.text.trim();
      if (!str || (word.confidence ?? 100) < 20) continue;
      items.push({
        str,
        transform: [size, 0, 0, size, word.bbox.x0 / scale, baseline],
        width: (word.bbox.x1 - word.bbox.x0) / scale,
        height: size,
        dir: word.direction === 'RIGHT_TO_LEFT' ? 'rtl' : 'ltr',
      });
    }
  }
  return items;
}

export interface OcrProvider {
  readonly name: string;
  isAvailable(): boolean;
  init?(onStatus?: (msg: string) => void): Promise<void>;
  recognizePage(request: OcrPageRequest): Promise<OcrPageResult>;
  /** Read a single line of text inside a rectangle of the image (e.g. a chapter banner) */
  recognizeRegion?(image: HTMLCanvasElement | string, rectangle: OcrRectangle): Promise<string>;
  terminate?(): Promise<void>;
}

export class NullOcrProvider implements OcrProvider {
  readonly name = 'none';
  isAvailable(): boolean {
    return false;
  }
  async recognizePage(request: OcrPageRequest): Promise<OcrPageResult> {
    return { pageNum: request.pageNum, text: '', engine: this.name };
  }
}

/**
 * Browser Tesseract OCR — English, Arabic, Urdu language packs.
 * One shared worker for the whole import job.
 */
export class TesseractOcrProvider implements OcrProvider {
  readonly name = 'tesseract';
  private worker: Worker | null = null;
  private initPromise: Promise<void> | null = null;
  private englishWorker: Promise<Worker> | null = null;

  /** Separate English-only engine (loaded on first use) */
  private getEnglishWorker(): Promise<Worker> {
    if (!this.englishWorker) {
      this.englishWorker = createWorker('eng', 1).catch((err) => {
        this.englishWorker = null;
        throw err;
      });
    }
    return this.englishWorker;
  }

  isAvailable(): boolean {
    return typeof window !== 'undefined';
  }

  async init(onStatus?: (msg: string) => void): Promise<void> {
    if (this.worker) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      onStatus?.('Loading OCR engine (English, Arabic, Urdu)…');
      // eng+ara covers most Islamic books; urd improves Urdu orthography
      this.worker = await createWorker('eng+ara+urd', 1, {
        logger: (m) => {
          if (m.status === 'loading language traineddata' && typeof m.progress === 'number') {
            onStatus?.(
              `Loading OCR languages… ${Math.round(m.progress * 100)}%`,
            );
          }
        },
      });
      onStatus?.('OCR engine ready');
    })();

    try {
      await this.initPromise;
    } catch (err) {
      this.initPromise = null;
      this.worker = null;
      throw err;
    }
  }

  async recognizePage(request: OcrPageRequest): Promise<OcrPageResult> {
    if (!this.worker) {
      await this.init();
    }
    const worker = request.englishOnly ? await this.getEnglishWorker() : this.worker;
    if (!worker) {
      return { pageNum: request.pageNum, text: '', engine: this.name };
    }

    const { data } = await worker.recognize(request.image, {}, { text: true, blocks: true });
    const text = (data.text || '')
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      pageNum: request.pageNum,
      text,
      engine: this.name,
      languages: ['en', 'ar', 'ur'],
      items: data.lines?.length ? ocrLinesToItems(data.lines as unknown as OcrLine[], request.scale ?? 1) : undefined,
      words: (data.words ?? []).map((w) => ({ text: w.text, bbox: w.bbox })),
    };
  }

  async recognizeRegion(image: HTMLCanvasElement | string, rectangle: OcrRectangle): Promise<string> {
    // Banners are Latin transliteration: English engine, single text line mode
    const worker = await this.getEnglishWorker();
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE });
    try {
      const { data } = await worker.recognize(image, { rectangle });
      return (data.text || '').replace(/\s+/g, ' ').trim();
    } finally {
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
    }
  }

  async terminate(): Promise<void> {
    if (this.englishWorker) {
      const english = this.englishWorker;
      this.englishWorker = null;
      await (await english).terminate().catch(() => {});
    }
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initPromise = null;
    }
  }
}

let activeProvider: OcrProvider = new TesseractOcrProvider();

export function getOcrProvider(): OcrProvider {
  return activeProvider;
}

export function setOcrProvider(provider: OcrProvider): void {
  activeProvider = provider;
}

export function formatOcrPageRanges(pageNums: number[]): string {
  if (pageNums.length === 0) return '';
  const sorted = [...new Set(pageNums)].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    const cur = sorted[i];
    if (cur === prev + 1) {
      prev = cur;
      continue;
    }
    ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
    start = cur!;
    prev = cur!;
  }

  return ranges.join(', ');
}

export function buildOcrWarning(pageNums: number[]): string | null {
  if (pageNums.length === 0) return null;
  const ranges = formatOcrPageRanges(pageNums);
  return `⚠ Pages ${ranges} contain scanned/image content and require OCR.`;
}

export function buildOcrCompletedNote(ocrPageNums: number[], failedPageNums: number[]): string[] {
  const notes: string[] = [];
  if (ocrPageNums.length > 0) {
    notes.push(
      `OCR applied to ${ocrPageNums.length} page(s) (${formatOcrPageRanges(ocrPageNums)}). Please review text accuracy.`,
    );
  }
  if (failedPageNums.length > 0) {
    notes.push(
      `⚠ OCR could not read pages ${formatOcrPageRanges(failedPageNums)} — those pages may still be blank.`,
    );
  }
  return notes;
}

/** True when OCR output is usable enough to replace empty PDF.js text. */
export function ocrTextIsUsable(text: string): boolean {
  return pageHasUsableText(text);
}
