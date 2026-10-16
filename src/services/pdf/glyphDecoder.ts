/**
 * Repair text drawn with fonts that have no character map.
 *
 * Such fonts make PDF.js return private-use codes (U+E000–U+F8FF) instead of
 * letters, but each font is a consistent substitution: the same code is always
 * the same letter. We OCR a few pages, line the OCR words up with the garbled
 * text items at the same position, learn every font's code → letter mapping by
 * voting, then decode the whole book from its normal text layer.
 */
import type { PdfTextItem } from './layout';

const PUA = /[\uE000-\uF8FF]/;
const PUA_GLOBAL = /[\uE000-\uF8FF]/g;

/** An OCR'd word in PDF user space (y grows upwards, like PDF.js transforms). */
export interface PdfSpaceWord {
  text: string;
  x0: number;
  x1: number;
  /** Bottom and top of the word box */
  y0: number;
  y1: number;
}

/** Canvas-pixel OCR box → PDF user space (canvas rendered at `scale`, page height in PDF units). */
export function canvasWordToPdfSpace(
  word: { text: string; bbox: { x0: number; y0: number; x1: number; y1: number } },
  scale: number,
  pageHeight: number,
): PdfSpaceWord {
  return {
    text: word.text,
    x0: word.bbox.x0 / scale,
    x1: word.bbox.x1 / scale,
    y0: pageHeight - word.bbox.y1 / scale,
    y1: pageHeight - word.bbox.y0 / scale,
  };
}

/**
 * Pair each undecodable code with the OCR letter at the same position. Only
 * readings of exactly the same length are used (allowing for a leading or
 * trailing space), and the item's decodable letters must agree with the OCR —
 * this keeps OCR slips from teaching wrong letters.
 */
function alignSameLength(a: string[], ocr: string): Array<[string, string]> | null {
  const b = [ocr, `${ocr} `, ` ${ocr}`, ` ${ocr} `].map((c) => [...c]).find((c) => c.length === a.length);
  if (!b) return null;
  const known = a.filter((ch) => !PUA.test(ch)).length;
  const agree = a.filter((ch, i) => !PUA.test(ch) && ch === b[i]).length;
  if (known > 0 && agree / known < 0.8) return null;
  const pairs: Array<[string, string]> = [];
  a.forEach((ch, i) => {
    if (PUA.test(ch)) pairs.push([ch, b[i]]);
  });
  return pairs;
}

export function itemHasUndecodable(item: PdfTextItem): boolean {
  return typeof item.str === 'string' && PUA.test(item.str);
}

export class GlyphDecoder {
  /** font → code → letter → votes */
  private votes = new Map<string, Map<string, Map<string, number>>>();
  private resolved = new Map<string, Map<string, string>>();

  /** Learn mappings from one page: its PDF.js items and OCR words (PDF space). */
  learn(items: PdfTextItem[], words: PdfSpaceWord[]): void {
    for (const item of items) {
      if (!itemHasUndecodable(item) || !item.transform) continue;
      const font = item.fontName ?? '';
      const x = item.transform[4];
      const y = item.transform[5];
      const size = Math.abs(item.transform[3]) || item.height || 10;
      const right = x + (item.width ?? 0);
      const overlapping = words
        .filter((w) => {
          const midY = (w.y0 + w.y1) / 2;
          const midX = (w.x0 + w.x1) / 2;
          return midY > y - size * 0.4 && midY < y + size * 1.1 && midX > x - 1 && midX < right + 1;
        })
        .sort((a, b) => a.x0 - b.x0);
      if (overlapping.length === 0) continue;

      const ocr = overlapping.map((w) => w.text).join(' ');
      let pairs = alignSameLength([...item.str!], ocr);
      if (!pairs) {
        // Fall back to word-by-word: one misread word should not waste the whole line
        const map = this.resolved.get(font);
        const isSpace = (ch: string) => ch === ' ' || map?.get(ch) === ' ';
        const itemWords: string[][] = [[]];
        for (const ch of item.str!) {
          if (isSpace(ch)) itemWords.push([]);
          else itemWords[itemWords.length - 1].push(ch);
        }
        const words = itemWords.filter((w) => w.length > 0);
        if (words.length === overlapping.length) {
          pairs = words.flatMap((w, k) => alignSameLength(w, overlapping[k].text) ?? []);
        }
      }
      if (!pairs?.length) continue;
      this.vote(font, pairs);
    }
    this.resolve();
  }

  private vote(font: string, pairs: Array<[string, string]>): void {
    const fontVotes = this.votes.get(font) ?? new Map<string, Map<string, number>>();
    this.votes.set(font, fontVotes);
    for (const [code, letter] of pairs) {
      const counts = fontVotes.get(code) ?? new Map<string, number>();
      fontVotes.set(code, counts);
      counts.set(letter, (counts.get(letter) ?? 0) + 1);
    }
  }

  private resolve(): void {
    this.resolved.clear();
    for (const [font, codes] of this.votes) {
      const map = new Map<string, string>();
      for (const [code, counts] of codes) {
        const total = [...counts.values()].reduce((s, n) => s + n, 0);
        const ranked = [...counts.entries()].sort((p, q) => q[1] - p[1]);
        const [letter, n] = ranked[0];
        const runnerUp = ranked[1]?.[1] ?? 0;
        // Clear winner: a majority, or (OCR noise on punctuation) well ahead of any other reading
        if (n / total >= 0.5 || (n >= 3 && n >= runnerUp * 3)) map.set(code, letter);
      }
      this.resolved.set(font, map);
    }
  }

  /**
   * Fill in letters OCR never saw, crossword-style, using the book's own
   * readable text: a decoded word with one unknown glyph ("E?alted") that
   * matches exactly one word of the book's vocabulary ("Exalted") reveals
   * that glyph. Repeats a few rounds, as each solved letter unlocks more words.
   */
  learnFromVocabulary(pages: PdfTextItem[][]): void {
    const vocab = new Map<string, number>();
    for (const items of pages) {
      for (const item of items) {
        if (!item.str || PUA.test(item.str)) continue;
        for (const w of item.str.match(/[A-Za-z’'-]{3,}/g) ?? []) vocab.set(w, (vocab.get(w) ?? 0) + 1);
      }
    }
    // Index words by length for quick pattern matching
    const byLength = new Map<number, Array<[string, number]>>();
    for (const [w, n] of vocab) {
      const list = byLength.get(w.length) ?? [];
      list.push([w, n]);
      byLength.set(w.length, list);
    }

    for (let round = 0; round < 3; round++) {
      const found = new Map<string, Map<string, Map<string, number>>>();
      for (const items of pages) {
        // Join touching pieces into words: a capital drawn from another font
        // subset is its own item ("F" + "orgiving")
        type Tok = { ch: string; font: string };
        const toks: Tok[] = [];
        let prev: PdfTextItem | null = null;
        for (const item of items) {
          if (!item.str || !item.transform) continue;
          if (prev?.transform) {
            const size = Math.abs(item.transform[3]) || 10;
            const gap = item.transform[4] - (prev.transform[4] + (prev.width ?? 0));
            const sameLine = Math.abs(item.transform[5] - prev.transform[5]) < size * 0.3;
            if (!sameLine || gap > size * 0.15 || gap < -size) toks.push({ ch: ' ', font: '' });
          }
          const font = item.fontName ?? '';
          const map = this.resolved.get(font);
          for (const ch of item.str) toks.push({ ch: PUA.test(ch) ? map?.get(ch) ?? ch : ch, font });
          prev = item;
        }
        const words: Tok[][] = [[]];
        for (const t of toks) {
          if (t.ch === ' ') words.push([]);
          else words[words.length - 1].push(t);
        }
        for (const word of words) {
          let start = 0;
          let end = word.length;
          while (start < end && !/[A-Za-z]/.test(word[start].ch) && !PUA.test(word[start].ch)) start += 1;
          while (end > start && !/[A-Za-z]/.test(word[end - 1].ch) && !PUA.test(word[end - 1].ch)) end -= 1;
          const letters = word.slice(start, end);
          const unknown = letters.filter((t) => PUA.test(t.ch));
          if (unknown.length !== 1 || letters.length < 3) continue;
          if (letters.some((t) => !PUA.test(t.ch) && !/[A-Za-z’'-]/.test(t.ch))) continue;
          const pos = letters.findIndex((t) => PUA.test(t.ch));
          const candidates = (byLength.get(letters.length) ?? []).filter(([w]) =>
            letters.every((t, k) => k === pos || w[k] === t.ch),
          );
          if (candidates.length === 0) continue;
          // The missing letter must be (nearly) unanimous across the matching words,
          // weighted by how often each word occurs in the book ("?our" → "Your", not "four")
          const byLetter = new Map<string, number>();
          for (const [w, n] of candidates) byLetter.set(w[pos], (byLetter.get(w[pos]) ?? 0) + n);
          const [[letter, best]] = [...byLetter.entries()].sort((p, q) => q[1] - p[1]);
          const all = [...byLetter.values()].reduce((a, b) => a + b, 0);
          if (best / all < 0.85) continue;
          const { ch: code, font } = letters[pos];
          const fontFound = found.get(font) ?? new Map<string, Map<string, number>>();
          found.set(font, fontFound);
          const counts = fontFound.get(code) ?? new Map<string, number>();
          fontFound.set(code, counts);
          counts.set(letter, (counts.get(letter) ?? 0) + 1);
        }
      }
      let added = 0;
      for (const [font, codes] of found) {
        for (const [code, counts] of codes) {
          const ranked = [...counts.entries()].sort((p, q) => q[1] - p[1]);
          const total = ranked.reduce((n, [, c]) => n + c, 0);
          // Several independent words agreeing — not a one-off coincidence
          if (ranked[0][1] >= 2 && ranked[0][1] / total >= 0.75 && !this.resolved.get(font)?.has(code)) {
            this.vote(font, Array(3).fill([code, ranked[0][0]]));
            added += 1;
          }
        }
      }
      this.resolve();
      if (added === 0) break;
    }
  }

  /** Share of undecodable characters on a page that the learned mappings can decode. */
  coverage(items: PdfTextItem[]): number {
    let total = 0;
    let known = 0;
    for (const item of items) {
      for (const ch of item.str?.match(PUA_GLOBAL) ?? []) {
        total += 1;
        if (this.resolved.get(item.fontName ?? '')?.has(ch)) known += 1;
      }
    }
    return total === 0 ? 1 : known / total;
  }

  private attempted = new Set<string>();

  /** Remember that a page's codes have had a chance to be learned (even if OCR couldn't align them). */
  markAttempted(items: PdfTextItem[]): void {
    for (const item of items) {
      for (const ch of item.str?.match(PUA_GLOBAL) ?? []) this.attempted.add(`${item.fontName ?? ''}|${ch}`);
    }
  }

  /**
   * Next page worth OCR-ing: the one with the most undecoded characters whose
   * codes have not appeared on an already-learned page. Null when nothing is left.
   */
  pickLearningPage(pages: PdfTextItem[][], learned: Set<number>): number | null {
    let bestIndex: number | null = null;
    let bestScore = 19;
    pages.forEach((items, index) => {
      if (learned.has(index)) return;
      const sizes = items.map((i) => Math.abs(i.transform?.[3] ?? 0)).filter(Boolean).sort((a, b) => a - b);
      const body = sizes[Math.floor(sizes.length / 2)] ?? 10;
      // Score distinct missing letters (rare capitals matter as much as common ones);
      // large text (chapter banners) is weighted up
      const perCode = new Map<string, number>();
      for (const item of items) {
        const font = item.fontName ?? '';
        const weight = Math.abs(item.transform?.[3] ?? 0) >= body * 1.3 ? 5 : 1;
        for (const ch of item.str?.match(PUA_GLOBAL) ?? []) {
          const key = `${font}|${ch}`;
          if (!this.resolved.get(font)?.has(ch) && !this.attempted.has(key)) {
            perCode.set(key, (perCode.get(key) ?? 0) + weight);
          }
        }
      }
      let score = 0;
      for (const n of perCode.values()) score += Math.min(n, 4) * 5;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  /** Debug: undecoded codes on these items with their vote counts. */
  unresolved(items: PdfTextItem[]): Array<{ font: string; code: string; count: number; votes: string }> {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const ch of item.str?.match(PUA_GLOBAL) ?? []) {
        if (this.resolved.get(item.fontName ?? '')?.has(ch)) continue;
        const key = `${item.fontName ?? ''}|${ch}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => {
        const [font, code] = key.split('|');
        const v = this.votes.get(font)?.get(code);
        return { font, code: code.codePointAt(0)!.toString(16), count, votes: v ? JSON.stringify([...v.entries()]) : '' };
      });
  }

  /** Items with every learned code replaced by its letter (unknown codes removed). */
  decode(items: PdfTextItem[]): PdfTextItem[] {
    return items.map((item) => {
      if (!itemHasUndecodable(item)) return item;
      const map = this.resolved.get(item.fontName ?? '');
      const str = item.str!.replace(PUA_GLOBAL, (ch) => map?.get(ch) ?? '');
      return { ...item, str };
    });
  }
}

export interface PdfRegion {
  /** Items (by index) that the region's OCR text replaces */
  itemIndexes: number[];
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/**
 * Heading lines (larger than body text) that still contain undecodable codes
 * after decoding — e.g. chapter banners whose rare capitals were never learned.
 * These short regions are read directly with OCR.
 */
export function headingRegionsToOcr(items: PdfTextItem[], decoder: GlyphDecoder): PdfRegion[] {
  const sizes = items.map((i) => Math.abs(i.transform?.[3] ?? 0)).filter(Boolean).sort((a, b) => a - b);
  const body = sizes[Math.floor(sizes.length / 2)] ?? 10;
  const rows: PdfRegion[] = [];
  items.forEach((item, index) => {
    const t = item.transform;
    if (!t || !item.str?.trim()) return;
    const size = Math.abs(t[3]);
    if (size < body * 1.3) return;
    const x1 = t[4] + (item.width ?? 0);
    // Same baseline and horizontally adjacent (a heading in the other column is a separate strip)
    const row = rows.find(
      (r) => Math.abs(r.y0 + size * 0.25 - t[5]) < size * 0.5 && t[4] < r.x1 + size * 3 && x1 > r.x0 - size * 3,
    );
    if (row) {
      row.itemIndexes.push(index);
      row.x0 = Math.min(row.x0, t[4]);
      row.x1 = Math.max(row.x1, x1);
    } else {
      rows.push({ itemIndexes: [index], x0: t[4], x1, y0: t[5] - size * 0.25, y1: t[5] + size * 0.95 });
    }
  });
  // Wide strips only (banners / headings), not small table cells
  return rows.filter((r) => r.x1 - r.x0 >= body * 6 && decoder.coverage(r.itemIndexes.map((i) => items[i])) < 1);
}

/** OCR of a heading strip is used only when it reads like a heading of about the right length. */
export function regionTextIsPlausible(text: string, region: PdfRegion, items: PdfTextItem[]): boolean {
  const letters = (text.match(/\p{L}/gu) || []).length;
  if (letters < 5 || letters / Math.max(1, text.replace(/\s/g, '').length) < 0.6) return false;
  const expected = region.itemIndexes.reduce((n, i) => n + (items[i].str?.trim().length ?? 0), 0);
  return text.length >= expected * 0.5 && text.length <= expected * 1.6 + 4;
}

/** Replace each region's items with one item carrying its OCR text. */
export function applyRegionTexts(items: PdfTextItem[], replacements: Array<{ region: PdfRegion; text: string }>): PdfTextItem[] {
  const replaceAt = new Map<number, PdfTextItem>();
  const drop = new Set<number>();
  for (const { region, text } of replacements) {
    const [firstIdx, ...rest] = region.itemIndexes;
    const first = items[firstIdx];
    replaceAt.set(firstIdx, {
      ...first,
      str: text,
      width: region.x1 - region.x0,
      transform: [...first.transform!.slice(0, 4), region.x0, first.transform![5]],
    });
    rest.forEach((i) => drop.add(i));
  }
  return items.map((item, i) => replaceAt.get(i) ?? item).filter((_, i) => !drop.has(i));
}
