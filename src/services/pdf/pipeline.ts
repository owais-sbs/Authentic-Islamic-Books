import type { ParsedBook, RawPage } from '@/lib/pdfExtractor';
import { normalizePages, normalizedPagesToPlainText } from './normalizer';
import {
  countLowConfidenceHeadings,
  detectMetaFromText,
  detectStructureFromPages,
  extractIntroductionText,
  structureToDetectedChapters,
} from './structureDetector';
import { applyAutomaticNumbering } from './numbering';
import { detectDocumentType } from './documentType';
import { detectDocumentLanguages, formatLanguagesLabel } from './language';
import { markdownToStructure, structureToMarkdown } from './markdown';
import type { ExtractionMeta, PipelineProgressCallback } from './types';

export interface PipelineOptions {
  fileSizeBytes?: number;
  ocrPageNums?: number[];
  ocrFailedPageNums?: number[];
}

export function runPipeline(
  pages: RawPage[],
  fileName: string,
  onProgress?: PipelineProgressCallback,
  options?: PipelineOptions,
): ParsedBook {
  onProgress?.('normalize', 'Normalizing content…', { percent: 58 });
  const docType = detectDocumentType(pages, {
    ocrPageNums: options?.ocrPageNums,
    ocrFailedPageNums: options?.ocrFailedPageNums,
  });
  const normalized = normalizePages(pages);
  const fullText = normalizedPagesToPlainText(normalized);
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  onProgress?.('languages', 'Detecting languages…', { percent: 65 });
  const languageSamples = normalized.flatMap((p) => p.blocks.map((b) => b.text)).slice(0, 400);
  const languages = detectDocumentLanguages(languageSamples);

  onProgress?.('meta', 'Detecting title and author…', { percent: 70 });
  const meta = detectMetaFromText(fullText, fileName);

  onProgress?.('chapters', 'Detecting chapters and sections…', { percent: 78 });
  const structure = detectStructureFromPages(normalized);
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

  // Guarantee reviewable content when we have words but empty structure
  if (chapters.length === 0 && fullText.trim()) {
    chapters = [
      {
        number: '1',
        title: 'Unstructured Content',
        description: '',
        rawText: '',
        sections: [{ number: '1', title: 'Content', rawText: fullText }],
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
  if (fromMd.meta.title) meta.title = fromMd.meta.title;
  if (fromMd.meta.author) meta.author = fromMd.meta.author;
  if (fromMd.meta.description) meta.description = fromMd.meta.description;

  // Final safety: never leave a book with words but zero chapters
  if (chapters.length === 0 && fullText.trim()) {
    chapters = [
      {
        number: '1',
        title: 'Unstructured Content',
        description: '',
        rawText: '',
        sections: [{ number: '1', title: 'Content', rawText: fullText }],
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
  if (chapters.length === 1 && chapters[0].title === 'Unstructured Content') {
    warnings.push(
      '⚠ No reliable chapter headings were detected. Content stored as Unstructured Content — please review.',
    );
  }
  if (wordCount === 0) {
    warnings.push(
      '⚠ No extractable text found after OCR. Do not publish until text is available or entered manually.',
    );
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
