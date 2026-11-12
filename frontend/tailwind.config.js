/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#28513F",
        secondary: "#E4A75D",
        indigo: {
          50: "#F0F4EF",
          100: "#E2EBE2",
          200: "#C9DACB",
          300: "#A8C3AD",
          400: "#7EA28A",
          500: "#568066",
          600: "#28513F",
          700: "#234634",
          800: "#1D3A2C",
          900: "#17392C",
          950: "#10271E",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
