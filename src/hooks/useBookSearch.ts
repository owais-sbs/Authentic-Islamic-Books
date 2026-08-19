import { useState, useMemo } from 'react';
import type { Book } from '@/types';

export interface BookSearchResult {
  sectionId: string;
  sectionTitle: string;
  chapterTitle: string;
  excerpt: string;
  matchIndex: number;
}

export function useBookSearch(book: Book) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo<BookSearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const found: BookSearchResult[] = [];

    for (const chapter of book.chapters) {
      for (const section of chapter.sections) {
        const searchSection = (
          sec: typeof section,
          chapterTitle: string
        ): void => {
          if (!sec.content) return;
          for (const block of sec.content) {
            let text = '';
            if (block.type === 'paragraph' || block.type === 'quote' || block.type === 'heading') {
              text = block.text;
            } else if (block.type === 'list') {
              text = block.items.join(' ');
            } else if (block.type === 'reference' || block.type === 'footnote') {
              text = block.text;
            }

            const lowerText = text.toLowerCase();
            const idx = lowerText.indexOf(q);
            if (idx !== -1) {
              const start = Math.max(0, idx - 40);
              const end = Math.min(text.length, idx + q.length + 60);
              const excerpt =
                (start > 0 ? '...' : '') +
                text.slice(start, end) +
                (end < text.length ? '...' : '');
              found.push({
                sectionId: sec.id,
                sectionTitle: `${sec.number} ${sec.title}`,
                chapterTitle: chapter.title,
                excerpt,
                matchIndex: idx,
              });
            }
          }

          if (sec.subsections) {
            sec.subsections.forEach((sub) => searchSection(sub, chapterTitle));
          }
        };

        searchSection(section, chapter.title);
      }
    }

    return found;
  }, [book, query]);

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    resultCount: results.length,
  };
}
