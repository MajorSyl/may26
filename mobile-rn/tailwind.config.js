/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Fintech-style palette: deep navy + bright blue accent (see src/theme.ts).
        'rotary-azure': '#2E86F5',
        'rotary-azure-dark': '#1D6FE0',
        'rotary-gold': '#F7A81B',
        'rotary-dark': '#0F1E4D',
        'rotary-light': '#F3F4F6'
      }
    }
  },
  plugins: []
};
