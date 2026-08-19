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

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level?: number }
  | { type: 'quote'; text: string; attribution?: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'footnote'; number: number; text: string }
  | { type: 'reference'; text: string; source?: string };

export interface BookSection {
  id: string;
  number: string;
  title: string;
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
