import { BookOpen, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Resource {
  id: string;
  label: string;
  hint: string;
}

interface ResourceLinksProps {
  resources: Resource[];
  onAction?: (id: string) => void;
}

const icons = {
  read: BookOpen,
  'view-pdf': FileText,
  'download-pdf': Download,
} as const;

export function ResourceLinks({ resources, onAction }: ResourceLinksProps) {
  return (
    <div className="mt-10 border border-line bg-cream px-5 py-6 sm:px-8 sm:py-8">
      <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
        Digital Resources
      </h4>
      <p className="mt-2 max-w-xl font-serif text-sm text-ink-600">
        Demonstration controls only — no backend files are requested.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {resources.map((resource) => {
          const Icon = icons[resource.id as keyof typeof icons] ?? FileText;
          return (
            <button
              key={resource.id}
              type="button"
              onClick={() => onAction?.(resource.id)}
              title={resource.hint}
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3',
                'font-sans text-sm font-medium transition-colors',
                resource.id === 'read'
                  ? 'bg-ink-900 text-cream hover:bg-ink-800'
                  : 'border border-line bg-parchment text-ink-800 hover:border-accent hover:bg-accent-subtle'
              )}
            >
              <Icon size={16} strokeWidth={1.75} />
              {resource.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
