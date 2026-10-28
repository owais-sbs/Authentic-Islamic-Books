/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'rgb(var(--c-paper) / <alpha-value>)',
        parchment: 'rgb(var(--c-paper) / <alpha-value>)',
        ivory: 'rgb(var(--c-paper) / <alpha-value>)',
        ink: {
          900: 'rgb(var(--c-ink-900) / <alpha-value>)',
          800: 'rgb(var(--c-ink-800) / <alpha-value>)',
          700: 'rgb(var(--c-ink-700) / <alpha-value>)',
          600: 'rgb(var(--c-ink-600) / <alpha-value>)',
          500: 'rgb(var(--c-ink-500) / <alpha-value>)',
          400: 'rgb(var(--c-ink-400) / <alpha-value>)',
          300: 'rgb(var(--c-ink-300) / <alpha-value>)',
        },
        line: {
          DEFAULT: 'rgb(var(--c-line) / <alpha-value>)',
          strong: 'rgb(var(--c-line-strong) / <alpha-value>)',
        },
        accent: {
          DEFAULT: '#C9A227',
          light: '#D4B445',
          dark: '#A8881F',
          subtle: 'rgb(var(--c-accent-subtle) / <alpha-value>)',
        },
        cream: 'rgb(var(--c-cream) / <alpha-value>)',
        islamic: {
          green: '#104C3B',
          forest: '#0A352A',
          teal: '#347F77',
          terracotta: '#B95632',
        },
        burgundy: {
          DEFAULT: '#8B2E2E',
          soft: '#A84848',
          muted: 'rgb(var(--c-burgundy-muted) / <alpha-value>)',
        },
        forest: {
          DEFAULT: '#104C3B',
          mid: '#347F77',
          soft: 'rgb(var(--c-forest-soft) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['Noto Naskh Arabic', 'Amiri Quran', 'Traditional Arabic', 'serif'],
        cinzel: ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'cinzel-decorative': ['Plus Jakarta Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '720px',
        'prose-narrow': '680px',
        'prose-wide': '760px',
      },
      boxShadow: {
        book: '0 18px 40px rgba(10, 53, 42, 0.28)',
        soft: '0 8px 24px rgba(24, 37, 31, 0.06)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'border-spin': {
          '0%': { '--border-angle': '0deg' },
          '100%': { '--border-angle': '360deg' },
        },
        'book-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'border-spin': 'border-spin 4s linear infinite',
        'book-float': 'book-float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
