import { parsePdf, parsedBookToPublicFormat, type ParsedBook } from '@/lib/pdfExtractor';
import { publicBookToReviewBook } from '@/lib/bookTransform';
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
    coverColor
  );

  const review = publicBookToReviewBook(publicBook, 'needs_review');
  return {
    ...review,
    authorName: parsed.meta.author || review.authorName,
    description: parsed.meta.description || review.description,
    wordCount: parsed.wordCount,
    pageCount: parsed.pageCount,
    chapterCount: parsed.chapters.length,
    sectionCount: parsed.chapters.reduce((n, ch) => n + ch.sections.length, 0),
    extractionStatus: 'completed',
  };
}

export async function importPdfFile(
  file: File,
  onProgress?: PipelineProgressCallback,
): Promise<BookWithStructure> {
  const parsed = await parsePdf(file, onProgress);
  return parsedPdfToReviewBook(parsed, file.name);
}
