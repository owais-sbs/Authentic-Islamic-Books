import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Scholar } from '@/types';
import { getBooksByAuthor } from '@/data/books';
import { formatHijriRange } from '@/data/periods';
import { Badge } from '@/components/ui/Badge';

interface ScholarCardProps {
  scholar: Scholar;
}

export function ScholarCard({ scholar }: ScholarCardProps) {
  const bookCount = getBooksByAuthor(scholar.id).length;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-cream transition-all hover:border-line-strong hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink-900/5">
        <img
          src={scholar.imageUrl}
          alt={scholar.name}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <Badge variant="muted" className="bg-cream/90 backdrop-blur-sm">
            {formatHijriRange(scholar.bornHijri, scholar.diedHijri)}
          </Badge>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-semibold text-ink-900">{scholar.name}</h3>
        <p className="mt-1 text-xs text-ink-400">{scholar.bornPlace}</p>
        <p className="mt-2.5 text-sm leading-relaxed text-ink-500 line-clamp-2 flex-1">{scholar.shortBio}</p>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
          <span className="flex items-center gap-1.5 text-xs text-ink-500">
            <BookOpen size={13} /> {bookCount} {bookCount === 1 ? 'book' : 'books'}
          </span>
          <Link
            to={`/scholars/${scholar.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-ink-900 transition-colors hover:text-accent-dark"
          >
            View Scholar <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
