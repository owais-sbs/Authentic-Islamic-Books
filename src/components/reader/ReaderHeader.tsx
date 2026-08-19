import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Bookmark, Menu, Type } from 'lucide-react';
import type { Book } from '@/types';
import { cn } from '@/lib/utils';

interface ReaderHeaderProps {
  book: Book;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenToc: () => void;
  showTocButton?: boolean;
  className?: string;
}

export function ReaderHeader({
  book,
  isBookmarked,
  onToggleBookmark,
  onOpenSearch,
  onOpenSettings,
  onOpenToc,
  showTocButton,
  className,
}: ReaderHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 border-b reader-border reader-card backdrop-blur-sm',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {showTocButton && (
            <button
              onClick={onOpenToc}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-md reader-muted transition-colors hover:reader-accent"
              aria-label="Open table of contents"
            >
              <Menu size={18} />
            </button>
          )}
          <Link
            to={`/books/${book.slug}`}
            className="flex h-9 w-9 items-center justify-center rounded-md reader-muted transition-colors hover:reader-accent"
            aria-label="Back to book details"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-serif text-sm font-semibold" style={{ color: 'var(--reader-text)' }}>
              {book.title}
            </h1>
            <p className="truncate text-xs reader-muted hidden sm:block">{book.subtitle}</p>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenSearch}
            className="flex h-9 w-9 items-center justify-center rounded-md reader-muted transition-colors hover:reader-accent"
            aria-label="Search in book"
            title="Search (Ctrl+K)"
          >
            <Search size={18} />
          </button>
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-md reader-muted transition-colors hover:reader-accent"
            aria-label="Reading settings"
            title="Reading settings"
          >
            <Type size={18} />
          </button>
          <button
            onClick={onToggleBookmark}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-md transition-colors',
              isBookmarked ? 'reader-accent' : 'reader-muted hover:reader-accent'
            )}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            title="Bookmark this section"
          >
            <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </header>
  );
}
