import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { BookSectionReview } from './BookSectionReview';
import { cn } from '@/lib/utils';
import type { BookChapter, BookSection } from '../types';

interface BookChapterReviewProps {
  chapter: BookChapter;
  onChange: (patch: Partial<BookChapter>) => void;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function BookChapterReview({ chapter, onChange }: BookChapterReviewProps) {
  const [expanded, setExpanded] = useState(true);

  function updateSection(idx: number, patch: Partial<BookSection>) {
    const updated = chapter.sections.map((s, i) => i === idx ? { ...s, ...patch } : s);
    onChange({ sections: updated });
  }

  function addSection() {
    const newSec: BookSection = {
      id: generateId(),
      chapterId: chapter.id,
      number: `${chapter.number}.${chapter.sections.length + 1}`,
      title: '',
      content: '',
      order: chapter.sections.length,
    };
    onChange({ sections: [...chapter.sections, newSec] });
  }

  return (
    <div
      className={cn(
        'rounded-xl border-2 transition-colors',
        expanded ? 'border-[#C9A646]/25 bg-white shadow-sm' : 'border-[#E5E1D8] bg-white'
      )}
    >
      {/* Chapter header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
            expanded ? 'bg-[#C9A646] text-white' : 'bg-[#C9A646]/10 text-[#C9A646]'
          )}
        >
          {chapter.number}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-semibold text-[#0B1B2B] truncate">
            {chapter.title
              ? `Chapter ${chapter.number} — ${chapter.title}`
              : `Chapter ${chapter.number}`}
          </span>
          {chapter.description && !expanded && (
            <span className="block text-[12px] text-[#94A3B8] truncate">{chapter.description}</span>
          )}
        </span>
        <span className="text-[12px] text-[#94A3B8] shrink-0">
          {chapter.sections.length} section{chapter.sections.length !== 1 ? 's' : ''}
        </span>
        {expanded
          ? <ChevronDown size={15} className="shrink-0 text-[#94A3B8]" />
          : <ChevronRight size={15} className="shrink-0 text-[#94A3B8]" />}
      </button>

      {expanded && (
        <div className="border-t-2 border-[#C9A646]/10 px-4 py-4 space-y-3">
          {/* Chapter title + description editable */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Chapter Title
              </label>
              <input
                className="w-full rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20"
                value={chapter.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Chapter title"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Description
              </label>
              <input
                className="w-full rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20"
                value={chapter.description ?? ''}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Brief chapter description"
              />
            </div>
          </div>

          {/* Sections */}
          {chapter.sections.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Sections
              </p>
              {chapter.sections.map((sec, i) => (
                <BookSectionReview
                  key={sec.id}
                  section={sec}
                  onChange={(patch) => updateSection(i, patch)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addSection}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#C9A646]/30 py-2.5 text-[12px] font-medium text-[#C9A646] transition-colors hover:border-[#C9A646] hover:bg-[#C9A646]/5"
          >
            <Plus size={13} /> Add Section
          </button>
        </div>
      )}
    </div>
  );
}
