import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { categories } from '@/data/categories';
import { books as allBooks } from '@/data/books';

export function CategoriesPage() {
  return (
    <PageContainer>
      <div className="container-page py-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Categories' }]} />

        <div className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900">Categories</h1>
          <p className="mt-2 text-ink-500 max-w-2xl">
            Browse books by subject — from theology and jurisprudence to history and spirituality.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((cat, i) => {
            const count = allBooks.filter((b) => b.categoryIds.includes(cat.id)).length;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Link
                  to={`/library?category=${cat.slug}`}
                  className="group flex h-full flex-col rounded-xl border border-line bg-cream p-6 transition-all hover:border-accent hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900/5 text-ink-900">
                      <BookOpen size={18} strokeWidth={1.5} />
                    </div>
                    <span className="text-xs text-ink-400">{count} {count === 1 ? 'book' : 'books'}</span>
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-ink-900">{cat.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{cat.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors group-hover:text-accent-dark">
                    Browse Books <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
