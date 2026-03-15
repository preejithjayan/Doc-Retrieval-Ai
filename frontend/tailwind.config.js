/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans: ['Figtree', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(0, 229, 255, 0.15), 0 18px 80px rgba(0, 229, 255, 0.14)',
        violet: '0 0 0 1px rgba(124, 58, 237, 0.16), 0 18px 80px rgba(124, 58, 237, 0.18)',
      },
      colors: {
        base: '#0A0A0F',
        surface: '#10111A',
        cyan: '#00E5FF',
        violet: '#7C3AED',
      },
      backgroundImage: {
        aurora:
          'radial-gradient(circle at top left, rgba(0,229,255,0.18), transparent 28%), radial-gradient(circle at top right, rgba(124,58,237,0.2), transparent 30%), radial-gradient(circle at bottom, rgba(58,130,246,0.12), transparent 26%)',
      },
    },
  },
  plugins: [],
};
