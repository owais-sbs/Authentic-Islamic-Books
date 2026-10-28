import { useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  HomeHero,
  TrustStrip,
  ContinueDailySection,
  TopicExplorer,
  LibraryShelves,
  ReadingPathsSection,
  ScholarGrid,
  WhyAuthenticSection,
  NewsletterSection,
} from '@/components/home';
import {
  ARRIVAL_MOCK_BOOKS,
  FEATURED_MOCK_BOOKS,
  START_HERE_MOCK_BOOKS,
} from '@/components/home/IslamicBookMockup';
import { useLibraryFilters } from '@/hooks/useLibraryFilters';
import { useScholars } from '@/hooks/useScholars';
import { useCategories } from '@/hooks/useCategories';
import { useSavedBooks } from '@/hooks/useSavedBooks';
import { useBookmarks } from '@/hooks/useBookmarks';
import { usePageMeta } from '@/hooks/usePageMeta';
import type { Book } from '@/types';

function sortByRecent(books: Book[]): Book[] {
  return [...books].sort((a, b) => {
    const da = a.addedDate ? Date.parse(a.addedDate) : 0;
    const db = b.addedDate ? Date.parse(b.addedDate) : 0;
    if (db !== da) return db - da;
    return (b.popularity ?? 0) - (a.popularity ?? 0);
  });
}

function isIntroductory(book: Book): boolean {
  const hay = `${book.title} ${book.description} ${book.subtitle ?? ''}`.toLowerCase();
  return /new muslim|beginner|introduction|foundations|basics|start here|primer/i.test(hay);
}

export function HomePage() {
  usePageMeta({
    title: 'Authentic Islamic Books — Free Digital Islamic Library',
    description:
      'Read authentic Islamic books free. Explore curated works across Aqeedah, Qur’an, Hadith, Seerah, Fiqh, and more.',
    path: '/',
  });

  const { filteredBooks, totalBooks } = useLibraryFilters();
  const { scholars } = useScholars();
  const { categories } = useCategories();
  const { savedBooks } = useSavedBooks();
  const { bookmarks } = useBookmarks();

  const allBooks = filteredBooks.length ? filteredBooks : [];

  const featured = useMemo(() => {
    const marked = allBooks.filter((b) => b.featured);
    if (marked.length >= 4) return marked.slice(0, 12);
    return sortByRecent(allBooks).slice(0, 12);
  }, [allBooks]);

  const newArrivals = useMemo(() => sortByRecent(allBooks).slice(0, 12), [allBooks]);

  const startHere = useMemo(() => {
    const intro = allBooks.filter(isIntroductory);
    if (intro.length >= 3) return intro.slice(0, 12);
    return sortByRecent(allBooks).slice(0, 8);
  }, [allBooks]);

  const bookCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const book of allBooks) {
      for (const id of book.categoryIds ?? []) {
        counts[id] = (counts[id] ?? 0) + 1;
      }
    }
    return counts;
  }, [allBooks]);

  const continueBook = useMemo(() => {
    const slug =
      savedBooks[0]?.slug ??
      bookmarks.sort((a, b) => b.createdAt - a.createdAt)[0]?.bookSlug ??
      null;
    if (!slug) return null;
    return allBooks.find((b) => b.slug === slug) ?? null;
  }, [savedBooks, bookmarks, allBooks]);

  const progressHint = continueBook
    ? bookmarks.some((b) => b.bookSlug === continueBook.slug)
      ? 'From your bookmarks'
      : 'From your saved books'
    : undefined;

  return (
    <PageContainer>
      <HomeHero />

      {/* Clean cream mid-page — no geometric / photo patterns */}
      <div className="bg-ivory dark:bg-black">
        <TrustStrip />
        <ContinueDailySection continueBook={continueBook} progressHint={progressHint} />
        <TopicExplorer categories={categories} bookCounts={bookCounts} />
        <LibraryShelves
          featured={featured}
          newArrivals={newArrivals}
          startHere={startHere}
          featuredMocks={FEATURED_MOCK_BOOKS}
          arrivalMocks={ARRIVAL_MOCK_BOOKS}
          startMocks={START_HERE_MOCK_BOOKS}
        />
        <ReadingPathsSection />
        <ScholarGrid scholars={scholars} />
        <WhyAuthenticSection />
        <NewsletterSection />
      </div>

      <span className="sr-only">{totalBooks} books in library</span>
    </PageContainer>
  );
}
