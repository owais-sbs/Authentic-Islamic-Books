/**
 * Split dense PDF/import blobs (space-joined, few newlines) into
 * semantic units so Arabic / Qur'an / hadith / headings can be detected.
 */

const ARABIC_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Insert breaks before strong structural markers inside a single line/blob. */
const MARKER_SPLIT =
  /\s+(?=(?:Qur['’]?an|Quran)\b|\b(?:Surah|Soorah)\s+[A-Za-z]|\bNarrated\b|\bIt is narrated\b|\bOn the authority of\b|\bThe Messenger of Allah\b|\bThe Prophet\b|\bSahih (?:al-)?(?:Bukhari|Muslim)\b|\bAbu Dawu[d]\b|\b(?:al-)?Tirmidhi\b|\bIbn Majah\b|\bIbn Taymiyyah said\b|\bIbn al-Qayyim said\b|\bShaykh .+ said\b|\bImam .+ said\b|\bSource\s*:|\bReference\s*:|\[\d{1,3}\]\s+\S|\b\d+\.\d+(?:\.\d+)?\s+[A-Z\u0600-\u06FF]|\bCHAPTER\s+(?:\d+|[IVXLC]+)\b|\bChapter\s+(?:\d+|[IVXLC]+)\b)/gi;

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

  for (const ch of trimmed) {
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
      (mode === 'latin' && next === 'arabic')
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
      para.length > 80
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
