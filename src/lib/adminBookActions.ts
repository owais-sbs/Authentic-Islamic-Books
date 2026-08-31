import { getAllImportedBooks } from '@/hooks/useBookStore';
import { removeBookFromStore } from '@/lib/bookStoreHelpers';
import { markBookDeleted, setStatusOverride } from '@/lib/adminBookMeta';
import { deleteBookFromSupabase, updateBookStatusInSupabase } from '@/lib/bookApi';
import { generateSlug } from '@/lib/bookTransform';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function archiveAdminBook(bookId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await updateBookStatusInSupabase(bookId, 'archived');
    } catch {
      // fall through to local override
    }
  }
  setStatusOverride(bookId, 'archived');
  window.dispatchEvent(new Event('storage'));
}

export async function restoreAdminBook(bookId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await updateBookStatusInSupabase(bookId, 'draft');
    } catch {
      // fall through
    }
  }
  setStatusOverride(bookId, 'draft');
  window.dispatchEvent(new Event('storage'));
}

export async function deleteAdminBook(bookId: string): Promise<void> {
  removeBookFromStore(bookId);

  if (isSupabaseConfigured()) {
    try {
      await deleteBookFromSupabase(bookId);
    } catch {
      // still mark locally deleted
    }
  }

  markBookDeleted(bookId);
  window.dispatchEvent(new Event('storage'));
}

export function getBookPreviewSlug(bookId: string, title: string): string {
  const stored = getAllImportedBooks().find((b) => b.id === bookId);
  if (stored?.slug) return stored.slug;
  return generateSlug(title, bookId);
}
