import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Clock, Layers, FileText, Bookmark,
  ChevronDown, Plus, Minus,
} from 'lucide-react';
import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookCover } from '@/components/book/BookCover';
import { ContentRenderer } from '@/components/reader/ContentRenderer';
import { getBookBySlug } from '@/data/books';
import { getScholarById } from '@/data/scholars';
import { getCategoryById } from '@/data/categories';
import { countAllSections, estimateReadingTime } from '@/data/books';
import { formatHijriRange } from '@/data/periods';
import { NotFoundPage } from './NotFoundPage';
import { cn } from '@/lib/utils';
import type { BookSection, BookChapter } from '@/types';

// ─── Section Accordion ────────────────────────────────────────────────────────
function SectionAccordion({ section, depth = 0 }: { section: BookSection; depth?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-200',
        open
          ? 'border-accent/30 bg-paper shadow-sm'
          : 'border-line bg-cream hover:border-accent/20 hover:shadow-sm'
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5 sm:py-4"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="text-xs tabular-nums font-semibold text-accent shrink-0">
            {section.number}
          </span>
          <span
            className={cn(
              'font-semibold leading-snug break-words',
              depth === 0
                ? 'text-[14px] sm:text-[15px] text-ink-800'
                : 'text-[13px] text-ink-700'
            )}
          >
            {section.title}
          </span>
        </span>
        <span className={cn('shrink-0 transition-colors', open ? 'text-accent' : 'text-ink-400')}>
          {open ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-accent/10 px-4 pt-4 pb-5 sm:px-5 sm:pt-5 sm:pb-6">
              {section.content && (
                <ContentRenderer blocks={section.content} fontSize={16} lineHeight={1.75} />
              )}
              {section.subsections && section.subsections.length > 0 && (
                <div className="mt-4 space-y-2">
                  {section.subsections.map((sub) => (
                    <SectionAccordion key={sub.id} section={sub} depth={depth + 1} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Chapter Accordion ────────────────────────────────────────────────────────
function ChapterAccordion({
  chapter,
  chapterIndex,
}: {
  chapter: BookChapter;
  chapterIndex: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        'rounded-2xl border-2 transition-all duration-200',
        open
          ? 'border-accent/40 bg-cream shadow-md'
          : 'border-line bg-cream hover:border-accent/25 hover:shadow-sm'
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full',
            'text-xs sm:text-sm font-bold tabular-nums transition-colors',
            open ? 'bg-accent text-ink-900' : 'bg-accent/10 text-accent'
          )}
        >
          {String(chapterIndex + 1).padStart(2, '0')}
        </span>

        <span className="flex-1 min-w-0">
          <span
            className={cn(
              'block text-[15px] sm:text-[16px] font-bold leading-snug break-words',
              open ? 'text-ink-900' : 'text-ink-800'
            )}
          >
            Chapter {chapter.number} — {chapter.title}
          </span>
          {chapter.description && !open && (
            <span className="mt-0.5 block text-[12px] sm:text-[13px] text-ink-400 leading-snug">
              {chapter.description}
            </span>
          )}
        </span>

        <span className={cn('shrink-0 transition-transform duration-200', open ? 'rotate-180' : '')}>
          <ChevronDown size={18} className={open ? 'text-accent' : 'text-ink-400'} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-accent/10 px-3 pt-4 pb-5 space-y-2 sm:px-6 sm:pt-6 sm:pb-7 sm:space-y-3">
              {chapter.sections.map((section) => (
                <SectionAccordion key={section.id} section={section} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Introduction Accordion ───────────────────────────────────────────────────
function IntroAccordion({
  book,
}: {
  book: NonNullable<ReturnType<typeof getBookBySlug>>;
}) {
  const [open, setOpen] = useState(false);
  if (!book.introduction) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border-2 transition-all duration-200',
        open
          ? 'border-accent/40 bg-cream shadow-md'
          : 'border-line bg-cream hover:border-accent/25 hover:shadow-sm'
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 text-left"
        aria-expanded={open}
      >
        <span
          className={cn(
            'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full transition-colors',
            open ? 'bg-accent text-ink-900' : 'bg-accent/10 text-accent'
          )}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        </span>
        <span className="flex-1 min-w-0">
          <span
            className={cn(
              'block text-[15px] sm:text-[16px] font-bold leading-snug',
              open ? 'text-ink-900' : 'text-ink-800'
            )}
          >
            Introduction
          </span>
          {!open && (
            <span className="mt-0.5 block text-[12px] sm:text-[13px] text-ink-400 leading-snug">
              Overview of the Islamic intellectual tradition
            </span>
          )}
        </span>
        <span className={cn('shrink-0 transition-transform duration-200', open ? 'rotate-180' : '')}>
          <ChevronDown size={18} className={open ? 'text-accent' : 'text-ink-400'} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-accent/10 px-4 pt-5 pb-6 sm:px-6 sm:pt-6 sm:pb-7">
              <ContentRenderer blocks={book.introduction} fontSize={16} lineHeight={1.75} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Scroll helper ────────────────────────────────────────────────────────────
function scrollToContents() {
  const el = document.getElementById('contents');
  if (el) {
    const offset = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const book = slug ? getBookBySlug(slug) : undefined;

  if (!book) return <NotFoundPage />;

  const scholar = getScholarById(book.authorId);
  const categories = book.categoryIds.map((id) => getCategoryById(id)).filter(Boolean);
  const sectionCount = countAllSections(book);
  const readingTime = estimateReadingTime(book);

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
              {categories.map(
                (cat) => cat && <Badge key={cat.id} variant="accent">{cat.name}</Badge>
              )}
              <Badge variant="muted">{formatHijriRange(book.hijriStart, book.hijriEnd)}</Badge>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900">
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

            {/* CTAs — all stay on this page */}
            <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
              {/* Start Reading scrolls down to contents */}
              <button onClick={scrollToContents}>
                <Button size="lg">
                  <BookOpen size={18} /> Start Reading
                </Button>
              </button>

              {/* View Contents also scrolls to contents */}
              <button onClick={scrollToContents}>
                <Button variant="outline" size="lg">
                  View Contents
                </Button>
              </button>

              <Link to="/bookmarks">
                <Button variant="ghost" size="lg">
                  <Bookmark size={16} /> Bookmark
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Table of Contents — inline accordion */}
        <div id="contents" className="scroll-mt-24">
          <h2 className="mb-5 font-serif text-2xl font-semibold text-ink-900">
            Table of Contents
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {book.introduction && <IntroAccordion book={book} />}
            {book.chapters.map((chapter, idx) => (
              <ChapterAccordion key={chapter.id} chapter={chapter} chapterIndex={idx} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
