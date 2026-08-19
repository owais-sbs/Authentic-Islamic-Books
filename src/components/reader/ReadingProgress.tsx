import { motion } from 'framer-motion';

interface ReadingProgressProps {
  percent: number;
  chapterLabel?: string;
}

export function ReadingProgress({ percent, chapterLabel }: ReadingProgressProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="sticky top-16 z-20 border-b reader-border reader-card">
      <div className="container-page py-2">
        <div className="flex items-center gap-4">
          <div className="relative h-1 flex-1 overflow-hidden rounded-full reader-border">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full reader-accent"
              style={{ backgroundColor: 'var(--reader-accent)' }}
              initial={{ width: 0 }}
              animate={{ width: `${clampedPercent}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
          <div className="flex items-center gap-3 text-xs reader-muted">
            {chapterLabel && <span className="hidden sm:inline">{chapterLabel}</span>}
            <span className="tabular-nums font-medium">{Math.round(clampedPercent)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
