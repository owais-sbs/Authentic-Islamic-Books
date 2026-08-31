import { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { publicBookToAdminBook } from '@/lib/bookTransform';
import { fetchAllBooksFromSupabase } from '@/lib/bookApi';
import { isSupabaseConfigured, getSupabase } from '@/lib/supabase';
import { applyAdminMeta } from '@/lib/adminBookMeta';
import {
  mockBooks,
  applyFiltersAndSort,
  getBooksStats,
  PAGE_SIZE,
} from '@/features/books/data/mockBooks';
import type { BooksFilters, BooksSortKey } from '@/features/books/types';

export { PAGE_SIZE, applyFiltersAndSort, getBooksStats };

/** Fired after any successful shared save so open admin lists refetch. */
export const BOOKS_CHANGED_EVENT = 'idl-books-changed';

export function notifyBooksChanged(): void {
  window.dispatchEvent(new Event(BOOKS_CHANGED_EVENT));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Admin book list — Supabase is the shared source of truth for the team.
 * localStorage is only a device cache / offline fallback.
 */
export function useAdminBooks(filters: BooksFilters, sort: BooksSortKey) {
  const [storedVersion, setStoredVersion] = useState(0);
  const [remoteBooks, setRemoteBooks] = useState<ReturnType<typeof publicBookToAdminBook>[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(isSupabaseConfigured());
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [hasAuthSession, setHasAuthSession] = useState(true);

  const loadRemote = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setRemoteBooks([]);
      setRemoteLoading(false);
      setHasAuthSession(false);
      return;
    }
    setRemoteLoading(true);
    setRemoteError(null);
    try {
      const { data: sessionData } = await getSupabase().auth.getSession();
      const authed = Boolean(sessionData.session);
      setHasAuthSession(authed);

      const books = await fetchAllBooksFromSupabase();
      setRemoteBooks(books);

      if (!authed) {
        setRemoteError(
          'Signed in locally only — you can only see published books from the shared library. Sign out and sign in with Supabase Auth to see all team drafts and imports.'
        );
      }
    } catch (err) {
      setRemoteError(err instanceof Error ? err.message : 'Failed to load shared books');
      setRemoteBooks([]);
    } finally {
      setRemoteLoading(false);
    }
  }, []);

  useEffect(() => {
    const refresh = () => setStoredVersion((v) => v + 1);
    window.addEventListener('storage', refresh);
    window.addEventListener(BOOKS_CHANGED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') refresh();
    });
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(BOOKS_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  useEffect(() => {
    void loadRemote();
  }, [storedVersion, loadRemote]);

  const allBooks = useMemo(() => {
    const byId = new Map<string, ReturnType<typeof publicBookToAdminBook>>();

    // When cloud is configured and we have a session, prefer remote only
    // (plus mock seeds). Avoid leaking another device's private local-only drafts
    // as if they were shared — and avoid hiding shared books behind local cache.
    if (isSupabaseConfigured() && hasAuthSession && remoteBooks.length >= 0 && !remoteLoading) {
      mockBooks.forEach((b) => byId.set(b.id, b));
      remoteBooks.forEach((b) => byId.set(b.id, b));
    } else {
      mockBooks.forEach((b) => byId.set(b.id, b));
      getAllImportedBooks().forEach((pb) => {
        byId.set(pb.id, publicBookToAdminBook(pb));
      });
      remoteBooks.forEach((b) => byId.set(b.id, b));
    }

    return applyAdminMeta(Array.from(byId.values())).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [storedVersion, remoteBooks, hasAuthSession, remoteLoading]);

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

  return {
    allBooks,
    filtered,
    stats,
    refresh,
    remoteLoading,
    remoteError,
    isCloudSynced: isSupabaseConfigured() && hasAuthSession,
  };
}
