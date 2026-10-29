import { useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  HomeHero,
  TrustStrip,
  ContinueDailySection,
  ContinueReadingBar,
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
import { useContinueReading } from '@/hooks/useContinueReading';
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

  const allBooks = filteredBooks.length ? filteredBooks : [];
  const continueReading = useContinueReading(allBooks);

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

  return (
    <PageContainer>
      <HomeHero />

      <div className="bg-ivory dark:bg-black">
        <TrustStrip />
        <ContinueDailySection />
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
        <ContinueReadingBar entry={continueReading} />
        <NewsletterSection />
      </div>

      <span className="sr-only">{totalBooks} books in library</span>
    </PageContainer>
  );
}
