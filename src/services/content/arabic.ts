/** Arabic / Arabic-script detection (Unicode-aware, ratio-based). */

/** Arabic script ranges used in Islamic texts (Arabic + presentation forms). */
const ARABIC_CHAR =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Base letters only (no harakat / tatweel) — after NFKC presentation forms become these. */
const ARABIC_BASE =
  /[\u0621-\u063A\u0641-\u064A\u066E\u066F\u0671-\u06D3\u06EE\u06EF\u06FA-\u06FF]/;

const LATIN_LETTER = /[A-Za-z]/;

function baseLetterCount(token: string): number {
  let n = 0;
  for (const ch of token) {
    if (ARABIC_BASE.test(ch)) n += 1;
  }
  return n;
}

/** Map Arabic presentation forms → standard letters without touching harakat NFC. */
function unwrapPresentationForms(text: string): string {
  return text.replace(/[\uFB50-\uFDFF\uFE70-\uFEFF]/g, (ch) => ch.normalize('NFKC'));
}

/**
 * Repair PDF Arabic that arrives as spaced presentation glyphs / tatweel fragments
 * (e.g. "ـلـ ـلشـ ـيـ ـخـ" → "الشيخ" after cleanup).
 * Keeps real word spaces when tokens already look like normal Arabic words.
 */
export function repairFragmentedArabic(text: string): string {
  let t = unwrapPresentationForms(text)
    // Decorative tatweel / kashida between broken glyphs
    .replace(/\u0640+/g, '')
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
  if (!t || !ARABIC_CHAR.test(t)) return t;

  const tokens = t.split(/\s+/).filter(Boolean);
  const arabicTokens = tokens.filter((tok) => ARABIC_CHAR.test(tok));
  if (arabicTokens.length < 4) return t;

  const shortCount = arabicTokens.filter((tok) => baseLetterCount(tok) <= 2).length;
  const shortRatio = shortCount / arabicTokens.length;
  // Normal Arabic prose has multi-letter words — leave it alone
  if (shortRatio < 0.45) return t;

  const out: string[] = [];
  let buf = '';
  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = '';
    }
  };

  for (const tok of tokens) {
    if (!ARABIC_CHAR.test(tok)) {
      flush();
      out.push(tok);
      continue;
    }
    const n = baseLetterCount(tok);
    // Definite article often starts a new word in fragmented extracts
    if (/^ال/.test(tok) && buf.length >= 3) {
      flush();
      buf = tok;
      continue;
    }
    if (n <= 3) {
      buf += tok;
      continue;
    }
    flush();
    out.push(tok);
  }
  flush();
  return out.join(' ').replace(/[ \t]{2,}/g, ' ').trim();
}

export function countArabicChars(text: string): number {
  let n = 0;
  for (const ch of text) {
    if (ARABIC_CHAR.test(ch)) n += 1;
  }
  return n;
}

export function countMeaningfulChars(text: string): number {
  let n = 0;
  for (const ch of text) {
    if (/\s/.test(ch)) continue;
    if (/[\d.,;:!?'"“”‘’()[\]{}«»\-–—…]/.test(ch)) continue;
    n += 1;
  }
  return n;
}

/** Ratio of Arabic-script characters among non-space, non-punctuation characters. */
export function arabicRatio(text: string): number {
  const meaningful = countMeaningfulChars(text);
  if (meaningful === 0) return 0;
  return countArabicChars(text) / meaningful;
}

export function hasLatinLetters(text: string): boolean {
  return LATIN_LETTER.test(text);
}

/**
 * Classify a line/paragraph by script.
 * - arabic: predominantly Arabic script
 * - mixed: significant Arabic + Latin
 * - latin: little/no Arabic
 */
export function classifyScript(
  text: string,
): { kind: 'arabic' | 'mixed' | 'latin'; ratio: number } {
  const ratio = arabicRatio(text.trim());
  if (ratio >= 0.55) return { kind: 'arabic', ratio };
  if (ratio >= 0.2 && hasLatinLetters(text)) return { kind: 'mixed', ratio };
  if (ratio >= 0.35) return { kind: 'arabic', ratio };
  return { kind: 'latin', ratio };
}

export function isPrimarilyArabic(text: string, threshold = 0.55): boolean {
  return arabicRatio(text) >= threshold;
}

/** Split mixed text into Arabic-only vs Latin-only segments when both are substantial. */
export function splitMixedScript(text: string): { arabic?: string; latin?: string } {
  const trimmed = text.trim();
  if (!trimmed) return {};

  const { kind, ratio } = classifyScript(trimmed);
  if (kind === 'arabic') return { arabic: trimmed };
  if (kind === 'latin') return { latin: trimmed };

  // Token-level: consecutive Arabic runs vs Latin runs
  const arabicParts: string[] = [];
  const latinParts: string[] = [];
  const tokens = trimmed.split(/(\s+)/);

  let arabicBuf = '';
  let latinBuf = '';

  const flush = () => {
    if (arabicBuf.trim()) arabicParts.push(arabicBuf.trim());
    if (latinBuf.trim()) latinParts.push(latinBuf.trim());
    arabicBuf = '';
    latinBuf = '';
  };

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      if (arabicBuf) arabicBuf += token;
      else if (latinBuf) latinBuf += token;
      continue;
    }
    const tRatio = arabicRatio(token);
    if (tRatio >= 0.5) {
      if (latinBuf) flush();
      arabicBuf += token;
    } else {
      if (arabicBuf) flush();
      latinBuf += token;
    }
  }
  flush();

  const arabic = arabicParts.join(' ').trim() || undefined;
  const latin = latinParts.join(' ').trim() || undefined;

  // If split failed or one side is tiny, keep as mixed latin paragraph with original
  if (arabic && latin && ratio >= 0.2) return { arabic, latin };
  if (arabic && !latin) return { arabic };
  return { latin: trimmed };
}
