/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          900: '#134e4a',
        },
        medical: {
          blue: '#0284c7',
          red: '#ef4444',
          amber: '#f59e0b',
          emerald: '#10b981',
          purple: '#8b5cf6',
          dark: '#0f172a',
        }
      },
    },
  },
  plugins: [],
}
