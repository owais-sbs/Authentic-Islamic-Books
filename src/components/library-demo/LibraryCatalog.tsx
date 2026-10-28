import { demoCatalog } from '@/data/libraryDemo';
import { DemoBookCard } from './DemoBookCard';
import { DemoBookLibraryCard } from '@/components/demo-book';
import { Reveal, Stagger, StaggerItem } from '@/components/motion/Reveal';

export function LibraryCatalog() {
  return (
    <section className="container-page pb-16 sm:pb-20">
      <Reveal className="mb-8 flex flex-col gap-2 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-sans text-xl font-semibold leading-snug tracking-tight text-ink-900 sm:text-2xl">
            Demonstration Formats
          </h2>
          <p className="mt-3 font-sans text-[15px] leading-relaxed text-ink-600">
            Start with the bilingual Kutub-style demo book, then explore seven presentation formats.
          </p>
        </div>
        <p className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-ink-400">
          {demoCatalog.length + 1} formats
        </p>
      </Reveal>

      <Stagger className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        <StaggerItem className="h-full sm:col-span-2 xl:col-span-1">
          <DemoBookLibraryCard />
        </StaggerItem>
        {demoCatalog.map((book) => (
          <StaggerItem key={book.id} className="h-full">
            <DemoBookCard book={book} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
