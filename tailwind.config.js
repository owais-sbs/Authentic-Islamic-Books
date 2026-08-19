/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F4EF',
        ink: {
          900: '#0B1929',
          800: '#0F1D2F',
          700: '#162A42',
          600: '#1E3654',
          500: '#3A5572',
          400: '#6B829E',
          300: '#9AB0C6',
        },
        line: {
          DEFAULT: '#D8D3C8',
          strong: '#C4BDAD',
        },
        accent: {
          DEFAULT: '#C9A84C',
          light: '#DBBF6A',
          dark: '#A88836',
          subtle: '#F0E9D2',
        },
        cream: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Source Serif 4', 'Literata', 'Lora', 'Georgia', 'serif'],
        cinzel: ['Cinzel', 'Georgia', 'serif'],
        'cinzel-decorative': ['Cinzel Decorative', 'Georgia', 'serif'],
      },
      maxWidth: {
        prose: '720px',
        'prose-narrow': '680px',
        'prose-wide': '760px',
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
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
    },
  },
  plugins: [],
};
