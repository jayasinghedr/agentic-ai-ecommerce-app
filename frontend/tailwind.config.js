/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C62828',
          'red-light': '#EF5350',
          'red-dark': '#8E0000',
          black: '#111111',
          dark: '#424242',
          light: '#F5F5F5',
          border: '#E0E0E0',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
