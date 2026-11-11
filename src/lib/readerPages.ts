/**
 * Build discrete reading pages from a book — kutub-style pagination.
 *
 * Prefer real PDF page markers (block.pdfPage / section.pdfPageStart–End).
 * When markers are missing (current published books), split content into
 * reading pages sized like typical PDF pages so the whole book is not one scroll.
 */
import type { Book, ContentBlock } from '@/types';
import { enrichContentBlocks } from '@/lib/readerContent';

export type ReaderPage = {
  id: string;
  /** 1-based page number shown to the reader */
  pageNumber: number;
  /** Original PDF page when known; otherwise same as pageNumber */
  pdfPage: number | null;
  title?: string;
  chapterTitle?: string;
  sectionId?: string;
  content: ContentBlock[];
};

const TARGET_WEIGHT = 1900;
const MAX_WEIGHT = 2800;

function blockWeight(block: ContentBlock): number {
  switch (block.type) {
    case 'image':
      return 900;
    case 'table':
      return 700;
    case 'audio':
    case 'pdf':
      return 400;
    case 'heading':
      return Math.min(120, (block.text?.length ?? 0) + 40);
    case 'html':
      return Math.min(MAX_WEIGHT, Math.round((block.html?.length ?? 0) * 0.35));
    case 'quran':
      return (
        (block.arabic?.length ?? 0) * 1.4 +
        (block.translation?.length ?? 0) +
        80
      );
    case 'bilingual':
      return (
        (block.arabic?.length ?? 0) * 1.4 +
        (block.translation?.length ?? 0) +
        60
      );
    case 'hadith':
      return (
        (block.text?.length ?? 0) +
        (block.arabic?.length ?? 0) * 1.4 +
        60
      );
    case 'list':
      return block.items.join(' ').length + 40;
    default: {
      const text =
        'text' in block && typeof block.text === 'string' ? block.text : '';
      const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
      return text.length + arabic * 0.4;
    }
  }
}

function isRtlBlock(block: ContentBlock): boolean {
  if (block.type === 'arabic' || block.type === 'urdu') return true;
  if (block.type === 'quran' && block.arabic) return true;
  if (block.direction === 'rtl') return true;
  if (block.language === 'ar' || block.language === 'ur') return true;
  if ('text' in block && typeof block.text === 'string') {
    const ar = (block.text.match(/[\u0600-\u06FF]/g) || []).length;
    return ar > 12 && ar >= block.text.length * 0.35;
  }
  return false;
}

function prefersPageBreakBefore(block: ContentBlock): boolean {
  return (
    block.type === 'heading' ||
    block.type === 'image' ||
    block.type === 'quran' ||
    block.type === 'hadith'
  );
}

type FlatBlock = {
  block: ContentBlock;
  sectionId?: string;
  chapterTitle?: string;
  pdfPage?: number;
};

function flattenBook(book: Book): FlatBlock[] {
  const out: FlatBlock[] = [];

  if (book.introduction?.length) {
    const content = enrichContentBlocks(book.introduction);
    for (const block of content) {
      out.push({
        block,
        sectionId: 'introduction',
        chapterTitle: 'Introduction',
        pdfPage: block.type === 'image' ? block.pdfPage : undefined,
      });
    }
  }

  for (const chapter of book.chapters) {
    for (const section of chapter.sections) {
      const content = enrichContentBlocks(section.content ?? []);
      if (!content.length) continue;
      const rangeStart = section.pdfPageStart;
      const rangeEnd = section.pdfPageEnd ?? section.pdfPageStart;
      content.forEach((block, i) => {
        let pdfPage: number | undefined =
          block.type === 'image' || block.type === 'audio' || block.type === 'pdf'
            ? block.pdfPage
            : undefined;
        if (pdfPage == null && rangeStart != null && rangeEnd != null && rangeEnd >= rangeStart) {
          // Distribute blocks across the section's PDF page range when explicit markers are absent
          const span = rangeEnd - rangeStart + 1;
          pdfPage = rangeStart + Math.min(span - 1, Math.floor((i / Math.max(content.length, 1)) * span));
        }
        out.push({
          block,
          sectionId: section.id,
          chapterTitle: chapter.title || `Chapter ${chapter.number}`,
          pdfPage,
        });
      });
    }
  }

  return out;
}

function titleFromBlocks(blocks: ContentBlock[]): string | undefined {
  for (const b of blocks) {
    if (b.type === 'heading' && b.text.trim()) return b.text.trim();
  }
  return undefined;
}

function chunkByWeight(items: FlatBlock[]): ReaderPage[] {
  const pages: ReaderPage[] = [];
  let current: FlatBlock[] = [];
  let weight = 0;

  const flush = () => {
    if (!current.length) return;
    const content = current.map((c) => c.block);
    const pdfPages = current.map((c) => c.pdfPage).filter((n): n is number => n != null);
    const pdfPage = pdfPages.length ? Math.min(...pdfPages) : null;
    pages.push({
      id: `page-${pages.length + 1}`,
      pageNumber: pages.length + 1,
      pdfPage,
      title: titleFromBlocks(content),
      chapterTitle: current[0]?.chapterTitle,
      sectionId: current[0]?.sectionId,
      content,
    });
    current = [];
    weight = 0;
  };

  for (const item of items) {
    const w = blockWeight(item.block);
    const shouldBreak =
      current.length > 0 &&
      (weight + w > MAX_WEIGHT ||
        (weight >= TARGET_WEIGHT && prefersPageBreakBefore(item.block)) ||
        (weight >= TARGET_WEIGHT * 0.85 && w > 700));

    if (shouldBreak) flush();
    current.push(item);
    weight += w;
  }
  flush();

  return pages;
}

function groupByPdfPage(items: FlatBlock[]): ReaderPage[] | null {
  const marked = items.filter((i) => i.pdfPage != null);
  if (marked.length < Math.max(2, items.length * 0.25)) return null;

  const map = new Map<number, FlatBlock[]>();
  for (const item of items) {
    const p = item.pdfPage ?? (marked[marked.length - 1]?.pdfPage ?? 1);
    if (!map.has(p)) map.set(p, []);
    map.get(p)!.push(item);
  }

  const sorted = [...map.entries()].sort((a, b) => a[0] - b[0]);
  return sorted.map(([pdfPage, group], idx) => {
    const content = group.map((g) => g.block);
    return {
      id: `pdf-page-${pdfPage}`,
      pageNumber: idx + 1,
      pdfPage,
      title: titleFromBlocks(content),
      chapterTitle: group[0]?.chapterTitle,
      sectionId: group[0]?.sectionId,
      content,
    };
  });
}

/** Build ordered reading pages for a book. */
export function getReaderPages(book: Book): ReaderPage[] {
  const flat = flattenBook(book);
  if (!flat.length) {
    return [
      {
        id: 'page-1',
        pageNumber: 1,
        pdfPage: null,
        title: book.title,
        content: [
          {
            type: 'paragraph',
            text: 'This book has no readable content yet.',
          },
        ],
      },
    ];
  }

  const byPdf = groupByPdfPage(flat);
  const pages = byPdf ?? chunkByWeight(flat);

  // If admin stored an authoritative pageCount and we only have heuristic chunks,
  // keep heuristic pages (do not invent empty PDF pages). Label count uses pages.length.
  return pages.map((p, i) => ({
    ...p,
    pageNumber: i + 1,
    id: p.id || `page-${i + 1}`,
  }));
}

export function getBookPageCount(book: Book, pages?: ReaderPage[]): number {
  if (book.pageCount != null && book.pageCount > 0) return book.pageCount;
  const list = pages ?? getReaderPages(book);
  return list.length;
}

/** Split a page's blocks into English/LTR vs Arabic/RTL columns when both exist. */
export function splitBilingualColumns(blocks: ContentBlock[]): {
  mode: 'parallel' | 'stacked';
  ltr: ContentBlock[];
  rtl: ContentBlock[];
} {
  const ltr: ContentBlock[] = [];
  const rtl: ContentBlock[] = [];
  for (const b of blocks) {
    if (b.type === 'bilingual') {
      if (b.translation) ltr.push({ type: 'paragraph', text: b.translation, language: 'en' });
      if (b.arabic) rtl.push({ type: 'arabic', text: b.arabic, language: 'ar', direction: 'rtl' });
      continue;
    }
    if (b.type === 'quran') {
      if (b.translation) ltr.push({ type: 'paragraph', text: b.translation, language: 'en' });
      if (b.arabic) {
        rtl.push({
          type: 'quran',
          arabic: b.arabic,
          reference: b.reference,
          language: 'ar',
          direction: 'rtl',
        });
      }
      continue;
    }
    if (isRtlBlock(b)) rtl.push(b);
    else ltr.push(b);
  }

  const mode =
    ltr.length > 0 && rtl.length > 0 && ltr.length + rtl.length >= 2
      ? 'parallel'
      : 'stacked';
  return { mode, ltr, rtl };
}
