/**
 * Page-based scholarly reader (kutub-inspired).
 * One page at a time. Site header + page controls below the text (no overlay).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { ReaderHeader } from '@/components/reader/ReaderHeader';
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
    },
    [pages, goToPage],
  );

  const chapterLabel =
    current?.chapterTitle &&
    !/^page\s+\d+$/i.test(current.chapterTitle.trim()) &&
    current.chapterTitle.trim().toLowerCase() !== (book.title || '').trim().toLowerCase()
      ? current.chapterTitle
      : undefined;

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
        />

        <div className="h-0.5 w-full bg-transparent">
          <div
            className="h-full bg-accent/80 transition-[width] duration-150"
            style={{ width: `${(pageNumber / Math.max(pages.length, 1)) * 100}%` }}
          />
        </div>

        {/* Page body + page controls in one column: nav sits under the text, never over it */}
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 sm:px-6">
          <main className={cn('min-w-0 flex-1 overflow-x-clip py-5 sm:py-7', widthClass)}>
            {current?.title &&
              !/^page\s+\d+$/i.test(current.title.trim()) &&
              current.title.trim().toLowerCase() !== (book.title || '').trim().toLowerCase() && (
                <h2
                  className="reader-heading mb-3 text-base font-semibold sm:text-lg"
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

          <ReaderPageNav
            pages={pages}
            pageNumber={pageNumber}
            volumeLabel={book.volumeLabel || 'Single volume'}
            chapterLabel={chapterLabel}
            onChangePage={goToPage}
            className="mb-4 shrink-0 rounded-xl ring-1 ring-black/5"
          />
        </div>

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
