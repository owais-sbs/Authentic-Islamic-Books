import { Bookmark, Moon, Share2, MoreVertical } from 'lucide-react';
import type { ReaderUnit } from '@/lib/readerSections';
import { ContentRenderer } from '@/components/reader/ContentRenderer';
import { cn } from '@/lib/utils';

interface ReaderChapterPanelProps {
  unit: ReaderUnit;
  totalUnits: number;
  fontSize: number;
  lineHeight: number;
  isBookmarked: boolean;
  isDark: boolean;
  highlightQuery?: string;
  onToggleBookmark: () => void;
  onToggleTheme: () => void;
  onDecreaseFont: () => void;
  onResetFont: () => void;
  onIncreaseFont: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function ChapterOrnament({ number }: { number: string }) {
  return (
    <div className="reader-chapter-ornament" aria-hidden>
      <svg viewBox="0 0 80 80" className="h-16 w-16 text-accent">
        <polygon
          points="40,4 48,28 72,28 52,44 60,68 40,54 20,68 28,44 8,28 32,28"
          fill="currentColor"
          opacity="0.15"
        />
        <polygon
          points="40,14 46,30 64,30 50,42 56,58 40,48 24,58 30,42 16,30 34,30"
          fill="currentColor"
          opacity="0.35"
        />
        <text
          x="40"
          y="46"
          textAnchor="middle"
          className="fill-accent text-[18px] font-bold"
          style={{ fontFamily: 'Source Serif 4, Georgia, serif' }}
        >
          {number.padStart(2, '0')}
        </text>
      </svg>
    </div>
  );
}

function ChapterDivider() {
  return (
    <div className="reader-chapter-divider my-8 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-accent/40" />
      <span className="text-accent/60 text-xs">◆</span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-accent/40" />
    </div>
  );
}

export function ReaderChapterPanel({
  unit,
  totalUnits,
  fontSize,
  lineHeight,
  isBookmarked,
  isDark,
  highlightQuery,
  onToggleBookmark,
  onToggleTheme,
  onDecreaseFont,
  onResetFont,
  onIncreaseFont,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ReaderChapterPanelProps) {
  const pageNumber = unit.index + 1;
  const progress = totalUnits > 0 ? (pageNumber / totalUnits) * 100 : 0;

  async function handleShare(): Promise<void> {
    const url = window.location.href.split('#')[0] + `#${unit.id}`;
    if (navigator.share) {
      await navigator.share({ title: unit.title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <article className="reader-chapter-card mx-auto w-full max-w-[820px] rounded-2xl border border-line bg-white shadow-[0_8px_40px_rgba(11,27,43,0.06)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3 sm:px-8">
        <div className="flex items-center rounded-lg border border-line bg-cream/60 p-0.5">
          <button type="button" onClick={onDecreaseFont} className="reader-toolbar-btn" aria-label="Decrease font size">
            A-
          </button>
          <button type="button" onClick={onResetFont} className="reader-toolbar-btn font-semibold" aria-label="Reset font size">
            A
          </button>
          <button type="button" onClick={onIncreaseFont} className="reader-toolbar-btn" aria-label="Increase font size">
            A+
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTheme}
            className={cn('reader-toolbar-icon', isDark && 'bg-ink-900 text-white')}
            aria-label="Toggle night mode"
          >
            <Moon size={16} />
            <span className="hidden sm:inline text-[12px]">Night Mode</span>
          </button>
          <button type="button" onClick={onToggleBookmark} className="reader-toolbar-icon" aria-label="Bookmark">
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span className="hidden sm:inline text-[12px]">Bookmark</span>
          </button>
          <button type="button" onClick={() => void handleShare()} className="reader-toolbar-icon" aria-label="Share">
            <Share2 size={16} />
            <span className="hidden sm:inline text-[12px]">Share</span>
          </button>
          <button type="button" className="reader-toolbar-icon lg:hidden" aria-label="More">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Chapter body */}
      <div className="bg-[#FAF8F4] px-5 py-8 sm:px-10 sm:py-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex flex-col items-center text-center">
            <ChapterOrnament number={unit.displayNumber} />
            <h1 className="mt-3 font-serif text-[1.85rem] font-bold leading-tight text-ink-900 sm:text-[2.25rem]">
              {unit.title}
            </h1>
            {unit.chapterTitle && unit.chapterTitle !== unit.title && (
              <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.14em] text-accent">
                {unit.chapterTitle}
              </p>
            )}
          </div>

          <ChapterDivider />

          <div className="reader-chapter-body">
            <ContentRenderer
              blocks={unit.content}
              fontSize={fontSize}
              lineHeight={lineHeight}
              highlightQuery={highlightQuery}
            />
          </div>
        </div>
      </div>

      {/* Footer navigation */}
      <footer className="border-t border-line px-5 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className={cn(
              'text-[13px] font-medium transition-colors',
              hasPrev ? 'text-ink-600 hover:text-accent' : 'text-ink-300 cursor-not-allowed'
            )}
          >
            ← Previous
          </button>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-2 px-2">
            <div className="h-1.5 w-full max-w-[220px] overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[12px] tabular-nums text-ink-400">
              Page {pageNumber} of {totalUnits}
            </p>
          </div>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors',
              hasNext
                ? 'bg-ink-900 text-white hover:bg-ink-800'
                : 'bg-line text-ink-300 cursor-not-allowed'
            )}
          >
            Next
            <span aria-hidden>→</span>
          </button>
        </div>
      </footer>
    </article>
  );
}
