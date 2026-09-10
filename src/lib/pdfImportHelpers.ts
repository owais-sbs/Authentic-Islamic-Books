import { parsePdf, parsedBookToPublicFormat, type ParsedBook } from '@/lib/pdfExtractor';
import { publicBookToReviewBook } from '@/lib/bookTransform';
import { validateBookPdfFile } from '@/lib/uploadLimits';
import { formatLanguagesLabel } from '@/services/pdf/language';
import type { BookWithStructure } from '@/features/books/types';
import type { PipelineProgressCallback } from '@/services/pdf/types';

const COVER_COLORS = [
  '#18231F', '#3A4A3F', '#5B4B3A', '#2B2B2B', '#4A5D4F',
  '#1F2D3F', '#6B5B3F', '#3F4A5D', '#5D5D5D', '#3A3A5D',
];

const CATEGORY_MAP: Record<string, string> = {
  hadith: 'cat-hadith',
  tafsir: 'cat-tafsir',
  fiqh: 'cat-fiqh',
  seerah: 'cat-seerah',
  history: 'cat-history',
  ethics: 'cat-ethics',
  spirituality: 'cat-spirituality',
  theology: 'cat-aqeedah',
  aqeedah: 'cat-aqeedah',
  biography: 'cat-biography',
};

function randomCoverColor() {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
}

function guessCategories(title: string, text: string): string[] {
  const haystack = (title + ' ' + text.slice(0, 1000)).toLowerCase();
  const found: string[] = [];
  for (const [keyword, catId] of Object.entries(CATEGORY_MAP)) {
    if (haystack.includes(keyword) && !found.includes(catId)) found.push(catId);
  }
  return found.length > 0 ? found : ['cat-thought'];
}

function guessAuthorId(authorName: string): string {
  if (!authorName) return 'scholar-ibn-kathir';
  const n = authorName.toLowerCase();
  if (n.includes('ghazali')) return 'scholar-al-ghazali';
  if (n.includes('nawawi')) return 'scholar-al-nawawi';
  if (n.includes('kathir')) return 'scholar-ibn-kathir';
  if (n.includes('taymiyyah') || n.includes('taymiyya')) return 'scholar-ibn-taymiyyah';
  if (n.includes('hajar')) return 'scholar-ibn-hajar';
  if (n.includes('suyuti')) return 'scholar-al-suyuti';
  return 'scholar-ibn-kathir';
}

function languageLabel(langs: string[] | undefined): string {
  if (!langs?.length) return 'English';
  if (langs.includes('ar') && langs.includes('en')) return 'Arabic, English';
  if (langs.includes('ur') && langs.includes('en')) return 'Urdu, English';
  if (langs.includes('ar')) return 'Arabic';
  if (langs.includes('ur')) return 'Urdu';
  if (langs.includes('en')) return 'English';
  return formatLanguagesLabel(langs as import('@/services/pdf/language').BookLanguage[]);
}

export function parsedPdfToReviewBook(parsed: ParsedBook, fileName: string): BookWithStructure {
  const bookId = crypto.randomUUID();
  const title = parsed.meta.title || fileName.replace(/\.pdf$/i, '');
  const categoryIds = guessCategories(title, parsed.introductionText);
  const authorId = guessAuthorId(parsed.meta.author);
  const coverColor = randomCoverColor();

  const publicBook = parsedBookToPublicFormat(
    parsed,
    bookId,
    title,
    categoryIds,
    authorId,
    coverColor,
  );

  const review = publicBookToReviewBook(publicBook, 'needs_review');
  const langs = parsed.extraction?.languages ?? [];

  return {
    ...review,
    authorName: parsed.meta.author || review.authorName,
    description: parsed.meta.description || review.description,
    wordCount: parsed.wordCount,
    pageCount: parsed.pageCount,
    chapterCount: parsed.chapters.length,
    sectionCount: parsed.chapters.reduce((n, ch) => n + ch.sections.length, 0),
    extractionStatus: 'completed',
    language: languageLabel(langs),
    extractionInfo: parsed.extraction
      ? {
          fileSizeBytes: parsed.extraction.fileSizeBytes,
          documentType: parsed.extraction.documentType,
          languages: langs,
          warnings: parsed.extraction.warnings,
          lowConfidenceHeadings: parsed.extraction.lowConfidenceHeadings,
          scannedPageNums: parsed.extraction.scannedPageNums,
          ocrPageCount: parsed.extraction.ocrPageCount,
        }
      : undefined,
  };
}

export async function importPdfFile(
  file: File,
  onProgress?: PipelineProgressCallback,
): Promise<BookWithStructure> {
  const validation = validateBookPdfFile(file);
  if (!validation.ok) {
    throw new Error(validation.message);
  }
  const parsed = await parsePdf(file, onProgress);
  return parsedPdfToReviewBook(parsed, file.name);
}
