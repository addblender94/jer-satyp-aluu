/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        premium: {
          gold: '#D4AF37',
          navy: '#0A192F',
          emerald: '#065F46',
        }
      }
    },
  },
  plugins: [],
}
