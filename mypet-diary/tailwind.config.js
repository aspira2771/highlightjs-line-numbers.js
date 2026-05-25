/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Toss-style blue as the primary action color.
        primary: {
          DEFAULT: '#3182F6',
          50: '#EAF2FE',
          100: '#C9DEFB',
          200: '#90BFF9',
          300: '#5A9CF8',
          400: '#3182F6',
          500: '#1B64DA',
        },
        // Toss success green (used sparingly, e.g. completed/positive states).
        secondary: {
          DEFAULT: '#00C471',
          50: '#E7F9F1',
          100: '#C2EFD9',
          200: '#7FDCAE',
          300: '#00C471',
        },
        // Reward/points accent.
        accent: {
          DEFAULT: '#F5C147',
          50: '#FEF7E4',
          100: '#FCEBB6',
          200: '#F5C147',
        },
        // Toss neutral gray scale.
        gray: {
          50: '#F9FAFB',
          100: '#F2F4F6',
          200: '#E5E8EB',
          300: '#D1D6DB',
          400: '#B0B8C1',
          500: '#8B95A1',
          600: '#6B7684',
          700: '#4E5968',
          800: '#333D4B',
          900: '#191F28',
        },
        bg: '#F2F4F6', // app background (Toss light gray)
        surface: '#FFFFFF', // cards / sheets
        ink: '#191F28', // primary text
        muted: '#8B95A1', // secondary text
        line: '#E5E8EB', // borders / dividers
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
        card: '1.25rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0, 0, 0, 0.06)',
        card: '0 2px 8px rgba(0, 0, 0, 0.06)',
        float: '0 8px 24px rgba(0, 0, 0, 0.12)',
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
