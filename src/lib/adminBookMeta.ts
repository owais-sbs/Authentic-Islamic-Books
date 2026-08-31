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

export function applyAdminMeta<T extends { id: string; status: BookStatus }>(books: T[]): T[] {
  const deleted = getDeletedBookIds();
  const overrides = readStatusOverrides();

  return books
    .filter((b) => !deleted.has(b.id))
    .map((b) => ({
      ...b,
      status: overrides[b.id] ?? b.status,
    }));
}
