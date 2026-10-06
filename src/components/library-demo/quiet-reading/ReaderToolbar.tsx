import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Type,
  Bookmark,
  Moon,
  Sun,
  MoreHorizontal,
  Maximize2,
  Minimize2,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuietTheme } from '@/data/quietReadingRoom';

interface ReaderToolbarProps {
  bookTitle: string;
  theme: QuietTheme;
  focusMode: boolean;
  bookmarked: boolean;
  settingsOpen: boolean;
  moreOpen: boolean;
  chapterLabel?: string;
  onBackToLibrary: () => void;
  onToggleSettings: () => void;
  onToggleBookmark: () => void;
  onCycleTheme: () => void;
  onToggleFocus: () => void;
  onToggleMore: () => void;
  onOpenToc: () => void;
  onOpenEnd: () => void;
}

export function ReaderToolbar({
  bookTitle,
  theme,
  focusMode,
  bookmarked,
  settingsOpen,
  moreOpen,
  chapterLabel,
  onBackToLibrary,
  onToggleSettings,
  onToggleBookmark,
  onCycleTheme,
  onToggleFocus,
  onToggleMore,
  onOpenToc,
  onOpenEnd,
}: ReaderToolbarProps) {
  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b',
        isDark
          ? 'border-[#3A4554] bg-[#2A3340] text-[#F0EBE3]'
          : isSepia
            ? 'border-[#D4C4A8] bg-[#EFE4CF] text-[#3D3224]'
            : 'border-[#D9D0C0] bg-[#F3EDE2] text-[#1F2A24]'
      )}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/library"
            onClick={onBackToLibrary}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors',
              isDark
                ? 'text-[#F0EBE3] hover:bg-white/10'
                : 'text-[#1F2A24] hover:bg-[#1F2A24]/06'
            )}
          >
            <ArrowLeft size={16} strokeWidth={2} />
            {!focusMode && <span>Library</span>}
          </Link>

          {!focusMode && (
            <div className="hidden min-w-0 border-l pl-3 sm:block"
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(31,42,36,0.12)' }}
            >
              <p className="truncate font-serif text-[13px] font-semibold leading-tight">
                {bookTitle}
              </p>
              {chapterLabel && (
                <p className="truncate font-sans text-[11px] opacity-55">{chapterLabel}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <IconBtn label="Contents" onClick={onOpenToc} isDark={isDark} isSepia={isSepia}>
            <List size={16} strokeWidth={1.85} />
          </IconBtn>
          <IconBtn
            label="Reading settings"
            active={settingsOpen}
            onClick={onToggleSettings}
            isDark={isDark}
            isSepia={isSepia}
          >
            <Type size={16} strokeWidth={1.85} />
          </IconBtn>
          <IconBtn
            label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            active={bookmarked}
            onClick={onToggleBookmark}
            isDark={isDark}
            isSepia={isSepia}
          >
            <Bookmark
              size={16}
              strokeWidth={1.85}
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </IconBtn>
          <IconBtn label="Theme" onClick={onCycleTheme} isDark={isDark} isSepia={isSepia}>
            {isDark ? <Sun size={16} strokeWidth={1.85} /> : <Moon size={16} strokeWidth={1.85} />}
          </IconBtn>
          <IconBtn
            label={focusMode ? 'Exit focus' : 'Focus mode'}
            active={focusMode}
            onClick={onToggleFocus}
            isDark={isDark}
            isSepia={isSepia}
          >
            {focusMode ? (
              <Minimize2 size={15} strokeWidth={1.85} />
            ) : (
              <Maximize2 size={15} strokeWidth={1.85} />
            )}
          </IconBtn>
          <div className="relative">
            <IconBtn
              label="More"
              active={moreOpen}
              onClick={onToggleMore}
              isDark={isDark}
              isSepia={isSepia}
            >
              <MoreHorizontal size={16} strokeWidth={1.85} />
            </IconBtn>
            {moreOpen && (
              <div
                className={cn(
                  'absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border py-1.5 text-[13px] shadow-lg',
                  isDark
                    ? 'border-[#3A4554] bg-[#323C4A] text-[#F0EBE3]'
                    : isSepia
                      ? 'border-[#D4C4A8] bg-[#F7F0E2] text-[#3D3224]'
                      : 'border-[#D9D0C0] bg-white text-[#1F2A24]'
                )}
              >
                <button type="button" className="block w-full px-3.5 py-2 text-left hover:bg-black/5" onClick={onOpenToc}>
                  Table of contents
                </button>
                <button type="button" className="block w-full px-3.5 py-2 text-left hover:bg-black/5" onClick={onOpenEnd}>
                  End matter & resources
                </button>
                <Link to="/library" className="block w-full px-3.5 py-2 text-left hover:bg-black/5">
                  Exit to library
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  active,
  isDark,
  isSepia,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  isDark?: boolean;
  isSepia?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
        active
          ? isDark
            ? 'bg-[#C9A84C]/20 text-[#E2C56A]'
            : isSepia
              ? 'bg-[#8B6914]/15 text-[#6B5210]'
              : 'bg-[#1A3A2A]/12 text-[#1A3A2A]'
          : isDark
            ? 'text-[#F0EBE3]/80 hover:bg-white/10 hover:text-[#F0EBE3]'
            : 'text-[#1F2A24]/75 hover:bg-[#1F2A24]/06 hover:text-[#1F2A24]'
      )}
    >
      {children}
    </button>
  );
}
