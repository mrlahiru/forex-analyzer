/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#080B11',
          card: '#0F1523',
          border: '#1E293B',
          accent: '#3B82F6',
          cyan: '#06B6D4',
          bullish: '#10B981',
          bearish: '#F43F5E',
          neutral: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-bullish': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-bearish': '0 0 20px -5px rgba(244, 63, 94, 0.3)',
        'glow-brand': '0 0 20px -5px rgba(59, 130, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
