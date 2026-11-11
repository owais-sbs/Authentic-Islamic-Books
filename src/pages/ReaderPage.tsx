import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getBookBySlug } from '@/data/books';
import {
  fetchPublishedBookBySlug,
  getSupabasePublishedCache,
  invalidatePublishedBookCache,
} from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { NotFoundPage } from './NotFoundPage';
import { BookReader } from '@/components/reader/BookReader';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { Book } from '@/types';

function resolveBookSync(slug: string): Book | undefined {
  const fromLookup = getBookBySlug(slug);
  if (fromLookup && !fromLookup.contentPending) return fromLookup;
  const fromCache = getSupabasePublishedCache().find((b) => b.slug === slug);
  if (fromCache && !fromCache.contentPending) return fromCache;
  return getAllImportedBooks().find((b) => b.slug === slug && !b.contentPending);
}

/**
 * Full-book reader — page-by-page (PDF-aligned when markers exist).
 * Routes: /books/:slug/read and /books/:slug/read/:pageNumber
 */
export function ReaderPage() {
  const { slug, pageNumber } = useParams<{ slug: string; pageNumber?: string }>();

  const [book, setBook] = useState<Book | undefined>(() =>
    slug ? resolveBookSync(slug) : undefined,
  );
  const [loading, setLoading] = useState(!book && isSupabaseConfigured());
  const [notFound, setNotFound] = useState(false);

  usePageMeta({
    title: book
      ? `${book.title}${pageNumber ? ` — Page ${pageNumber}` : ''} — Reader`
      : 'Reader — Islamic Digital Library',
    description: book?.description?.slice(0, 160) || 'Read authentic Islamic scholarship.',
    path: slug
      ? pageNumber
        ? `/books/${slug}/read/${pageNumber}`
        : `/books/${slug}/read`
      : undefined,
  });

  useEffect(() => {
    if (!slug) return;
    const cached = resolveBookSync(slug);
    if (cached) {
      setBook(cached);
      setLoading(false);
      setNotFound(false);
    }
    if (!isSupabaseConfigured()) {
      if (!cached) {
        setNotFound(true);
        setLoading(false);
      }
      return;
    }
    if (!cached) setLoading(true);
    let cancelled = false;
    // Bust cache then re-fetch so Arabic / images / attachments from admin show up
    invalidatePublishedBookCache(slug);
    fetchPublishedBookBySlug(slug)
      .then((found) => {
        if (cancelled) return;
        if (found) {
          setBook(found);
          setNotFound(false);
        } else if (!cached) {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled && !cached) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // /books/:slug/read → /books/:slug/read/1
  if (!loading && book && !pageNumber) {
    return <Navigate to={`/books/${book.slug}/read/1`} replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="text-sm text-ink-400">Loading book…</p>
        </div>
      </div>
    );
  }

  if (notFound || !book) return <NotFoundPage />;

  return <BookReader book={book} />;
}
