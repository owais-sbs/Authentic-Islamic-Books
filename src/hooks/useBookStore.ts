/**
 * useBookStore
 * localStorage-backed store for books imported via the admin panel.
 * Imported books are stored as the same public Book type so the library
 * can display them without any transformation.
 *
 * When Supabase is connected, replace the localStorage read/write with
 * Supabase queries — the hook interface stays the same.
 */

import { useState, useCallback } from 'react';
import type { Book } from '@/types';

const STORAGE_KEY = 'idl_imported_books';

function readStore(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Book[];
  } catch {
    return [];
  }
}

function writeStore(books: Book[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch {
    // storage quota exceeded — fail silently
  }
}

// ─── Module-level cache so all hook instances share the same data ──────────────
let _cache: Book[] | null = null;
const _listeners: Set<() => void> = new Set();

function getCache(): Book[] {
  if (!_cache) _cache = readStore();
  return _cache;
}

function setCache(books: Book[]): void {
  _cache = books;
  writeStore(books);
  // Dispatch storage event so useLibraryFilters updates on the same page
  window.dispatchEvent(new Event('storage'));
  _listeners.forEach((fn) => fn());
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useBookStore() {
  const [, forceUpdate] = useState(0);

  // Subscribe to cross-instance updates
  const subscribe = useCallback(() => {
    const fn = () => forceUpdate((n) => n + 1);
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }, []);

  // Run subscription once on mount
  useState(() => {
    const unsub = subscribe();
    return unsub;
  });

  function addBook(book: Book): void {
    const current = getCache();
    const without = current.filter((b) => b.id !== book.id);
    setCache([book, ...without]);
  }

  function updateBook(id: string, patch: Partial<Book>): void {
    const current = getCache();
    setCache(current.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function removeBook(id: string): void {
    setCache(getCache().filter((b) => b.id !== id));
  }

  function getAll(): Book[] {
    return getCache();
  }

  function getById(id: string): Book | undefined {
    return getCache().find((b) => b.id === id);
  }

  return { addBook, updateBook, removeBook, getAll, getById };
}

// ─── Standalone helpers (usable outside React) ────────────────────────────────
export function getAllImportedBooks(): Book[] {
  // Always re-read from localStorage so the storage event picks up changes
  // made by other components that called setCache()
  _cache = readStore();
  return _cache;
}
