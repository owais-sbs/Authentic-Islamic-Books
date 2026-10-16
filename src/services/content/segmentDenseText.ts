/**
 * Split dense PDF/import blobs (space-joined, few newlines) into
 * semantic units so Arabic / Qur'an / hadith / headings can be detected.
 */

const ARABIC_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Insert breaks before strong structural markers inside a single line/blob. */
const MARKER_SPLIT =
  /\s+(?=(?:Qur['’]?an|Quran)\s+\d|\b(?:Surah|Soorah)\s+[A-Za-z]|\bNarrated\b|\bIt is narrated\b|\bOn the authority of\b|\bSahih (?:al-)?(?:Bukhari|Muslim)\b|\bAbu Dawu[d]\b|\b(?:al-)?Tirmidhi\b|\bIbn Majah\b|\bIbn Taymiyyah said\b|\bIbn al-Qayyim said\b|\bSource\s*:|\bReference\s*:|\[\d{1,3}\]\s+\S|\bCHAPTER\s+(?:\d+|[IVXLC]+)\b|\bChapter\s+(?:\d+|[IVXLC]+)\b)/g;

/** Only very long runs without paragraph breaks are treated as dense blobs. */
const DENSE_BLOB_MIN = 600;

function isArabicChar(ch: string): boolean {
  return ARABIC_CHAR.test(ch);
}

function isLatinLetter(ch: string): boolean {
  return /[A-Za-z]/.test(ch);
}

/**
 * Split a string on transitions between substantial Arabic and Latin runs.
 * Preserves diacritics and does not break short mixed names mid-sentence
 * unless the Arabic run is long enough to be a quotation/ayah.
 */
export function splitByScriptRuns(text: string, minArabicRun = 12): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (!ARABIC_CHAR.test(trimmed) || !/[A-Za-z]/.test(trimmed)) return [trimmed];

  const parts: string[] = [];
  let buf = '';
  let mode: 'arabic' | 'latin' | 'other' | null = null;
  let arabicRun = 0;

  const flush = () => {
    const t = buf.trim();
    if (t) parts.push(t);
    buf = '';
    arabicRun = 0;
  };

  const chars = [...trimmed];
  /** Arabic letters ahead before the next Latin letter (spaces/punctuation skipped). */
  const arabicAhead = (from: number): number => {
    let n = 0;
    for (let k = from; k < chars.length; k++) {
      if (isLatinLetter(chars[k])) break;
      if (isArabicChar(chars[k])) n += 1;
    }
    return n;
  };

  for (let idx = 0; idx < chars.length; idx++) {
    const ch = chars[idx];
    const next: 'arabic' | 'latin' | 'other' = isArabicChar(ch)
      ? 'arabic'
      : isLatinLetter(ch)
        ? 'latin'
        : 'other';

    if (mode === null) {
      mode = next === 'other' ? null : next;
      buf += ch;
      if (next === 'arabic') arabicRun = 1;
      continue;
    }

    if (next === 'other' || next === mode) {
      buf += ch;
      if (next === 'arabic') arabicRun += 1;
      continue;
    }

    // Script switch latin ↔ arabic
    if (
      (mode === 'arabic' && next === 'latin' && arabicRun >= minArabicRun) ||
      (mode === 'latin' && next === 'arabic' && arabicAhead(idx) >= minArabicRun)
    ) {
      flush();
      mode = next;
      buf = ch;
      arabicRun = next === 'arabic' ? 1 : 0;
      continue;
    }

    buf += ch;
    if (next === 'arabic') {
      mode = 'arabic';
      arabicRun += 1;
    } else if (next === 'latin') {
      mode = 'latin';
    }
  }
  flush();
  return parts.length > 0 ? parts : [trimmed];
}

/** Split on structural markers then script runs. */
export function segmentDenseText(text: string): string[] {
  const raw = text.replace(/\r\n/g, '\n').trim();
  if (!raw) return [];

  // Already has paragraph structure — keep, but still split dense lines
  const paragraphs = raw.includes('\n')
    ? raw.split(/\n+/).map((l) => l.trim()).filter(Boolean)
    : [raw];

  const out: string[] = [];
  for (const para of paragraphs) {
    // Marker splits inside long blobs
    const markerParts =
      para.length > DENSE_BLOB_MIN
        ? para.split(MARKER_SPLIT).map((p) => p.trim()).filter(Boolean)
        : [para];

    for (const part of markerParts) {
      if (part.length > 60 && ARABIC_CHAR.test(part) && /[A-Za-z]/.test(part)) {
        out.push(...splitByScriptRuns(part));
      } else {
        out.push(part);
      }
    }
  }

  // Merge tiny fragments into previous (avoid over-segmentation of names)
  const merged: string[] = [];
  for (const piece of out) {
    if (
      merged.length > 0 &&
      piece.length < 8 &&
      !ARABIC_CHAR.test(piece) &&
      !/^\d+[.)]/.test(piece)
    ) {
      merged[merged.length - 1] = `${merged[merged.length - 1]} ${piece}`;
    } else {
      merged.push(piece);
    }
  }
  return merged;
}
