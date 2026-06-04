/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        ink: '#101418',
        steel: '#60717f',
        mint: '#19b77a',
        coral: '#ee5d50',
        amber: '#f4b942',
        cloud: '#f6f8fb'
      },
      boxShadow: {
        soft: '0 18px 55px rgba(18, 26, 33, 0.10)'
      }
    }
  },
  plugins: []
}
