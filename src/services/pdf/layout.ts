/**
 * Rebuild readable lines + paragraphs from PDF.js text items using geometry.
 *
 * - Words: a space is inserted only when the horizontal gap between items is
 *   wide enough (PDF.js often splits one word into several items).
 * - Lines: items are grouped by baseline with a tolerance that scales with font size.
 * - Paragraphs: a blank line is emitted when the vertical gap is clearly larger
 *   than normal line spacing, or a short line ending a sentence is followed by more text.
 * - RTL: lines that are mostly Arabic/Urdu are ordered right-to-left.
 * - Headings: lines set noticeably larger than the body text are reported in
 *   `headingLines` (level 1 = much larger, level 2 = somewhat larger).
 */

export interface PdfTextItem {
  str?: string;
  transform?: number[];
  hasEOL?: boolean;
  width?: number;
  height?: number;
  dir?: string;
  /** PDF.js font id — needed to decode fonts without a character map */
  fontName?: string;
}

export interface LayoutHeadingLine {
  text: string;
  level: 1 | 2;
  /** Font size in PDF units — lets the pipeline rank heading sizes across the whole book */
  size: number;
}

export interface PageLayout {
  text: string;
  headingLines: LayoutHeadingLine[];
}

interface Glyph {
  str: string;
  x: number;
  y: number;
  width: number;
  size: number;
  rtl: boolean;
  /** Superscript footnote marker merged into this line, rendered as "[n]" */
  marker?: boolean;
}

interface Line {
  glyphs: Glyph[];
  y: number;
  size: number;
  left: number;
  right: number;
  rtl: boolean;
  text: string;
}

const ARABIC_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const LATIN_CHAR = /[A-Za-z]/g;
const ENDS_SENTENCE = /[.!?؟:…»"”)\]]$/;

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function isMostlyRtl(text: string): boolean {
  const ar = (text.match(ARABIC_CHAR) || []).length;
  const lat = (text.match(LATIN_CHAR) || []).length;
  return ar > 0 && ar >= lat;
}

export function toGlyphs(items: PdfTextItem[]): Glyph[] {
  const glyphs: Glyph[] = [];
  // "Fake bold": the same text drawn several times at (almost) the same spot
  const drawn = new Map<string, Array<[number, number]>>();
  for (const item of items) {
    if (!item || typeof item.str !== 'string' || !item.str) continue;
    const t = item.transform;
    if (item.str.trim()) {
      const x = t?.[4] ?? 0;
      const y = t?.[5] ?? 0;
      const spots = drawn.get(item.str) ?? [];
      if (spots.some(([px, py]) => Math.abs(px - x) <= 1.5 && Math.abs(py - y) <= 1.5)) continue;
      spots.push([x, y]);
      drawn.set(item.str, spots);
    }
    const size = Math.abs(t?.[3] ?? 0) || Math.hypot(t?.[2] ?? 0, t?.[3] ?? 0) || item.height || 10;
    glyphs.push({
      str: item.str,
      x: t?.[4] ?? 0,
      y: t?.[5] ?? 0,
      width: typeof item.width === 'number' ? item.width : 0,
      size,
      rtl: item.dir === 'rtl',
    });
  }
  return glyphs;
}

/**
 * Two-column pages: find an empty vertical gutter near the middle of the page.
 * Returns the glyphs in reading order as blocks — for each horizontal band
 * (separated by full-width lines such as a chapter banner): left column, then
 * right column, then the full-width line.
 */
export function columnBlocks(glyphs: Glyph[], bodySize: number): Glyph[][] {
  const visible = glyphs.filter((g) => g.str.trim() && g.width > 0);
  if (visible.length < 10) return [glyphs];
  const minX = Math.min(...visible.map((g) => g.x));
  const maxX = Math.max(...visible.map((g) => g.x + g.width));
  const width = maxX - minX;
  if (width < bodySize * 20) return [glyphs];

  const rowKey = (g: Glyph) => Math.round(g.y / Math.max(2, bodySize * 0.5));
  // The right column's lines share one left edge: try each x where ≥5 rows start
  const starts = new Map<number, Set<number>>();
  for (const g of visible) {
    const x = Math.round(g.x);
    if (x < minX + width * 0.3 || x > minX + width * 0.7) continue;
    if (!starts.has(x)) starts.set(x, new Set());
    starts.get(x)!.add(rowKey(g));
  }
  let best: { x: number; crossing: number } | null = null;
  for (const [sx, rows] of starts) {
    if (rows.size < 5) continue;
    const x = sx - 0.5;
    const crossingRows = new Set<number>();
    for (const g of visible) {
      if (g.x < x - 0.5 && g.x + g.width > x + 1.5) crossingRows.add(rowKey(g));
    }
    if (!best || crossingRows.size < best.crossing) best = { x, crossing: crossingRows.size };
  }
  if (!best) return [glyphs];

  const gutter = best.x;
  // Full width = reaches well into both columns (a banner that just overhangs the gap stays in its column)
  const isFull = (g: Glyph) => g.x < gutter - bodySize * 2 && g.x + g.width > gutter + bodySize * 2;
  const leftRows = new Set(visible.filter((g) => !isFull(g) && g.x < gutter).map(rowKey));
  const rightRows = new Set(visible.filter((g) => !isFull(g) && g.x >= gutter).map(rowKey));
  // Real columns: many rows of text on both sides and almost nothing crossing the gutter
  if (leftRows.size < 5 || rightRows.size < 5 || best.crossing > Math.min(leftRows.size, rightRows.size) * 0.25) {
    return [glyphs];
  }

  // Full-width rows (banners, wide headings) split the page into bands
  const fullRows = groupLines(glyphs.filter(isFull)).map((row) => ({ row, y: Math.max(...row.map((g) => g.y)) }));
  fullRows.sort((a, b) => b.y - a.y);
  const bandOf = (g: Glyph) => fullRows.filter((r) => r.y > g.y + bodySize * 0.3).length;

  const blocks: Glyph[][] = [];
  for (let band = 0; band <= fullRows.length; band++) {
    const rest = glyphs.filter((g) => !isFull(g) && bandOf(g) === band);
    // By centre: a heading box may start just left of the gap yet belong to the right column
    const left = rest.filter((g) => g.x + g.width / 2 < gutter);
    const right = rest.filter((g) => g.x + g.width / 2 >= gutter);
    if (left.length) blocks.push(left);
    if (right.length) blocks.push(right);
    if (band < fullRows.length) blocks.push(fullRows[band].row);
  }
  return blocks;
}

function groupLines(glyphs: Glyph[]): Glyph[][] {
  const sorted = [...glyphs].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { glyphs: Glyph[]; y: number; size: number }[] = [];

  for (const g of sorted) {
    const last = lines[lines.length - 1];
    const tolerance = Math.max(2, 0.4 * Math.min(g.size, last?.size ?? g.size));
    if (last && Math.abs(last.y - g.y) <= tolerance) {
      last.glyphs.push(g);
      // Running baseline — weighted towards the larger (body) text on the line
      const n = last.glyphs.length;
      last.y = (last.y * (n - 1) + g.y) / n;
      last.size = Math.max(last.size, g.size);
    } else {
      lines.push({ glyphs: [g], y: g.y, size: g.size });
    }
  }
  return lines.map((l) => l.glyphs);
}

function joinLine(glyphs: Glyph[]): Line {
  const raw = glyphs.map((g) => g.str).join('');
  const rtl = glyphs.some((g) => g.rtl) ? isMostlyRtl(raw) || glyphs.every((g) => g.rtl) : isMostlyRtl(raw);
  const ordered = [...glyphs].sort((a, b) => (rtl ? b.x - a.x : a.x - b.x));

  let text = '';
  let prev: Glyph | null = null;
  for (const g of ordered) {
    if (!prev) {
      text = g.str;
      prev = g;
      continue;
    }
    if (g.marker) {
      text = text.replace(/\s+$/, '') + g.str;
      prev = g;
      continue;
    }
    const alreadySpaced = /\s$/.test(text) || /^\s/.test(g.str);
    const punctuation = /^[.,;:!?)\]،؛؟]/.test(g.str);
    let wideGap = true;
    if (prev.width > 0) {
      const gap = rtl ? prev.x - (g.x + g.width) : g.x - (prev.x + prev.width);
      wideGap = gap > 0.15 * Math.min(prev.size, g.size);
    }
    text += !alreadySpaced && !punctuation && wideGap ? ` ${g.str}` : g.str;
    prev = g;
  }

  const sizes = glyphs.flatMap((g) => Array(Math.max(1, g.str.trim().length)).fill(g.size) as number[]);
  return {
    glyphs: ordered,
    y: median(glyphs.map((g) => g.y)),
    size: median(sizes),
    left: Math.min(...glyphs.map((g) => g.x)),
    right: Math.max(...glyphs.map((g) => g.x + g.width)),
    rtl,
    text: text.replace(/[ \t]{2,}/g, ' ').trim(),
  };
}

const MARKER_TEXT = /^[\d*†‡]{1,3}$/;
const PAGE_NUMBER_TEXT = /^[-–—|(\s]*(\d{1,4}|[ivxlc]{1,7})[-–—|)\s]*$/i;

export function weightedMedianSize(glyphs: Glyph[]): number {
  return median(glyphs.flatMap((g) => Array(Math.max(1, Math.min(g.str.trim().length, 200))).fill(g.size) as number[]));
}

/**
 * Raised footnote markers ("¹") sit slightly above the baseline, so they form
 * their own tiny "line". Fold them back into the line they belong to as "[n]".
 */
function mergeFootnoteMarkers(groups: Glyph[][], bodySize: number): Glyph[][] {
  const isMarkerGroup = (g: Glyph[]) => {
    const visible = g.filter((x) => x.str.trim());
    return visible.length > 0 && visible.every((x) => x.size <= bodySize * 0.88 && MARKER_TEXT.test(x.str.trim()));
  };
  const baseline = (g: Glyph[]) => median(g.map((x) => x.y));

  const result = groups.map((g) => [...g]);
  const removed = new Set<number>();
  result.forEach((group, i) => {
    if (!isMarkerGroup(group)) return;
    const y = baseline(group);
    let target = -1;
    let best = Infinity;
    result.forEach((other, j) => {
      if (j === i || removed.has(j) || isMarkerGroup(other)) return;
      const dy = y - baseline(other); // marker is above its line's baseline
      // …and horizontally within (or right next to) that line — never another column
      const left = Math.min(...other.map((o) => o.x));
      const right = Math.max(...other.map((o) => o.x + o.width));
      const near = group.every((m) => m.x >= left - bodySize * 2 && m.x <= right + bodySize * 2);
      const lineSize = Math.max(...other.map((o) => o.size));
      if (near && dy > 0 && dy <= Math.max(bodySize * 0.9, lineSize * 0.75) && dy < best) {
        best = dy;
        target = j;
      }
    });
    if (target < 0) return;
    for (const m of group) {
      if (m.str.trim()) result[target].push({ ...m, str: `[${m.str.trim()}]`, marker: true });
    }
    removed.add(i);
  });
  return result.filter((_, i) => !removed.has(i));
}

/**
 * A heading is real text: one script (OCR noise mixes Arabic and Latin),
 * mostly letters, and at least one proper word (not table cells like "h h").
 */
function looksLikeHeadingText(text: string): boolean {
  // A leading number ("(105) Sūrat al-Fil", "12. Prayer") is part of real headings
  const compact = text.replace(/^[\W_]*[([]?\s*\d{1,3}\s*[)\].:-]?/, '').replace(/\s+/g, '');
  const letters = (compact.match(/\p{L}/gu) || []).length;
  if (letters / Math.max(1, compact.length) < 0.7) return false;
  const arabic = (text.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  if (arabic > 0 && latin > 0) return false;
  return /\p{L}{4,}/u.test(text);
}

export function layoutTextItems(items: PdfTextItem[]): PageLayout {
  const glyphs = toGlyphs(items);
  if (glyphs.length === 0) return { text: '', headingLines: [] };

  const bodySize = weightedMedianSize(glyphs);
  let lines = mergeFootnoteMarkers(columnBlocks(glyphs, bodySize).flatMap(groupLines), bodySize)
    .map(joinLine)
    .filter((l) => l.text);
  if (lines.length === 0) return { text: '', headingLines: [] };

  // Normal line spacing: the smallest common gap between consecutive body-size lines
  const isBodySize = (l: Line) => Math.abs(l.size - bodySize) < bodySize * 0.15;
  const gaps: number[] = [];
  for (let i = 1; i < lines.length; i++) {
    const dy = lines[i - 1].y - lines[i].y;
    if (dy > 0 && isBodySize(lines[i]) && isBodySize(lines[i - 1])) gaps.push(dy);
  }
  const sortedGaps = [...gaps].sort((a, b) => a - b);
  const lineGap = sortedGaps[Math.floor(sortedGaps.length * 0.25)] || bodySize * 1.3;
  const isSmall = (l: Line) => l.size <= bodySize * 0.88;

  // Page furniture: a small running header above a gap, and a page number at the bottom
  if (lines.length >= 4) {
    const [first, second] = lines;
    if (isSmall(first) && first.text.length <= 90 && first.y - second.y > lineGap * 1.4) {
      lines = lines.slice(1);
    }
  }
  if (lines.length >= 2 && PAGE_NUMBER_TEXT.test(lines[0].text)) lines = lines.slice(1);
  if (lines.length >= 2) {
    const last = lines[lines.length - 1];
    if (PAGE_NUMBER_TEXT.test(last.text) || (isSmall(last) && last.text.length <= 12 && /\d/.test(last.text))) {
      lines = lines.slice(0, -1);
    }
  }

  // Footnote zone: small-font lines below the last body-size line
  let lastBody = -1;
  lines.forEach((l, i) => {
    if (!isSmall(l)) lastBody = i;
  });
  const footnoteStart = lastBody >= 0 && lastBody < lines.length - 1 ? lastBody + 1 : lines.length;

  const hasWidths = glyphs.some((g) => g.width > 0);
  const bodyLines = lines.slice(0, footnoteStart);
  const minLeft = Math.min(...bodyLines.map((l) => l.left));
  const maxRight = Math.max(...bodyLines.map((l) => l.right));
  const textWidth = Math.max(1, maxRight - minLeft);

  const headingLines: LayoutHeadingLine[] = [];
  const isHeading = (l: Line): LayoutHeadingLine['level'] | null => {
    if (bodySize <= 0 || l.text.length > 100 || l.text.split(/\s+/).length > 16) return null;
    if (!looksLikeHeadingText(l.text)) return null;
    const ratio = l.size / bodySize;
    if (ratio >= 1.6) return 1;
    // Larger Arabic/Urdu script inside an English page is a quotation, not a heading
    if (l.rtl || /[.,;]$/.test(l.text)) return null;
    if (ratio >= 1.08) return 2;
    return null;
  };

  const out: string[] = [];
  let pendingHeading: Line | null = null;

  for (let i = 0; i < footnoteStart; i++) {
    const line = lines[i];
    const prev = lines[i - 1];
    const level = isHeading(line);

    if (level) {
      // Consecutive large lines with the same size form one wrapped heading
      if (pendingHeading && Math.abs(pendingHeading.size - line.size) < 0.5 && prev === pendingHeading) {
        const h = headingLines[headingLines.length - 1];
        h.text = `${h.text} ${line.text}`;
        out[out.length - 1] = h.text;
        pendingHeading = line;
        continue;
      }
      if (out.length && out[out.length - 1] !== '') out.push('');
      out.push(line.text);
      headingLines.push({ text: line.text, level, size: Math.round(line.size * 10) / 10 });
      pendingHeading = line;
      continue;
    }

    if (pendingHeading) {
      out.push('');
      pendingHeading = null;
    } else if (prev) {
      const dy = prev.y - line.y;
      const bigGap = dy > lineGap * 1.5 || dy < 0; // dy < 0: new column / out-of-order block
      let shortEnd = false;
      let indented = false;
      if (hasWidths && ENDS_SENTENCE.test(prev.text)) {
        shortEnd = prev.rtl
          ? prev.left > minLeft + textWidth * 0.25
          : prev.right < minLeft + textWidth * 0.75;
        indented = !line.rtl && line.left > minLeft + line.size * 0.8 && line.right > minLeft + textWidth * 0.6;
      }
      if ((bigGap || shortEnd || indented) && out[out.length - 1] !== '') out.push('');
    }
    out.push(line.text);
  }

  // Footnotes: each "[n] …" starts its own paragraph; wrapped lines continue it
  const notes: string[] = [];
  for (const l of lines.slice(footnoteStart)) {
    if (/^\[[\d*†‡]{1,3}\]/.test(l.text) || notes.length === 0) notes.push(l.text);
    else notes[notes.length - 1] = `${notes[notes.length - 1]} ${l.text}`;
  }
  if (notes.length) {
    if (out.length && out[out.length - 1] !== '') out.push('');
    out.push(notes.join('\n\n'));
  }

  return {
    text: out.join('\n').replace(/\n{3,}/g, '\n\n').trim(),
    headingLines,
  };
}
