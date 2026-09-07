import { useState, useEffect, useCallback } from 'react';
import {
  fetchScholarsFromSupabase,
  getScholarCache,
} from '@/lib/scholarApi';
import type { Scholar } from '@/types';

export const SCHOLARS_CHANGED_EVENT = 'idl-scholars-changed';

export function notifyScholarsChanged(): void {
  window.dispatchEvent(new Event(SCHOLARS_CHANGED_EVENT));
}

export function useScholars() {
  const [scholars, setScholars] = useState<Scholar[]>(getScholarCache);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchScholarsFromSupabase();
      setScholars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scholars');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const handleChanged = () => void load();
    window.addEventListener(SCHOLARS_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(SCHOLARS_CHANGED_EVENT, handleChanged);
  }, [load]);

  return { scholars, loading, error, refreshScholars: load };
}
