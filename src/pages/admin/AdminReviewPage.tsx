import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/AdminShell';
import { BookReviewHeader } from '@/features/books/components/BookReviewHeader';
import { BookReviewMetadata } from '@/features/books/components/BookReviewMetadata';
import { BookReviewContent } from '@/features/books/components/BookReviewContent';
import { BookReviewStructure } from '@/features/books/components/BookReviewStructure';
import { mockBookWithStructure, mockBooks } from '@/features/books/data/mockBooks';
import { useBookStore } from '@/hooks/useBookStore';
import { rawTextToContentBlocks } from '@/lib/pdfExtractor';
import type { BookWithStructure } from '@/features/books/types';
import type { Book, BookChapter as PublicChapter, BookSection as PublicSection, ContentBlock } from '@/types';

// ─── Convert admin BookWithStructure → public Book ────────────────────────────
// This is what gets stored in useBookStore and shown in the public library.
function reviewBookToPublicBook(book: BookWithStructure): Book {
  const publicChapters: PublicChapter[] = book.chapters.map((ch) => ({
    id: ch.id,
    number: ch.number,
    title: ch.title,
    description: ch.description,
    sections: ch.sections.map((sec): PublicSection => ({
      id: sec.id,
      number: sec.number,
      title: sec.title,
      subtitle: sec.subtitle,
      content: htmlToContentBlocks(sec.content),
    })),
  }));

  const introduction: ContentBlock[] | undefined = book.introduction
    ? htmlToContentBlocks(book.introduction.content)
    : undefined;

  // Generate a clean, short slug from the title
  const slug = book.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join('-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || book.id;

  return {
    id: book.id,
    slug,
    title: book.title,
    subtitle: book.subtitle,
    authorId: 'scholar-ibn-kathir', // placeholder — will be FK in Supabase
    description: book.description ?? `${book.title} — an Islamic scholarly work.`,
    longDescription: undefined,
    coverColor: book.coverColor,
    hijriStart: book.hijriStartYear ?? 700,
    hijriEnd: book.hijriEndYear ?? 800,
    categoryIds: book.categories.length > 0
      ? book.categories.map(catNameToId)
      : ['cat-thought'],
    chapters: publicChapters,
    introduction,
    featured: false,
    popularity: 50,
    addedDate: new Date().toISOString().slice(0, 10),
  };
}

// Convert category display name → id
const CAT_NAME_TO_ID: Record<string, string> = {
  'Aqeedah': 'cat-aqeedah',
  'Hadith': 'cat-hadith',
  'Tafsir': 'cat-tafsir',
  'Fiqh': 'cat-fiqh',
  'Seerah': 'cat-seerah',
  'History': 'cat-history',
  'Ethics': 'cat-ethics',
  'Spirituality': 'cat-spirituality',
  'Islamic Thought': 'cat-thought',
  'Biography': 'cat-biography',
};

function catNameToId(name: string): string {
  return CAT_NAME_TO_ID[name] ?? 'cat-thought';
}

// Minimal HTML → ContentBlock converter (handles plain text + basic tags)
function htmlToContentBlocks(html: string): ContentBlock[] {
  if (!html?.trim()) return [];

  // Strip HTML tags to get plain text paragraphs
  const div = document.createElement('div');
  div.innerHTML = html;

  const blocks: ContentBlock[] = [];

  div.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) blocks.push({ type: 'paragraph', text });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const text = el.textContent?.trim() ?? '';
    if (!text) return;

    if (tag === 'blockquote') {
      blocks.push({ type: 'quote', text });
    } else if (tag === 'h2' || tag === 'h3') {
      blocks.push({ type: 'heading', text, level: tag === 'h2' ? 1 : 2 });
    } else if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll('li'))
        .map((li) => li.textContent?.trim() ?? '')
        .filter(Boolean);
      if (items.length) blocks.push({ type: 'list', ordered: tag === 'ol', items });
    } else {
      if (text) blocks.push({ type: 'paragraph', text });
    }
  });

  return blocks.length > 0 ? blocks : rawTextToContentBlocks(div.textContent ?? html);
}

// ─── Load initial data ────────────────────────────────────────────────────────
function loadInitialBook(
  bookId: string | undefined,
  getById: (id: string) => Book | undefined
): BookWithStructure {
  if (!bookId) return mockBookWithStructure;

  // 1. Check useBookStore (imported books)
  const stored = getById(bookId);
  if (stored) {
    return {
      ...stored,
      authorName: stored.authorId,
      description: stored.description,
      status: 'needs_review',
      extractionStatus: 'completed',
      language: 'English',
      chapterCount: stored.chapters.length,
      sectionCount: stored.chapters.reduce((n, c) => n + c.sections.length, 0),
      wordCount: undefined,
      createdAt: stored.addedDate ?? new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      categories: stored.categoryIds.map(idToCatName),
      introduction: stored.introduction
        ? {
            id: 'intro',
            title: 'Introduction',
            content: stored.introduction.map((b) => ('text' in b ? b.text : '')).join('\n\n'),
            order: 0,
          }
        : undefined,
      chapters: stored.chapters.map((ch) => ({
        id: ch.id,
        bookId: bookId,
        number: ch.number,
        title: ch.title,
        description: ch.description,
        order: 0,
        sections: ch.sections.map((sec, si) => ({
          id: sec.id,
          chapterId: ch.id,
          number: sec.number,
          title: sec.title,
          subtitle: sec.subtitle,
          content: sec.content?.map((b) => ('text' in b ? b.text : '')).join('\n\n') ?? '',
          order: si,
        })),
      })),
    };
  }

  // 2. Check mock data
  if (bookId === mockBookWithStructure.id) return mockBookWithStructure;
  const found = mockBooks.find((b) => b.id === bookId);
  if (found) return { ...found, chapters: [] };

  return mockBookWithStructure;
}

const ID_TO_CAT: Record<string, string> = {
  'cat-aqeedah': 'Aqeedah',
  'cat-hadith': 'Hadith',
  'cat-tafsir': 'Tafsir',
  'cat-fiqh': 'Fiqh',
  'cat-seerah': 'Seerah',
  'cat-history': 'History',
  'cat-ethics': 'Ethics',
  'cat-spirituality': 'Spirituality',
  'cat-thought': 'Islamic Thought',
  'cat-biography': 'Biography',
};

function idToCatName(id: string): string {
  return ID_TO_CAT[id] ?? 'Islamic Thought';
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AdminReviewPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { getById, updateBook, addBook } = useBookStore();

  const [book, setBook] = useState<BookWithStructure>(() =>
    loadInitialBook(bookId, getById)
  );
  const [isDirty, setIsDirty] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [published, setPublished] = useState(false);

  const patch = useCallback((update: Partial<BookWithStructure>) => {
    setBook((prev) => ({ ...prev, ...update }));
    setIsDirty(true);
    setSaved(false);
  }, []);

  function handleSaveDraft() {
    const publicBook = reviewBookToPublicBook({ ...book, status: 'draft' });
    // Upsert into store — this makes it visible in the public library as a draft
    addBook(publicBook);
    window.dispatchEvent(new Event('storage'));
    setBook((prev) => ({ ...prev, status: 'draft' }));
    setIsDirty(false);
    setSaved(true);
  }

  function handleApprove() {
    // Convert to public Book format and write to store
    const publicBook = reviewBookToPublicBook({ ...book, status: 'published' });
    addBook(publicBook);
    window.dispatchEvent(new Event('storage'));
    setBook((prev) => ({ ...prev, status: 'published' }));
    setIsDirty(false);
    setSaved(true);
    setPublished(true);
  }

  function handlePreview() {
    // Save first so the public route has latest data
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

  return (
    <AdminShell pageTitle="Review Book">
      {/* Sticky review header */}
      <div className="-mx-4 -mt-6 sm:-mx-6 sm:-mt-8 mb-6">
        <BookReviewHeader
          title={book.title}
          status={book.status}
          isDirty={isDirty}
          onSaveDraft={handleSaveDraft}
          onApprove={handleApprove}
          onPreview={handlePreview}
        />
      </div>

      {/* Status notices */}
      {saved && !isDirty && !published && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-[13px] text-emerald-700">
            ✓ Saved as draft. The book is now visible in your library as a draft.
          </p>
        </div>
      )}

      {published && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-[13px] font-medium text-emerald-700">
            ✓ Published! This book is now live in the public library.
          </p>
          <button
            onClick={() => {
              const publicBook = reviewBookToPublicBook(book);
              window.open(`/books/${publicBook.slug}`, '_blank');
            }}
            className="shrink-0 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            View in Library ↗
          </button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* Main column */}
        <div className="flex-1 min-w-0 space-y-5">
          <div id="review-metadata">
            <BookReviewMetadata book={book} onChange={patch} />
          </div>
          <div id="review-introduction">
            <BookReviewContent
              book={book}
              activeSectionId={activeSectionId}
              onChange={patch}
            />
          </div>
        </div>

        {/* Right sidebar */}
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
