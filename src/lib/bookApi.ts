import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  catNameToId,
  generateSlug,
  reviewBookToPublicBook,
} from '@/lib/bookTransform';
import type { BookWithStructure, BookStatus } from '@/features/books/types';
import type { Book } from '@/types';

const COVER_BUCKET = 'book-covers';
const CONTENT_BUCKET = 'book-content';

interface DbBookRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  author_name: string | null;
  author_id: string | null;
  description: string | null;
  long_description: string | null;
  cover_color: string;
  cover_url: string | null;
  hijri_start: number | null;
  hijri_end: number | null;
  category_ids: string[];
  status: BookStatus;
  language: string;
  featured: boolean;
  popularity: number;
  introduction: BookWithStructure['introduction'] | null;
  chapters: BookWithStructure['chapters'];
  content_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertBookOptions {
  /** Intermediate markdown from the PDF pipeline — kept in Storage for debugging / re-parsing */
  sourceMarkdown?: string;
}

interface StoredBookContent {
  version: 1;
  introduction: BookWithStructure['introduction'] | null;
  chapters: ReturnType<typeof chaptersToDb>;
  sourceMarkdown?: string;
  savedAt: string;
}

function chaptersToDb(book: BookWithStructure) {
  return book.chapters.map((ch) => ({
    id: ch.id,
    bookId: book.id,
    number: ch.number,
    title: ch.title,
    description: ch.description ?? '',
    order: ch.order,
    sections: ch.sections.map((sec) => ({
      id: sec.id,
      chapterId: ch.id,
      number: sec.number,
      title: sec.title,
      subtitle: sec.subtitle ?? '',
      content: sec.content,
      order: sec.order,
    })),
  }));
}

/** Light chapter/section index for the books row — full text lives in Storage. */
function chaptersToIndex(book: BookWithStructure) {
  return chaptersToDb(book).map((ch) => ({
    ...ch,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sections: ch.sections.map(({ content: _content, ...sec }) => sec),
  }));
}

function rowToReviewBook(row: DbBookRow): BookWithStructure {
  const catMap: Record<string, string> = {
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

  const chapters = (row.chapters ?? []).map((ch, ci) => ({
    id: ch.id,
    bookId: row.id,
    number: ch.number,
    title: ch.title,
    description: ch.description,
    order: ch.order ?? ci,
    sections: (ch.sections ?? []).map((sec, si) => ({
      id: sec.id,
      chapterId: ch.id,
      number: sec.number,
      title: sec.title,
      subtitle: sec.subtitle,
      content: sec.content ?? '',
      order: sec.order ?? si,
    })),
  }));

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    authorName: row.author_name ?? undefined,
    authorId: row.author_id ?? undefined,
    description: row.description ?? undefined,
    coverColor: row.cover_color || '#18231F',
    coverUrl: row.cover_url ?? undefined,
    categories: (row.category_ids ?? []).map((id) => catMap[id] ?? 'Islamic Thought'),
    hijriStartYear: row.hijri_start ?? undefined,
    hijriEndYear: row.hijri_end ?? undefined,
    language: row.language || 'English',
    status: row.status || 'published',
    featured: row.featured ?? false,
    chapterCount: chapters.length,
    sectionCount: chapters.reduce((n, c) => n + c.sections.length, 0),
    createdAt: (row.created_at || new Date().toISOString()).slice(0, 10),
    updatedAt: (row.updated_at || new Date().toISOString()).slice(0, 10),
    introduction: row.introduction ?? undefined,
    chapters,
  };
}

async function uploadCoverIfNeeded(bookId: string, coverUrl?: string): Promise<string | undefined> {
  if (!coverUrl || !coverUrl.startsWith('data:')) return coverUrl;

  const [header, base64] = coverUrl.split(',');
  const mime = header.match(/data:(.*?);/)?.[1] ?? 'image/jpeg';
  const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') ?? 'jpg';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const path = `${bookId}/cover.${ext}`;
  const supabase = getSupabase();

  const { error } = await supabase.storage
    .from(COVER_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: true });

  if (error) throw new Error(`Cover upload failed: ${error.message}`);

  const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Upload chapters + introduction JSON to Supabase Storage (S3). */
async function uploadBookContentToStorage(
  bookId: string,
  book: BookWithStructure,
  sourceMarkdown?: string,
): Promise<string> {
  const supabase = getSupabase();
  const path = `${bookId}/content.json`;
  const payload: StoredBookContent = {
    version: 1,
    introduction: book.introduction ?? null,
    chapters: chaptersToDb(book),
    ...(sourceMarkdown ? { sourceMarkdown } : {}),
    savedAt: new Date().toISOString(),
  };
  const body = new Blob([JSON.stringify(payload)], { type: 'application/json' });

  const { error } = await supabase.storage
    .from(CONTENT_BUCKET)
    .upload(path, body, { contentType: 'application/json', upsert: true, cacheControl: '60' });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('bucket') && msg.includes('not found')) {
      throw new Error(
        'Storage bucket "book-content" missing — run supabase/book-storage.sql in the Supabase SQL Editor, then try again.',
      );
    }
    throw new Error(`Book content upload failed: ${error.message}`);
  }

  return path;
}

/** Load structured content from Storage when content_path is set. */
async function hydrateContentFromStorage(row: DbBookRow): Promise<DbBookRow> {
  if (!row.content_path) return row;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(CONTENT_BUCKET).download(row.content_path);
    if (error || !data) return row;

    const text = await data.text();
    const parsed = JSON.parse(text) as StoredBookContent;
    if (!parsed?.chapters) return row;

    return {
      ...row,
      introduction: parsed.introduction ?? row.introduction,
      chapters: parsed.chapters as DbBookRow['chapters'],
    };
  } catch {
    return row;
  }
}

async function removeBookStorageObjects(bookId: string, row?: Partial<DbBookRow>): Promise<void> {
  const supabase = getSupabase();

  const coverPrefix = await supabase.storage.from(COVER_BUCKET).list(bookId);
  if (coverPrefix.data?.length) {
    await supabase.storage
      .from(COVER_BUCKET)
      .remove(coverPrefix.data.map((f) => `${bookId}/${f.name}`));
  }

  if (row?.content_path) {
    await supabase.storage.from(CONTENT_BUCKET).remove([row.content_path]);
  } else {
    await supabase.storage.from(CONTENT_BUCKET).remove([`${bookId}/content.json`]);
  }
}

export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'Supabase env vars missing — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env',
    };
  }
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('books').select('id').limit(1);

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid api key')) {
        return {
          ok: false,
          message:
            'Invalid API key — open Supabase Dashboard → Settings → API, copy the anon public key into .env, then restart npm run dev',
        };
      }
      if (msg.includes('relation') && msg.includes('does not exist')) {
        return {
          ok: false,
          message: 'Books table missing — run supabase/schema.sql in SQL Editor',
        };
      }
      return { ok: false, message: error.message };
    }

    return { ok: true, message: 'Connected to Supabase' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Connection failed' };
  }
}

export async function fetchBookById(id: string): Promise<BookWithStructure | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase.from('books').select('*').eq('id', id).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const hydrated = await hydrateContentFromStorage(data as DbBookRow);
  return rowToReviewBook(hydrated);
}

export async function deleteBookFromSupabase(bookId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from('books')
    .select('content_path')
    .eq('id', bookId)
    .maybeSingle();

  await removeBookStorageObjects(bookId, (existing as Partial<DbBookRow>) ?? undefined);

  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw new Error(error.message);
}

export async function updateBookStatusInSupabase(
  bookId: string,
  status: BookStatus,
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabase();
  const { error } = await supabase.from('books').update({ status }).eq('id', bookId);
  if (error) throw new Error(error.message);
}

/**
 * List columns only — never select introduction / full chapter bodies.
 * Legacy rows may still store full text in `chapters`; for the admin table we
 * only need jsonb_array_length via a light select of chapters when present.
 * Prefer content_path-backed books (index-sized chapters).
 */
const ADMIN_LIST_COLUMNS = [
  'id',
  'slug',
  'title',
  'subtitle',
  'author_name',
  'author_id',
  'cover_color',
  'cover_url',
  'hijri_start',
  'hijri_end',
  'category_ids',
  'status',
  'language',
  'featured',
  'content_path',
  'created_at',
  'updated_at',
].join(', ');

function rowToAdminListBook(
  row: Pick<
    DbBookRow,
    | 'id'
    | 'title'
    | 'subtitle'
    | 'author_name'
    | 'author_id'
    | 'cover_color'
    | 'cover_url'
    | 'hijri_start'
    | 'hijri_end'
    | 'category_ids'
    | 'status'
    | 'language'
    | 'featured'
    | 'created_at'
    | 'updated_at'
  >,
): import('@/features/books/types').Book {
  const catMap: Record<string, string> = {
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

  // Prefer a real display name; never leave a raw scholar-* id as authorName.
  // The table resolves IDs via resolveAuthorName as a second pass.
  const rawAuthor = (row.author_name || '').trim();
  const authorIsId = !rawAuthor || rawAuthor.startsWith('scholar-');

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    authorName: authorIsId ? undefined : rawAuthor,
    authorId: row.author_id ?? (authorIsId ? rawAuthor || undefined : undefined),
    coverColor: row.cover_color || '#18231F',
    coverUrl: row.cover_url ?? undefined,
    categories: (row.category_ids ?? []).map((id) => catMap[id] ?? 'Islamic Thought'),
    hijriStartYear: row.hijri_start ?? undefined,
    hijriEndYear: row.hijri_end ?? undefined,
    language: row.language || 'English',
    // Counts load on the review page — omitted here so we never pull full chapter JSON.
    chapterCount: undefined,
    sectionCount: undefined,
    status: row.status || 'published',
    featured: row.featured ?? false,
    createdAt: (row.created_at || new Date().toISOString()).slice(0, 10),
    updatedAt: (row.updated_at || new Date().toISOString()).slice(0, 10),
  };
}

export async function fetchAllBooksFromSupabase(): Promise<
  import('@/features/books/types').Book[]
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.warn(
      '[Supabase] fetchAllBooks: no auth session — only published books are visible under RLS. Sign in with Supabase Auth for the full shared library.',
    );
  }

  // Metadata + chapter index only. Do NOT run htmlToContentBlocks here — that
  // path is for the reader/review UI and can throw/timeout on large books,
  // emptying the entire admin Books table while the public site still works.
  const { data, error } = await supabase
    .from('books')
    .select(ADMIN_LIST_COLUMNS)
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] fetchAllBooks:', error.message);
    throw new Error(error.message);
  }

  return (data as DbBookRow[]).map(rowToAdminListBook);
}

export async function fetchPublishedBooksFromSupabase(): Promise<Book[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] fetchPublishedBooks:', error.message);
    return [];
  }

  // List view only — chapter text for Storage-backed books is loaded per book
  // via fetchPublishedBookBySlug.
  return (data as DbBookRow[]).map((row) => {
    const book = reviewBookToPublicBook(rowToReviewBook(row));
    return row.content_path ? { ...book, contentPending: true } : book;
  });
}

/** One published book with full chapter text (downloaded from Storage when needed). */
export async function fetchPublishedBookBySlug(slug: string): Promise<Book | null> {
  if (!isSupabaseConfigured()) return null;

  const cached = fullBookCache.get(slug);
  if (cached) return cached;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error) {
    console.warn('[Supabase] fetchPublishedBookBySlug:', error.message);
    throw new Error(error.message);
  }
  if (!data) return null;

  const hydrated = await hydrateContentFromStorage(data as DbBookRow);
  const book = reviewBookToPublicBook(rowToReviewBook(hydrated));
  fullBookCache.set(slug, book);
  return book;
}

/**
 * Save book metadata + chapter index to Postgres and the full text to Storage.
 * Requires an authenticated Supabase session.
 */
export async function upsertBookToSupabase(
  book: BookWithStructure,
  status: BookStatus,
  options?: UpsertBookOptions,
): Promise<{ id: string; slug: string; coverUrl?: string; contentPath?: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabase();
  const slug = generateSlug(book.title, book.id);

  // Ensure we have an authenticated session for shared RLS write access
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error(
      'Not signed in to Supabase. Log out and sign in again with a Supabase admin account so the book is saved to the shared team library.',
    );
  }

  const coverUrl = await uploadCoverIfNeeded(book.id, book.coverUrl);
  const contentPath = await uploadBookContentToStorage(book.id, book, options?.sourceMarkdown);

  const categoryIds =
    book.categories.length > 0 ? book.categories.map(catNameToId) : ['cat-thought'];

  // Full text is in Storage; the row only keeps a chapter/section index.
  const chapters = chaptersToIndex(book);

  const payload: Record<string, unknown> = {
    id: book.id,
    slug,
    title: book.title || 'Untitled',
    subtitle: book.subtitle || null,
    author_name: book.authorName || null,
    author_id: book.authorId ?? 'scholar-ibn-kathir',
    description: book.description || null,
    cover_color: book.coverColor,
    cover_url: coverUrl ?? null,
    hijri_start: book.hijriStartYear ?? null,
    hijri_end: book.hijriEndYear ?? null,
    category_ids: categoryIds,
    status,
    language: book.language ?? 'English',
    featured: book.featured ?? false,
    introduction: null,
    chapters,
    content_path: contentPath,
    created_by: sessionData.session.user.id,
  };

  const { data, error } = await supabase
    .from('books')
    .upsert(payload, { onConflict: 'id' })
    .select('id, slug, cover_url, content_path')
    .single();

  if (error) {
    // Retry without newer columns if migration not applied yet
    const msg = error.message.toLowerCase();
    if (msg.includes('created_by') || msg.includes('content_path')) {
      delete payload.created_by;
      if (msg.includes('content_path')) {
        // content_path column missing (book-storage.sql not run yet): keep the
        // full text in the row so the book stays readable.
        delete payload.content_path;
        payload.introduction = book.introduction ?? null;
        payload.chapters = chaptersToDb(book);
      }
      const retry = await supabase
        .from('books')
        .upsert(payload, { onConflict: 'id' })
        .select('id, slug, cover_url')
        .single();
      if (retry.error) {
        if (retry.error.message.toLowerCase().includes('content_path')) {
          throw new Error(
            `${retry.error.message} — run supabase/book-storage.sql in the Supabase SQL Editor, then save again.`,
          );
        }
        throw new Error(retry.error.message);
      }
      return {
        id: retry.data.id,
        slug: retry.data.slug,
        coverUrl: retry.data.cover_url ?? undefined,
        contentPath: payload.content_path ? contentPath : undefined,
      };
    }
    throw new Error(error.message);
  }

  return {
    id: data.id,
    slug: data.slug,
    coverUrl: data.cover_url ?? undefined,
    contentPath: (data as { content_path?: string }).content_path ?? contentPath,
  };
}

// In-memory caches for sync getBookBySlug lookups. The list holds books
// without Storage text (contentPending); fullBookCache holds loaded ones.
let publishedCache: Book[] = [];
const fullBookCache = new Map<string, Book>();

export function getSupabasePublishedCache(): Book[] {
  if (fullBookCache.size === 0) return publishedCache;
  return publishedCache.map((b) => fullBookCache.get(b.slug) ?? b);
}

export function setSupabasePublishedCache(books: Book[]): void {
  publishedCache = books;
  fullBookCache.clear();
}

export async function refreshSupabasePublishedCache(): Promise<Book[]> {
  const books = await fetchPublishedBooksFromSupabase();
  setSupabasePublishedCache(books);
  return books;
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  total: number;
  published: number;
  drafts: number;
  needsReview: number;
  processing: number;
  archived: number;
}

export interface DashboardRecentBook {
  id: string;
  title: string;
  authorName: string;
  status: BookStatus;
  updatedAt: string;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    return { total: 0, published: 0, drafts: 0, needsReview: 0, processing: 0, archived: 0 };
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.from('books').select('status');

  if (error || !data) {
    return { total: 0, published: 0, drafts: 0, needsReview: 0, processing: 0, archived: 0 };
  }

  const rows = data as { status: BookStatus }[];
  return {
    total: rows.length,
    published: rows.filter((r) => r.status === 'published').length,
    drafts: rows.filter((r) => r.status === 'draft').length,
    needsReview: rows.filter((r) => r.status === 'needs_review').length,
    processing: rows.filter((r) => r.status === 'processing').length,
    archived: rows.filter((r) => r.status === 'archived').length,
  };
}

export async function fetchRecentBooks(limit = 8): Promise<DashboardRecentBook[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('books')
    .select('id, title, author_name, status, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return (
    data as {
      id: string;
      title: string;
      author_name: string | null;
      status: BookStatus;
      updated_at: string;
    }[]
  ).map((row) => ({
    id: row.id,
    title: row.title,
    authorName: row.author_name ?? '—',
    status: row.status,
    updatedAt: row.updated_at.slice(0, 10),
  }));
}
