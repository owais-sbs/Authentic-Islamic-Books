/**
 * Clean chapter / section titles for display and structure detection.
 * Avoids "CHAPTER 10 — CHAPTER TWO" style duplicates.
 */

const CHAPTER_PREFIX =
  /^(?:chapter|part|book|lesson|unit)\s+(\d+|[ivxlcdm]+|[a-z]+)\s*[:\-–—.]?\s*/i;

const CHAPTER_WORD_ONLY =
  /^(?:chapter|part|book|lesson|unit)\s+(\d+|[ivxlcdm]+|[a-z]+)\s*$/i;

export function cleanChapterTitle(raw: string | undefined | null): string {
  if (!raw) return 'Untitled';
  let t = raw.replace(/\s+/g, ' ').trim();

  // "Chapter 10 — Chapter Two" / "CHAPTER 10 — CHAPTER TWO"
  const dashParts = t.split(/\s*[—–\-]\s+/);
  if (dashParts.length >= 2) {
    const left = dashParts[0].trim();
    const right = dashParts.slice(1).join(' — ').trim();
    const leftIsChapter = CHAPTER_PREFIX.test(left) || CHAPTER_WORD_ONLY.test(left);
    const rightIsChapter = CHAPTER_PREFIX.test(right) || CHAPTER_WORD_ONLY.test(right);

    if (leftIsChapter && rightIsChapter) {
      // Prefer the more descriptive side (usually the word form or longer title)
      const leftTitle = left.replace(CHAPTER_PREFIX, '').trim() || left;
      const rightTitle = right.replace(CHAPTER_PREFIX, '').trim() || right;
      t = rightTitle.length >= leftTitle.length ? right : left;
    } else if (leftIsChapter && right) {
      t = right;
    }
  }

  // Strip a lone leading "Chapter N:" if the rest is the real title
  const stripped = t.replace(CHAPTER_PREFIX, '').trim();
  if (stripped && stripped.length >= 2 && !CHAPTER_WORD_ONLY.test(t)) {
    // Keep "Chapter 3: Faith" style when prefix + title both useful — but for display
    // of "Chapter {num} — {title}" we only want the title part
    if (!/^chapter\s+/i.test(stripped)) {
      t = stripped;
    }
  }

  // Title case cleanup for ALL CAPS short titles
  if (t === t.toUpperCase() && /[A-Z]/.test(t) && t.length < 60) {
    t = t
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return t || 'Untitled';
}

export function formatChapterHeading(number: string, title: string): string {
  const cleaned = cleanChapterTitle(title);
  const num = String(number || '').trim();

  // Title already includes "Chapter N"
  if (/^chapter\s+/i.test(cleaned)) {
    return cleaned;
  }

  // Title is just another chapter number word ("Two", "II") — use number only
  if (/^(?:[ivxlcdm]+|\d+)$/i.test(cleaned)) {
    return num ? `Chapter ${num}` : `Chapter ${cleaned}`;
  }

  return num ? `Chapter ${num} — ${cleaned}` : cleaned;
}
