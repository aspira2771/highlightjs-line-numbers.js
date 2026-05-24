/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Claude-inspired sienna / cream palette
        primary: {
          DEFAULT: '#C15F3C',
          50: '#FAEFE9',
          100: '#F0D9CC',
          200: '#E1B49E',
          300: '#D08A6A',
          400: '#C15F3C',
          500: '#A14A2C',
          600: '#7F3920',
        },
        secondary: {
          DEFAULT: '#7F715C',
          50: '#F1EEE7',
          100: '#E2DCCC',
          200: '#CCBFA5',
          300: '#A99877',
          400: '#7F715C',
        },
        accent: {
          DEFAULT: '#B08F69',
          50: '#F4ECDF',
          100: '#E8D8BD',
          200: '#D2B68F',
          300: '#B08F69',
        },
        surface: '#FFFFFF',
        bg: '#FAF9F5',
        panel: '#F4F1E8',
        ink: {
          DEFAULT: '#2F2A26',
          soft: '#4D453E',
        },
        muted: '#7A6F62',
        line: '#E5DFCF',
        success: '#5A7A56',
        warning: '#B58A4A',
      },
      fontFamily: {
        sans: [
          '"Inter"',
          '"Pretendard"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        serif: [
          '"Source Serif 4"',
          '"Tiempos"',
          'Georgia',
          '"Nanum Myeongjo"',
          'serif',
        ],
      },
      borderRadius: {
        soft: '0.75rem',
        card: '1rem',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(47, 42, 38, 0.04), 0 1px 1px rgba(47, 42, 38, 0.03)',
        card: '0 1px 3px rgba(47, 42, 38, 0.05), 0 2px 6px rgba(47, 42, 38, 0.04)',
        focus: '0 0 0 3px rgba(193, 95, 60, 0.18)',
      },
      letterSpacing: {
        tightest: '-0.02em',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        pop: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        fadeUp: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        floaty: 'floaty 4s ease-in-out infinite',
        pop: 'pop 0.32s ease-out',
        fadeUp: 'fadeUp 0.28s ease-out',
      },
    },
  },
  plugins: [],
};
