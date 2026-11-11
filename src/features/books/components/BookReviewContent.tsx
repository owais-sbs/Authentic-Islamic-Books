import { useEffect, useRef } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { BookChapterReview } from './BookChapterReview';
import { ScholarlyBlockInserter } from './ScholarlyBlockInserter';
import { fillMissingPageSections } from '@/features/books/lib/fillMissingPageSections';
import type { BookWithStructure, BookChapter, BookIntroduction } from '../types';

interface BookReviewContentProps {
  book: BookWithStructure;
  activeSectionId: string | null;
  onChange: (patch: Partial<BookWithStructure>) => void;
  isNewBook?: boolean;
}

const inputCls =
  'w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20';

function SectionCard({
  title,
  subtitle,
  children,
  id,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="scroll-mt-36 overflow-hidden rounded-xl border border-[#E5E1D8] bg-white">
      <div className="border-b border-[#E5E1D8] px-5 py-3.5">
        <h3 className="text-[13px] font-semibold text-[#0B1B2B]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12px] text-[#94A3B8]">{subtitle}</p>}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </div>
  );
}

function renumberChapters(chapters: BookChapter[]): BookChapter[] {
  return chapters.map((ch, i) => {
    const number = String(i + 1);
    return {
      ...ch,
      number,
      order: i,
      sections: ch.sections.map((sec, si) => ({
        ...sec,
        number: `${number}.${si + 1}`,
        order: si,
        chapterId: ch.id,
      })),
    };
  });
}

export function BookReviewContent({ book, onChange, isNewBook }: BookReviewContentProps) {
  const introInsertRef = useRef<((html: string) => void) | null>(null);
  const introUploadRef = useRef<(() => void) | null>(null);
  const repairedRef = useRef<string | null>(null);

  // Restore missing middle "Page N" slots (Arabic/OCR pages dropped by older imports)
  useEffect(() => {
    let insertedTotal = 0;
    const nextChapters = book.chapters.map((ch) => {
      const { sections, inserted } = fillMissingPageSections(ch.sections, ch.id);
      insertedTotal += inserted;
      return inserted > 0 ? { ...ch, sections } : ch;
    });
    if (insertedTotal === 0) return;
    const fingerprint = `${book.id}:${nextChapters.map((c) => c.sections.length).join(',')}`;
    if (repairedRef.current === fingerprint) return;
    repairedRef.current = fingerprint;
    onChange({
      chapters: nextChapters,
      sectionCount: nextChapters.reduce((n, c) => n + c.sections.length, 0),
    });
  }, [book.id, book.chapters, onChange]);

  function updateChapter(idx: number, patch: Partial<BookChapter>) {
    const updated = book.chapters.map((ch, i) => (i === idx ? { ...ch, ...patch } : ch));
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

  function moveChapter(idx: number, dir: -1 | 1) {
    const next = idx + dir;
    if (next < 0 || next >= book.chapters.length) return;
    const copy = [...book.chapters];
    const [item] = copy.splice(idx, 1);
    copy.splice(next, 0, item);
    onChange({ chapters: renumberChapters(copy) });
  }

  function deleteChapter(idx: number) {
    const copy = book.chapters.filter((_, i) => i !== idx);
    onChange({ chapters: renumberChapters(copy) });
  }

  function ensureIntroduction() {
    if (book.introduction) return;
    onChange({
      introduction: {
        id: `intro-${Date.now()}`,
        title: 'Introduction',
        content: '',
        order: 0,
      },
    });
  }

  return (
    <div className="space-y-5">
      {book.introduction ? (
        <SectionCard
          id="review-introduction"
          title="Introduction"
          subtitle={
            isNewBook
              ? 'Write an introduction for the book'
              : 'Review and correct introduction content'
          }
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
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Content
              </label>
              <ScholarlyBlockInserter
                onInsert={(html) => introInsertRef.current?.(html)}
                onUploadImage={() => introUploadRef.current?.()}
              />
            </div>
            <RichTextEditor
              value={book.introduction.content}
              onChange={(html) => updateIntro({ content: html })}
              placeholder="Introduction content…"
              minHeight="200px"
              bookId={book.id}
              insertHtmlRef={introInsertRef}
              uploadImageRef={introUploadRef}
            />
          </div>
        </SectionCard>
      ) : (
        <button
          type="button"
          onClick={ensureIntroduction}
          className="flex w-full items-center justify-center rounded-xl border-2 border-dashed border-[#E5E1D8] py-4 text-[13px] font-medium text-[#64748B] hover:border-[#C9A646]/50 hover:text-[#0B1B2B]"
        >
          + Add introduction
        </button>
      )}

      <div className="space-y-3">
        {book.chapters.length > 0 && (
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#0B1B2B]">
              Chapters
              <span className="ml-2 text-[12px] font-normal text-[#94A3B8]">
                {book.chapters.length} · reading order
              </span>
            </h3>
          </div>
        )}

        {book.chapters.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#E5E1D8] py-12 text-center">
            <p className="text-[14px] font-medium text-[#94A3B8]">No chapters yet</p>
            <p className="mt-1 text-[13px] text-[#CBD5E1]">
              Add chapters manually — titles are not invented automatically.
            </p>
          </div>
        ) : (
          book.chapters.map((chapter, idx) => (
            <BookChapterReview
              key={chapter.id}
              chapter={chapter}
              bookId={book.id}
              canMoveUp={idx > 0}
              canMoveDown={idx < book.chapters.length - 1}
              onChange={(patch) => updateChapter(idx, patch)}
              onMoveUp={() => moveChapter(idx, -1)}
              onMoveDown={() => moveChapter(idx, 1)}
              onDelete={() => deleteChapter(idx)}
            />
          ))
        )}

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
