/**
 * Rotating daily benefit drawn from widely authenticated prophetic traditions.
 * Day index is deterministic from the local calendar date.
 */

export interface DailyBenefit {
  arabic?: string;
  english: string;
  reference: string;
  sourceSlug?: string;
}

const BENEFITS: DailyBenefit[] = [
  {
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
    english:
      'Actions are judged by intentions, and every person will have what they intended.',
    reference: 'Sahih al-Bukhari 1; Sahih Muslim 1907',
    sourceSlug: undefined,
  },
  {
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    english:
      'Whoever travels a path seeking knowledge, Allah makes easy for them a path to Paradise.',
    reference: 'Sahih Muslim 2699',
  },
  {
    english:
      'The believer who mixes with people and patiently bears their harm is better than the one who does not mix with people and does not bear their harm.',
    reference: 'Sunan Ibn Majah 4032; graded sound by many scholars',
  },
  {
    arabic: 'الدِّينُ النَّصِيحَةُ',
    english: 'The religion is sincere counsel.',
    reference: 'Sahih Muslim 55',
  },
  {
    english:
      'None of you truly believes until he loves for his brother what he loves for himself.',
    reference: 'Sahih al-Bukhari 13; Sahih Muslim 45',
  },
  {
    english:
      'Make things easy and do not make them difficult; give glad tidings and do not drive people away.',
    reference: 'Sahih al-Bukhari 69; Sahih Muslim 1734',
  },
  {
    english:
      'Allah does not look at your appearances or your wealth, but He looks at your hearts and your deeds.',
    reference: 'Sahih Muslim 2564',
  },
];

export function getDailyBenefit(date = new Date()): DailyBenefit {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return BENEFITS[dayOfYear % BENEFITS.length];
}
