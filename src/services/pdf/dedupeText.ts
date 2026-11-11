/**
 * Deduplicate overlapping PDF text-layer / OCR artefacts.
 * Conservative: removes near-duplicate consecutive lines/paragraphs and
 * intra-line doubled phrases. Does not remove legitimate Quranic repetition
 * that is separated by other content.
 */

function normalizeForCompare(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(s: string): Set<string> {
  return new Set(normalizeForCompare(s).split(' ').filter((t) => t.length > 1));
}

/** Jaccard similarity of word sets (0–1). */
export function textSimilarity(a: string, b: string): number {
  const A = tokenSet(a);
  const B = tokenSet(b);
  if (A.size === 0 && B.size === 0) return 1;
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter += 1;
  return inter / (A.size + B.size - inter);
}

/**
 * Collapse doubled runs inside a single line:
 * "PROPHETPROPHET" / "of Allahof Allah" / "peace and blessingspeace and blessings"
 */
export function dedupeIntraLine(line: string): string {
  let s = line.replace(/[ \t]{2,}/g, ' ').trim();
  if (s.length < 8) return s;

  // Exact doubled halves: "ABAB" where A==B and length >= 6
  if (s.length >= 12 && s.length % 2 === 0) {
    const mid = s.length / 2;
    const left = s.slice(0, mid);
    const right = s.slice(mid);
    if (left === right) return left;
  }

  // Phrase doubled without space: "blessingsblessings"
  s = s.replace(/(\b[\p{L}\p{M}']{4,}\b)\1/gu, '$1');

  // Phrase doubled with optional space: "of Allah of Allah" already OK;
  // "of Allahof Allah" → "of Allah"
  s = s.replace(/(\b[\p{L}\p{M}']+(?:\s+[\p{L}\p{M}']+){0,6})\1/giu, '$1');

  return s.replace(/[ \t]{2,}/g, ' ').trim();
}

/**
 * Remove consecutive near-duplicate lines (overlap from fake-bold / dual layers).
 * Keeps the longer/cleaner variant.
 */
export function dedupeConsecutiveLines(text: string, threshold = 0.88): string {
  const lines = text.split('\n');
  const out: string[] = [];
  for (const raw of lines) {
    const line = dedupeIntraLine(raw);
    if (!line.trim()) {
      if (out.length && out[out.length - 1] !== '') out.push('');
      continue;
    }
    const prev = [...out].reverse().find((l) => l.trim());
    if (prev && textSimilarity(prev, line) >= threshold) {
      // Keep richer line
      if (line.length > prev.length * 1.05) {
        const idx = out.lastIndexOf(prev);
        if (idx >= 0) out[idx] = line;
      }
      continue;
    }
    out.push(line);
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Paragraph-level dedupe for page text after line cleanup.
 * Only drops a paragraph when it is almost identical to the previous one.
 */
export function dedupePageText(text: string): string {
  const cleaned = dedupeConsecutiveLines(text);
  const paras = cleaned
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const p of paras) {
    const prev = out[out.length - 1];
    if (prev && textSimilarity(prev, p) >= 0.9) {
      if (p.length > prev.length) out[out.length - 1] = p;
      continue;
    }
    out.push(p);
  }
  return out.join('\n\n');
}
