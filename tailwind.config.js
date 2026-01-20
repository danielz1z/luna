/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './app/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit_400Regular'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      spacing: {
        global: '16px',
      },
      colors: {
        highlight: '#0EA5E9',
        light: {
          primary: '#f5f5f5',
          secondary: '#ffffff',
          text: '#000000',
          subtext: '#64748B',
        },
        dark: {
          primary: '#171717',
          secondary: '#323232',
          darker: '#000000',
          text: '#ffffff',
          subtext: '#A1A1A1',
        },
      },
    },
  },
  plugins: [],
};
