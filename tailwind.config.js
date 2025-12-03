/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#2e6c36',
        brandLight: '#4f8c53',
        brandDark: '#224f28',
      },
    },
  },
  plugins: [],
};