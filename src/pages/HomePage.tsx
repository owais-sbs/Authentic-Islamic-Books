import { PageContainer } from '@/components/layout/PageContainer';
import {
  HomeHero,
  ContinueReadingHeroCard,
  FeaturedBigCard,
  TopFreeBooksSection,
  CategoryBookShelves,
  ReadingGoalsSection,
  MoreToExploreSection,
  TopicExplorer,
  TrustStrip,
  ScholarGrid,
  NewsletterSection,
} from '@/components/home';
import { useScholars } from '@/hooks/useScholars';
import { usePageMeta } from '@/hooks/usePageMeta';

export function HomePage() {
  usePageMeta({
    title: 'Authentic Islamic Books — Free Digital Islamic Library',
    description:
      'Explore authentic Islamic books across Qur’an, Hadith, Sunnah, and Islamic History in a clean, modern Apple Books reading experience.',
    path: '/',
  });

  const { scholars } = useScholars();

  return (
    <PageContainer>
      {/* 1. Premium Editorial Hero with Instant Search & 4 Core Categories */}
      <HomeHero />

      {/* 2. Previous Book / Continue Reading Hero Bar */}
      <ContinueReadingHeroCard />

      {/* 3. Featured Collection / Highlighted Big Card (Apple Books showcase) */}
      <FeaturedBigCard />

      {/* 4. Top Free Books Ranked Section (Ranks 1, 2, 3...) */}
      <TopFreeBooksSection />

      {/* 5. Reading Goals Section (Interactive circular arc gauge + Reading habit tracker) */}
      <ReadingGoalsSection />

      {/* 6. Four Primary Category Exploration Cards */}
      <TopicExplorer />

      {/* 7. Four Category Upright 3D Book Shelves (Qur'an, Hadith, Sunnah, History) */}
      <CategoryBookShelves />

      {/* 8. More to Explore (Stacked Wide Banners with Overlapping Books) */}
      <MoreToExploreSection />

      {/* 9. Renowned Classical Scholars Grid */}
      <ScholarGrid scholars={scholars} />

      {/* 10. Scholarly Verification & Authenticity Strip */}
      <TrustStrip />

      {/* 11. Newsletter / Join Readers */}
      <NewsletterSection />
    </PageContainer>
  );
}
