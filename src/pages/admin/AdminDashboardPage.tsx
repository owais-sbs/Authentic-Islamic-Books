import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, Users, PlusCircle, GraduationCap } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { DashboardStatCard } from '@/components/admin/DashboardStatCard';
import { RecentBooksTable } from '@/components/admin/RecentBooksTable';
import { QuickActionCard } from '@/components/admin/QuickActionCard';
import type { RecentBook } from '@/components/admin/RecentBooksTable';

// ─── Mock data ────────────────────────────────────────────────────────────────
const stats = [
  {
    label: 'Total Books',
    value: 842,
    supporting: 'Books in the library',
    icon: BookOpen,
  },
  {
    label: 'Published',
    value: 816,
    supporting: 'Currently available',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
  },
  {
    label: 'Drafts',
    value: 26,
    supporting: 'Awaiting publication',
    icon: Clock,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
  },
  {
    label: 'Authors',
    value: 214,
    supporting: 'Authors in the library',
    icon: Users,
    iconColor: 'text-sky-600',
    iconBg: 'bg-sky-50',
  },
];

const recentBooks: RecentBook[] = [
  { id: 1, title: 'Foundations of Knowledge', author: 'Ibn Kathir', status: 'Published', created: 'Aug 20, 2026' },
  { id: 2, title: 'The Noble Life', author: 'Ibn Kathir', status: 'Published', created: 'Aug 18, 2026' },
  { id: 3, title: 'The Path of the Seeker', author: 'Al-Ghazali', status: 'Draft', created: 'Aug 15, 2026' },
  { id: 4, title: 'Garden of the Pious', author: 'Al-Nawawi', status: 'Published', created: 'Aug 12, 2026' },
  { id: 5, title: 'Revival of Religious Sciences', author: 'Al-Ghazali', status: 'Published', created: 'Aug 10, 2026' },
];

const quickActions = [
  {
    title: 'Add New Book',
    description: 'Create a book manually with metadata, chapters, and cover.',
    href: '/admin/books/new',
    icon: PlusCircle,
  },
  {
    title: 'Manage Books',
    description: 'Review, edit, and publish library books.',
    href: '/admin/books',
    icon: BookOpen,
  },
  {
    title: 'Add Scholar',
    description: 'Create a scholar profile.',
    href: '/admin/scholars/new',
    icon: GraduationCap,
  },
];

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AdminDashboardPage() {
  return (
    <AdminShell pageTitle="Dashboard">
      <div className="max-w-5xl space-y-8">

        {/* Page header */}
        <FadeIn>
          <AdminPageHeader
            title="Dashboard"
            description="Welcome back. Here's what's happening in your library."
          />
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.05}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <DashboardStatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                supporting={stat.supporting}
                icon={stat.icon}
                iconColor={stat.iconColor}
                iconBg={stat.iconBg}
              />
            ))}
          </div>
        </FadeIn>

        {/* Recent Books */}
        <FadeIn delay={0.1}>
          <RecentBooksTable books={recentBooks} />
        </FadeIn>

        {/* Quick Actions */}
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
