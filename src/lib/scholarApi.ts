import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { scholars as staticScholars } from '@/data/scholars';
import type { Scholar } from '@/types';

interface DbScholarRow {
  id: string;
  slug: string;
  name: string;
  full_name: string | null;
  born_hijri: number | null;
  died_hijri: number | null;
  born_place: string | null;
  short_bio: string | null;
  full_bio: string | null;
  categories: string[] | null;
  image_url: string | null;
  timeline_events: Scholar['timelineEvents'] | null;
}

function rowToScholar(row: DbScholarRow): Scholar {
  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.name,
    fullName: row.full_name ?? row.name,
    bornHijri: row.born_hijri ?? 0,
    diedHijri: row.died_hijri ?? 0,
    bornPlace: row.born_place ?? '',
    shortBio: row.short_bio ?? '',
    fullBio: row.full_bio ?? '',
    categories: row.categories ?? [],
    imageUrl: row.image_url ?? '',
    timelineEvents: row.timeline_events ?? [],
  };
}

let scholarCache: Scholar[] = [];

export function getScholarCache(): Scholar[] {
  return scholarCache.length > 0 ? scholarCache : staticScholars;
}

export async function fetchScholarsFromSupabase(): Promise<Scholar[]> {
  if (!isSupabaseConfigured()) {
    scholarCache = staticScholars;
    return staticScholars;
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('scholars')
      .select('*')
      .order('born_hijri', { ascending: true });

    if (error || !data) {
      scholarCache = staticScholars;
      return staticScholars;
    }

    const fetched = (data as DbScholarRow[]).map(rowToScholar);

    // Merge static scholars with fetched Supabase scholars so default scholars are never lost
    const mergedMap = new Map<string, Scholar>();
    staticScholars.forEach((s) => mergedMap.set(s.id, s));
    fetched.forEach((s) => mergedMap.set(s.id, s));
    const merged = Array.from(mergedMap.values());

    scholarCache = merged;
    return merged;
  } catch (err) {
    console.warn('[Supabase] fetchScholars failed, using static fallback:', err);
    scholarCache = staticScholars;
    return staticScholars;
  }
}

export async function upsertScholarToSupabase(scholar: Scholar): Promise<Scholar> {
  if (!isSupabaseConfigured()) {
    scholarCache = [scholar, ...scholarCache.filter((s) => s.id !== scholar.id)];
    return scholar;
  }

  const supabase = getSupabase();
  const payload = {
    id: scholar.id,
    slug: scholar.slug,
    name: scholar.name,
    full_name: scholar.fullName || null,
    born_hijri: scholar.bornHijri || null,
    died_hijri: scholar.diedHijri || null,
    born_place: scholar.bornPlace || null,
    short_bio: scholar.shortBio || null,
    full_bio: scholar.fullBio || null,
    categories: scholar.categories || [],
    image_url: scholar.imageUrl || null,
    timeline_events: scholar.timelineEvents || [],
  };

  const { data, error } = await supabase
    .from('scholars')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const saved = rowToScholar(data as DbScholarRow);
  scholarCache = [saved, ...scholarCache.filter((s) => s.id !== saved.id)];
  return saved;
}

export async function deleteScholarFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    scholarCache = scholarCache.filter((s) => s.id !== id);
    return;
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('scholars').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  scholarCache = scholarCache.filter((s) => s.id !== id);
}
