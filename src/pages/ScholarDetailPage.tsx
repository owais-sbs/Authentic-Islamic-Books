import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, MapPin, Calendar } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Badge } from '@/components/ui/Badge';
import { BookGrid } from '@/components/library/BookGrid';
import { useScholars } from '@/hooks/useScholars';
import { useCategories } from '@/hooks/useCategories';
import { getScholarBySlug } from '@/data/scholars';
import { getSupabasePublishedCache } from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { formatHijriRange } from '@/data/periods';
import { NotFoundPage } from './NotFoundPage';
import type { Scholar } from '@/types';

export function ScholarDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { scholars, loading } = useScholars();
  const { categories } = useCategories();

  const normalizedSlug = slug ? decodeURIComponent(slug).toLowerCase().trim() : '';

  const scholar = useMemo(() => {
    if (!normalizedSlug) return undefined;

    const findMatch = (list: Scholar[]) =>
      list.find((s) => {
        const sSlug = (s.slug || '').toLowerCase().trim();
        const sId = (s.id || '').toLowerCase().trim();
        const sNameSlug = (s.name || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        return (
          (sSlug && sSlug === normalizedSlug) ||
          (sId && sId === normalizedSlug) ||
          (sNameSlug && sNameSlug === normalizedSlug) ||
          (sId && sId.includes(normalizedSlug)) ||
          (sSlug && normalizedSlug.includes(sSlug) && sSlug.length > 3)
        );
      });

    return findMatch(scholars) || getScholarBySlug(normalizedSlug);
  }, [normalizedSlug, scholars]);

  const books = useMemo(() => {
    if (!scholar) return [];

    const supabaseBooks = getSupabasePublishedCache();
    const importedBooks = getAllImportedBooks();

    // When Supabase is configured use only cloud books; otherwise use local imports
    const source = isSupabaseConfigured()
      ? supabaseBooks
      : importedBooks;

    return source.filter(
      (b) =>
        b.authorId === scholar.id ||
        b.authorId === scholar.slug ||
        (b as { authorName?: string }).authorName === scholar.name
    );
  }, [scholar]);

  if (!scholar) {
    if (loading) {
      return (
        <PageContainer>
          <div className="container-page py-20 text-center text-ink-500 font-medium">
            Loading scholar profile…
          </div>
        </PageContainer>
      );
    }
    return <NotFoundPage />;
  }

  const scholarCategories = (scholar.categories || [])
    .map((id) => categories.find((c) => c.id === id || c.slug === id))
    .filter(Boolean);

  return (
    <PageContainer>
      <div className="container-page py-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Scholars', href: '/scholars' },
            { label: scholar.name },
          ]}
        />

        {/* Scholar header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12 grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          <div className="sm:col-span-1">
            <div className="aspect-[4/5] max-h-64 sm:max-h-none overflow-hidden rounded-xl border border-line bg-ink-900/5">
              {scholar.imageUrl ? (
                <img
                  src={scholar.imageUrl}
                  alt={scholar.name}
                  className="h-full w-full object-cover grayscale"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-ink-300 font-serif text-4xl font-bold bg-cream">
                  {scholar.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900">
              {scholar.name}
            </h1>
            <p className="mt-1 text-sm text-ink-400">{scholar.fullName}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-600">
              <span className="flex items-center gap-1.5">
                <Calendar size={15} className="text-ink-400" />
                {formatHijriRange(scholar.bornHijri, scholar.diedHijri)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-ink-400" />
                {scholar.bornPlace || 'Unknown'}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen size={15} className="text-ink-400" />
                {books.length} {books.length === 1 ? 'book' : 'books'}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {scholarCategories.map((cat) => cat && (
                <Badge key={cat.id} variant="accent">{cat.name}</Badge>
              ))}
            </div>

            <p className="mt-5 text-base leading-relaxed text-ink-600">{scholar.fullBio || scholar.shortBio}</p>
          </div>
        </motion.div>

        {/* Timeline */}
        {scholar.timelineEvents && scholar.timelineEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-6 font-serif text-xl font-semibold text-ink-900">Scholar Timeline</h2>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-line" />
              <div className="space-y-6">
                {scholar.timelineEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                    className="relative pl-6"
                  >
                    <div className="absolute left-0 top-1.5 h-2 w-2 -translate-x-1/2 rounded-full bg-accent ring-4 ring-paper" />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-serif text-sm font-semibold text-accent-dark tabular-nums">
                        {event.year} AH
                      </span>
                      <span className="text-sm font-medium text-ink-900">{event.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-500">{event.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Books */}
        <div>
          <h2 className="mb-6 font-serif text-xl font-semibold text-ink-900">
            Books by {scholar.name}
          </h2>
          {books.length > 0 ? (
            <BookGrid books={books} />
          ) : (
            <p className="text-sm text-ink-500">No books available yet.</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
