import type { BookWithStructure, BookStatus } from '@/features/books/types';
import type { Book, BookChapter, BookSection, ContentBlock } from '@/types';
import { enrichContentBlocks } from '@/lib/readerContent';
import {
  contentBlocksToHtml,
  htmlDocumentToContentBlocks,
  parseBookContent,
} from '@/services/content/parseBookContent';

// ─── Category maps ────────────────────────────────────────────────────────────

export const CAT_NAME_TO_ID: Record<string, string> = {
  Aqeedah: 'cat-aqeedah',
  Hadith: 'cat-hadith',
  Tafsir: 'cat-tafsir',
  Fiqh: 'cat-fiqh',
  Seerah: 'cat-seerah',
  History: 'cat-history',
  Ethics: 'cat-ethics',
  Spirituality: 'cat-spirituality',
  'Islamic Thought': 'cat-thought',
  Biography: 'cat-biography',
};

export const ID_TO_CAT: Record<string, string> = Object.fromEntries(
  Object.entries(CAT_NAME_TO_ID).map(([name, id]) => [id, name])
);

export function catNameToId(name: string): string {
  return CAT_NAME_TO_ID[name] ?? 'cat-thought';
}

export function idToCatName(id: string): string {
  return ID_TO_CAT[id] ?? 'Islamic Thought';
}

export function generateSlug(title: string, fallbackId: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 6)
      .join('-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) || fallbackId
  );
}

function looksLikeHtml(content: string): boolean {
  return /<\/?[a-z][a-z0-9]*\b[^>]*>/i.test(content);
}

/**
 * Convert stored section content (HTML from admin/editor, or plain text from
 * legacy PDF imports) into semantic ContentBlocks for the reader.
 *
 * Always ensures semantic parsing runs on dense/plain content so existing
 * imported books improve without re-import.
 */
export function htmlToContentBlocks(html: string): ContentBlock[] {
  if (!html?.trim()) return [];

  // Legacy / PDF import: plain text — parse semantically (incl. dense blobs)
  if (!looksLikeHtml(html)) {
    return enrichContentBlocks(parseBookContent(html));
  }

  let blocks = htmlDocumentToContentBlocks(html);

  const hasSemantic = blocks.some((b) =>
    ['quran', 'arabic', 'hadith', 'footnote'].includes(b.type),
  );

  if (!hasSemantic) {
    // Paragraph/heading HTML without semantic types — re-parse as text
    const plain =
      blocks
        .map((b) => {
          if ('text' in b && typeof b.text === 'string') return b.text;
          if (b.type === 'list') return b.items.join('\n');
          return '';
        })
        .filter(Boolean)
        .join('\n\n') || html.replace(/<[^>]+>/g, '\n');
    blocks = parseBookContent(plain);
  } else {
    // Keep semantic blocks; re-parse leftover dense paragraphs that still mix scripts
    blocks = blocks.flatMap((b) => {
      if (b.type !== 'paragraph') return [b];
      const t = b.text;
      if (t.length > 80 && /[\u0600-\u06FF]/.test(t) && /[A-Za-z]/.test(t)) {
        return parseBookContent(t);
      }
      if (t.length > 200 && /\b(?:Qur['’]?an|Narrated|Sahih al-Bukhari)\b/i.test(t)) {
        return parseBookContent(t);
      }
      return [b];
    });
  }

  if (blocks.length === 0) {
    blocks = parseBookContent(html.replace(/<[^>]+>/g, '\n'));
  }

  return enrichContentBlocks(blocks);
}

export function reviewBookToPublicBook(book: BookWithStructure): Book {
  const publicChapters: BookChapter[] = book.chapters.map((ch) => ({
    id: ch.id,
    number: ch.number,
    title: ch.title,
    description: ch.description,
    sections: ch.sections.map(
      (sec): BookSection => ({
        id: sec.id,
        number: sec.number,
        title: sec.title,
        subtitle: sec.subtitle,
        content: htmlToContentBlocks(sec.content),
      })
    ),
  }));

  const introduction: ContentBlock[] | undefined = book.introduction
    ? htmlToContentBlocks(book.introduction.content)
    : undefined;

  const slug = generateSlug(book.title, book.id);

  return {
    id: book.id,
    slug,
    title: book.title,
    subtitle: book.subtitle,
    authorId: book.authorId ?? 'scholar-ibn-kathir',
    description: book.description ?? `${book.title || 'Untitled'} — an Islamic scholarly work.`,
    longDescription: undefined,
    coverColor: book.coverColor,
    coverUrl: book.coverUrl,
    hijriStart: book.hijriStartYear ?? 700,
    hijriEnd: book.hijriEndYear ?? 800,
    categoryIds:
      book.categories.length > 0 ? book.categories.map(catNameToId) : ['cat-thought'],
    chapters: publicChapters,
    introduction,
    featured: book.featured ?? false,
    popularity: 50,
    addedDate: book.createdAt ?? new Date().toISOString().slice(0, 10),
  };
}

export function createEmptyBook(): BookWithStructure {
  const id = crypto.randomUUID();
  const today = new Date().toISOString().slice(0, 10);
  return {
    id,
    title: '',
    subtitle: '',
    authorName: '',
    description: '',
    coverColor: '#18231F',
    categories: [],
    hijriStartYear: undefined,
    hijriEndYear: undefined,
    language: 'English',
    status: 'draft',
    createdAt: today,
    updatedAt: today,
    introduction: {
      id: 'intro',
      title: 'Introduction',
      subtitle: '',
      content: '',
      order: 0,
    },
    chapters: [],
  };
}

export function publicBookToAdminBook(
  book: Book,
  status: BookStatus = 'needs_review'
): import('@/features/books/types').Book {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    authorName: book.authorId,
    authorId: book.authorId,
    coverColor: book.coverColor,
    coverUrl: book.coverUrl,
    categories: book.categoryIds.map(idToCatName),
    hijriStartYear: book.hijriStart,
    hijriEndYear: book.hijriEnd,
    language: 'English',
    chapterCount: book.chapters.length,
    sectionCount: book.chapters.reduce((n, c) => n + c.sections.length, 0),
    wordCount: undefined,
    status,
    createdAt: book.addedDate ?? today,
    updatedAt: today,
  };
}

function blocksToStoredContent(blocks: ContentBlock[] | undefined): string {
  if (!blocks?.length) return '';
  // Prefer semantic HTML so round-trips keep Qur'an / Arabic / hadith types
  return contentBlocksToHtml(blocks);
}

export function publicBookToReviewBook(book: Book, status: BookStatus = 'draft'): BookWithStructure {
  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle,
    authorName: book.authorId,
    authorId: book.authorId,
    description: book.description,
    coverColor: book.coverColor,
    coverUrl: book.coverUrl,
    categories: book.categoryIds.map(idToCatName),
    hijriStartYear: book.hijriStart,
    hijriEndYear: book.hijriEnd,
    language: 'English',
    status,
    featured: book.featured,
    chapterCount: book.chapters.length,
    sectionCount: book.chapters.reduce((n, c) => n + c.sections.length, 0),
    createdAt: book.addedDate ?? new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString().slice(0, 10),
    introduction: book.introduction
      ? {
          id: 'intro',
          title: 'Introduction',
          content: blocksToStoredContent(book.introduction),
          order: 0,
        }
      : undefined,
    chapters: book.chapters.map((ch, ci) => ({
      id: ch.id,
      bookId: book.id,
      number: ch.number,
      title: ch.title,
      description: ch.description,
      order: ci,
      sections: ch.sections.map((sec, si) => ({
        id: sec.id,
        chapterId: ch.id,
        number: sec.number,
        title: sec.title,
        subtitle: sec.subtitle,
        content: blocksToStoredContent(sec.content),
        order: si,
      })),
    })),
  };
}
