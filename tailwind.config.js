/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',
        secondary: '#f59e0b',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true,
  },
}
