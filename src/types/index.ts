export interface Scholar {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  bornHijri: number;
  diedHijri: number;
  bornPlace: string;
  shortBio: string;
  fullBio: string;
  categories: string[];
  imageUrl: string;
  timelineEvents: ScholarTimelineEvent[];
}

export interface ScholarTimelineEvent {
  year: number;
  label: string;
  description: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface HijriPeriod {
  id: string;
  start: number;
  end: number;
  label: string;
  description: string;
}

/** Optional language metadata for multilingual books (backward-compatible). */
export type BookContentLanguage = 'en' | 'ar' | 'ur' | 'mixed' | 'unknown';
export type BookContentDirection = 'ltr' | 'rtl';

export type ContentBlockLang = {
  language?: BookContentLanguage;
  direction?: BookContentDirection;
};

export type ContentBlock =
  | ({ type: 'paragraph'; text: string } & ContentBlockLang)
  | ({ type: 'heading'; text: string; level?: number } & ContentBlockLang)
  | ({
      type: 'quote';
      text: string;
      attribution?: string;
      author?: string;
      source?: string;
    } & ContentBlockLang)
  | ({ type: 'list'; ordered?: boolean; items: string[] } & ContentBlockLang)
  | ({ type: 'footnote'; number: number; text: string } & ContentBlockLang)
  | ({ type: 'endnote'; number: number; text: string } & ContentBlockLang)
  | ({ type: 'reference'; text: string; source?: string } & ContentBlockLang)
  | ({ type: 'citation'; text: string } & ContentBlockLang)
  | ({ type: 'arabic'; text: string } & ContentBlockLang)
  | ({ type: 'urdu'; text: string } & ContentBlockLang)
  | ({
      type: 'bilingual';
      arabic?: string;
      translation?: string;
    } & ContentBlockLang)
  | ({
      type: 'quran';
      arabic?: string;
      translation?: string;
      reference?: string;
    } & ContentBlockLang)
  | ({
      type: 'hadith';
      text: string;
      arabic?: string;
      narrator?: string;
      reference?: string;
    } & ContentBlockLang)
  | ({
      type: 'image';
      url: string;
      caption?: string;
      alt?: string;
      align?: 'left' | 'center' | 'right' | 'full' | 'wrap-left' | 'wrap-right';
      width?: 'small' | 'medium' | 'large' | 'full';
      pdfPage?: number;
      storagePath?: string;
      bucket?: string;
      fileName?: string;
    } & ContentBlockLang)
  | ({
      type: 'table';
      headers: string[];
      rows: string[][];
    } & ContentBlockLang)
  | ({
      type: 'audio';
      storagePath?: string;
      bucket?: string;
      url?: string;
      fileName?: string;
      caption?: string;
      pdfPage?: number;
      attachmentId?: string;
    } & ContentBlockLang)
  | ({
      type: 'pdf';
      storagePath?: string;
      bucket?: string;
      url?: string;
      fileName?: string;
      caption?: string;
      pdfPage?: number;
      attachmentId?: string;
    } & ContentBlockLang)
  | ({
      type: 'callout';
      text: string;
      claim?: string;
      response?: string;
      variant?: 'info' | 'warning' | 'claim';
    } & ContentBlockLang)
  | ({
      /** Safe fallback when HTML cannot be mapped to a known block */
      type: 'html';
      html: string;
    } & ContentBlockLang);

/** Public attachment metadata (paths only — signed URLs resolved at render time). */
export interface PublicBookAttachment {
  id: string;
  kind: 'image' | 'audio' | 'pdf' | 'other';
  storagePath: string;
  bucket: 'book-images' | 'book-pdfs' | 'book-attachments';
  fileName: string;
  caption?: string;
  alt?: string;
  pdfPage?: number;
  chapterId?: string;
  sectionId?: string;
  anchorId?: string;
}

export interface BookSection {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  subsections?: BookSection[];
  content?: ContentBlock[];
  /** Original PDF page range (not reader pagination) */
  pdfPageStart?: number;
  pdfPageEnd?: number;
}

export interface BookChapter {
  id: string;
  number: string;
  title: string;
  description?: string;
  sections: BookSection[];
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  /** Display name when known (preferred over resolving authorId alone) */
  authorName?: string;
  originalArabicTitle?: string;
  englishTitle?: string;
  translator?: string;
  publisher?: string;
  publicationYear?: number;
  isbn?: string;
  language?: string;
  licenceNote?: string;
  authorId: string;
  description: string;
  longDescription?: string;
  coverColor: string;
  coverUrl?: string;
  hijriStart?: number;
  hijriEnd?: number;
  categoryIds: string[];
  chapters: BookChapter[];
  introduction?: ContentBlock[];
  attachments?: PublicBookAttachment[];
  featured?: boolean;
  publishedYear?: string;
  popularity?: number;
  addedDate?: string;
  /** Original PDF page count when known from import/extraction */
  pageCount?: number;
  /** Volume label for multi-volume works; defaults to Single volume in the reader */
  volumeLabel?: string;
  /** Supabase list entry whose chapter text is still in Storage (load via fetchPublishedBookBySlug) */
  contentPending?: boolean;
}
