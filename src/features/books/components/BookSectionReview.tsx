import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';
import type { BookSection } from '../types';

interface BookSectionReviewProps {
  section: BookSection;
  onChange: (patch: Partial<BookSection>) => void;
}

export function BookSectionReview({ section, onChange }: BookSectionReviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        expanded ? 'border-[#C9A646]/25 bg-white' : 'border-[#E5E1D8] bg-[#FAFAF8]'
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left"
      >
        <span className="text-[11px] tabular-nums font-bold text-[#C9A646] shrink-0 w-8">
          {section.number}
        </span>
        <span className="flex-1 text-[13px] font-medium text-[#0B1B2B] truncate">
          {section.title || <span className="text-[#94A3B8] font-normal">Untitled section</span>}
        </span>
        {expanded
          ? <ChevronDown size={14} className="shrink-0 text-[#94A3B8]" />
          : <ChevronRight size={14} className="shrink-0 text-[#94A3B8]" />}
      </button>

      {expanded && (
        <div className="border-t border-[#E5E1D8] px-4 py-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Section Title
              </label>
              <input
                className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20"
                value={section.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Section title"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Subtitle
              </label>
              <input
                className="w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20"
                value={section.subtitle ?? ''}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="Optional subtitle"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Content
            </label>
            <RichTextEditor
              value={section.content}
              onChange={(html) => onChange({ content: html })}
              placeholder="Section content extracted from PDF..."
              minHeight="160px"
            />
          </div>
        </div>
      )}
    </div>
  );
}
