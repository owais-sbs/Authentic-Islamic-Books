import { useState } from 'react';
import { ImagePlus, Plus } from 'lucide-react';
import {
  MANUAL_BLOCK_OPTIONS,
  snippetForBlock,
  type ManualBlockKind,
} from '@/features/books/manual/blockSnippets';
import { cn } from '@/lib/utils';

interface ScholarlyBlockInserterProps {
  onInsert: (html: string) => void;
  /** Opens the image file picker in the rich editor when provided */
  onUploadImage?: () => void;
  className?: string;
}

const TEXT_KINDS = new Set<ManualBlockKind>([
  'paragraph',
  'heading',
  'section-heading',
  'arabic',
  'urdu',
  'translation',
  'bilingual',
  'quran',
  'hadith',
  'quote',
  'claim',
  'reference',
  'citation',
  'footnote',
  'endnote',
  'callout',
  'table',
]);

/** Compact dropdown to insert scholarly HTML blocks into the rich editor. */
export function ScholarlyBlockInserter({
  onInsert,
  onUploadImage,
  className,
}: ScholarlyBlockInserterProps) {
  const [open, setOpen] = useState(false);

  function insert(kind: ManualBlockKind) {
    if (kind === 'image') {
      onUploadImage?.();
      setOpen(false);
      return;
    }
    if (kind === 'audio' || kind === 'pdf') {
      onInsert(snippetForBlock(kind));
      setOpen(false);
      return;
    }
    onInsert(snippetForBlock(kind));
    setOpen(false);
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {onUploadImage && (
        <button
          type="button"
          onClick={onUploadImage}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-2.5 py-1.5 text-[12px] font-medium text-[#0B1B2B] shadow-sm hover:border-[#C9A646]"
        >
          <ImagePlus size={14} className="text-[#C9A646]" />
          Upload image
        </button>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#104C3B] px-2.5 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-[#0d3d2f]"
        >
          <Plus size={14} />
          Insert block
        </button>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-10 cursor-default"
              aria-label="Close block menu"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-1 max-h-72 w-60 overflow-auto rounded-xl border border-[#E5E1D8] bg-white py-1.5 shadow-xl">
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Text blocks
              </p>
              {MANUAL_BLOCK_OPTIONS.filter((o) => TEXT_KINDS.has(o.kind)).map((opt) => (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => insert(opt.kind)}
                  className="flex w-full px-3 py-1.5 text-left text-[12px] text-[#0B1B2B] hover:bg-[#F7F6F2]"
                >
                  {opt.label}
                </button>
              ))}
              <div className="my-1 h-px bg-[#F1F0EB]" />
              <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Media
              </p>
              <button
                type="button"
                onClick={() => insert('image')}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] font-medium text-[#104C3B] hover:bg-[#F7F6F2]"
              >
                <ImagePlus size={14} />
                Upload image…
              </button>
              <button
                type="button"
                onClick={() => insert('audio')}
                className="flex w-full px-3 py-1.5 text-left text-[12px] text-[#0B1B2B] hover:bg-[#F7F6F2]"
              >
                Audio placeholder
              </button>
              <button
                type="button"
                onClick={() => insert('pdf')}
                className="flex w-full px-3 py-1.5 text-left text-[12px] text-[#0B1B2B] hover:bg-[#F7F6F2]"
              >
                PDF placeholder
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
