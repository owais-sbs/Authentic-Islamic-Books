import { useParams, Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import {
  ClassicBookReader,
  ScholarlyArticle,
  NumberedRefutation,
  QuoteReader,
  AudioPdfReader,
  CombinedEdition,
  QuietReadingRoom,
} from '@/components/library-demo';
import { getDemoBySlug } from '@/data/libraryDemo';
import { usePageMeta } from '@/hooks/usePageMeta';

const readers = {
  'classic-book': ClassicBookReader,
  'research-article': ScholarlyArticle,
  'numbered-refutation': NumberedRefutation,
  'quote-reader': QuoteReader,
  'audio-pdf': AudioPdfReader,
  'combined-edition': CombinedEdition,
  'quiet-reading-room': QuietReadingRoom,
} as const;

export function LibraryDemoDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const demo = slug ? getDemoBySlug(slug) : undefined;

  usePageMeta({
    title: demo
      ? `${demo.title} — Islamic Digital Library`
      : 'Demo Book — Islamic Digital Library',
    description: demo?.excerpt ?? 'Scholarly demonstration format.',
    path: demo ? `/library/${demo.slug}` : '/library',
  });

  if (!demo) {
    return (
      <PageContainer>
        <div className="container-page py-20 text-center">
          <h1 className="font-cinzel text-2xl text-ink-900">Format not found</h1>
          <p className="mt-3 font-serif text-ink-600">
            This demonstration book does not exist.
          </p>
          <Link
            to="/library"
            className="mt-6 inline-flex rounded-sm bg-ink-900 px-5 py-2.5 text-sm font-medium text-cream hover:bg-ink-800"
          >
            Back to Library
          </Link>
        </div>
      </PageContainer>
    );
  }

  const Reader = readers[demo.id];

  return (
    <PageContainer>
      <div className="container-page pt-6 pb-2">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Library', href: '/library' },
            { label: `Book ${demo.number}` },
          ]}
        />
      </div>
      <Reader />
    </PageContainer>
  );
}
