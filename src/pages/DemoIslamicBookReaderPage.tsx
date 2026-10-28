import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, List } from 'lucide-react';
import {
  BilingualText,
  ChapterSidebar,
  PageNavigation,
  ReadingSettingsBar,
} from '@/components/demo-book';
import { Drawer } from '@/components/ui/Drawer';
import {
  clampDemoPage,
  demoIslamicBook,
  getDemoBookChapterForPage,
  getDemoBookPage,
} from '@/data/demoIslamicBook';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePageMeta } from '@/hooks/usePageMeta';

const BASE = `/library/${demoIslamicBook.slug}/read`;

export function DemoIslamicBookReaderPage() {
  const { pageNumber: pageParam } = useParams<{ pageNumber: string }>();
  const parsed = Number(pageParam);
  const pageNumber = clampDemoPage(Number.isFinite(parsed) ? parsed : 1);
  const invalid = !pageParam || !Number.isFinite(parsed) || parsed !== pageNumber;

  const page = getDemoBookPage(pageNumber);
  const chapter = getDemoBookChapterForPage(pageNumber);

  const [fontSize, setFontSize] = useLocalStorage('idl-demo-reader-font', 17);
  const [tocOpen, setTocOpen] = useState(false);

  usePageMeta({
    title: page
      ? `${demoIslamicBook.titleEn} — Page ${pageNumber}`
      : demoIslamicBook.titleEn,
    description: `Reading ${demoIslamicBook.titleEn}`,
    path: `${BASE}/${pageNumber}`,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageNumber]);

  const progress = useMemo(
    () => Math.round((pageNumber / demoIslamicBook.totalPages) * 100),
    [pageNumber],
  );

  if (invalid) {
    return <Navigate to={`${BASE}/${pageNumber}`} replace />;
  }

  if (!page || !chapter) {
    return <Navigate to={`${BASE}/1`} replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-ivory dark:bg-black">
      <header className="sticky top-0 z-30 border-b border-line bg-ivory/95 backdrop-blur-md dark:border-white/10 dark:bg-black/95">
        <div className="container-page flex h-12 items-center justify-between gap-2 sm:h-14 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link
              to={`/library/${demoIslamicBook.slug}`}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg p-2 text-ink-600 transition-colors hover:bg-paper hover:text-ink-900 sm:px-2.5"
              aria-label="Back to book"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="truncate font-sans text-[13px] font-semibold text-ink-900 sm:text-sm">
                {demoIslamicBook.titleEn}
              </p>
              <p className="truncate font-sans text-[10px] text-ink-500 sm:text-[11px]">
                {chapter.titleEn} · p. {pageNumber}/{demoIslamicBook.totalPages}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTocOpen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-2 text-xs font-medium text-ink-700 hover:border-accent lg:hidden"
          >
            <List size={14} />
            <span className="hidden xs:inline">Contents</span>
          </button>
        </div>
        <div className="h-0.5 bg-line">
          <div
            className="h-full bg-accent transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="container-page flex flex-1 gap-8 py-4 sm:py-6 lg:py-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-line bg-cream p-3 dark:bg-[#141414]">
            <ChapterSidebar activeChapterId={chapter.id} baseReadPath={BASE} />
          </div>
        </aside>

        <main className="mx-auto min-w-0 max-w-[720px] flex-1 pb-6">
          <div className="mb-4 sm:mb-6">
            <ReadingSettingsBar
              fontSize={fontSize}
              onIncrease={() => setFontSize((n) => Math.min(n + 1, 24))}
              onDecrease={() => setFontSize((n) => Math.max(n - 1, 15))}
              onReset={() => setFontSize(17)}
            />
          </div>

          <article className="rounded-xl border border-line bg-cream px-4 py-6 shadow-soft sm:rounded-2xl sm:px-8 sm:py-10 dark:bg-[#141414]">
            <BilingualText
              english={page.english}
              arabic={page.arabic}
              englishHeading={page.englishHeading}
              arabicHeading={page.arabicHeading}
              fontSize={fontSize}
            />
          </article>

          <div className="mt-6 sm:mt-8">
            <PageNavigation pageNumber={pageNumber} basePath={BASE} />
          </div>

          <div className="mt-5 flex justify-between gap-3 text-sm">
            {chapter.number > 1 ? (
              <Link
                to={`${BASE}/${demoIslamicBook.chapters[chapter.number - 2].startPage}`}
                className="font-medium text-islamic-green hover:text-accent-dark"
              >
                ← Prev chapter
              </Link>
            ) : (
              <span />
            )}
            {chapter.number < demoIslamicBook.chapters.length ? (
              <Link
                to={`${BASE}/${demoIslamicBook.chapters[chapter.number].startPage}`}
                className="font-medium text-islamic-green hover:text-accent-dark"
              >
                Next chapter →
              </Link>
            ) : (
              <span />
            )}
          </div>
        </main>
      </div>

      <Drawer open={tocOpen} onClose={() => setTocOpen(false)} title="Contents">
        <ChapterSidebar
          activeChapterId={chapter.id}
          baseReadPath={BASE}
          onNavigate={() => setTocOpen(false)}
        />
      </Drawer>
    </div>
  );
}

export default DemoIslamicBookReaderPage;
