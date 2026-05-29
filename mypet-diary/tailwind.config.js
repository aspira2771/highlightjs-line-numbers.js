/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Charcoal/black as the primary action color (buttons, active chips, CTAs).
        primary: {
          DEFAULT: '#1A1A1A',
          50: '#F3F3F1',
          100: '#E4E3DF',
          200: '#C4C2BB',
          300: '#8A887F',
          400: '#2E2E2C',
          500: '#111111',
        },
        // Soft sage green for positive/completed states.
        secondary: {
          DEFAULT: '#7FB99A',
          50: '#EAF4EF',
          100: '#CDE7DA',
          200: '#9FD3B8',
          300: '#5AA07F',
        },
        // Warm gold for stars, ratings, rewards/points.
        accent: {
          DEFAULT: '#F5C84B',
          50: '#FEF7E4',
          100: '#FBE9B0',
          200: '#F5C84B',
        },
        // Pastel chips for tags (e.g. nutrient/symptom labels).
        tag: {
          mint: '#CFECE0',
          peach: '#FBE0CE',
          sky: '#D6E8F5',
        },
        // Warm neutral gray scale.
        gray: {
          50: '#FAF9F6',
          100: '#F3F2EE',
          200: '#E9E7E1',
          300: '#D8D5CC',
          400: '#B6B2A7',
          500: '#97948B',
          600: '#726F67',
          700: '#54524C',
          800: '#36352F',
          900: '#1A1A1A',
        },
        bg: '#F3F2EE', // warm off-white app background
        surface: '#FFFFFF', // cards / sheets
        ink: '#1A1A1A', // primary text
        muted: '#97948B', // secondary text
        line: '#E9E7E1', // borders / dividers
      },
      fontFamily: {
        sans: [
          '"Pretendard"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        hand: ['"Gaegu"', '"Pretendard"', 'cursive'],
      },
      borderRadius: {
        soft: '1rem',
        card: '1.5rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0, 0, 0, 0.04)',
        card: '0 4px 16px rgba(0, 0, 0, 0.05)',
        float: '0 10px 30px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        bounceSoft: 'bounceSoft 1.6s ease-in-out infinite',
        pop: 'pop 0.35s ease-out',
        wiggle: 'wiggle 0.6s ease-in-out',
        slideUp: 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
