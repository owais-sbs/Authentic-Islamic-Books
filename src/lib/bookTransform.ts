import type { BookWithStructure, BookStatus } from '@/features/books/types';
import type { Book, BookChapter, BookSection, ContentBlock } from '@/types';
import { enrichContentBlocks } from '@/lib/readerContent';
import { rawTextToContentBlocks } from '@/lib/pdfExtractor';

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

export function htmlToContentBlocks(html: string): ContentBlock[] {
  if (!html?.trim()) return [];

  const div = document.createElement('div');
  div.innerHTML = html;

  const blocks: ContentBlock[] = [];

  div.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: 'paragraph', text });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const text = el.textContent?.trim() ?? '';
    if (!text) return;

    if (tag === 'blockquote') {
      blocks.push({ type: 'quote', text });
    } else if (tag === 'h2' || tag === 'h3') {
      blocks.push({ type: 'heading', text, level: tag === 'h2' ? 1 : 2 });
    } else if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll('li'))
        .map((li) => li.textContent?.trim() ?? '')
        .filter(Boolean);
      if (items.length) blocks.push({ type: 'list', ordered: tag === 'ol', items });
    } else if (text) {
      blocks.push({ type: 'paragraph', text });
    }
  });

  return blocks.length > 0 ? enrichContentBlocks(blocks) : enrichContentBlocks(rawTextToContentBlocks(div.textContent ?? html));
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
          content: book.introduction.map((b) => ('text' in b ? b.text : '')).join('\n\n'),
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
        content: sec.content?.map((b) => ('text' in b ? b.text : '')).join('\n\n') ?? '',
        order: si,
      })),
    })),
  };
}
