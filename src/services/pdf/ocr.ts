/**
 * OCR for scanned / image-only PDF pages.
 * Uses Tesseract.js in the browser (English + Arabic + Urdu).
 */

import { createWorker, type Worker } from 'tesseract.js';
import { pageHasUsableText } from './documentType';

export interface OcrPageRequest {
  pageNum: number;
  /** Canvas or image source for OCR */
  image: HTMLCanvasElement | string;
}

export interface OcrPageResult {
  pageNum: number;
  text: string;
  engine?: string;
  languages?: Array<'en' | 'ar' | 'ur'>;
}

export interface OcrProvider {
  readonly name: string;
  isAvailable(): boolean;
  init?(onStatus?: (msg: string) => void): Promise<void>;
  recognizePage(request: OcrPageRequest): Promise<OcrPageResult>;
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
    if (!this.worker) {
      return { pageNum: request.pageNum, text: '', engine: this.name };
    }

    const { data } = await this.worker.recognize(request.image);
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
    };
  }

  async terminate(): Promise<void> {
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
