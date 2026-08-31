import type { Book, BookWithStructure, BooksFilters, BooksSortKey } from '../types';

// ─── Mock book list (used by /admin/books table) ──────────────────────────────

export const mockBooks: Book[] = [
  {
    id: 'book-foundations-of-knowledge',
    title: 'Foundations of Knowledge',
    subtitle: 'An Introduction to the Islamic Intellectual Tradition',
    authorName: 'Ibn Kathir',
    coverColor: '#18231F',
    categories: ['Aqeedah', 'Islamic Thought', 'Ethics'],
    hijriStartYear: 701,
    hijriEndYear: 774,
    language: 'English',
    chapterCount: 5,
    sectionCount: 14,
    wordCount: 68420,
    status: 'published',
    featured: true,
    createdAt: '2026-07-10',
    updatedAt: '2026-08-20',
  },
  {
    id: 'book-the-noble-life',
    title: 'The Noble Life',
    subtitle: 'A Study of the Prophetic Biography',
    authorName: 'Ibn Kathir',
    coverColor: '#3F4A5D',
    categories: ['Seerah', 'Biography', 'History'],
    hijriStartYear: 730,
    hijriEndYear: 774,
    language: 'English',
    chapterCount: 8,
    sectionCount: 22,
    wordCount: 94300,
    status: 'published',
    createdAt: '2026-07-12',
    updatedAt: '2026-08-18',
  },
  {
    id: 'book-path-of-the-seeker',
    title: 'The Path of the Seeker',
    subtitle: 'On the Cultivation of the Inner Life',
    authorName: 'Al-Ghazali',
    coverColor: '#3A4A3F',
    categories: ['Spirituality', 'Ethics'],
    hijriStartYear: 488,
    hijriEndYear: 505,
    language: 'English',
    chapterCount: 6,
    sectionCount: 18,
    wordCount: 55200,
    status: 'needs_review',
    extractionStatus: 'completed',
    createdAt: '2026-08-10',
    updatedAt: '2026-08-15',
  },
  {
    id: 'book-garden-of-the-people',
    title: 'Garden of the People',
    subtitle: 'A Collection of Prophetic Wisdom',
    authorName: 'Al-Nawawi',
    coverColor: '#5B4B3A',
    categories: ['Hadith', 'Ethics', 'Spirituality'],
    hijriStartYear: 660,
    hijriEndYear: 676,
    language: 'English',
    chapterCount: 10,
    sectionCount: 28,
    wordCount: 71800,
    status: 'published',
    createdAt: '2026-07-20',
    updatedAt: '2026-08-12',
  },
  {
    id: 'book-commentary-on-faith',
    title: 'A Commentary on Faith',
    subtitle: 'Theological Foundations for the Student',
    authorName: 'Ibn Taymiyyah',
    coverColor: '#2B2B2B',
    categories: ['Aqeedah', 'Islamic Thought'],
    hijriStartYear: 710,
    hijriEndYear: 728,
    language: 'English',
    chapterCount: 7,
    sectionCount: 19,
    wordCount: 62100,
    status: 'draft',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-10',
  },
  {
    id: 'book-lights-of-understanding',
    title: 'Lights of Understanding',
    subtitle: "Reflections on the Sciences of the Qur'an",
    authorName: 'Al-Suyuti',
    coverColor: '#4A5D4F',
    categories: ['Tafsir', 'Hadith'],
    hijriStartYear: 870,
    hijriEndYear: 911,
    language: 'English',
    chapterCount: 9,
    sectionCount: 26,
    wordCount: 88600,
    status: 'published',
    createdAt: '2026-07-15',
    updatedAt: '2026-08-08',
  },
  {
    id: 'book-the-preserver',
    title: 'The Preserver',
    subtitle: 'On the Authentication of Prophetic Traditions',
    authorName: 'Ibn Hajar al-Asqalani',
    coverColor: '#1F2D3F',
    categories: ['Hadith'],
    hijriStartYear: 800,
    hijriEndYear: 852,
    language: 'English',
    chapterCount: 12,
    sectionCount: 33,
    wordCount: 105400,
    status: 'published',
    createdAt: '2026-07-05',
    updatedAt: '2026-08-05',
  },
  {
    id: 'book-roots-of-jurisprudence',
    title: 'The Roots of Jurisprudence',
    subtitle: 'A Treatise on Usul al-Fiqh',
    authorName: 'Al-Ghazali',
    coverColor: '#6B5B3F',
    categories: ['Fiqh', 'Islamic Thought'],
    hijriStartYear: 490,
    hijriEndYear: 505,
    language: 'English',
    chapterCount: 8,
    sectionCount: 21,
    wordCount: 79200,
    status: 'needs_review',
    extractionStatus: 'completed',
    createdAt: '2026-08-14',
    updatedAt: '2026-08-14',
  },
  {
    id: 'book-revival-of-religious-sciences',
    title: 'Revival of Religious Sciences',
    subtitle: 'Ihya Ulum al-Din',
    authorName: 'Al-Ghazali',
    coverColor: '#4B3F2A',
    categories: ['Spirituality', 'Fiqh', 'Ethics'],
    hijriStartYear: 490,
    hijriEndYear: 505,
    language: 'English',
    chapterCount: 40,
    sectionCount: 120,
    wordCount: 342000,
    status: 'processing',
    extractionStatus: 'processing',
    createdAt: '2026-08-22',
    updatedAt: '2026-08-22',
  },
  {
    id: 'book-the-noble-life-2',
    title: 'Letters to the Seeker',
    subtitle: 'On the Etiquette of Learning',
    authorName: 'Ibn Kathir',
    coverColor: '#4F3F3A',
    categories: ['Ethics', 'Spirituality'],
    hijriStartYear: 740,
    hijriEndYear: 774,
    language: 'English',
    chapterCount: 4,
    sectionCount: 12,
    wordCount: 31400,
    status: 'draft',
    createdAt: '2026-08-03',
    updatedAt: '2026-08-03',
  },
  {
    id: 'book-era-of-the-guided',
    title: 'Era of the Rightly Guided',
    subtitle: 'The Age of the First Caliphs',
    authorName: 'Ibn Kathir',
    coverColor: '#3A3A5D',
    categories: ['History', 'Biography'],
    hijriStartYear: 750,
    hijriEndYear: 774,
    language: 'English',
    chapterCount: 11,
    sectionCount: 30,
    wordCount: 93600,
    status: 'published',
    createdAt: '2026-07-08',
    updatedAt: '2026-07-28',
  },
  {
    id: 'book-failed-import',
    title: 'Scanned Manuscript Test',
    authorName: 'Unknown',
    coverColor: '#5D5D5D',
    categories: [],
    language: 'Arabic',
    status: 'failed',
    extractionStatus: 'failed',
    createdAt: '2026-08-21',
    updatedAt: '2026-08-21',
  },
];

// ─── Mock full book with structure (used by /admin/books/:bookId/review) ──────

export const mockBookWithStructure: BookWithStructure = {
  id: 'book-path-of-the-seeker',
  title: 'The Path of the Seeker',
  subtitle: 'On the Cultivation of the Inner Life',
  authorName: 'Al-Ghazali',
  coverColor: '#3A4A3F',
  categories: ['Spirituality', 'Ethics'],
  hijriStartYear: 488,
  hijriEndYear: 505,
  language: 'English',
  chapterCount: 6,
  sectionCount: 18,
  wordCount: 55200,
  status: 'needs_review',
  extractionStatus: 'completed',
  description: 'A guide to the inner dimensions of faith, addressing purification of the heart and the disciplines of spiritual practice.',
  createdAt: '2026-08-10',
  updatedAt: '2026-08-15',
  introduction: {
    id: 'intro-1',
    title: 'Introduction',
    subtitle: 'On the purpose of this work',
    content: '<p>This work is written for the one who has felt the stirring of the heart toward something beyond the surface of life — the one who senses that there is more to faith than the performance of duties, and who seeks a path toward that deeper reality.</p><p>It is not a comprehensive treatise but a companion for the journey. It offers direction, encouragement, and reflection, drawing on the wisdom of those who have walked this path before.</p>',
    order: 0,
  },
  chapters: [
    {
      id: 'ch-1',
      bookId: 'book-path-of-the-seeker',
      number: '1',
      title: 'The Beginning of the Path',
      description: 'On the intention and the first steps of the seeker.',
      order: 0,
      sections: [
        {
          id: 'sec-1-1',
          chapterId: 'ch-1',
          number: '1.1',
          title: 'The Intention',
          content: '<p>Every journey begins with an intention. The seeker who sets out on the path must first clarify what is sought and why. Without a sincere intention, effort is scattered and progress is illusory.</p><p>The intention is not a one-time act but a continuous orientation. It must be renewed at each stage, examined for sincerity, and corrected when it drifts toward lesser aims.</p>',
          order: 0,
        },
        {
          id: 'sec-1-2',
          chapterId: 'ch-1',
          number: '1.2',
          title: 'The First Steps',
          content: '<p>The first practical steps of the path involve establishing the obligations — the acts of worship and the ethical conduct that form the foundation of religious life. No spiritual progress is possible without this foundation.</p>',
          order: 1,
        },
      ],
    },
    {
      id: 'ch-2',
      bookId: 'book-path-of-the-seeker',
      number: '2',
      title: 'Obstacles on the Path',
      description: 'The inner and outer obstacles the seeker must recognize and overcome.',
      order: 1,
      sections: [
        {
          id: 'sec-2-1',
          chapterId: 'ch-2',
          number: '2.1',
          title: 'The Ego and Its Stratagems',
          content: '<p>The ego is the primary obstacle on the path. It is subtle, persistent, and capable of disguising itself as sincerity. The seeker must learn to recognize its movements and not be deceived by its appearance of virtue.</p>',
          order: 0,
        },
        {
          id: 'sec-2-2',
          chapterId: 'ch-2',
          number: '2.2',
          title: 'The World and Its Distractions',
          content: '<p>The world is not evil in itself, but attachment to it is the source of most spiritual difficulty. The seeker must learn to use the world without being used by it.</p>',
          order: 1,
        },
        {
          id: 'sec-2-3',
          chapterId: 'ch-2',
          number: '2.3',
          title: 'Spiritual Arrogance',
          content: '<p>Perhaps the most dangerous obstacle is spiritual pride — the sense that one has progressed further than others. This is the subtlest trap of all, for it wears the appearance of accomplishment.</p>',
          order: 2,
        },
      ],
    },
    {
      id: 'ch-3',
      bookId: 'book-path-of-the-seeker',
      number: '3',
      title: 'The Virtues of the Path',
      description: 'Qualities that must be cultivated by the sincere seeker.',
      order: 2,
      sections: [
        {
          id: 'sec-3-1',
          chapterId: 'ch-3',
          number: '3.1',
          title: 'Patience',
          content: '<p>Patience is the foundation of all spiritual virtue. It is required not only in the face of hardship but in the daily practice of discipline, in the slow cultivation of character, and in the long wait for the fruits of effort.</p>',
          order: 0,
        },
        {
          id: 'sec-3-2',
          chapterId: 'ch-3',
          number: '3.2',
          title: 'Gratitude',
          content: '<p>Gratitude is the recognition that all gifts come from a single Source, and the orientation of the self toward that Source in acknowledgement and praise. It is both an attitude and a practice.</p>',
          order: 1,
        },
      ],
    },
  ],
};

// ─── Derived filter options ───────────────────────────────────────────────────

export const ALL_CATEGORIES = Array.from(
  new Set(mockBooks.flatMap((b) => b.categories))
).sort();

export const ALL_AUTHORS = Array.from(
  new Set(mockBooks.map((b) => b.authorName).filter(Boolean) as string[])
).sort();

export const HIJRI_PERIODS = [
  { label: '100–200 AH', start: 100, end: 200 },
  { label: '300–500 AH', start: 300, end: 500 },
  { label: '400–600 AH', start: 400, end: 600 },
  { label: '600–700 AH', start: 600, end: 700 },
  { label: '700–800 AH', start: 700, end: 800 },
  { label: '800–900 AH', start: 800, end: 900 },
  { label: '900–1000 AH', start: 900, end: 1000 },
];

export const PAGE_SIZE = 20;

// ─── Stats helper ─────────────────────────────────────────────────────────────

export function getBooksStats(books: Book[]) {
  return {
    total: books.length,
    published: books.filter((b) => b.status === 'published').length,
    drafts: books.filter((b) => b.status === 'draft').length,
    needsReview: books.filter((b) => b.status === 'needs_review').length,
    processing: books.filter((b) => b.status === 'processing').length,
  };
}

// ─── Filter + sort (pure — swap body for Supabase query later) ────────────────

export function applyFiltersAndSort(
  books: Book[],
  filters: BooksFilters,
  sort: BooksSortKey
): Book[] {
  let result = [...books];

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.subtitle?.toLowerCase().includes(q) ?? false) ||
        (b.authorName?.toLowerCase().includes(q) ?? false)
    );
  }

  if (filters.status) result = result.filter((b) => b.status === filters.status);
  if (filters.category) result = result.filter((b) => b.categories.includes(filters.category));
  if (filters.author) result = result.filter((b) => b.authorName === filters.author);

  if (filters.hijriPeriod) {
    const [s, e] = filters.hijriPeriod.split('-').map(Number);
    result = result.filter(
      (b) => b.hijriStartYear !== undefined && b.hijriStartYear >= s && b.hijriStartYear < e
    );
  }

  if (sort === 'title_asc') result.sort((a, b) => a.title.localeCompare(b.title));
  else if (sort === 'title_desc') result.sort((a, b) => b.title.localeCompare(a.title));
  else result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return result;
}
