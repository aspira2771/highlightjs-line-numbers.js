/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFB088',
          50: '#FFF1E8',
          100: '#FFE3D0',
          200: '#FFD0B0',
          300: '#FFB088',
          400: '#FF9866',
          500: '#FF7E45',
        },
        secondary: {
          DEFAULT: '#A8D8B9',
          50: '#EFF8F2',
          100: '#D8EEDE',
          200: '#A8D8B9',
          300: '#7BC394',
        },
        accent: {
          DEFAULT: '#F5D547',
          50: '#FEF8DC',
          100: '#FCEFA8',
          200: '#F5D547',
        },
        bg: '#FFF8F0',
        ink: '#3D3D3D',
        muted: '#8A8A8A',
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
        pill: '999px',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(61, 61, 61, 0.06)',
        card: '0 4px 16px rgba(255, 176, 136, 0.15)',
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
      },
      animation: {
        bounceSoft: 'bounceSoft 1.6s ease-in-out infinite',
        pop: 'pop 0.35s ease-out',
        wiggle: 'wiggle 0.6s ease-in-out',
      },
    },
  },
  plugins: [],
};
