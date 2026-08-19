import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Mail } from 'lucide-react';

const footerSections = [
  {
    title: 'Library',
    links: [
      { label: 'Explore Books', href: '/library' },
      { label: 'Scholars', href: '/scholars' },
      { label: 'Timeline', href: '/timeline' },
      { label: 'Categories', href: '/categories' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Bookmarks', href: '/bookmarks' },
      { label: 'Reading Guide', href: '/about' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-700 bg-ink-900">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-ink-900">
                <BookOpen size={18} strokeWidth={1.5} />
              </div>
              <span className="text-sm font-semibold text-cream">Islamic Digital Library</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
              A digital platform exploring centuries of Islamic scholarship through a clean,
              structured reading experience. Built for students, researchers, and general readers.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Github, Twitter, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-ink-600 text-ink-300 transition-colors hover:border-accent hover:text-accent"
                  aria-label="Social link"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-accent">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-ink-300 transition-colors hover:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-700 pt-6 sm:flex-row">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} Islamic Digital Library. All sample content is for demonstration purposes.
          </p>
          <p className="text-xs text-ink-400">
            Built for exploration and study.
          </p>
        </div>
      </div>
    </footer>
  );
}
