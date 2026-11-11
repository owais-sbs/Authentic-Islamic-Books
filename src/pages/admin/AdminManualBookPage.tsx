import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  Eye,
  Upload,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { RichTextEditor } from '@/features/books/components/RichTextEditor';
import { BookReviewMetadata } from '@/features/books/components/BookReviewMetadata';
import {
  MANUAL_BLOCK_OPTIONS,
  snippetForBlock,
  type ManualBlockKind,
} from '@/features/books/manual/blockSnippets';
import type { BookChapter, BookSection, BookWithStructure, PresentationFormatId } from '@/features/books/types';
import {
  createEmptyBook,
  publicBookToReviewBook,
  reviewBookToPublicBook,
} from '@/lib/bookTransform';
import {
  fetchBookById,
  refreshSupabasePublishedCache,
  uploadBookContentImage,
  upsertBookToSupabase,
} from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useBookStore } from '@/hooks/useBookStore';
import { notifyBooksChanged } from '@/hooks/useAdminBooks';
import { showBookSavedSuccess } from '@/lib/swal';
import {
  DEFAULT_PRESENTATION_FORMAT,
  PRESENTATION_FORMATS,
} from '@/lib/readingFormatsCatalog';
import { cn } from '@/lib/utils';

const AUTOSAVE_KEY = (id: string) => `idl-manual-draft-${id}`;

export function AdminManualBookPage() {
  const { bookId } = useParams<{ bookId?: string }>();
  const navigate = useNavigate();
  const { getById, addBook } = useBookStore();
  const insertHtmlRef = useRef<((html: string) => void) | null>(null);

  const [book, setBook] = useState<BookWithStructure>(() => {
    if (bookId) {
      const existing = getById(bookId);
      if (existing) {
        return {
          ...publicBookToReviewBook(existing, 'draft'),
          creationMethod: 'manual',
          presentationFormat: 'combined-edition',
        };
      }
    }
    try {
      const raw = sessionStorage.getItem('idl-manual-draft-active');
      if (raw) {
        const parsed = JSON.parse(raw) as BookWithStructure;
        if (parsed?.id && Array.isArray(parsed.chapters)) {
          return { ...parsed, creationMethod: 'manual' };
        }
      }
    } catch {
      /* ignore */
    }
    return createEmptyBook();
  });

  const [activeChapterId, setActiveChapterId] = useState(
    () => book.chapters[0]?.id ?? '',
  );
  const [activeSectionId, setActiveSectionId] = useState(
    () => book.chapters[0]?.sections[0]?.id ?? '',
  );
  const [panel, setPanel] = useState<'info' | 'format' | 'blocks'>('info');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(bookId && isSupabaseConfigured()));
  const [uploadingImage, setUploadingImage] = useState(false);
  const [autosaveNote, setAutosaveNote] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Load remote book when editing
  useEffect(() => {
    if (!bookId || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchBookById(bookId)
      .then((remote) => {
        if (cancelled || !remote) return;
        setBook({
          ...remote,
          creationMethod: remote.creationMethod ?? 'manual',
          presentationFormat: remote.presentationFormat ?? DEFAULT_PRESENTATION_FORMAT,
        });
        setActiveChapterId(remote.chapters[0]?.id ?? '');
        setActiveSectionId(remote.chapters[0]?.sections[0]?.id ?? '');
        setIsDirty(false);
      })
      .catch((err) => {
        if (!cancelled) setSaveError(err instanceof Error ? err.message : 'Failed to load book');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const activeChapter = useMemo(
    () => book.chapters.find((c) => c.id === activeChapterId) ?? book.chapters[0],
    [book.chapters, activeChapterId],
  );
  const activeSection = useMemo(() => {
    const ch = activeChapter;
    if (!ch) return undefined;
    return ch.sections.find((s) => s.id === activeSectionId) ?? ch.sections[0];
  }, [activeChapter, activeSectionId]);

  const patch = useCallback((update: Partial<BookWithStructure>) => {
    setBook((prev) => ({ ...prev, ...update }));
    setIsDirty(true);
    setSaveError(null);
  }, []);

  // Local autosave every 8s when dirty
  useEffect(() => {
    if (!isDirty) return;
    const t = window.setTimeout(() => {
      try {
        sessionStorage.setItem(AUTOSAVE_KEY(book.id), JSON.stringify(book));
        sessionStorage.setItem('idl-manual-draft-active', JSON.stringify(book));
        setAutosaveNote(`Draft autosaved ${new Date().toLocaleTimeString()}`);
      } catch {
        /* ignore quota */
      }
    }, 8000);
    return () => window.clearTimeout(t);
  }, [book, isDirty]);

  function updateSectionContent(html: string) {
    if (!activeChapter || !activeSection) return;
    const chapters = book.chapters.map((ch) => {
      if (ch.id !== activeChapter.id) return ch;
      return {
        ...ch,
        sections: ch.sections.map((s) =>
          s.id === activeSection.id ? { ...s, content: html } : s,
        ),
      };
    });
    patch({ chapters });
  }

  function addChapter() {
    const num = String(book.chapters.length + 1);
    const chapterId = crypto.randomUUID();
    const sectionId = crypto.randomUUID();
    const chapter: BookChapter = {
      id: chapterId,
      bookId: book.id,
      number: num,
      title: `Chapter ${num}`,
      description: '',
      order: book.chapters.length,
      sections: [
        {
          id: sectionId,
          chapterId,
          number: '1',
          title: 'Content',
          content: '',
          order: 0,
        },
      ],
    };
    patch({ chapters: [...book.chapters, chapter] });
    setActiveChapterId(chapterId);
    setActiveSectionId(sectionId);
  }

  function renameChapter(id: string, title: string) {
    patch({
      chapters: book.chapters.map((ch) => (ch.id === id ? { ...ch, title } : ch)),
    });
  }

  function deleteChapter(id: string) {
    if (book.chapters.length <= 1) {
      setSaveError('Keep at least one chapter.');
      return;
    }
    if (!window.confirm('Delete this chapter and its content?')) return;
    const next = book.chapters
      .filter((ch) => ch.id !== id)
      .map((ch, i) => ({ ...ch, number: String(i + 1), order: i }));
    patch({ chapters: next });
    setActiveChapterId(next[0].id);
    setActiveSectionId(next[0].sections[0]?.id ?? '');
  }

  function moveChapter(id: string, dir: -1 | 1) {
    const idx = book.chapters.findIndex((c) => c.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= book.chapters.length) return;
    const next = [...book.chapters];
    [next[idx], next[j]] = [next[j], next[idx]];
    patch({
      chapters: next.map((ch, i) => ({ ...ch, number: String(i + 1), order: i })),
    });
  }

  function addSection() {
    if (!activeChapter) return;
    const section: BookSection = {
      id: crypto.randomUUID(),
      chapterId: activeChapter.id,
      number: String(activeChapter.sections.length + 1),
      title: `Section ${activeChapter.sections.length + 1}`,
      content: '',
      order: activeChapter.sections.length,
    };
    const chapters = book.chapters.map((ch) =>
      ch.id === activeChapter.id ? { ...ch, sections: [...ch.sections, section] } : ch,
    );
    patch({ chapters });
    setActiveSectionId(section.id);
  }

  function insertBlock(kind: ManualBlockKind) {
    if (kind === 'image') {
      imageInputRef.current?.click();
      return;
    }
    insertHtmlRef.current?.(snippetForBlock(kind));
  }

  async function handleImageFile(file: File) {
    setUploadingImage(true);
    setSaveError(null);
    try {
      const url = await uploadBookContentImage(book.id, file);
      insertHtmlRef.current?.(snippetForBlock('image', url));
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  }

  async function persistBook(status: 'draft' | 'published') {
    if (!book.title.trim()) {
      setSaveError('Please enter a book title before saving.');
      setPanel('info');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const today = new Date().toISOString().slice(0, 10);
    const bookWithStatus: BookWithStructure = {
      ...book,
      status,
      creationMethod: 'manual',
      presentationFormat: book.presentationFormat ?? DEFAULT_PRESENTATION_FORMAT,
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
      setBook(bookWithStatus);
      setIsDirty(false);
      try {
        sessionStorage.removeItem(AUTOSAVE_KEY(book.id));
        sessionStorage.removeItem('idl-manual-draft-active');
      } catch {
        /* ignore */
      }
      const action = await showBookSavedSuccess(publicBook.title, status);
      if (action === 'add-another') navigate('/admin/books/new');
      else navigate('/admin/books');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setIsSaving(false);
    }
  }

  function handlePreview() {
    const publicBook = reviewBookToPublicBook({
      ...book,
      presentationFormat: book.presentationFormat ?? DEFAULT_PRESENTATION_FORMAT,
    });
    addBook(publicBook);
    window.dispatchEvent(new Event('storage'));
    window.open(`/books/${publicBook.slug}`, '_blank');
  }

  if (isLoading) {
    return (
      <AdminShell pageTitle="Manual Book Editor">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#C9A646]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle="Manual Book Editor">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleImageFile(f);
          e.target.value = '';
        }}
      />

      {/* Top toolbar */}
      <div className="-mx-4 -mt-6 mb-4 flex flex-wrap items-center gap-2 border-b border-[#E5E1D8] bg-white px-4 py-3 sm:-mx-6 sm:-mt-8 sm:px-6">
        <Link
          to="/admin/books/new"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0B1B2B]"
        >
          <ArrowLeft size={14} /> Back
        </Link>
        <span className="hidden h-4 w-px bg-[#E5E1D8] sm:block" />
        <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-[#0B1B2B]">
          {book.title.trim() || 'Untitled manual book'}
          {isDirty && <span className="ml-2 text-[11px] font-normal text-[#C9A646]">Unsaved</span>}
        </h1>
        {autosaveNote && (
          <span className="hidden text-[11px] text-[#94A3B8] lg:inline">{autosaveNote}</span>
        )}
        <button
          type="button"
          onClick={handlePreview}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] px-3 py-2 text-[12px] font-medium text-[#0B1B2B] hover:bg-[#F7F6F2]"
        >
          <Eye size={14} /> Preview
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void persistBook('draft')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] px-3 py-2 text-[12px] font-medium text-[#0B1B2B] hover:bg-[#F7F6F2] disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Draft
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void persistBook('published')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#104C3B] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#0A352A] disabled:opacity-50"
        >
          <Upload size={14} /> Publish
        </button>
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {saveError}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-[#E5E1D8] bg-[#F7F6F2] p-1 sm:w-fit">
        {(
          [
            ['info', 'Book information'],
            ['blocks', 'Content blocks'],
            ['format', 'Reader format'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPanel(id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-[12px] font-semibold',
              panel === id ? 'bg-white text-[#0B1B2B] shadow-sm' : 'text-[#64748B]',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {panel === 'info' && (
        <div className="mb-4 rounded-xl border border-[#E5E1D8] bg-white p-4">
          <BookReviewMetadata book={book} onChange={patch} isNewBook />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        {/* Left: chapters — full width above editor on mobile */}
        <aside className="order-2 space-y-3 rounded-xl border border-[#E5E1D8] bg-white p-3 lg:order-none">

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Chapters
              </p>
              <button
                type="button"
                onClick={addChapter}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#104C3B]"
              >
                <Plus size={12} /> Add
              </button>
            </div>
            <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
              {book.chapters.map((ch, idx) => (
                <li key={ch.id}>
                  <div
                    className={cn(
                      'rounded-lg border px-2 py-2',
                      ch.id === activeChapter?.id
                        ? 'border-[#C9A646] bg-[#C9A646]/10'
                        : 'border-transparent hover:bg-[#F7F6F2]',
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-start gap-1 text-left"
                      onClick={() => {
                        setActiveChapterId(ch.id);
                        setActiveSectionId(ch.sections[0]?.id ?? '');
                      }}
                    >
                      <GripVertical size={12} className="mt-1 shrink-0 text-[#CBD5E1]" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-medium text-[#94A3B8]">
                          Ch. {ch.number}
                        </span>
                        <input
                          value={ch.title}
                          onChange={(e) => renameChapter(ch.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-transparent text-[13px] font-medium text-[#0B1B2B] outline-none"
                        />
                      </span>
                    </button>
                    <div className="mt-1 flex items-center gap-1 pl-4">
                      <button
                        type="button"
                        title="Move up"
                        disabled={idx === 0}
                        onClick={() => moveChapter(ch.id, -1)}
                        className="rounded p-0.5 text-[#94A3B8] hover:bg-white disabled:opacity-30"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        disabled={idx === book.chapters.length - 1}
                        onClick={() => moveChapter(ch.id, 1)}
                        className="rounded p-0.5 text-[#94A3B8] hover:bg-white disabled:opacity-30"
                      >
                        <ChevronDown size={12} />
                      </button>
                      <button
                        type="button"
                        title="Delete chapter"
                        onClick={() => deleteChapter(ch.id)}
                        className="ml-auto rounded p-0.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    {ch.id === activeChapter?.id && (
                      <ul className="mt-2 space-y-0.5 border-t border-[#E5E1D8] pt-2">
                        {ch.sections.map((sec) => (
                          <li key={sec.id}>
                            <button
                              type="button"
                              onClick={() => setActiveSectionId(sec.id)}
                              className={cn(
                                'w-full rounded px-2 py-1 text-left text-[12px]',
                                sec.id === activeSection?.id
                                  ? 'bg-white font-semibold text-[#0B1B2B]'
                                  : 'text-[#64748B] hover:bg-white/70',
                              )}
                            >
                              {sec.title || `Section ${sec.number}`}
                            </button>
                          </li>
                        ))}
                        <li>
                          <button
                            type="button"
                            onClick={addSection}
                            className="w-full rounded px-2 py-1 text-left text-[11px] font-semibold text-[#104C3B]"
                          >
                            + Add section
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Center: editor — first on mobile for writing focus */}
        <main className="order-1 min-w-0 space-y-3 lg:order-none">
          <div className="rounded-xl border border-[#E5E1D8] bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Editing
            </p>
            <p className="mt-0.5 text-[14px] font-semibold text-[#0B1B2B]">
              {activeChapter?.title || 'Chapter'} · {activeSection?.title || 'Section'}
            </p>
            <p className="mt-1 text-[12px] text-[#64748B]">
              Paste from Word or PDF. Use Blocks to insert Arabic, quotes, images, and more.
            </p>
          </div>
          <RichTextEditor
            key={activeSection?.id ?? 'empty'}
            value={activeSection?.content ?? ''}
            onChange={updateSectionContent}
            insertHtmlRef={insertHtmlRef}
            minHeight="420px"
          />
        </main>

        {/* Right: blocks / format */}
        <aside className="order-3 space-y-3 lg:order-none">
          <div className="rounded-xl border border-[#E5E1D8] bg-white p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              Insert content block
            </p>
            <div className="grid max-h-[40vh] grid-cols-1 gap-1 overflow-y-auto">
              {MANUAL_BLOCK_OPTIONS.map((opt) => (
                <button
                  key={opt.kind}
                  type="button"
                  disabled={uploadingImage && opt.kind === 'image'}
                  onClick={() => insertBlock(opt.kind)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[12px] font-medium text-[#0B1B2B] hover:bg-[#F7F6F2] disabled:opacity-50"
                >
                  {opt.kind === 'image' ? <ImagePlus size={14} /> : <Plus size={14} />}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {(panel === 'format' || panel === 'blocks') && (
            <div className="rounded-xl border border-[#E5E1D8] bg-white p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Reader presentation
              </p>
              <p className="mb-3 text-[12px] leading-relaxed text-[#64748B]">
                Select a format. Published books use the Complete Scholarly Edition reader today;
                your choice is saved with the book.
              </p>
              <ul className="max-h-[45vh] space-y-2 overflow-y-auto">
                {PRESENTATION_FORMATS.map((fmt) => {
                  const selected =
                    (book.presentationFormat ?? DEFAULT_PRESENTATION_FORMAT) === fmt.id;
                  return (
                    <li key={fmt.id}>
                      <button
                        type="button"
                        onClick={() =>
                          patch({ presentationFormat: fmt.id as PresentationFormatId })
                        }
                        className={cn(
                          'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
                          selected
                            ? 'border-[#104C3B] bg-[#104C3B]/5'
                            : 'border-[#E5E1D8] hover:border-[#C9A646]',
                        )}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A646]">
                          Format {fmt.number}
                        </span>
                        <span className="mt-0.5 block text-[13px] font-semibold text-[#0B1B2B]">
                          {fmt.name}
                        </span>
                        <span className="mt-1 block text-[11px] text-[#64748B]">{fmt.summary}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </AdminShell>
  );
}
