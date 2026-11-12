import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  catNameToId,
  generateSlug,
  reviewBookToPublicBook,
} from '@/lib/bookTransform';
import { stripDataUriImagesFromBookContent } from '@/lib/stripDataUriImages';
import type {
  BookAttachment,
  BookWithStructure,
  BookStatus,
} from '@/features/books/types';
import type { Book } from '@/types';

const COVER_BUCKET = 'book-covers';
const CONTENT_BUCKET = 'book-content';
const PDF_BUCKET = 'book-pdfs';
const IMAGE_BUCKET = 'book-images';
const ATTACHMENT_BUCKET = 'book-attachments';

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
  source_pdf_path?: string | null;
  source_pdf_url?: string | null;
  import_method?: string | null;
  licence_note?: string | null;
  imported_at?: string | null;
  original_arabic_title?: string | null;
  english_title?: string | null;
  translator?: string | null;
  publisher?: string | null;
  publication_year?: number | null;
  isbn?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertBookOptions {
  /** Intermediate markdown from the PDF pipeline — kept in Storage for debugging / re-parsing */
  sourceMarkdown?: string;
  /** Retain original PDF bytes in private book-pdfs bucket */
  originalPdfFile?: File | Blob;
  originalPdfFileName?: string;
}

type HydratedDbBookRow = DbBookRow & {
  _attachments?: BookAttachment[];
  _presentationFormat?: BookWithStructure['presentationFormat'];
};

interface StoredBookBibliographic {
  originalArabicTitle?: string;
  englishTitle?: string;
  translator?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  licenceNote?: string;
  language?: string;
}

interface StoredBookContent {
  version: 1;
  introduction: BookWithStructure['introduction'] | null;
  chapters: ReturnType<typeof chaptersToDb>;
  sourceMarkdown?: string;
  bibliographic?: StoredBookBibliographic;
  attachments?: BookAttachment[];
  presentationFormat?: BookWithStructure['presentationFormat'];
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
      content: stripDataUriImagesFromBookContent(sec.content ?? ''),
      order: sec.order,
      ...(sec.pdfPageStart != null ? { pdfPageStart: sec.pdfPageStart } : {}),
      ...(sec.pdfPageEnd != null ? { pdfPageEnd: sec.pdfPageEnd } : {}),
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

function rowToReviewBook(row: HydratedDbBookRow): BookWithStructure {
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
      pdfPageStart:
        typeof (sec as { pdfPageStart?: number }).pdfPageStart === 'number'
          ? (sec as { pdfPageStart?: number }).pdfPageStart
          : undefined,
      pdfPageEnd:
        typeof (sec as { pdfPageEnd?: number }).pdfPageEnd === 'number'
          ? (sec as { pdfPageEnd?: number }).pdfPageEnd
          : undefined,
    })),
  }));

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    originalArabicTitle: row.original_arabic_title ?? undefined,
    englishTitle: row.english_title ?? undefined,
    authorName: row.author_name ?? undefined,
    authorId: row.author_id ?? undefined,
    translator: row.translator ?? undefined,
    publisher: row.publisher ?? undefined,
    publicationYear: row.publication_year ?? undefined,
    isbn: row.isbn ?? undefined,
    description: row.description ?? undefined,
    coverColor: row.cover_color || '#18231F',
    coverUrl: row.cover_url ?? undefined,
    sourcePdfPath: row.source_pdf_path ?? undefined,
    sourcePdfUrl: row.source_pdf_url ?? undefined,
    importMethod:
      row.import_method === 'upload' || row.import_method === 'url' || row.import_method === 'manual'
        ? row.import_method
        : undefined,
    licenceNote: row.licence_note ?? undefined,
    importedAt: row.imported_at ?? undefined,
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
    attachments: row._attachments,
    presentationFormat: row._presentationFormat,
    creationMethod: row.import_method === 'manual' ? 'manual' : 'pdf_import',
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

/** Upload original PDF to private book-pdfs bucket. Returns storage path. */
export async function uploadOriginalPdf(
  bookId: string,
  file: File | Blob,
  fileName = 'original.pdf',
): Promise<string> {
  const supabase = getSupabase();
  const safeName = fileName.replace(/[^\w.\-]+/g, '_').slice(0, 80) || 'original.pdf';
  const path = `${bookId}/${safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`}`;

  const { error } = await supabase.storage.from(PDF_BUCKET).upload(path, file, {
    contentType: 'application/pdf',
    upsert: true,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('bucket') && msg.includes('not found')) {
      throw new Error(
        'Storage bucket "book-pdfs" missing — run supabase/book-enhancements.sql in the Supabase SQL Editor, then try again.',
      );
    }
    throw new Error(`Original PDF upload failed: ${error.message}`);
  }
  return path;
}

/** Signed URL for admin to download a retained original PDF. */
export async function getOriginalPdfSignedUrl(
  sourcePdfPath: string,
  expiresIn = 3600,
): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(PDF_BUCKET)
    .createSignedUrl(sourcePdfPath, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Could not create PDF download link');
  }
  return data.signedUrl;
}

/** Download original PDF bytes from private storage (for reprocess). */
export async function downloadOriginalPdfBlob(sourcePdfPath: string): Promise<Blob> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(PDF_BUCKET).download(sourcePdfPath);
  if (error || !data) {
    throw new Error(error?.message || 'Could not download original PDF from Storage');
  }
  return data;
}

// ─── Extraction job tracking (book_extraction_jobs) ───────────────────────────

export interface ExtractionJobRow {
  id: string;
  bookId: string | null;
  importMethod: string;
  status: string;
  stage: string | null;
  progress: number;
  totalPages: number | null;
  completedPages: number | null;
  ocrPages: number[];
  failedPages: number[];
  warnings: string[];
  errorMessage: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export async function createExtractionJob(input: {
  bookId?: string;
  importMethod?: string;
  totalPages?: number;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('book_extraction_jobs')
      .insert({
        book_id: input.bookId ?? null,
        import_method: input.importMethod ?? 'upload',
        status: 'processing',
        stage: 'start',
        progress: 0,
        total_pages: input.totalPages ?? null,
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();
    if (error || !data) {
      console.warn('[bookApi] createExtractionJob skipped:', error?.message);
      return null;
    }
    return (data as { id: string }).id;
  } catch (err) {
    console.warn('[bookApi] createExtractionJob failed:', err);
    return null;
  }
}

export async function updateExtractionJob(
  jobId: string,
  patch: {
    bookId?: string;
    status?: string;
    stage?: string;
    progress?: number;
    totalPages?: number;
    completedPages?: number;
    ocrPages?: number[];
    failedPages?: number[];
    warnings?: string[];
    errorMessage?: string | null;
    completed?: boolean;
  },
): Promise<void> {
  if (!isSupabaseConfigured() || !jobId) return;
  try {
    const supabase = getSupabase();
    const payload: Record<string, unknown> = {};
    if (patch.bookId !== undefined) payload.book_id = patch.bookId;
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.stage !== undefined) payload.stage = patch.stage;
    if (patch.progress !== undefined) payload.progress = patch.progress;
    if (patch.totalPages !== undefined) payload.total_pages = patch.totalPages;
    if (patch.completedPages !== undefined) payload.completed_pages = patch.completedPages;
    if (patch.ocrPages !== undefined) payload.ocr_pages = patch.ocrPages;
    if (patch.failedPages !== undefined) payload.failed_pages = patch.failedPages;
    if (patch.warnings !== undefined) payload.warnings = patch.warnings;
    if (patch.errorMessage !== undefined) payload.error_message = patch.errorMessage;
    if (patch.completed) payload.completed_at = new Date().toISOString();
    const { error } = await supabase.from('book_extraction_jobs').update(payload).eq('id', jobId);
    if (error) console.warn('[bookApi] updateExtractionJob:', error.message);
  } catch (err) {
    console.warn('[bookApi] updateExtractionJob failed:', err);
  }
}

export async function fetchLatestExtractionJob(
  bookId: string,
): Promise<ExtractionJobRow | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('book_extraction_jobs')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    return {
      id: String(row.id),
      bookId: (row.book_id as string) ?? null,
      importMethod: String(row.import_method ?? 'upload'),
      status: String(row.status ?? 'pending'),
      stage: (row.stage as string) ?? null,
      progress: Number(row.progress ?? 0),
      totalPages: (row.total_pages as number) ?? null,
      completedPages: (row.completed_pages as number) ?? null,
      ocrPages: (row.ocr_pages as number[]) ?? [],
      failedPages: (row.failed_pages as number[]) ?? [],
      warnings: (row.warnings as string[]) ?? [],
      errorMessage: (row.error_message as string) ?? null,
      startedAt: (row.started_at as string) ?? null,
      completedAt: (row.completed_at as string) ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Upload a chapter/content image to book-images.
 * Prefer this over embedding base64 in JSON.
 */
export async function uploadBookContentImage(
  bookId: string,
  file: File | Blob,
  fileName?: string,
): Promise<{ path: string; publicUrl: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Sign in to upload content images to the shared library.');
  }

  const extFromName = fileName?.split('.').pop()?.toLowerCase();
  const mime = (file as File).type || 'image/jpeg';
  const ext =
    extFromName && /^(jpe?g|png|webp|gif)$/i.test(extFromName)
      ? extFromName.replace('jpeg', 'jpg')
      : mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  const path = `${bookId}/images/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: mime,
    upsert: false,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('bucket') && msg.includes('not found')) {
      throw new Error(
        'Storage bucket "book-images" missing — run supabase/book-enhancements.sql in the Supabase SQL Editor, then try again.',
      );
    }
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/**
 * Upload audio / supplemental PDF to private book-attachments.
 * Returns a BookAttachment record (path only — use signed URLs to open).
 */
export async function uploadBookAttachment(
  bookId: string,
  file: File,
  meta?: {
    kind?: BookAttachment['kind'];
    caption?: string;
    pdfPage?: number;
    chapterId?: string;
    sectionId?: string;
    anchorId?: string;
  },
): Promise<BookAttachment> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  const supabase = getSupabase();
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Sign in to upload attachments.');
  }

  const mime = file.type || 'application/octet-stream';
  const kind: BookAttachment['kind'] =
    meta?.kind ||
    (mime.startsWith('audio/') ? 'audio' : mime.includes('pdf') ? 'pdf' : 'other');
  const safeName = (file.name || `file-${Date.now()}`).replace(/[^\w.\-]+/g, '_');
  const path = `${bookId}/attachments/${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage.from(ATTACHMENT_BUCKET).upload(path, file, {
    contentType: mime,
    upsert: false,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('bucket') && msg.includes('not found')) {
      throw new Error(
        'Storage bucket "book-attachments" missing — run supabase/admin-review-enhancements.sql, then try again.',
      );
    }
    throw new Error(`Attachment upload failed: ${error.message}`);
  }

  return {
    id: crypto.randomUUID(),
    kind,
    storagePath: path,
    bucket: 'book-attachments',
    fileName: file.name || safeName,
    mimeType: mime,
    sizeBytes: file.size,
    caption: meta?.caption,
    pdfPage: meta?.pdfPage,
    chapterId: meta?.chapterId,
    sectionId: meta?.sectionId,
    anchorId: meta?.anchorId,
    createdAt: new Date().toISOString(),
  };
}

/** Short-lived signed URL for private book-attachments / book-pdfs objects. */
export async function getAttachmentSignedUrl(
  bucket: BookAttachment['bucket'],
  storagePath: string,
  expiresIn = 3600,
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  if (bucket === 'book-images') {
    const { data } = getSupabase().storage.from(IMAGE_BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  }
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, expiresIn);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Could not create signed URL');
  }
  return data.signedUrl;
}

export async function removeBookAttachmentObject(
  attachment: Pick<BookAttachment, 'bucket' | 'storagePath'>,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (attachment.bucket === 'book-images') {
    await getSupabase().storage.from(IMAGE_BUCKET).remove([attachment.storagePath]);
    return;
  }
  await getSupabase().storage.from(attachment.bucket).remove([attachment.storagePath]);
}

/**
 * Copy the current content.json to a timestamped backup object before overwrite.
 * Non-fatal if the previous object is missing.
 */
export async function backupBookContentSnapshot(bookId: string): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getSupabase();
    const src = `${bookId}/content.json`;
    const dest = `${bookId}/content.backup.${Date.now()}.json`;
    const { data, error } = await supabase.storage.from(CONTENT_BUCKET).download(src);
    if (error || !data) return null;
    const { error: upErr } = await supabase.storage
      .from(CONTENT_BUCKET)
      .upload(dest, data, { contentType: 'application/json', upsert: false });
    if (upErr) {
      console.warn('[bookApi] content backup skipped:', upErr.message);
      return null;
    }
    return dest;
  } catch (err) {
    console.warn('[bookApi] content backup failed:', err);
    return null;
  }
}

/** Upload chapters + introduction JSON to Supabase Storage (S3). */
async function uploadBookContentToStorage(
  bookId: string,
  book: BookWithStructure,
  sourceMarkdown?: string,
): Promise<string> {
  const supabase = getSupabase();
  const path = `${bookId}/content.json`;
  const introduction = book.introduction
    ? {
        ...book.introduction,
        content: stripDataUriImagesFromBookContent(book.introduction.content ?? ''),
      }
    : null;
  const bibliographic: StoredBookBibliographic = {
    ...(book.originalArabicTitle ? { originalArabicTitle: book.originalArabicTitle } : {}),
    ...(book.englishTitle ? { englishTitle: book.englishTitle } : {}),
    ...(book.translator ? { translator: book.translator } : {}),
    ...(book.publisher ? { publisher: book.publisher } : {}),
    ...(book.publicationYear != null ? { publicationYear: book.publicationYear } : {}),
    ...(book.isbn ? { isbn: book.isbn } : {}),
    ...(book.licenceNote ? { licenceNote: book.licenceNote } : {}),
    ...(book.language ? { language: book.language } : {}),
  };

  const payload: StoredBookContent = {
    version: 1,
    introduction,
    chapters: chaptersToDb(book),
    ...(sourceMarkdown ? { sourceMarkdown } : {}),
    ...(Object.keys(bibliographic).length ? { bibliographic } : {}),
    ...(book.attachments?.length ? { attachments: book.attachments } : {}),
    ...(book.presentationFormat ? { presentationFormat: book.presentationFormat } : {}),
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
async function hydrateContentFromStorage(row: DbBookRow): Promise<HydratedDbBookRow> {
  if (!row.content_path) return row;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage.from(CONTENT_BUCKET).download(row.content_path);
    if (error || !data) return row;

    const text = await data.text();
    const parsed = JSON.parse(text) as StoredBookContent;
    if (!parsed?.chapters) return row;

    const bib = parsed.bibliographic;
    return {
      ...row,
      introduction: parsed.introduction ?? row.introduction,
      chapters: parsed.chapters as DbBookRow['chapters'],
      // Prefer explicit DB columns; fall back to content.json bibliographic block
      original_arabic_title:
        row.original_arabic_title ?? bib?.originalArabicTitle ?? null,
      english_title: row.english_title ?? bib?.englishTitle ?? null,
      translator: row.translator ?? bib?.translator ?? null,
      publisher: row.publisher ?? bib?.publisher ?? null,
      publication_year: row.publication_year ?? bib?.publicationYear ?? null,
      isbn: row.isbn ?? bib?.isbn ?? null,
      licence_note: row.licence_note ?? bib?.licenceNote ?? null,
      language: row.language || bib?.language || 'English',
      _attachments: parsed.attachments,
      _presentationFormat: parsed.presentationFormat,
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
  'import_method',
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
    | 'import_method'
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
    importMethod:
      row.import_method === 'upload' || row.import_method === 'url' || row.import_method === 'manual'
        ? row.import_method
        : undefined,
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

  let sourcePdfPath = book.sourcePdfPath;
  if (options?.originalPdfFile) {
    try {
      sourcePdfPath = await uploadOriginalPdf(
        book.id,
        options.originalPdfFile,
        options.originalPdfFileName,
      );
    } catch (err) {
      // PDF retention is additive — don't fail the whole save if bucket missing
      console.warn('[bookApi] Original PDF upload skipped:', err);
    }
  }

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
    source_pdf_path: sourcePdfPath ?? null,
    source_pdf_url: book.sourcePdfUrl ?? null,
    import_method: book.importMethod ?? null,
    licence_note: book.licenceNote ?? null,
    imported_at: book.importedAt ?? (sourcePdfPath ? new Date().toISOString() : null),
    original_arabic_title: book.originalArabicTitle ?? null,
    english_title: book.englishTitle ?? null,
    translator: book.translator ?? null,
    publisher: book.publisher ?? null,
    publication_year: book.publicationYear ?? null,
    isbn: book.isbn ?? null,
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
    const missingEnhancement =
      msg.includes('source_pdf') ||
      msg.includes('import_method') ||
      msg.includes('licence_note') ||
      msg.includes('imported_at');
    const missingBibliographic =
      msg.includes('original_arabic_title') ||
      msg.includes('english_title') ||
      msg.includes('translator') ||
      msg.includes('publisher') ||
      msg.includes('publication_year') ||
      msg.includes('isbn');
    if (
      msg.includes('created_by') ||
      msg.includes('content_path') ||
      missingEnhancement ||
      missingBibliographic
    ) {
      delete payload.created_by;
      if (missingBibliographic) {
        delete payload.original_arabic_title;
        delete payload.english_title;
        delete payload.translator;
        delete payload.publisher;
        delete payload.publication_year;
        delete payload.isbn;
      }
      if (missingEnhancement) {
        delete payload.source_pdf_path;
        delete payload.source_pdf_url;
        delete payload.import_method;
        delete payload.licence_note;
        delete payload.imported_at;
      }
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
      invalidatePublishedBookCache(retry.data.slug);
      invalidatePublishedBookCache(slug);
      return {
        id: retry.data.id,
        slug: retry.data.slug,
        coverUrl: retry.data.cover_url ?? undefined,
        contentPath: payload.content_path ? contentPath : undefined,
      };
    }
  throw new Error(error.message);
  }

  invalidatePublishedBookCache(data.slug);
  invalidatePublishedBookCache(slug);

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

export function invalidatePublishedBookCache(slug?: string): void {
  if (!slug) {
    fullBookCache.clear();
    publishedCache = [];
    return;
  }
  fullBookCache.delete(slug);
  publishedCache = publishedCache.filter((b) => b.slug !== slug);
}

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
