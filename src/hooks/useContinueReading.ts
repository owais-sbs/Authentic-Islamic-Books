import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { demoIslamicBook, DEMO_BOOK_SLUG } from '@/data/demoIslamicBook';
import type { Book } from '@/types';

interface BookProgress {
  scrollPercent: number;
  activeSectionId: string | null;
  updatedAt: number;
  /** Demo reader page number (optional). */
  pageNumber?: number;
}

type ProgressMap = Record<string, BookProgress>;

export interface ContinueReadingEntry {
  book: Book;
  percent: number;
  updatedAt: number;
  readHref: string;
  authorLabel: string;
  langCode: string;
}

function demoAsBook(): Book {
  return {
    id: demoIslamicBook.id,
    slug: demoIslamicBook.slug,
    title: demoIslamicBook.titleEn,
    authorId: 'demo-author',
    description: demoIslamicBook.description,
    coverColor: demoIslamicBook.coverColor,
    hijriStart: 0,
    hijriEnd: 0,
    categoryIds: [],
    chapters: [],
  };
}

/** Most recent in-progress book (left mid-read), if any. */
export function useContinueReading(books: Book[]): ContinueReadingEntry | null {
  const [progress] = useLocalStorage<ProgressMap>('idl-reading-progress', {});

  return useMemo(() => {
    const entries = Object.entries(progress)
      .filter(([, p]) => p.scrollPercent > 1 && p.scrollPercent < 98)
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt);

    for (const [slug, p] of entries) {
      if (slug === DEMO_BOOK_SLUG) {
        const page = p.pageNumber ?? Math.max(1, Math.round((p.scrollPercent / 100) * demoIslamicBook.totalPages));
        return {
          book: demoAsBook(),
          percent: Math.round(p.scrollPercent),
          updatedAt: p.updatedAt,
          readHref: `/library/${DEMO_BOOK_SLUG}/read/${page}`,
          authorLabel: demoIslamicBook.author,
          langCode: 'EN',
        };
      }

      const book = books.find((b) => b.slug === slug);
      if (book) {
        return {
          book,
          percent: Math.round(p.scrollPercent),
          updatedAt: p.updatedAt,
          readHref: `/books/${book.slug}/read`,
          authorLabel: 'Authentic Islamic Books',
          langCode: 'EN',
        };
      }
    }
    return null;
  }, [progress, books]);
}
