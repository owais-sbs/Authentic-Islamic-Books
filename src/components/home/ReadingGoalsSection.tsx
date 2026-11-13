import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Play, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ReadingGoalsSection() {
  const [readingMinutes, setReadingMinutes] = useState(12);
  const goalMinutes = 15;
  const progressPercent = Math.min(100, Math.round((readingMinutes / goalMinutes) * 100));

  // Circular gauge arc calculations
  const radius = 95;
  const strokeWidth = 8;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  return (
    <section className="py-10 sm:py-14 bg-neutral-50/70 dark:bg-black border-y border-black/[0.05] dark:border-white/[0.06] transition-colors">
      <div className="container-page max-w-xl text-center">
        {/* Title */}
        <h2 className="font-sans text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white tracking-tight">
          Reading Goals
        </h2>
        <p className="mt-2 text-sm sm:text-base font-sans text-neutral-500 dark:text-neutral-400">
          Read every day, see your stats soar and finish more books.
        </p>

        {/* Semi-circular Arc Gauge */}
        <div className="relative mt-8 flex flex-col items-center justify-center">
          <div className="relative w-[240px] h-[135px] flex items-center justify-center overflow-visible">
            <svg
              className="w-[240px] h-[135px] overflow-visible"
              viewBox="0 0 220 120"
            >
              {/* Background Arc */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="text-neutral-200 dark:text-neutral-800"
              />
              {/* Active Progress Arc */}
              <path
                d="M 20 110 A 90 90 0 0 1 200 110"
                fill="none"
                stroke="#1B4F72"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1B4F72" />
                  <stop offset="100%" stopColor="#C9A227" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Content */}
            <div className="absolute top-10 flex flex-col items-center text-center">
              <span className="font-sans text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Today’s Reading
              </span>
              <span className="font-sans text-4xl sm:text-5xl font-bold tracking-tight text-ink-900 dark:text-white mt-0.5">
                {String(readingMinutes).padStart(2, '0')}:00
              </span>
              <button
                type="button"
                onClick={() => setReadingMinutes((m) => (m >= 15 ? 5 : m + 5))}
                className="inline-flex items-center gap-0.5 font-sans text-xs text-[#64748B] hover:text-ink-900 dark:text-neutral-400 dark:hover:text-white mt-1 transition-colors"
              >
                <span>of your {goalMinutes}-minute goal</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Big Action Button (Theme Blue) */}
          <Link
            to="/library/demo-islamic-book"
            className={cn(
              'mt-6 inline-flex flex-col items-center justify-center w-full max-w-sm px-6 py-3.5 rounded-full',
              'bg-[#1B4F72] hover:bg-[#154060] text-white',
              'shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all',
              'group',
            )}
          >
            <span className="font-sans text-sm font-semibold tracking-wide">
              Keep Reading
            </span>
            <span className="font-sans text-xs opacity-75 truncate max-w-[280px]">
              Ar-Raheeq Al-Makhtum (The Sealed Nectar)
            </span>
          </Link>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-black/[0.06] dark:bg-white/[0.08]" />

        {/* Books Read This Year */}
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink-900 dark:text-white tracking-tight">
            Books Read This Year
          </h3>

          {/* 3 Placeholder Cards (as seen in Image 4) */}
          <div className="flex items-center justify-center gap-3.5 sm:gap-4 mt-6">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={cn(
                  'w-20 h-28 sm:w-24 sm:h-34 rounded-xl flex items-center justify-center',
                  'border border-black/[0.06] dark:border-white/10',
                  'bg-white/80 dark:bg-neutral-900/60 shadow-sm backdrop-blur-sm',
                  'transition-transform hover:-translate-y-1',
                )}
              >
                <span className="font-serif text-3xl sm:text-4xl font-semibold text-neutral-200 dark:text-neutral-700 select-none">
                  {num}
                </span>
              </div>
            ))}
          </div>

          <Link
            to="/library"
            className="mt-5 inline-flex flex-col items-center font-sans text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 hover:text-ink-900 dark:hover:text-white transition-colors"
          >
            <span className="font-semibold text-ink-900 dark:text-white inline-flex items-center gap-1">
              3 more books to reach your goal <ChevronRight size={14} />
            </span>
            <span className="text-neutral-400 mt-0.5">Keep reading!</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

