import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { getBookBySlug } from '@/data/books';
import { NotFoundPage } from './NotFoundPage';
import { Navbar } from '@/components/layout/Navbar';
import { ReaderSidebar } from '@/components/reader/ReaderSidebar';
import { ReaderChapterPanel } from '@/components/reader/ReaderChapterPanel';
import { ReaderSearch } from '@/components/reader/ReaderSearch';
import { ReadingSettings } from '@/components/reader/ReadingSettings';
import { Drawer } from '@/components/ui/Drawer';
import { useReaderSettings } from '@/hooks/useReaderSettings';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useBookSearch } from '@/hooks/useBookSearch';
import { getReaderUnits, findUnitIndex } from '@/lib/readerSections';
import { cn } from '@/lib/utils';

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
    themeClass,
  } = useReaderSettings(slug || '');

  const units = useMemo(() => (book ? getReaderUnits(book) : []), [book]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tocDrawerOpen, setTocDrawerOpen] = useState(false);
  const [showAllToc, setShowAllToc] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { saveProgress, savedProgress } = useReadingProgress(slug || '');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { query, setQuery, isOpen: searchOpen, setIsOpen: setSearchOpen, results, resultCount } = useBookSearch(
    book || ({} as never)
  );

  const currentUnit = units[currentIndex];
  const chapterProgress = units.length > 0 ? ((currentIndex + 1) / units.length) * 100 : 0;

  useEffect(() => {
    if (!book || units.length === 0) return;
    const hash = location.hash.replace('#', '');
    if (hash) {
      setCurrentIndex(findUnitIndex(units, hash));
      return;
    }
    if (savedProgress?.activeSectionId) {
      setCurrentIndex(findUnitIndex(units, savedProgress.activeSectionId));
    }
  }, [book, units, location.hash, savedProgress?.activeSectionId]);

  // Only reset scroll when the reader moves to a different chapter/section.
  useEffect(() => {
    if (!currentUnit || !slug) return;
    window.history.replaceState(null, '', `#${currentUnit.id}`);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentUnit?.id, slug]);

  useEffect(() => {
    if (!currentUnit || !slug) return;
    saveProgress(currentUnit.id, chapterProgress);
  }, [currentUnit?.id, slug, chapterProgress, saveProgress]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, units.length - 1)));
    setTocDrawerOpen(false);
  }, [units.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'ArrowRight' && !searchOpen) goToIndex(currentIndex + 1);
      if (e.key === 'ArrowLeft' && !searchOpen) goToIndex(currentIndex - 1);
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, goToIndex, searchOpen, setSearchOpen]);

  if (!book || units.length === 0 || !currentUnit) return <NotFoundPage />;

  const isDark = settings.theme === 'dark';
  const bookmarked = isBookmarked(slug || '', currentUnit.id);

  return (
    <div className={cn('min-h-screen bg-[#F4F1EA]', themeClass)}>
      <Navbar />

      {/* Mobile chapter bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setTocDrawerOpen(true)}
          className="flex items-center gap-2 text-[13px] font-medium text-ink-600"
        >
          <Menu size={18} />
          Contents
        </button>
        <span className="text-[12px] tabular-nums text-ink-400">
          {currentIndex + 1} / {units.length}
        </span>
      </div>

      <div className="flex items-start">
        <ReaderSidebar
          book={book}
          units={units}
          activeIndex={currentIndex}
          onSelect={goToIndex}
          showAll={showAllToc}
          onShowAll={() => setShowAllToc(true)}
        />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <ReaderChapterPanel
            unit={currentUnit}
            totalUnits={units.length}
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
            isBookmarked={bookmarked}
            isDark={isDark}
            highlightQuery={searchOpen && query ? query : undefined}
            onToggleBookmark={() => toggleBookmark(slug || '', currentUnit.id, currentUnit.title)}
            onToggleTheme={() => setTheme(isDark ? 'light' : 'dark')}
            onDecreaseFont={decreaseFontSize}
            onResetFont={resetFontSize}
            onIncreaseFont={increaseFontSize}
            onPrev={() => goToIndex(currentIndex - 1)}
            onNext={() => goToIndex(currentIndex + 1)}
            hasPrev={currentIndex > 0}
            hasNext={currentIndex < units.length - 1}
          />
        </main>
      </div>

      <Drawer open={tocDrawerOpen} onClose={() => setTocDrawerOpen(false)} title="Contents" width="w-[300px]">
        <ReaderSidebar
          book={book}
          units={units}
          activeIndex={currentIndex}
          onSelect={goToIndex}
          showAll
          variant="plain"
        />
      </Drawer>

      <ReaderSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        query={query}
        onQueryChange={setQuery}
        results={results}
        resultCount={resultCount}
        onNavigate={(id) => goToIndex(findUnitIndex(units, id))}
      />

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
