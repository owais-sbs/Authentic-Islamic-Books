import {
  BookMarked,
  BookOpen,
  Brain,
  Heart,
  History,
  Landmark,
  Scale,
  ScrollText,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

/** Shared category icons — used on /categories and homepage subject cards. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  aqeedah: Landmark,
  hadith: ScrollText,
  tafsir: BookMarked,
  fiqh: Scale,
  seerah: BookOpen,
  history: History,
  ethics: Heart,
  spirituality: Sparkles,
  'islamic-thought': Brain,
  biography: UserRound,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? BookOpen;
}
