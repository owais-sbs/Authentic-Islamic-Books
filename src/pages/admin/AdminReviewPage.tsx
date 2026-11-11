import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { BookReviewHeader } from '@/features/books/components/BookReviewHeader';
import { BookReviewMetadata } from '@/features/books/components/BookReviewMetadata';
import { BookReviewContent } from '@/features/books/components/BookReviewContent';
import { BookReviewStructure } from '@/features/books/components/BookReviewStructure';
import { BookReviewExtraction } from '@/features/books/components/BookReviewExtraction';
import { BookDocumentUpload } from '@/features/books/components/BookDocumentUpload';
import { mockBookWithStructure, mockBooks } from '@/features/books/data/mockBooks';
import { useBookStore } from '@/hooks/useBookStore';
import {
  createEmptyBook,
  publicBookToReviewBook,
  reviewBookToPublicBook,
} from '@/lib/bookTransform';
import {
  backupBookContentSnapshot,
  createExtractionJob,
  downloadOriginalPdfBlob,
  fetchBookById,
  refreshSupabasePublishedCache,
  testSupabaseConnection,
  updateExtractionJob,
  uploadOriginalPdf,
  upsertBookToSupabase,
} from '@/lib/bookApi';
import { runExtractionPreview, type ExtractionPreviewResult } from '@/lib/extractionPreview';
import { ExtractionPreviewPanel } from '@/features/books/components/ExtractionPreviewPanel';
import { BookMediaManager } from '@/features/books/components/BookMediaManager';
import { isSupabaseConfigured } from '@/lib/supabase';
import { showBookSavedSuccess, showNewBookWelcome } from '@/lib/swal';
import { notifyBooksChanged } from '@/hooks/useAdminBooks';
import { validateBookPdfFile } from '@/lib/uploadLimits';
import type { BookExtractionInfo, BookStatus, BookWithStructure } from '@/features/books/types';
import type { Book } from '@/types';

function loadExtractionInfo(bookId: string | undefined): BookExtractionInfo | undefined {
  if (!bookId) return undefined;
  try {
    const raw = sessionStorage.getItem(`idl-extract-${bookId}`);
    if (!raw) return undefined;
    return JSON.parse(raw) as BookExtractionInfo;
  } catch {
    return undefined;
  }
}

function loadInitialBook(
  bookId: string | undefined,
  getById: (id: string) => Book | undefined,
  isNewBook: boolean
): BookWithStructure {
  if (isNewBook) return createEmptyBook();
  if (!bookId) return mockBookWithStructure;

  const stored = getById(bookId);
  if (stored) return publicBookToReviewBook(stored, 'needs_review');

  if (bookId === mockBookWithStructure.id) return mockBookWithStructure;
  const found = mockBooks.find((b) => b.id === bookId);
  if (found) return { ...found, chapters: [] };

  return createEmptyBook();
}

export function AdminReviewPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isNewBook = location.pathname === '/admin/books/new';
  const resetKey = (location.state as { reset?: number } | null)?.reset;
  const { getById, addBook } = useBookStore();

  const [book, setBook] = useState<BookWithStructure>(() => {
    const initial = loadInitialBook(bookId, getById, isNewBook);
    const extract = loadExtractionInfo(bookId) ?? initial.extractionInfo;
    return extract ? { ...initial, extractionInfo: extract } : initial;
  });
  const [isDirty, setIsDirty] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewBook && isSupabaseConfigured());
  const [supabaseStatus, setSupabaseStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [pdfImported, setPdfImported] = useState(false);
  const [extractionPreview, setExtractionPreview] = useState<ExtractionPreviewResult | null>(null);
  const [isApplyingPreview, setIsApplyingPreview] = useState(false);
  const reprocessPdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isNewBook && resetKey) {
      setBook(createEmptyBook());
      setIsDirty(false);
      setSaveError(null);
      setPdfImported(false);
    }
  }, [isNewBook, resetKey]);

  useEffect(() => {
    if (!isNewBook) return;
    const key = 'idl-new-book-welcome';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
    void showNewBookWelcome();
  }, [isNewBook]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    testSupabaseConnection().then(setSupabaseStatus);
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (isNewBook || !bookId || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetchBookById(bookId)
      .then((remote) => {
        if (cancelled) return;
        if (remote) {
          const extract = loadExtractionInfo(bookId) ?? remote.extractionInfo;
          setBook(extract ? { ...remote, extractionInfo: extract } : remote);
          setIsDirty(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSaveError(err instanceof Error ? err.message : 'Failed to load book');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookId, isNewBook]);

  const patch = useCallback((update: Partial<BookWithStructure>) => {
    setBook((prev) => ({ ...prev, ...update }));
    setIsDirty(true);
    setSaveError(null);
  }, []);

  function handlePdfImported(imported: BookWithStructure) {
    if (imported.extractionInfo && imported.id) {
      try {
        sessionStorage.setItem(
          `idl-extract-${imported.id}`,
          JSON.stringify(imported.extractionInfo),
        );
      } catch {
        /* ignore */
      }
    }
    setBook(imported);
    setIsDirty(true);
    setPdfImported(true);
    setSaveError(null);
  }

  async function persistBook(status: BookStatus, options?: { stayOnPage?: boolean }) {
    setIsSaving(true);
    setSaveError(null);

    const today = new Date().toISOString().slice(0, 10);
    const bookWithStatus: BookWithStructure = {
      ...book,
      status,
      updatedAt: today,
      createdAt: book.createdAt || today,
      chapterCount: book.chapters.length,
      sectionCount: book.chapters.reduce((n, c) => n + c.sections.length, 0),
    };
    const publicBook = reviewBookToPublicBook(bookWithStatus);
    publicBook.addedDate = today;

    try {
      if (isSupabaseConfigured()) {
        // Backup current content.json before overwriting published/live structure
        if (!isNewBook && book.id) {
          await backupBookContentSnapshot(book.id);
        }
        const result = await upsertBookToSupabase(bookWithStatus, status);
        publicBook.id = result.id;
        publicBook.slug = result.slug;
        publicBook.coverUrl = result.coverUrl ?? publicBook.coverUrl;
        await refreshSupabasePublishedCache();
      }

      addBook(publicBook);
      notifyBooksChanged();

      setBook(bookWithStatus);
      setIsDirty(false);

      if (options?.stayOnPage) return;

      const action = await showBookSavedSuccess(
        publicBook.title,
        status === 'published' ? 'published' : 'draft',
      );

      if (action === 'add-another') {
        navigate('/admin/books/new', { replace: true, state: { reset: Date.now() } });
      } else {
        navigate('/admin/books');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSaveDraft() {
    void persistBook('draft');
  }

  function handleApprove() {
    const updatingLive = book.status === 'published';
    const ok = window.confirm(
      updatingLive
        ? `Update the live published book “${book.title || 'Untitled'}”?\n\nA content backup will be created when possible. Public URL and book ID stay the same.`
        : `Publish “${book.title || 'Untitled'}”?\n\nIt will appear on the public site. You can unpublish later.`,
    );
    if (!ok) return;
    void persistBook('published');
  }

  function handleUnpublish() {
    const ok = window.confirm(
      `Unpublish “${book.title || 'Untitled'}”?\n\nIt will be saved as a draft and removed from the public catalogue. Book ID and URLs are kept.`,
    );
    if (!ok) return;
    void persistBook('draft');
  }

  function handleReprocessClick() {
    // Always prefer an explicit PDF pick when none retained; otherwise still allow re-upload
    if (!book.sourcePdfPath) {
      reprocessPdfInputRef.current?.click();
      return;
    }
    const useStored = window.confirm(
      'Run a dry-run extraction preview?\n\n' +
        'OK = use the stored original PDF\n' +
        'Cancel = choose a different PDF file\n\n' +
        'Nothing is saved until you click “Apply as needs review”.',
    );
    if (useStored) void runExtractionDryRun();
    else reprocessPdfInputRef.current?.click();
  }

  async function handleReprocessPdfPicked(file: File | undefined) {
    if (!file) return;
    const validation = validateBookPdfFile(file);
    if (!validation.ok) {
      setSaveError(validation.message);
      return;
    }
    await runExtractionDryRun(file);
  }

  async function runExtractionDryRun(pdfFile?: File) {
    setIsReprocessing(true);
    setSaveError(null);
    setExtractionPreview(null);

    const jobId = await createExtractionJob({
      bookId: book.id,
      importMethod: book.importMethod ?? 'upload',
      totalPages: book.pageCount,
    });

    try {
      let file = pdfFile;
      if (!file) {
        if (!book.sourcePdfPath) {
          throw new Error(
            'No original PDF is stored. Choose the PDF file to run a validation preview.',
          );
        }
        const blob = await downloadOriginalPdfBlob(book.sourcePdfPath);
        file = new File([blob], 'original.pdf', { type: 'application/pdf' });
      }

      const preview = await runExtractionPreview(book, file, (stage, _message, detail) => {
        if (!jobId) return;
        void updateExtractionJob(jobId, {
          stage,
          progress: Math.round(detail?.percent ?? 0),
          completedPages: detail?.page,
          totalPages: detail?.totalPages ?? book.pageCount,
        });
      });

      // Dry-run only — do not mutate live book / content.json / publish status
      setExtractionPreview(preview);

      try {
        sessionStorage.setItem(
          `idl-preview-${book.id}`,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            previous: preview.previousSnapshot,
            proposed: preview.proposedSnapshot,
            summary: preview.summary,
            warnings: preview.pipelineWarnings,
            pageCount: preview.totalPages,
            ocrPageCount: preview.ocrPageCount,
          }),
        );
      } catch {
        /* ignore quota */
      }

      if (jobId) {
        await updateExtractionJob(jobId, {
          status: 'completed',
          stage: 'preview',
          progress: 100,
          warnings: preview.pipelineWarnings,
          completed: true,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Extraction preview failed';
      setSaveError(msg);
      if (jobId) {
        await updateExtractionJob(jobId, {
          status: 'failed',
          errorMessage: msg,
          completed: true,
        });
      }
    } finally {
      setIsReprocessing(false);
    }
  }

  async function applyExtractionPreview() {
    if (!extractionPreview) return;
    if (extractionPreview.worseThanExisting) {
      setSaveError('Apply blocked: new extraction is too thin compared with existing content.');
      return;
    }
    const ok = window.confirm(
      'Apply this extraction as Needs Review?\n\n' +
        '• Previous content.json will be backed up in Storage when possible\n' +
        '• Original PDF will be retained in book-pdfs\n' +
        '• Book status becomes needs_review (not published)\n' +
        '• Same book ID is kept\n\n' +
        'Continue?',
    );
    if (!ok) return;

    setIsApplyingPreview(true);
    setSaveError(null);
    try {
      await backupBookContentSnapshot(book.id);

      let sourcePdfPath = book.sourcePdfPath;
      try {
        sourcePdfPath = await uploadOriginalPdf(
          book.id,
          extractionPreview.pdfFile,
          extractionPreview.pdfFileName,
        );
      } catch (err) {
        console.warn('[AdminReview] PDF retain on apply:', err);
      }

      // Preserve manually corrected metadata — never overwrite with extract blindly
      const titleLooksAutoBad = /©|copyright|association for multi/i.test(book.title || '');
      const next: BookWithStructure = {
        ...extractionPreview.proposed,
        id: book.id,
        status: 'needs_review',
        title: !titleLooksAutoBad && book.title.trim() ? book.title : extractionPreview.proposed.title || book.title,
        subtitle: book.subtitle ?? extractionPreview.proposed.subtitle,
        englishTitle: book.englishTitle ?? extractionPreview.proposed.englishTitle,
        originalArabicTitle:
          book.originalArabicTitle ?? extractionPreview.proposed.originalArabicTitle,
        authorName: book.authorName || extractionPreview.proposed.authorName,
        translator: book.translator ?? extractionPreview.proposed.translator,
        publisher: book.publisher ?? extractionPreview.proposed.publisher,
        publicationYear: book.publicationYear ?? extractionPreview.proposed.publicationYear,
        isbn: book.isbn ?? extractionPreview.proposed.isbn,
        description: book.description || extractionPreview.proposed.description,
        language: book.language || extractionPreview.proposed.language,
        licenceNote: book.licenceNote,
        categories: book.categories.length ? book.categories : extractionPreview.proposed.categories,
        coverUrl: book.coverUrl ?? extractionPreview.proposed.coverUrl,
        coverColor: book.coverColor || extractionPreview.proposed.coverColor,
        attachments: book.attachments,
        presentationFormat: book.presentationFormat,
        sourcePdfPath: sourcePdfPath ?? book.sourcePdfPath,
        importMethod: book.importMethod ?? 'upload',
        importedAt: book.importedAt ?? new Date().toISOString(),
      };

      if (isSupabaseConfigured()) {
        await upsertBookToSupabase(next, 'needs_review', {
          originalPdfFile: extractionPreview.pdfFile,
          originalPdfFileName: extractionPreview.pdfFileName,
        });
        await refreshSupabasePublishedCache().catch(() => {});
      }

      try {
        sessionStorage.setItem(
          `idl-backup-${book.id}`,
          JSON.stringify({
            savedAt: new Date().toISOString(),
            snapshot: extractionPreview.previousSnapshot,
          }),
        );
        if (next.extractionInfo) {
          sessionStorage.setItem(`idl-extract-${next.id}`, JSON.stringify(next.extractionInfo));
        }
      } catch {
        /* ignore */
      }

      setBook(next);
      setIsDirty(false);
      setPdfImported(true);
      setExtractionPreview(null);
      notifyBooksChanged();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to apply extraction');
    } finally {
      setIsApplyingPreview(false);
    }
  }

  function handlePreview() {
    const publicBook = reviewBookToPublicBook(book);
    addBook(publicBook);
    window.dispatchEvent(new Event('storage'));
    window.open(`/books/${publicBook.slug}`, '_blank');
  }

  function handleSectionClick(id: string) {
    setActiveSectionId(id);
    const el = document.getElementById(`review-${id}`);
    if (el) {
      const offset = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }

  if (isLoading) {
    return (
      <AdminShell pageTitle={isNewBook ? 'Add Book' : 'Edit Book'}>
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E5E1D8] border-t-[#C9A646]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle={isNewBook ? 'Add Book' : 'Edit Book'}>
      <div className="-mx-4 -mt-6 sm:-mx-6 sm:-mt-8 mb-6">
        <BookReviewHeader
          title={book.title}
          status={book.status}
          isDirty={isDirty}
          isNewBook={isNewBook}
          isSaving={isSaving}
          canReprocess={!isNewBook}
          isReprocessing={isReprocessing}
          onSaveDraft={handleSaveDraft}
          onApprove={handleApprove}
          onUnpublish={handleUnpublish}
          onPreview={handlePreview}
          onReprocess={handleReprocessClick}
        />
        <input
          ref={reprocessPdfInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            void handleReprocessPdfPicked(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      {supabaseStatus && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 ${
            supabaseStatus.ok
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-amber-200 bg-amber-50'
          }`}
        >
          <p className={`text-[13px] ${supabaseStatus.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
            {supabaseStatus.ok ? '✓' : '⚠'} {supabaseStatus.message}
            {supabaseStatus.ok && ' — books save to your Supabase project'}
          </p>
        </div>
      )}

      {saveError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-[13px] text-red-700">Save failed: {saveError}</p>
        </div>
      )}

      {pdfImported && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[13px] text-emerald-700">
            ✓ PDF imported — review the extracted content below, then save draft (not auto-published).
          </p>
        </div>
      )}

      {extractionPreview && (
        <div className="mb-4">
          <ExtractionPreviewPanel
            preview={extractionPreview}
            busy={isApplyingPreview}
            onDiscard={() => setExtractionPreview(null)}
            onApplyDraft={() => void applyExtractionPreview()}
          />
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 min-w-0 space-y-5">
          {isNewBook && <BookDocumentUpload onImported={handlePdfImported} />}

          <div id="review-metadata">
            <BookReviewMetadata book={book} onChange={patch} isNewBook={isNewBook} />
          </div>
          <BookReviewExtraction book={book} />
          <BookMediaManager book={book} onChange={patch} />
          <BookReviewContent
            book={book}
            activeSectionId={activeSectionId}
            onChange={patch}
            isNewBook={isNewBook}
          />
        </div>

        <aside className="w-full lg:w-72 lg:shrink-0">
          <div className="lg:sticky lg:top-[120px]">
            <BookReviewStructure
              book={book}
              activeSectionId={activeSectionId}
              onSectionClick={handleSectionClick}
            />
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}

