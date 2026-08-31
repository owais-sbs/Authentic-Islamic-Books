import { useState, useEffect, useMemo } from 'react';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { publicBookToAdminBook } from '@/lib/bookTransform';
import { fetchAllBooksFromSupabase } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { applyAdminMeta } from '@/lib/adminBookMeta';
import {
  mockBooks,
  applyFiltersAndSort,
  getBooksStats,
  PAGE_SIZE,
} from '@/features/books/data/mockBooks';
import type { BooksFilters, BooksSortKey } from '@/features/books/types';

export { PAGE_SIZE, applyFiltersAndSort, getBooksStats };

export function useAdminBooks(filters: BooksFilters, sort: BooksSortKey) {
  const [storedVersion, setStoredVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setStoredVersion((v) => v + 1);
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  const [remoteBooks, setRemoteBooks] = useState<ReturnType<typeof publicBookToAdminBook>[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    fetchAllBooksFromSupabase()
      .then(setRemoteBooks)
      .catch(() => setRemoteBooks([]));
  }, [storedVersion]);

  const allBooks = useMemo(() => {
    const byId = new Map<string, ReturnType<typeof publicBookToAdminBook>>();

    mockBooks.forEach((b) => byId.set(b.id, b));

    getAllImportedBooks().forEach((pb) => {
      byId.set(pb.id, publicBookToAdminBook(pb));
    });

    remoteBooks.forEach((b) => byId.set(b.id, b));

    return applyAdminMeta(Array.from(byId.values())).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [storedVersion, remoteBooks]);

  const filtered = useMemo(() => {
    let list = allBooks;

    if (!filters.status) {
      list = list.filter((b) => b.status !== 'archived');
    }

    return applyFiltersAndSort(list, filters, sort);
  }, [allBooks, filters, sort]);

  const stats = useMemo(() => {
    const base = getBooksStats(allBooks);
    return {
      ...base,
      archived: allBooks.filter((b) => b.status === 'archived').length,
    };
  }, [allBooks]);

  function refresh() {
    setStoredVersion((v) => v + 1);
  }

  return { allBooks, filtered, stats, refresh };
}
