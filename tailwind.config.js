/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF7F0',
        parchment: '#FAF7F0',
        ivory: '#FAF7F0',
        ink: {
          900: '#18251F',
          800: '#1E2E27',
          700: '#2A3B33',
          600: '#3D4F46',
          500: '#6C756E',
          400: '#8A928B',
          300: '#B0B6B1',
        },
        line: {
          DEFAULT: '#E9E2D5',
          strong: '#D9D0C0',
        },
        accent: {
          DEFAULT: '#C9A227',
          light: '#D4B445',
          dark: '#A8881F',
          subtle: '#F5EFD8',
        },
        cream: '#FFFFFF',
        islamic: {
          green: '#104C3B',
          forest: '#0A352A',
          teal: '#347F77',
          terracotta: '#B95632',
        },
        burgundy: {
          DEFAULT: '#8B2E2E',
          soft: '#A84848',
          muted: '#F5E8E8',
        },
        forest: {
          DEFAULT: '#104C3B',
          mid: '#347F77',
          soft: '#E8F0EB',
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
