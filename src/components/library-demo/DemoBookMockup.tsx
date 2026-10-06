import type { DemoCatalogItem } from '@/data/libraryDemo';

interface DemoBookMockupProps {
  book: DemoCatalogItem;
}

/** Single hardcover book mockup for library catalog cards. */
export function DemoBookMockup({ book }: DemoBookMockupProps) {
  const cover = book.coverColor ?? '#1A3A2A';
  const edge = book.coverEdge ?? '#0F2418';

  return (
    <div
      className="relative flex h-full w-full items-center justify-center px-6 py-8 sm:px-8 sm:py-10"
      style={{
        background:
          'radial-gradient(ellipse at 50% 40%, #EDE6DA 0%, #E0D6C6 55%, #D4C9B6 100%)',
      }}
    >
      <div
        className="relative w-[42%] max-w-[168px] min-w-[118px] transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-[1.02]"
        style={{
          aspectRatio: '2 / 3.05',
          filter: 'drop-shadow(0 18px 28px rgba(20,30,24,0.28))',
        }}
      >
        {/* Spine */}
        <div
          className="absolute inset-y-0 left-0 w-[9px] rounded-l-[3px]"
          style={{
            background: `linear-gradient(90deg, #0A1A10, ${cover} 40%, ${edge})`,
            boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.35)',
          }}
        />

        {/* Front cover */}
        <div
          className="absolute inset-0 left-[7px] right-[6px] rounded-r-[7px] border border-white/10"
          style={{
            background: `linear-gradient(145deg, rgba(255,255,255,0.07), transparent 42%), linear-gradient(180deg, ${cover}, ${edge})`,
          }}
        >
          <div className="flex h-full flex-col items-center px-[11%] py-[10%] text-center text-[#F7F1E4]">
            <div
              className="flex h-full w-full flex-col items-center border px-[8%] py-[12%]"
              style={{ borderColor: 'rgba(196,163,90,0.45)' }}
            >
              <span
                className="mt-1 block h-1.5 w-1.5 rotate-45"
                style={{ background: '#C4A35A' }}
                aria-hidden
              />
              <p className="mt-2.5 font-sans text-[6px] font-semibold uppercase tracking-[0.18em] text-[#C4A35A] sm:text-[7px]">
                Islamic Digital Library
              </p>
              <h3 className="mt-2 font-cinzel text-[9px] font-semibold leading-snug tracking-wide sm:text-[10px]">
                {book.title}
              </h3>
              <div
                className="my-2 h-px w-6"
                style={{
                  background: 'linear-gradient(90deg, transparent, #C4A35A, transparent)',
                }}
              />
              {book.coverArabic && (
                <p
                  dir="rtl"
                  lang="ar"
                  className="text-[11px] leading-relaxed opacity-90 sm:text-[12px]"
                  style={{ fontFamily: "Amiri, 'Traditional Arabic', serif" }}
                >
                  {book.coverArabic}
                </p>
              )}
              <p className="mt-1.5 line-clamp-2 font-serif text-[7px] italic leading-snug text-white/70 sm:text-[8px]">
                {book.coverSubtitle ?? book.formatName}
              </p>
              <p className="mt-auto pt-2 font-sans text-[6px] font-semibold uppercase tracking-[0.14em] text-[#C4A35A] sm:text-[7px]">
                Book {book.number}
              </p>
            </div>
          </div>
        </div>

        {/* Page edges */}
        <div
          className="absolute right-0 top-[6px] bottom-[6px] w-[6px] rounded-r-[2px]"
          style={{
            background:
              'repeating-linear-gradient(to right, #EDE6DA 0px, #EDE6DA 1px, #D9D0C0 1px, #D9D0C0 2px)',
            boxShadow: '2px 0 5px rgba(0,0,0,0.12)',
          }}
          aria-hidden
        />
      </div>

      <div className="pointer-events-none absolute left-3 top-3">
        <span className="rounded-md bg-ink-900/55 px-2 py-0.5 font-sans text-[9px] font-semibold tracking-[0.14em] text-accent-light backdrop-blur-sm">
          {book.accentLabel}
        </span>
      </div>
    </div>
  );
}
