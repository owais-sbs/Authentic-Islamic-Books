import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHero } from '@/components/layout/PageHero';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ScholarCard } from '@/components/scholar/ScholarCard';
import { useScholars } from '@/hooks/useScholars';
import { usePageMeta } from '@/hooks/usePageMeta';
import { hijriPeriods } from '@/data/periods';

type SortOption = 'az' | 'za' | 'oldest' | 'newest';

const HERO_IMG =
  'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg?auto=compress&cs=tinysrgb&w=1600&h=700&fit=crop';

export function ScholarsPage() {
  usePageMeta({
    title: 'Scholars — Islamic Digital Library',
    description: 'Meet the scholars behind centuries of Islamic learning and explore their works.',
    path: '/scholars',
  });

  const { scholars: allScholars } = useScholars();
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [sort, setSort] = useState<SortOption>('az');

  const filteredScholars = useMemo(() => {
    let result = [...allScholars];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.shortBio.toLowerCase().includes(q)
      );
    }

    if (periodFilter) {
      const period = hijriPeriods.find((p) => p.id === periodFilter);
      if (period) {
        result = result.filter((s) => s.bornHijri >= period.start && s.diedHijri <= period.end);
      }
    }

    switch (sort) {
      case 'az':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'za':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'oldest':
        result.sort((a, b) => a.bornHijri - b.bornHijri);
        break;
      case 'newest':
        result.sort((a, b) => b.bornHijri - a.bornHijri);
        break;
    }

    return result;
  }, [allScholars, search, periodFilter, sort]);

  return (
    <PageContainer>
      <PageHero
        eyebrow="The Scholars"
        title="Voices Across the Centuries"
        description={`Browse ${allScholars.length} scholars from across the centuries of Islamic scholarship.`}
        imageUrl={HERO_IMG}
        compact
      />

      <div className="container-page py-8 sm:py-10">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Scholars' }]} />

        <div className="mb-6 mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scholars..."
              className="w-full rounded-xl border border-line bg-cream py-2.5 pl-10 pr-4 text-sm text-ink-800 placeholder:text-ink-400 focus:border-accent focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="rounded-xl border border-line bg-cream py-2.5 pl-3 pr-8 text-sm text-ink-800 focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value="">All Periods</option>
              {hijriPeriods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-xl border border-line bg-cream py-2.5 pl-3 pr-8 text-sm text-ink-800 focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value="az">A–Z</option>
              <option value="za">Z–A</option>
              <option value="oldest">Oldest First</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <p className="mb-6 text-sm text-ink-500">
          {filteredScholars.length} {filteredScholars.length === 1 ? 'scholar' : 'scholars'}
        </p>

        {filteredScholars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="font-serif text-lg font-semibold text-ink-900">No scholars found</h3>
            <p className="mt-2 text-sm text-ink-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {filteredScholars.map((scholar, i) => (
              <motion.div
                key={scholar.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.35) }}
              >
                <ScholarCard scholar={scholar} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
