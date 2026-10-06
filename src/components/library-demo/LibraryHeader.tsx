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
    <header className="relative overflow-hidden border-b border-line bg-gradient-to-b from-ink-900 via-ink-800 to-ink-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #C9A84C 0%, transparent 40%), radial-gradient(circle at 80% 70%, #2D5A42 0%, transparent 35%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

      <div className="relative container-page py-12 sm:py-14 lg:py-16">
        <p className="font-serif text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Scholarly Collection · Demonstration
        </p>
        <h1 className="mt-3 max-w-3xl font-cinzel text-3xl font-semibold leading-[1.15] tracking-wide text-white sm:text-4xl lg:text-[2.65rem]">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl font-serif text-base leading-relaxed text-white/75 sm:text-lg">
          {subtitle}
        </p>

        <dl className="mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/10 bg-white/10 sm:grid-cols-4">
          {libraryStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-ink-900/80 px-4 py-4 text-center sm:px-5 sm:py-5"
            >
              <dt className="font-sans text-[10px] font-medium uppercase tracking-[0.14em] text-white/50 sm:text-[11px]">
                {stat.label}
              </dt>
              <dd className="mt-1.5 font-cinzel text-2xl font-semibold text-accent sm:text-3xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
