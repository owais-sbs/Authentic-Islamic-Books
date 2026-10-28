import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import type { Category } from '@/types';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { Reveal } from '@/components/motion/Reveal';
import { SubjectIconBadge } from '@/components/home/SubjectIconBadge';

interface TopicExplorerProps {
  categories: Category[];
  bookCounts: Record<string, number>;
}

export function TopicExplorer({ categories, bookCounts }: TopicExplorerProps) {
  const topics = categories.slice(0, 8);

  return (
    <section className="bg-ivory py-12 sm:py-16 dark:bg-black">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-accent-dark">
            Browse by Subject
          </p>
          <h2 className="mt-2 font-sans text-2xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-3xl md:text-4xl">
            Explore Islamic Knowledge by Topic
          </h2>
          <p className="mt-3 font-sans text-sm text-ink-500 dark:text-white/65 sm:text-base">
            Find beneficial books across the subjects that matter most.
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:mt-10 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {topics.map((cat, i) => {
            const count = bookCounts[cat.id] ?? 0;
            const Icon = getCategoryIcon(cat.slug);

            return (
              <Reveal key={cat.id} delay={(i % 4) * 0.04}>
                <div className="topic-card-border h-full rounded-2xl p-[2px] shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-book">
                  <Link
                    to={`/library?category=${cat.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[14px] bg-white dark:bg-[#141414]"
                  >
                    <div className="relative h-[88px] bg-gradient-to-br from-[#E8EFE9] to-[#F4F1EA] dark:from-[#1A1A1A] dark:to-[#0D0D0D] sm:h-[100px]" />

                    <div className="relative flex flex-1 flex-col px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                      <div className="-mt-8 mb-3 flex justify-center sm:-mt-9">
                        <SubjectIconBadge icon={Icon} />
                      </div>
                      <h3 className="text-center font-sans text-[15px] font-bold text-ink-900 group-hover:text-islamic-green dark:text-white dark:group-hover:text-accent sm:text-base">
                        {cat.name}
                      </h3>
                      <p className="mt-1.5 flex-1 text-center font-sans text-xs leading-relaxed text-ink-500 dark:text-white/60 sm:text-[13px]">
                        {cat.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-sans text-[11px] text-ink-400 dark:text-white/45">
                          {count > 0
                            ? `${count} ${count === 1 ? 'book' : 'books'}`
                            : 'Explore'}
                        </span>
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent-dark transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <ArrowUpRight size={15} strokeWidth={2} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>

        {categories.length > 8 && (
          <Reveal className="mt-8 text-center">
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-islamic-green hover:text-accent-dark dark:text-accent dark:hover:text-accent-light"
            >
              View all categories <ArrowRight size={15} />
            </Link>
          </Reveal>
        )}
      </div>
    </section>
  );
}
