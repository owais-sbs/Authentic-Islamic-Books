/**
 * Paragraph/block-level language detection for English, Arabic, and Urdu.
 * Does not translate or rewrite — classification only.
 */

export type BookLanguage = 'en' | 'ar' | 'ur' | 'mixed' | 'unknown';
export type TextDirection = 'ltr' | 'rtl';

const ARABIC_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Characters strongly associated with Urdu orthography */
const URDU_SPECIFIC =
  /[\u0679\u067A\u067B\u067C\u067D\u067E\u067F\u0680\u0681\u0682\u0683\u0684\u0685\u0686\u0687\u0688\u0689\u068A\u068B\u068C\u068D\u068E\u068F\u0690\u0691\u0692\u0693\u0694\u0695\u0696\u0697\u0698\u0699\u06A9\u06AA\u06AB\u06AC\u06AD\u06AE\u06AF\u06B0\u06B1\u06B2\u06B3\u06B4\u06B5\u06B6\u06B7\u06B8\u06B9\u06BA\u06BB\u06BC\u06BD\u06BE\u06BF\u06C0\u06C1\u06C2\u06C3\u06C4\u06C5\u06C6\u06C7\u06C8\u06C9\u06CA\u06CB\u06CC\u06CD\u06CE\u06CF\u06D0\u06D1\u06D2\u06D3\u06D4]/;

const LATIN = /[A-Za-z]/;

function countMatches(text: string, re: RegExp): number {
  let n = 0;
  for (const ch of text) {
    if (re.test(ch)) n += 1;
  }
  return n;
}

function meaningfulLen(text: string): number {
  let n = 0;
  for (const ch of text) {
    if (/\s/.test(ch)) continue;
    if (/[\d.,;:!?'"“”‘’()[\]{}«»\-–—…]/.test(ch)) continue;
    n += 1;
  }
  return n;
}

export function detectLanguage(text: string): BookLanguage {
  const t = text.trim();
  if (!t) return 'unknown';

  const meaningful = meaningfulLen(t);
  if (meaningful === 0) return 'unknown';

  const arabicScript = countMatches(t, ARABIC_SCRIPT);
  const urduSpecific = countMatches(t, URDU_SPECIFIC);
  const latin = countMatches(t, LATIN);

  const scriptRatio = arabicScript / meaningful;
  const latinRatio = latin / meaningful;
  const urduAmongScript = arabicScript > 0 ? urduSpecific / arabicScript : 0;

  if (scriptRatio >= 0.45 && latinRatio >= 0.25) return 'mixed';

  if (scriptRatio >= 0.4) {
    // Urdu texts typically include Urdu-specific letters; Classical Arabic usually does not
    if (urduAmongScript >= 0.08 || urduSpecific >= 3) return 'ur';
    return 'ar';
  }

  if (latinRatio >= 0.4) return 'en';
  if (scriptRatio >= 0.2 && latinRatio >= 0.15) return 'mixed';
  if (scriptRatio >= 0.2) return urduAmongScript >= 0.08 ? 'ur' : 'ar';
  if (latinRatio >= 0.15) return 'en';

  return 'unknown';
}

export function directionForLanguage(lang: BookLanguage): TextDirection {
  if (lang === 'ar' || lang === 'ur') return 'rtl';
  return 'ltr';
}

export function languageMeta(text: string): {
  language: BookLanguage;
  direction: TextDirection;
} {
  const language = detectLanguage(text);
  return { language, direction: directionForLanguage(language) };
}

/** Aggregate languages present across many text samples. */
export function detectDocumentLanguages(samples: string[]): BookLanguage[] {
  const counts: Record<BookLanguage, number> = {
    en: 0,
    ar: 0,
    ur: 0,
    mixed: 0,
    unknown: 0,
  };
  for (const s of samples) {
    if (!s.trim() || s.trim().length < 12) continue;
    counts[detectLanguage(s)] += 1;
  }
  const ranked = (Object.keys(counts) as BookLanguage[])
    .filter((k) => k !== 'unknown' && k !== 'mixed' && counts[k] > 0)
    .sort((a, b) => counts[b] - counts[a]);

  if (counts.mixed > 0 && !ranked.includes('en')) ranked.push('en');
  if (counts.mixed > 0 && !ranked.includes('ar') && !ranked.includes('ur')) {
    ranked.push('ar');
  }
  return ranked.length > 0 ? ranked : ['unknown'];
}

export function formatLanguagesLabel(langs: BookLanguage[]): string {
  const map: Record<BookLanguage, string> = {
    en: 'English',
    ar: 'Arabic',
    ur: 'Urdu',
    mixed: 'Mixed',
    unknown: 'Unknown',
  };
  return langs.map((l) => map[l]).join(', ');
}
