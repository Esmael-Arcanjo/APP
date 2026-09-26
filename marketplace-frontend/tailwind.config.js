/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Manrope", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#FFF7ED", 100: "#FFEDD5", 500: "#F97316",
          600: "#EA580C", 700: "#C2410C",
        },
        ink: { 900: "#0B0B0F", 700: "#333340", 500: "#6B6B78", 300: "#B8B8C4" },
      },
    },
  },
  plugins: [],
};
