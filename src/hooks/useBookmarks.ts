import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Bookmark {
  bookSlug: string;
  sectionId: string;
  sectionTitle: string;
  createdAt: number;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>('idl-bookmarks', []);

  const isBookmarked = useCallback(
    (bookSlug: string, sectionId: string) =>
      bookmarks.some((b) => b.bookSlug === bookSlug && b.sectionId === sectionId),
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    (bookSlug: string, sectionId: string, sectionTitle: string) => {
      setBookmarks((prev) => {
        const exists = prev.some((b) => b.bookSlug === bookSlug && b.sectionId === sectionId);
        if (exists) {
          return prev.filter((b) => !(b.bookSlug === bookSlug && b.sectionId === sectionId));
        }
        return [...prev, { bookSlug, sectionId, sectionTitle, createdAt: Date.now() }];
      });
    },
    [setBookmarks]
  );

  const removeBookmark = useCallback(
    (bookSlug: string, sectionId: string) => {
      setBookmarks((prev) =>
        prev.filter((b) => !(b.bookSlug === bookSlug && b.sectionId === sectionId))
      );
    },
    [setBookmarks]
  );

  const getBookBookmarks = useCallback(
    (bookSlug: string) => bookmarks.filter((b) => b.bookSlug === bookSlug),
    [bookmarks]
  );

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    getBookBookmarks,
  };
}
