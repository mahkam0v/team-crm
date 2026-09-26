/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm graphite base — neutral, professional
        ink: '#0d0c0b',
        surface: '#151412',
        raised: '#1d1b19',
        border: '#282522',
        muted: '#6f6a61',

        // Primary — warm coral (distinct from generic AI indigo)
        accent: {
          DEFAULT: '#f97316',
          light: '#fb923c',
          dim: '#c2410c',
          hover: '#ea580c',
          glow: 'rgba(249, 115, 22, 0.15)',
        },

        // Semantic
        positive: '#22c55e',
        negative: '#ef4444',
        // Amber-yellow so it stays distinct from the coral accent
        warning: '#eab308',
        info: '#3b82f6',
        teal: '#14b8a6',
        rose: '#f43f5e',

        // New — richer accent palette
        violet: '#8b5cf6',
        amber: '#f59e0b',
        sky: '#0ea5e9',
        emerald: '#10b981',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        '2xl': '14px',
        '3xl': '18px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-scale': 'fadeInScale 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-left': 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInScale: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(249, 115, 22, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(249, 115, 22, 0.1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glow-accent': '0 0 30px rgba(249, 115, 22, 0.08)',
        'glow-positive': '0 0 30px rgba(34, 197, 94, 0.08)',
        'glow-negative': '0 0 30px rgba(239, 68, 68, 0.08)',
        'card': '0 1px 2px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.02)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(249, 115, 22, 0.14)',
        'elevated': '0 12px 32px rgba(0, 0, 0, 0.45)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-1': 'radial-gradient(at 25% 25%, rgba(249, 115, 22, 0.06) 0px, transparent 55%), radial-gradient(at 80% 15%, rgba(234, 179, 8, 0.04) 0px, transparent 50%), radial-gradient(at 50% 85%, rgba(249, 115, 22, 0.04) 0px, transparent 55%)',
      },
    },
  },
  plugins: [],
};
