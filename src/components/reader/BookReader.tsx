/**
 * Page-based scholarly reader (kutub-inspired).
 * Shows one PDF/reading page at a time — not the whole book on one scroll.
 * Site header (navbar) + reader chrome + sticky page footer stay visible.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { List } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ReaderHeader } from '@/components/reader/ReaderHeader';
import { TableOfContents } from '@/components/reader/TableOfContents';
import { ReadingSettings } from '@/components/reader/ReadingSettings';
import { ReaderSearch } from '@/components/reader/ReaderSearch';
import { PageContentView } from '@/components/reader/PageContentView';
import { ReaderPageNav } from '@/components/reader/ReaderPageNav';
import { useReaderSettings } from '@/hooks/useReaderSettings';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useBookSearch } from '@/hooks/useBookSearch';
import { getReaderPages } from '@/lib/readerPages';
import { cn } from '@/lib/utils';
import type { Book, ContentBlock } from '@/types';

interface BookReaderProps {
  book: Book;
}

function attachmentBlocksForPage(
  book: Book,
  pageNumber: number,
  sectionId?: string,
  pdfPage?: number | null,
): ContentBlock[] {
  const attachments = book.attachments ?? [];
  if (!attachments.length) return [];

  return attachments
    .filter((att) => {
      if (att.sectionId && sectionId && att.sectionId === sectionId) return true;
      if (att.pdfPage != null && pdfPage != null && att.pdfPage === pdfPage) return true;
      if (att.pdfPage != null && att.pdfPage === pageNumber) return true;
      return false;
    })
    .map((att): ContentBlock | null => {
      if (att.kind === 'image') {
        return {
          type: 'image',
          url: '',
          storagePath: att.storagePath,
          bucket: att.bucket,
          caption: att.caption,
          alt: att.alt || att.caption || att.fileName,
          pdfPage: att.pdfPage,
          align: 'center',
          width: 'large',
        };
      }
      if (att.kind === 'audio') {
        return {
          type: 'audio',
          fileName: att.fileName,
          caption: att.caption,
          storagePath: att.storagePath,
          bucket: att.bucket,
          pdfPage: att.pdfPage,
        };
      }
      if (att.kind === 'pdf') {
        return {
          type: 'pdf',
          fileName: att.fileName,
          caption: att.caption,
          storagePath: att.storagePath,
          bucket: att.bucket,
          pdfPage: att.pdfPage,
        };
      }
      return null;
    })
    .filter((b): b is ContentBlock => b != null);
}

export function BookReader({ book }: BookReaderProps) {
  const navigate = useNavigate();
  const { pageNumber: pageParam } = useParams<{ pageNumber?: string }>();
  const [searchParams] = useSearchParams();

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
  } = useReaderSettings(book.slug);

  const { savedProgress, saveProgress } = useReadingProgress(book.slug);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const search = useBookSearch(book);

  const [tocOpen, setTocOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const pages = useMemo(() => getReaderPages(book), [book]);

  const initialPage = useMemo(() => {
    const fromPath = pageParam ? Number(pageParam) : NaN;
    const fromQuery = Number(searchParams.get('page') || '');
    const fromProgress = savedProgress?.pageNumber;
    const raw = Number.isFinite(fromPath)
      ? fromPath
      : Number.isFinite(fromQuery)
        ? fromQuery
        : fromProgress ?? 1;
    return Math.min(Math.max(1, Math.floor(raw)), pages.length || 1);
  }, [pageParam, searchParams, savedProgress?.pageNumber, pages.length]);

  const [pageNumber, setPageNumber] = useState(initialPage);
  const current = pages[pageNumber - 1] ?? pages[0];

  const pageBlocks = useMemo(() => {
    const base = current?.content ?? [];
    const media = attachmentBlocksForPage(
      book,
      pageNumber,
      current?.sectionId,
      current?.pdfPage,
    );
    if (!media.length) return base;
    // Avoid duplicating attachments already embedded in section HTML
    const embeddedPaths = new Set(
      base
        .map((b) =>
          'storagePath' in b && typeof b.storagePath === 'string' ? b.storagePath : '',
        )
        .filter(Boolean),
    );
    const extra = media.filter(
      (b) => !('storagePath' in b && b.storagePath && embeddedPaths.has(b.storagePath)),
    );
    return extra.length ? [...base, ...extra] : base;
  }, [book, current, pageNumber]);

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  const goToPage = useCallback(
    (n: number) => {
      const next = Math.min(Math.max(1, n), pages.length || 1);
      setPageNumber(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      saveProgress(current?.sectionId ?? `page-${next}`, Math.round((next / pages.length) * 100), next);
      navigate(`/books/${book.slug}/read/${next}`, { replace: true });
    },
    [pages.length, current?.sectionId, saveProgress, navigate, book.slug],
  );

  useEffect(() => {
    if (!current) return;
    saveProgress(
      current.sectionId ?? current.id,
      Math.round((pageNumber / Math.max(pages.length, 1)) * 100),
      pageNumber,
    );
  }, [pageNumber, current, pages.length, saveProgress]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') goToPage(pageNumber - 1);
      if (e.key === 'ArrowRight') goToPage(pageNumber + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToPage, pageNumber]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const idx = pages.findIndex((p) => p.sectionId === sectionId);
      if (idx >= 0) goToPage(idx + 1);
      setTocOpen(false);
    },
    [pages, goToPage],
  );

  return (
    <PageContainer>
      <div className={cn('flex min-h-[70vh] flex-col', themeClass)}>
        <ReaderHeader
          book={book}
          isBookmarked={isBookmarked(book.slug, current?.sectionId ?? current?.id ?? '')}
          onToggleBookmark={() =>
            toggleBookmark(
              book.slug,
              current?.sectionId ?? current?.id ?? `page-${pageNumber}`,
              current?.title || `Page ${pageNumber}`,
            )
          }
          onOpenSearch={() => search.setIsOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenToc={() => setTocOpen(true)}
          showTocButton
        />

        <div className="h-0.5 w-full bg-transparent">
          <div
            className="h-full bg-accent/80 transition-[width] duration-150"
            style={{ width: `${(pageNumber / Math.max(pages.length, 1)) * 100}%` }}
          />
        </div>

        <main
          className={cn(
            'mx-auto min-w-0 w-full max-w-4xl flex-1 overflow-x-clip px-3 py-5 pb-8 sm:px-6 sm:py-8',
            widthClass,
          )}
        >
          {/* Keep section/page heading only when it is not a generic "Page N" label */}
          {current?.title &&
            !/^page\s+\d+$/i.test(current.title.trim()) &&
            current.title.trim().toLowerCase() !== (book.title || '').trim().toLowerCase() && (
              <h2
                className="reader-heading mb-4 text-base font-semibold sm:text-lg"
                style={{ color: 'var(--reader-text)' }}
              >
                {current.title}
              </h2>
            )}

          <PageContentView
            blocks={pageBlocks}
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
            highlightQuery={search.query}
            preferParallel={false}
          />
        </main>

        <div className="sticky bottom-0 z-30">
          <ReaderPageNav
            pages={pages}
            pageNumber={pageNumber}
            volumeLabel={book.volumeLabel || 'Single volume'}
            onChangePage={goToPage}
          />
        </div>

        {tocOpen && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              className="absolute inset-0 bg-ink-900/40"
              aria-label="Close contents"
              onClick={() => setTocOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[min(75vh,100%)] overflow-hidden rounded-t-2xl reader-card pb-[env(safe-area-inset-bottom,0px)] shadow-xl">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-[13px] font-semibold" style={{ color: 'var(--reader-text)' }}>
                  Table of contents
                </p>
                <button
                  type="button"
                  onClick={() => setTocOpen(false)}
                  className="min-h-11 min-w-11 text-[13px] reader-muted"
                >
                  Close
                </button>
              </div>
              <div className="max-h-[65vh] overflow-y-auto overscroll-contain p-3">
                <TableOfContents
                  book={book}
                  activeSectionId={current?.sectionId ?? null}
                  onNavigate={scrollToSection}
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setTocOpen(true)}
          className="fixed bottom-[4.75rem] right-3 z-40 flex h-11 items-center gap-1.5 rounded-full reader-card px-3 text-[12px] font-semibold shadow-md ring-1 ring-black/5"
          style={{ color: 'var(--reader-text)' }}
        >
          <List size={14} />
          Contents
        </button>

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

        <ReaderSearch
          open={search.isOpen}
          onClose={() => search.setIsOpen(false)}
          query={search.query}
          onQueryChange={search.setQuery}
          results={search.results}
          resultCount={search.resultCount}
          onNavigate={(sectionId) => {
            scrollToSection(sectionId);
            search.setIsOpen(false);
          }}
        />
      </div>
    </PageContainer>
  );
}
