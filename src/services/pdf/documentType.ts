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

/**
 * Text drawn with fonts that have no character map comes out of PDF.js as
 * private-use codes (U+E000–U+F8FF) or U+FFFD — the letters cannot be
 * decoded, so such pages must be read with OCR.
 */
const UNDECODABLE = /[\uE000-\uF8FF\uFFFD]/g;

export function pageTextIsGarbled(text: string): boolean {
  const bad = (text.match(UNDECODABLE) || []).length;
  if (bad < 10) return false;
  const letters = (text.match(/\p{L}/gu) || []).length;
  return bad / Math.max(1, letters + bad) > 0.03;
}

/**
 * Detect Arabic fonts re-encoded as ASCII printable characters.
 * Some Arabic PDFs map Arabic letters to codepoints like %, &, $, @, #, digits etc.
 * These are NOT caught by pageTextIsGarbled (no PUA codes), but produce junk like:
 * "ةةة ةة ة &ةةة % ة 2ةة$ة14"
 *
 * Signature: very high density of symbols/digits mixed with real Arabic characters,
 * or mostly symbol-noise with no Arabic Unicode at all (pure ASCII re-encoding).
 */
export function pageTextIsAsciiEncodedArabic(text: string): boolean {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length < 30) return false;

  const arabicChars = (cleaned.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const symbols = (cleaned.match(/[%&$#@^*+=|\\~`{}[\]<>]/g) || []).length;
  const digits = (cleaned.match(/\d/g) || []).length;
  const letters = (cleaned.match(/[A-Za-z]/g) || []).length;
  const meaningful = cleaned.replace(/\s/g, '').length;
  if (meaningful === 0) return false;

  const symbolRatio = symbols / meaningful;
  const digitRatio = digits / meaningful;
  const noiseRatio = (symbols + digits) / meaningful;
  const arabicRatio = arabicChars / meaningful;

  // Case 1: mixed Arabic + symbols (re-encoded font where some chars mapped to ASCII symbols)
  // Typical: "ةةة &ةة ة % ة 2ةة$ة14" — both Arabic and symbol junk present
  if (arabicChars > 5 && symbolRatio > 0.08 && noiseRatio > 0.15) return true;

  // Case 2: pure symbol/digit noise — no Arabic Unicode at all, mostly non-letter ASCII
  // Typical: a page entirely in a custom font encoded as ASCII
  if (arabicChars === 0 && letters < 15 && noiseRatio > 0.35 && meaningful > 20) return true;

  // Case 3: very dense symbol noise even with some Latin letters (but no Arabic)
  // Avoids false-positives on math/code pages
  if (arabicChars === 0 && symbolRatio > 0.25 && digitRatio > 0.1 && letters < meaningful * 0.3) return true;

  return false;
}

/** Drop undecodable glyph codes so they never reach the book text. */
export function stripUndecodable(text: string): string {
  return text.replace(UNDECODABLE, '');
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
