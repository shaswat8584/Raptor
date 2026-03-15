/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"Fira Code"', '"Fira Mono"', 'monospace'],
        label: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        'raptor-bg': '#080808',
        'raptor-surface': '#111111',
        'raptor-border': '#1A1A1A',
        'raptor-line': '#222222',
        'raptor-text': '#F0EDE8',
        'raptor-muted': '#4A4A4A',
        'raptor-dim': '#2A2A2A',
        'raptor-accent': '#FFFEFC',
        'raptor-red': '#C0392B',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'spine-expand': 'spineExpand 0.3s ease forwards',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        spineExpand: {
          '0%': { width: '44px' },
          '100%': { width: '160px' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        raptor: {
          primary: '#F0EDE8',
          'primary-content': '#080808',
          secondary: '#4A4A4A',
          'secondary-content': '#F0EDE8',
          accent: '#FFFEFC',
          'accent-content': '#080808',
          neutral: '#1A1A1A',
          'neutral-content': '#F0EDE8',
          'base-100': '#080808',
          'base-200': '#111111',
          'base-300': '#1A1A1A',
          'base-content': '#F0EDE8',
          info: '#4A4A4A',
          success: '#2ECC71',
          warning: '#F39C12',
          error: '#C0392B',
        },
      },
    ],
    darkTheme: 'raptor',
  },
};
