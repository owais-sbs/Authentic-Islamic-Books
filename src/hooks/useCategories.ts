import { useState, useEffect, useCallback } from 'react';
import {
  fetchCategoriesFromSupabase,
  getCategoryCache,
} from '@/lib/categoryApi';
import type { Category } from '@/types';

export const CATEGORIES_CHANGED_EVENT = 'idl-categories-changed';

export function notifyCategoriesChanged(): void {
  window.dispatchEvent(new Event(CATEGORIES_CHANGED_EVENT));
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(getCategoryCache);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategoriesFromSupabase();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleChanged = () => void load();
    window.addEventListener(CATEGORIES_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(CATEGORIES_CHANGED_EVENT, handleChanged);
  }, [load]);

  return { categories, loading, error, refreshCategories: load };
}
