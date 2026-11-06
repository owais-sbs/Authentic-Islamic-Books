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
  /** Legacy / external URL field */
  originalPdfUrl?: string;
  /** Private Storage path for retained original PDF (book-pdfs bucket) */
  sourcePdfPath?: string;
  /** Authorized external PDF URL used for import (if any) */
  sourcePdfUrl?: string;
  importMethod?: 'upload' | 'url' | 'manual';
  licenceNote?: string;
  importedAt?: string;
  /** Intermediate markdown from the PDF pipeline (import only, not shown to readers) */
  sourceMarkdown?: string;
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
  documentType?: 'text' | 'scanned' | 'mixed';
  extractedWordCount?: number;
  detectedChapterCount?: number;
  detectedSectionCount?: number;
  errorMessage?: string;
  createdAt: string;
}

/** Extraction quality metadata shown on admin review (optional, backward-compatible). */
export interface BookExtractionInfo {
  fileSizeBytes?: number;
  documentType?: 'text' | 'scanned' | 'mixed';
  languages?: string[];
  warnings?: string[];
  lowConfidenceHeadings?: number;
  scannedPageNums?: number[];
  ocrPageCount?: number;
  /** Pages where Arabic OCR confidence was low */
  lowConfidenceArabicPages?: number[];
  importMethod?: 'upload' | 'url' | 'manual';
  sourcePdfUrl?: string;
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

/** Reader presentation templates (demo formats 01–06). Default = Format 06. */
export type PresentationFormatId =
  | 'classic-book'
  | 'research-article'
  | 'numbered-refutation'
  | 'quote-reader'
  | 'audio-pdf'
  | 'combined-edition';

export interface BookWithStructure extends Book {
  introduction?: Omit<BookIntroduction, 'bookId'>;
  chapters: BookChapter[];
  /** Present after PDF import — review quality panel */
  extractionInfo?: BookExtractionInfo;
  /**
   * Optional reader layout (Formats 01–06). Omitted / unknown → Format 06.
   * Stored in content.json for backward compatibility (no required DB column).
   */
  presentationFormat?: PresentationFormatId;
  /** How the book was created — does not affect publishing. */
  creationMethod?: 'pdf_import' | 'manual';
}
