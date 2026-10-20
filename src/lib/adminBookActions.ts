import { getAllImportedBooks } from '@/hooks/useBookStore';
import { removeBookFromStore } from '@/lib/bookStoreHelpers';
import {
  clearBookDeleted,
  clearStatusOverride,
  markBookDeleted,
  setStatusOverride,
} from '@/lib/adminBookMeta';
import { deleteBookFromSupabase, updateBookStatusInSupabase } from '@/lib/bookApi';
import { generateSlug } from '@/lib/bookTransform';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function archiveAdminBook(bookId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await updateBookStatusInSupabase(bookId, 'archived');
      clearStatusOverride(bookId);
      window.dispatchEvent(new Event('storage'));
      return;
    } catch {
      // fall through to local override when cloud update fails
    }
  }
  setStatusOverride(bookId, 'archived');
  window.dispatchEvent(new Event('storage'));
}

export async function restoreAdminBook(bookId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await updateBookStatusInSupabase(bookId, 'draft');
      clearStatusOverride(bookId);
      window.dispatchEvent(new Event('storage'));
      return;
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
      clearBookDeleted(bookId);
      clearStatusOverride(bookId);
      window.dispatchEvent(new Event('storage'));
      return;
    } catch {
      // Cloud delete failed — hide from this browser only as a last resort.
      markBookDeleted(bookId);
      window.dispatchEvent(new Event('storage'));
      return;
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
