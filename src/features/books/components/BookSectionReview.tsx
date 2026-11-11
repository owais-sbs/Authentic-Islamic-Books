import { useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Trash2,
} from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { ScholarlyBlockInserter } from './ScholarlyBlockInserter';
import { cn } from '@/lib/utils';
import type { BookSection } from '../types';

const inputCls =
  'w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20';

interface BookSectionReviewProps {
  section: BookSection;
  bookId?: string;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onChange: (patch: Partial<BookSection>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
}

export function BookSectionReview({
  section,
  bookId,
  canMoveUp,
  canMoveDown,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: BookSectionReviewProps) {
  const [expanded, setExpanded] = useState(false);
  const insertHtmlRef = useRef<((html: string) => void) | null>(null);
  const uploadImageRef = useRef<(() => void) | null>(null);

  return (
    <div
      id={`review-${section.id}`}
      className={cn(
        'rounded-lg border transition-colors scroll-mt-36',
        expanded ? 'border-[#C9A646]/25 bg-white' : 'border-[#E5E1D8] bg-[#FAFAF8]',
      )}
    >
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-1.5 text-left"
        >
          <span className="w-8 shrink-0 text-[11px] font-bold tabular-nums text-[#C9A646]">
            {section.number}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#0B1B2B]">
            {section.title || (
              <span className="font-normal text-[#94A3B8]">Untitled section</span>
            )}
          </span>
          {section.pdfPageStart != null && (
            <span className="hidden shrink-0 text-[10px] text-[#94A3B8] sm:inline">
              Page {section.pdfPageStart}
              {section.pdfPageEnd != null && section.pdfPageEnd !== section.pdfPageStart
                ? `–${section.pdfPageEnd}`
                : ''}
            </span>
          )}
          {expanded ? (
            <ChevronDown size={14} className="shrink-0 text-[#94A3B8]" />
          ) : (
            <ChevronRight size={14} className="shrink-0 text-[#94A3B8]" />
          )}
        </button>
        <button
          type="button"
          title="Move section up"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          className="rounded p-1.5 text-[#64748B] hover:bg-[#F7F6F2] disabled:opacity-30"
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          title="Move section down"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          className="rounded p-1.5 text-[#64748B] hover:bg-[#F7F6F2] disabled:opacity-30"
        >
          <ArrowDown size={14} />
        </button>
        <button
          type="button"
          title="Delete section"
          onClick={() => {
            if (
              window.confirm(
                `Delete section “${section.title || section.number}”? Content will be removed from the draft (not published until you save).`,
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
        <div className="space-y-3 border-t border-[#E5E1D8] px-4 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Section Title
              </label>
              <input
                className={inputCls}
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
                className={inputCls}
                value={section.subtitle ?? ''}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="Optional subtitle"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Number
              </label>
              <input
                className={inputCls}
                value={section.number}
                onChange={(e) => onChange({ number: e.target.value })}
                placeholder="1.1"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Page start
              </label>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={section.pdfPageStart ?? ''}
                onChange={(e) =>
                  onChange({
                    pdfPageStart: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 20"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Page end
              </label>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={section.pdfPageEnd ?? ''}
                onChange={(e) =>
                  onChange({
                    pdfPageEnd: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 25"
              />
            </div>
            <p className="col-span-2 self-end text-[11px] text-[#94A3B8] sm:col-span-1">
              Source page numbers for this section.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Content
              </label>
              <ScholarlyBlockInserter
                onInsert={(html) => insertHtmlRef.current?.(html)}
                onUploadImage={() => uploadImageRef.current?.()}
              />
            </div>
            <RichTextEditor
              value={section.content}
              onChange={(html) => onChange({ content: html })}
              placeholder="Section content…"
              minHeight="180px"
              bookId={bookId}
              insertHtmlRef={insertHtmlRef}
              uploadImageRef={uploadImageRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}
