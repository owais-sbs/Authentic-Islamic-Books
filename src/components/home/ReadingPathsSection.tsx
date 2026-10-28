import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { SubjectIconBadge } from '@/components/home/SubjectIconBadge';
import { getCategoryIcon } from '@/lib/categoryIcons';

const paths = [
  {
    title: 'Ramadan Reading',
    description:
      'A calm selection of Qur’an, reflection, and beneficial knowledge suited to the blessed month.',
    href: '/library?q=ramadan',
    icon: getCategoryIcon('spirituality'),
  },
  {
    title: '40 Hadith Series',
    description:
      'Guided reading around prophetic traditions with clear references and useful context.',
    href: '/library?category=hadith',
    icon: getCategoryIcon('hadith'),
  },
  {
    title: 'Seerah in 30 Days',
    description:
      'A structured journey through the life of Prophet Muhammad ﷺ using authentic materials.',
    href: '/library?category=seerah',
    icon: getCategoryIcon('seerah'),
  },
];

export function ReadingPathsSection() {
  return (
    <section className="bg-ivory py-8 sm:py-10 dark:bg-black">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-sans text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl md:text-4xl dark:text-white">
            Follow a Reading Path
          </h2>
          <p className="mt-3 font-sans text-sm text-ink-500 sm:text-base dark:text-white/65">
            Build a consistent reading habit with thoughtfully organized collections of beneficial
            knowledge.
          </p>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 md:grid-cols-3">
          {paths.map((path, i) => (
            <Reveal key={path.title} delay={i * 0.06}>
              <div className="topic-card-border h-full rounded-2xl p-[2px] shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-book">
                <article className="group flex h-full flex-col overflow-hidden rounded-[14px] bg-white dark:bg-[#141414]">
                  <div className="relative h-[96px] bg-gradient-to-br from-[#E8EFE9] to-[#F4F1EA] dark:from-[#1A1A1A] dark:to-[#0D0D0D] sm:h-[108px]" />

                  <div className="relative flex flex-1 flex-col px-5 pb-5 pt-0">
                    <div className="-mt-9 mb-4 flex justify-center">
                      <SubjectIconBadge icon={path.icon} size="lg" />
                    </div>
                    <h3 className="text-center font-sans text-lg font-bold tracking-tight text-ink-900 dark:text-white sm:text-xl">
                      {path.title}
                    </h3>
                    <p className="mt-2 flex-1 text-center font-sans text-sm leading-relaxed text-ink-500 dark:text-white/60">
                      {path.description}
                    </p>
                    <Link
                      to={path.href}
                      className="mt-5 inline-flex items-center justify-center gap-2 font-sans text-sm font-semibold text-islamic-green hover:text-accent-dark dark:text-accent dark:hover:text-accent-light"
                    >
                      Explore Reading Path <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
