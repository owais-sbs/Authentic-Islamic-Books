import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link to={item.href} className="transition-colors hover:text-ink-800">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-ink-800 font-medium' : ''}>{item.label}</span>
              )}
              {!isLast && <ChevronRight size={14} className="text-ink-300" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
