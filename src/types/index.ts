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
  | ({ type: 'reference'; text: string; source?: string } & ContentBlockLang)
  | ({ type: 'arabic'; text: string } & ContentBlockLang)
  | ({
      type: 'quran';
      arabic?: string;
      translation?: string;
      reference?: string;
    } & ContentBlockLang)
  | ({
      type: 'hadith';
      text: string;
      narrator?: string;
      reference?: string;
    } & ContentBlockLang);

export interface BookSection {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  subsections?: BookSection[];
  content?: ContentBlock[];
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
  authorId: string;
  description: string;
  longDescription?: string;
  coverColor: string;
  coverUrl?: string;
  hijriStart: number;
  hijriEnd: number;
  categoryIds: string[];
  chapters: BookChapter[];
  introduction?: ContentBlock[];
  featured?: boolean;
  publishedYear?: string;
  popularity?: number;
  addedDate?: string;
}
