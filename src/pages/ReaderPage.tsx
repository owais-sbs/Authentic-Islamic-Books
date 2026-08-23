import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Plus, Minus } from 'lucide-react';
import { getBookBySlug } from '@/data/books';
import { getScholarById } from '@/data/scholars';
import { NotFoundPage } from './NotFoundPage';
import { Navbar } from '@/components/layout/Navbar';
import { ReaderHeader } from '@/components/reader/ReaderHeader';
import { ReadingProgress } from '@/components/reader/ReadingProgress';
import { TableOfContents, flattenSections } from '@/components/reader/TableOfContents';
import { ContentRenderer } from '@/components/reader/ContentRenderer';
import { ReaderSearch } from '@/components/reader/ReaderSearch';
import { ReadingSettings } from '@/components/reader/ReadingSettings';
import { ReaderNavigation } from '@/components/reader/ReaderNavigation';
import { Drawer } from '@/components/ui/Drawer';
import { useReaderSettings } from '@/hooks/useReaderSettings';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useBookSearch } from '@/hooks/useBookSearch';
import { cn } from '@/lib/utils';
import type { BookSection, BookChapter } from '@/types';

// ─── Accordion Section ───────────────────────────────────────────────────────
interface SectionAccordionProps {
  section: BookSection;
  fontSize: number;
  lineHeight: number;
  searchOpen: boolean;
  query: string;
  depth?: number;
}

function SectionAccordion({ section, fontSize, lineHeight, searchOpen, query, depth = 0 }: SectionAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      id={section.id}
      className={cn(
        'scroll-mt-32 rounded-xl border transition-all duration-200',
        open
          ? 'border-accent/30 bg-white shadow-sm'
          : 'border-line bg-white hover:border-accent/20 hover:shadow-sm'
      )}
    >
      {/* Section header / toggle */}
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
              open
                ? depth === 0 ? 'text-[15px] text-ink-800' : 'text-[13px] text-ink-700'
                : depth === 0 ? 'text-[15px] text-ink-700' : 'text-[13px] text-ink-600'
            )}
          >
            {section.title}
          </span>
        </span>
        <span className={cn('shrink-0 transition-colors', open ? 'text-accent' : 'text-ink-400')}>
          {open ? <Minus size={16} /> : <Plus size={16} />}
        </span>
      </button>

      {/* Section content */}
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
                <ContentRenderer
                  blocks={section.content}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  highlightQuery={searchOpen && query ? query : undefined}
                />
              )}

              {/* Sub-sections */}
              {section.subsections && section.subsections.length > 0 && (
                <div className="mt-5 space-y-2">
                  {section.subsections.map((sub) => (
                    <SectionAccordion
                      key={sub.id}
                      section={sub}
                      fontSize={fontSize}
                      lineHeight={lineHeight}
                      searchOpen={searchOpen}
                      query={query}
                      depth={depth + 1}
                    />
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

// ─── Chapter Accordion ───────────────────────────────────────────────────────
interface ChapterAccordionProps {
  chapter: BookChapter;
  chapterIndex: number;
  fontSize: number;
  lineHeight: number;
  searchOpen: boolean;
  query: string;
}

function ChapterAccordion({ chapter, chapterIndex, fontSize, lineHeight, searchOpen, query }: ChapterAccordionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      id={chapter.id}
      className={cn(
        'scroll-mt-32 rounded-2xl border-2 transition-all duration-200',
        open
          ? 'border-accent/40 bg-white shadow-md'
          : 'border-line bg-white hover:border-accent/25 hover:shadow-sm'
      )}
    >
      {/* Chapter header / toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 text-left"
        aria-expanded={open}
      >
        {/* Chapter number badge */}
        <span
          className={cn(
            'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold tabular-nums transition-colors',
            open
              ? 'bg-accent text-ink-900'
              : 'bg-accent/10 text-accent'
          )}
        >
          {String(chapterIndex + 1).padStart(2, '0')}
        </span>

        <span className="flex-1 min-w-0">
          <span
            className={cn(
              'block text-[15px] sm:text-[17px] font-bold leading-snug break-words',
              open ? 'text-ink-800' : 'text-ink-700'
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

      {/* Chapter content */}
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
                <SectionAccordion
                  key={section.id}
                  section={section}
                  fontSize={fontSize}
                  lineHeight={lineHeight}
                  searchOpen={searchOpen}
                  query={query}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Introduction Accordion ───────────────────────────────────────────────────
interface IntroAccordionProps {
  book: ReturnType<typeof getBookBySlug> & {};
  fontSize: number;
  lineHeight: number;
  searchOpen: boolean;
  query: string;
}

function IntroAccordion({ book, fontSize, lineHeight, searchOpen, query }: IntroAccordionProps) {
  const [open, setOpen] = useState(false);

  if (!book?.introduction) return null;

  return (
    <div
      id="introduction"
      className={cn(
        'scroll-mt-32 rounded-2xl border-2 transition-all duration-200',
        open
          ? 'border-accent/40 bg-white shadow-md'
          : 'border-line bg-white hover:border-accent/25 hover:shadow-sm'
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
          <span className={cn('block text-[15px] sm:text-[17px] font-bold leading-snug', open ? 'text-ink-800' : 'text-ink-700')}>
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
              <ContentRenderer
                blocks={book.introduction}
                fontSize={fontSize}
                lineHeight={lineHeight}
                highlightQuery={searchOpen && query ? query : undefined}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Reader Page ─────────────────────────────────────────────────────────
export function ReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const book = slug ? getBookBySlug(slug) : undefined;
  const location = useLocation();

  const {
    settings,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setLineHeight,
    setTheme,
    setWidth,
    widthClass,
    themeClass,
  } = useReaderSettings(slug || '');

  const { scrollPercent, saveProgress } = useReadingProgress(slug || '');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { query, setQuery, isOpen: searchOpen, setIsOpen: setSearchOpen, results, resultCount } = useBookSearch(
    book || ({} as never)
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);

  // Flatten all sections for navigation and active tracking
  const flatSections = useMemo(() => {
    if (!book) return [];
    const sections: { id: string; number: string; title: string; type: 'chapter' | 'section' | 'subsection' }[] = [];
    if (book.introduction) {
      sections.push({ id: 'introduction', number: '', title: 'Introduction', type: 'section' });
    }
    for (const chapter of book.chapters) {
      sections.push({ id: chapter.id, number: chapter.number, title: chapter.title, type: 'chapter' });
      for (const section of chapter.sections) {
        sections.push({ id: section.id, number: section.number, title: section.title, type: 'section' });
        if (section.subsections) {
          for (const sub of section.subsections) {
            sections.push({ id: sub.id, number: sub.number, title: sub.title, type: 'subsection' });
          }
        }
      }
    }
    return sections;
  }, [book]);

  const sectionIds = useMemo(() => flatSections.map((s) => s.id), [flatSections]);
  const activeSectionId = useActiveSection(sectionIds);

  useEffect(() => {
    if (activeSectionId && slug) {
      saveProgress(activeSectionId, scrollPercent);
    }
  }, [activeSectionId, scrollPercent, slug, saveProgress]);

  const navigateToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 160;
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setTocDrawerOpen(false);
  }, []);

  useEffect(() => {
    if (book && location.hash) {
      const hash = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        navigateToSection(hash);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [book, location.hash, navigateToSection]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setSearchOpen]);

  if (!book) return <NotFoundPage />;

  const scholar = getScholarById(book.authorId);
  const activeSection = flatSections.find((s) => s.id === activeSectionId);
  const activeIndex = flatSections.findIndex((s) => s.id === activeSectionId);
  const prevSection = activeIndex > 0 ? flatSections[activeIndex - 1] : null;
  const nextSection = activeIndex < flatSections.length - 1 ? flatSections[activeIndex + 1] : null;
  const isLast = activeIndex === flatSections.length - 1;

  const chapterLabel = activeSection
    ? activeSection.type === 'chapter'
      ? `Chapter ${activeSection.number}`
      : `Section ${activeSection.number}`
    : undefined;

  const currentSectionBookmarked = activeSectionId ? isBookmarked(slug || '', activeSectionId) : false;

  const handleBookmark = () => {
    if (activeSectionId && activeSection) {
      toggleBookmark(slug || '', activeSectionId, `${activeSection.number} ${activeSection.title}`.trim());
    }
  };

  return (
    <div className={`min-h-screen bg-paper ${themeClass}`}>
      <Navbar />

      <ReaderHeader
        book={book}
        isBookmarked={currentSectionBookmarked}
        onToggleBookmark={handleBookmark}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenToc={() => setTocDrawerOpen(true)}
        showTocButton
      />

      <ReadingProgress percent={scrollPercent} chapterLabel={chapterLabel} />

      {/* Main layout */}
      <div className="flex">
        {/* Desktop TOC sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-ink-700 sticky top-0 h-screen overflow-y-auto bg-ink-900">
          <div className="px-5 pt-5 pb-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent/70">
              Contents
            </h2>
            <TableOfContents
              book={book}
              activeSectionId={activeSectionId}
              onNavigate={navigateToSection}
            />
          </div>
        </aside>

        {/* Content area — accordion layout */}
        <div className="flex-1 min-w-0">
          <div className={`mx-auto ${widthClass} px-3 pt-6 pb-12 sm:px-6 sm:pt-10`}>

            {/* Book title card */}
            <div className="mb-6 rounded-2xl bg-white border border-line shadow-sm px-4 py-4 sm:px-6 sm:py-5">
              <p className="text-xs uppercase tracking-widest font-semibold text-accent mb-1">
                {book.subtitle ? book.subtitle : 'Contents'}
              </p>
              <h1 className="text-xl sm:text-3xl font-bold text-ink-800 font-serif leading-snug">
                {book.title}
              </h1>
              {scholar && (
                <p className="mt-1 text-sm text-ink-400">By {scholar.name}</p>
              )}
            </div>

            {/* Accordion list */}
            <div className="space-y-2 sm:space-y-3">
              {/* Introduction */}
              {book.introduction && (
                <IntroAccordion
                  book={book}
                  fontSize={settings.fontSize}
                  lineHeight={settings.lineHeight}
                  searchOpen={searchOpen}
                  query={query}
                />
              )}

              {/* Chapters */}
              {book.chapters.map((chapter: BookChapter, idx: number) => (
                <ChapterAccordion
                  key={chapter.id}
                  chapter={chapter}
                  chapterIndex={idx}
                  fontSize={settings.fontSize}
                  lineHeight={settings.lineHeight}
                  searchOpen={searchOpen}
                  query={query}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="mt-8 sm:mt-10">
              <ReaderNavigation
                prevLabel={prevSection ? `${prevSection.number} ${prevSection.title}`.trim() : null}
                nextLabel={nextSection ? `${nextSection.number} ${nextSection.title}`.trim() : null}
                onPrev={() => prevSection && navigateToSection(prevSection.id)}
                onNext={() => nextSection && navigateToSection(nextSection.id)}
                bookSlug={slug || ''}
                isLast={isLast}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile TOC Drawer */}
      <Drawer open={tocDrawerOpen} onClose={() => setTocDrawerOpen(false)} title="Contents" width="w-80">
        <div className="reader-theme-light">
          <TableOfContents
            book={book}
            activeSectionId={activeSectionId}
            onNavigate={navigateToSection}
          />
        </div>
      </Drawer>

      {/* Search */}
      <ReaderSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        query={query}
        onQueryChange={setQuery}
        results={results}
        resultCount={resultCount}
        onNavigate={navigateToSection}
      />

      {/* Settings */}
      <ReadingSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onIncreaseFont={increaseFontSize}
        onDecreaseFont={decreaseFontSize}
        onResetFont={resetFontSize}
        onSetTheme={setTheme}
        onSetWidth={setWidth}
        onSetLineHeight={setLineHeight}
      />
    </div>
  );
}
