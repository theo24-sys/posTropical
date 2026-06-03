/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Libre Franklin', 'sans-serif'],
        serif: ['League Spartan', 'sans-serif'],
      },
      colors: {
        tropical: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        coffee: {
          50: '#f9f6f3',
          100: '#f0eadd',
          200: '#e0d4c4',
          300: '#cbb6a2',
          400: '#b4947d',
          500: '#9c765c',
          600: '#835d45',
          700: '#6a4a35',
          800: '#4B3621',
          900: '#3e2d1e', 
          950: '#231810',
        },
        beige: {
          DEFAULT: '#F5F5DC',
          50: '#fbfbf6',
          100: '#F5F5DC',
          200: '#ececc8',
          300: '#e3e3b4',
        }
      }
    },
  },
  plugins: [],
}