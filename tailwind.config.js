/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**",
    "!./dist/**",
    "!./netlify/**",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F5F5F0',
        charcoal: '#292524',
        coral: '#FF7F7F',
        yellow: '#FBBF24',
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}