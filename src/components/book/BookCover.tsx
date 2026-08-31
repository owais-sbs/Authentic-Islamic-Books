import type { Book } from '@/types';
import { getScholarById } from '@/data/scholars';
import { cn } from '@/lib/utils';

interface BookCoverProps {
  book: Book;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { outer: 'w-20 h-28', title: 'text-[10px]', author: 'text-[8px]', ornament: 16 },
  md: { outer: 'w-32 h-44', title: 'text-[12px]', author: 'text-[10px]', ornament: 22 },
  lg: { outer: 'w-40 h-56', title: 'text-sm',     author: 'text-xs',    ornament: 28 },
};

// Deterministic palette from coverColor — maps dark cover tones to rich Islamic palettes
function getPalette(coverColor: string) {
  const palettes = [
    // Deep teal / gold
    { bg: '#0D2B35',   border: '#C9A84C', inner: '#122F3A', ornament: '#C9A84C', text: '#F0E6C8' },
    // Deep navy / gold
    { bg: '#0B1929',   border: '#C9A84C', inner: '#0F2035', ornament: '#DBBF6A', text: '#EDE4CC' },
    // Forest green / gold
    { bg: '#1A2E1A',   border: '#B8963E', inner: '#1E3520', ornament: '#C9A84C', text: '#EDE8D5' },
    // Burgundy / gold
    { bg: '#2D1215',   border: '#C9A84C', inner: '#351618', ornament: '#D4AF5A', text: '#F0E6CC' },
    // Dark slate / warm gold
    { bg: '#1C1C2E',   border: '#C9A84C', inner: '#22223A', ornament: '#DBBF6A', text: '#EDE4CC' },
    // Charcoal / amber
    { bg: '#2B2B2B',   border: '#C9A84C', inner: '#323232', ornament: '#C9A84C', text: '#F0EAD2' },
    // Dark olive / gold
    { bg: '#2A2A12',   border: '#C9A84C', inner: '#303015', ornament: '#D4B44A', text: '#EDE8D5' },
  ];
  // pick deterministically from coverColor hash
  let hash = 0;
  for (let i = 0; i < coverColor.length; i++) hash += coverColor.charCodeAt(i);
  return palettes[hash % palettes.length];
}

export function BookCover({ book, size = 'md', className }: BookCoverProps) {
  const scholar = getScholarById(book.authorId);
  const s = sizes[size];
  const p = getPalette(book.coverColor);

  if (book.coverUrl) {
    return (
      <div
        className={cn('relative overflow-hidden rounded-sm shadow-lg select-none', s.outer, className)}
      >
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-full w-full object-cover"
        />
        <div
          className="absolute left-0 top-0 bottom-0 w-[5px]"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden rounded-sm shadow-lg select-none', s.outer, className)}
      style={{ backgroundColor: p.bg }}
    >
      {/* Spine shadow on left */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[5px]"
        style={{ background: `linear-gradient(to right, rgba(0,0,0,0.5), transparent)` }}
      />

      {/* Outer border frame */}
      <div
        className="absolute inset-[4px] rounded-[1px] pointer-events-none"
        style={{ border: `1px solid ${p.border}40` }}
      />
      {/* Inner border frame */}
      <div
        className="absolute inset-[7px] rounded-[1px] pointer-events-none"
        style={{ border: `1px solid ${p.border}25` }}
      />

      {/* Top ornamental band */}
      <div
        className="absolute top-0 left-0 right-0 h-[28%]"
        style={{ background: `linear-gradient(180deg, ${p.inner} 0%, transparent 100%)` }}
      />
      {/* Bottom ornamental band */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[22%]"
        style={{ background: `linear-gradient(0deg, ${p.inner} 0%, transparent 100%)` }}
      />

      {/* Centre geometric ornament — Islamic star pattern SVG */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-12">
        <svg
          width={s.ornament * 3}
          height={s.ornament * 3}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 8-point star — classic Islamic geometric motif */}
          <polygon
            points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
            fill={p.ornament}
            opacity="0.9"
          />
          <polygon
            points="50,18 58,40 82,40 63,54 71,76 50,62 29,76 37,54 18,40 42,40"
            fill={p.bg}
          />
          <circle cx="50" cy="50" r="8" fill={p.ornament} opacity="0.7" />
        </svg>
      </div>

      {/* Top small ornament */}
      <div className="absolute top-[8px] left-0 right-0 flex justify-center pointer-events-none">
        <svg width={s.ornament * 0.8} height={s.ornament * 0.8} viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z"
            fill={p.ornament} opacity="0.6" />
        </svg>
      </div>

      {/* Bottom small ornament */}
      <div className="absolute bottom-[8px] left-0 right-0 flex justify-center pointer-events-none">
        <svg width={s.ornament * 0.8} height={s.ornament * 0.8} viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L14 8 L20 8 L15 12 L17 18 L12 14 L7 18 L9 12 L4 8 L10 8 Z"
            fill={p.ornament} opacity="0.6" />
        </svg>
      </div>

      {/* Corner ornaments */}
      {[
        'top-[10px] left-[10px]',
        'top-[10px] right-[10px] rotate-90',
        'bottom-[10px] left-[10px] -rotate-90',
        'bottom-[10px] right-[10px] rotate-180',
      ].map((pos, i) => (
        <div key={i} className={`absolute ${pos} pointer-events-none`}>
          <svg width={s.ornament * 0.55} height={s.ornament * 0.55} viewBox="0 0 16 16" fill="none">
            <path d="M1 1 L8 1 L8 3 L3 3 L3 8 L1 8 Z" fill={p.border} opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* Horizontal rule lines */}
      <div
        className="absolute left-[10px] right-[10px]"
        style={{ top: '30%', height: '1px', backgroundColor: `${p.border}30` }}
      />
      <div
        className="absolute left-[10px] right-[10px]"
        style={{ bottom: '28%', height: '1px', backgroundColor: `${p.border}30` }}
      />

      {/* Title block */}
      <div className="absolute inset-x-[10px] top-[33%] bottom-[30%] flex flex-col items-center justify-center text-center gap-1 px-1">
        <p
          className={cn('font-serif font-semibold leading-snug line-clamp-3', s.title)}
          style={{ color: p.text }}
        >
          {book.title}
        </p>
        {scholar && (
          <p
            className={cn('font-sans font-normal leading-tight mt-1 opacity-70', s.author)}
            style={{ color: p.ornament }}
          >
            {scholar.name}
          </p>
        )}
      </div>

      {/* Subtle overall texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(ellipse at 30% 20%, ${p.ornament}08 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}
