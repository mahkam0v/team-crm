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
    },
  },
  plugins: [],
};
