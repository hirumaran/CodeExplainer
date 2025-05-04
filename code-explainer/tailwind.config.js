/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        },
        colors: {
          primary: {
            DEFAULT: '#646cff',
            hover: '#535bf2',
          },
        },
      },
    },
    plugins: [],
    darkMode: 'class', // Use class-based dark mode instead of media queries
  }