// ─── Single canonical type file for the books feature ────────────────────────
// All admin components import from here. No duplicate interfaces.

// ─── Status ───────────────────────────────────────────────────────────────────

export type BookStatus =
  | 'processing'
  | 'needs_review'
  | 'draft'
  | 'published'
  | 'archived'
  | 'failed';

export type ExtractionStatus = 'pending' | 'processing' | 'completed' | 'failed';

// ─── Core book model (maps to future `books` Supabase table) ──────────────────

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  authorId?: string;
  authorName?: string;
  scholarId?: string;
  description?: string;
  shortDescription?: string;
  coverUrl?: string;
  coverColor: string;
  originalPdfUrl?: string;
  categories: string[];
  hijriStartYear?: number;
  hijriEndYear?: number;
  language: string;
  readingTimeMinutes?: number;
  status: BookStatus;
  extractionStatus?: ExtractionStatus;
  wordCount?: number;
  pageCount?: number;
  chapterCount?: number;
  sectionCount?: number;
  featured?: boolean;
  isPublic?: boolean;
  allowSearch?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Book structure (map to future `book_introductions`, `book_chapters`, `book_sections`) ─

export interface BookIntroduction {
  id: string;
  bookId: string;
  title: string;
  subtitle?: string;
  content: string;
  order: number;
}

export interface BookChapter {
  id: string;
  bookId: string;
  number: string;
  title: string;
  description?: string;
  order: number;
  sections: BookSection[];
}

export interface BookSection {
  id: string;
  chapterId: string;
  number: string;
  title: string;
  subtitle?: string;
  content: string;
  order: number;
}

// ─── Import job model (maps to future `book_imports` Supabase table) ──────────

export interface BookImport {
  id: string;
  fileName: string;
  fileSize: number;
  bookId?: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;           // 0–100
  documentType?: 'text' | 'scanned';
  extractedWordCount?: number;
  detectedChapterCount?: number;
  detectedSectionCount?: number;
  errorMessage?: string;
  createdAt: string;
}

// ─── Filter / sort helpers (UI state only, not persisted) ─────────────────────

export interface BooksFilters {
  search: string;
  status: string;       // '' = all
  category: string;
  author: string;
  hijriPeriod: string;  // '' = all, or 'start-end'
}

export type BooksSortKey = 'updatedAt_desc' | 'title_asc' | 'title_desc';

// ─── Mock-data full book (review page uses this shape) ────────────────────────

export interface BookWithStructure extends Book {
  introduction?: Omit<BookIntroduction, 'bookId'>;
  chapters: BookChapter[];
}
