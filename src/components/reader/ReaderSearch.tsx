import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, User, Tag } from 'lucide-react';
import type { BookSearchResult } from '@/hooks/useBookSearch';

interface ReaderSearchProps {
  open: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (q: string) => void;
  results: BookSearchResult[];
  resultCount: number;
  onNavigate: (sectionId: string) => void;
}

export function ReaderSearch({
  open,
  onClose,
  query,
  onQueryChange,
  results,
  resultCount,
  onNavigate,
}: ReaderSearchProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink-900/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-20 z-50 w-[90vw] max-w-xl -translate-x-1/2 rounded-xl bg-cream shadow-2xl border border-line overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Search in book"
          >
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search size={18} className="text-ink-400" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search in this book..."
                className="flex-1 bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="rounded-md p-1 text-ink-400 transition-colors hover:bg-paper hover:text-ink-700"
                aria-label="Close search"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {query.trim() === '' ? (
                <div className="px-4 py-8 text-center">
                  <Search size={32} className="mx-auto mb-3 text-ink-300" />
                  <p className="text-sm text-ink-500">Search for any word or phrase within this book.</p>
                </div>
              ) : resultCount === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-ink-500">No results found for "{query}"</p>
                </div>
              ) : (
                <>
                  <div className="border-b border-line bg-paper px-4 py-2 text-xs font-medium text-ink-500">
                    {resultCount} {resultCount === 1 ? 'result' : 'results'}
                  </div>
                  <ul className="divide-y divide-line">
                    {results.map((result, i) => (
                      <li key={i}>
                        <button
                          onClick={() => {
                            onNavigate(result.sectionId);
                            onClose();
                          }}
                          className="block w-full px-4 py-3 text-left transition-colors hover:bg-paper"
                        >
                          <p className="text-xs font-medium text-accent-dark">{result.chapterTitle}</p>
                          <p className="text-sm font-medium text-ink-900 mt-0.5">{result.sectionTitle}</p>
                          <p className="text-sm text-ink-500 mt-1 line-clamp-2">{result.excerpt}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
