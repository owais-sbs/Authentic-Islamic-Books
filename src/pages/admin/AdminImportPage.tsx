import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, X, Check, Loader2, AlertCircle, Link2 } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { importPdfFile } from '@/lib/pdfImportHelpers';
import {
  createExtractionJob,
  upsertBookToSupabase,
  refreshSupabasePublishedCache,
  updateExtractionJob,
} from '@/lib/bookApi';
import { downloadPdfFromUrl } from '@/lib/pdfUrlImport';
import { reviewBookToPublicBook } from '@/lib/bookTransform';
import { useBookStore } from '@/hooks/useBookStore';
import { notifyBooksChanged } from '@/hooks/useAdminBooks';
import { isSupabaseConfigured } from '@/lib/supabase';
import { formatMaxBookPdfSize, validateBookPdfFile } from '@/lib/uploadLimits';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 'read', label: 'Reading PDF' },
  { id: 'extract', label: 'Extracting text' },
  { id: 'ocr', label: 'OCR for scanned pages' },
  { id: 'normalize', label: 'Normalizing content' },
  { id: 'languages', label: 'Detecting languages' },
  { id: 'meta', label: 'Detecting title & author' },
  { id: 'chapters', label: 'Detecting chapters and sections' },
  { id: 'markdown', label: 'Building book structure' },
  { id: 'build', label: 'Ready for review' },
  { id: 'save', label: 'Saving to shared library' },
];

type StepStatus = 'pending' | 'active' | 'done' | 'error';

interface StepState {
  id: string;
  label: string;
  status: StepStatus;
}

type Phase = 'idle' | 'processing' | 'done' | 'error';

export function AdminImportPage() {
  const navigate = useNavigate();
  const { addBook } = useBookStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [importMethod, setImportMethod] = useState<'upload' | 'url'>('upload');
  const [pdfUrl, setPdfUrl] = useState('');
  const [licenceNote, setLicenceNote] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<StepState[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [progressDetail, setProgressDetail] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [result, setResult] = useState<{
    bookId: string;
    title: string;
    author: string;
    chapters: number;
    sections: number;
    words: number;
    pages: number;
    outline: { chapter: string; sections: string[] }[];
    syncedToCloud: boolean;
  } | null>(null);

  function initSteps() {
    setSteps(STEPS.map((s) => ({ ...s, status: 'pending' })));
  }

  function setStep(id: string, status: StepStatus) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  function advanceStep(id: string) {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === id) return { ...s, status: 'active' };
        const idx = STEPS.findIndex((x) => x.id === id);
        const sIdx = STEPS.findIndex((x) => x.id === s.id);
        if (sIdx < idx) return { ...s, status: 'done' };
        return s;
      }),
    );
  }

  function handleFileSelect(f: File) {
    const validation = validateBookPdfFile(f);
    if (!validation.ok) {
      setErrorMsg(validation.message);
      return;
    }
    setFile(f);
    setPhase('idle');
    setSteps([]);
    setErrorMsg('');
    setResult(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }

  async function startImport() {
    if (!file && importMethod !== 'url') return;
    setPhase('processing');
    setErrorMsg('');
    initSteps();

    let jobId: string | null = null;

    try {
      const stageToStep: Record<string, string> = {
        read: 'read',
        extract: 'extract',
        ocr: 'ocr',
        normalize: 'normalize',
        languages: 'languages',
        meta: 'meta',
        chapters: 'chapters',
        sections: 'chapters',
        numbering: 'chapters',
        markdown: 'markdown',
        build: 'build',
      };

      let pdfFile = file;
      let sourceUrl: string | undefined;

      if (importMethod === 'url') {
        advanceStep('read');
        setProgressDetail('Downloading PDF from URL…');
        setProgressPercent(5);
        sourceUrl = pdfUrl.trim();
        pdfFile = await downloadPdfFromUrl(sourceUrl);
        setFile(pdfFile);
      }

      if (!pdfFile) throw new Error('No PDF file to import');

      jobId = await createExtractionJob({
        importMethod: importMethod === 'url' ? 'url' : 'upload',
      });

      advanceStep('read');
      const reviewBook = await importPdfFile(pdfFile, (stage, message, detail) => {
        const stepId = stageToStep[stage];
        if (stepId) advanceStep(stepId);
        if (message) setProgressDetail(message);
        if (detail?.percent != null) setProgressPercent(detail.percent);
        else if (detail?.page != null && detail?.totalPages) {
          setProgressPercent(Math.round((detail.page / detail.totalPages) * 55));
        }
        if (jobId) {
          void updateExtractionJob(jobId, {
            stage,
            progress: Math.round(
              detail?.percent ??
                (detail?.page && detail?.totalPages
                  ? (detail.page / detail.totalPages) * 55
                  : 0),
            ),
            completedPages: detail?.page,
            totalPages: detail?.totalPages,
          });
        }
      });

      if (jobId) {
        await updateExtractionJob(jobId, {
          bookId: reviewBook.id,
          stage: 'build',
          progress: 90,
          totalPages: reviewBook.pageCount,
          warnings: reviewBook.extractionInfo?.warnings,
        });
      }

      for (const step of [
        'read',
        'extract',
        'ocr',
        'normalize',
        'languages',
        'meta',
        'chapters',
        'markdown',
        'build',
      ]) {
        setStep(step, 'done');
      }
      setProgressPercent(100);
      setProgressDetail('Ready for review');

      advanceStep('save');

      let syncedToCloud = false;
      const status = 'needs_review' as const;
      const bookWithStatus = {
        ...reviewBook,
        status,
        importMethod: importMethod === 'url' ? ('url' as const) : ('upload' as const),
        sourcePdfUrl: sourceUrl,
        licenceNote: licenceNote.trim() || undefined,
        importedAt: new Date().toISOString(),
        extractionInfo: {
          ...reviewBook.extractionInfo,
          importMethod: importMethod === 'url' ? ('url' as const) : ('upload' as const),
          sourcePdfUrl: sourceUrl,
        },
      };

      if (isSupabaseConfigured()) {
        const saved = await upsertBookToSupabase(bookWithStatus, status, {
          sourceMarkdown: reviewBook.sourceMarkdown,
          originalPdfFile: pdfFile,
          originalPdfFileName: pdfFile.name,
        });
        bookWithStatus.id = saved.id;
        if (saved.coverUrl) bookWithStatus.coverUrl = saved.coverUrl;
        syncedToCloud = true;
        await refreshSupabasePublishedCache().catch(() => {});
      }

      if (bookWithStatus.extractionInfo) {
        try {
          sessionStorage.setItem(
            `idl-extract-${bookWithStatus.id}`,
            JSON.stringify(bookWithStatus.extractionInfo),
          );
        } catch {
          /* ignore */
        }
      }

      const publicBook = reviewBookToPublicBook(bookWithStatus);
      addBook(publicBook);
      notifyBooksChanged();
      setStep('save', 'done');

      if (jobId) {
        await updateExtractionJob(jobId, {
          bookId: bookWithStatus.id,
          status: 'completed',
          stage: 'done',
          progress: 100,
          completed: true,
          warnings: bookWithStatus.extractionInfo?.warnings,
        });
      }

      setResult({
        bookId: publicBook.id,
        title: publicBook.title,
        author: bookWithStatus.authorName || 'Unknown',
        chapters: bookWithStatus.chapters.length,
        sections: bookWithStatus.chapters.reduce((n, ch) => n + ch.sections.length, 0),
        words: bookWithStatus.wordCount ?? 0,
        pages: bookWithStatus.pageCount ?? 0,
        outline: bookWithStatus.chapters.map((ch) => ({
          chapter: `Chapter ${ch.number} — ${ch.title}`,
          sections: ch.sections.map((s) => `${s.number} ${s.title}`),
        })),
        syncedToCloud,
      });
      setPhase('done');
    } catch (err) {
      setStep(steps.find((s) => s.status === 'active')?.id ?? 'save', 'error');
      const msg = err instanceof Error ? err.message : 'Failed to process the PDF.';
      const needsAuth =
        msg.toLowerCase().includes('jwt') ||
        msg.toLowerCase().includes('row-level security') ||
        msg.toLowerCase().includes('not authorized') ||
        msg.toLowerCase().includes('permission');
      setErrorMsg(
        needsAuth
          ? `${msg} — Sign in with a Supabase admin account (not local-only mode) so books sync for the whole team.`
          : msg,
      );
      if (jobId) {
        void updateExtractionJob(jobId, {
          status: 'failed',
          errorMessage: msg,
          completed: true,
        });
      }
      setPhase('error');
    }
  }

  const totalSections = result?.sections ?? 0;

  return (
    <AdminShell pageTitle="Import Book">
      <div className="max-w-2xl space-y-6">
        <div>
          <Link
            to="/admin/books"
            className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-[#64748B] transition-colors hover:text-[#0B1B2B]"
          >
            <ArrowLeft size={14} /> Back to Books
          </Link>
          <h2 className="text-xl font-bold text-[#0B1B2B] sm:text-2xl">Import Book</h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Upload a PDF or import from an authorized URL — we extract text, detect chapters, retain
            the original PDF when Storage is configured, then send it to review.
          </p>

          {!isSupabaseConfigured() && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
              Supabase is not configured. Books will stay on this device only.
            </p>
          )}
        </div>

        {phase === 'idle' && (
          <div className="flex gap-2 rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] p-1">
            <button
              type="button"
              onClick={() => setImportMethod('upload')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[13px] font-semibold transition-colors',
                importMethod === 'upload'
                  ? 'bg-white text-[#0B1B2B] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0B1B2B]',
              )}
            >
              <Upload size={14} /> Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setImportMethod('url')}
              className={cn(
                'flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-[13px] font-semibold transition-colors',
                importMethod === 'url'
                  ? 'bg-white text-[#0B1B2B] shadow-sm'
                  : 'text-[#64748B] hover:text-[#0B1B2B]',
              )}
            >
              <Link2 size={14} /> Import from URL
            </button>
          </div>
        )}

        {phase === 'idle' && importMethod === 'upload' && !file && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center transition-colors hover:border-[#1B4F72]/50 hover:bg-blue-50/20 glossy-card"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#1B4F72]">
              <Upload size={26} />
            </div>
            <p className="text-[15px] font-semibold text-[#0B1B2B]">Drag &amp; drop your PDF here</p>
            <p className="mt-1 text-[13px] text-[#94A3B8]">or click to browse</p>
            <p className="mt-3 text-[12px] text-[#CBD5E1]">
              Supported: PDF · Max {formatMaxBookPdfSize()}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />
          </div>
        )}

        {phase === 'idle' && importMethod === 'url' && !file && (
          <div className="space-y-3 rounded-xl border border-[#E5E1D8] bg-white p-5">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Authorized PDF URL
            </label>
            <input
              type="url"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://example.com/authorized-book.pdf"
              className="w-full rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] px-3 py-2.5 text-[13px] text-[#0B1B2B] outline-none focus:border-[#1B4F72] focus:ring-1 focus:ring-[#1B4F72]/20"
            />
            <p className="text-[12px] text-[#94A3B8]">
              Only use URLs you are authorized to download. Private/local hosts are blocked. Prefer
              the Netlify <code className="rounded bg-[#F7F6F2] px-1">fetch-pdf</code> function in
              production for SSRF-safe downloads.
            </p>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Licence / copyright note (optional)
            </label>
            <input
              type="text"
              value={licenceNote}
              onChange={(e) => setLicenceNote(e.target.value)}
              placeholder="e.g. Publisher permission, public domain, Creative Commons…"
              className="w-full rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] px-3 py-2.5 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]"
            />
            <button
              type="button"
              disabled={!pdfUrl.trim()}
              onClick={() => void startImport()}
              className="w-full rounded-lg bg-[#0B1B2B] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#162A42] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Download &amp; Start Import
            </button>
          </div>
        )}

        {file && phase === 'idle' && (
          <div className="flex items-start gap-4 rounded-xl border border-[#E5E1D8] bg-white p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <FileText size={22} className="text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[#0B1B2B]">{file.name}</p>
              <p className="mt-0.5 text-[13px] text-[#64748B]">
                {(file.size / 1024 / 1024).toFixed(1)} MB · PDF
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPhase('idle');
                setSteps([]);
                setErrorMsg('');
              }}
              className="shrink-0 rounded-md p-1.5 text-[#94A3B8] hover:bg-[#F7F6F2] hover:text-[#0B1B2B]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {file && phase === 'idle' && importMethod === 'upload' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-[#E5E1D8] bg-white p-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Licence / copyright note (optional)
              </label>
              <input
                type="text"
                value={licenceNote}
                onChange={(e) => setLicenceNote(e.target.value)}
                placeholder="e.g. Publisher permission, public domain…"
                className="mt-1.5 w-full rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] px-3 py-2 text-[13px] text-[#0B1B2B] outline-none focus:border-[#C9A646]"
              />
            </div>
            <button
              type="button"
              onClick={() => void startImport()}
              className="w-full rounded-lg bg-[#0B1B2B] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#162A42]"
            >
              Start Import
            </button>
          </div>
        )}

        {(phase === 'processing' || phase === 'done' || phase === 'error') && steps.length > 0 && (
          <div className="rounded-xl border border-[#E5E1D8] bg-white p-6">
            <p className="mb-2 text-[13px] font-semibold text-[#0B1B2B]">
              {phase === 'processing' ? 'Processing…' : phase === 'done' ? 'Complete' : 'Failed'}
            </p>
            {phase === 'processing' && (progressDetail || progressPercent > 0) && (
              <div className="mb-4 rounded-lg border border-[#E5E1D8] bg-[#FAFAF8] px-3 py-2.5">
                {progressDetail && (
                  <p className="text-[13px] font-medium text-[#0B1B2B]">{progressDetail}</p>
                )}
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E5E1D8]">
                    <div
                      className="h-full rounded-full bg-[#1B4F72] transition-all duration-300"
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] tabular-nums text-[#64748B]">
                    {Math.round(progressPercent)}%
                  </p>
                </div>
              </div>
            )}
            <ol className="space-y-2.5">
              {steps.map((step, i) => (
                <li key={step.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                        step.status === 'done' && 'bg-emerald-100',
                        step.status === 'active' && 'bg-blue-50',
                        step.status === 'error' && 'bg-red-100',
                        step.status === 'pending' && 'border-2 border-[#E5E1D8]',
                      )}
                    >
                      {step.status === 'done' && (
                        <Check size={12} className="text-emerald-600" strokeWidth={2.5} />
                      )}
                      {step.status === 'active' && (
                        <Loader2 size={12} className="animate-spin text-[#1B4F72]" />
                      )}
                      {step.status === 'error' && (
                        <AlertCircle size={12} className="text-red-500" />
                      )}
                    </span>
                    {i < steps.length - 1 && (
                      <div
                        className={cn(
                          'mt-0.5 h-4 w-0.5 rounded-full',
                          step.status === 'done' ? 'bg-emerald-200' : 'bg-[#E5E1D8]',
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[13px]',
                      step.status === 'active' && 'font-medium text-[#0B1B2B]',
                      step.status === 'done' && 'text-[#64748B]',
                      step.status === 'error' && 'font-medium text-red-600',
                      step.status === 'pending' && 'text-[#94A3B8]',
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {phase === 'error' && errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-[14px] font-semibold text-red-700">Import Failed</p>
                <p className="mt-0.5 text-[13px] text-red-600">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhase('idle');
                setSteps([]);
                setErrorMsg('');
              }}
              className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Check size={18} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-emerald-800">Import Complete</p>
                <p className="max-w-xs truncate text-[13px] text-emerald-700">{result.title}</p>
              </div>
            </div>

            <ul className="mb-5 space-y-1.5">
              {[
                { label: 'Title detected', ok: !!result.title },
                { label: 'Author detected', ok: !!result.author },
                { label: `${result.chapters} chapters detected`, ok: result.chapters > 0 },
                { label: `${totalSections} sections detected`, ok: totalSections > 0 },
                { label: `${result.words.toLocaleString()} words extracted`, ok: true },
                { label: `${result.pages} pages processed`, ok: true },
                {
                  label: result.syncedToCloud
                    ? 'Saved to shared Supabase library'
                    : 'Saved on this device only',
                  ok: result.syncedToCloud,
                },
              ].map(({ label, ok }) => (
                <li key={label} className="flex items-center gap-2">
                  <Check
                    size={13}
                    className={ok ? 'shrink-0 text-emerald-600' : 'shrink-0 text-amber-500'}
                  />
                  <span className={cn('text-[13px]', ok ? 'text-emerald-700' : 'text-amber-700')}>
                    {label}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(`/admin/books/${result.bookId}/review`)}
                className="flex-1 rounded-lg bg-[#0B1B2B] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#162A42]"
              >
                Review &amp; Edit Book →
              </button>
              <Link
                to="/"
                className="flex-1 rounded-lg border border-emerald-300 bg-white py-2.5 text-center text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                View on Homepage
              </Link>
            </div>
          </div>
        )}

        {(phase === 'done' || phase === 'error') && (
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setPhase('idle');
              setSteps([]);
              setResult(null);
              setErrorMsg('');
            }}
            className="w-full rounded-lg border border-[#E5E1D8] bg-white py-2.5 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2]"
          >
            Import Another Book
          </button>
        )}
      </div>
    </AdminShell>
  );
}
