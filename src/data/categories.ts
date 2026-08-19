import type { Category } from '@/types';

export const categories: Category[] = [
  {
    id: 'cat-aqeedah',
    slug: 'aqeedah',
    name: 'Aqeedah',
    description: 'Theological foundations and creed — the study of beliefs and doctrine in Islam.',
  },
  {
    id: 'cat-hadith',
    slug: 'hadith',
    name: 'Hadith',
    description: 'Prophetic traditions, their collection, authentication, and sciences.',
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
    description: 'Jurisprudence — the practical application of Islamic law to worship and conduct.',
  },
  {
    id: 'cat-seerah',
    slug: 'seerah',
    name: 'Seerah',
    description: 'The life and biography of the Prophet Muhammad ﷺ.',
  },
  {
    id: 'cat-history',
    slug: 'history',
    name: 'History',
    description: 'Historical accounts of Islamic civilization, caliphates, and societies.',
  },
  {
    id: 'cat-ethics',
    slug: 'ethics',
    name: 'Ethics',
    description: 'Moral character, virtues, and ethical conduct in daily life.',
  },
  {
    id: 'cat-spirituality',
    slug: 'spirituality',
    name: 'Spirituality',
    description: 'Inner purification, devotion, and the spiritual dimensions of faith.',
  },
  {
    id: 'cat-thought',
    slug: 'islamic-thought',
    name: 'Islamic Thought',
    description: 'Philosophy, theology, and intellectual traditions within Islamic scholarship.',
  },
  {
    id: 'cat-biography',
    slug: 'biography',
    name: 'Biography',
    description: 'Lives of scholars, companions, and notable figures in Islamic history.',
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
