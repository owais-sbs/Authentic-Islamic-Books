import { useState, useMemo, useEffect } from 'react';
import { books as allBooks } from '@/data/books';
import { scholars as allScholars } from '@/data/scholars';
import { categories } from '@/data/categories';

export interface SearchResult {
  type: 'book' | 'scholar' | 'category';
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  href: string;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const q = query.toLowerCase().trim();

    const bookResults: SearchResult[] = allBooks
      .filter(
        (book) =>
          book.title.toLowerCase().includes(q) ||
          book.subtitle?.toLowerCase().includes(q) ||
          book.description.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map((book) => ({
        type: 'book' as const,
        id: book.id,
        title: book.title,
        subtitle: book.subtitle || book.description.slice(0, 60) + '...',
        slug: book.slug,
        href: `/books/${book.slug}`,
      }));

    const scholarResults: SearchResult[] = allScholars
      .filter(
        (scholar) =>
          scholar.name.toLowerCase().includes(q) ||
          scholar.shortBio.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((scholar) => ({
        type: 'scholar' as const,
        id: scholar.id,
        title: scholar.name,
        subtitle: scholar.shortBio,
        slug: scholar.slug,
        href: `/scholars/${scholar.slug}`,
      }));

    const categoryResults: SearchResult[] = categories
      .filter(
        (cat) =>
          cat.name.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((cat) => ({
        type: 'category' as const,
        id: cat.id,
        title: cat.name,
        subtitle: cat.description,
        slug: cat.slug,
        href: `/library?category=${cat.slug}`,
      }));

    setResults([...bookResults, ...scholarResults, ...categoryResults]);
    setIsSearching(false);
  }, [query]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const result of results) {
      if (!groups[result.type]) groups[result.type] = [];
      groups[result.type].push(result);
    }
    return groups;
  }, [results]);

  return {
    query,
    setQuery,
    results,
    groupedResults,
    isSearching,
    hasQuery: query.trim().length > 0,
  };
}
