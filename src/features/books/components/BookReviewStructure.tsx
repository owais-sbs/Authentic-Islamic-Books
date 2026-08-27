import { BookOpen } from 'lucide-react';
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
  return (
    <div className="space-y-4">
      {/* Structure tree */}
      <div className="rounded-xl border border-[#E5E1D8] bg-white overflow-hidden">
        <div className="border-b border-[#E5E1D8] px-4 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">
            Book Structure
          </p>
        </div>
        <nav className="px-3 py-3 max-h-96 overflow-y-auto space-y-0.5">
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
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#C9A646]/15 text-[9px] font-bold text-[#C9A646]">
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
        <div className="space-y-1 pt-1 border-t border-[#F1F0EB]">
          {book.chapterCount != null && (
            <p className="text-[12px] text-[#64748B]">
              <span className="font-medium text-[#0B1B2B]">{book.chapterCount}</span> chapters
            </p>
          )}
          {book.sectionCount != null && (
            <p className="text-[12px] text-[#64748B]">
              <span className="font-medium text-[#0B1B2B]">{book.sectionCount}</span> sections
            </p>
          )}
          {book.wordCount != null && (
            <p className="text-[12px] text-[#64748B]">
              <span className="font-medium text-[#0B1B2B]">{book.wordCount.toLocaleString()}</span> words
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
