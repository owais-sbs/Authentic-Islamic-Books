import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Copy,
  FileAudio,
  FileText,
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
import { PageContentView } from '@/components/reader/PageContentView';
import {
  MANUAL_BLOCK_OPTIONS,
  snippetForBlock,
  type ManualBlockKind,
} from '@/features/books/manual/blockSnippets';
import type {
  BookAttachment,
  BookChapter,
  BookSection,
  BookWithStructure,
} from '@/features/books/types';
import {
  createEmptyBook,
  htmlToContentBlocks,
  publicBookToReviewBook,
  reviewBookToPublicBook,
} from '@/lib/bookTransform';
import {
  fetchBookById,
  getAttachmentSignedUrl,
  refreshSupabasePublishedCache,
  uploadBookAttachment,
  uploadBookContentImage,
  upsertBookToSupabase,
} from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useBookStore } from '@/hooks/useBookStore';
import { notifyBooksChanged } from '@/hooks/useAdminBooks';
import { showBookSavedSuccess } from '@/lib/swal';
import { DEFAULT_PRESENTATION_FORMAT } from '@/lib/readingFormatsCatalog';
import { cn } from '@/lib/utils';

const AUTOSAVE_KEY = (id: string) => `idl-manual-draft-${id}`;

type WorkspaceTab = 'workspace' | 'info';

/** Assign sequential page numbers so the public reader keeps one section = one page. */
function withPageNumbers(chapters: BookChapter[]): BookChapter[] {
  let page = 1;
  return chapters.map((ch, ci) => ({
    ...ch,
    number: String(ci + 1),
    order: ci,
    sections: ch.sections.map((sec, si) => {
      const n = page++;
      return {
        ...sec,
        number: String(si + 1),
        order: si,
        title: sec.title?.startsWith('Page ') || !sec.title.trim() ? `Page ${n}` : sec.title,
        pdfPageStart: n,
        pdfPageEnd: n,
      };
    }),
  }));
}

function countPages(chapters: BookChapter[]): number {
  return chapters.reduce((n, ch) => n + ch.sections.length, 0);
}

function pageIsComplete(sec: BookSection): boolean {
  const text = (sec.content || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  return text.length > 0;
}

export function AdminManualBookPage() {
  const { bookId } = useParams<{ bookId?: string }>();
  const navigate = useNavigate();
  const { getById, addBook } = useBookStore();
  const insertHtmlRef = useRef<((html: string) => void) | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [rightPanel, setRightPanel] = useState<'blocks' | 'preview'>('blocks');
  const [book, setBook] = useState<BookWithStructure>(() => {
    if (bookId) {
      const existing = getById(bookId);
      if (existing) {
        const review = publicBookToReviewBook(existing, 'draft');
        return {
          ...review,
          creationMethod: 'manual',
          presentationFormat: review.presentationFormat ?? 'combined-edition',
          chapters: withPageNumbers(review.chapters),
        };
      }
    }
    try {
      const raw = sessionStorage.getItem('idl-manual-draft-active');
      if (raw) {
        const parsed = JSON.parse(raw) as BookWithStructure;
        if (parsed?.id && Array.isArray(parsed.chapters)) {
          return {
            ...parsed,
            creationMethod: 'manual',
            chapters: withPageNumbers(parsed.chapters),
          };
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
  const [tab, setTab] = useState<WorkspaceTab>('workspace');
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(bookId && isSupabaseConfigured()));
  const [uploadingKind, setUploadingKind] = useState<'image' | 'audio' | 'pdf' | null>(null);
  const [autosaveNote, setAutosaveNote] = useState('');
  const [attachmentAlign, setAttachmentAlign] = useState<'left' | 'center' | 'right'>('center');
    if (!bookId || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    fetchBookById(bookId)
      .then((remote) => {
        if (cancelled || !remote) return;
        const next = {
          ...remote,
          creationMethod: remote.creationMethod ?? 'manual',
          presentationFormat: remote.presentationFormat ?? DEFAULT_PRESENTATION_FORMAT,
          chapters: withPageNumbers(remote.chapters),
        };
        setBook(next);
        setActiveChapterId(next.chapters[0]?.id ?? '');
        setActiveSectionId(next.chapters[0]?.sections[0]?.id ?? '');
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

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const activeChapter = useMemo(
    () => book.chapters.find((c) => c.id === activeChapterId) ?? book.chapters[0],
    [book.chapters, activeChapterId],
  );
  const activeSection = useMemo(() => {
    const ch = activeChapter;
    if (!ch) return undefined;
    return ch.sections.find((s) => s.id === activeSectionId) ?? ch.sections[0];
  }, [activeChapter, activeSectionId]);

  const previewBlocks = useMemo(
    () => htmlToContentBlocks(activeSection?.content ?? ''),
    [activeSection?.content],
  );

  const globalPageNumber = useMemo(() => {
    let n = 0;
    for (const ch of book.chapters) {
      for (const sec of ch.sections) {
        n += 1;
        if (sec.id === activeSection?.id) return n;
      }
    }
    return n;
  }, [book.chapters, activeSection?.id]);

  const patch = useCallback((update: Partial<BookWithStructure>) => {
    setBook((prev) => ({ ...prev, ...update }));
    setIsDirty(true);
    setSaveError(null);
  }, []);

  const patchChapters = useCallback(
    (chapters: BookChapter[]) => {
      const numbered = withPageNumbers(chapters);
      patch({ chapters: numbered, pageCount: countPages(numbered) });
    },
    [patch],
  );

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
    }, 4000);
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

  function renameSection(chapterId: string, sectionId: string, title: string) {
    patchChapters(
      book.chapters.map((ch) =>
        ch.id !== chapterId
          ? ch
          : {
              ...ch,
              sections: ch.sections.map((s) =>
                s.id === sectionId ? { ...s, title } : s,
              ),
            },
      ),
    );
  }

  function addChapter() {
    const chapterId = crypto.randomUUID();
    const sectionId = crypto.randomUUID();
    const chapter: BookChapter = {
      id: chapterId,
      bookId: book.id,
      number: String(book.chapters.length + 1),
      title: `Chapter ${book.chapters.length + 1}`,
      description: '',
      order: book.chapters.length,
      sections: [
        {
          id: sectionId,
          chapterId,
          number: '1',
          title: 'Page',
          content: '',
          order: 0,
        },
      ],
    };
    patchChapters([...book.chapters, chapter]);
    setActiveChapterId(chapterId);
    setActiveSectionId(sectionId);
  }

  function renameChapter(id: string, title: string) {
    patchChapters(book.chapters.map((ch) => (ch.id === id ? { ...ch, title } : ch)));
  }

  function deleteChapter(id: string) {
    if (book.chapters.length <= 1) {
      setSaveError('Keep at least one chapter.');
      return;
    }
    if (!window.confirm('Delete this chapter and all of its pages?')) return;
    const next = book.chapters.filter((ch) => ch.id !== id);
    patchChapters(next);
    setActiveChapterId(next[0].id);
    setActiveSectionId(next[0].sections[0]?.id ?? '');
  }

  function moveChapter(id: string, dir: -1 | 1) {
    const idx = book.chapters.findIndex((c) => c.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= book.chapters.length) return;
    const next = [...book.chapters];
    [next[idx], next[j]] = [next[j], next[idx]];
    patchChapters(next);
  }

  function addPage(chapterId?: string, titleHint?: string) {
    const chId = chapterId ?? activeChapter?.id;
    if (!chId) return;
    const chapter = book.chapters.find((c) => c.id === chId);
    if (!chapter) return;
    const section: BookSection = {
      id: crypto.randomUUID(),
      chapterId: chId,
      number: String(chapter.sections.length + 1),
      title: titleHint || 'Page',
      content: '',
      order: chapter.sections.length,
    };
    patchChapters(
      book.chapters.map((ch) =>
        ch.id === chId ? { ...ch, sections: [...ch.sections, section] } : ch,
      ),
    );
    setActiveChapterId(chId);
    setActiveSectionId(section.id);
  }

  function duplicatePage(chapterId: string, sectionId: string) {
    const chapter = book.chapters.find((c) => c.id === chapterId);
    const section = chapter?.sections.find((s) => s.id === sectionId);
    if (!chapter || !section) return;
    const copy: BookSection = {
      ...section,
      id: crypto.randomUUID(),
      title: `${section.title || 'Page'} (copy)`,
      order: chapter.sections.length,
    };
    const idx = chapter.sections.findIndex((s) => s.id === sectionId);
    const sections = [...chapter.sections];
    sections.splice(idx + 1, 0, copy);
    patchChapters(
      book.chapters.map((ch) => (ch.id === chapterId ? { ...ch, sections } : ch)),
    );
    setActiveSectionId(copy.id);
  }

  function deletePage(chapterId: string, sectionId: string) {
    const chapter = book.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    if (chapter.sections.length <= 1) {
      setSaveError('Keep at least one page in each chapter.');
      return;
    }
    if (!window.confirm('Delete this page?')) return;
    const sections = chapter.sections.filter((s) => s.id !== sectionId);
    patchChapters(
      book.chapters.map((ch) => (ch.id === chapterId ? { ...ch, sections } : ch)),
    );
    if (activeSectionId === sectionId) {
      setActiveSectionId(sections[0]?.id ?? '');
    }
  }

  function movePage(chapterId: string, sectionId: string, dir: -1 | 1) {
    const chapter = book.chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    const idx = chapter.sections.findIndex((s) => s.id === sectionId);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= chapter.sections.length) return;
    const sections = [...chapter.sections];
    [sections[idx], sections[j]] = [sections[j], sections[idx]];
    patchChapters(
      book.chapters.map((ch) => (ch.id === chapterId ? { ...ch, sections } : ch)),
    );
  }

  function movePageToChapter(sectionId: string, fromChapterId: string, toChapterId: string) {
    if (fromChapterId === toChapterId) return;
    const from = book.chapters.find((c) => c.id === fromChapterId);
    const to = book.chapters.find((c) => c.id === toChapterId);
    const section = from?.sections.find((s) => s.id === sectionId);
    if (!from || !to || !section) return;
    if (from.sections.length <= 1) {
      setSaveError('Keep at least one page in each chapter.');
      return;
    }
    const moved: BookSection = { ...section, chapterId: toChapterId };
    patchChapters(
      book.chapters.map((ch) => {
        if (ch.id === fromChapterId) {
          return { ...ch, sections: ch.sections.filter((s) => s.id !== sectionId) };
        }
        if (ch.id === toChapterId) {
          return { ...ch, sections: [...ch.sections, moved] };
        }
        return ch;
      }),
    );
    setActiveChapterId(toChapterId);
    setActiveSectionId(sectionId);
  }

  function insertBlock(kind: ManualBlockKind) {
    if (kind === 'image') {
      imageInputRef.current?.click();
      return;
    }
    if (kind === 'audio') {
      audioInputRef.current?.click();
      return;
    }
    if (kind === 'pdf') {
      pdfInputRef.current?.click();
      return;
    }
    insertHtmlRef.current?.(snippetForBlock(kind));
  }

  async function handleImageFile(file: File) {
    setUploadingKind('image');
    setSaveError(null);
    try {
      if (isSupabaseConfigured()) {
        const uploaded = await uploadBookContentImage(book.id, file, file.name);
        insertHtmlRef.current?.(snippetForBlock('image', uploaded.publicUrl));
        const attachment: BookAttachment = {
          id: crypto.randomUUID(),
          kind: 'image',
          storagePath: uploaded.path,
          bucket: 'book-images',
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          chapterId: activeChapter?.id,
          sectionId: activeSection?.id,
          createdAt: new Date().toISOString(),
        };
        patch({ attachments: [...(book.attachments ?? []), attachment] });
      } else {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Could not read image'));
          reader.readAsDataURL(file);
        });
        insertHtmlRef.current?.(snippetForBlock('image', dataUrl));
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Image upload failed');
    } finally {
      setUploadingKind(null);
    }
  }

  async function handleAttachmentFile(file: File, kind: 'audio' | 'pdf') {
    setUploadingKind(kind);
    setSaveError(null);
    try {
      if (!isSupabaseConfigured()) {
        setSaveError('Configure Supabase to upload audio and PDF attachments.');
        return;
      }
      const attachment = await uploadBookAttachment(book.id, file, {
        kind,
        chapterId: activeChapter?.id,
        sectionId: activeSection?.id,
        pdfPage: activeSection?.pdfPageStart,
      });
      const signed = await getAttachmentSignedUrl(attachment.bucket, attachment.storagePath).catch(
        () => undefined,
      );
      insertHtmlRef.current?.(
        snippetForBlock(kind, undefined, 'center', 'large', {
          url: signed,
          fileName: attachment.fileName,
          storagePath: attachment.storagePath,
          bucket: attachment.bucket,
          caption: attachment.caption,
          pdfPage: attachment.pdfPage,
          attachmentId: attachment.id,
          align: attachmentAlign,
        }),
      );
      patch({ attachments: [...(book.attachments ?? []), attachment] });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : `${kind.toUpperCase()} upload failed`);
    } finally {
      setUploadingKind(null);
    }
  }

  async function persistBook(status: 'draft' | 'published') {
    if (!book.title.trim()) {
      setSaveError('Please enter a book title before saving.');
      setTab('info');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const today = new Date().toISOString().slice(0, 10);
    const chapters = withPageNumbers(book.chapters);
    const bookWithStatus: BookWithStructure = {
      ...book,
      chapters,
      pageCount: countPages(chapters),
      status,
      creationMethod: 'manual',
      importMethod: 'manual',
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
      if (action === 'add-another') navigate('/admin/books/manual');
      else navigate('/admin/books');
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save book');
    } finally {
      setIsSaving(false);
    }
  }

  function handlePreview() {
    const chapters = withPageNumbers(book.chapters);
    const publicBook = reviewBookToPublicBook({
      ...book,
      chapters,
      pageCount: countPages(chapters),
      presentationFormat: book.presentationFormat ?? DEFAULT_PRESENTATION_FORMAT,
    });
    addBook(publicBook);
    window.dispatchEvent(new Event('storage'));
    window.open(`/books/${publicBook.slug}/read/${globalPageNumber || 1}`, '_blank');
  }

  if (isLoading) {
    return (
      <AdminShell pageTitle="Manual Book Creation">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#1B4F72]" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle="Manual Book Creation">
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
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleAttachmentFile(f, 'audio');
          e.target.value = '';
        }}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleAttachmentFile(f, 'pdf');
          e.target.value = '';
        }}
      />

      {/* Top Action Header Bar */}
      <div className="-mx-4 -mt-6 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:-mx-6 sm:-mt-8 sm:px-6 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1B4F72] transition-colors"
          >
            <ArrowLeft size={14} /> Books
          </Link>
          <span className="h-4 w-px bg-slate-200" />
          <h1 className="min-w-0 truncate text-sm sm:text-base font-bold text-ink-900">
            {book.title.trim() || 'Untitled Manual Book'}
            {isDirty && <span className="ml-2 text-xs font-medium text-blue-500">· Unsaved</span>}
          </h1>
          {autosaveNote && (
            <span className="hidden text-[11px] text-[#64748B] lg:inline">{autosaveNote}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setTab(tab === 'info' ? 'workspace' : 'info')}
            className={cn(
              'rounded-xl border px-3 py-2 text-xs font-semibold transition-all',
              tab === 'info'
                ? 'border-[#1B4F72] bg-blue-50 text-[#1B4F72]'
                : 'border-slate-200 text-ink-900 hover:bg-slate-50',
            )}
          >
            {tab === 'info' ? 'Back to Editor' : 'Book Info & Cover'}
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-900 hover:bg-slate-50 transition-all"
          >
            <Eye size={14} /> Full Reader Preview
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void persistBook('draft')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-900 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void persistBook('published')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1B4F72] hover:bg-[#154060] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Upload size={14} /> Publish Book
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {saveError}
        </div>
      )}

      {tab === 'info' ? (
        <div className="mb-4 space-y-4 w-full">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm glossy-card">
            <h2 className="text-base font-bold text-ink-900">Book Metadata & Presentation</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Define author, category, publication era, Arabic title, and cover artwork.
            </p>
            <div className="mt-5">
              <BookReviewMetadata book={book} onChange={patch} isNewBook={!bookId} />
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setTab('workspace')}
                className="rounded-xl bg-[#1B4F72] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#154060] transition-colors"
              >
                Continue to Chapter Editor →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Professional 3-Panel Layout: Structure (Left) | Document Editor (Center) | Blocks & Preview (Right) */
        <div className="flex flex-col lg:flex-row gap-4 items-start w-full">
          {/* 1. LEFT PANEL: Book Structure Tree + Content Blocks */}
          <aside className="w-full lg:w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm glossy-card flex flex-col max-h-[calc(100vh-8.5rem)] overflow-hidden">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Structure</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {book.chapters.length} chapters · {countPages(book.chapters)} pages
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={addChapter}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 text-[#1B4F72] hover:bg-blue-100/70 px-2 py-1 text-[11px] font-semibold transition-colors"
                >
                  <Plus size={12} /> Ch.
                </button>
                <button
                  type="button"
                  onClick={() => addPage()}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#1B4F72] text-white hover:bg-[#154060] px-2 py-1 text-[11px] font-semibold transition-colors"
                >
                  <Plus size={12} /> Page
                </button>
              </div>
            </div>

            {/* Chapter / Section scrollable tree */}
            <div className="overflow-y-auto py-2.5 space-y-2 pr-1 flex-1 min-h-0">
              {book.chapters.map((ch, idx) => {
                const isCollapsed = collapsedChapters[ch.id] === true;
                const isChActive = ch.id === activeChapter?.id;
                return (
                  <div key={ch.id} className="rounded-xl border border-slate-200/90 overflow-hidden bg-slate-50/50">
                    <div
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-2 transition-colors',
                        isChActive ? 'bg-blue-50/80 text-[#1B4F72]' : 'bg-slate-100/60 text-ink-900',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setCollapsedChapters((prev) => ({
                            ...prev,
                            [ch.id]: !prev[ch.id],
                          }))
                        }
                        className="rounded p-0.5 text-[#64748B] hover:bg-white"
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                      >
                        {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                      </button>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9.5px] font-bold uppercase tracking-wider text-[#64748B]">
                          Ch. {ch.number}
                        </span>
                        <input
                          value={ch.title}
                          onChange={(e) => renameChapter(ch.id, e.target.value)}
                          className="w-full bg-transparent text-xs font-semibold text-ink-900 outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveChapter(ch.id, -1)}
                          className="rounded p-0.5 text-[#64748B] hover:bg-white disabled:opacity-30"
                        >
                          <ChevronUp size={11} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === book.chapters.length - 1}
                          onClick={() => moveChapter(ch.id, 1)}
                          className="rounded p-0.5 text-[#64748B] hover:bg-white disabled:opacity-30"
                        >
                          <ChevronDown size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteChapter(ch.id)}
                          className="rounded p-0.5 text-[#64748B] hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {!isCollapsed && (
                      <ul className="space-y-0.5 p-1.5 bg-white">
                        {ch.sections.map((sec, sIdx) => {
                          let pageNo = 0;
                          for (const c of book.chapters) {
                            for (const s of c.sections) {
                              pageNo += 1;
                              if (s.id === sec.id) break;
                            }
                            if (c.sections.some((s) => s.id === sec.id)) break;
                          }
                          const complete = pageIsComplete(sec);
                          const isSecActive = sec.id === activeSection?.id;

                          return (
                            <li key={sec.id}>
                              <div
                                className={cn(
                                  'rounded-lg px-2 py-1.5 transition-all',
                                  isSecActive
                                    ? 'bg-[#1B4F72] text-white shadow-sm'
                                    : 'hover:bg-slate-100 text-ink-800',
                                )}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveChapterId(ch.id);
                                    setActiveSectionId(sec.id);
                                  }}
                                  className="flex w-full items-center gap-2 text-left"
                                >
                                  <span
                                    className={cn(
                                      'h-1.5 w-1.5 shrink-0 rounded-full',
                                      isSecActive ? 'bg-white' : complete ? 'bg-emerald-500' : 'bg-slate-300',
                                    )}
                                  />
                                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                    <span className={isSecActive ? 'text-blue-100' : 'text-[#64748B]'}>
                                      p.{pageNo}
                                    </span>{' '}
                                    {sec.title || `Page ${pageNo}`}
                                  </span>
                                </button>

                                {isSecActive && (
                                  <div className="mt-1 flex items-center justify-between pt-1 border-t border-white/20 text-white/90">
                                    <div className="flex items-center gap-0.5">
                                      <button
                                        type="button"
                                        disabled={sIdx === 0}
                                        onClick={() => movePage(ch.id, sec.id, -1)}
                                        className="rounded p-0.5 hover:bg-white/20 disabled:opacity-30"
                                      >
                                        <ChevronUp size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={sIdx === ch.sections.length - 1}
                                        onClick={() => movePage(ch.id, sec.id, 1)}
                                        className="rounded p-0.5 hover:bg-white/20 disabled:opacity-30"
                                      >
                                        <ChevronDown size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => duplicatePage(ch.id, sec.id)}
                                        className="rounded p-0.5 hover:bg-white/20"
                                        title="Duplicate"
                                      >
                                        <Copy size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deletePage(ch.id, sec.id)}
                                        className="rounded p-0.5 hover:bg-red-500 hover:text-white"
                                        title="Delete"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                        <li>
                          <button
                            type="button"
                            onClick={() => addPage(ch.id)}
                            className="w-full rounded-md px-2 py-1 text-left text-[11px] font-semibold text-[#1B4F72] hover:bg-blue-50 transition-colors"
                          >
                            + Add page to chapter
                          </button>
                        </li>
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Content Blocks palette — in sidebar below structure */}
            <div className="border-t border-slate-100 pt-3 flex-shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-2">
                Insert Content Block
              </p>
              <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-0.5">
                {MANUAL_BLOCK_OPTIONS.map((opt) => (
                  <button
                    key={opt.kind}
                    type="button"
                    disabled={Boolean(uploadingKind)}
                    onClick={() => insertBlock(opt.kind)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-left text-xs font-semibold text-ink-900 transition-all hover:border-[#1B4F72] hover:bg-white hover:shadow-sm disabled:opacity-50"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#1B4F72]">
                      {opt.kind === 'image' ? (
                        <ImagePlus size={12} />
                      ) : opt.kind === 'audio' ? (
                        <FileAudio size={12} />
                      ) : opt.kind === 'pdf' ? (
                        <FileText size={12} />
                      ) : (
                        <Plus size={12} />
                      )}
                    </span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
              {uploadingKind && (
                <div className="mt-2 flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 p-2 text-xs text-[#1B4F72]">
                  <Loader2 size={13} className="animate-spin" /> Uploading {uploadingKind}…
                </div>
              )}
              {/* Alignment option for audio / PDF blocks */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Audio/PDF align:
                </span>
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAttachmentAlign(a)}
                    className={cn(
                      'rounded px-2 py-0.5 text-[11px] font-semibold capitalize transition-colors',
                      attachmentAlign === a
                        ? 'bg-[#104C3B] text-white'
                        : 'bg-slate-100 text-[#64748B] hover:bg-slate-200',
                    )}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* 2. CENTER PANEL: Page Content Editor */}
          <main className="flex-1 min-w-0 flex flex-col gap-3">
            {/* Page Header */}
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm glossy-card flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                  {activeChapter?.title || 'Chapter'} · Page {globalPageNumber}
                </span>
                <input
                  value={activeSection?.title ?? ''}
                  onChange={(e) => {
                    if (!activeChapter || !activeSection) return;
                    renameSection(activeChapter.id, activeSection.id, e.target.value);
                  }}
                  placeholder="Page title (e.g., The Opening Creed)"
                  className="w-full text-base font-bold text-ink-900 bg-transparent outline-none placeholder-slate-400 mt-0.5"
                />
              </div>

              {/* Mobile/Tablet button palette toggle */}
              <div className="flex lg:hidden items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRightPanel('blocks')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold',
                    rightPanel === 'blocks' ? 'bg-[#1B4F72] text-white' : 'bg-slate-100 text-ink-800',
                  )}
                >
                  Blocks
                </button>
                <button
                  type="button"
                  onClick={() => setRightPanel('preview')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold',
                    rightPanel === 'preview' ? 'bg-[#1B4F72] text-white' : 'bg-slate-100 text-ink-800',
                  )}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Rich Editor */}
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm glossy-card overflow-hidden">
              <RichTextEditor
                key={activeSection?.id ?? 'empty'}
                bookId={book.id}
                value={activeSection?.content ?? ''}
                onChange={updateSectionContent}
                insertHtmlRef={insertHtmlRef}
                minHeight="480px"
              />
            </div>
          </main>

          {/* 3. RIGHT PANEL: Live Reader Preview */}
          <aside className="w-full lg:w-80 shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm glossy-card overflow-hidden flex flex-col max-h-[calc(100vh-8.5rem)]">
            {/* Preview Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Live Preview</p>
              <span className="text-[10px] text-[#64748B]">Page {globalPageNumber}</span>
            </div>

            {/* Reader Preview — full scrollable */}
            <div className="flex-1 overflow-y-auto bg-slate-50/60">
              <div className="p-4">
                {previewBlocks.length === 0 ? (
                  <p className="text-center text-xs text-[#64748B] py-16 italic">
                    Write content in the editor to see the reader preview.
                  </p>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <PageContentView
                      blocks={previewBlocks}
                      fontSize={14}
                      lineHeight={1.75}
                      preferParallel
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Attachments footer */}
            {(book.attachments?.length ?? 0) > 0 && (
              <div className="border-t border-slate-100 p-3 shrink-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
                  Attachments ({book.attachments?.length ?? 0})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {book.attachments?.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs"
                    >
                      <span className="flex items-center gap-1.5 truncate text-ink-900 font-medium">
                        {att.kind === 'audio' ? (
                          <FileAudio size={12} className="text-[#1B4F72] shrink-0" />
                        ) : (
                          <FileText size={12} className="text-[#1B4F72] shrink-0" />
                        )}
                        <span className="truncate">{att.fileName}</span>
                      </span>
                      <span className="text-[10px] text-[#64748B] shrink-0 uppercase font-semibold">
                        {att.kind}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
