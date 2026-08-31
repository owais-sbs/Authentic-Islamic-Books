import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { books as staticBooks } from '@/data/books';
import { hijriPeriods } from '@/data/periods';
import { categories } from '@/data/categories';
import { scholars as allScholars } from '@/data/scholars';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { getSupabasePublishedCache, refreshSupabasePublishedCache } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';

export type SortOption = 'newest' | 'oldest' | 'az' | 'za' | 'popular' | 'recent';

export interface FilterState {
  periods: string[];
  categories: string[];
  scholars: string[];
  query: string;
  sort: SortOption;
}

export function useLibraryFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const periodsParam = searchParams.get('period') ? searchParams.get('period')!.split(',') : [];
  const categoriesParam = searchParams.get('category') ? searchParams.get('category')!.split(',') : [];
  const scholarsParam = searchParams.get('scholar') ? searchParams.get('scholar')!.split(',') : [];
  const queryParam = searchParams.get('q') || '';
  const sortParam = (searchParams.get('sort') as SortOption) || 'popular';

  const [sort, setSort] = useState<SortOption>(sortParam);

  // Merge static + imported books, re-computing when store updates
  const [importedBooks, setImportedBooks] = useState(getAllImportedBooks);
  const [supabaseBooks, setSupabaseBooks] = useState(getSupabasePublishedCache);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    refreshSupabasePublishedCache().then(setSupabaseBooks).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => {
      setImportedBooks(getAllImportedBooks());
      if (isSupabaseConfigured()) {
        refreshSupabasePublishedCache().then(setSupabaseBooks).catch(() => {});
      }
    };
    window.addEventListener('storage', handler);
    window.addEventListener('idl-books-changed', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('idl-books-changed', handler);
      window.removeEventListener('focus', handler);
    };
  }, []);

  const allBooks = useMemo(
    () => {
      const byId = new Map(staticBooks.map((b) => [b.id, b]));

      // Device cache (may include unpublished drafts only this browser created)
      importedBooks.forEach((b) => {
        byId.set(b.id, b);
      });

      // Shared published books from Supabase — override local copies with cloud data
      supabaseBooks.forEach((b) => {
        byId.set(b.id, b);
      });

      return Array.from(byId.values());
    },
    [importedBooks, supabaseBooks]
  );

  const filters: FilterState = {
    periods: periodsParam,
    categories: categoriesParam,
    scholars: scholarsParam,
    query: queryParam,
    sort,
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    const next = new URLSearchParams(searchParams);
    const merged = { ...filters, ...updates };

    if (merged.periods.length) next.set('period', merged.periods.join(','));
    else next.delete('period');

    if (merged.categories.length) next.set('category', merged.categories.join(','));
    else next.delete('category');

    if (merged.scholars.length) next.set('scholar', merged.scholars.join(','));
    else next.delete('scholar');

    if (merged.query) next.set('q', merged.query);
    else next.delete('q');

    if (merged.sort && merged.sort !== 'popular') next.set('sort', merged.sort);
    else next.delete('sort');

    setSearchParams(next, { replace: true });
    if (updates.sort) setSort(updates.sort);
  };

  const togglePeriod = (periodId: string) => {
    const current = new Set(filters.periods);
    current.has(periodId) ? current.delete(periodId) : current.add(periodId);
    updateFilters({ periods: Array.from(current) });
  };

  const toggleCategory = (categorySlug: string) => {
    const current = new Set(filters.categories);
    current.has(categorySlug) ? current.delete(categorySlug) : current.add(categorySlug);
    updateFilters({ categories: Array.from(current) });
  };

  const toggleScholar = (scholarSlug: string) => {
    const current = new Set(filters.scholars);
    current.has(scholarSlug) ? current.delete(scholarSlug) : current.add(scholarSlug);
    updateFilters({ scholars: Array.from(current) });
  };

  const setQuery = (q: string) => updateFilters({ query: q });

  const clearAll = () => {
    setSearchParams({}, { replace: true });
    setSort('popular');
  };

  const filteredBooks = useMemo(() => {
    let result = [...allBooks];

    if (filters.periods.length) {
      result = result.filter((book) =>
        filters.periods.some((pId) => {
          const period = hijriPeriods.find((p) => p.id === pId);
          if (!period) return false;
          return book.hijriStart >= period.start && book.hijriEnd <= period.end;
        })
      );
    }

    if (filters.categories.length) {
      result = result.filter((book) =>
        book.categoryIds.some((catId) => {
          const cat = categories.find((c) => c.id === catId);
          return cat && filters.categories.includes(cat.slug);
        })
      );
    }

    if (filters.scholars.length) {
      result = result.filter((book) => {
        const scholar = allScholars.find((s) => s.id === book.authorId);
        return scholar && filters.scholars.includes(scholar.slug);
      });
    }

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (book) =>
          book.title.toLowerCase().includes(q) ||
          book.description.toLowerCase().includes(q) ||
          book.subtitle?.toLowerCase().includes(q)
      );
    }

    switch (filters.sort) {
      case 'az':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'za':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
        result.sort((a, b) => (b.hijriEnd || 0) - (a.hijriEnd || 0));
        break;
      case 'oldest':
        result.sort((a, b) => (a.hijriStart || 0) - (b.hijriStart || 0));
        break;
      case 'recent':
        result.sort((a, b) => (b.addedDate || '').localeCompare(a.addedDate || ''));
        break;
      case 'popular':
      default:
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
    }

    return result;
  }, [filters, allBooks]);

  const hasActiveFilters =
    filters.periods.length > 0 ||
    filters.categories.length > 0 ||
    filters.scholars.length > 0 ||
    filters.query.length > 0;

  return {
    filters,
    filteredBooks,
    togglePeriod,
    toggleCategory,
    toggleScholar,
    setQuery,
    setSort,
    clearAll,
    hasActiveFilters,
  };
}
