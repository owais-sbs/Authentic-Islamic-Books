import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface BookProgress {
  scrollPercent: number;
  activeSectionId: string | null;
  updatedAt: number;
}

type ProgressMap = Record<string, BookProgress>;

export function useReadingProgress(bookSlug: string) {
  const [progress, setProgress] = useLocalStorage<ProgressMap>('idl-reading-progress', {});
  const [scrollPercent, setScrollPercent] = useState(0);

  const bookProgress = progress[bookSlug];

  const saveProgress = useCallback(
    (sectionId: string | null, percent: number) => {
      setProgress((prev) => ({
        ...prev,
        [bookSlug]: {
          scrollPercent: percent,
          activeSectionId: sectionId,
          updatedAt: Date.now(),
        },
      }));
    },
    [bookSlug, setProgress]
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setScrollPercent(percent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    scrollPercent,
    savedProgress: bookProgress,
    saveProgress,
  };
}
