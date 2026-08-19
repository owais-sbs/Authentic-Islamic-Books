import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Book } from '@/types';
import { cn } from '@/lib/utils';

interface TableOfContentsProps {
  book: Book;
  activeSectionId: string | null;
  onNavigate: (sectionId: string) => void;
  className?: string;
}

export function flattenSections(book: Book): { id: string; number: string; title: string; parentId?: string }[] {
  const result: { id: string; number: string; title: string; parentId?: string }[] = [];

  for (const chapter of book.chapters) {
    result.push({ id: chapter.id, number: chapter.number, title: chapter.title });
    for (const section of chapter.sections) {
      result.push({ id: section.id, number: section.number, title: section.title, parentId: chapter.id });
      if (section.subsections) {
        for (const sub of section.subsections) {
          result.push({ id: sub.id, number: sub.number, title: sub.title, parentId: section.id });
        }
      }
    }
  }

  return result;
}

export function TableOfContents({ book, activeSectionId, onNavigate, className }: TableOfContentsProps) {
  const initialExpanded = useMemo(() => {
    const expanded: Record<string, boolean> = {};
    for (const chapter of book.chapters) {
      expanded[chapter.id] = true;
    }
    return expanded;
  }, [book]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialExpanded);

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(sectionId);
  };

  return (
    <nav className={cn('toc-scroll overflow-y-auto text-sm', className)} aria-label="Table of Contents">

      {/* Introduction */}
      {book.introduction && (
        <button
          onClick={(e) => handleClick('introduction', e)}
          className={cn(
            'mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-all',
            activeSectionId === 'introduction'
              ? 'bg-accent/15 border border-accent/30 text-accent font-medium shadow-sm'
              : 'text-ink-400 hover:bg-ink-800 hover:text-ink-200 border border-transparent'
          )}
        >
          {activeSectionId === 'introduction' ? (
            <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-ink-600 shrink-0" />
          )}
          <span className="text-[13px]">Introduction</span>
        </button>
      )}

      {book.chapters.map((chapter) => {
        const isExpanded = expanded[chapter.id];
        const isActive = activeSectionId === chapter.id;

        return (
          <div key={chapter.id} className="mb-1">
            {/* Chapter row */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggle(chapter.id)}
                className="flex h-7 w-5 shrink-0 items-center justify-center text-ink-600 transition-colors hover:text-accent"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded
                  ? <ChevronDown size={13} />
                  : <ChevronRight size={13} />
                }
              </button>
              <button
                onClick={(e) => handleClick(chapter.id, e)}
                className={cn(
                  'flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left transition-all min-w-0',
                  isActive
                    ? 'bg-accent/15 border border-accent/30 text-accent font-semibold shadow-sm'
                    : 'border border-transparent text-white font-semibold hover:bg-ink-700 hover:text-white'
                )}
              >
                <span className={cn('text-[10px] tabular-nums font-bold shrink-0', isActive ? 'text-accent/70' : 'text-ink-400')}>
                  {chapter.number}.
                </span>
                <span className={cn('text-[13px] leading-snug', isActive ? 'text-accent' : 'text-white')}>{chapter.title}</span>
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  {/* Indented sections — left border gold when chapter active */}
                  <div className={cn('ml-4 mt-0.5 border-l pl-2', isActive ? 'border-accent/40' : 'border-ink-700')}>
                    {chapter.sections.map((section) => {
                      const sectionExpanded = expanded[section.id];
                      const hasSubs = section.subsections && section.subsections.length > 0;
                      const sectionActive = activeSectionId === section.id;

                      return (
                        <div key={section.id} className="mb-0.5">
                          <div className="flex items-center gap-1">
                            {hasSubs && (
                              <button
                                onClick={() => toggle(section.id)}
                                className="flex h-6 w-4 shrink-0 items-center justify-center text-ink-600 transition-colors hover:text-accent"
                              >
                                {sectionExpanded
                                  ? <ChevronDown size={11} />
                                  : <ChevronRight size={11} />
                                }
                              </button>
                            )}
                            <button
                              onClick={(e) => handleClick(section.id, e)}
                              className={cn(
                                'flex-1 rounded-md py-1.5 text-left transition-all',
                                hasSubs ? 'px-1' : 'pl-5 px-2',
                                sectionActive
                                  ? 'bg-accent/12 text-accent font-medium'
                                  : 'text-ink-300 hover:bg-ink-700/70 hover:text-white'
                              )}
                            >
                              <span className={cn('text-[10px] tabular-nums mr-1.5', sectionActive ? 'text-accent/60' : 'text-ink-500')}>
                                {section.number}
                              </span>
                              <span className={cn('text-[12px] leading-snug', sectionActive ? 'text-accent' : 'text-ink-300')}>{section.title}</span>
                            </button>
                          </div>

                          {hasSubs && (
                            <AnimatePresence initial={false}>
                              {sectionExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className={cn('ml-4 border-l pl-2', sectionActive ? 'border-accent/30' : 'border-ink-700/60')}>
                                    {section.subsections!.map((sub) => {
                                      const subActive = activeSectionId === sub.id;
                                      return (
                                        <button
                                          key={sub.id}
                                          onClick={(e) => handleClick(sub.id, e)}
                                          className={cn(
                                            'block w-full rounded-md px-2 py-1.5 text-left transition-all',
                                            subActive
                                              ? 'bg-accent/10 text-accent font-medium'
                                              : 'text-ink-500 hover:bg-ink-800/60 hover:text-ink-300'
                                          )}
                                        >
                                          <span className={cn('text-[10px] tabular-nums mr-1.5', subActive ? 'text-accent/60' : 'text-ink-700')}>
                                            {sub.number}
                                          </span>
                                          <span className="text-[11px] leading-snug">{sub.title}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
