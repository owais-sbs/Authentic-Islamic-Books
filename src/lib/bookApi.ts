import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  catNameToId,
  generateSlug,
  publicBookToAdminBook,
  reviewBookToPublicBook,
} from '@/lib/bookTransform';
import type { BookWithStructure, BookStatus } from '@/features/books/types';
import type { Book } from '@/types';

const COVER_BUCKET = 'book-covers';

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
  created_at: string;
  updated_at: string;
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
      content: sec.content,
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
    coverColor: row.cover_color,
    coverUrl: row.cover_url ?? undefined,
    categories: row.category_ids.map((id) => catMap[id] ?? 'Islamic Thought'),
    hijriStartYear: row.hijri_start ?? undefined,
    hijriEndYear: row.hijri_end ?? undefined,
    language: row.language,
    status: row.status,
    featured: row.featured,
    chapterCount: chapters.length,
    sectionCount: chapters.reduce((n, c) => n + c.sections.length, 0),
    createdAt: row.created_at.slice(0, 10),
    updatedAt: row.updated_at.slice(0, 10),
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

  return rowToReviewBook(data as DbBookRow);
}

export async function deleteBookFromSupabase(bookId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabase();
  const { error } = await supabase.from('books').delete().eq('id', bookId);
  if (error) throw new Error(error.message);
}

export async function updateBookStatusInSupabase(
  bookId: string,
  status: BookStatus
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const supabase = getSupabase();
  const { error } = await supabase.from('books').update({ status }).eq('id', bookId);
  if (error) throw new Error(error.message);
}

export async function fetchAllBooksFromSupabase(): Promise<
  import('@/features/books/types').Book[]
> {
  if (!isSupabaseConfigured()) return [];

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('[Supabase] fetchAllBooks:', error.message);
    return [];
  }

  return (data as DbBookRow[]).map((row) => {
    const review = rowToReviewBook(row);
    const publicBook = reviewBookToPublicBook(review);
    return publicBookToAdminBook(publicBook, row.status);
  });
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

  return (data as DbBookRow[]).map((row) => reviewBookToPublicBook(rowToReviewBook(row)));
}

export async function upsertBookToSupabase(
  book: BookWithStructure,
  status: BookStatus
): Promise<{ id: string; slug: string; coverUrl?: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }

  const supabase = getSupabase();
  const slug = generateSlug(book.title, book.id);
  const coverUrl = await uploadCoverIfNeeded(book.id, book.coverUrl);
  const categoryIds =
    book.categories.length > 0 ? book.categories.map(catNameToId) : ['cat-thought'];

  const payload = {
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
    introduction: book.introduction ?? null,
    chapters: chaptersToDb(book),
  };

  const { data, error } = await supabase
    .from('books')
    .upsert(payload, { onConflict: 'id' })
    .select('id, slug, cover_url')
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    slug: data.slug,
    coverUrl: data.cover_url ?? undefined,
  };
}

// In-memory cache for sync getBookBySlug lookups
let publishedCache: Book[] = [];

export function getSupabasePublishedCache(): Book[] {
  return publishedCache;
}

export function setSupabasePublishedCache(books: Book[]): void {
  publishedCache = books;
}

export async function refreshSupabasePublishedCache(): Promise<Book[]> {
  const books = await fetchPublishedBooksFromSupabase();
  setSupabasePublishedCache(books);
  return books;
}
