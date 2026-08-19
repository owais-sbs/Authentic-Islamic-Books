import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'outline' | 'muted';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-ink-900/5 text-ink-700',
  accent: 'bg-accent-subtle text-accent-dark',
  outline: 'border border-line-strong text-ink-600',
  muted: 'bg-paper text-ink-500',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
