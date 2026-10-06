import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LibraryHeader, LibraryCatalog } from '@/components/library-demo';
import { usePageMeta } from '@/hooks/usePageMeta';

/**
 * /library — card catalog of static demo formats.
 * Click a card to open that book’s full layout at /library/:slug.
 * Demo content is frontend-only; Supabase library is unchanged.
 */
export function LibraryPage() {
  usePageMeta({
    title: 'Library — Islamic Digital Library',
    description:
      'Browse seven scholarly presentation formats for Islamic books, articles, quotations, and immersive reading.',
    path: '/library',
  });

  return (
    <PageContainer>
      <LibraryHeader />

      <div className="container-page py-6 sm:py-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Library' }]} />
        <p className="mt-4 max-w-2xl font-serif text-[15px] leading-relaxed text-ink-600">
          Open a card to preview that format’s full reading layout. Each work is separate — Book
          07 is a fullscreen Quiet Reading Room for long-form study.
        </p>
      </div>

      <LibraryCatalog />

      <section className="border-t border-line bg-ink-900">
        <div className="container-page py-12 sm:py-14">
          <h2 className="font-cinzel text-xl font-semibold tracking-wide text-white sm:text-2xl">
            Library Information
          </h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <InfoBlock
              title="Card-based browsing"
              body="Each card opens one professional layout. The catalogue stays scannable while preserving long-form scholarly reading inside each work."
            />
            <InfoBlock
              title="References & integrity"
              body="Demo quotations and attributions are illustrative. Production content should cite verified editions. Your live Supabase catalogue is not modified by these demos."
            />
            <InfoBlock
              title="Book 07 — Quiet Reading Room"
              body="An immersive open-book environment: cover, title, contents, chapters, Arabic sources, Aa settings, and night reading — less UI, more reading."
            />
          </div>
        </div>
      </section>
    </PageContainer>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        {title}
      </h3>
      <p className="mt-3 font-serif text-[14px] leading-relaxed text-white/70">{body}</p>
    </div>
  );
}
