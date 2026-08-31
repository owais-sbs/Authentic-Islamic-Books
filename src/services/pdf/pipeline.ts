import type { ParsedBook, RawPage } from '@/lib/pdfExtractor';
import { normalizePages, normalizedPagesToPlainText } from './normalizer';
import {
  detectMetaFromText,
  detectStructureFromPages,
  structureToDetectedChapters,
} from './structureDetector';
import { applyAutomaticNumbering } from './numbering';
import type { PipelineProgressCallback } from './types';

export function runPipeline(
  pages: RawPage[],
  fileName: string,
  onProgress?: PipelineProgressCallback,
): ParsedBook {
  onProgress?.('normalize', 'Cleaning extracted text…');
  const normalized = normalizePages(pages);
  const fullText = normalizedPagesToPlainText(normalized);
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  onProgress?.('meta', 'Detecting title and author…');
  const meta = detectMetaFromText(fullText, fileName);

  onProgress?.('chapters', 'Detecting chapters…');
  const structure = detectStructureFromPages(normalized);

  onProgress?.('sections', 'Detecting sections…');
  let chapters = structureToDetectedChapters(structure, normalized);

  onProgress?.('numbering', 'Generating numbering…');
  chapters = applyAutomaticNumbering(chapters);

  const preChapterNodes = structure.filter((n) => n.kind === 'paragraph' || n.kind === 'quote' || n.kind === 'list');
  const introFromStructure = preChapterNodes.map((n) => n.content).join('\n\n').trim();
  const introductionText = introFromStructure || fullText.split(/\s+/).slice(0, 600).join(' ');

  onProgress?.('build', 'Building structured book…');

  return {
    meta,
    introductionText,
    chapters,
    pageCount: pages.length,
    wordCount,
  };
}
