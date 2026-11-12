import {
  BookCheck,
  BookOpen,
  Brain,
  Heart,
  Landmark,
  Scale,
  ScrollText,
  Sparkles,
  UserRound,
  Compass,
  type LucideIcon,
} from 'lucide-react';

/** Shared category icons — clean, modern, professional vector icons. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  quran: BookCheck,
  hadith: ScrollText,
  sunnah: Compass,
  history: Landmark,
  aqeedah: Landmark,
  tafsir: BookCheck,
  fiqh: Scale,
  seerah: Compass,
  ethics: Heart,
  spirituality: Sparkles,
  'islamic-thought': Brain,
  biography: UserRound,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? BookOpen;
}
