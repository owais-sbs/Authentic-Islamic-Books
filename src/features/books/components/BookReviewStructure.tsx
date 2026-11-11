import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { BookStatusBadge } from './BookStatusBadge';
import type { BookWithStructure } from '../types';
import { cn } from '@/lib/utils';

interface BookReviewStructureProps {
  book: BookWithStructure;
  activeSectionId: string | null;
  onSectionClick: (id: string) => void;
}

export function BookReviewStructure({
  book,
  activeSectionId,
  onSectionClick,
}: BookReviewStructureProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="space-y-4">
      {/* Structure tree — collapsed by default on small screens */}
      <div className="overflow-hidden rounded-xl border border-[#E5E1D8] bg-white">
        <button
          type="button"
          className="flex w-full items-center justify-between border-b border-[#E5E1D8] px-4 py-3 text-left lg:pointer-events-none"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
        >
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
            Book Structure
          </p>
          <ChevronDown
            size={16}
            className={cn(
              'text-[#94A3B8] transition-transform lg:hidden',
              mobileOpen && 'rotate-180',
            )}
          />
        </button>
        <nav
          className={cn(
            'max-h-96 space-y-0.5 overflow-y-auto px-3 py-3',
            !mobileOpen && 'hidden lg:block',
          )}
        >
          {/* Introduction */}
          {book.introduction && (
            <button
              type="button"
              onClick={() => onSectionClick('introduction')}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors',
                activeSectionId === 'introduction'
                  ? 'bg-[#C9A646]/10 text-[#8C7030] font-medium'
                  : 'text-[#64748B] hover:bg-[#F7F6F2] hover:text-[#0B1B2B]'
              )}
            >
              <BookOpen size={12} className="shrink-0 text-[#C9A646]" />
              Introduction
            </button>
          )}

          {/* Chapters */}
          {book.chapters.map((ch) => (
            <div key={ch.id}>
              <button
                type="button"
                onClick={() => onSectionClick(ch.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                  activeSectionId === ch.id
                    ? 'bg-[#C9A646]/10 font-semibold text-[#8C7030]'
                    : 'text-[#0B1B2B] font-semibold hover:bg-[#F7F6F2]'
                )}
              >
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#C9A646]/15 px-1 text-[10px] font-bold tabular-nums text-[#C9A646]">
                  {ch.number}
                </span>
                <span className="flex-1 truncate text-[13px]">
                  {ch.title || `Chapter ${ch.number}`}
                </span>
              </button>
              {ch.sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => onSectionClick(sec.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md py-1 pl-8 pr-2 text-left text-[12px] transition-colors',
                    activeSectionId === sec.id
                      ? 'bg-[#C9A646]/8 text-[#8C7030] font-medium'
                      : 'text-[#64748B] hover:bg-[#F7F6F2] hover:text-[#0B1B2B]'
                  )}
                >
                  <span className="shrink-0 text-[10px] text-[#C9A646] tabular-nums w-7">
                    {sec.number}
                  </span>
                  <span className="truncate">{sec.title || 'Untitled'}</span>
                </button>
              ))}
            </div>
          ))}

          {book.chapters.length === 0 && !book.introduction && (
            <p className="px-2 py-3 text-[12px] text-[#CBD5E1]">No structure detected</p>
          )}
        </nav>
      </div>

      {/* Status card */}
      <div className="rounded-xl border border-[#E5E1D8] bg-white px-4 py-4 space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
          Book Status
        </p>
        <BookStatusBadge status={book.status} />
        <div className="space-y-1 border-t border-[#F1F0EB] pt-1">
          <p className="text-[12px] text-[#64748B]">
            <span className="font-medium text-[#0B1B2B]">{book.chapters.length}</span> chapters
          </p>
          <p className="text-[12px] text-[#64748B]">
            <span className="font-medium text-[#0B1B2B]">
              {book.chapters.reduce((n, c) => n + c.sections.length, 0)}
            </span>{' '}
            sections
          </p>
          {book.attachments && book.attachments.length > 0 && (
            <p className="text-[12px] text-[#64748B]">
              <span className="font-medium text-[#0B1B2B]">{book.attachments.length}</span>{' '}
              attachments
            </p>
          )}
          {book.wordCount != null && (
            <p className="text-[12px] text-[#64748B]">
              <span className="font-medium text-[#0B1B2B]">{book.wordCount.toLocaleString()}</span>{' '}
              words
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
