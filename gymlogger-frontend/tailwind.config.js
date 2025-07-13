// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Ensure these paths correctly point to ALL your files containing Tailwind classes
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This covers all JS, TS, JSX, TSX files in src/
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        'lexend-deca': ['"Lexend Deca"', 'sans-serif'],
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.5)', // Custom shadow for AuthFormWrapper
      }
    },
  },
  plugins: [],
}