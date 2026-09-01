import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Layers, FileText, ChevronDown, Plus, Minus } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookCover } from '@/components/book/BookCover';
import { BookBookmarkButton } from '@/components/book/BookBookmarkButton';
import { ContentRenderer } from '@/components/reader/ContentRenderer';
import { getBookBySlug } from '@/data/books';
import { getScholarById } from '@/data/scholars';
import { getCategoryById } from '@/data/categories';
import { countAllSections, estimateReadingTime } from '@/data/books';
import { formatHijriRange } from '@/data/periods';
import { NotFoundPage } from './NotFoundPage';
import { cn } from '@/lib/utils';
import type { BookSection, BookChapter, Book, ContentBlock } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scrollToContents() {
  const el = document.getElementById('contents');
  if (el) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }
}

// ─── Section accordion ────────────────────────────────────────────────────────
// Shown inside a chapter — e.g. "1.1 Background"
function SectionAccordion({ section, depth = 0 }: { section: BookSection; depth?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(
      'rounded-xl border transition-all duration-200',
      open ? 'border-accent/30 bg-paper shadow-sm' : 'border-line bg-cream hover:border-accent/20 hover:shadow-sm'
    )}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left sm:px-5 sm:py-3.5"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="w-8 shrink-0 text-xs tabular-nums font-semibold text-accent">
            {section.number}
          </span>
          <span className={cn(
            'font-medium leading-snug break-words',
            depth === 0 ? 'text-[14px] text-ink-800' : 'text-[13px] text-ink-700'
          )}>
            {section.title}
          </span>
        </span>
        <span className={cn('shrink-0 transition-colors', open ? 'text-accent' : 'text-ink-400')}>
          {open ? <Minus size={14} /> : <Plus size={14} />}
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
            <div className="border-t border-accent/10 px-4 pt-4 pb-5 sm:px-5">
              {section.content && section.content.length > 0 ? (
                <ContentRenderer blocks={section.content} fontSize={16} lineHeight={1.75} />
              ) : (
                <p className="text-sm italic text-ink-400">No content available for this section.</p>
              )}
              {section.subsections && section.subsections.length > 0 && (
                <div className="mt-4 space-y-2">
                  {section.subsections.map(sub => (
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

// ─── Chapter accordion ────────────────────────────────────────────────────────
// Shows "Chapter N — Title" row; expands to show its sections
function ChapterAccordion({ chapter, chapterIndex }: { chapter: BookChapter; chapterIndex: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(
      'rounded-2xl border-2 transition-all duration-200',
      open ? 'border-accent/40 bg-cream shadow-md' : 'border-line bg-cream hover:border-accent/25 hover:shadow-sm'
    )}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-4 px-4 py-4 text-left sm:gap-5 sm:px-6 sm:py-5"
        aria-expanded={open}
      >
        {/* Chapter number badge */}
        <span className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors sm:h-9 sm:w-9 sm:text-sm',
          open ? 'bg-accent text-ink-900' : 'bg-accent/10 text-accent'
        )}>
          {String(chapterIndex + 1).padStart(2, '0')}
        </span>

        <span className="min-w-0 flex-1">
          <span className={cn(
            'block text-[15px] font-bold leading-snug break-words sm:text-[16px]',
            open ? 'text-ink-900' : 'text-ink-800'
          )}>
            Chapter {chapter.number} — {chapter.title}
          </span>
          {!open && chapter.description && (
            <span className="mt-0.5 block text-[12px] leading-snug text-ink-400 sm:text-[13px]">
              {chapter.description}
            </span>
          )}
          {!open && chapter.sections.length > 0 && (
            <span className="mt-0.5 block text-[11px] text-ink-300">
              {chapter.sections.length} section{chapter.sections.length !== 1 ? 's' : ''}
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
            <div className="space-y-2 border-t-2 border-accent/10 px-3 pt-4 pb-5 sm:space-y-2.5 sm:px-6 sm:pt-5 sm:pb-6">
              {chapter.sections.length === 0 ? (
                <p className="px-2 text-sm italic text-ink-400">No sections in this chapter.</p>
              ) : (
                chapter.sections.map(section => (
                  <SectionAccordion key={section.id} section={section} />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Introduction accordion ───────────────────────────────────────────────────
function IntroAccordion({ book }: { book: Book }) {
  const [open, setOpen] = useState(false);
  if (!book.introduction || book.introduction.length === 0) return null;

  return (
    <div className={cn(
      'rounded-2xl border-2 transition-all duration-200',
      open ? 'border-accent/40 bg-cream shadow-md' : 'border-line bg-cream hover:border-accent/25 hover:shadow-sm'
    )}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-4 px-4 py-4 text-left sm:gap-5 sm:px-6 sm:py-5"
        aria-expanded={open}
      >
        <span className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors sm:h-9 sm:w-9',
          open ? 'bg-accent text-ink-900' : 'bg-accent/10 text-accent'
        )}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
          </svg>
        </span>

        <span className="min-w-0 flex-1">
          <span className={cn(
            'block text-[15px] font-bold leading-snug sm:text-[16px]',
            open ? 'text-ink-900' : 'text-ink-800'
          )}>
            Introduction
          </span>
          {!open && (
            <span className="mt-0.5 block text-[12px] text-ink-400 sm:text-[13px]">
              Overview and opening remarks
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
            <div className="border-t-2 border-accent/10 px-4 pt-5 pb-6 sm:px-6">
              <ContentRenderer
                blocks={book.introduction as ContentBlock[]}
                fontSize={16}
                lineHeight={1.75}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const book = slug ? getBookBySlug(slug) : undefined;
  if (!book) return <NotFoundPage />;

  const scholar   = getScholarById(book.authorId);
  const authorName =
    scholar?.name ??
    (book as Book & { authorName?: string }).authorName ??
    null;
  const categories  = book.categoryIds.map(id => getCategoryById(id)).filter(Boolean);
  const sectionCount = countAllSections(book);
  const readingTime  = estimateReadingTime(book);

  return (
    <PageContainer>
      <div className="container-page py-8">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Library', href: '/library' },
          { label: book.title },
        ]} />

        {/* ── Book header ─────────────────────────────────────────────── */}
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

          {/* Meta */}
          <div className="sm:col-span-8 lg:col-span-9">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {categories.map(cat => cat && (
                <Badge key={cat.id} variant="accent">{cat.name}</Badge>
              ))}
              <Badge variant="muted">{formatHijriRange(book.hijriStart, book.hijriEnd)}</Badge>
            </div>

            <h1 className="font-serif text-3xl font-semibold text-ink-900 sm:text-4xl">
              {book.title}
            </h1>
            {book.subtitle && (
              <p className="mt-2 text-lg text-ink-500">{book.subtitle}</p>
            )}

            {authorName && (
              scholar
                ? <Link to={`/scholars/${scholar.slug}`} className="mt-3 inline-block text-sm font-medium text-ink-700 transition-colors hover:text-accent-dark">by {authorName}</Link>
                : <p className="mt-3 text-sm text-ink-600">by {authorName}</p>
            )}

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">
              {book.longDescription || book.description}
            </p>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6 border-t border-line pt-6">
              {[
                { icon: Layers,   label: 'Chapters',     value: book.chapters.length },
                { icon: FileText, label: 'Sections',     value: sectionCount },
                { icon: Clock,    label: 'Reading Time', value: readingTime },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={16} className="text-ink-400" />
                  <div>
                    <p className="text-xs text-ink-400">{label}</p>
                    <p className="text-sm font-semibold text-ink-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs — full width on mobile, inline on desktop */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              {/* Start Reading */}
              <button
                type="button"
                onClick={scrollToContents}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink-900 px-6 py-3 text-base font-medium text-cream transition-all hover:bg-ink-800 sm:w-auto"
              >
                <BookOpen size={18} /> Start Reading
              </button>

              {/* View Contents */}
              <button
                type="button"
                onClick={scrollToContents}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-strong bg-transparent px-6 py-3 text-base font-medium text-ink-900 transition-all hover:border-ink-900 hover:bg-paper sm:w-auto"
              >
                View Contents
              </button>

              {/* Save Book */}
              <BookBookmarkButton
                slug={book.slug}
                title={book.title}
                coverColor={book.coverColor}
                coverUrl={book.coverUrl}
                size="lg"
                showLabel
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Table of Contents ─────────────────────────────────────── */}
        <div id="contents" className="scroll-mt-24">
          <h2 className="mb-5 font-serif text-2xl font-semibold text-ink-900">
            Table of Contents
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {/* Introduction row */}
            <IntroAccordion book={book} />

            {/* Chapter rows — each expands to show section sub-rows */}
            {book.chapters.map((chapter, idx) => (
              <ChapterAccordion key={chapter.id} chapter={chapter} chapterIndex={idx} />
            ))}

            {book.chapters.length === 0 && !book.introduction && (
              <p className="rounded-xl border border-line bg-cream px-6 py-8 text-center text-sm text-ink-500">
                No content available yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
