/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        lao: ['"Noto Sans Lao"', '"DM Sans"', 'sans-serif'],
        display: ['"Instrument Serif"', '"Noto Sans Lao"', 'serif'],
      },
      colors: {
        brand: {
          50: '#faf9f7',
          100: '#f0ebe4',
          200: '#e0d5c8',
          800: '#2a2520',
          900: '#1a1a1a',
        },
        admin: {
          bg: '#0f0f17',
          surface: '#181822',
          border: '#282838',
          text: '#e4e4f0',
          dim: '#7e7e98',
          accent: '#a78bfa',
          'accent-dim': '#7c5cbf',
        },
      },
      animation: {
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.32,0.72,0,1)',
        'fade-in': 'fadeIn 0.25s ease',
        'toast-in': 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'shake': 'shake 0.5s ease',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        toastIn: {
          from: { transform: 'translateX(-50%) translateY(20px)', opacity: '0' },
          to: { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-8px)' },
          '40%, 80%': { transform: 'translateX(8px)' },
        },
      },
    },
  },
  plugins: [],
}
