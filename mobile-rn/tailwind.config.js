/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Same brand tokens as the web app's src/index.css @theme block.
        'rotary-azure': '#0284c7',
        'rotary-azure-dark': '#0369a1',
        'rotary-gold': '#F7A81B',
        'rotary-dark': '#0f172a',
        'rotary-light': '#f8f9fa'
      }
    }
  },
  plugins: []
};
