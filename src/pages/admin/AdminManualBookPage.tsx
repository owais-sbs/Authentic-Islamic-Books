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
          <Loader2 className="h-6 w-6 animate-spin text-[#C9A646]" />
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

      <div className="-mx-4 -mt-6 mb-4 flex flex-wrap items-center gap-2 border-b border-[#E5E1D8] bg-white px-4 py-3 sm:-mx-6 sm:-mt-8 sm:px-6">
        <Link
          to="/admin/books"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#64748B] hover:text-[#0B1B2B]"
        >
          <ArrowLeft size={14} /> Books
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
          onClick={() => setTab(tab === 'info' ? 'workspace' : 'info')}
          className={cn(
            'rounded-lg border px-3 py-2 text-[12px] font-medium',
            tab === 'info'
              ? 'border-[#104C3B] bg-[#104C3B]/5 text-[#104C3B]'
              : 'border-[#E5E1D8] text-[#0B1B2B] hover:bg-[#F7F6F2]',
          )}
        >
          Book info
        </button>
        <button
          type="button"
          onClick={handlePreview}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] px-3 py-2 text-[12px] font-medium text-[#0B1B2B] hover:bg-[#F7F6F2]"
        >
          <Eye size={14} /> Full preview
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => void persistBook('draft')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] px-3 py-2 text-[12px] font-medium text-[#0B1B2B] hover:bg-[#F7F6F2] disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save draft
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

      {tab === 'info' ? (
        <div className="mb-4 space-y-3">
          <p className="text-[13px] text-[#64748B]">
            Enter metadata and cover, then return to the workspace to build chapters and pages.
          </p>
          <BookReviewMetadata book={book} onChange={patch} isNewBook={!bookId} />
          <button
            type="button"
            onClick={() => setTab('workspace')}
            className="rounded-lg bg-[#0B1B2B] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#162A42]"
          >
            Continue to page editor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:items-start lg:[grid-template-columns:minmax(0,1fr)_minmax(0,1fr)]">
          {/* LEFT 50% — structure + editor */}
          <section className="flex min-h-0 min-w-0 flex-col gap-3 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <div className="rounded-xl border border-[#E5E1D8] bg-white p-3">
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                    Book structure
                  </p>
                  <p className="truncate text-[14px] font-semibold text-[#0B1B2B]">
                    {book.title.trim() || 'Untitled book'}
                  </p>
                  <p className="text-[11px] text-[#94A3B8]">
                    {book.chapters.length} chapter{book.chapters.length === 1 ? '' : 's'} ·{' '}
                    {countPages(book.chapters)} page{countPages(book.chapters) === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={addChapter}
                    className="inline-flex items-center gap-1 rounded-md border border-[#E5E1D8] px-2 py-1 text-[11px] font-semibold text-[#104C3B] hover:bg-[#F7F6F2]"
                  >
                    <Plus size={12} /> Chapter
                  </button>
                  <button
                    type="button"
                    onClick={() => addPage()}
                    className="inline-flex items-center gap-1 rounded-md border border-[#E5E1D8] px-2 py-1 text-[11px] font-semibold text-[#104C3B] hover:bg-[#F7F6F2]"
                  >
                    <Plus size={12} /> Page
                  </button>
                  <button
                    type="button"
                    onClick={() => addPage(undefined, 'Introduction')}
                    className="rounded-md border border-[#E5E1D8] px-2 py-1 text-[11px] font-medium text-[#64748B] hover:bg-[#F7F6F2]"
                  >
                    Intro page
                  </button>
                  <button
                    type="button"
                    onClick={() => addPage(undefined, 'Conclusion')}
                    className="rounded-md border border-[#E5E1D8] px-2 py-1 text-[11px] font-medium text-[#64748B] hover:bg-[#F7F6F2]"
                  >
                    Conclusion
                  </button>
                </div>
              </div>

              <ul className="space-y-1.5">
                {book.chapters.map((ch, idx) => {
                  const isCollapsed = collapsedChapters[ch.id] === true;
                  return (
                    <li key={ch.id} className="rounded-lg border border-[#E5E1D8]/80">
                      <div
                        className={cn(
                          'flex items-center gap-1 rounded-t-lg px-2 py-1.5',
                          ch.id === activeChapter?.id ? 'bg-[#C9A646]/10' : 'bg-[#F7F6F2]/60',
                          isCollapsed && 'rounded-b-lg',
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
                          className="rounded p-0.5 text-[#94A3B8] hover:bg-white"
                          title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                          {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <GripVertical size={12} className="shrink-0 text-[#CBD5E1]" />
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-medium text-[#94A3B8]">
                            Chapter {ch.number}
                          </span>
                          <input
                            value={ch.title}
                            onChange={(e) => renameChapter(ch.id, e.target.value)}
                            className="w-full bg-transparent text-[13px] font-medium text-[#0B1B2B] outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveChapter(ch.id, -1)}
                          className="rounded p-0.5 text-[#94A3B8] hover:bg-white disabled:opacity-30"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === book.chapters.length - 1}
                          onClick={() => moveChapter(ch.id, 1)}
                          className="rounded p-0.5 text-[#94A3B8] hover:bg-white disabled:opacity-30"
                        >
                          <ChevronDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteChapter(ch.id)}
                          className="rounded p-0.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {!isCollapsed && (
                        <ul className="space-y-0.5 p-1.5">
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
                            return (
                              <li key={sec.id}>
                                <div
                                  className={cn(
                                    'rounded-md px-1.5 py-1',
                                    sec.id === activeSection?.id
                                      ? 'bg-white ring-1 ring-[#C9A646]'
                                      : 'hover:bg-[#F7F6F2]',
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
                                        complete ? 'bg-[#104C3B]' : 'bg-[#CBD5E1]',
                                      )}
                                    />
                                    <span className="min-w-0 flex-1 truncate text-[12px] text-[#0B1B2B]">
                                      <span className="text-[#94A3B8]">p.{pageNo}</span>{' '}
                                      {sec.title || `Page ${pageNo}`}
                                    </span>
                                  </button>
                                  {sec.id === activeSection?.id && (
                                    <div className="mt-1 flex flex-wrap items-center gap-0.5 pl-3">
                                      <button
                                        type="button"
                                        disabled={sIdx === 0}
                                        onClick={() => movePage(ch.id, sec.id, -1)}
                                        className="rounded p-0.5 text-[#94A3B8] hover:bg-white disabled:opacity-30"
                                      >
                                        <ChevronUp size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={sIdx === ch.sections.length - 1}
                                        onClick={() => movePage(ch.id, sec.id, 1)}
                                        className="rounded p-0.5 text-[#94A3B8] hover:bg-white disabled:opacity-30"
                                      >
                                        <ChevronDown size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => duplicatePage(ch.id, sec.id)}
                                        className="rounded p-0.5 text-[#94A3B8] hover:bg-white"
                                      >
                                        <Copy size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deletePage(ch.id, sec.id)}
                                        className="rounded p-0.5 text-[#94A3B8] hover:bg-red-50 hover:text-red-600"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                      {book.chapters.length > 1 && (
                                        <select
                                          className="ml-auto max-w-[7rem] rounded border border-[#E5E1D8] bg-white px-1 py-0.5 text-[10px] text-[#64748B]"
                                          value={ch.id}
                                          onChange={(e) =>
                                            movePageToChapter(sec.id, ch.id, e.target.value)
                                          }
                                        >
                                          {book.chapters.map((c) => (
                                            <option key={c.id} value={c.id}>
                                              {c.title || `Ch. ${c.number}`}
                                            </option>
                                          ))}
                                        </select>
                                      )}
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
                              className="w-full rounded px-2 py-1 text-left text-[11px] font-semibold text-[#104C3B]"
                            >
                              + Add page
                            </button>
                          </li>
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="rounded-xl border border-[#E5E1D8] bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Page editor
              </p>
              <p className="mt-0.5 text-[14px] font-semibold text-[#0B1B2B]">
                {activeChapter?.title || 'Chapter'} · Page {globalPageNumber}
              </p>
              <input
                value={activeSection?.title ?? ''}
                onChange={(e) => {
                  if (!activeChapter || !activeSection) return;
                  renameSection(activeChapter.id, activeSection.id, e.target.value);
                }}
                placeholder="Page title"
                className="mt-1 w-full rounded-md border border-transparent bg-transparent px-0 py-0.5 text-[13px] text-[#64748B] outline-none hover:border-[#E5E1D8] focus:border-[#C9A646]"
              />
              <p className="mt-1 text-[11px] text-[#94A3B8]">
                Paste from PDF/Word. Use blocks for quotes and references so the reader formats them
                correctly. Enter exits a quote; Shift+Enter stays inside it.
              </p>
            </div>

            <div className="rounded-xl border border-[#E5E1D8] bg-white p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Add content block
              </p>
              <div className="flex flex-wrap gap-1.5">
                {MANUAL_BLOCK_OPTIONS.map((opt) => (
                  <button
                    key={opt.kind}
                    type="button"
                    disabled={Boolean(uploadingKind)}
                    onClick={() => insertBlock(opt.kind)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#E5E1D8] bg-[#F7F6F2] px-2 py-1.5 text-[11px] font-medium text-[#0B1B2B] hover:border-[#C9A646] hover:bg-white disabled:opacity-50"
                  >
                    {opt.kind === 'image' ? (
                      <ImagePlus size={12} />
                    ) : opt.kind === 'audio' ? (
                      <FileAudio size={12} />
                    ) : opt.kind === 'pdf' ? (
                      <FileText size={12} />
                    ) : (
                      <Plus size={12} />
                    )}
                    {opt.label}
                  </button>
                ))}
              </div>
              {uploadingKind && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-[#64748B]">
                  <Loader2 size={12} className="animate-spin" /> Uploading {uploadingKind}…
                </p>
              )}
            </div>

            <RichTextEditor
              key={activeSection?.id ?? 'empty'}
              bookId={book.id}
              value={activeSection?.content ?? ''}
              onChange={updateSectionContent}
              insertHtmlRef={insertHtmlRef}
              minHeight="420px"
            />
          </section>

          {/* RIGHT 50% — desktop live preview */}
          <aside className="min-h-0 min-w-0 rounded-xl border border-[#E5E1D8] bg-white lg:sticky lg:top-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <div className="sticky top-0 z-10 border-b border-[#E5E1D8] bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Live reader preview
              </p>
              <p className="text-[12px] text-[#64748B]">
                Page {globalPageNumber}
                {activeSection?.title ? ` · ${activeSection.title}` : ''} — matches the published
                reader
              </p>
            </div>
            <div className="bg-[#F7F6F2] p-4">
              <div className="min-h-[420px] rounded-md border border-[#E5E1D8] bg-white px-6 py-6 shadow-sm">
                {previewBlocks.length === 0 ? (
                  <p className="text-center text-[13px] text-[#94A3B8]">
                    Add content to see the public reader preview.
                  </p>
                ) : (
                  <PageContentView
                    blocks={previewBlocks}
                    fontSize={16}
                    lineHeight={1.85}
                    preferParallel
                  />
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
