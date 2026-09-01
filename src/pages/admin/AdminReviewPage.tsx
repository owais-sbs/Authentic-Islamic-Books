import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { BookReviewHeader } from '@/features/books/components/BookReviewHeader';
import { BookReviewMetadata } from '@/features/books/components/BookReviewMetadata';
import { BookReviewContent } from '@/features/books/components/BookReviewContent';
import { BookReviewStructure } from '@/features/books/components/BookReviewStructure';
import { BookDocumentUpload } from '@/features/books/components/BookDocumentUpload';
import { mockBookWithStructure, mockBooks } from '@/features/books/data/mockBooks';
import { useBookStore } from '@/hooks/useBookStore';
import {
  createEmptyBook,
  publicBookToReviewBook,
  reviewBookToPublicBook,
} from '@/lib/bookTransform';
import {
  fetchBookById,
  refreshSupabasePublishedCache,
  testSupabaseConnection,
  upsertBookToSupabase,
} from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { showBookSavedSuccess, showNewBookWelcome } from '@/lib/swal';
import { notifyBooksChanged } from '@/hooks/useAdminBooks';
import type { BookWithStructure } from '@/features/books/types';
import type { Book } from '@/types';

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

  const [book, setBook] = useState<BookWithStructure>(() =>
    loadInitialBook(bookId, getById, isNewBook)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewBook && isSupabaseConfigured());
  const [supabaseStatus, setSupabaseStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [pdfImported, setPdfImported] = useState(false);

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
          setBook(remote);
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
    setBook(imported);
    setIsDirty(true);
    setPdfImported(true);
    setSaveError(null);
  }

  async function persistBook(status: 'draft' | 'published') {
    setIsSaving(true);
    setSaveError(null);

    const today = new Date().toISOString().slice(0, 10);
    const bookWithStatus = {
      ...book,
      status,
      updatedAt: today,
      createdAt: book.createdAt || today,
    };
    const publicBook = reviewBookToPublicBook(bookWithStatus);
    publicBook.addedDate = today;

    try {
      if (isSupabaseConfigured()) {
        const result = await upsertBookToSupabase(bookWithStatus, status);
        publicBook.id = result.id;
        publicBook.slug = result.slug;
        publicBook.coverUrl = result.coverUrl ?? publicBook.coverUrl;
        await refreshSupabasePublishedCache();
      }

      addBook(publicBook);
      notifyBooksChanged();

      setIsDirty(false);

      const action = await showBookSavedSuccess(publicBook.title, status);

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
    void persistBook('published');
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
          onSaveDraft={handleSaveDraft}
          onApprove={handleApprove}
          onPreview={handlePreview}
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
            ✓ PDF imported — review the extracted content below, then save or publish.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 min-w-0 space-y-5">
          {isNewBook && <BookDocumentUpload onImported={handlePdfImported} />}

          <div id="review-metadata">
            <BookReviewMetadata book={book} onChange={patch} isNewBook={isNewBook} />
          </div>
          <div id="review-introduction">
            <BookReviewContent
              book={book}
              activeSectionId={activeSectionId}
              onChange={patch}
              isNewBook={isNewBook}
            />
          </div>
        </div>

        <aside className="w-full lg:w-64 lg:shrink-0">
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

