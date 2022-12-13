/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme")

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        // sans: [your_main_font],
        poppins: ["Poppins", ...defaultTheme.fontFamily.sans],
        lobster: ["Lobster", ...defaultTheme.fontFamily.sans],
        pacifico: ["Pacifico", ...defaultTheme.fontFamily.sans],
        press: ['"Press Start 2P"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
