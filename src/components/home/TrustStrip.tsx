import { BookMarked, CheckCircle2, Library, Sparkles } from 'lucide-react';

const items = [
  { icon: BookMarked, label: 'Authentic Sources & References' },
  { icon: Library, label: 'Carefully Curated Books' },
  { icon: CheckCircle2, label: 'No Sign-Up Required' },
  { icon: Sparkles, label: 'Free Forever' },
];

function TrustItem({
  icon: Icon,
  label,
}: {
  icon: (typeof items)[number]['icon'];
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium text-islamic-green dark:text-white/85 sm:gap-2 sm:text-sm">
      <Icon size={15} className="shrink-0 text-accent-dark dark:text-accent" strokeWidth={1.75} />
      {label}
    </span>
  );
}

export function TrustStrip() {
  return (
    <section className="bg-[#F4F1EA] dark:bg-black">
      <div className="container-page py-5 sm:py-4">
        {/* Mobile: diamond — 1 / 2 / 1 */}
        <ul className="flex flex-col items-center gap-3 sm:hidden">
          <li>
            <TrustItem {...items[0]} />
          </li>
          <li className="flex w-full items-center justify-center gap-6 px-1">
            <TrustItem {...items[1]} />
            <TrustItem {...items[2]} />
          </li>
          <li>
            <TrustItem {...items[3]} />
          </li>
        </ul>

        {/* sm+: single row */}
        <ul className="hidden flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:flex">
          {items.map((item, i) => (
            <li key={item.label} className="flex items-center gap-6">
              <TrustItem {...item} />
              {i < items.length - 1 && (
                <span className="hidden h-4 w-px bg-line-strong dark:bg-white/15 md:block" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
