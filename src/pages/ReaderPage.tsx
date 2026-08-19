import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import type { BookSection, BookChapter } from '@/types';

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

  // Save progress when active section changes
  useEffect(() => {
    if (activeSectionId && slug) {
      saveProgress(activeSectionId, scrollPercent);
    }
  }, [activeSectionId, scrollPercent, slug, saveProgress]);

  // Navigate to section
  const navigateToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const headerOffset = 160; // navbar (64) + reader header (56) + progress (28) + buffer
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setTocDrawerOpen(false);
  }, []);

  // Handle deep linking via URL hash
  useEffect(() => {
    if (book && location.hash) {
      const hash = location.hash.replace('#', '');
      // Wait for content to render
      const timer = setTimeout(() => {
        navigateToSection(hash);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [book, location.hash, navigateToSection]);

  // Keyboard shortcuts
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
      : activeSection.type === 'section'
      ? `Section ${activeSection.number}`
      : `Section ${activeSection.number}`
    : undefined;

  const currentSectionBookmarked = activeSectionId
    ? isBookmarked(slug || '', activeSectionId)
    : false;

  const handleBookmark = () => {
    if (activeSectionId && activeSection) {
      toggleBookmark(slug || '', activeSectionId, `${activeSection.number} ${activeSection.title}`.trim());
    }
  };

  return (
    <div className={`min-h-screen reader-surface ${themeClass}`}>
      {/* Main site Navbar */}
      <Navbar />

      {/* Reader Header */}
      <ReaderHeader
        book={book}
        isBookmarked={currentSectionBookmarked}
        onToggleBookmark={handleBookmark}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenToc={() => setTocDrawerOpen(true)}
        showTocButton
      />

      {/* Reading Progress */}
      <ReadingProgress percent={scrollPercent} chapterLabel={chapterLabel} />

      {/* Main layout */}
      <div className="flex">
        {/* Desktop TOC sidebar — sticks to top of viewport, scrolls internally */}
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

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <div className={`mx-auto ${widthClass} px-5 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-14`}>
            {/* Introduction */}
            {book.introduction && (
              <section id="introduction" className="scroll-mt-28 mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="font-serif text-xs uppercase tracking-widest reader-accent mb-2">
                    Introduction
                  </p>
                  <ContentRenderer
                    blocks={book.introduction}
                    fontSize={settings.fontSize}
                    lineHeight={settings.lineHeight}
                    highlightQuery={searchOpen && query ? query : undefined}
                  />
                </motion.div>
              </section>
            )}

            {/* Chapters */}
            {book.chapters.map((chapter: BookChapter) => (
              <div key={chapter.id} className="mb-20">
                {/* Chapter header */}
                <section id={chapter.id} className="scroll-mt-28 mb-10">
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="font-serif text-xs uppercase tracking-widest reader-accent mb-2">
                      Chapter {chapter.number}
                    </p>
                    <h2 className="font-serif text-3xl sm:text-4xl font-semibold mb-3 break-words" style={{ color: 'var(--reader-text)' }}>
                      {chapter.title}
                    </h2>
                    {chapter.description && (
                      <p className="reader-prose reader-muted text-lg italic mb-6" style={{ fontSize: `${settings.fontSize}px`, lineHeight: settings.lineHeight }}>
                        {chapter.description}
                      </p>
                    )}
                  </motion.div>
                </section>

                {/* Sections */}
                {chapter.sections.map((section: BookSection) => (
                  <div key={section.id}>
                    <section id={section.id} className="scroll-mt-28 mb-12">
                      <h3
                        className="font-serif text-xl sm:text-2xl font-semibold mb-5 pb-2 border-b reader-border break-words"
                        style={{ color: 'var(--reader-text)' }}
                      >
                        <span className="reader-accent mr-2 tabular-nums">{section.number}</span>
                        {section.title}
                      </h3>
                      {section.content && (
                        <ContentRenderer
                          blocks={section.content}
                          fontSize={settings.fontSize}
                          lineHeight={settings.lineHeight}
                          highlightQuery={searchOpen && query ? query : undefined}
                        />
                      )}
                    </section>

                    {/* Subsections */}
                    {section.subsections?.map((sub) => (
                      <section key={sub.id} id={sub.id} className="scroll-mt-28 mb-10 ml-2 sm:ml-4">
                        <h4
                          className="font-serif text-lg font-semibold mb-4"
                          style={{ color: 'var(--reader-text)' }}
                        >
                          <span className="reader-accent mr-2 tabular-nums text-sm">{sub.number}</span>
                          {sub.title}
                        </h4>
                        {sub.content && (
                          <ContentRenderer
                            blocks={sub.content}
                            fontSize={settings.fontSize}
                            lineHeight={settings.lineHeight}
                            highlightQuery={searchOpen && query ? query : undefined}
                          />
                        )}
                      </section>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {/* Navigation */}
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

      {/* Mobile TOC Drawer */}
      <Drawer
        open={tocDrawerOpen}
        onClose={() => setTocDrawerOpen(false)}
        title="Contents"
        width="w-80"
      >
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
