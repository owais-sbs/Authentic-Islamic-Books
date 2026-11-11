import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import { BookSectionReview } from './BookSectionReview';
import { cn } from '@/lib/utils';
import type { BookChapter, BookSection } from '../types';

interface BookChapterReviewProps {
  chapter: BookChapter;
  bookId?: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onChange: (patch: Partial<BookChapter>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function renumberSections(sections: BookSection[], chapterNumber: string): BookSection[] {
  return sections.map((sec, i) => ({
    ...sec,
    number: `${chapterNumber}.${i + 1}`,
    order: i,
  }));
}

export function BookChapterReview({
  chapter,
  bookId,
  canMoveUp,
  canMoveDown,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: BookChapterReviewProps) {
  const [expanded, setExpanded] = useState(true);

  function updateSection(idx: number, patch: Partial<BookSection>) {
    const updated = chapter.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange({ sections: updated });
  }

  function addSection() {
    const pageTitles = chapter.sections
      .map((s) => /^Page\s+(\d+)$/i.exec(s.title || '')?.[1])
      .filter(Boolean)
      .map(Number);
    const nextPage = pageTitles.length ? Math.max(...pageTitles) + 1 : null;
    const newSec: BookSection = {
      id: generateId(),
      chapterId: chapter.id,
      number: nextPage != null ? String(nextPage) : `${chapter.number}.${chapter.sections.length + 1}`,
      title: nextPage != null ? `Page ${nextPage}` : '',
      content: '',
      order: chapter.sections.length,
      pdfPageStart: nextPage ?? undefined,
      pdfPageEnd: nextPage ?? undefined,
    };
    onChange({ sections: [...chapter.sections, newSec] });
  }

  function moveSection(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= chapter.sections.length) return;
    const copy = [...chapter.sections];
    const [item] = copy.splice(idx, 1);
    copy.splice(next, 0, item);
    onChange({ sections: renumberSections(copy, chapter.number) });
  }

  function deleteSection(idx: number) {
    const target = chapter.sections[idx];
    const isPageSlot = /^Page\s+\d+$/i.test(target?.title || '');
    if (isPageSlot) {
      const ok = window.confirm(
        `Delete “${target.title}”? This removes a middle PDF page slot. Prefer clearing its content instead of deleting, so page numbers stay continuous.`,
      );
      if (!ok) return;
    }
    const copy = chapter.sections.filter((_, i) => i !== idx);
    // Keep "Page N" titles/numbers intact — do not renumber into 1.1, 1.2…
    if (copy.every((s) => /^Page\s+\d+$/i.test(s.title || ''))) {
      onChange({
        sections: copy.map((s, i) => ({ ...s, order: i })),
      });
      return;
    }
    onChange({ sections: renumberSections(copy, chapter.number) });
  }

  function moveContentToNeighbor(fromIdx: number, toIdx: number) {
    if (toIdx < 0 || toIdx >= chapter.sections.length) return;
    const from = chapter.sections[fromIdx];
    const to = chapter.sections[toIdx];
    if (!from.content?.trim()) return;
    const merged = `${to.content || ''}${to.content ? '\n' : ''}${from.content || ''}`;
    const removeEmpty = window.confirm(
      'Content will be appended to the next section. Remove the now-empty source section?',
    );
    let next = chapter.sections.map((s, i) => {
      if (i === toIdx) return { ...s, content: merged };
      if (i === fromIdx) return { ...s, content: '' };
      return s;
    });
    if (removeEmpty) {
      next = renumberSections(
        next.filter((_, i) => i !== fromIdx),
        chapter.number,
      );
    }
    onChange({ sections: next });
  }

  return (
    <div
      id={`review-${chapter.id}`}
      className={cn(
        'scroll-mt-36 rounded-xl border-2 transition-colors',
        expanded ? 'border-[#C9A646]/25 bg-white shadow-sm' : 'border-[#E5E1D8] bg-white',
      )}
    >
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 px-2 py-1.5 text-left"
        >
          <span
            className={cn(
              'flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums transition-colors',
              expanded ? 'bg-[#C9A646] text-white' : 'bg-[#C9A646]/10 text-[#C9A646]',
            )}
          >
            {chapter.number}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-[#0B1B2B]">
              {chapter.title
                ? `Chapter ${chapter.number} — ${chapter.title}`
                : `Chapter ${chapter.number}`}
            </span>
            {chapter.description && !expanded && (
              <span className="block truncate text-[12px] text-[#94A3B8]">
                {chapter.description}
              </span>
            )}
          </span>
          <span className="shrink-0 text-[12px] text-[#94A3B8]">
            {chapter.sections.length} section{chapter.sections.length !== 1 ? 's' : ''}
          </span>
          {expanded ? (
            <ChevronDown size={15} className="shrink-0 text-[#94A3B8]" />
          ) : (
            <ChevronRight size={15} className="shrink-0 text-[#94A3B8]" />
          )}
        </button>
        <button
          type="button"
          title="Move chapter up"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          className="rounded p-1.5 text-[#64748B] hover:bg-[#F7F6F2] disabled:opacity-30"
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          title="Move chapter down"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          className="rounded p-1.5 text-[#64748B] hover:bg-[#F7F6F2] disabled:opacity-30"
        >
          <ArrowDown size={14} />
        </button>
        <button
          type="button"
          title="Delete chapter"
          onClick={() => {
            if (
              window.confirm(
                `Delete chapter “${chapter.title || chapter.number}” and all its sections? This only affects the draft until you save.`,
              )
            ) {
              onDelete?.();
            }
          }}
          className="rounded p-1.5 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t-2 border-[#C9A646]/10 px-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Number
              </label>
              <input
                className="w-full rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20"
                value={chapter.number}
                onChange={(e) => {
                  const number = e.target.value;
                  onChange({
                    number,
                    sections: renumberSections(chapter.sections, number || chapter.number),
                  });
                }}
                placeholder="1"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
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

          {chapter.sections.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Sections — reading order
              </p>
              {chapter.sections.map((sec, i) => (
                <div key={sec.id} className="space-y-1">
                  <BookSectionReview
                    section={sec}
                    bookId={bookId}
                    canMoveUp={i > 0}
                    canMoveDown={i < chapter.sections.length - 1}
                    onChange={(patch) => updateSection(i, patch)}
                    onMoveUp={() => moveSection(i, -1)}
                    onMoveDown={() => moveSection(i, 1)}
                    onDelete={() => deleteSection(i)}
                  />
                  {i < chapter.sections.length - 1 && (
                    <div className="flex justify-end px-1">
                      <button
                        type="button"
                        className="text-[10px] font-medium text-[#64748B] underline-offset-2 hover:text-[#0B1B2B] hover:underline"
                        onClick={() => moveContentToNeighbor(i, i + 1)}
                        title="Append this section’s HTML into the next section (preserves text)"
                      >
                        Move content into next section
                      </button>
                    </div>
                  )}
                </div>
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
