import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { AppBookCover } from '@/components/book/AppBookCover';
import { usePublicBooks } from '@/hooks/usePublicBooks';
import type { IslamicMockBook } from '@/data/mockIslamicBooks';

interface ShelfConfig {
  title: string;
  categorySlug: 'quran' | 'hadith' | 'sunnah' | 'history';
  subtitle: string;
  books: IslamicMockBook[];
}

export function CategoryBookShelves() {
  const { quranBooks, hadithBooks, sunnahBooks, historyBooks } = usePublicBooks();

  // Exactly 4 primary categories: Qur'an, Hadith, Sunnah, History
  const shelves: ShelfConfig[] = [
    {
      title: "The Noble Qur'an",
      categorySlug: 'quran',
      subtitle: 'Translations, Exegesis & Sciences of Revelation',
      books: quranBooks,
    },
    {
      title: 'Prophetic Hadith',
      categorySlug: 'hadith',
      subtitle: 'Authenticated Traditions, Sunan & Daily Adab',
      books: hadithBooks,
    },
    {
      title: 'Sunnah & Seerah',
      categorySlug: 'sunnah',
      subtitle: 'The Blessed Life & Noble Character of Prophet Muhammad ﷺ',
      books: sunnahBooks,
    },
    {
      title: 'Islamic History',
      categorySlug: 'history',
      subtitle: 'Prophetic Chronicles, Caliphates & Scholarly Epochs',
      books: historyBooks,
    },
  ];

  return (
    <div className="pt-2 pb-6 sm:pt-4 sm:pb-8 space-y-8 sm:space-y-12 bg-white dark:bg-black transition-colors">
      {shelves.map((shelf) => (
        <section key={shelf.categorySlug} className="relative">
          <div className="container-page">
            {/* Shelf Header */}
            <div className="flex items-end justify-between mb-4 sm:mb-5">
              <div>
                <Link
                  to={`/library?category=${shelf.categorySlug}`}
                  className="group inline-flex items-center gap-1 font-sans text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-white"
                >
                  <span>{shelf.title}</span>
                  <ChevronRight
                    size={22}
                    className="text-neutral-400 group-hover:text-ink-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all"
                  />
                </Link>
                <p className="mt-0.5 font-sans text-xs sm:text-sm text-[#64748B] dark:text-neutral-400 hidden sm:block">
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

            {/* Horizontal Scrollable Shelf */}
            <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6">
              <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-2 pt-2 scrollbar-none scrollbar-hide no-scrollbar snap-x snap-mandatory">
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
