import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Check } from 'lucide-react';
import { useSavedBooks } from '@/hooks/useSavedBooks';
import { cn } from '@/lib/utils';

interface BookBookmarkButtonProps {
  slug: string;
  title: string;
  coverColor: string;
  coverUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function BookBookmarkButton({
  slug,
  title,
  coverColor,
  coverUrl,
  size = 'md',
  className,
  showLabel = false,
}: BookBookmarkButtonProps) {
  const { isBookSaved, toggleSavedBook } = useSavedBooks();
  const saved = isBookSaved(slug);
  const [animating, setAnimating] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const nowSaved = toggleSavedBook({ slug, title, coverColor, coverUrl });

    if (nowSaved) {
      setAnimating(true);
      setJustSaved(true);
      setTimeout(() => {
        setAnimating(false);
        setJustSaved(false);
      }, 900);
    }
  }

  return (
    <div className={cn('relative inline-flex w-full sm:w-auto', className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={saved ? 'Remove from saved books' : 'Save book'}
        className={cn(
          'relative inline-flex w-full items-center justify-center gap-2 rounded-lg transition-all',
          showLabel ? 'px-4 py-2.5 text-sm font-medium' : 'p-2',
          saved
            ? 'bg-accent/15 text-accent-dark hover:bg-accent/25'
            : 'bg-cream border border-line text-ink-600 hover:border-accent/40 hover:text-accent-dark'
        )}
      >
        <span className="relative flex h-5 w-5 items-center justify-center">
          <AnimatePresence mode="wait">
            {justSaved ? (
              <motion.span
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="text-accent"
              >
                <Check size={iconSize} />
              </motion.span>
            ) : (
              <motion.span
                key="bookmark"
                initial={{ scale: 1 }}
                animate={{ scale: saved ? 1.1 : 1 }}
                className={saved ? 'text-accent' : ''}
              >
                <Bookmark size={iconSize} fill={saved ? 'currentColor' : 'none'} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {showLabel && (saved ? 'Saved' : 'Save Book')}
      </button>

      {/* Fly-up mini cover animation */}
      <AnimatePresence>
        {animating && (
          <motion.div
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -48, scale: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2"
          >
            <div
              className="h-10 w-7 rounded-sm shadow-lg overflow-hidden border border-white/20"
              style={{ backgroundColor: coverColor }}
            >
              {coverUrl && (
                <img src={coverUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
