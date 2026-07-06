/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F2810F',
          amber: '#F2B705',
          brown: '#7A3E14',
          dark: '#2A2A2E',
          lilac: '#E9E7F7',
          lilacdark: '#5B4FA0',
          primary: '#10B981', // Emerald 500 (Green)
          secondary: '#047857', // Emerald 700 (Dark Green)
        },
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
