import { useState, useEffect, useMemo } from 'react';
import type { Book } from '@/types';
import type { IslamicMockBook } from '@/data/mockIslamicBooks';
import {
  ALL_MOCK_BOOKS,
  TOP_FREE_BOOKS as FALLBACK_TOP_FREE,
  QURAN_BOOKS as FALLBACK_QURAN,
  HADITH_BOOKS as FALLBACK_HADITH,
  SUNNAH_BOOKS as FALLBACK_SUNNAH,
  HISTORY_BOOKS as FALLBACK_HISTORY,
} from '@/data/mockIslamicBooks';
import { getSupabasePublishedCache, refreshSupabasePublishedCache } from '@/lib/bookApi';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getScholarById } from '@/data/scholars';

export function resolveAuthorName(authorId?: string): string {
  if (!authorId) return '';
  const scholar = getScholarById(authorId);
  return scholar?.name || authorId;
}

/** Helper to convert a published database Book to an IslamicMockBook format for UI shelves */
export function publicBookToMockBook(book: Book, index: number = 0): IslamicMockBook {
  const authorName = resolveAuthorName(book.authorId) || (book as unknown as { author_name?: string }).author_name || 'Classical Scholar';
  const categoryIds = book.categoryIds || [];
  
  let cat: 'quran' | 'hadith' | 'sunnah' | 'history' = 'history';
  let catLabel = 'Islamic History';
  if (categoryIds.some((c) => c.toLowerCase().includes('quran') || c.toLowerCase().includes('tafsir'))) {
    cat = 'quran';
    catLabel = "The Noble Qur'an";
  } else if (categoryIds.some((c) => c.toLowerCase().includes('hadith'))) {
    cat = 'hadith';
    catLabel = 'Prophetic Hadith';
  } else if (categoryIds.some((c) => c.toLowerCase().includes('sunnah') || c.toLowerCase().includes('seerah'))) {
    cat = 'sunnah';
    catLabel = 'Sunnah & Seerah';
  }

  // Pre-selected rich themes
  const palette = [
    { color: '#1B4F72', edge: '#0A2335' },
    { color: '#1E3A5F', edge: '#0E1D31' },
    { color: '#2C3E50', edge: '#16202B' },
    { color: '#34495E', edge: '#1A2530' },
  ];
  const theme = palette[index % palette.length];

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    arabicTitle: (book as unknown as { originalArabicTitle?: string; arabicTitle?: string }).originalArabicTitle || (book as unknown as { arabicTitle?: string }).arabicTitle || '',
    author: authorName,
    category: cat,
    categoryLabel: catLabel,
    color: book.coverColor || theme.color,
    edgeColor: theme.edge,
    accentColor: '#D4B445',
    rating: 5.0,
    reviewsCount: 'Verified',
    pages: `${book.chapters?.length ? `${book.chapters.length} chapters` : 'Classical Edition'}`,
    badge: book.featured ? 'Featured' : undefined,
    description: book.description || book.subtitle || 'Authentic classical work from the verified Islamic library.',
    href: `/books/${book.slug}`,
  };
}

export function usePublicBooks() {
  const [importedBooks, setImportedBooks] = useState<Book[]>(getAllImportedBooks);
  const [supabaseBooks, setSupabaseBooks] = useState<Book[]>(getSupabasePublishedCache);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    refreshSupabasePublishedCache().then(setSupabaseBooks).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => {
      setImportedBooks(getAllImportedBooks());
      if (isSupabaseConfigured()) {
        refreshSupabasePublishedCache().then(setSupabaseBooks).catch(() => {});
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('idl-books-changed', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('idl-books-changed', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);

  // Determine active raw books
  const rawPublishedBooks: Book[] = useMemo(() => {
    if (isSupabaseConfigured()) {
      return supabaseBooks;
    }
    return importedBooks;
  }, [supabaseBooks, importedBooks]);

  const hasRealBooks = rawPublishedBooks.length > 0;

  // Real books mapped to mock-compatible structures for carousel/shelves
  const realMappedBooks: IslamicMockBook[] = useMemo(() => {
    return rawPublishedBooks.map((b, idx) => publicBookToMockBook(b, idx));
  }, [rawPublishedBooks]);

  // Top/featured books
  const topBooks: IslamicMockBook[] = useMemo(() => {
    if (hasRealBooks) return realMappedBooks;
    return FALLBACK_TOP_FREE;
  }, [hasRealBooks, realMappedBooks]);

  const quranBooks: IslamicMockBook[] = useMemo(() => {
    if (!hasRealBooks) return FALLBACK_QURAN;
    const filtered = realMappedBooks.filter((b) => b.category === 'quran');
    return filtered.length > 0 ? filtered : realMappedBooks;
  }, [hasRealBooks, realMappedBooks]);

  const hadithBooks: IslamicMockBook[] = useMemo(() => {
    if (!hasRealBooks) return FALLBACK_HADITH;
    const filtered = realMappedBooks.filter((b) => b.category === 'hadith');
    return filtered.length > 0 ? filtered : realMappedBooks;
  }, [hasRealBooks, realMappedBooks]);

  const sunnahBooks: IslamicMockBook[] = useMemo(() => {
    if (!hasRealBooks) return FALLBACK_SUNNAH;
    const filtered = realMappedBooks.filter((b) => b.category === 'sunnah');
    return filtered.length > 0 ? filtered : realMappedBooks;
  }, [hasRealBooks, realMappedBooks]);

  const historyBooks: IslamicMockBook[] = useMemo(() => {
    if (!hasRealBooks) return FALLBACK_HISTORY;
    const filtered = realMappedBooks.filter((b) => b.category === 'history');
    return filtered.length > 0 ? filtered : realMappedBooks;
  }, [hasRealBooks, realMappedBooks]);

  return {
    hasRealBooks,
    rawPublishedBooks,
    allBooks: hasRealBooks ? realMappedBooks : ALL_MOCK_BOOKS,
    topBooks,
    quranBooks,
    hadithBooks,
    sunnahBooks,
    historyBooks,
    featuredBook: (hasRealBooks ? realMappedBooks[0] : FALLBACK_TOP_FREE[0]) || FALLBACK_TOP_FREE[0],
  };
}