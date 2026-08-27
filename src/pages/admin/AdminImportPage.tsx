import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Upload, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { parsePdf, parsedBookToPublicFormat } from '@/lib/pdfExtractor';
import { useBookStore } from '@/hooks/useBookStore';
import { cn } from '@/lib/utils';

// ─── Cover colours palette ────────────────────────────────────────────────────
const COVER_COLORS = [
  '#18231F', '#3A4A3F', '#5B4B3A', '#2B2B2B', '#4A5D4F',
  '#1F2D3F', '#6B5B3F', '#3F4A5D', '#5D5D5D', '#3A3A5D',
];

function randomCoverColor() {
  return COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')        // remove special chars
    .trim()
    .split(/\s+/)
    .slice(0, 6)                     // max 6 words
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);                   // max 60 chars total
}

// ─── Pipeline step definitions ────────────────────────────────────────────────
const STEPS = [
  { id: 'read',     label: 'Reading PDF document' },
  { id: 'extract',  label: 'Extracting text content' },
  { id: 'meta',     label: 'Detecting title & author' },
  { id: 'chapters', label: 'Detecting chapters' },
  { id: 'sections', label: 'Detecting sections' },
  { id: 'build',    label: 'Building book structure' },
  { id: 'save',     label: 'Saving to library' },
];

type StepStatus = 'pending' | 'active' | 'done' | 'error';

interface StepState {
  id: string;
  label: string;
  status: StepStatus;
}

// ─── Category mapping ─────────────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, string> = {
  hadith:      'cat-hadith',
  tafsir:      'cat-tafsir',
  fiqh:        'cat-fiqh',
  seerah:      'cat-seerah',
  history:     'cat-history',
  ethics:      'cat-ethics',
  spirituality: 'cat-spirituality',
  theology:    'cat-aqeedah',
  aqeedah:     'cat-aqeedah',
  biography:   'cat-biography',
};

function guessCategories(title: string, text: string): string[] {
  const haystack = (title + ' ' + text.slice(0, 1000)).toLowerCase();
  const found: string[] = [];
  for (const [keyword, catId] of Object.entries(CATEGORY_MAP)) {
    if (haystack.includes(keyword) && !found.includes(catId)) found.push(catId);
  }
  return found.length > 0 ? found : ['cat-thought'];
}

function guessAuthorId(authorName: string): string {
  if (!authorName) return 'scholar-ibn-kathir';
  const n = authorName.toLowerCase();
  if (n.includes('ghazali'))   return 'scholar-al-ghazali';
  if (n.includes('nawawi'))    return 'scholar-al-nawawi';
  if (n.includes('kathir'))    return 'scholar-ibn-kathir';
  if (n.includes('taymiyyah') || n.includes('taymiyya')) return 'scholar-ibn-taymiyyah';
  if (n.includes('hajar'))     return 'scholar-ibn-hajar';
  if (n.includes('suyuti'))    return 'scholar-al-suyuti';
  return 'scholar-ibn-kathir';
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Phase = 'idle' | 'processing' | 'done' | 'error';

export function AdminImportPage() {
  const navigate = useNavigate();
  const { addBook } = useBookStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [steps, setSteps] = useState<StepState[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<{
    bookId: string;
    title: string;
    author: string;
    chapters: number;
    sections: number;
    words: number;
    pages: number;
  } | null>(null);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function initSteps() {
    setSteps(STEPS.map((s) => ({ ...s, status: 'pending' })));
  }

  function setStep(id: string, status: StepStatus) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  }

  function advanceStep(id: string) {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === id) return { ...s, status: 'active' };
        const idx = STEPS.findIndex((x) => x.id === id);
        const sIdx = STEPS.findIndex((x) => x.id === s.id);
        if (sIdx < idx) return { ...s, status: 'done' };
        return s;
      })
    );
  }

  // ─── File handling ─────────────────────────────────────────────────────────
  function handleFileSelect(f: File) {
    if (f.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file.');
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

  // ─── Main import pipeline ──────────────────────────────────────────────────
  async function startImport() {
    if (!file) return;
    setPhase('processing');
    setErrorMsg('');
    initSteps();

    try {
      // Step 1 – read
      advanceStep('read');
      await new Promise((r) => setTimeout(r, 200));
      setStep('read', 'done');

      // Step 2 – extract text (real PDF.js work)
      advanceStep('extract');
      const parsed = await parsePdf(file);
      setStep('extract', 'done');

      // Step 3 – metadata
      advanceStep('meta');
      await new Promise((r) => setTimeout(r, 150));
      setStep('meta', 'done');

      // Step 4 – chapters
      advanceStep('chapters');
      await new Promise((r) => setTimeout(r, 150));
      setStep('chapters', 'done');

      // Step 5 – sections
      advanceStep('sections');
      await new Promise((r) => setTimeout(r, 150));
      setStep('sections', 'done');

      // Step 6 – build public Book object
      advanceStep('build');
      const title = parsed.meta.title || file.name.replace(/\.pdf$/i, '');
      const bookId = `imported-${slugify(title)}-${Date.now()}`;
      const slug   = slugify(title);
      const categoryIds = guessCategories(title, parsed.introductionText);
      const authorId    = guessAuthorId(parsed.meta.author);
      const coverColor  = randomCoverColor();

      const publicBook = parsedBookToPublicFormat(
        parsed,
        bookId,
        slug,
        categoryIds,
        authorId,
        coverColor
      );
      setStep('build', 'done');

      // Step 7 – save to store
      advanceStep('save');
      addBook(publicBook);
      // Dispatch storage event so useLibraryFilters picks it up
      window.dispatchEvent(new Event('storage'));
      setStep('save', 'done');

      setResult({
        bookId,
        title,
        author: parsed.meta.author || 'Unknown',
        chapters: parsed.chapters.length,
        sections: parsed.chapters.reduce((n, ch) => n + ch.sections.length, 0),
        words: parsed.wordCount,
        pages: parsed.pageCount,
      });
      setPhase('done');
    } catch (err) {
      setStep(steps.find((s) => s.status === 'active')?.id ?? 'read', 'error');
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Failed to process the PDF. It may be encrypted, scanned, or corrupted.'
      );
      setPhase('error');
    }
  }

  const totalSections = result?.sections ?? 0;

  return (
    <AdminShell pageTitle="Import Book">
      <div className="max-w-2xl space-y-6">

        {/* Back + header */}
        <div>
          <Link
            to="/admin/books"
            className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-[#64748B] transition-colors hover:text-[#0B1B2B]"
          >
            <ArrowLeft size={14} /> Back to Books
          </Link>
          <h2 className="text-xl font-bold text-[#0B1B2B] sm:text-2xl">Import Book</h2>
          <p className="mt-0.5 text-sm text-[#64748B]">
            Upload a PDF — we extract the text, detect chapters and sections, and add it to your library automatically.
          </p>
        </div>

        {/* Drop zone — only when idle */}
        {phase === 'idle' && !file && (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#E5E1D8] bg-[#F7F6F2] px-8 py-16 text-center transition-colors hover:border-[#C9A646]/50 hover:bg-[#F5F4EF]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A646]/10 mb-4">
              <Upload size={26} className="text-[#C9A646]" />
            </div>
            <p className="text-[15px] font-semibold text-[#0B1B2B]">Drag &amp; drop your PDF here</p>
            <p className="mt-1 text-[13px] text-[#94A3B8]">or click to browse</p>
            <p className="mt-3 text-[12px] text-[#CBD5E1]">Supported: PDF · Max 100 MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
          </div>
        )}

        {/* Selected file card */}
        {file && phase === 'idle' && (
          <div className="flex items-start gap-4 rounded-xl border border-[#E5E1D8] bg-white p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-50">
              <FileText size={22} className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#0B1B2B] truncate">{file.name}</p>
              <p className="mt-0.5 text-[13px] text-[#64748B]">
                {(file.size / 1024 / 1024).toFixed(1)} MB · PDF Document
              </p>
            </div>
            <button
              onClick={() => { setFile(null); setPhase('idle'); setSteps([]); setErrorMsg(''); }}
              className="shrink-0 rounded-md p-1.5 text-[#94A3B8] hover:bg-[#F7F6F2] hover:text-[#0B1B2B]"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Start import button */}
        {file && phase === 'idle' && (
          <button
            type="button"
            onClick={startImport}
            className="w-full rounded-lg bg-[#0B1B2B] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#162A42]"
          >
            Start Import
          </button>
        )}

        {/* Processing pipeline steps */}
        {(phase === 'processing' || phase === 'done' || phase === 'error') && steps.length > 0 && (
          <div className="rounded-xl border border-[#E5E1D8] bg-white p-6">
            <p className="mb-4 text-[13px] font-semibold text-[#0B1B2B]">
              {phase === 'processing' ? 'Processing…' : phase === 'done' ? 'Complete' : 'Failed'}
            </p>
            <ol className="space-y-2.5">
              {steps.map((step, i) => (
                <li key={step.id} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                      step.status === 'done'   && 'bg-emerald-100',
                      step.status === 'active' && 'bg-[#C9A646]/10',
                      step.status === 'error'  && 'bg-red-100',
                      step.status === 'pending' && 'border-2 border-[#E5E1D8]',
                    )}>
                      {step.status === 'done'    && <Check size={12} className="text-emerald-600" strokeWidth={2.5} />}
                      {step.status === 'active'  && <Loader2 size={12} className="text-[#C9A646] animate-spin" />}
                      {step.status === 'error'   && <AlertCircle size={12} className="text-red-500" />}
                    </span>
                    {i < steps.length - 1 && (
                      <div className={cn('mt-0.5 h-4 w-0.5 rounded-full', step.status === 'done' ? 'bg-emerald-200' : 'bg-[#E5E1D8]')} />
                    )}
                  </div>
                  <span className={cn(
                    'text-[13px]',
                    step.status === 'active'  && 'font-medium text-[#0B1B2B]',
                    step.status === 'done'    && 'text-[#64748B]',
                    step.status === 'error'   && 'font-medium text-red-600',
                    step.status === 'pending' && 'text-[#94A3B8]',
                  )}>
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <div>
                <p className="text-[14px] font-semibold text-red-700">Import Failed</p>
                <p className="mt-0.5 text-[13px] text-red-600">{errorMsg}</p>
              </div>
            </div>
            <button
              onClick={() => { setPhase('idle'); setSteps([]); setErrorMsg(''); }}
              className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success result */}
        {phase === 'done' && result && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Check size={18} className="text-emerald-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-emerald-800">Import Complete</p>
                <p className="text-[13px] text-emerald-700 truncate max-w-xs">{result.title}</p>
              </div>
            </div>

            <ul className="space-y-1.5 mb-5">
              {[
                { label: 'Title detected',    ok: !!result.title },
                { label: 'Author detected',   ok: !!result.author },
                { label: `${result.chapters} chapters detected`, ok: result.chapters > 0 },
                { label: `${totalSections} sections detected`,   ok: totalSections > 0 },
                { label: `${result.words.toLocaleString()} words extracted`, ok: true },
                { label: `${result.pages} pages processed`, ok: true },
              ].map(({ label, ok }) => (
                <li key={label} className="flex items-center gap-2">
                  <Check size={13} className={ok ? 'text-emerald-600 shrink-0' : 'text-amber-500 shrink-0'} />
                  <span className={cn('text-[13px]', ok ? 'text-emerald-700' : 'text-amber-700')}>{label}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => navigate(`/admin/books/${result.bookId}/review`)}
                className="flex-1 rounded-lg bg-[#0B1B2B] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#162A42]"
              >
                Review &amp; Edit Book →
              </button>
              <Link
                to="/library"
                target="_blank"
                className="flex-1 rounded-lg border border-emerald-300 bg-white py-2.5 text-center text-[13px] font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                View in Library ↗
              </Link>
            </div>
          </div>
        )}

        {/* Import another */}
        {(phase === 'done' || phase === 'error') && (
          <button
            type="button"
            onClick={() => { setFile(null); setPhase('idle'); setSteps([]); setResult(null); setErrorMsg(''); }}
            className="w-full rounded-lg border border-[#E5E1D8] bg-white py-2.5 text-[13px] font-medium text-[#64748B] transition-colors hover:bg-[#F7F6F2]"
          >
            Import Another Book
          </button>
        )}
      </div>
    </AdminShell>
  );
}
