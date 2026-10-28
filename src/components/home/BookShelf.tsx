import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import type { Book } from '@/types';
import { BookCover } from '@/components/book/BookCover';
import { getScholarById } from '@/data/scholars';
import { Reveal } from '@/components/motion/Reveal';
import {
  IslamicBookMockup,
  type MockBookSpec,
} from '@/components/home/IslamicBookMockup';

interface BookShelfProps {
  title: string;
  subtitle?: string;
  books: Book[];
  fallbackMocks?: MockBookSpec[];
}

export function BookShelf({ title, subtitle, books, fallbackMocks = [] }: BookShelfProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasItems = books.length > 0 || fallbackMocks.length > 0;

  function scroll(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: 'smooth' });
  }

  return (
    <Reveal className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="font-sans text-lg font-bold tracking-tight text-ink-900 dark:text-white sm:text-2xl">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 font-sans text-sm text-ink-500 dark:text-white/60">{subtitle}</p>
          )}
        </div>
        {hasItems && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-700 transition-colors hover:border-islamic-green hover:text-islamic-green dark:border-white/15 dark:bg-[#141414] dark:text-white/80 sm:h-10 sm:w-10"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink-700 transition-colors hover:border-islamic-green hover:text-islamic-green dark:border-white/15 dark:bg-[#141414] dark:text-white/80 sm:h-10 sm:w-10"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {books.length > 0
          ? books.map((book) => {
              const scholar = getScholarById(book.authorId);
              const author =
                scholar?.name ?? (book as Book & { authorName?: string }).authorName ?? 'Scholar';
              const chapters = book.chapters?.length ?? 0;
              return (
                <Link
                  key={book.id}
                  to={`/books/${book.slug}`}
                  className="group w-[148px] shrink-0 snap-start sm:w-[164px]"
                >
                  <div className="relative overflow-hidden rounded-xl shadow-[0_12px_28px_rgba(16,76,59,0.16)] transition-transform duration-500 group-hover:-translate-y-1.5">
                    <BookCover
                      book={book}
                      size="md"
                      className="!h-[222px] !w-full rounded-xl sm:!h-[246px]"
                    />
                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-islamic-green px-2 py-0.5 font-sans text-[10px] font-semibold text-white shadow-sm">
                      <Check size={10} strokeWidth={3} />
                      Ready
                    </span>
                  </div>
                  <h4 className="mt-3 line-clamp-2 font-sans text-[13px] font-semibold leading-snug text-ink-900 group-hover:text-islamic-green dark:text-white dark:group-hover:text-accent sm:text-sm">
                    {book.title}
                  </h4>
                  <p className="mt-1 line-clamp-1 font-sans text-xs text-ink-500 dark:text-white/55">
                    {author}
                  </p>
                  {chapters > 0 && (
                    <p className="mt-1 font-sans text-[11px] font-medium text-accent-dark">
                      {chapters} {chapters === 1 ? 'chapter' : 'chapters'}
                    </p>
                  )}
                </Link>
              );
            })
          : fallbackMocks.map((mock) => <IslamicBookMockup key={mock.id} book={mock} />)}
      </div>
    </Reveal>
  );
}

interface LibraryShelvesProps {
  featured: Book[];
  newArrivals: Book[];
  startHere: Book[];
  featuredMocks: MockBookSpec[];
  arrivalMocks: MockBookSpec[];
  startMocks: MockBookSpec[];
}

export function LibraryShelves({
  featured,
  newArrivals,
  startHere,
  featuredMocks,
  arrivalMocks,
  startMocks,
}: LibraryShelvesProps) {
  return (
    <section className="bg-ivory py-12 dark:bg-black sm:py-16">
      <div className="container-page space-y-10 sm:space-y-12">
        <Reveal className="max-w-2xl">
          <h2 className="font-sans text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl md:text-4xl dark:text-white">
            Explore the Library
          </h2>
          <p className="mt-3 font-sans text-sm text-ink-500 sm:text-base dark:text-white/65">
            Featured works, recent additions, and a gentle place to begin.
          </p>
        </Reveal>

        <BookShelf
          title="Featured Books"
          subtitle="Highlighted works from the collection"
          books={featured}
          fallbackMocks={featuredMocks}
        />
        <BookShelf
          title="New Arrivals"
          subtitle="Recently added to the library"
          books={newArrivals}
          fallbackMocks={arrivalMocks}
        />
        <BookShelf
          title="Start Here: For New Muslims"
          subtitle="Approachable introductions and foundations"
          books={startHere}
          fallbackMocks={startMocks}
        />
      </div>
    </section>
  );
}
