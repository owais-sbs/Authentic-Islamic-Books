import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen, CheckCircle, Clock, AlertCircle,
  GraduationCap, Upload, ArrowRight,
  Archive, RefreshCw, Layers, ExternalLink,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DashboardStatCard } from '@/components/admin/DashboardStatCard';
import { QuickActionCard } from '@/components/admin/QuickActionCard';
import {
  fetchDashboardStats,
  fetchRecentBooks,
  type DashboardStats,
  type DashboardRecentBook,
} from '@/lib/bookApi';
import { isSupabaseConfigured } from '@/lib/supabase';
import { getAllImportedBooks } from '@/hooks/useBookStore';
import { BOOKS_CHANGED_EVENT } from '@/hooks/useAdminBooks';
import { useScholars, SCHOLARS_CHANGED_EVENT } from '@/hooks/useScholars';
import { useCategories, CATEGORIES_CHANGED_EVENT } from '@/hooks/useCategories';
import { formatDate } from '@/lib/utils';
import { BookStatusBadge } from '@/features/books/components/BookStatusBadge';

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white px-5 py-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 rounded bg-[#E5E1D8]" />
          <div className="h-8 w-16 rounded bg-[#E5E1D8]" />
          <div className="h-3 w-32 rounded bg-[#F1F0EB]" />
        </div>
        <div className="h-10 w-10 rounded-lg bg-[#E5E1D8]" />
      </div>
    </div>
  );
}

function RecentBooksTable({ books, loading }: { books: DashboardRecentBook[]; loading: boolean }) {
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#E5E1D8] px-5 py-4">
        <h3 className="text-[15px] font-semibold text-[#0B1B2B]">Recent Books</h3>
        <Link
          to="/admin/books"
          className="flex items-center gap-1.5 text-[12px] font-medium text-[#C9A646] transition-colors hover:text-[#a8873a]"
        >
          View All <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-[#E5E1D8] animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <div className="h-3.5 flex-1 rounded bg-[#E5E1D8]" />
              <div className="h-3.5 w-24 rounded bg-[#F1F0EB]" />
              <div className="h-5 w-20 rounded-full bg-[#E5E1D8]" />
              <div className="h-3 w-20 rounded bg-[#F1F0EB]" />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <BookOpen size={28} className="mx-auto text-[#CBD5E1] mb-3" />
          <p className="text-[14px] font-medium text-[#0B1B2B]">No books yet</p>
          <p className="mt-1 text-[13px] text-[#64748B]">Import or create your first book to see it here.</p>
          <Link
            to="/admin/books/import"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#C9A646] px-4 py-2 text-[13px] font-medium text-[#0B1B2B] transition-colors hover:bg-[#b8933d]"
          >
            <Upload size={13} /> Import Book
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#E5E1D8] bg-[#F7F6F2]">
                  {['Book', 'Author', 'Status', 'Updated'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-b border-[#E5E1D8] last:border-b-0 hover:bg-[#FAFAF8] transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/books/${book.id}/review`}
                        className="font-medium text-[#0B1B2B] hover:text-[#C9A646] transition-colors text-[13px]"
                      >
                        {book.title}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#64748B]">{book.authorName}</td>
                    <td className="px-5 py-3.5">
                      <BookStatusBadge status={book.status} />
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-[#94A3B8]">
                      {formatDate(book.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-[#E5E1D8] sm:hidden">
            {books.map((book) => (
              <li key={book.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <Link
                    to={`/admin/books/${book.id}/review`}
                    className="block text-[13px] font-semibold text-[#0B1B2B] hover:text-[#C9A646] leading-snug truncate"
                  >
                    {book.title}
                  </Link>
                  <p className="mt-0.5 text-[12px] text-[#64748B]">{book.authorName}</p>
                  <p className="mt-0.5 text-[11px] text-[#94A3B8]">{formatDate(book.updatedAt)}</p>
                </div>
                <div className="shrink-0 pt-0.5">
                  <BookStatusBadge status={book.status} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const quickActions = [
  {
    title: 'Import Book',
    description: 'Upload a PDF and auto-build the book structure for review.',
    href: '/admin/books/import',
    icon: Upload,
  },
  {
    title: 'Manage Books',
    description: 'Review, edit, and publish library books.',
    href: '/admin/books',
    icon: BookOpen,
  },
  {
    title: 'Add Scholar',
    description: 'Create a scholar profile linked to books.',
    href: '/admin/scholars',
    icon: GraduationCap,
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      {children}
    </motion.div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBooks, setRecent] = useState<DashboardRecentBook[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const { scholars } = useScholars();
  const { categories } = useCategories();

  const loadData = useCallback(async () => {
    setLoadingStats(true);
    setLoadingBooks(true);

    if (isSupabaseConfigured()) {
      const [s, r] = await Promise.allSettled([
        fetchDashboardStats(),
        fetchRecentBooks(8),
      ]);
      setStats(s.status === 'fulfilled' ? s.value : { total: 0, published: 0, drafts: 0, needsReview: 0, processing: 0, archived: 0 });
      setRecent(r.status === 'fulfilled' ? r.value : []);
    } else {
      const imported = getAllImportedBooks();
      type BookWithOptionalStatus = (typeof imported)[number] & {
        status?: import('@/features/books/types').BookStatus | string;
        authorName?: string;
      };
      const localBooks = imported as BookWithOptionalStatus[];
      const importedStats: DashboardStats = {
        total: localBooks.length,
        published: localBooks.filter((b) => b.status === 'published').length,
        drafts: localBooks.filter((b) => b.status === 'draft').length,
        needsReview: localBooks.filter((b) => b.status === 'needs_review').length,
        processing: localBooks.filter((b) => b.status === 'processing').length,
        archived: localBooks.filter((b) => b.status === 'archived').length,
      };
      const importedRecent: DashboardRecentBook[] = [...localBooks]
        .sort((a, b) => (b.addedDate ?? '').localeCompare(a.addedDate ?? ''))
        .slice(0, 8)
        .map((b) => ({
          id: b.id,
          title: b.title,
          authorName: b.authorName ?? b.authorId ?? '—',
          status: (b.status as import('@/features/books/types').BookStatus) || 'published',
          updatedAt: b.addedDate ?? new Date().toISOString().slice(0, 10),
        }));
      setStats(importedStats);
      setRecent(importedRecent);
    }

    setLoadingStats(false);
    setLoadingBooks(false);
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const refresh = () => void loadData();
    window.addEventListener(BOOKS_CHANGED_EVENT, refresh);
    window.addEventListener(SCHOLARS_CHANGED_EVENT, refresh);
    window.addEventListener(CATEGORIES_CHANGED_EVENT, refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener(BOOKS_CHANGED_EVENT, refresh);
      window.removeEventListener(SCHOLARS_CHANGED_EVENT, refresh);
      window.removeEventListener(CATEGORIES_CHANGED_EVENT, refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [loadData]);

  const s = stats;

  const statCards = s
    ? [
        {
          label: 'Total Books',
          value: s.total,
          supporting: 'Books in the library',
          icon: BookOpen,
          href: '/admin/books',
        },
        {
          label: 'Published',
          value: s.published,
          supporting: 'Live in public library',
          icon: CheckCircle,
          iconColor: 'text-emerald-600',
          iconBg: 'bg-emerald-50',
          href: '/admin/books',
        },
        {
          label: 'Needs Review',
          value: s.needsReview,
          supporting: 'Awaiting review',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
          iconBg: 'bg-amber-50',
          href: '/admin/books',
        },
        {
          label: 'Drafts',
          value: s.drafts,
          supporting: 'Work in progress',
          icon: Clock,
          iconColor: 'text-slate-500',
          iconBg: 'bg-slate-100',
          href: '/admin/books',
        },
      ]
    : [];

  return (
    <AdminShell pageTitle="Dashboard">
      <div className="max-w-5xl space-y-8">
        <FadeIn>
          <div className="flex items-start justify-between gap-4">
            <AdminPageHeader
              title="Dashboard"
              description="Live overview of your library — stats update when books, scholars, or categories change."
            />
            <div className="mt-1 flex shrink-0 items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#C9A646]/40 bg-[#C9A646]/10 px-3 py-2 text-[12px] font-medium text-[#C9A646] transition-colors hover:bg-[#C9A646]/20"
              >
                <ExternalLink size={13} />
                View Website
              </a>
              <button
                type="button"
                onClick={() => void loadData()}
                disabled={loadingStats}
                title="Refresh stats"
                className="flex items-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3 py-2 text-[12px] text-[#64748B] transition-colors hover:bg-[#F7F6F2] disabled:opacity-50"
              >
                <RefreshCw size={13} className={loadingStats ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {loadingStats
              ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
              : statCards.map((stat) => (
                  <DashboardStatCard
                    key={stat.label}
                    label={stat.label}
                    value={stat.value}
                    supporting={stat.supporting}
                    icon={stat.icon}
                    iconColor={stat.iconColor}
                    iconBg={stat.iconBg}
                    href={stat.href}
                  />
                ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <DashboardStatCard
              label="Scholars"
              value={scholars.length}
              supporting="Author profiles"
              icon={GraduationCap}
              href="/admin/scholars"
            />
            <DashboardStatCard
              label="Subjects"
              value={categories.length}
              supporting="Library categories"
              icon={Layers}
              href="/admin/categories"
            />
            <DashboardStatCard
              label="Processing"
              value={s?.processing ?? 0}
              supporting="Imports in progress"
              icon={Upload}
              iconColor="text-sky-600"
              iconBg="bg-sky-50"
              href="/admin/books"
            />
          </div>
        </FadeIn>

        {s && s.archived > 0 && (
          <FadeIn delay={0.1}>
            <Link
              to="/admin/books?view=archived"
              className="flex items-center gap-2 rounded-lg border border-[#E5E1D8] bg-white px-4 py-3 text-[13px] text-[#64748B] transition-colors hover:bg-[#F7F6F2] hover:text-[#0B1B2B]"
            >
              <Archive size={14} className="text-[#94A3B8]" />
              <span>
                <span className="font-semibold text-[#0B1B2B]">{s.archived}</span> archived book
                {s.archived !== 1 ? 's' : ''} — view or restore them
              </span>
              <ArrowRight size={13} className="ml-auto" />
            </Link>
          </FadeIn>
        )}

        <FadeIn delay={0.12}>
          <RecentBooksTable books={recentBooks} loading={loadingBooks} />
        </FadeIn>

        <FadeIn delay={0.15}>
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-[#0B1B2B]">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.title}
                  title={action.title}
                  description={action.description}
                  href={action.href}
                  icon={action.icon}
                />
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </AdminShell>
  );
}
