import { demoCatalog } from '@/data/libraryDemo';
import { DemoBookCard } from './DemoBookCard';

export function LibraryCatalog() {
  return (
    <section className="container-page pb-16 sm:pb-20">
      <div className="mb-8 flex flex-col gap-2 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-cinzel text-xl font-semibold tracking-wide text-ink-900 sm:text-2xl">
            Demonstration Formats
          </h2>
          <p className="mt-2 font-serif text-[15px] leading-relaxed text-ink-600">
            Seven formats — open any card for its full scholarly reading experience.
          </p>
        </div>
        <p className="font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-ink-400">
          {demoCatalog.length} formats
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
        {demoCatalog.map((book) => (
          <DemoBookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}
