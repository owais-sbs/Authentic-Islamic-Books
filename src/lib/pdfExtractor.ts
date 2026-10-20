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
import { layoutTextItems, type LayoutHeadingLine, type PdfTextItem } from '@/services/pdf/layout';
import { pageHasUsableText, pageTextIsGarbled, stripUndecodable } from '@/services/pdf/documentType';
import {
  GlyphDecoder,
  applyRegionTexts,
  canvasWordToPdfSpace,
  headingRegionsToOcr,
  regionTextIsPlausible,
} from '@/services/pdf/glyphDecoder';
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
  /** Lines set in a larger font than the body text (heading candidates) */
  headingLines?: LayoutHeadingLine[];
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

/** Rebuild page text (lines + blank-line paragraph breaks) from PDF.js text items. */
export function textContentToLines(items: PdfTextItem[]): string {
  return layoutTextItems(items).text;
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
/** Pages are rendered at 2× for OCR (1.5× on large books for speed) */
const OCR_SCALE = 2;
const OCR_SCALE_LARGE = 1.5;
/** Max pages OCR'd to learn a damaged font's letters */
const MAX_LEARNING_PAGES = 8;
/**
 * Full-page OCR budget. Arabic / custom-font PDFs often need OCR on many pages
 * because the text layer is private-use garbage — do not leave those blank.
 */
const MAX_FULL_OCR_PAGES = 500;
/** Parallel PDF.js text-layer reads */
const TEXT_EXTRACT_CONCURRENCY = 6;

/** Yield more often on large books so the UI stays responsive. */
function adaptiveBatchSize(totalPages: number, requested?: number): number {
  if (requested != null) return requested;
  if (totalPages > 400) return 40;
  if (totalPages > 200) return 50;
  if (totalPages > 80) return 50;
  return EXTRACT_BATCH_SIZE;
}

function ocrScaleForBook(totalPages: number): number {
  return totalPages >= 100 ? OCR_SCALE_LARGE : OCR_SCALE;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i], i);
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(runners);
  return results;
}

export interface ExtractPagesOptions {
  onProgress?: PipelineProgressCallback;
  batchSize?: number;
  /** Enable OCR for pages without selectable text (default true in browser) */
  enableOcr?: boolean;
}

export interface ExtractPagesResult {
  /** Title / author stored in the PDF's own metadata (when present) */
  info?: { title?: string; author?: string };
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
  const enableOcr = options?.enableOcr ?? typeof window !== 'undefined';

  onProgress?.('read', 'Reading PDF…', { percent: 0 });

  const pdfjsLib = await getPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const batchSize = adaptiveBatchSize(totalPages, options?.batchSize);
  let info: ExtractPagesResult['info'];
  try {
    const meta = (await pdf.getMetadata()).info as { Title?: string; Author?: string };
    info = { title: meta?.Title?.trim() || undefined, author: meta?.Author?.trim() || undefined };
  } catch {
    /* no metadata */
  }

  onProgress?.('read', `Reading PDF… ${totalPages} pages`, {
    totalPages,
    percent: 2,
  });

  const scale = ocrScaleForBook(totalPages);

  // ── Pass 1: parallel text-layer extraction (big win on 100+ page books) ─────
  const pageIndexes = Array.from({ length: totalPages }, (_, i) => i + 1);
  let extractedCount = 0;
  const extracted = await mapPool(pageIndexes, TEXT_EXTRACT_CONCURRENCY, async (pageNum) => {
    const page = await pdf.getPage(pageNum);
    try {
      const content = await page.getTextContent();
      return {
        items: content.items as PdfTextItem[],
        height: page.view[3] - page.view[1],
      };
    } finally {
      try {
        page.cleanup();
      } catch {
        /* ignore */
      }
      extractedCount += 1;
      if (
        extractedCount === 1 ||
        extractedCount === totalPages ||
        extractedCount % 10 === 0
      ) {
        onProgress?.('extract', `Extracting text… Page ${extractedCount} / ${totalPages}`, {
          page: extractedCount,
          totalPages,
          percent: Math.min(20, Math.round((extractedCount / totalPages) * 18) + 2),
        });
      }
      if (extractedCount % batchSize === 0) await yieldToUi();
    }
  });

  const pageItems: PdfTextItem[][] = extracted.map((e) => e.items);
  const pageHeights: number[] = extracted.map((e) => e.height);

  // Fonts without ToUnicode maps → private-use garbage (common in Arabic PDFs)
  const garbledIdx = pageItems
    .map((items, i) => (pageTextIsGarbled(items.map((it) => it.str ?? '').join(' ')) ? i : -1))
    .filter((i) => i >= 0);
  const heavilyGarbled = garbledIdx.length / Math.max(totalPages, 1) >= 0.25;

  // Only skip OCR on pages that already have clean selectable text.
  // Never disable OCR entirely when garbled/Arabic custom fonts are present.
  const sampleSize = Math.min(20, totalPages);
  let sampleClean = 0;
  for (let i = 0; i < sampleSize; i++) {
    const sampleText = pageItems[i].map((it) => it.str ?? '').join(' ');
    if (pageHasUsableText(sampleText) && !pageTextIsGarbled(sampleText)) sampleClean += 1;
  }
  const mostlyCleanTextPdf = !heavilyGarbled && sampleClean / sampleSize >= 0.75;

  const ocr = getOcrProvider();
  const canOcr = enableOcr && ocr.isAvailable();
  let ocrReady = false;
  const ensureOcr = async () => {
    if (ocrReady) return;
    onProgress?.('ocr', 'Preparing OCR (English + Arabic)…', { percent: 21 });
    await ocr.init?.((msg) => onProgress?.('ocr', msg, { percent: 22 }));
    ocrReady = true;
  };
  const renderPage = async (index: number) =>
    renderPageToCanvas(await pdf.getPage(index + 1), scale);

  const decoder = new GlyphDecoder();
  // Glyph learning helps Latin damaged fonts; for heavily garbled Arabic books
  // prefer full-page Arabic OCR instead of English-only banner learning.
  if (garbledIdx.length > 0 && canOcr && !heavilyGarbled) {
    try {
      await ensureOcr();
      const learned = new Set<number>();
      const learnLimit = Math.min(MAX_LEARNING_PAGES, 6);
      for (let round = 0; round < learnLimit; round++) {
        const idx = decoder.pickLearningPage(pageItems, learned);
        if (idx === null) break;
        onProgress?.('ocr', `Repairing damaged font text… (sample ${round + 1}, page ${idx + 1})`, {
          percent: 24 + round * 2,
        });
        const canvas = await renderPage(idx);
        const result = await ocr.recognizePage({ pageNum: idx + 1, image: canvas, englishOnly: true });
        canvas.width = 0;
        canvas.height = 0;
        const toPdf = (w: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } }) =>
          canvasWordToPdfSpace(w, scale, pageHeights[idx]);
        decoder.learn(pageItems[idx], (result.words ?? []).map(toPdf));
        decoder.markAttempted(pageItems[idx]);
        learned.add(idx);
      }

      decoder.learnFromVocabulary(pageItems);

      const headingCap = Math.min(garbledIdx.length, 20);
      let headingDone = 0;
      for (const idx of garbledIdx) {
        if (headingDone >= headingCap) break;
        const regions = headingRegionsToOcr(pageItems[idx], decoder);
        if (!regions.length || !ocr.recognizeRegion) continue;
        headingDone += 1;
        onProgress?.('ocr', `Reading chapter headings… Page ${idx + 1} / ${totalPages}`, {
          percent: 40 + Math.round((idx / totalPages) * 10),
        });
        const canvas = await renderPage(idx);
        const replacements: Array<{ region: (typeof regions)[number]; text: string }> = [];
        for (const r of regions) {
          const pad = 4;
          const h = pageHeights[idx];
          const text = await ocr.recognizeRegion(canvas, {
            left: Math.max(0, (r.x0 - pad) * scale),
            top: Math.max(0, (h - r.y1 - pad) * scale),
            width: (r.x1 - r.x0 + pad * 2) * scale,
            height: (r.y1 - r.y0 + pad * 2) * scale,
          });
          if (regionTextIsPlausible(text, r, pageItems[idx])) replacements.push({ region: r, text });
        }
        canvas.width = 0;
        canvas.height = 0;
        pageItems[idx] = applyRegionTexts(pageItems[idx], replacements);
      }
    } catch {
      /* OCR unavailable — undecodable glyphs are dropped below */
    }
  } else if (heavilyGarbled && canOcr) {
    onProgress?.('ocr', 'Arabic/custom fonts detected — OCR every needed page…', { percent: 35 });
  } else if (mostlyCleanTextPdf) {
    onProgress?.('ocr', 'Clean text PDF — OCR only for empty pages…', { percent: 45 });
  }

  // ── Pass 2: layout every page (1…N). OCR garbled/empty pages so nothing is lost. ─
  const pages: RawPage[] = [];
  const ocrPageNums: number[] = [];
  const ocrFailedPageNums: number[] = [];
  let fullOcrUsed = 0;

  for (let i = 0; i < totalPages; i++) {
    const decodable = decoder.coverage(pageItems[i]) >= 0.4;
    const layout = layoutTextItems(decoder.decode(pageItems[i]));
    let text = stripUndecodable(layout.text);
    let headingLines: LayoutHeadingLine[] = layout.headingLines;
    let fromOcr = false;
    let requiresOcr = false;

    const stillGarbled = pageTextIsGarbled(pageItems[i].map((it) => it.str ?? '').join(' ')) && !decodable;
    const emptyAfterStrip = !pageHasUsableText(text);
    // Always OCR when the text layer is garbage or empty — this recovers Arabic ayahs
    const needsOcr = stillGarbled || emptyAfterStrip || (heavilyGarbled && emptyAfterStrip);
    const ocrBudgetLeft = fullOcrUsed < MAX_FULL_OCR_PAGES;

    if (needsOcr && canOcr && ocrBudgetLeft) {
      requiresOcr = true;
      onProgress?.('ocr', `Reading page ${i + 1} / ${totalPages} (OCR)…`, {
        page: i + 1,
        totalPages,
        percent: 48 + Math.round(((i + 1) / totalPages) * 10),
      });
      try {
        await ensureOcr();
        const canvas = await renderPage(i);
        // eng+ara+urd — never englishOnly for full page (Arabic verses need ara pack)
        const result = await ocr.recognizePage({ pageNum: i + 1, image: canvas, scale });
        canvas.width = 0;
        canvas.height = 0;
        fullOcrUsed += 1;
        if (ocrTextIsUsable(result.text)) {
          if (result.items?.length) {
            const ocrLayout = layoutTextItems(result.items);
            text = ocrLayout.text;
            headingLines = ocrLayout.headingLines;
          } else {
            text = result.text;
            headingLines = [];
          }
          fromOcr = true;
          requiresOcr = false;
          ocrPageNums.push(i + 1);
        } else {
          ocrFailedPageNums.push(i + 1);
        }
      } catch {
        ocrFailedPageNums.push(i + 1);
      }
    } else if (needsOcr && !ocrBudgetLeft) {
      requiresOcr = true;
    }

    // Keep every page in order (blank pages stay as empty placeholders)
    pages.push({ pageNum: i + 1, text, fromOcr, requiresOcr, headingLines });
    if ((i + 1) % batchSize === 0) await yieldToUi();
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
    percent: 58,
  });

  return { info, pages, ocrPageNums, ocrFailedPageNums };
}

export async function parsePdf(
  file: File,
  onProgress?: PipelineProgressCallback,
): Promise<ParsedBook> {
  const { info, pages, ocrPageNums, ocrFailedPageNums } = await extractPagesFromFileDetailed(file, {
    onProgress,
  });
  return runPipeline(pages, file.name, onProgress, {
    fileSizeBytes: file.size,
    ocrPageNums,
    ocrFailedPageNums,
    pdfTitle: info?.title,
    pdfAuthor: info?.author,
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
