import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { ScholarlyEditionBook } from '@/components/library-demo/ScholarlyEditionBook';
import { getBookBySlug } from '@/data/books';
import { fetchPublishedBookBySlug, getSupabasePublishedCache } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { NotFoundPage } from './NotFoundPage';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { Book } from '@/types';

function resolveBookSync(slug: string, stateBook?: Book): Book | undefined {
  if (stateBook?.slug === slug) return stateBook;
  const fromLookup = getBookBySlug(slug);
  if (fromLookup) return fromLookup;
  const fromCache = getSupabasePublishedCache().find((b) => b.slug === slug);
  if (fromCache) return fromCache;
  return getAllImportedBooks().find((b) => b.slug === slug);
}

/**
 * Book page — Format 06 Complete Scholarly Edition.
 * No chapter dropdown / accordion.
 */
export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const stateBook = (location.state as { book?: Book } | null)?.book;

  const [book, setBook] = useState<Book | undefined>(() =>
    slug ? resolveBookSync(slug, stateBook) : undefined,
  );
  const [loading, setLoading] = useState(
    () => !!(slug && !resolveBookSync(slug, stateBook) && isSupabaseConfigured()),
  );
  const [notFound, setNotFound] = useState(false);

  usePageMeta({
    title: book
      ? `${book.title} — Islamic Digital Library`
      : 'Book — Islamic Digital Library',
    description:
      book?.description?.slice(0, 160) ||
      'Read authentic Islamic scholarship in the Complete Scholarly Edition format.',
    path: slug ? `/books/${slug}` : undefined,
  });

  useEffect(() => {
    if (!slug) return;
    const resolved = resolveBookSync(slug, stateBook);
    if (resolved && !resolved.contentPending) {
      setBook(resolved);
      setLoading(false);
      setNotFound(false);
      return;
    }
    if (!isSupabaseConfigured()) {
      setBook(undefined);
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (resolved) setBook(resolved);
    setLoading(!resolved);
    let cancelled = false;
    fetchPublishedBookBySlug(slug)
      .then((found) => {
        if (cancelled) return;
        if (found) {
          setBook(found);
          setNotFound(false);
        } else {
          setBook(undefined);
          setNotFound(true);
        }
      })
      .catch(() => {
        if (cancelled || resolved) return;
        setBook(undefined);
        setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, stateBook]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
            <p className="text-sm text-ink-400">Loading book…</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (notFound || !book) return <NotFoundPage />;

  return (
    <PageContainer>
      <ScholarlyEditionBook book={book} backHref="/" backLabel="Back to Home" />
    </PageContainer>
  );
}
