/**
 * Pattern libraries and confidence helpers for semantic book-content detection.
 * Prefer false negatives (leave as paragraph) over false positives.
 */

export const HIGH = 0.75;
export const MEDIUM = 0.5;
export const LOW = 0.35;

export type Detection = { type: string; confidence: number; meta?: Record<string, string> };

// ─── Qur'an references ────────────────────────────────────────────────────────

const SURAH_NAMES = [
  'Al-Fatihah',
  'Al-Faatihah',
  'Al-Baqarah',
  'Aal-e-Imran',
  "Ali 'Imran",
  'Aal Imran',
  'An-Nisa',
  "An-Nisa'",
  'An-Nisaa',
  'Al-Maidah',
  'Al-Ma’idah',
  'Al-Anam',
  "Al-An'am",
  'Al-Araf',
  "Al-A'raf",
  'Al-Anfal',
  'At-Tawbah',
  'At-Taubah',
  'Yunus',
  'Hud',
  'Yusuf',
  'Ar-Rad',
  "Ar-Ra'd",
  'Ibrahim',
  'Al-Hijr',
  'An-Nahl',
  'Al-Isra',
  'Al-Kahf',
  'Maryam',
  'Ta-Ha',
  'Taha',
  'Al-Anbiya',
  'Al-Hajj',
  'Al-Muminun',
  "Al-Mu'minun",
  'An-Nur',
  'An-Noor',
  'Al-Furqan',
  'Ash-Shuara',
  "Ash-Shu'ara",
  'An-Naml',
  'Al-Qasas',
  'Al-Ankabut',
  'Ar-Rum',
  'Luqman',
  'As-Sajdah',
  'Al-Ahzab',
  'Saba',
  'Fatir',
  'Ya-Sin',
  'Yasin',
  'As-Saffat',
  'Sad',
  'Az-Zumar',
  'Ghafir',
  'Fussilat',
  'Ash-Shura',
  'Az-Zukhruf',
  'Ad-Dukhan',
  'Al-Jathiyah',
  'Al-Ahqaf',
  'Muhammad',
  'Al-Fath',
  'Al-Hujurat',
  'Qaf',
  'Adh-Dhariyat',
  'At-Tur',
  'An-Najm',
  'Al-Qamar',
  'Ar-Rahman',
  'Al-Waqiah',
  'Al-Hadid',
  'Al-Mujadila',
  'Al-Hashr',
  'Al-Mumtahanah',
  'As-Saff',
  'Al-Jumuah',
  "Al-Jumu'ah",
  'Al-Munafiqun',
  'At-Taghabun',
  'At-Talaq',
  'At-Tahrim',
  'Al-Mulk',
  'Al-Qalam',
  'Al-Haqqah',
  'Al-Maarij',
  'Nuh',
  'Al-Jinn',
  'Al-Muzzammil',
  'Al-Muddaththir',
  'Al-Qiyamah',
  'Al-Insan',
  'Al-Mursalat',
  'An-Naba',
  'An-Naziat',
  'Abasa',
  'At-Takwir',
  'Al-Infitar',
  'Al-Mutaffifin',
  'Al-Inshiqaq',
  'Al-Buruj',
  'At-Tariq',
  'Al-Ala',
  "Al-A'la",
  'Al-Ghashiyah',
  'Al-Fajr',
  'Al-Balad',
  'Ash-Shams',
  'Al-Layl',
  'Ad-Duha',
  'Ash-Sharh',
  'At-Tin',
  'Al-Alaq',
  'Al-Qadr',
  'Al-Bayyinah',
  'Az-Zalzalah',
  'Al-Adiyat',
  'Al-Qariah',
  "Al-Qari'ah",
  'At-Takathur',
  'Al-Asr',
  'Al-Humazah',
  'Al-Fil',
  'Quraysh',
  'Al-Maun',
  "Al-Ma'un",
  'Al-Kawthar',
  'Al-Kafirun',
  'An-Nasr',
  'Al-Masad',
  'Al-Ikhlas',
  'Al-Falaq',
  'An-Nas',
].sort((a, b) => b.length - a.length);

const SURAH_ALT = SURAH_NAMES.map((n) => n.replace(/[-']/g, '[-’\'\\s]?')).join('|');

/** Explicit Qur'an citation labels (high confidence). */
export const QURAN_LABEL_RE = new RegExp(
  String.raw`^(?:Qur['’]?an|Quran|The\s+Qur['’]?an)\s*[-–—:]?\s*(.+)$`,
  'i',
);

export const QURAN_LABEL_ONLY = /^(?:Qur['’]?an|Quran)\.?$/i;

export const QURAN_REF_INLINE = new RegExp(
  String.raw`(?:Qur['’]?an|Quran)\s*(?:[-–—:,]?\s*)?(?:Surah\s+)?(?:(${SURAH_ALT})\s*[,:]?\s*)?(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?`,
  'i',
);

export const SURAH_REF_RE = new RegExp(
  String.raw`^(?:Surah|Soorah)\s+(${SURAH_ALT})\s*[,:]?\s*(?:\(?\s*(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?\s*\)?)?\.?$`,
  'i',
);

export const SURAH_NAME_REF_RE = new RegExp(
  String.raw`^(${SURAH_ALT})\s+(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?\.?$`,
  'i',
);

/** Bare verse pattern — NEVER enough alone. */
export const BARE_VERSE_RE = /^(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?\.?$/;

export const ALLAH_SAYS_RE =
  /\b(?:Allah|Allaah)\s+(?:says?|said|the\s+Exalted\s+says?|Most\s+High\s+says?)\b|\bAllah\s*,?\s*the\s+Exalted\s*,?\s*says\b|\bHe\s+(?:the\s+Exalted\s+)?says?\b/i;

export const FALSE_VERSE_CONTEXT =
  /\b(?:volume|vol\.?|page|pp?\.?|chapter|ch\.?|section|sec\.?|verse\s+of\s+poetry|hadith\s+no)\b/i;

// ─── Hadith ───────────────────────────────────────────────────────────────────

export const HADITH_SOURCES = [
  'Sahih al-Bukhari',
  'Sahih Bukhari',
  'Sahih Muslim',
  'Abu Dawud',
  'Abu Dawood',
  'Sunan Abu Dawud',
  'Tirmidhi',
  'al-Tirmidhi',
  'At-Tirmidhi',
  'Jami at-Tirmidhi',
  "Nasa'i",
  'Nasai',
  "an-Nasa'i",
  'An-Nasai',
  'Sunan an-Nasai',
  'Ibn Majah',
  'Sunan Ibn Majah',
  'Musnad Ahmad',
  'Muwatta',
  'Al-Muwatta',
  'Darimi',
  'Al-Darimi',
];

export const HADITH_SOURCE_RE = new RegExp(
  `^(?:[-–—]\\s*)?(?:Reported\\s+by\\s+|Narrated\\s+in\\s+|Source\\s*:\\s*)?(${HADITH_SOURCES.map(escapeReg).join('|')})\\b.*$`,
  'i',
);

export const NARRATED_RE =
  /^(?:It\s+is\s+narrated|Narrated(?:\s+by)?|On\s+the\s+authority\s+of|According\s+to)\b/i;

export const PROPHET_SAID_RE =
  /\b(?:The\s+)?(?:Prophet|Messenger\s+of\s+Allah|Messenger\s+of\s+Allaah)\s*(?:ﷺ|صلى الله عليه وسلم)?\s*(?:said|says)\b/i;

// ─── Scholar quotations ───────────────────────────────────────────────────────

export const SCHOLAR_SAID_RE =
  /^(?:(?:Shaykh|Sheikh|Imam|Al-Imam|Ibn|Al-|Ash-|Ad-|An-|As-|At-)?[\w'’.-]+(?:\s+(?:ibn|bin|al-)?[\w'’.-]+){0,4})\s+said\s*:?\s*$/i;

export const SCHOLAR_INLINE_RE =
  /^(Ibn\s+Taymiyyah|Ibn\s+al-Qayyim|Ibn\s+Baz|Ibn\s+Uthaymeen|Al-Nawawi|Imam\s+al-Nawawi|Al-Bukhari|Muslim|Ash-Shawkani|Ibn\s+Kathir|Al-Dhahabi|Ibn\s+Hajar)\s+said\s*:?\s*(.*)$/i;

export const ACCORDING_TO_SCHOLAR =
  /^According\s+to\s+(?:Shaykh|Sheikh|Imam|Ibn)\s+.+/i;

// ─── Book / source references ─────────────────────────────────────────────────

export const BOOK_REF_RE =
  /^(?:Source|Reference|See)\s*:\s*.+$/i;

export const VOLUME_PAGE_RE =
  /^(?:[-–—]\s*)?(?:[A-Z][\w'’.-]*(?:\s+[\w'’.-]+){0,6},?\s+)?(?:Vol\.?\s*\d+\s*,?\s*)?(?:p{1,2}\.?\s*\d+(?:\s*[-–—]\s*\d+)?)(?:\s*[.;])?$/i;

export const CLASSIC_CITATION_RE =
  /^(?:[-–—]\s*)?([A-Z][\w'’.-]*(?:\s+[\w'’.-/']+){0,8}),?\s+(\d{1,3})\s*\/\s*(\d{1,4})\.?$/;

export const MAJMU_RE =
  /Majmu['’]?\s*(?:al-)?Fatawa/i;

// ─── Footnotes ────────────────────────────────────────────────────────────────

export const FOOTNOTE_DEF_BRACKET = /^\[(\d{1,3})\]\s+(.+)$/;
export const FOOTNOTE_DEF_NUMBERED = /^(\d{1,3})\.\s+(.{20,})$/;
export const FOOTNOTE_MARKER_INLINE = /\[(\d{1,3})\]/g;

// ─── Headings ─────────────────────────────────────────────────────────────────

export const CHAPTER_HEADING_RE =
  /^(?:chapter|part|book|lesson|unit)\s+(\d+|[ivxlcdm]+)\s*[:\-–—]?\s*(.*)$/i;

export const NUMBERED_HEADING_RE =
  /^(\d{1,3}|[IVXLC]{1,6})[.)]\s+([A-Z\u0600-\u06FF].{2,90})$/;

export const DECIMAL_SECTION_RE =
  /^(\d+\.\d+(?:\.\d+)?)\s*[:\-–—.]?\s*(.{2,90})$/;

export const LETTER_HEADING_RE = /^([A-H])[.)]\s+([A-Z\u0600-\u06FF].{2,80})$/;

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function formatQuranReference(parts: {
  surah?: string;
  chapter: string;
  verse: string;
  endVerse?: string;
}): string {
  const range = parts.endVerse ? `${parts.chapter}:${parts.verse}-${parts.endVerse}` : `${parts.chapter}:${parts.verse}`;
  if (parts.surah) return `${parts.surah} ${range}`;
  return range;
}

export function parseQuranReferenceLine(line: string): {
  reference: string;
  confidence: number;
} | null {
  const t = line.trim();
  if (!t || t.length > 120) return null;

  if (FALSE_VERSE_CONTEXT.test(t) && !/Qur['’]?an|Surah/i.test(t)) {
    return null;
  }

  let m = QURAN_LABEL_RE.exec(t);
  if (m) {
    return { reference: normalizeRefLabel(t), confidence: 0.92 };
  }

  m = QURAN_REF_INLINE.exec(t);
  if (m && m.index === 0) {
    return {
      reference: formatQuranReference({
        surah: m[1],
        chapter: m[2],
        verse: m[3],
        endVerse: m[4],
      }),
      confidence: 0.9,
    };
  }

  m = SURAH_REF_RE.exec(t);
  if (m) {
    if (m[2] && m[3]) {
      return {
        reference: formatQuranReference({
          surah: m[1],
          chapter: m[2],
          verse: m[3],
          endVerse: m[4],
        }),
        confidence: 0.88,
      };
    }
    return { reference: `Surah ${m[1]}`, confidence: 0.7 };
  }

  m = SURAH_NAME_REF_RE.exec(t);
  if (m) {
    return {
      reference: formatQuranReference({
        surah: m[1],
        chapter: m[2],
        verse: m[3],
        endVerse: m[4],
      }),
      confidence: 0.85,
    };
  }

  // Bare 2:43 — only usable with neighbor context (caller decides)
  m = BARE_VERSE_RE.exec(t);
  if (m) {
    const ch = +m[1];
    const v = +m[2];
    if (ch >= 1 && ch <= 114 && v >= 1 && v <= 286) {
      return {
        reference: formatQuranReference({
          chapter: m[1],
          verse: m[2],
          endVerse: m[3],
        }),
        confidence: 0.35,
      };
    }
  }

  return null;
}

function normalizeRefLabel(text: string): string {
  return text.replace(/^Qur['’]?an\s*[-–—:]?\s*/i, 'Qur’an — ').replace(/^Quran\s*[-–—:]?\s*/i, 'Qur’an — ').trim();
}

export function looksLikeBookReference(line: string): { confidence: number } | null {
  const t = line.trim();
  if (!t || t.length > 160) return null;

  if (BOOK_REF_RE.test(t)) return { confidence: 0.85 };
  if (MAJMU_RE.test(t) && /\d/.test(t)) return { confidence: 0.88 };
  if (CLASSIC_CITATION_RE.test(t)) return { confidence: 0.8 };
  if (VOLUME_PAGE_RE.test(t) && t.length < 80) return { confidence: 0.72 };
  if (HADITH_SOURCE_RE.test(t)) return { confidence: 0.8 };
  if (/^[-–—]\s*.{5,100}$/.test(t) && /\d/.test(t)) return { confidence: 0.55 };

  return null;
}
