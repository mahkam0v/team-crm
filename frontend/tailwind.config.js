/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#12141C',
        surface: '#1B1E29',
        raised: '#242837',
        border: '#2E3344',
        muted: '#8A8FA3',
        accent: {
          DEFAULT: '#5B8DEF',
          dim: '#3B5998',
          hover: '#4A7BD8',
        },
        positive: '#34D399',
        negative: '#F87171',
        warning: '#FBBF24',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-scale': 'fadeInScale 0.4s ease-out forwards',
        'slide-right': 'slideInRight 0.3s ease-out forwards',
        'slide-left': 'slideInLeft 0.3s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(91, 141, 239, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(91, 141, 239, 0.15)' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 30px rgba(91, 141, 239, 0.15)',
        'glow-positive': '0 0 30px rgba(52, 211, 153, 0.15)',
        'glow-negative': '0 0 30px rgba(248, 113, 113, 0.15)',
      },
    },
  },
  plugins: [],
};
