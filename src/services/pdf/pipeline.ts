import type { ParsedBook, RawPage } from '@/lib/pdfExtractor';
import { normalizePages, normalizedPagesToPlainText, extractTableOfContents } from './normalizer';
import {
  countLowConfidenceHeadings,
  detectMetaFromText,
  detectStructureFromPages,
  extractIntroductionText,
  isUnusableBookTitle,
  structureToDetectedChapters,
} from './structureDetector';
import { assessArabicQuality } from './arabicQuality';
import { dedupePageText } from './dedupeText';
import { applyAutomaticNumbering } from './numbering';
import { detectDocumentType } from './documentType';
import { detectDocumentLanguages, formatLanguagesLabel } from './language';
import { markdownToStructure, structureToMarkdown } from './markdown';
import type { ExtractionMeta, PipelineProgressCallback } from './types';

export interface PipelineOptions {
  fileSizeBytes?: number;
  ocrPageNums?: number[];
  ocrFailedPageNums?: number[];
  /** Title / author from the PDF metadata — preferred over guessing from page text */
  pdfTitle?: string;
  pdfAuthor?: string;
}

/** PDF metadata is often junk ("Microsoft Word - doc1.docx", "Untitled", a file id) */
function usableMetadata(value?: string): string | undefined {
  const v = value?.trim();
  if (!v || v.length < 4 || v.length > 200) return undefined;
  if (/^(untitled|document|microsoft word|title|unknown)\b|\.(docx?|pdf|indd|tmp)$|^[\w-]+\.\w{2,4}$/i.test(v)) return undefined;
  if (isUnusableBookTitle(v)) return undefined;
  if ((v.match(/\p{L}/gu) || []).length < v.length * 0.5) return undefined;
  return v;
}

function usableFileTitleFallback(fileName: string): string {
  const fromFile = fileName.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
  if (fromFile && !isUnusableBookTitle(fromFile)) return fromFile;
  return 'Untitled book — needs review';
}

export function runPipeline(
  pages: RawPage[],
  fileName: string,
  onProgress?: PipelineProgressCallback,
  options?: PipelineOptions,
): ParsedBook {
  onProgress?.('normalize', 'Normalizing content…', { percent: 58 });
  // Deduplicate page text before structure detection (overlapping text layers)
  const cleanedPages = pages.map((p) => ({
    ...p,
    text: dedupePageText(p.text),
  }));
  const docType = detectDocumentType(cleanedPages, {
    ocrPageNums: options?.ocrPageNums,
    ocrFailedPageNums: options?.ocrFailedPageNums,
  });
  const normalized = normalizePages(cleanedPages);
  const fullText = normalizedPagesToPlainText(normalized);
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  onProgress?.('languages', 'Detecting languages…', { percent: 65 });
  const languageSamples = normalized.flatMap((p) => p.blocks.map((b) => b.text)).slice(0, 400);
  const languages = detectDocumentLanguages(languageSamples);

  onProgress?.('meta', 'Detecting title and author…', { percent: 70 });
  const meta = detectMetaFromText(fullText, fileName);
  const pdfTitle = usableMetadata(options?.pdfTitle);
  const pdfAuthor = usableMetadata(options?.pdfAuthor);
  if (pdfTitle) meta.title = pdfTitle;
  if (pdfAuthor) meta.author = pdfAuthor;

  onProgress?.('chapters', 'Detecting chapters and sections…', { percent: 78 });
  // The book's own contents page (if any) tells us which headings are real chapters
  const toc = extractTableOfContents(pages).entries;
  const structure = detectStructureFromPages(normalized, toc);
  const lowConfidenceHeadings = countLowConfidenceHeadings(structure);

  onProgress?.('sections', 'Building hierarchy…', { percent: 84 });
  let chapters = structureToDetectedChapters(structure, normalized);

  let introductionText = extractIntroductionText(structure);

  if (introductionText) {
    chapters = chapters.filter(
      (ch) =>
        !/^(introduction|preface|foreword|prologue|مقدمة|المقدمة|تمهيد|مقدمہ|تمہید)$/i.test(
          ch.title.trim(),
        ),
    );
  }

  // Prefer continuous page-ordered text only when chapter detection found nothing usable.
  // Keep medium-confidence multi-chapter trees (TOC-aligned) instead of collapsing.
  const genuineChapterCount = structure.filter(
    (n) => n.kind === 'chapter' && (n.confidence === 'high' || n.confidence === 'medium'),
  ).length;
  const usableDetectedChapters = chapters.filter((ch) =>
    ch.sections.some((s) => (s.rawText || '').trim().length > 80),
  ).length;
  const continuousBody = normalized
    .slice()
    .sort((a, b) => a.pageNumber - b.pageNumber)
    .flatMap((p) => p.blocks.map((b) => b.text.trim()).filter(Boolean))
    .join('\n\n');

  if (genuineChapterCount === 0 && usableDetectedChapters < 2 && continuousBody.trim()) {
    chapters = [
      {
        number: '1',
        title: meta.title?.trim() || 'Complete Text',
        description: '',
        rawText: '',
        sections: [{ number: '1', title: 'Content', rawText: continuousBody }],
      },
    ];
  } else if (chapters.length === 0 && fullText.trim()) {
    chapters = [
      {
        number: '1',
        title: meta.title?.trim() || 'Complete Text',
        description: '',
        rawText: '',
        sections: [{ number: '1', title: 'Content', rawText: continuousBody || fullText }],
      },
    ];
  }

  onProgress?.('numbering', 'Applying numbering…', { percent: 88 });
  chapters = applyAutomaticNumbering(chapters);

  onProgress?.('markdown', 'Building intermediate Markdown…', { percent: 92 });
  const markdown = structureToMarkdown({
    meta,
    languages,
    documentType: docType.documentType,
    pageCount: pages.length,
    introductionText,
    chapters,
  });

  const fromMd = markdownToStructure(markdown);
  chapters = applyAutomaticNumbering(fromMd.chapters);
  introductionText = fromMd.introductionText || introductionText;
  if (fromMd.meta.title && !pdfTitle) meta.title = fromMd.meta.title;
  if (fromMd.meta.author && !pdfAuthor) meta.author = fromMd.meta.author;
  if (fromMd.meta.description) meta.description = fromMd.meta.description;

  // Final safety: never leave a book with words but zero chapters
  if (chapters.length === 0 && (continuousBody.trim() || fullText.trim())) {
    chapters = [
      {
        number: '1',
        title: meta.title?.trim() || 'Complete Text',
        description: '',
        rawText: '',
        sections: [{ number: '1', title: 'Content', rawText: continuousBody || fullText }],
      },
    ];
  }

  const warnings = [...docType.warnings];
  if (lowConfidenceHeadings > 0) {
    warnings.push(`⚠ ${lowConfidenceHeadings} low-confidence heading(s) — please review structure.`);
  }
  if (languages.includes('ar') || languages.includes('ur')) {
    warnings.push(
      `⚠ ${formatLanguagesLabel(languages.filter((l) => l === 'ar' || l === 'ur'))} content detected — verify RTL rendering in review.`,
    );
  }
  const arabicAssessment = assessArabicQuality(fullText.slice(0, 20000));
  if (arabicAssessment.fragmented) {
    warnings.push(
      '⚠ Fragmented Arabic characters detected on some pages — review Arabic carefully; OCR may be incomplete.',
    );
  }
  if (arabicAssessment.visuallyReversed) {
    warnings.push(
      '⚠ Suspicious reversed Arabic order detected — flag for manual correction before publishing.',
    );
  }
  if (!meta.title || isUnusableBookTitle(meta.title) || /needs review/i.test(meta.title)) {
    warnings.push('⚠ Book title could not be detected confidently — correct it in review.');
    if (isUnusableBookTitle(meta.title) || !meta.title) {
      meta.title = usableFileTitleFallback(fileName);
    }
  }
  if (!meta.author) {
    warnings.push('⚠ Author could not be detected confidently — correct it in review.');
  }
  if (
    chapters.length === 1 &&
    (chapters[0].title === 'Complete Text' || chapters[0].title === meta.title) &&
    genuineChapterCount === 0
  ) {
    warnings.push(
      '⚠ No chapter headings found in the PDF. Full text kept in page order (first → last) as continuous content — edit structure in review if needed.',
    );
  }
  if (wordCount === 0) {
    warnings.push(
      '⚠ No extractable text found after OCR. Do not publish until text is available or entered manually.',
    );
  }

  // Final pass: dedupe section bodies (duplicate paragraphs across page joins)
  chapters = chapters.map((ch) => ({
    ...ch,
    sections: ch.sections.map((sec) => ({
      ...sec,
      rawText: dedupePageText(sec.rawText),
    })),
  }));
  introductionText = introductionText ? dedupePageText(introductionText) : introductionText;

  // Rebuild one section per PDF page whenever pagination should match the file.
  // NEVER drop middle pages — empty / OCR-failed / Arabic-only pages stay as slots.
  const soleContentSection =
    chapters.length === 1 &&
    chapters[0].sections.length === 1 &&
    (!chapters[0].sections[0].title ||
      /^(content|complete text)$/i.test(chapters[0].sections[0].title));
  const alreadyPageSections =
    chapters.length === 1 &&
    chapters[0].sections.length >= 2 &&
    chapters[0].sections.every((s) => /^Page\s+\d+$/i.test(s.title || ''));
  // Prefer PDF page slots when structure is weak / already page-based / bilingual scanned.
  // Do not destroy a confident multi-chapter tree just because Arabic was detected.
  const preferPdfPages =
    normalized.length > 1 &&
    (soleContentSection ||
      alreadyPageSections ||
      ((languages.includes('ar') ||
        languages.includes('ur') ||
        docType.documentType === 'scanned' ||
        docType.documentType === 'mixed') &&
        genuineChapterCount === 0));

  if (preferPdfPages) {
    const byNum = new Map(normalized.map((p) => [p.pageNumber, p]));
    const pageSections = Array.from({ length: pages.length }, (_, i) => {
      const pageNum = i + 1;
      const p = byNum.get(pageNum);
      const fromBlocks = p
        ? dedupePageText(
            p.blocks
              .map((b) => b.text.trim())
              .filter(Boolean)
              .join('\n\n'),
          )
        : '';
      // Fall back to raw extracted page text (preserves Arabic when blocks were emptied)
      const fromRaw = dedupePageText(cleanedPages[i]?.text || pages[i]?.text || '');
      let rawText = fromBlocks.trim() || fromRaw.trim();
      if (!rawText) {
        const needsOcr = Boolean(p?.requiresOcr || pages[i]?.requiresOcr);
        rawText = needsOcr
          ? `[Page ${pageNum} — text not extracted yet (OCR / Arabic). Paste or type the page content here.]`
          : `[Page ${pageNum} — no extractable text. If this page has Arabic, images, or calligraphy, add it in review.]`;
      }
      return {
        number: String(pageNum),
        title: `Page ${pageNum}`,
        rawText,
        pdfPageStart: pageNum,
        pdfPageEnd: pageNum,
      };
    });

    chapters = [
      {
        number: '1',
        title: meta.title?.trim() || chapters[0]?.title || 'Complete Text',
        description: '',
        rawText: '',
        sections: pageSections,
      },
    ];

    const emptyCount = pageSections.filter((s) =>
      /^\[Page \d+ —/.test(s.rawText.trim()),
    ).length;
    if (emptyCount > 0) {
      warnings.push(
        `⚠ ${emptyCount} page(s) had little/no extractable text (often Arabic or scanned). Those page slots were kept — fill them in review; do not delete middle pages.`,
      );
    }
  }

  const extraction: ExtractionMeta = {
    fileSizeBytes: options?.fileSizeBytes ?? 0,
    pageCount: pages.length,
    wordCount,
    documentType: docType.documentType,
    languages,
    scannedPageNums: docType.scannedPageNums,
    lowConfidenceHeadings,
    warnings,
    markdown,
    ocrPageCount: options?.ocrPageNums?.length ?? 0,
  };

  onProgress?.('build', 'Ready for review', { percent: 98 });

  return {
    meta,
    introductionText,
    chapters,
    pageCount: pages.length,
    wordCount,
    extraction,
  };
}
