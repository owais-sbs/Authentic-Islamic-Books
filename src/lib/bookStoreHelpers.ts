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
    // ignore
  }
}

export function updateBookInStore(id: string, patch: Partial<Book>): void {
  writeStore(readStore().map((b) => (b.id === id ? { ...b, ...patch } : b)));
}

export function removeBookFromStore(id: string): void {
  writeStore(readStore().filter((b) => b.id !== id));
}
