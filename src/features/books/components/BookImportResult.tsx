import { Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, BookOpen, FileText, AlignLeft, Hash } from 'lucide-react';

interface ImportSuccess {
  kind: 'success';
  bookId: string;
  title: string;
  authorDetected: boolean;
  introductionDetected: boolean;
  chaptersDetected: number;
  sectionsDetected: number;
  wordsExtracted: number;
}

interface ImportFailure {
  kind: 'failure';
  errorMessage: string;
}

type BookImportResultProps = ImportSuccess | ImportFailure;

export function BookImportResult(props: BookImportResultProps) {
  if (props.kind === 'failure') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="text-[14px] font-semibold text-red-700">Import Failed</p>
            <p className="mt-1 text-[13px] text-red-600">{props.errorMessage}</p>
            <p className="mt-2 text-[12px] text-red-500">
              This may be an encrypted, corrupted, or image-only PDF. Try a different file.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const results = [
    { icon: CheckCircle, label: 'Title detected', ok: true },
    { icon: CheckCircle, label: 'Author detected', ok: props.authorDetected },
    { icon: BookOpen,    label: 'Introduction detected', ok: props.introductionDetected },
    { icon: AlignLeft,  label: `${props.chaptersDetected} chapters detected`, ok: props.chaptersDetected > 0 },
    { icon: FileText,   label: `${props.sectionsDetected} sections detected`, ok: props.sectionsDetected > 0 },
    { icon: Hash,       label: `${props.wordsExtracted.toLocaleString()} words extracted`, ok: true },
  ];

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle size={20} className="text-emerald-600" />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-emerald-800">Import Complete</p>
          <p className="text-[13px] text-emerald-700">{props.title}</p>
        </div>
      </div>

      {/* Detection results */}
      <ul className="space-y-2 mb-6">
        {results.map(({ icon: Icon, label, ok }) => (
          <li key={label} className="flex items-center gap-2.5">
            <Icon
              size={14}
              className={ok ? 'text-emerald-600 shrink-0' : 'text-amber-500 shrink-0'}
            />
            <span className={`text-[13px] ${ok ? 'text-emerald-700' : 'text-amber-700'}`}>
              {label}
            </span>
          </li>
        ))}
      </ul>

      {/* Status + CTA */}
      <div className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-white px-4 py-3">
        <div>
          <p className="text-[12px] text-[#64748B]">Status</p>
          <p className="text-[13px] font-semibold text-amber-700">Needs Review</p>
        </div>
        <Link
          to={`/admin/books/${props.bookId}/review`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1B2B] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#162A42]"
        >
          Review Imported Book →
        </Link>
      </div>
    </div>
  );
}
