/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121212',  // Preto de fundo
        sidebar: '#181818',     // Lateral um pouco mais clara
        surface: '#242424',     // Inputs e cards
        primary: {
          DEFAULT: '#48b14c',   // Verde dos botões/detalhes principais
          hover: '#3e9c42',
        },
        textGray: '#a0a0a0',    // Texto secundário/Placeholders
    },
    },
  },
  plugins: [],
}