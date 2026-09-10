import type { RawPage } from '@/lib/pdfExtractor';
import { buildOcrCompletedNote, buildOcrWarning, formatOcrPageRanges } from './ocr';

export type DocumentType = 'text' | 'scanned' | 'mixed';

/** Minimum characters of usable text for a page to count as "text". */
const USABLE_TEXT_MIN = 40;

export function pageHasUsableText(text: string): boolean {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length < USABLE_TEXT_MIN) return false;
  const letters = cleaned.replace(/[\d\s.,;:!?()\-–—/\\]+/g, '');
  return letters.length >= 20;
}

export interface DocumentTypeResult {
  documentType: DocumentType;
  textPageCount: number;
  emptyPageCount: number;
  scannedPageNums: number[];
  warnings: string[];
}

export interface DetectDocumentTypeOptions {
  /** Pages that were successfully OCR'd */
  ocrPageNums?: number[];
  /** Pages where OCR was attempted but failed */
  ocrFailedPageNums?: number[];
}

export function detectDocumentType(
  pages: RawPage[],
  options?: DetectDocumentTypeOptions,
): DocumentTypeResult {
  const scannedPageNums: number[] = [];
  let textPageCount = 0;
  const ocrSet = new Set(options?.ocrPageNums ?? []);
  const ocrFailed = options?.ocrFailedPageNums ?? [];

  for (const page of pages) {
    if (pageHasUsableText(page.text)) {
      textPageCount += 1;
      // Still track origin as scanned if OCR filled it
      if (page.fromOcr || ocrSet.has(page.pageNum)) {
        scannedPageNums.push(page.pageNum);
      }
    } else {
      scannedPageNums.push(page.pageNum);
    }
  }

  const emptyPageCount = pages.filter((p) => !pageHasUsableText(p.text)).length;
  const total = pages.length || 1;
  const textRatio = textPageCount / total;
  const emptyRatio = emptyPageCount / total;
  const ocrUsed = (options?.ocrPageNums?.length ?? 0) > 0;

  let documentType: DocumentType;
  if (ocrUsed && emptyRatio < 0.3) {
    // Source was scanned/mixed but OCR recovered most pages
    documentType = emptyRatio > 0.05 ? 'mixed' : 'scanned';
  } else if (emptyRatio >= 0.7 || textPageCount === 0) {
    documentType = 'scanned';
  } else if (emptyRatio >= 0.15 && textRatio >= 0.15) {
    documentType = 'mixed';
  } else if (ocrUsed) {
    documentType = 'scanned';
  } else {
    documentType = 'text';
  }

  const warnings: string[] = [];

  if (ocrUsed) {
    warnings.push(...buildOcrCompletedNote(options?.ocrPageNums ?? [], ocrFailed));
    if (documentType === 'scanned' || documentType === 'mixed') {
      warnings.push(
        'This PDF is image-based (scanned). Text was recovered with OCR — please review carefully before publishing.',
      );
    }
  } else {
    const stillNeedOcr = pages
      .filter((p) => !pageHasUsableText(p.text))
      .map((p) => p.pageNum);
    const ocrWarn = buildOcrWarning(stillNeedOcr);
    if (ocrWarn) warnings.push(ocrWarn);

    if (documentType === 'scanned') {
      warnings.push(
        '⚠ This PDF appears to be scanned/image-based. Text extraction may be incomplete until OCR succeeds.',
      );
    } else if (documentType === 'mixed') {
      warnings.push(
        `⚠ Mixed document: some pages need OCR (${formatOcrPageRanges(stillNeedOcr)}).`,
      );
    }
  }

  return {
    documentType,
    textPageCount,
    emptyPageCount,
    scannedPageNums,
    warnings,
  };
}
