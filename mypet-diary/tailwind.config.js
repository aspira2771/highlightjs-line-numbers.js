/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Toss-inspired palette
        primary: {
          DEFAULT: '#3182F6',
          50: '#EBF3FE',
          100: '#D2E4FD',
          200: '#A5C9FB',
          300: '#6AA6F8',
          400: '#3182F6',
          500: '#2272EB',
          600: '#1B64DA',
        },
        // Toss grayscale
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
        bg: '#F9FAFB',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#191F28',
          soft: '#4E5968',
        },
        muted: '#8B95A1',
        line: '#E5E8EB',
        positive: '#00C896',
        negative: '#F04452',
        // semantic accents for category tints
        accent: {
          DEFAULT: '#3182F6',
          mint: '#00C8B4',
          violet: '#8B5CF6',
          amber: '#FF9F1C',
        },
      },
      fontFamily: {
        sans: [
          '"Pretendard Variable"',
          '"Pretendard"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Apple SD Gothic Neo"',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
      borderRadius: {
        soft: '0.875rem',
        card: '1.25rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0, 27, 55, 0.04)',
        card: '0 2px 8px rgba(0, 27, 55, 0.06)',
        float: '0 6px 24px rgba(0, 27, 55, 0.10)',
        focus: '0 0 0 4px rgba(49, 130, 246, 0.16)',
      },
      letterSpacing: {
        tightest: '-0.03em',
        tight: '-0.02em',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.94)' },
          '50%': { transform: 'scale(1.04)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        pop: 'pop 0.3s ease-out',
        fadeUp: 'fadeUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
