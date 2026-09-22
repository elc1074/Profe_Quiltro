/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fredoka"', 'sans-serif'],
        body: ['"Nunito Sans"', 'sans-serif'],
      },
      colors: {
        //fundo
        cream: {
          DEFAULT: '#faf9f6',
          soft: '#faf9f6',
          dark: '#2A2116',
        },
        //destaque texto, fundo mascote
        blush: {
          DEFAULT: '#F5E2DE',
          soft: '#F5E2DE',
          dark: '#CAAFA8',
        },
        //botao
        rosewood: {
          DEFAULT: '#7F6E81',
          light: '#7F6E81',
          dark: '#4A4E69',
        },
        //destaque icones como funciona
        sage: {
          DEFAULT: '#9BB3D9',
          light: '#9BB3D9',
          dark: '#6882B3',
        },
        misty: {
          DEFAULT: '#A9B7C6',
          light: '#C6D1DC',
          dark: '#6e8296',
        },
        lagoon: {
          DEFAULT: '#1D2731',
          light: '#2f4867',
          soft: '#1D2731',
        },
        success: {
          DEFAULT: '#7C9A5F',
          bg: '#E7EFDD',
          bgDark: '#2A3324',
        },
        error: {
          DEFAULT: '#B4525A',
          bg: '#F6DFE1',
          bgDark: '#3A2225',
        },
        warning: {
          DEFAULT: '#C98A3F',
          bg: '#F6E7D2',
          bgDark: '#3A2E1C',
        },
      },
      borderRadius: {
        xl2: '1.25rem',
        blob: '2rem',
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(45, 58, 71, 0.18)',
        softDark: '0 8px 24px -8px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}
