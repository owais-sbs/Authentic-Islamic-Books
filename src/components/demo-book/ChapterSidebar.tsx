import { Link } from 'react-router-dom';
import type { DemoBookChapter } from '@/data/demoIslamicBook';
import { demoIslamicBook } from '@/data/demoIslamicBook';
import { cn } from '@/lib/utils';

interface ChapterSidebarProps {
  activeChapterId: string;
  baseReadPath: string;
  onNavigate?: () => void;
  className?: string;
}

export function ChapterSidebar({
  activeChapterId,
  baseReadPath,
  onNavigate,
  className,
}: ChapterSidebarProps) {
  return (
    <nav className={cn('space-y-1', className)} aria-label="Chapters">
      <p className="mb-3 px-2 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-400">
        Chapters
      </p>
      {demoIslamicBook.chapters.map((ch) => (
        <ChapterNavItem
          key={ch.id}
          chapter={ch}
          active={ch.id === activeChapterId}
          href={`${baseReadPath}/${ch.startPage}`}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );
}

function ChapterNavItem({
  chapter,
  active,
  href,
  onNavigate,
}: {
  chapter: DemoBookChapter;
  active: boolean;
  href: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={href}
      onClick={onNavigate}
      className={cn(
        'block rounded-lg px-3 py-2.5 transition-colors',
        active
          ? 'bg-islamic-green/10 text-islamic-green'
          : 'text-ink-600 hover:bg-paper hover:text-ink-900',
      )}
    >
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em] opacity-70">
        Chapter {chapter.number}
      </p>
      <p className="mt-0.5 font-sans text-sm font-semibold leading-snug">{chapter.titleEn}</p>
      <p dir="rtl" lang="ar" className="mt-0.5 font-arabic text-xs opacity-70">
        {chapter.titleAr}
      </p>
      <p className="mt-1 font-sans text-[11px] opacity-60">
        Pages {chapter.startPage}–{chapter.endPage}
      </p>
    </Link>
  );
}
