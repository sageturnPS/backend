/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        nunitosans: ['Nunito Sans'],
        inter: ['Inter'],
        londrinasolid: ['Londrina Solid'],
        default: ['Rubik', 'sans-serif'],
      },
      colors: {
        bgwhite: '#FFFFFF',
        bgblue: '#f7fbff',
        bgaccent: '#D9D9D9',
        logoblue: '#00539F',
        logobluehover: '#0068c9',
        logolightblue:'#00A0E0',
        logogray: '#9F9F9F',
        headerblue: '#bae4f5',
        footerheadergray: '#171717',
        footeritemgray: '#666666',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
      },
      height: {
        'screen-1/2': '50vh',
        'screen-1/4': '25vh',
        'screen-3/4': '75vh',
      },
      fontSize: {
        '4.5xl': '2.5rem', 
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
