import { Link } from 'react-router-dom';
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
import { books as allBooks, getFeaturedBooks, getBooksByAuthor } from '@/data/books';
import { scholars as allScholars } from '@/data/scholars';
import { categories } from '@/data/categories';
import { hijriPeriods, formatHijriRange } from '@/data/periods';
import { BookGridAnimated } from '@/components/library/BookGrid';

const ABOUT_IMAGE =
  'https://images.pexels.com/photos/1537086/pexels-photo-1537086.jpeg?auto=compress&cs=tinysrgb&w=1920&h=600&fit=crop';

const SCHOLAR_FALLBACK =
  'https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop';

export function AboutPage() {
  // ── Data ─────────────────────────────────────────────────────────────────
  const stats = [
    { label: 'Books',     value: allBooks.length + '+',     icon: BookOpen },
    { label: 'Scholars',  value: allScholars.length + '+',  icon: Users },
    { label: 'Subjects',  value: categories.length + '+',   icon: Layers },
    { label: 'Hijri Eras', value: hijriPeriods.length,      icon: Clock },
  ];

  const featuredScholars = allScholars.slice(0, 4);

  const allFeatured = getFeaturedBooks();
  const featuredBooks = allFeatured.length >= 8
    ? allFeatured.slice(0, 8)
    : [...allFeatured, ...allBooks.filter((b) => !b.featured)].slice(0, 8);

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
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/95 via-ink-900/85 to-ink-900/60" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 to-ink-900/90" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-accent/60 via-accent/30 to-transparent" />

        <div className="relative z-10 container-page py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <p className="mb-3 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
              About
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-[1.12] tracking-tight text-white">
              The Islamic Digital Library
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-300 max-w-xl">
              A platform dedicated to making centuries of Islamic scholarship accessible — presented
              in structured, beautiful English reading experiences, not scanned PDFs.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-paper to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          2. STATS BAR  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper border-b border-line">
        <div className="container-page">
          <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center gap-2 py-8"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
                  <stat.icon size={18} className="text-accent" />
                </div>
                <p className="font-serif text-3xl font-semibold text-ink-900">{stat.value}</p>
                <p className="text-xs text-ink-500">{stat.label}</p>
              </motion.div>
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
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-3 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
                Our Mission
              </p>
              <h2 className="font-serif text-3xl font-semibold text-ink-900">
                Structured for Modern Readers
              </h2>
              <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-600">
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
              <p className="mb-1.5 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
                The Scholars
              </p>
              <h2 className="font-serif text-3xl font-semibold text-ink-900">Explore Scholars</h2>
              <p className="mt-2 text-sm text-ink-500">Meet the minds behind the works.</p>
            </div>
            <Link
              to="/scholars"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featuredScholars.map((scholar, i) => {
              const bookCount = getBooksByAuthor(scholar.id).length;
              return (
                <motion.div
                  key={scholar.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                >
                  <Link
                    to={`/scholars/${scholar.slug}`}
                    className="group flex flex-col overflow-hidden rounded-xl border border-line bg-cream transition-all hover:border-accent/60 hover:shadow-lg"
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
                        <span className="rounded-md border border-accent/30 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-accent backdrop-blur-sm">
                          {formatHijriRange(scholar.bornHijri, scholar.diedHijri)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3.5">
                      <div className="min-w-0">
                        <h3 className="font-serif text-sm font-semibold leading-tight text-ink-900 group-hover:text-accent-dark transition-colors line-clamp-1">
                          {scholar.name}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-ink-500">
                          {bookCount} {bookCount === 1 ? 'book' : 'books'}
                        </p>
                      </div>
                      <ChevronRight size={14} className="shrink-0 text-ink-400 group-hover:text-accent transition-colors ml-2" />
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
              <p className="mb-1.5 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
                The Collection
              </p>
              <h2 className="font-serif text-3xl font-semibold text-ink-900">Featured Books</h2>
              <p className="mt-2 text-sm text-ink-500">A curated selection from the collection.</p>
            </div>
            <Link
              to="/library"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <BookGridAnimated books={featuredBooks} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          6. HIJRI ERA TIMELINE  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="mb-1.5 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
                  Through the Ages
                </p>
                <h2 className="font-serif text-3xl font-semibold text-ink-900">Explore by Hijri Era</h2>
                <p className="mt-2 text-sm text-ink-500">
                  Journey through 14 centuries — select any era to browse its books.
                </p>
              </div>
              <Link
                to="/timeline"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-dark"
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
                    const count = allBooks.filter(
                      (b) => b.hijriStart >= period.start && b.hijriEnd <= period.end
                    ).length;
                    const active = count > 0;

                    return (
                      <motion.div
                        key={period.id}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.3) }}
                        className="flex flex-col items-center"
                      >
                        {/* Dot */}
                        <div
                          className={`relative z-10 mb-3 h-[1.375rem] w-[1.375rem] rounded-full border-2 flex items-center justify-center transition-all ${
                            active
                              ? 'border-accent bg-white shadow-[0_0_8px_2px_rgba(201,168,76,0.2)]'
                              : 'border-line bg-paper'
                          }`}
                        >
                          {active && <div className="h-1.5 w-1.5 rounded-full bg-accent" />}
                        </div>

                        {/* Card */}
                        <Link
                          to={active ? `/library?period=${period.id}` : '#'}
                          onClick={(e) => !active && e.preventDefault()}
                          className={`group w-full rounded-xl border p-3 text-center transition-all ${
                            active
                              ? 'border-line bg-cream hover:border-accent hover:shadow-md cursor-pointer'
                              : 'border-line/50 bg-paper opacity-40 cursor-default'
                          }`}
                        >
                          <p className={`font-serif text-[11px] font-bold leading-tight ${
                            active ? 'text-ink-900 group-hover:text-accent transition-colors' : 'text-ink-400'
                          }`}>
                            {period.start}–{period.end}
                          </p>
                          <p className={`mt-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                            active ? 'text-accent/60' : 'text-ink-300'
                          }`}>
                            AH
                          </p>
                          <div className="mt-2 h-px w-full bg-line/60" />
                          <p className={`mt-2 text-[11px] font-semibold ${
                            active ? 'text-accent' : 'text-ink-300'
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
            <p className="mb-2 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
              Disciplines
            </p>
            <h2 className="font-serif text-3xl font-semibold text-ink-900">Explore by Subject</h2>
            <p className="mt-2 text-sm text-ink-500">
              Find books across the major disciplines of Islamic scholarship.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat, i) => {
              const count = allBooks.filter((b) => b.categoryIds.includes(cat.id)).length;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
                >
                  <Link
                    to={`/library?category=${cat.slug}`}
                    className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-line bg-cream p-5 text-center transition-all hover:border-accent hover:shadow-md"
                  >
                    <div className="absolute top-0 right-0 h-12 w-12 bg-gradient-to-bl from-accent/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <p className="font-serif text-sm font-semibold text-ink-900 transition-colors group-hover:text-accent-dark">
                      {cat.name}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
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
            <p className="mb-2 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
              Simple &amp; Focused
            </p>
            <h2 className="font-serif text-3xl font-semibold text-ink-900">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { num: '01', icon: Compass,  title: 'Discover', desc: 'Explore books across centuries of Islamic scholarship.' },
              { num: '02', icon: BookOpen, title: 'Choose',   desc: 'Browse by scholar, Hijri period, subject, or title.' },
              { num: '03', icon: Type,     title: 'Read',     desc: 'Read in a clean, distraction-free reading experience.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative flex flex-col items-center rounded-2xl border border-line bg-cream p-8 text-center transition-all hover:border-accent/40 hover:shadow-md"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight size={16} className="text-accent/30" />
                  </div>
                )}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                  <step.icon size={22} strokeWidth={1.5} />
                </div>
                <p className="font-serif text-xs font-semibold uppercase tracking-widest text-accent/60">{step.num}</p>
                <h3 className="mt-2 font-serif text-xl font-semibold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          9. READING EXPERIENCE  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-page">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <p className="mb-3 font-serif text-xs font-semibold uppercase tracking-widest text-accent">The Reader</p>
              <h2 className="font-serif text-3xl font-semibold text-ink-900">Read Without Distractions</h2>
              <p className="mt-4 text-base leading-relaxed text-ink-600">
                Books are presented in a structured digital format — organized by chapters, sections
                and topics for a focused reading experience.
              </p>
              <ul className="mt-6 space-y-3.5">
                {[
                  { icon: Type,     text: 'Adjustable font size, line spacing, and reading width' },
                  { icon: BookOpen, text: 'Hierarchical table of contents with smooth navigation' },
                  { icon: Search,   text: 'Search inside any book and jump to results instantly' },
                  { icon: Bookmark, text: 'Bookmark sections and track your reading progress' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
                      <item.icon size={13} className="text-accent" />
                    </div>
                    <span className="text-sm text-ink-600">{item.text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/books/foundations-of-knowledge/read"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-ink-900 transition-all hover:bg-accent-light shadow-lg shadow-accent/20"
              >
                <BookOpen size={15} /> Explore the Reader
              </Link>
            </motion.div>

            {/* Mock reader UI — light themed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-2xl border border-line bg-cream shadow-xl shadow-ink-900/10">
                <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-line" />
                    <div className="h-2.5 w-2.5 rounded-full bg-line" />
                    <div className="h-2.5 w-2.5 rounded-full bg-line" />
                  </div>
                  <span className="ml-2 text-xs text-ink-500">Foundations of Knowledge</span>
                </div>
                <div className="flex">
                  <div className="hidden w-40 border-r border-line bg-paper p-4 sm:block">
                    <p className="mb-3 text-xs font-semibold text-ink-500">Contents</p>
                    <div className="space-y-1.5">
                      {['Introduction', '1. Foundations', '2. Principles', '3. Applications', '4. Reflections', '5. Conclusion'].map((s, j) => (
                        <div
                          key={j}
                          className={`rounded px-2 py-1 text-xs ${
                            j === 2
                              ? 'border border-accent/20 bg-accent/10 font-medium text-accent'
                              : 'text-ink-500'
                          }`}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <p className="font-serif text-xs uppercase tracking-wider text-accent">Chapter 2</p>
                    <h3 className="mt-1 font-serif text-lg font-semibold text-ink-900">Principles</h3>
                    <div className="mt-4 space-y-2.5">
                      {[1, 5/6, 4/5, 1, 3/4, 5/6, 2/3].map((w, j) => (
                        <div key={j} className="h-2 rounded-full bg-line" style={{ width: `${w * 100}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-2 -z-10 rounded-2xl bg-accent/5 blur-2xl opacity-50" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          10. WHAT YOU CAN DO  (light)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <p className="mb-3 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
                Features
              </p>
              <h2 className="font-serif text-3xl font-semibold text-ink-900">What You Can Do</h2>
            </motion.div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.3) }}
                  className="flex items-start gap-4 rounded-xl border border-line bg-cream p-5 transition-all hover:border-accent/40"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10">
                    <feature.icon size={18} className="text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-ink-900">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          11. CTA  (light bg, accent border)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container-page">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-accent/30 bg-paper px-8 py-14 text-center sm:px-12"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            <div className="relative">
              <p className="mb-3 font-serif text-xs font-semibold uppercase tracking-widest text-accent">
                Ready to Explore
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">
                Start Reading Today
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-500">
                No account needed. Open any book and experience the collection — structured,
                searchable, and designed for focused reading.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/library"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-ink-900 transition-all hover:bg-accent-light shadow-lg shadow-accent/20"
                >
                  <BookOpen size={15} /> Explore the Library
                </Link>
                <Link
                  to="/scholars"
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-cream px-6 py-3 text-sm font-medium text-ink-600 transition-all hover:border-accent/50 hover:text-accent"
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
