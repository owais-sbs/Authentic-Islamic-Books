import type { BookStatus } from '@/features/books/types';

const DELETED_KEY = 'idl_admin_deleted_books';
const STATUS_KEY = 'idl_admin_book_status';

function readDeleted(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDeleted(ids: string[]) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(ids));
}

function readStatusOverrides(): Record<string, BookStatus> {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, BookStatus>) : {};
  } catch {
    return {};
  }
}

function writeStatusOverrides(map: Record<string, BookStatus>) {
  localStorage.setItem(STATUS_KEY, JSON.stringify(map));
}

export function getDeletedBookIds(): Set<string> {
  return new Set(readDeleted());
}

export function markBookDeleted(id: string): void {
  const ids = readDeleted();
  if (!ids.includes(id)) writeDeleted([...ids, id]);
}

/** Remove a soft-delete marker (e.g. after a successful cloud delete, or when the book still exists remotely). */
export function clearBookDeleted(id: string): void {
  writeDeleted(readDeleted().filter((x) => x !== id));
}

/** Drop soft-delete markers for ids that are still present in the shared library. */
export function clearDeletedForExisting(ids: string[]): void {
  if (ids.length === 0) return;
  const existing = new Set(ids);
  writeDeleted(readDeleted().filter((id) => !existing.has(id)));
}

export function getStatusOverride(id: string): BookStatus | undefined {
  return readStatusOverrides()[id];
}

export function setStatusOverride(id: string, status: BookStatus): void {
  const map = readStatusOverrides();
  map[id] = status;
  writeStatusOverrides(map);
}

export function clearStatusOverride(id: string): void {
  const map = readStatusOverrides();
  delete map[id];
  writeStatusOverrides(map);
}

export interface ApplyAdminMetaOptions {
  /**
   * When true (Supabase shared library), local soft-deletes and status overrides
   * must not hide books that still exist in the cloud. The public site never
   * reads these keys — that mismatch was emptying the admin Books page.
   */
  cloudSource?: boolean;
}

export function applyAdminMeta<T extends { id: string; status: BookStatus }>(
  books: T[],
  options?: ApplyAdminMetaOptions,
): T[] {
  if (options?.cloudSource) {
    // Trust Supabase as source of truth for the team list.
    return books;
  }

  const deleted = getDeletedBookIds();
  const overrides = readStatusOverrides();

  return books
    .filter((b) => !deleted.has(b.id))
    .map((b) => ({
      ...b,
      status: overrides[b.id] ?? b.status,
    }));
}
