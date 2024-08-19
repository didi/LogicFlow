/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    screens: {
      sm: { min: '640px', max: '767px' },
      // => @media (min-width: 640px and max-width: 767px) { ... }
      md: { min: '768px', max: '1023px' },
      // => @media (min-width: 768px and max-width: 1023px) { ... }
      lg: { min: '1024px', max: '1599px' },
      // => @media (min-width: 1024px and max-width: 1599px) { ... }
      xl: { min: '1600px', max: '1919px' },
      // => @media (min-width: 1600px and max-width: 1919px) { ... }
      '2xl': { min: '1920px' }
      // => @media (min-width: 1920px) { ... }
    },
    extend: {}
  },
  plugins: []
}
