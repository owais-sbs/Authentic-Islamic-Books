import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { hijriPeriods } from '@/data/periods';
import { books as allBooks } from '@/data/books';
import { scholars as allScholars } from '@/data/scholars';

export function TimelinePage() {
  return (
    <PageContainer>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Timeline' }]} />

        <div className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900">Hijri Timeline</h1>
          <p className="mt-2 text-ink-500 max-w-2xl">
            Explore the centuries of Islamic scholarship through the Hijri calendar. Click any period to
            discover books from that era.
          </p>
        </div>

        {/* Desktop horizontal timeline */}
        <div className="hidden md:block relative overflow-x-auto pb-6">
          <div className="relative min-w-[1000px]">
            {/* Line */}
            <div className="absolute top-[88px] left-0 right-0 h-px bg-line" />
            <div className="flex justify-between gap-2">
              {hijriPeriods.map((period, i) => {
                const bookCount = allBooks.filter(
                  (b) => b.hijriStart >= period.start && b.hijriEnd <= period.end
                ).length;
                const scholarCount = allScholars.filter(
                  (s) => s.bornHijri >= period.start && s.diedHijri <= period.end
                ).length;

                return (
                  <motion.div
                    key={period.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                    className="flex flex-col items-center w-20"
                  >
                    {/* Period label above */}
                    <div className="h-20 flex flex-col items-center justify-end text-center">
                      <span className="font-serif text-sm font-semibold text-ink-900">{period.start}</span>
                      <span className="text-xs text-ink-400">AH</span>
                    </div>
                    {/* Dot */}
                    <div className="relative z-10 mb-3 h-3 w-3 rounded-full bg-accent ring-4 ring-paper" />
                    {/* Card below */}
                    <Link
                      to={`/library?period=${period.id}`}
                      className="group w-full rounded-lg border border-line bg-cream p-3 text-center transition-all hover:border-accent hover:shadow-md"
                    >
                      <p className="text-[10px] text-ink-400">{period.label}</p>
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center justify-center gap-1 text-xs font-medium text-ink-900">
                          <BookOpen size={11} /> {bookCount}
                        </p>
                        <p className="flex items-center justify-center gap-1 text-xs text-ink-500">
                          <Users size={11} /> {scholarCount}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile vertical timeline */}
        <div className="md:hidden relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-line" />
          <div className="space-y-6">
            {hijriPeriods.map((period, i) => {
              const bookCount = allBooks.filter(
                (b) => b.hijriStart >= period.start && b.hijriEnd <= period.end
              ).length;
              const scholarCount = allScholars.filter(
                (s) => s.bornHijri >= period.start && s.diedHijri <= period.end
              ).length;

              return (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-4 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-paper" />
                  <Link
                    to={`/library?period=${period.id}`}
                    className="group block rounded-xl border border-line bg-cream p-4 transition-all hover:border-accent"
                  >
                    <p className="font-serif text-base font-semibold text-ink-900">{period.label}</p>
                    <p className="mt-1 text-xs text-ink-500 line-clamp-2">{period.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1 text-ink-600">
                        <BookOpen size={12} /> {bookCount} books
                      </span>
                      <span className="flex items-center gap-1 text-ink-600">
                        <Users size={12} /> {scholarCount} scholars
                      </span>
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-dark">
                      Explore <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
