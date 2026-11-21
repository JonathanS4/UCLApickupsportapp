/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bruin: {
          blue: "#2774AE",
          gold: "#FFD100",
          ink: "#1E1E1E",
          slate: "#F4F6F8",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Barlow Condensed", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}