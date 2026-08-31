import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { BookWithStructure } from '../types';
import { cn } from '@/lib/utils';

const AVAILABLE_CATEGORIES = [
  'Aqeedah', 'Hadith', 'Tafsir', 'Fiqh', 'Seerah',
  'History', 'Ethics', 'Spirituality', 'Islamic Thought', 'Biography',
];

const COVER_COLORS = [
  '#18231F', '#3F4A5D', '#3A4A3F', '#5B4B3A', '#2D1215', '#0B1929', '#1C1C2E',
];

const inputCls =
  'w-full rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] text-[#0B1B2B] placeholder-[#94A3B8] outline-none transition-colors focus:border-[#C9A646] focus:ring-1 focus:ring-[#C9A646]/20';

interface BookReviewMetadataProps {
  book: BookWithStructure;
  onChange: (patch: Partial<BookWithStructure>) => void;
  isNewBook?: boolean;
}

function Field({ label, children, hint }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#64748B]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

export function BookReviewMetadata({ book, onChange, isNewBook }: BookReviewMetadataProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleCategory(cat: string) {
    const next = book.categories.includes(cat)
      ? book.categories.filter((c) => c !== cat)
      : [...book.categories, cat];
    onChange({ categories: next });
  }

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ coverUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white overflow-hidden">
      <div className="border-b border-[#E5E1D8] px-5 py-3.5">
        <h3 className="text-[13px] font-semibold text-[#0B1B2B]">Book Metadata</h3>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">
          {isNewBook ? 'Fill in the book details below' : 'Review and correct book details'}
        </p>
      </div>
      <div className="px-5 py-5 space-y-4">

        {/* Cover image */}
        <Field label="Cover Image" hint="Upload a cover image (JPG, PNG, WebP). Optional — a generated cover is used if none is provided.">
          <div className="flex items-start gap-4">
            <div
              className="relative flex h-36 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E5E1D8] bg-[#F7F6F2]"
              style={!book.coverUrl ? { backgroundColor: book.coverColor } : undefined}
            >
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt="Book cover preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlus size={24} className="text-white/60" />
              )}
            </div>
            <div className="flex flex-col gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#F7F6F2]"
              >
                <ImagePlus size={14} />
                {book.coverUrl ? 'Change Cover' : 'Upload Cover'}
              </button>
              {book.coverUrl && (
                <button
                  type="button"
                  onClick={() => onChange({ coverUrl: undefined })}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <X size={14} />
                  Remove Cover
                </button>
              )}
            </div>
          </div>
        </Field>

        {/* Fallback cover color (when no image) */}
        {!book.coverUrl && (
          <Field label="Cover Color" hint="Used for the generated cover when no image is uploaded">
            <div className="flex flex-wrap gap-2">
              {COVER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onChange({ coverColor: color })}
                  className={cn(
                    'h-8 w-8 rounded-lg border-2 transition-all',
                    book.coverColor === color
                      ? 'border-[#C9A646] scale-110'
                      : 'border-transparent hover:border-[#E5E1D8]'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select cover color ${color}`}
                />
              ))}
            </div>
          </Field>
        )}

        <Field label="Title">
          <input
            className={inputCls}
            value={book.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Book title"
          />
        </Field>

        <Field label="Subtitle">
          <input
            className={inputCls}
            value={book.subtitle ?? ''}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Optional subtitle"
          />
        </Field>

        <Field label="Author">
          <input
            className={inputCls}
            value={book.authorName ?? ''}
            onChange={(e) => onChange({ authorName: e.target.value })}
            placeholder="Author name"
          />
        </Field>

        <Field label="Description">
          <textarea
            className={cn(inputCls, 'resize-none')}
            rows={3}
            value={book.description ?? ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Short description for library listings..."
          />
        </Field>

        {/* Hijri period */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hijri Start">
            <input
              type="number"
              className={inputCls}
              value={book.hijriStartYear ?? ''}
              onChange={(e) => onChange({ hijriStartYear: Number(e.target.value) || undefined })}
              placeholder="e.g. 701"
            />
          </Field>
          <Field label="Hijri End">
            <input
              type="number"
              className={inputCls}
              value={book.hijriEndYear ?? ''}
              onChange={(e) => onChange({ hijriEndYear: Number(e.target.value) || undefined })}
              placeholder="e.g. 774"
            />
          </Field>
        </div>

        {/* Categories */}
        <Field label="Categories" hint="Select all that apply">
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {AVAILABLE_CATEGORIES.map((cat) => {
              const active = book.categories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    'rounded-full border px-3 py-0.5 text-[12px] font-medium transition-all',
                    active
                      ? 'border-[#C9A646] bg-[#C9A646]/10 text-[#8C7030]'
                      : 'border-[#E5E1D8] bg-white text-[#64748B] hover:border-[#C9A646]/30'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Stats row */}
        {(book.wordCount || book.pageCount) && (
          <div className="flex flex-wrap gap-4 pt-1 border-t border-[#F1F0EB]">
            {book.wordCount && (
              <div>
                <p className="text-[11px] text-[#94A3B8]">Words extracted</p>
                <p className="text-[13px] font-semibold text-[#0B1B2B]">{book.wordCount.toLocaleString()}</p>
              </div>
            )}
            {book.pageCount && (
              <div>
                <p className="text-[11px] text-[#94A3B8]">Pages</p>
                <p className="text-[13px] font-semibold text-[#0B1B2B]">{book.pageCount}</p>
              </div>
            )}
            {book.chapterCount && (
              <div>
                <p className="text-[11px] text-[#94A3B8]">Chapters</p>
                <p className="text-[13px] font-semibold text-[#0B1B2B]">{book.chapterCount}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
