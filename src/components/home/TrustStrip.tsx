import { BookOpen, Heart, Library, Users } from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Authentic Sources',
    description: 'Based on the Qur’an, Sunnah and trusted scholars.',
  },
  {
    icon: Library,
    title: 'Wide Collection',
    description: 'From Hadith to Tafsir, Fiqh to Islamic history and more.',
  },
  {
    icon: Users,
    title: 'Trusted Scholars',
    description: 'Carefully selected and verified works from renowned scholars.',
  },
  {
    icon: Heart,
    title: 'For Every Seeker',
    description: 'Whether you are a beginner or a lifelong student, there is something for you.',
  },
];

export function TrustStrip() {
  return (
    <section className="border-y border-line/70 bg-[#F7F4EE] dark:border-white/10 dark:bg-[#0A0A0A]">
      <div className="container-page py-6 sm:py-7">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4 lg:gap-0">
          {features.map((item, i) => (
            <li
              key={item.title}
              className={`flex flex-col items-center px-2 text-center sm:px-4 ${
                i < features.length - 1 ? 'lg:border-r lg:border-line/80 dark:lg:border-white/10' : ''
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={1.5}
                className="text-accent-dark dark:text-accent"
                aria-hidden
              />
              <h3 className="mt-2.5 font-sans text-[13px] font-bold text-islamic-green dark:text-white sm:text-sm">
                {item.title}
              </h3>
              <p className="mt-1 max-w-[16rem] font-sans text-[11px] leading-snug text-ink-500 dark:text-white/55 sm:text-xs">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
