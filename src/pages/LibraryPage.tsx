import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { LibraryHeader, LibraryCatalog } from '@/components/library-demo';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';

/**
 * /library — demo presentation formats only.
 * Uploaded / published books appear on the homepage collection, not here.
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

      <Reveal className="container-page py-6 sm:py-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Library' }]} />
        <p className="mt-4 max-w-2xl font-sans text-[15px] leading-relaxed text-ink-600">
          Open a card to preview that format’s full reading layout. Uploaded books are
          available from the homepage collection.
        </p>
      </Reveal>

      <LibraryCatalog />

      <section className="border-t border-line bg-[#F3EDE2] dark:border-white/10 dark:bg-black">
        <div className="container-page py-12 sm:py-14">
          <Reveal as="div">
            <h2 className="font-sans text-xl font-semibold leading-snug tracking-tight text-ink-900 dark:text-white sm:text-2xl">
              Library Information
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <InfoBlock
              title="Card-based browsing"
              body="Each card opens one professional layout. The catalogue stays scannable while preserving long-form scholarly reading inside each work."
            />
            <InfoBlock
              title="Uploaded books"
              body="Books you import or add in the dashboard appear on the homepage library — not in this demo formats catalogue."
            />
            <InfoBlock
              title="Book 07 — Quiet Reading Room"
              body="An immersive open-book environment: cover, title, contents, chapters, Arabic sources, Aa settings, and night reading."
            />
          </Stagger>
        </div>
      </section>
    </PageContainer>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <StaggerItem>
      <h3 className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-dark dark:text-accent">
        {title}
      </h3>
      <p className="mt-3 font-sans text-[14px] leading-relaxed text-ink-600 dark:text-white/70">{body}</p>
    </StaggerItem>
  );
}
