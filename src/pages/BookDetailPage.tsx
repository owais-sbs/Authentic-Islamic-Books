import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Layers, FileText, Bookmark, ArrowRight, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookCover } from '@/components/book/BookCover';
import { getBookBySlug } from '@/data/books';
import { getScholarById } from '@/data/scholars';
import { getCategoryById } from '@/data/categories';
import { countAllSections, estimateReadingTime } from '@/data/books';
import { formatHijriRange } from '@/data/periods';
import { NotFoundPage } from './NotFoundPage';
import { cn } from '@/lib/utils';

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const book = slug ? getBookBySlug(slug) : undefined;

  if (!book) return <NotFoundPage />;

  const scholar = getScholarById(book.authorId);
  const categories = book.categoryIds.map((id) => getCategoryById(id)).filter(Boolean);
  const sectionCount = countAllSections(book);
  const readingTime = estimateReadingTime(book);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set([book.chapters[0]?.id])
  );

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

        {/* Book header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-12"
        >
          {/* Cover */}
          <div className="sm:col-span-4 lg:col-span-3">
            <div className="flex justify-center sm:justify-start">
              <BookCover book={book} size="lg" />
            </div>
          </div>

          {/* Info */}
          <div className="sm:col-span-8 lg:col-span-9">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {categories.map((cat) => cat && <Badge key={cat.id} variant="accent">{cat.name}</Badge>)}
              <Badge variant="muted">{formatHijriRange(book.hijriStart, book.hijriEnd)}</Badge>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900">{book.title}</h1>
            {book.subtitle && <p className="mt-2 text-lg text-ink-500">{book.subtitle}</p>}

            {scholar && (
              <Link
                to={`/scholars/${scholar.slug}`}
                className="mt-3 inline-block text-sm font-medium text-ink-700 transition-colors hover:text-accent-dark"
              >
                by {scholar.name}
              </Link>
            )}

            <p className="mt-4 text-base leading-relaxed text-ink-600 max-w-2xl">
              {book.longDescription || book.description}
            </p>

            {/* Stats */}
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

            {/* CTAs */}
            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
              <Link to={`/books/${book.slug}/read`}>
                <Button size="lg">
                  <BookOpen size={18} /> Start Reading
                </Button>
              </Link>
              <a href="#contents">
                <Button variant="outline" size="lg">
                  View Contents
                </Button>
              </a>
              <Link to="/bookmarks">
                <Button variant="ghost" size="lg">
                  <Bookmark size={16} /> Bookmark
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Table of Contents */}
        <div id="contents" className="scroll-mt-24">
          <h2 className="mb-6 font-serif text-2xl font-semibold text-ink-900">Table of Contents</h2>
          <div className="rounded-xl border border-line bg-cream p-4 sm:p-6">
            {book.introduction && (
              <div className="mb-2">
                <Link
                  to={`/books/${book.slug}/read#introduction`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-ink-700 transition-colors hover:bg-paper hover:text-ink-900"
                >
                  <ChevronRight size={14} className="text-ink-400" />
                  Introduction
                </Link>
              </div>
            )}
            {book.chapters.map((chapter) => {
              const expanded = expandedChapters.has(chapter.id);
              return (
                <div key={chapter.id} className="mb-1">
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-ink-900 transition-colors hover:bg-paper"
                  >
                    {expanded ? <ChevronDown size={14} className="text-ink-400" /> : <ChevronRight size={14} className="text-ink-400" />}
                    <span className="text-xs text-ink-400 tabular-nums">{chapter.number}.</span>
                    {chapter.title}
                  </button>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-5 border-l border-line pl-3">
                        {chapter.sections.map((section) => (
                          <Link
                            key={section.id}
                            to={`/books/${book.slug}/read#${section.id}`}
                            className="flex items-baseline gap-2 rounded-md px-2 py-1 text-sm text-ink-600 transition-colors hover:bg-paper hover:text-ink-900"
                          >
                            <span className="text-xs text-ink-400 tabular-nums">{section.number}</span>
                            {section.title}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Read CTA at bottom */}
        <div className="mt-12 rounded-xl bg-ink-900 px-6 py-8 text-center sm:px-12">
          <h3 className="font-serif text-xl font-semibold text-cream">Ready to begin?</h3>
          <p className="mt-2 text-sm text-ink-300">Start reading {book.title} in the structured reader.</p>
          <Link
            to={`/books/${book.slug}/read`}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cream px-6 py-3 text-sm font-medium text-ink-900 transition-all hover:bg-paper"
          >
            <BookOpen size={16} /> Start Reading <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
