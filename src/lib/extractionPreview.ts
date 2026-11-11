/**
 * Dry-run PDF extraction for validating improvements against an existing book.
 * Never writes to Supabase or mutates the live book — caller must explicitly apply.
 */
import {
  extractPagesFromFileDetailed,
  type ParsedBook,
  type RawPage,
} from '@/lib/pdfExtractor';
import { parsedPdfToReviewBook } from '@/lib/pdfImportHelpers';
import { snapshotBookContent } from '@/lib/bookReprocess';
import { assessArabicQuality } from '@/services/pdf/arabicQuality';
import { textSimilarity, dedupePageText } from '@/services/pdf/dedupeText';
import { detectLanguage } from '@/services/pdf/language';
import { pageHasUsableText } from '@/services/pdf/documentType';
import { runPipeline } from '@/services/pdf/pipeline';
import type { BookWithStructure } from '@/features/books/types';
import type { PipelineProgressCallback } from '@/services/pdf/types';

export interface PageExtractionReport {
  pageNumber: number;
  /** Truncated preview for list UI */
  textPreview: string;
  fullText: string;
  language: string;
  usedOcr: boolean;
  /** 0–100 when engine reported it; null = unavailable */
  ocrConfidence: number | null;
  arabicFragmented: boolean;
  arabicReversed: boolean;
  arabicScore: number;
  emptyOrThin: boolean;
  duplicateOfPreviousPage: boolean;
  warnings: string[];
  needsManualReview: boolean;
}

export interface ExtractionPreviewResult {
  pdfFileName: string;
  /** Kept in memory for apply — not uploaded until admin approves */
  pdfFile: File;
  totalPages: number;
  ocrPageCount: number;
  ocrFailedPages: number[];
  pages: PageExtractionReport[];
  proposed: BookWithStructure;
  previousSnapshot: ReturnType<typeof snapshotBookContent>;
  proposedSnapshot: ReturnType<typeof snapshotBookContent>;
  pipelineWarnings: string[];
  /** True when new extract has meaningfully less text than existing */
  worseThanExisting: boolean;
  summary: {
    arabicProblemPages: number;
    emptyPages: number;
    duplicatePages: number;
    reviewPages: number;
  };
}

function previewText(text: string, max = 220): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max)}…`;
}

function plainFromHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildPageReports(pages: RawPage[]): PageExtractionReport[] {
  const reports: PageExtractionReport[] = [];
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const text = dedupePageText(page.text || '');
    const lang = detectLanguage(text) || 'unknown';
    const arabic = assessArabicQuality(text);
    const emptyOrThin = !pageHasUsableText(text);
    const prev = i > 0 ? pages[i - 1].text : '';
    const duplicateOfPreviousPage =
      Boolean(prev?.trim()) && textSimilarity(prev, text) >= 0.92 && text.length > 40;

    const warnings: string[] = [];
    if (emptyOrThin) warnings.push('Little or no usable text on this page');
    if (page.requiresOcr && !page.fromOcr) warnings.push('OCR needed but not applied successfully');
    if (arabic.fragmented) warnings.push('Fragmented Arabic characters');
    if (arabic.visuallyReversed) warnings.push('Suspected reversed Arabic order');
    if (duplicateOfPreviousPage) warnings.push('Near-duplicate of previous page');
    if (page.fromOcr && page.ocrConfidence == null) {
      warnings.push('OCR used — confidence unavailable');
    }

    reports.push({
      pageNumber: page.pageNum,
      textPreview: previewText(text),
      fullText: text,
      language: lang,
      usedOcr: Boolean(page.fromOcr),
      ocrConfidence:
        typeof page.ocrConfidence === 'number' && Number.isFinite(page.ocrConfidence)
          ? Math.round(page.ocrConfidence * 10) / 10
          : null,
      arabicFragmented: arabic.fragmented,
      arabicReversed: arabic.visuallyReversed,
      arabicScore: Math.round(arabic.score * 100) / 100,
      emptyOrThin,
      duplicateOfPreviousPage,
      warnings,
      needsManualReview:
        emptyOrThin ||
        arabic.needsReview ||
        duplicateOfPreviousPage ||
        Boolean(page.requiresOcr && !page.fromOcr),
    });
  }
  return reports;
}

function countContentChars(book: BookWithStructure): number {
  let n = 0;
  if (book.introduction?.content) n += plainFromHtml(book.introduction.content).length;
  for (const ch of book.chapters) {
    for (const sec of ch.sections) n += plainFromHtml(sec.content || '').length;
  }
  return n;
}

/**
 * Run extraction in memory only. Does not touch Storage, DB, or the live book object.
 */
export async function runExtractionPreview(
  existing: BookWithStructure,
  pdfFile: File,
  onProgress?: PipelineProgressCallback,
): Promise<ExtractionPreviewResult> {
  const detailed = await extractPagesFromFileDetailed(pdfFile, { onProgress });
  const parsed: ParsedBook = runPipeline(detailed.pages, pdfFile.name, onProgress, {
    fileSizeBytes: pdfFile.size,
    ocrPageNums: detailed.ocrPageNums,
    ocrFailedPageNums: detailed.ocrFailedPageNums,
    pdfTitle: detailed.info?.title,
    pdfAuthor: detailed.info?.author,
  });

  const proposedRaw = parsedPdfToReviewBook(parsed, pdfFile.name);
  const proposed: BookWithStructure = {
    ...proposedRaw,
    id: existing.id,
    status: 'needs_review',
    sourcePdfPath: existing.sourcePdfPath,
    sourcePdfUrl: existing.sourcePdfUrl,
    importMethod: existing.importMethod ?? 'upload',
    licenceNote: existing.licenceNote,
    importedAt: existing.importedAt,
    createdAt: existing.createdAt,
    coverUrl: existing.coverUrl,
    coverColor: existing.coverColor || proposedRaw.coverColor,
    categories: existing.categories.length ? existing.categories : proposedRaw.categories,
    featured: existing.featured,
    chapters: proposedRaw.chapters.map((ch) => ({
      ...ch,
      bookId: existing.id,
      sections: ch.sections.map((sec) => ({ ...sec, chapterId: ch.id })),
    })),
  };

  const pages = buildPageReports(detailed.pages);
  const previousSnapshot = snapshotBookContent(existing);
  const proposedSnapshot = snapshotBookContent(proposed);
  const existingChars = countContentChars(existing);
  const proposedChars = countContentChars(proposed);
  const worseThanExisting = proposedChars < 80 && existingChars > 200;

  return {
    pdfFileName: pdfFile.name,
    pdfFile,
    totalPages: detailed.pages.length,
    ocrPageCount: detailed.ocrPageNums.length,
    ocrFailedPages: detailed.ocrFailedPageNums,
    pages,
    proposed,
    previousSnapshot,
    proposedSnapshot,
    pipelineWarnings: parsed.extraction?.warnings ?? [],
    worseThanExisting,
    summary: {
      arabicProblemPages: pages.filter((p) => p.arabicFragmented || p.arabicReversed).length,
      emptyPages: pages.filter((p) => p.emptyOrThin).length,
      duplicatePages: pages.filter((p) => p.duplicateOfPreviousPage).length,
      reviewPages: pages.filter((p) => p.needsManualReview).length,
    },
  };
}
