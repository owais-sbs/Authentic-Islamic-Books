import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'cat-quran',
    slug: 'quran',
    name: "The Noble Qur'an",
    description: "Divine revelation, exegesis, word-by-word translations, and Quranic sciences.",
  },
  {
    id: 'cat-hadith',
    slug: 'hadith',
    name: 'Prophetic Hadith',
    description: 'Authentic collections of the sayings, actions, and approvals of Prophet Muhammad ﷺ.',
  },
  {
    id: 'cat-sunnah',
    slug: 'sunnah',
    name: 'Sunnah & Seerah',
    description: 'The noble life, exemplary character, daily practices, and blessed path of the Messenger ﷺ.',
  },
  {
    id: 'cat-history',
    slug: 'history',
    name: 'Islamic History',
    description: 'Chronicles of early Islam, the Rightly Guided Caliphs, notable scholars, and civilizations.',
  },
  // Legacy / granular categories mapped for backward compatibility
  {
    id: 'cat-aqeedah',
    slug: 'aqeedah',
    name: 'Aqeedah',
    description: 'Theological foundations and creed — beliefs and doctrine in Islam.',
  },
  {
    id: 'cat-tafsir',
    slug: 'tafsir',
    name: 'Tafsir',
    description: 'Exegesis and commentary on the meanings of the Qur’an.',
  },
  {
    id: 'cat-fiqh',
    slug: 'fiqh',
    name: 'Fiqh',
    description: 'Jurisprudence — practical application of Islamic law to worship and conduct.',
  },
  {
    id: 'cat-seerah',
    slug: 'seerah',
    name: 'Seerah',
    description: 'The life and biography of the Prophet Muhammad ﷺ.',
  },
];

export const PRIMARY_FOUR_CATEGORIES = categories.slice(0, 4);

export function getCategoryBySlug(slug: string): Category | undefined {
  if (slug === 'tafsir') return categories.find((c) => c.slug === 'quran') || categories[0];
  if (slug === 'seerah') return categories.find((c) => c.slug === 'sunnah') || categories[2];
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  if (id === 'cat-tafsir') return categories.find((c) => c.id === 'cat-quran') || categories[0];
  if (id === 'cat-seerah') return categories.find((c) => c.id === 'cat-sunnah') || categories[2];
  return categories.find((c) => c.id === id);
}
