export { normalizePages, normalizedPagesToPlainText } from './normalizer';
export {
  detectStructureFromPages,
  structureToDetectedChapters,
  detectMetaFromText,
  isUnusableBookTitle,
  extractIntroductionText,
  countLowConfidenceHeadings,
  matchHeadingLine,
} from './structureDetector';
export { applyAutomaticNumbering } from './numbering';
export { textToContentBlocks } from './toContentBlocks';
export { runPipeline } from './pipeline';
export { detectDocumentType, pageHasUsableText } from './documentType';
export {
  detectLanguage,
  detectDocumentLanguages,
  directionForLanguage,
  languageMeta,
  formatLanguagesLabel,
} from './language';
export { structureToMarkdown, markdownToStructure } from './markdown';
export { getOcrProvider, setOcrProvider, buildOcrWarning, NullOcrProvider, TesseractOcrProvider } from './ocr';
export {
  assessArabicQuality,
  isFragmentedArabic,
  looksVisuallyReversedArabic,
  pageNeedsArabicOcr,
  pickBetterPageText,
  shouldSortRtlByDescendingX,
} from './arabicQuality';
export { dedupePageText, dedupeIntraLine, textSimilarity } from './dedupeText';
export type * from './types';
