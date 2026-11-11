import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, List, Play } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { getBookBySlug } from '@/data/books';
import { fetchPublishedBookBySlug, getSupabasePublishedCache } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { getScholarById } from '@/data/scholars';
import { categories as allCategories } from '@/data/categories';
import { resolveAuthorName } from '@/features/books/components/resolveAuthorName';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { getBookPageCount, getReaderPages } from '@/lib/readerPages';
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

function MetaRow({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === '' || value === '—') return null;
  return (
    <div className="flex flex-col gap-0.5 border-b border-line/70 py-2 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-ink-400 sm:w-28">
        {label}
      </dt>
      <dd className="min-w-0 break-words text-[14px] text-ink-800" dir="auto">
        {value}
      </dd>
    </div>
  );
}

/**
 * Public book detail — metadata + Start Reading.
 * Full reading experience lives at /books/:slug/read.
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

  const { savedProgress } = useReadingProgress(slug || '');

  usePageMeta({
    title: book
      ? `${book.title} — Islamic Digital Library`
      : 'Book — Islamic Digital Library',
    description:
      book?.description?.slice(0, 160) ||
      'Read authentic Islamic scholarship.',
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

  const meta = useMemo(() => {
    if (!book) return null;
    const scholar = getScholarById(book.authorId);
    const authorName =
      book.authorName?.trim() ||
      scholar?.name ||
      resolveAuthorName(book.authorName, book.authorId);
    const cats = book.categoryIds
      .map((id) => allCategories.find((c) => c.id === id)?.name)
      .filter(Boolean) as string[];
    const pages = getReaderPages(book);
    const pageCount = getBookPageCount(book, pages);
    const resumePage = savedProgress?.pageNumber
      ? Math.min(Math.max(1, savedProgress.pageNumber), pages.length || 1)
      : 1;
    const resumeHref = `/books/${book.slug}/read/${resumePage}`;
    const sectionFirstPage = new Map<string, number>();
    for (const p of pages) {
      if (p.sectionId && !sectionFirstPage.has(p.sectionId)) {
        sectionFirstPage.set(p.sectionId, p.pageNumber);
      }
    }
    return { authorName, cats, resumeHref, scholar, pageCount, pages, sectionFirstPage };
  }, [book, savedProgress]);

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

  if (notFound || !book || !meta) return <NotFoundPage />;

  const displayEnglish = book.englishTitle?.trim() || book.title;
  const hasProgress = (savedProgress?.scrollPercent ?? 0) > 2;

  return (
    <PageContainer>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition-colors hover:text-accent-dark"
        >
          <ArrowLeft size={15} />
          Back to Home
        </Link>

        <div className="mt-6 grid gap-8 sm:grid-cols-[160px_1fr] lg:grid-cols-[180px_1fr]">
          <div
            className="mx-auto aspect-[3/4] w-36 overflow-hidden rounded-sm border border-line shadow-md sm:mx-0 sm:w-full"
            style={
              book.coverUrl
                ? undefined
                : {
                    background:
                      book.coverColor ||
                      'linear-gradient(155deg, #0B1929 0%, #1A3A2A 55%, #C9A84C55 100%)',
                  }
            }
          >
            {book.coverUrl ? (
              <img src={book.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-3 text-center">
                <p className="line-clamp-6 font-cinzel text-[12px] text-white/90">{book.title}</p>
              </div>
            )}
          </div>

          <div className="min-w-0">
            {book.originalArabicTitle && (
              <p
                className="mb-2 break-words font-[Scheherazade_New,Noto_Naskh_Arabic,Amiri,serif] text-xl leading-relaxed text-ink-800 sm:text-2xl"
                dir="rtl"
                lang="ar"
              >
                {book.originalArabicTitle}
              </p>
            )}
            <h1 className="break-words font-cinzel text-xl font-semibold leading-snug text-ink-900 sm:text-2xl lg:text-3xl">
              {displayEnglish}
            </h1>
            {book.subtitle && (
              <p className="mt-1 break-words font-serif text-[15px] text-ink-500">{book.subtitle}</p>
            )}
            {meta.authorName && meta.authorName !== '—' && (
              <p className="mt-2 text-[14px] text-ink-600">
                by{' '}
                {meta.scholar ? (
                  <Link
                    to={`/scholars/${meta.scholar.slug || meta.scholar.id}`}
                    className="underline-offset-2 hover:text-accent-dark hover:underline"
                  >
                    {meta.authorName}
                  </Link>
                ) : (
                  meta.authorName
                )}
              </p>
            )}

            <p className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500">
              <FileText size={14} className="text-accent-dark" aria-hidden />
              {meta.pageCount} {meta.pageCount === 1 ? 'page' : 'pages'}
              <span className="text-ink-300">·</span>
              {book.volumeLabel || 'Single volume'}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to={meta.resumeHref}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[14px] font-semibold text-ink-900 transition-colors hover:bg-accent-dark sm:w-auto"
              >
                {hasProgress ? <Play size={16} /> : <BookOpen size={16} />}
                {hasProgress ? 'Continue Reading' : 'Read Book'}
              </Link>
              {hasProgress && (
                <span className="self-center text-[12px] text-ink-400">
                  Page {savedProgress?.pageNumber ?? 1} · {Math.round(savedProgress!.scrollPercent)}%
                </span>
              )}
            </div>

            <dl className="mt-6">
              <MetaRow label="Translator" value={book.translator} />
              <MetaRow label="Publisher" value={book.publisher} />
              <MetaRow
                label="Published"
                value={
                  book.publicationYear ??
                  (book.publishedYear && book.publishedYear !== 'undefined'
                    ? book.publishedYear
                    : undefined)
                }
              />
              <MetaRow
                label="Hijri"
                value={
                  book.hijriStart != null || book.hijriEnd != null
                    ? book.hijriEnd != null && book.hijriEnd !== book.hijriStart
                      ? `${book.hijriStart ?? '—'}–${book.hijriEnd}`
                      : String(book.hijriStart ?? book.hijriEnd)
                    : undefined
                }
              />
              <MetaRow label="Language" value={book.language} />
              <MetaRow label="Volume" value={book.volumeLabel || 'Single volume'} />
              <MetaRow label="Pages" value={meta.pageCount} />
              <MetaRow label="Category" value={meta.cats.length ? meta.cats.join(', ') : undefined} />
              <MetaRow label="ISBN" value={book.isbn} />
            </dl>
          </div>
        </div>

        {(book.description || book.longDescription) && (
          <section className="mt-8 rounded-2xl border border-line bg-cream/60 p-5 sm:p-6 dark:bg-white/[0.03]">
            <h2 className="font-serif text-lg font-semibold text-ink-900 dark:text-white">About</h2>
            <p className="mt-3 font-serif text-[15px] leading-relaxed text-ink-700 dark:text-white/75">
              {book.longDescription || book.description}
            </p>
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-line bg-cream/60 p-5 sm:p-6 dark:bg-white/[0.03]">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink-900 dark:text-white">
            <List size={18} className="text-accent-dark" aria-hidden />
            Table of contents
          </h2>
          {book.chapters.length > 0 ? (
            <ol className="mt-4 space-y-1">
              {book.chapters
                .filter((ch) => {
                  const t = (ch.title || '').trim();
                  // Skip copyright / publisher noise mistaken for chapters
                  if (/^[\(©]|^copyright\b/i.test(t)) return false;
                  if (t.length < 3) return false;
                  return true;
                })
                .map((ch) => {
                const firstSec = ch.sections[0];
                const page =
                  (firstSec && meta.sectionFirstPage.get(firstSec.id)) ||
                  meta.sectionFirstPage.get(ch.id) ||
                  1;
                const chapterLabel = ch.title || `Chapter ${ch.number}`;
                const showSections =
                  ch.sections.length > 1 &&
                  !(
                    ch.sections.length > 3 &&
                    ch.sections.every((s) => /^Page\s+\d+$/i.test(s.title || ''))
                  );
                return (
                  <li key={ch.id}>
                    <Link
                      to={`/books/${book.slug}/read/${page}`}
                      className="flex items-start gap-3 rounded-lg px-2 py-2.5 text-[14px] text-ink-700 transition-colors hover:bg-white/80 hover:text-ink-900 dark:text-white/80 dark:hover:bg-white/5"
                    >
                      <FileText size={16} className="mt-0.5 shrink-0 text-ink-400" aria-hidden />
                      <span className="min-w-0 flex-1 break-words">
                        {chapterLabel}
                      </span>
                      <span className="shrink-0 tabular-nums text-[12px] text-ink-400">
                        p.{page}
                      </span>
                    </Link>
                    {showSections &&
                      ch.sections.map((sec) => {
                        const secPage = meta.sectionFirstPage.get(sec.id) ?? page;
                        return (
                          <Link
                            key={sec.id}
                            to={`/books/${book.slug}/read/${secPage}`}
                            className="ml-7 flex items-start gap-3 rounded-lg px-2 py-1.5 text-[13px] text-ink-600 transition-colors hover:bg-white/80 dark:text-white/65 dark:hover:bg-white/5"
                          >
                            <span className="min-w-0 flex-1 break-words">
                              {sec.title || `Section ${sec.number}`}
                            </span>
                            <span className="shrink-0 tabular-nums text-[11px] text-ink-400">
                              p.{secPage}
                            </span>
                          </Link>
                        );
                      })}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-3 text-[14px] text-ink-500">
              Open the reader to browse {meta.pageCount} pages in this volume.
            </p>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
