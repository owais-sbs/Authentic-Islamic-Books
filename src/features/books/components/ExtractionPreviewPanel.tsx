/**
 * Dry-run extraction results: page reports + old/new comparison + PDF page view.
 * Does not save until the admin clicks Apply.
 */
import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileWarning, X } from 'lucide-react';
import type { ExtractionPreviewResult } from '@/lib/extractionPreview';
import { renderPdfPagePreview } from '@/lib/pdfExtractor';
import { cn } from '@/lib/utils';

interface ExtractionPreviewPanelProps {
  preview: ExtractionPreviewResult;
  busy?: boolean;
  onDiscard: () => void;
  onApplyDraft: () => void;
}

export function ExtractionPreviewPanel({
  preview,
  busy,
  onDiscard,
  onApplyDraft,
}: ExtractionPreviewPanelProps) {
  const problemPages = useMemo(
    () => preview.pages.filter((p) => p.needsManualReview),
    [preview.pages],
  );
  const [showAllPages, setShowAllPages] = useState(false);
  const [selectedPage, setSelectedPage] = useState<number | null>(
    problemPages[0]?.pageNumber ?? preview.pages[0]?.pageNumber ?? null,
  );
  const [pdfThumb, setPdfThumb] = useState<string | null>(null);
  const [pdfThumbError, setPdfThumbError] = useState<string | null>(null);
  const [pdfThumbLoading, setPdfThumbLoading] = useState(false);

  const pageList = showAllPages || problemPages.length === 0 ? preview.pages : problemPages;
  const selected = preview.pages.find((p) => p.pageNumber === selectedPage) ?? null;

  useEffect(() => {
    if (selectedPage == null) {
      setPdfThumb(null);
      return;
    }
    let cancelled = false;
    setPdfThumbLoading(true);
    setPdfThumbError(null);
    setPdfThumb(null);
    void renderPdfPagePreview(preview.pdfFile, selectedPage)
      .then((url) => {
        if (!cancelled) setPdfThumb(url);
      })
      .catch((err) => {
        if (!cancelled) {
          setPdfThumbError(err instanceof Error ? err.message : 'Could not render PDF page');
        }
      })
      .finally(() => {
        if (!cancelled) setPdfThumbLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [preview.pdfFile, selectedPage]);

  const metaChanged =
    preview.previousSnapshot.title !== preview.proposedSnapshot.title ||
    preview.previousSnapshot.author !== preview.proposedSnapshot.author;

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50/80 overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-amber-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-amber-950">
            Extraction preview (dry-run — not saved)
          </h3>
          <p className="text-[12px] text-amber-900/80">
            PDF: {preview.pdfFileName} · {preview.totalPages} pages · OCR on{' '}
            {preview.ocrPageCount} page(s)
            {preview.ocrFailedPages.length > 0
              ? ` · OCR failed: ${preview.ocrFailedPages.join(', ')}`
              : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onDiscard}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-2 text-[12px] font-medium text-amber-950 disabled:opacity-50"
          >
            <X size={14} />
            Discard preview
          </button>
          <button
            type="button"
            onClick={onApplyDraft}
            disabled={busy || preview.worseThanExisting}
            title={
              preview.worseThanExisting
                ? 'New extract is too thin — save aborted to protect existing content'
                : 'Replace editor content with this extract as needs_review (not published)'
            }
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#104C3B] px-3 py-2 text-[12px] font-semibold text-white disabled:opacity-50"
          >
            <CheckCircle2 size={14} />
            {busy ? 'Applying…' : 'Apply as needs review'}
          </button>
        </div>
      </div>

      {preview.worseThanExisting && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-[12px] text-red-800">
          New extraction has almost no text while the book already has content. Apply is blocked.
        </div>
      )}

      <div className="grid gap-0 lg:grid-cols-2">
        <div className="border-b border-amber-200 p-4 lg:border-b-0 lg:border-r space-y-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800/80">
              Old vs new
            </p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 text-[12px] text-amber-950">
              <div className="rounded-lg border border-amber-200 bg-white/70 p-3">
                <p className="font-semibold">Previous</p>
                <p className="mt-1 break-words">{preview.previousSnapshot.title || '—'}</p>
                <p className="mt-0.5 text-amber-900/80 break-words">
                  Author: {preview.previousSnapshot.author || '—'}
                </p>
                <p className="mt-1 text-amber-900/80">
                  {preview.previousSnapshot.chapterCount} ch ·{' '}
                  {preview.previousSnapshot.sectionCount} sec ·{' '}
                  {preview.previousSnapshot.contentChars.toLocaleString()} chars
                </p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white/70 p-3">
                <p className="font-semibold">Proposed</p>
                <p className="mt-1 break-words">{preview.proposedSnapshot.title || '—'}</p>
                <p className="mt-0.5 text-amber-900/80 break-words">
                  Author: {preview.proposedSnapshot.author || '—'}
                </p>
                <p className="mt-1 text-amber-900/80">
                  {preview.proposedSnapshot.chapterCount} ch ·{' '}
                  {preview.proposedSnapshot.sectionCount} sec ·{' '}
                  {preview.proposedSnapshot.contentChars.toLocaleString()} chars
                </p>
              </div>
            </div>
            {metaChanged && (
              <p className="mt-2 text-[12px] text-amber-900">
                Metadata differs (title and/or author). Review before apply — existing published
                metadata is not changed until you apply as needs_review.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-white px-2.5 py-1 border border-amber-200">
              Arabic issues: {preview.summary.arabicProblemPages}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 border border-amber-200">
              Empty/thin: {preview.summary.emptyPages}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 border border-amber-200">
              Dup pages: {preview.summary.duplicatePages}
            </span>
            <span className="rounded-full bg-white px-2.5 py-1 border border-amber-200">
              Needs review: {preview.summary.reviewPages}
            </span>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800/80">
              Chapters / sections
            </p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 text-[12px]">
              <ol className="max-h-40 overflow-auto rounded-lg border border-amber-200 bg-white/70 p-2 space-y-1">
                {preview.previousSnapshot.chapters.length === 0 && (
                  <li className="text-amber-800/70">No chapters</li>
                )}
                {preview.previousSnapshot.chapters.map((ch, i) => (
                  <li key={`old-${i}`} className="truncate" title={ch.title}>
                    <span className="font-medium">{ch.number || i + 1}.</span> {ch.title}
                  </li>
                ))}
              </ol>
              <ol className="max-h-40 overflow-auto rounded-lg border border-amber-200 bg-white/70 p-2 space-y-1">
                {preview.proposedSnapshot.chapters.length === 0 && (
                  <li className="text-amber-800/70">No chapters</li>
                )}
                {preview.proposedSnapshot.chapters.map((ch, i) => (
                  <li key={`new-${i}`} className="truncate" title={ch.title}>
                    <span className="font-medium">{ch.number || i + 1}.</span> {ch.title}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {preview.pipelineWarnings.length > 0 && (
            <ul className="space-y-1">
              {preview.pipelineWarnings.slice(0, 10).map((w, i) => (
                <li key={i} className="flex gap-1.5 text-[12px] text-amber-950">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-700" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-800/80">
              Page inspection ({pageList.length}/{preview.pages.length})
            </p>
            <button
              type="button"
              onClick={() => setShowAllPages((v) => !v)}
              className="text-[11px] font-medium text-[#104C3B] underline-offset-2 hover:underline"
            >
              {showAllPages ? 'Show problem pages' : 'Show all pages'}
            </button>
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {pageList.map((p) => (
              <button
                key={p.pageNumber}
                type="button"
                onClick={() => setSelectedPage(p.pageNumber)}
                className={cn(
                  'shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium tabular-nums',
                  selectedPage === p.pageNumber
                    ? 'border-[#104C3B] bg-[#104C3B] text-white'
                    : p.needsManualReview
                      ? 'border-amber-300 bg-white text-amber-950'
                      : 'border-amber-100 bg-white/60 text-amber-900',
                )}
              >
                p.{p.pageNumber}
              </button>
            ))}
          </div>

          {selected && (
            <div className="rounded-lg border border-amber-200 bg-white p-3 space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-amber-900">
                <span className="font-semibold">PDF page {selected.pageNumber}</span>
                <span>lang: {selected.language}</span>
                <span>OCR: {selected.usedOcr ? 'yes' : 'no'}</span>
                <span>
                  OCR confidence:{' '}
                  {selected.ocrConfidence == null
                    ? 'unavailable'
                    : `${selected.ocrConfidence}%`}
                </span>
                <span>Arabic quality: {selected.arabicScore}</span>
                {selected.arabicFragmented && <span>fragmented</span>}
                {selected.arabicReversed && <span>reversed?</span>}
                {selected.duplicateOfPreviousPage && <span>duplicate</span>}
              </div>

              {selected.warnings.length > 0 && (
                <ul className="space-y-0.5 text-[12px] text-amber-950">
                  {selected.warnings.map((w, i) => (
                    <li key={i} className="flex gap-1">
                      <FileWarning size={12} className="mt-0.5 shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              )}

              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-amber-800/80">
                    Original PDF page
                  </p>
                  {pdfThumbLoading && (
                    <p className="text-[12px] text-amber-800/70">Rendering page…</p>
                  )}
                  {pdfThumbError && (
                    <p className="text-[12px] text-red-700">{pdfThumbError}</p>
                  )}
                  {pdfThumb && (
                    <img
                      src={pdfThumb}
                      alt={`PDF page ${selected.pageNumber}`}
                      className="max-h-64 w-full rounded border border-amber-100 object-contain bg-[#F7F6F2]"
                    />
                  )}
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-semibold text-amber-800/80">
                    Extracted text
                  </p>
                  <pre
                    dir="auto"
                    className="max-h-64 overflow-auto whitespace-pre-wrap rounded border border-amber-100 bg-amber-50/50 p-2 text-[12px] leading-relaxed text-[#0B1B2B]"
                  >
                    {selected.fullText || '(empty)'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
