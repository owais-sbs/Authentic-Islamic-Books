import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { AppBookCover } from '@/components/book/AppBookCover';
import {
  QURAN_BOOKS,
  HADITH_BOOKS,
  SUNNAH_BOOKS,
  HISTORY_BOOKS,
  type IslamicMockBook,
} from '@/data/mockIslamicBooks';

interface ShelfConfig {
  title: string;
  categorySlug: 'quran' | 'hadith' | 'sunnah' | 'history';
  subtitle: string;
  books: IslamicMockBook[];
}

export function CategoryBookShelves() {
  // Exactly 4 primary categories as specified by user: Qur'an, Hadith, Sunnah, History
  const shelves: ShelfConfig[] = [
    {
      title: "The Noble Qur'an",
      categorySlug: 'quran',
      subtitle: 'Translations, Exegesis & Sciences of Revelation',
      books: QURAN_BOOKS,
    },
    {
      title: 'Prophetic Hadith',
      categorySlug: 'hadith',
      subtitle: 'Authenticated Traditions, Sunan & Daily Adab',
      books: HADITH_BOOKS,
    },
    {
      title: 'Sunnah & Seerah',
      categorySlug: 'sunnah',
      subtitle: 'The Blessed Life & Noble Character of Prophet Muhammad ﷺ',
      books: SUNNAH_BOOKS,
    },
    {
      title: 'Islamic History',
      categorySlug: 'history',
      subtitle: 'Prophetic Chronicles, Caliphates & Scholarly Epochs',
      books: HISTORY_BOOKS,
    },
  ];

  return (
    <div className="py-6 sm:py-10 space-y-12 sm:space-y-16 bg-white dark:bg-black transition-colors">
      {shelves.map((shelf) => (
        <section key={shelf.categorySlug} className="relative">
          <div className="container-page">
            {/* Shelf Header (Apple Books style) */}
            <div className="flex items-end justify-between mb-4 sm:mb-5">
              <div>
                <Link
                  to={`/library?category=${shelf.categorySlug}`}
                  className="group inline-flex items-center gap-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-white"
                >
                  <span>{shelf.title}</span>
                  <ChevronRight
                    size={22}
                    className="text-neutral-400 group-hover:text-ink-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
                <p className="mt-0.5 font-sans text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 hidden sm:block">
                  {shelf.subtitle}
                </p>
              </div>

              <Link
                to={`/library?category=${shelf.categorySlug}`}
                className="text-xs font-semibold uppercase tracking-wider text-[#1B4F72] hover:text-[#154060] dark:text-blue-400 dark:hover:text-blue-300 shrink-0"
              >
                See All
              </Link>
            </div>

            {/* Horizontal Scrollable Shelf of 3D Books */}
            <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory">
                {shelf.books.map((book) => (
                  <div key={book.id} className="snap-start shrink-0">
                    <AppBookCover book={book} size="shelf" showDetails={true} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

