/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6C5CE7',   // theme
        primaryAccent: "#18FFFF",   // buttons
        secondaryAccent: "#FF6B81",   // secondary elements
        button: "#E4A020",    // buttons
        background: "#1B1B1B",
        text: "#F5F5F5"
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
        figtree: ['Figtree', 'sans-serif']
      },
    },
  },
  plugins: [],
};
