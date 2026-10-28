import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Reveal } from '@/components/motion/Reveal';

const footerSections = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse Books', href: '/library' },
      { label: 'Categories', href: '/categories' },
      { label: 'Authors', href: '/scholars' },
      { label: 'Collections', href: '/library?sort=popular' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Approach', href: '/about' },
      { label: 'Hijri Timeline', href: '/timeline' },
      { label: 'Bookmarks', href: '/bookmarks' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Reading Guides', href: '/about' },
      { label: 'Categories Guide', href: '/categories' },
      { label: 'Help & Bookmarks', href: '/bookmarks' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-islamic-green text-white dark:bg-black dark:border-t dark:border-white/10">
      <div className="container-page py-12 sm:py-14">
        <Reveal className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogo variant="onGreen" />
            <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-white/80">
              A peaceful digital library for discovering and reading authentic Islamic books —
              curated for students, seekers, and everyday readers.
            </p>
            <a
              href="mailto:hello@authenticislamicbooks.local"
              className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-medium text-white transition-colors hover:text-white/85"
            >
              <Mail size={15} />
              Contact
            </a>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-white">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="font-sans text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/20 pt-6 text-center sm:flex-row sm:text-left">
          <p className="font-sans text-xs text-white/60">
            © {new Date().getFullYear()} Authentic Islamic Books. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-sans text-xs text-white/60">
            <Link to="/about" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/about" className="transition-colors hover:text-white">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
