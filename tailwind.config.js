/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./utils/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      fontSize: {
        xxs: ["0.625rem", { lineHeight: "0.75rem" }],
      },
      fontFamily: {
        "sans-serif": ["Outfit", "sans-serif"],
      },
    },
  },
  plugins: [],
};
