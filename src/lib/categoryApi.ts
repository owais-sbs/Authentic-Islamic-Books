import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';
import { categories as staticCategories } from '@/data/categories';
import type { Category } from '@/types';

interface DbCategoryRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
}

function rowToCategory(row: DbCategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
  };
}

let categoryCache: Category[] = [];

export function getCategoryCache(): Category[] {
  return categoryCache.length > 0 ? categoryCache : staticCategories;
}

export async function fetchCategoriesFromSupabase(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    categoryCache = staticCategories;
    return staticCategories;
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      categoryCache = staticCategories;
      return staticCategories;
    }

    const fetched = (data as DbCategoryRow[]).map(rowToCategory);
    categoryCache = fetched;
    return fetched;
  } catch (err) {
    console.warn('[Supabase] fetchCategories failed, using static fallback:', err);
    categoryCache = staticCategories;
    return staticCategories;
  }
}

export async function upsertCategoryToSupabase(category: Category): Promise<Category> {
  if (!isSupabaseConfigured()) {
    // Local fallback update
    categoryCache = [category, ...categoryCache.filter((c) => c.id !== category.id)];
    return category;
  }

  const supabase = getSupabase();
  const payload = {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description || null,
  };

  const { data, error } = await supabase
    .from('categories')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const saved = rowToCategory(data as DbCategoryRow);
  categoryCache = [saved, ...categoryCache.filter((c) => c.id !== saved.id)];
  return saved;
}

export async function deleteCategoryFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    categoryCache = categoryCache.filter((c) => c.id !== id);
    return;
  }

  const supabase = getSupabase();
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  categoryCache = categoryCache.filter((c) => c.id !== id);
}
