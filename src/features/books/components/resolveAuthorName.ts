import { getScholarById } from '@/data/scholars';

/** Turn stored author_id / slug into a readable display name. */
export function resolveAuthorName(
  authorName?: string | null,
  authorId?: string | null,
): string {
  const raw = (authorName || authorId || '').trim();
  if (!raw || raw === '—') return '—';

  // Already a human name (not a slug/id)
  if (!raw.startsWith('scholar-') && !/^[a-z0-9]+(?:-[a-z0-9]+)+$/i.test(raw)) {
    return raw;
  }

  const scholar = getScholarById(raw);
  if (scholar?.name) return scholar.name;

  // Fallback: prettify slug — "scholar-ibn-kathir" → "Ibn Kathir"
  return raw
    .replace(/^scholar-/, '')
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
