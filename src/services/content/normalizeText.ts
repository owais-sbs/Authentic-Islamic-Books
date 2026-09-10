/**
 * Text normalization for book content (import + read-time).
 * Preserves headings, numbering, Arabic, references, and footnote markers.
 */

const FOOTER_LINE = [
  /^\s*page\s+\d+\s*(of\s+\d+)?\s*$/i,
  /^\s*-\s*\d+\s*-\s*$/,
  /^\s*©\s*/,
  /^\s*\d{1,4}\s*$/,
];

/** Soft line wrap: ends mid-sentence and next continues lowercase / Arabic. */
const ENDS_SENTENCE = /[.!?؟:…»"”)]$|^\s*$/;

export function cleanUnicode(text: string): string {
  return text
    .replace(/\u00AD/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');
}

export function joinHyphenatedBreaks(text: string): string {
  return text.replace(/(\w)-\n(\w)/g, '$1$2');
}

function collapseInlineSpaces(line: string): string {
  return line.replace(/[ \t]{2,}/g, ' ').trim();
}

export function isLikelyPageArtifact(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  return FOOTER_LINE.some((p) => p.test(t));
}

/**
 * Join soft-wrapped PDF lines into paragraphs while preserving blank-line breaks
 * and isolated heading-like / numbered lines.
 */
export function repairLineWraps(text: string): string {
  const cleaned = joinHyphenatedBreaks(cleanUnicode(text));
  const rawLines = cleaned.split('\n').map((l) => collapseInlineSpaces(l));

  const out: string[] = [];
  let buf = '';

  const flush = () => {
    if (buf.trim()) out.push(buf.trim());
    buf = '';
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line) {
      flush();
      if (out.length > 0 && out[out.length - 1] !== '') out.push('');
      continue;
    }

    if (isLikelyPageArtifact(line)) continue;

    // Isolated short numbered / chapter-like lines stay separate
    if (isIsolatedStructuralLine(line)) {
      flush();
      out.push(line);
      continue;
    }

    if (!buf) {
      buf = line;
      continue;
    }

    const prev = buf;
    const shouldJoin =
      !ENDS_SENTENCE.test(prev) &&
      !isIsolatedStructuralLine(prev) &&
      line.length > 0 &&
      // next continues sentence (latin lower) or Arabic continuation
      (/^[a-z(]/.test(line) || /^[\u0600-\u06FF]/.test(line));

    if (shouldJoin) {
      buf = `${prev} ${line}`;
    } else {
      flush();
      buf = line;
    }
  }
  flush();

  // Collapse 3+ blank lines to one paragraph break
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const STRUCTURAL_LINE = [
  /^(chapter|part|book|lesson|unit|section)\s+(\d+|[ivxlcdm]+)\b/i,
  /^(\d{1,3}|[IVXLC]{1,6})[.)]\s+\S/,
  /^\d+\.\d+(?:\.\d+)?\s+\S/,
  /^[A-Z][.)]\s+\S/,
  /^(الكتاب|الباب|الفصل|المبحث|المطلب|الجزء|القسم|الدرس|مقدمة|تمهيد)\b/,
  /^(باب|فصل|کتاب|حصہ|سبق|مقدمہ|تمہید)\b/,
];

export function isIsolatedStructuralLine(line: string): boolean {
  const t = line.trim();
  if (t.length > 100) return false;
  return STRUCTURAL_LINE.some((p) => p.test(t));
}

/**
 * Detect repeated running headers/footers across pages (high confidence only).
 * `pages` are plain page strings (already line-broken).
 */
export function stripRepeatedPageArtifacts(pages: string[]): string[] {
  if (pages.length < 3) return pages;

  const firstLineCounts = new Map<string, number>();
  const lastLineCounts = new Map<string, number>();

  for (const page of pages) {
    const lines = page
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) continue;
    const first = lines[0];
    const last = lines[lines.length - 1];
    if (first.length <= 80) firstLineCounts.set(first, (firstLineCounts.get(first) ?? 0) + 1);
    if (last.length <= 80) lastLineCounts.set(last, (lastLineCounts.get(last) ?? 0) + 1);
  }

  const threshold = Math.max(3, Math.floor(pages.length * 0.4));
  const headers = new Set(
    [...firstLineCounts.entries()].filter(([, c]) => c >= threshold).map(([t]) => t),
  );
  const footers = new Set(
    [...lastLineCounts.entries()].filter(([, c]) => c >= threshold).map(([t]) => t),
  );

  // Never strip numbered headings that look like content structure
  const safe = (line: string) => !isIsolatedStructuralLine(line) && !/^\d+\.\d+/.test(line);

  return pages.map((page) => {
    const lines = page.split('\n');
    const filtered = lines.filter((raw, idx) => {
      const line = raw.trim();
      if (!line) return true;
      if (idx === 0 && headers.has(line) && safe(line)) return false;
      if (idx === lines.length - 1 && footers.has(line) && safe(line)) return false;
      if (isLikelyPageArtifact(line)) return false;
      return true;
    });
    return filtered.join('\n');
  });
}

/** Light cleanup for display without destroying paragraph boundaries. */
export function normalizeDisplayText(text: string): string {
  return cleanUnicode(text)
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\bAL\s*-\s*/gi, 'Al-')
    .trim();
}
