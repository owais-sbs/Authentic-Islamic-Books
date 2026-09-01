import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Layers, FileText, ChevronRight } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookCover } from '@/components/book/BookCover';
import { BookBookmarkButton } from '@/components/book/BookBookmarkButton';
import { getBookBySlug } from '@/data/books';
import { getScholarById } from '@/data/scholars';
import { getCategoryById } from '@/data/categories';
import { countAllSections, estimateReadingTime } from '@/data/books';
import { formatHijriRange } from '@/data/periods';
import { getReaderUnits } from '@/lib/readerSections';
import { NotFoundPage } from './NotFoundPage';

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const book = slug ? getBookBySlug(slug) : undefined;

  if (!book) return <NotFoundPage />;

  const scholar = getScholarById(book.authorId);
  const categories = book.categoryIds.map((id) => getCategoryById(id)).filter(Boolean);
  const sectionCount = countAllSections(book);
  const readingTime = estimateReadingTime(book);
  const units = getReaderUnits(book);

  return (
    <PageContainer>
      <div className="container-page py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Library', href: '/library' },
            { label: book.title },
          ]}
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-12"
        >
          <div className="sm:col-span-4 lg:col-span-3">
            <div className="flex justify-center sm:justify-start">
              <BookCover book={book} size="lg" />
            </div>
          </div>

          <div className="sm:col-span-8 lg:col-span-9">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {categories.map(
                (cat) => cat && <Badge key={cat.id} variant="accent">{cat.name}</Badge>
              )}
              <Badge variant="muted">{formatHijriRange(book.hijriStart, book.hijriEnd)}</Badge>
            </div>

            <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="mt-2 text-lg text-ink-500">{book.subtitle}</p>
            )}

            {scholar && (
              <Link
                to={`/scholars/${scholar.slug}`}
                className="mt-3 inline-block text-sm font-medium text-ink-700 transition-colors hover:text-accent-dark"
              >
                by {scholar.name}
              </Link>
            )}

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
              {book.longDescription || book.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-6 border-t border-line pt-6">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-ink-400" />
                <div>
                  <p className="text-xs text-ink-400">Chapters</p>
                  <p className="text-sm font-semibold text-ink-900">{book.chapters.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-ink-400" />
                <div>
                  <p className="text-xs text-ink-400">Sections</p>
                  <p className="text-sm font-semibold text-ink-900">{sectionCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-ink-400" />
                <div>
                  <p className="text-xs text-ink-400">Reading Time</p>
                  <p className="text-sm font-semibold text-ink-900">{readingTime}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link to={`/books/${book.slug}/read`}>
                <Button size="lg">
                  <BookOpen size={18} /> Start Reading
                </Button>
              </Link>

              <BookBookmarkButton
                slug={book.slug}
                title={book.title}
                coverColor={book.coverColor}
                coverUrl={book.coverUrl}
                size="lg"
                showLabel
              />
            </div>
          </div>
        </motion.div>

        <div id="contents" className="scroll-mt-24">
          <h2 className="mb-5 font-serif text-2xl font-semibold text-ink-900">
            Table of Contents
          </h2>
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            {units.length === 0 ? (
              <p className="px-6 py-8 text-sm text-ink-500">No readable sections yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {units.map((unit) => (
                  <li key={unit.id}>
                    <Link
                      to={`/books/${book.slug}/read#${unit.id}`}
                      className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream/80 sm:px-6"
                    >
                      <span className="w-8 shrink-0 text-sm font-semibold tabular-nums text-accent">
                        {unit.displayNumber}.
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink-800">{unit.title}</span>
                        {unit.chapterTitle && (
                          <span className="mt-0.5 block text-xs text-ink-400">{unit.chapterTitle}</span>
                        )}
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-ink-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
