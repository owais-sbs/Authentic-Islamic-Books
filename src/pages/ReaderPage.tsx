import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getBookBySlug } from '@/data/books';
import { fetchPublishedBookBySlug } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { NotFoundPage } from './NotFoundPage';
import { PageContainer } from '@/components/layout/PageContainer';
import { ScholarlyEditionBook } from '@/components/library-demo/ScholarlyEditionBook';
import type { Book } from '@/types';

/**
 * Full book reader — Format 06 Complete Scholarly Edition layout
 * (same presentation as the Format 06 card on /library).
 */
export function ReaderPage() {
  const { slug } = useParams<{ slug: string }>();

  const [book, setBook] = useState<Book | undefined>(() => {
    const cached = slug ? getBookBySlug(slug) : undefined;
    return cached?.contentPending ? undefined : cached;
  });
  const [loading, setLoading] = useState(!book && isSupabaseConfigured());
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (book || !slug) return;
    if (!isSupabaseConfigured()) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPublishedBookBySlug(slug)
      .then((found) => {
        if (found) setBook(found);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, book]);

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

  return (
    <PageContainer>
      <ScholarlyEditionBook
        book={book}
        backHref="/"
        backLabel="Back to Home"
      />
    </PageContainer>
  );
}
