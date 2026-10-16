import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Scholar } from '@/types';
import { getBooksByAuthor } from '@/data/books';
import { formatHijriRange } from '@/data/periods';
import { Badge } from '@/components/ui/Badge';
import { useRevealProps } from '@/components/motion/Reveal';

interface ScholarCardProps {
  scholar: Scholar;
  /** Position in its grid — staggers the scroll reveal across a row */
  index?: number;
}

export function ScholarCard({ scholar, index = 0 }: ScholarCardProps) {
  const bookCount = getBooksByAuthor(scholar.id).length;
  const reveal = useRevealProps((index % 4) * 0.07);

  return (
    <motion.article
      {...reveal}
      whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream transition-[border-color,box-shadow] duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-ink-900/5"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-900/5">
        {scholar.imageUrl ? (
          <img
            src={scholar.imageUrl}
            alt={scholar.name}
            loading="lazy"
            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-serif text-3xl font-bold text-ink-400 bg-cream">
            {scholar.name.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <Badge variant="muted" className="bg-cream/90 backdrop-blur-sm">
            {formatHijriRange(scholar.bornHijri, scholar.diedHijri)}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-semibold text-ink-900">{scholar.name}</h3>
        <p className="mt-1 text-xs text-ink-400">{scholar.bornPlace || '—'}</p>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-500 line-clamp-2 flex-1">{scholar.shortBio || scholar.fullBio || 'No biography available.'}</p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="flex items-center gap-1.5 text-xs text-ink-500">
            <BookOpen size={13} /> {bookCount} {bookCount === 1 ? 'book' : 'books'}
          </span>
          <Link
            to={`/scholars/${scholar.slug || scholar.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-900 transition-colors hover:text-accent-dark"
          >
            View Scholar <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
