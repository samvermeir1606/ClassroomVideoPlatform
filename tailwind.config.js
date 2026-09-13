/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'],
      },
      colors: {
        brand: {
          pink: '#FF6B6B',
          yellow: '#FFD93D',
          green: '#6BCB77',
          blue: '#4D96FF',
          darkBlue: '#1F2937',
        }
      },
      boxShadow: {
        'kid-sm': '0 4px 0 0 rgba(0,0,0,0.1)',
        'kid-md': '0 6px 0 0 rgba(0,0,0,0.15)',
        'kid-lg': '0 8px 0 0 rgba(0,0,0,0.2)',
        'kid-xl': '0 12px 0 0 rgba(0,0,0,0.25)',
      }
    },
  },
  plugins: [],
}
