/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        songless: {
          bg: "#161819",
          dark: "#141415",
          tile: "#303436",
          tileHover: "#3d4245",
          text: "#ECECEC",
          subtext: "#939b9f",
          correct: "#55B725",
          wrong: "#C62121",
          skip: "#DAC316",
          blue: "#3A8DCA",
          spotify: "#1DB954",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
