/**
 * pdfExtractor.ts
 * Browser-side PDF text extraction using pdfjs-dist + Tesseract OCR fallback.
 *
 * Memory model: incremental page-by-page extraction.
 * Each PDFPageProxy is released after text (or OCR) is read.
 */

import type { ContentBlock, BookChapter, BookSection } from '@/types';
import { runPipeline } from '@/services/pdf/pipeline';
import { textToContentBlocks } from '@/services/pdf/toContentBlocks';
import type {
  ExtractionMeta,
  PipelineProgressCallback,
} from '@/services/pdf/types';
import { validateBookPdfFile } from '@/lib/uploadLimits';
import { pageHasUsableText } from '@/services/pdf/documentType';
import {
  getOcrProvider,
  ocrTextIsUsable,
} from '@/services/pdf/ocr';

async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();
  return pdfjsLib;
}

export interface RawPage {
  pageNum: number;
  text: string;
  /** True when text came from OCR rather than PDF.js */
  fromOcr?: boolean;
  /** Marked when PDF.js found little/no usable text (before/without OCR) */
  requiresOcr?: boolean;
}

export interface DetectedMeta {
  title: string;
  author: string;
  description: string;
  hijriStart?: number;
  hijriEnd?: number;
}

export interface DetectedSection {
  number: string;
  title: string;
  rawText: string;
}

export interface DetectedChapter {
  number: string;
  title: string;
  description: string;
  rawText: string;
  sections: DetectedSection[];
}

export interface ParsedBook {
  meta: DetectedMeta;
  introductionText: string;
  chapters: DetectedChapter[];
  pageCount: number;
  wordCount: number;
  extraction?: ExtractionMeta;
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export function textContentToLines(
  items: Array<{ str?: string; transform?: number[]; hasEOL?: boolean; width?: number }>,
): string {
  type Glyph = { str: string; x: number; y: number; hasEOL?: boolean };
  const glyphs: Glyph[] = [];

  for (const item of items) {
    if (!item || typeof item.str !== 'string') continue;
    const str = item.str;
    if (!str) continue;
    const transform = item.transform;
    const x = transform?.[4] ?? 0;
    const y = transform?.[5] ?? 0;
    glyphs.push({ str, x, y, hasEOL: item.hasEOL });
  }

  if (glyphs.length === 0) return '';

  const Y_TOLERANCE = 2.5;
  const lines: Glyph[][] = [];
  const sorted = [...glyphs].sort((a, b) => b.y - a.y || a.x - b.x);

  for (const g of sorted) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last[0].y - g.y) <= Y_TOLERANCE) {
      last.push(g);
    } else {
      lines.push([g]);
    }
  }

  return lines
    .map((lineGlyphs) => {
      lineGlyphs.sort((a, b) => a.x - b.x);
      let line = '';
      let prev: Glyph | null = null;
      for (const g of lineGlyphs) {
        if (!prev) {
          line = g.str;
        } else {
          const needsSpace =
            !prev.hasEOL &&
            !/^\s/.test(g.str) &&
            !/\s$/.test(prev.str) &&
            !/^[.,;:!?)\]]/.test(g.str);
          line += needsSpace ? ` ${g.str}` : g.str;
        }
        prev = g;
        if (g.hasEOL) break;
      }
      return line.replace(/[ \t]{2,}/g, ' ').trim();
    })
    .filter(Boolean)
    .join('\n')
    .trim();
}

/** Render a PDF.js page to a canvas for OCR. */
async function renderPageToCanvas(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  page: any,
  scale = 2,
): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create canvas for OCR.');
  const task = page.render({ canvasContext: ctx, viewport });
  await task.promise;
  return canvas;
}

const EXTRACT_BATCH_SIZE = 50;

export interface ExtractPagesOptions {
  onProgress?: PipelineProgressCallback;
  batchSize?: number;
  /** Enable OCR for pages without selectable text (default true in browser) */
  enableOcr?: boolean;
}

export interface ExtractPagesResult {
  pages: RawPage[];
  ocrPageNums: number[];
  ocrFailedPageNums: number[];
}

/**
 * Incrementally extract text from every page.
 * Scanned pages are rendered and passed through Tesseract OCR.
 */
export async function extractPagesFromFile(
  file: File,
  options?: ExtractPagesOptions,
): Promise<RawPage[]> {
  const result = await extractPagesFromFileDetailed(file, options);
  return result.pages;
}

export async function extractPagesFromFileDetailed(
  file: File,
  options?: ExtractPagesOptions,
): Promise<ExtractPagesResult> {
  const validation = validateBookPdfFile(file);
  if (!validation.ok) {
    throw new Error(validation.message);
  }

  const onProgress = options?.onProgress;
  const batchSize = options?.batchSize ?? EXTRACT_BATCH_SIZE;
  const enableOcr = options?.enableOcr ?? typeof window !== 'undefined';

  onProgress?.('read', 'Reading PDF…', { percent: 0 });

  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;

  onProgress?.('read', `Reading PDF… ${totalPages} pages`, {
    totalPages,
    percent: 2,
  });

  const pages: RawPage[] = [];
  const ocrPageNums: number[] = [];
  const ocrFailedPageNums: number[] = [];
  let ocrReady = false;
  const ocr = getOcrProvider();

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    let text = '';
    let fromOcr = false;
    let requiresOcr = false;

    try {
      const content = await page.getTextContent();
      const items = content.items as Array<{
        str?: string;
        transform?: number[];
        hasEOL?: boolean;
        width?: number;
      }>;
      text = textContentToLines(items);

      if (!pageHasUsableText(text)) {
        requiresOcr = true;

        if (enableOcr && ocr.isAvailable()) {
          if (!ocrReady) {
            onProgress?.('ocr', 'Preparing OCR for scanned pages…', { percent: 20 });
            await ocr.init?.((msg) => {
              onProgress?.('ocr', msg, { percent: 22 });
            });
            ocrReady = true;
          }

          const percent = 25 + Math.round((i / totalPages) * 35);
          onProgress?.('ocr', `Running OCR… Page ${i} / ${totalPages}`, {
            page: i,
            totalPages,
            percent,
          });

          try {
            const canvas = await renderPageToCanvas(page, 2);
            const result = await ocr.recognizePage({ pageNum: i, image: canvas });
            // Free canvas memory
            canvas.width = 0;
            canvas.height = 0;

            if (ocrTextIsUsable(result.text)) {
              text = result.text;
              fromOcr = true;
              ocrPageNums.push(i);
              requiresOcr = false;
            } else {
              ocrFailedPageNums.push(i);
            }
          } catch {
            ocrFailedPageNums.push(i);
          }
        }
      }
    } finally {
      try {
        page.cleanup();
      } catch {
        /* ignore */
      }
    }

    pages.push({
      pageNum: i,
      text,
      fromOcr,
      requiresOcr,
    });

    if (!fromOcr && !requiresOcr) {
      const percent = Math.min(55, Math.round((i / totalPages) * 50) + 5);
      if (i === 1 || i === totalPages || i % 5 === 0) {
        onProgress?.('extract', `Extracting text… Page ${i} / ${totalPages}`, {
          page: i,
          totalPages,
          percent,
        });
      }
    }

    if (i % batchSize === 0) {
      await yieldToUi();
    }
  }

  try {
    await getOcrProvider().terminate?.();
  } catch {
    /* ignore */
  }

  try {
    await pdf.destroy();
  } catch {
    /* ignore */
  }

  onProgress?.('extract', `Extracted ${totalPages} pages`, {
    page: totalPages,
    totalPages,
    percent: 55,
  });

  return { pages, ocrPageNums, ocrFailedPageNums };
}

export async function parsePdf(
  file: File,
  onProgress?: PipelineProgressCallback,
): Promise<ParsedBook> {
  const { pages, ocrPageNums, ocrFailedPageNums } = await extractPagesFromFileDetailed(file, {
    onProgress,
  });
  return runPipeline(pages, file.name, onProgress, {
    fileSizeBytes: file.size,
    ocrPageNums,
    ocrFailedPageNums,
  });
}

export function rawTextToContentBlocks(text: string): ContentBlock[] {
  return textToContentBlocks(text);
}

function safeSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 6)
      .join('-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || 'imported-book'
  );
}

export function parsedBookToPublicFormat(
  parsed: ParsedBook,
  bookId: string,
  slugHint: string,
  categoryIds: string[],
  authorId: string,
  coverColor: string,
): import('@/types').Book {
  const cleanSlug = safeSlug(parsed.meta.title) || safeSlug(slugHint);
  const intro: ContentBlock[] = rawTextToContentBlocks(parsed.introductionText);

  const chapters: BookChapter[] = parsed.chapters.map((ch, ci) => ({
    id: `${bookId}-ch-${ci + 1}`,
    number: ch.number || String(ci + 1),
    title: ch.title,
    description: ch.description || undefined,
    sections: ch.sections.map(
      (sec, si): BookSection => ({
        id: `${bookId}-ch-${ci + 1}-sec-${si + 1}`,
        number: sec.number || `${ci + 1}.${si + 1}`,
        title: sec.title,
        content: rawTextToContentBlocks(sec.rawText),
      }),
    ),
  }));

  return {
    id: bookId,
    slug: cleanSlug,
    title: parsed.meta.title,
    subtitle: undefined,
    authorId,
    description:
      parsed.meta.description || `${parsed.meta.title} — an Islamic scholarly work.`,
    longDescription: undefined,
    coverColor,
    hijriStart: parsed.meta.hijriStart ?? 700,
    hijriEnd: parsed.meta.hijriEnd ?? 800,
    categoryIds,
    chapters,
    introduction: intro,
    featured: false,
    publishedYear: parsed.meta.hijriStart
      ? `circa ${parsed.meta.hijriStart} AH`
      : undefined,
    popularity: 50,
    addedDate: new Date().toISOString().slice(0, 10),
  };
}
