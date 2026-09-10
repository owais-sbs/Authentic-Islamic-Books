import { AlertTriangle, FileText, Languages, Layers, BookOpen } from 'lucide-react';
import type { BookWithStructure } from '../types';
import { formatLanguagesLabel, type BookLanguage } from '@/services/pdf/language';

function formatBytes(bytes?: number): string {
  if (bytes == null || bytes <= 0) return '—';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function docTypeLabel(t?: string): string {
  if (t === 'scanned') return 'Scanned';
  if (t === 'mixed') return 'Mixed';
  if (t === 'text') return 'Text';
  return '—';
}

interface BookReviewExtractionProps {
  book: BookWithStructure;
}

/** Quality-control panel for PDF import results on the review page. */
export function BookReviewExtraction({ book }: BookReviewExtractionProps) {
  const info = book.extractionInfo;
  if (!info && book.pageCount == null && book.wordCount == null) return null;

  const languages = info?.languages?.length
    ? formatLanguagesLabel(info.languages as BookLanguage[])
    : book.language || '—';

  const chapterCount = book.chapterCount ?? book.chapters.length;
  const sectionCount =
    book.sectionCount ?? book.chapters.reduce((n, ch) => n + ch.sections.length, 0);

  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white overflow-hidden">
      <div className="border-b border-[#E5E1D8] px-5 py-3.5">
        <h3 className="text-[13px] font-semibold text-[#0B1B2B]">Extraction summary</h3>
        <p className="text-[12px] text-[#94A3B8] mt-0.5">
          Review detected structure and warnings before publishing
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-3">
        <Stat icon={FileText} label="File size" value={formatBytes(info?.fileSizeBytes)} />
        <Stat icon={BookOpen} label="Pages" value={book.pageCount != null ? String(book.pageCount) : '—'} />
        <Stat icon={Layers} label="Document type" value={docTypeLabel(info?.documentType)} />
        <Stat icon={Languages} label="Languages" value={languages} />
        <Stat icon={BookOpen} label="Words" value={book.wordCount != null ? book.wordCount.toLocaleString() : '—'} />
        <Stat
          icon={Layers}
          label="Chapters / sections"
          value={`${chapterCount} / ${sectionCount}`}
        />
        {info?.ocrPageCount != null && info.ocrPageCount > 0 && (
          <Stat
            icon={FileText}
            label="OCR pages"
            value={String(info.ocrPageCount)}
          />
        )}
      </div>

      {info?.warnings && info.warnings.length > 0 && (
        <div className="border-t border-[#E5E1D8] px-5 py-4 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
            <AlertTriangle size={12} /> Warnings
          </p>
          <ul className="space-y-1.5">
            {info.warnings.map((w, i) => (
              <li
                key={i}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-900"
              >
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-[#E5E1D8] bg-[#FAFAF8] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
        <Icon size={11} />
        {label}
      </div>
      <p className="mt-1 text-[13px] font-semibold text-[#0B1B2B] truncate" title={value}>
        {value}
      </p>
    </div>
  );
}
