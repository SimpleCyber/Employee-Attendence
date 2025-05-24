// 3. Update tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-bg': '#e9effe',
      },
    },
  },
  plugins: [],
}