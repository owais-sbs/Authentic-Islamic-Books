import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { hijriPeriods } from '@/data/periods';
import { scholars } from '@/data/scholars';
import { getScholarById } from '@/data/scholars';
import type { Book } from '@/types';
import { cn } from '@/lib/utils';

interface HijriCenturyMenuProps {
  books: Book[];
  onNavigate?: () => void;
}

const CENTURY_LABELS: Record<string, string> = {
  '100-200': 'THE 1ST AND 2ND CENTURIES',
  '201-300': 'THE 3RD CENTURY',
  '301-400': 'THE 4TH CENTURY',
  '401-500': 'THE 5TH CENTURY',
  '501-600': 'THE 6TH CENTURY',
  '601-700': 'THE 7TH CENTURY',
  '701-800': 'THE 8TH CENTURY',
  '801-900': 'THE 9TH CENTURY',
  '901-1000': 'THE 10TH CENTURY',
  '1001-1100': 'THE 11TH CENTURY',
  '1101-1200': 'THE 12TH CENTURY',
  '1201-1300': 'THE 13TH CENTURY',
  '1301-1400': 'THE 14TH CENTURY',
};

/** Hijri nav accordion stops at the 14th century (no Contemporaries). */
const MENU_PERIOD_IDS = new Set(Object.keys(CENTURY_LABELS));

type MenuEntry =
  | { kind: 'book'; id: string; label: string; href: string; year: number; book: Book }
  | { kind: 'scholar'; id: string; label: string; href: string; year: number };

/** Warm the book detail chunk so Hijri → book feels instant. */
function prefetchBookDetail() {
  void import('@/pages/BookDetailPage');
}

/**
 * Clean Hijri century accordion — reference-style.
 * Only used for the Hijri nav dropdown (not Books). Ends at the 14th century.
 */
export function HijriCenturyMenu({ books, onNavigate }: HijriCenturyMenuProps) {
  const sections = useMemo(() => {
    return hijriPeriods
      .filter((period) => MENU_PERIOD_IDS.has(period.id))
      .map((period) => {
      const periodBooks = books
        .filter(
          (b) =>
            b.hijriEnd >= period.start &&
            b.hijriStart <= period.end
        )
        .map((b): MenuEntry => {
          const scholar = b.authorId ? getScholarById(b.authorId) : undefined;
          const year = b.hijriEnd || b.hijriStart;
          const label = scholar
            ? `${b.title} — ${scholar.name} (${year}H)`
            : `${b.title} (${year}H)`;
          return {
            kind: 'book',
            id: b.id,
            label,
            href: `/books/${b.slug}`,
            year,
            book: b,
          };
        });

      const periodScholars = scholars
        .filter((s) => s.diedHijri >= period.start && s.diedHijri <= period.end)
        .map(
          (s): MenuEntry => ({
            kind: 'scholar',
            id: s.id,
            label: `${s.name} (${s.diedHijri}H)`,
            href: `/scholars/${s.slug}`,
            year: s.diedHijri,
          })
        );

      // Prefer books; if none, show scholars for that century (reference style)
      const entries =
        periodBooks.length > 0
          ? periodBooks.sort((a, b) => a.year - b.year)
          : periodScholars.sort((a, b) => a.year - b.year);

      return {
        period,
        title: CENTURY_LABELS[period.id] ?? period.label.toUpperCase(),
        entries,
      };
      });
  }, [books]);

  const defaultOpen =
    sections.find((s) => s.entries.length > 0)?.period.id ?? sections[0]?.period.id ?? null;

  const [openId, setOpenId] = useState<string | null>(defaultOpen);

  return (
    <div className="bg-white text-ink-900">
      {sections.map(({ period, title, entries }) => {
        const open = openId === period.id;
        return (
          <div key={period.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : period.id)}
              className={cn(
                'flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors hover:bg-black/[0.02]',
                open && 'bg-black/[0.015]'
              )}
              aria-expanded={open}
            >
              <span className="font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-ink-900">
                {title}
              </span>
              <ChevronUp
                size={15}
                strokeWidth={2.25}
                className={cn(
                  'shrink-0 text-ink-500 transition-transform duration-200',
                  !open && 'rotate-180'
                )}
                aria-hidden
              />
            </button>

            {open && (
              <ul className="pb-2">
                {entries.length === 0 ? (
                  <li className="px-5 py-2 pl-10 font-sans text-[13px] italic text-ink-400">
                    No works listed for this period yet.
                  </li>
                ) : (
                  entries.map((entry) => (
                    <li key={`${entry.kind}-${entry.id}`}>
                      <Link
                        to={entry.href}
                        state={entry.kind === 'book' ? { book: entry.book } : undefined}
                        onMouseEnter={prefetchBookDetail}
                        onFocus={prefetchBookDetail}
                        onClick={() => {
                          prefetchBookDetail();
                          onNavigate?.();
                        }}
                        className="block px-5 py-2 pl-8 font-sans text-[14px] leading-snug text-ink-700 transition-colors hover:text-ink-900"
                      >
                        {entry.label}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
