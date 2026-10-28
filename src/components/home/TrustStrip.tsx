import { BookMarked, CheckCircle2, Library, Sparkles } from 'lucide-react';

const items = [
  { icon: BookMarked, label: 'Authentic Sources & References' },
  { icon: Library, label: 'Carefully Curated Books' },
  { icon: CheckCircle2, label: 'No Sign-Up Required' },
  { icon: Sparkles, label: 'Free Forever' },
];

export function TrustStrip() {
  return (
    <section className="border-y border-line/80 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-[#141414]/80">
      <div className="container-page">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-3.5 sm:py-4">
          {items.map((item, i) => (
            <li key={item.label} className="flex items-center gap-6">
              <span className="inline-flex items-center gap-2 font-sans text-[12px] font-medium text-islamic-green dark:text-white/85 sm:text-sm">
                <item.icon size={16} className="shrink-0 text-accent-dark dark:text-accent" strokeWidth={1.75} />
                {item.label}
              </span>
              {i < items.length - 1 && (
                <span className="hidden h-4 w-px bg-line-strong dark:bg-white/15 sm:block" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
