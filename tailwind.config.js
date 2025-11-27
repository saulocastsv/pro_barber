/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(10px) scale(0.99)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}