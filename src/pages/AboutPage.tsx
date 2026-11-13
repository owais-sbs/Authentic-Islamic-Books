import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  Type,
  Bookmark,
  Clock,
  Users,
  ArrowRight,
  Globe,
  Layers,
  Compass,
  ChevronRight,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { hijriPeriods, formatHijriRange } from '@/data/periods';
import { BookGrid } from '@/components/library/BookGrid';
import { useLibraryFilters } from '@/hooks/useLibraryFilters';
import { useScholars } from '@/hooks/useScholars';
import { useCategories } from '@/hooks/useCategories';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useCountUp } from '@/hooks/useCountUp';
import type { LucideIcon } from 'lucide-react';

function StatCard({
  label,
  count,
  suffix = '',
  icon: Icon,
  delay,
}: {
  label: string;
  count: number;
  suffix?: string;
  icon: LucideIcon;
  delay: number;
}) {
  const [inView, setInView] = useState(false);
  const display = useCountUp(count, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      onViewportEnter={() => setInView(true)}
      className="group relative overflow-hidden rounded-2xl border border-line bg-cream p-5 sm:p-6 shadow-sm shadow-ink-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-[#1B4F72]/40 hover:shadow-lg hover:shadow-[#1B4F72]/10 glossy-card"
    >
      <div className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-full bg-[#1B4F72]/10 blur-2xl transition-opacity group-hover:opacity-100" />
      <div className="relative flex flex-col items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B4F72] text-white shadow-md shadow-[#1B4F72]/25">
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <div>
          <p className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-ink-900 tabular-nums">
            {display}
            {suffix}
          </p>
          <p className="mt-1 text-xs sm:text-sm font-medium uppercase tracking-[0.14em] text-[#64748B]">
            {label}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-0.5 origin-left scale-x-0 bg-[#1B4F72] transition-transform duration-300 group-hover:scale-x-100" />
    </motion.div>
  );
}

const ABOUT_IMAGE =
  'https://images.pexels.com/photos/1537086/pexels-photo-1537086.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop';

const SCHOLAR_FALLBACK =
  'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop';

export function AboutPage() {
  usePageMeta({
    title: 'About — Islamic Digital Library',
    description:
      'Learn about the Islamic Digital Library — a platform for structured English reading of authentic Islamic scholarship across centuries.',
    path: '/about',
  });

  const { filteredBooks: libraryBooks, totalBooks } = useLibraryFilters();
  const { scholars } = useScholars();
  const { categories } = useCategories();

  const bookCount = Math.max(totalBooks, libraryBooks.length);
  const stats = useMemo(
    () => [
      { label: 'Books', count: bookCount, suffix: '+', icon: BookOpen },
      { label: 'Scholars', count: scholars.length, suffix: '+', icon: Users },
      { label: 'Subjects', count: categories.length, suffix: '+', icon: Layers },
      { label: 'Hijri Eras', count: hijriPeriods.length, suffix: '', icon: Clock },
    ],
    [bookCount, scholars.length, categories.length],
  );

  const featuredScholars = scholars.slice(0, 4);

  const featuredBooks = useMemo(() => {
    const featured = libraryBooks.filter((b) => b.featured);
    if (featured.length >= 8) return featured.slice(0, 8);
    const rest = libraryBooks.filter((b) => !b.featured);
    return [...featured, ...rest].slice(0, 8);
  }, [libraryBooks]);

  return (
    <PageContainer>

      {/* ══════════════════════════════════════════════════════════════════
          1. HERO BANNER  (dark overlay — kept intentionally dark)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={ABOUT_IMAGE}
            alt="Islamic architecture"
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/55" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-blue-400/60 via-blue-400/30 to-transparent" />

        <div className="relative z-10 container-page py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <p className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-blue-300">
              About
            </p>
            <h1 className="font-sans text-4xl sm:text-5xl font-bold leading-[1.15] tracking-tight text-white">
              The Islamic Digital Library
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/85 max-w-xl font-sans">
              A platform dedicated to making centuries of Islamic scholarship accessible — presented
              in structured, beautiful English reading experiences, not scanned PDFs.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-paper to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. STATS — elevated metric cards
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-6 sm:-mt-8 pb-2">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                count={stat.count}
                suffix={stat.suffix}
                icon={stat.icon}
                delay={i * 0.07}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          3. MISSION  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72] dark:text-blue-400">
                Our Mission
              </p>
              <h2 className="font-sans text-3xl font-bold tracking-tight text-ink-900">
                Structured for Modern Readers
              </h2>
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-[#64748B]">
                <p>
                  The Islamic Digital Library is a platform for exploring centuries of Islamic
                  scholarship through a clean, structured reading experience. Rather than presenting
                  books as scanned PDFs, every work is rendered as carefully typeset web content —
                  organized by chapters, sections, and topics for focused, distraction-free reading.
                </p>
                <p>
                  We believe that the depth and beauty of the Islamic scholarly tradition deserves a
                  reading experience that reflects its significance. Every decision — from typography
                  to navigation — is made in service of the reader's engagement with the text.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          4. SCHOLARS  (light, 4 cards)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1.5 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72] dark:text-blue-400">
                The Scholars
              </p>
              <h2 className="font-sans text-3xl font-bold tracking-tight text-ink-900">Explore Scholars</h2>
              <p className="mt-2 text-sm text-[#64748B]">Meet the minds behind the works.</p>
            </div>
            <Link
              to="/scholars"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4F72] hover:text-[#154060] transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featuredScholars.map((scholar, i) => {
              const bookCount = libraryBooks.filter((b) => b.authorId === scholar.id).length;
              return (
                <motion.div
                  key={scholar.id}
                  initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                >
                  <Link
                    to={`/scholars/${scholar.slug || scholar.id}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-line bg-cream transition-all hover:border-[#1B4F72]/60 hover:shadow-lg glossy-card"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden bg-ink-100">
                      <img
                        src={scholar.imageUrl}
                        alt={scholar.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = SCHOLAR_FALLBACK;
                        }}
                        className="h-full w-full object-cover object-top grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="rounded-md border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                          {formatHijriRange(scholar.bornHijri, scholar.diedHijri)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3.5">
                      <div className="min-w-0">
                        <h3 className="font-sans text-sm font-bold leading-tight text-ink-900 group-hover:text-[#1B4F72] transition-colors line-clamp-1">
                          {scholar.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-[#64748B]">
                          {bookCount} {bookCount === 1 ? 'book' : 'books'}
                        </p>
                      </div>
                      <ChevronRight size={14} className="shrink-0 text-neutral-400 group-hover:text-[#1B4F72] transition-colors ml-2" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          5. FEATURED BOOKS  (light, 8 books)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1.5 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72] dark:text-blue-400">
                The Collection
              </p>
              <h2 className="font-sans text-3xl font-bold tracking-tight text-ink-900">Featured Books</h2>
              <p className="mt-2 text-sm text-[#64748B]">A curated selection from the collection.</p>
            </div>
            <Link
              to="/library"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4F72] hover:text-[#154060] transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <BookGrid books={featuredBooks} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. HIJRI ERA TIMELINE  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="mb-1.5 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72] dark:text-blue-400">
                  Through the Ages
                </p>
                <h2 className="font-sans text-3xl font-bold tracking-tight text-ink-900">Explore by Hijri Era</h2>
                <p className="mt-2 text-sm text-[#64748B]">
                  Journey through 14 centuries — select any era to browse its books.
                </p>
              </div>
              <Link
                to="/timeline"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#1B4F72] hover:text-[#154060] transition-colors"
              >
                Full Timeline <ArrowRight size={14} />
              </Link>
            </div>

            {/* Horizontal scrollable timeline strip */}
            <div className="overflow-x-auto pb-2 -mx-1 px-1">
              <div className="relative min-w-[700px]">
                {/* Spine line */}
                <div className="absolute top-[1.1rem] left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

                <div className="grid grid-cols-7 gap-2">
                  {hijriPeriods.slice(0, 14).map((period, i) => {
                    const count = libraryBooks.filter(
                      (b) => (b.hijriStart ?? 0) >= period.start && (b.hijriEnd ?? 0) <= period.end
                    ).length;
                    const active = count > 0;

                    return (
                      <motion.div
                        key={period.id}
                        initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.3) }}
                        className="flex flex-col items-center"
                      >
                        {/* Dot */}
                        <div
                          className={`relative z-10 mb-3 h-[1.375rem] w-[1.375rem] rounded-full border-2 flex items-center justify-center transition-all ${
                            active
                              ? 'border-[#1B4F72] bg-white shadow-[0_0_8px_2px_rgba(27,79,114,0.2)]'
                              : 'border-line bg-paper'
                          }`}
                        >
                          {active && <div className="h-1.5 w-1.5 rounded-full bg-[#1B4F72]" />}
                        </div>

                        {/* Card */}
                        <Link
                          to={active ? `/library?period=${period.id}` : '#'}
                          onClick={(e) => !active && e.preventDefault()}
                          className={`group w-full rounded-xl border p-3 text-center transition-all ${
                            active
                              ? 'border-line bg-cream hover:border-[#1B4F72] hover:shadow-md cursor-pointer'
                              : 'border-line/50 bg-paper opacity-40 cursor-default'
                          }`}
                        >
                          <p className={`font-sans text-[11px] font-bold leading-tight ${
                            active ? 'text-ink-900 group-hover:text-[#1B4F72] transition-colors' : 'text-ink-400'
                          }`}>
                            {period.start}–{period.end}
                          </p>
                          <p className={`mt-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                            active ? 'text-[#1B4F72]/70' : 'text-ink-300'
                          }`}>
                            AH
                          </p>
                          <div className="mt-2 h-px w-full bg-line/60" />
                          <p className={`mt-2 text-[11px] font-bold ${
                            active ? 'text-[#1B4F72]' : 'text-ink-300'
                          }`}>
                            {active ? `${count} ${count === 1 ? 'book' : 'books'}` : '—'}
                          </p>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          7. EXPLORE BY SUBJECT  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-10 text-center">
            <p className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72] dark:text-blue-400">
              Disciplines
            </p>
            <h2 className="font-sans text-3xl font-bold tracking-tight text-ink-900">Explore by Subject</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              Find books across the major disciplines of Islamic scholarship.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat, i) => {
              const count = libraryBooks.filter((b) => b.categoryIds.includes(cat.id)).length;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <Link
                    to={`/library?category=${cat.slug}`}
                    className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-line bg-cream p-5 text-center transition-all hover:border-[#1B4F72] hover:shadow-md glossy-card"
                  >
                    <div className="absolute top-0 right-0 h-12 w-12 bg-gradient-to-bl from-blue-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <p className="font-sans text-sm font-bold text-ink-900 transition-colors group-hover:text-[#1B4F72]">
                      {cat.name}
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      {count} {count === 1 ? 'book' : 'books'}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          8. HOW IT WORKS  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-12 text-center">
            <p className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72] dark:text-blue-400">
              Simple &amp; Focused
            </p>
            <h2 className="font-sans text-3xl font-bold tracking-tight text-ink-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { num: '01', icon: Compass,  title: 'Discover', desc: 'Explore books across centuries of Islamic scholarship.' },
              { num: '02', icon: BookOpen, title: 'Choose',   desc: 'Browse by scholar, Hijri period, subject, or title.' },
              { num: '03', icon: Type,     title: 'Read',     desc: 'Read in a clean, distraction-free reading experience.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex flex-col items-center rounded-2xl border border-line bg-cream p-8 text-center transition-all hover:border-[#1B4F72]/40 hover:shadow-md glossy-card"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={16} className="text-[#1B4F72]/30" />
                  </div>
                )}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-[#1B4F72]">
                  <step.icon size={22} strokeWidth={1.5} />
                </div>
                <p className="font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72]/70">{step.num}</p>
                <h3 className="mt-2 font-sans text-xl font-bold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          9. READING EXPERIENCE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-2xl"
          >
            <p className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72] dark:text-blue-400">
              The Reader
            </p>
            <h2 className="font-sans text-3xl font-bold tracking-tight text-ink-900">Read Without Distraction</h2>
            <p className="mt-4 text-base leading-relaxed text-[#64748B]">
              Books are presented in a structured digital format — organized by chapters, sections
              and topics for a focused reading experience.
            </p>
            <ul className="mt-6 space-y-3.5">
              {[
                { icon: Type, text: 'Adjustable font size, line spacing, and reading width' },
                { icon: BookOpen, text: 'Hierarchical table of contents with smooth navigation' },
                { icon: Search, text: 'Search inside any book and jump to results instantly' },
                { icon: Bookmark, text: 'Bookmark sections and track your reading progress' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50">
                    <item.icon size={13} className="text-[#1B4F72]" />
                  </div>
                  <span className="text-sm text-[#64748B]">{item.text}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/library"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#1B4F72] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-[#154060]"
            >
              <BookOpen size={15} /> Explore the Library
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          10. WHAT YOU CAN DO  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <p className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72] dark:text-blue-400">
                Features
              </p>
              <h2 className="font-sans text-3xl font-bold tracking-tight text-ink-900">What You Can Do</h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Search,
                  title: 'Search Everything',
                  desc: 'Find books, scholars, and topics with global search, or search inside any book for specific words and phrases.',
                },
                {
                  icon: Clock,
                  title: 'Explore by Era',
                  desc: 'Browse books across Hijri periods, from the early centuries to the modern age, using the interactive timeline.',
                },
                {
                  icon: Type,
                  title: 'Customize Your Reading',
                  desc: 'Adjust font size, line spacing, reading width, and choose between light, sepia, and dark reading themes.',
                },
                {
                  icon: Bookmark,
                  title: 'Bookmark & Track Progress',
                  desc: 'Save sections for later. Your reading progress is tracked automatically per book.',
                },
                {
                  icon: Globe,
                  title: 'Browse by Scholar',
                  desc: 'Explore scholars by name, era, and school of thought. Each scholar page links to their works.',
                },
                {
                  icon: Layers,
                  title: 'Filter by Subject',
                  desc: 'Navigate across the major disciplines — Tafsir, Hadith, Fiqh, Aqeedah, history, spirituality, and more.',
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                  whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.3) }}
                  className="group relative overflow-hidden rounded-2xl border border-line bg-cream p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#1B4F72]/45 hover:shadow-lg glossy-card"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1B4F72] via-blue-400 to-transparent opacity-80" />
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1B4F72] transition-colors duration-300 group-hover:bg-[#1B4F72] group-hover:text-white dark:bg-[#141414]">
                    <feature.icon size={20} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-sans text-lg font-bold text-ink-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          11. CTA  (light bg, theme border)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-8 py-14 text-center sm:px-12 shadow-sm glossy-card"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1B4F72]/40 to-transparent" />
            <div className="relative">
              <p className="mb-3 font-sans text-xs font-bold uppercase tracking-widest text-[#1B4F72]">
                Ready to Explore
              </p>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
                Start Reading Today
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#64748B]">
                No account needed. Open any book and experience the collection — structured,
                searchable, and designed for focused reading.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/library"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1B4F72] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#154060] shadow-lg shadow-[#1B4F72]/20"
                >
                  <BookOpen size={15} /> Explore the Library
                </Link>
                <Link
                  to="/scholars"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-neutral-50 px-6 py-3 text-sm font-medium text-ink-900 transition-all hover:border-[#1B4F72]/50 hover:text-[#1B4F72]"
                >
                  <Users size={14} /> Browse Scholars <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </PageContainer>
  );
}
