import type { Book } from '@/types';
import { BookCover } from '@/components/book/BookCover';
import { cn } from '@/lib/utils';

interface HeroBookStackProps {
  books: Book[];
  className?: string;
}

/** Layered 3D-style book composition for the hero. Uses real covers when available. */
export function HeroBookStack({ books, className }: HeroBookStackProps) {
  const display = books.slice(0, 5);
  const placeholders: Array<{ title: string; color: string; arabic?: string }> = [
    { title: 'Tafsir', color: '#104C3B', arabic: 'تفسير' },
    { title: 'Hadith', color: '#5C1F1F', arabic: 'حديث' },
    { title: 'Seerah', color: '#1E3A5F', arabic: 'سيرة' },
    { title: 'Fiqh', color: '#347F77', arabic: 'فقه' },
    { title: 'Aqeedah', color: '#3D2B1F', arabic: 'عقيدة' },
  ];

  while (display.length < 3) {
    const p = placeholders[display.length];
    display.push({
      id: `hero-placeholder-${display.length}`,
      slug: 'library',
      title: p.title,
      description: '',
      coverColor: p.color,
      authorId: '',
      hijriStart: 0,
      hijriEnd: 0,
      categoryIds: [],
      chapters: [],
    } as Book);
  }

  const positions = [
    'z-30 translate-y-2 sm:translate-y-4 rotate-[-8deg] scale-95',
    'z-40 translate-y-0 rotate-[2deg] scale-110',
    'z-20 translate-y-3 sm:translate-y-6 rotate-[10deg] scale-95',
    'z-10 -translate-x-8 translate-y-8 rotate-[-14deg] scale-90 hidden lg:block',
    'z-10 translate-x-10 translate-y-10 rotate-[16deg] scale-90 hidden xl:block',
  ];

  return (
    <div
      className={cn(
        'relative mx-auto flex h-[320px] w-full max-w-md items-center justify-center sm:h-[400px] lg:h-[440px]',
        className,
      )}
      style={{ perspective: '1200px' }}
      aria-hidden={display.every((b) => b.id.startsWith('hero-placeholder'))}
    >
      {/* Soft ground shadow */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 h-10 w-3/4 -translate-x-1/2 rounded-[100%] bg-black/30 blur-2xl" />

      <div className="relative flex h-full w-full items-center justify-center">
        {display.slice(0, 5).map((book, i) => (
          <div
            key={book.id}
            className={cn(
              'absolute transition-transform duration-500 ease-out hover:-translate-y-2',
              positions[i] ?? positions[0],
            )}
            style={{
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 22px 28px rgba(0,0,0,0.35))',
            }}
          >
            <div className="relative" style={{ transform: 'rotateY(-12deg)' }}>
              <BookCover book={book} size="lg" className="!w-[140px] !h-[200px] sm:!w-[160px] sm:!h-[228px]" />
              {/* Page block edge */}
              <div
                className="absolute right-[-7px] top-[6px] bottom-[6px] w-[7px] rounded-r-sm"
                style={{
                  background:
                    'repeating-linear-gradient(to right, #F3ECDD 0px, #F3ECDD 1px, #D9CFBE 1px, #D9CFBE 2px)',
                  boxShadow: '2px 0 6px rgba(0,0,0,0.18)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
