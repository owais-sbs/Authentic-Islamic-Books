import { libraryStats } from '@/data/libraryDemo';

interface LibraryHeaderProps {
  title?: string;
  subtitle?: string;
}

export function LibraryHeader({
  title = 'Islamic Digital Library',
  subtitle = 'Seven scholarly presentation formats for books, articles, quotations, and immersive reading.',
}: LibraryHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-gradient-to-b from-[#F7F3EA] via-ivory to-[#F0EBE0] dark:border-white/10 dark:from-black dark:via-[#0A0A0A] dark:to-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] dark:opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 28%, #C9A227 0%, transparent 42%), radial-gradient(circle at 82% 72%, #104C3B 0%, transparent 38%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent" />

      <div className="relative container-page flex flex-col items-center py-14 text-center sm:py-16 lg:py-20">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.26em] text-accent-dark dark:text-accent sm:text-xs">
          Scholarly Collection · Demonstration
        </p>
        <h1 className="mt-5 max-w-3xl font-sans text-3xl font-semibold leading-[1.3] tracking-tight text-islamic-green dark:text-white sm:text-4xl sm:leading-[1.28] lg:text-[2.75rem] lg:leading-[1.25]">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl font-sans text-[15px] font-normal leading-relaxed text-ink-600 dark:text-white/75 sm:text-base">
          {subtitle}
        </p>

        <dl className="mt-10 grid w-full max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line/60 shadow-soft dark:border-white/15 dark:bg-white/10 sm:grid-cols-4">
          {libraryStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white px-4 py-5 text-center dark:bg-[#141414] sm:px-5 sm:py-6"
            >
              <dt className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-ink-500 dark:text-white/65 sm:text-[11px]">
                {stat.label}
              </dt>
              <dd className="mt-2 font-sans text-2xl font-semibold text-accent-dark dark:text-accent sm:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
