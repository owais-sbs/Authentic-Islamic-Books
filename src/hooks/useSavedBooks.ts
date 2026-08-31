import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface SavedBook {
  slug: string;
  title: string;
  coverColor: string;
  coverUrl?: string;
  savedAt: number;
}

export function useSavedBooks() {
  const [savedBooks, setSavedBooks] = useLocalStorage<SavedBook[]>('idl-saved-books', []);

  const isBookSaved = useCallback(
    (slug: string) => savedBooks.some((b) => b.slug === slug),
    [savedBooks]
  );

  const saveBook = useCallback(
    (book: { slug: string; title: string; coverColor: string; coverUrl?: string }) => {
      setSavedBooks((prev) => {
        if (prev.some((b) => b.slug === book.slug)) return prev;
        return [
          { slug: book.slug, title: book.title, coverColor: book.coverColor, coverUrl: book.coverUrl, savedAt: Date.now() },
          ...prev,
        ];
      });
      return true;
    },
    [setSavedBooks]
  );

  const unsaveBook = useCallback(
    (slug: string) => {
      setSavedBooks((prev) => prev.filter((b) => b.slug !== slug));
    },
    [setSavedBooks]
  );

  const toggleSavedBook = useCallback(
    (book: { slug: string; title: string; coverColor: string; coverUrl?: string }) => {
      if (isBookSaved(book.slug)) {
        unsaveBook(book.slug);
        return false;
      }
      saveBook(book);
      return true;
    },
    [isBookSaved, saveBook, unsaveBook]
  );

  return { savedBooks, isBookSaved, saveBook, unsaveBook, toggleSavedBook };
}
