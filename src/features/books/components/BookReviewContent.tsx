import { RichTextEditor } from './RichTextEditor';
import { BookChapterReview } from './BookChapterReview';
import { cn } from '@/lib/utils';
import type { BookWithStructure, BookChapter, BookIntroduction } from '../types';

interface BookReviewContentProps {
  book: BookWithStructure;
  activeSectionId: string | null;
  onChange: (patch: Partial<BookWithStructure>) => void;
  isNewBook?: boolean;
}

const inputCls =
  'w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20';

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white overflow-hidden">
      <div className="border-b border-[#E5E1D8] px-5 py-3.5">
        <h3 className="text-[13px] font-semibold text-[#0B1B2B]">{title}</h3>
        {subtitle && <p className="text-[12px] text-[#94A3B8] mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-5 py-5 space-y-4">{children}</div>
    </div>
  );
}

export function BookReviewContent({ book, onChange, isNewBook }: BookReviewContentProps) {
  function updateChapter(idx: number, patch: Partial<BookChapter>) {
    const updated = book.chapters.map((ch, i) => i === idx ? { ...ch, ...patch } : ch);
    onChange({ chapters: updated });
  }

  function updateIntro(patch: Partial<BookIntroduction>) {
    if (!book.introduction) return;
    onChange({ introduction: { ...book.introduction, ...patch } });
  }

  function addChapter() {
    const num = String(book.chapters.length + 1);
    const newChapter: BookChapter = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      bookId: book.id,
      number: num,
      title: '',
      description: '',
      order: book.chapters.length,
      sections: [],
    };
    onChange({ chapters: [...book.chapters, newChapter] });
  }

  return (
    <div className="space-y-5">
      {/* Introduction */}
      {book.introduction && (
        <SectionCard
          title="Introduction"
          subtitle={isNewBook ? 'Write an introduction for the book' : 'Review and correct introduction content'}
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Title
              </label>
              <input
                className={inputCls}
                value={book.introduction.title}
                onChange={(e) => updateIntro({ title: e.target.value })}
                placeholder="Introduction"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Subtitle
              </label>
              <input
                className={inputCls}
                value={book.introduction.subtitle ?? ''}
                onChange={(e) => updateIntro({ subtitle: e.target.value })}
                placeholder="Optional subtitle"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Content
            </label>
            <RichTextEditor
              value={book.introduction.content}
              onChange={(html) => updateIntro({ content: html })}
              placeholder="Introduction content extracted from PDF..."
              minHeight="200px"
            />
          </div>
        </SectionCard>
      )}

      {/* Chapters */}
      <div className="space-y-3">
        {book.chapters.length > 0 && (
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#0B1B2B]">
              Chapters
              <span className="ml-2 text-[12px] font-normal text-[#94A3B8]">
                {book.chapters.length} detected
              </span>
            </h3>
          </div>
        )}

        {book.chapters.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#E5E1D8] py-12 text-center">
            <p className="text-[14px] font-medium text-[#94A3B8]">No chapters yet</p>
            <p className="mt-1 text-[13px] text-[#CBD5E1]">
              Add chapters manually using the button below.
            </p>
          </div>
        ) : (
          book.chapters.map((chapter, idx) => (
            <BookChapterReview
              key={chapter.id}
              chapter={chapter}
              onChange={(patch) => updateChapter(idx, patch)}
            />
          ))
        )}

        {/* Add chapter */}
        <button
          type="button"
          onClick={addChapter}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#C9A646]/25 py-3 text-[13px] font-medium text-[#C9A646] transition-colors hover:border-[#C9A646]/60 hover:bg-[#C9A646]/5"
        >
          + Add Chapter
        </button>
      </div>
    </div>
  );
}
