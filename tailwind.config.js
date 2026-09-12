/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#07080b',
          900: '#0b0e14',
          800: '#121622',
          700: '#1a2030',
        },
        emerald: {
          glow: '#10b981',
          accent: '#059669',
        },
        cinema: {
          surface: 'rgba(18, 22, 34, 0.85)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        cinema: '28px',
      },
      boxShadow: {
        'glow-emerald': '0 0 25px rgba(16, 185, 129, 0.45)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.4)',
        'luxury-card': '0 12px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        'luxury-card-hover': '0 20px 48px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
};
