/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F172A", // Deep slate ink
          hover: "#1E293B",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        navy: {
          DEFAULT: "#0A1128", // Deep celestial midnight
          950: "#060A17",
          900: "#0A1128",
          800: "#101D42",
          700: "#1B2A56",
          600: "#273D73",
        },
        accent: {
          blue: "#2563EB",
          blueHover: "#1D4ED8",
          amber: "#F59E0B",
          amberDark: "#D97706",
          emerald: "#10B981",
          emeraldDark: "#059669",
          rose: "#F43F5E",
          purple: "#8B5CF6",
        },
        canteen: {
          DEFAULT: "#EA580C",
          light: "#FFF7ED",
          border: "#FFEDD5",
        },
        stationery: {
          DEFAULT: "#0284C7",
          light: "#F0F9FF",
          border: "#E0F2FE",
        },
        hostel: {
          DEFAULT: "#059669",
          light: "#ECFDF5",
          border: "#D1FAE5",
        },
        books: {
          DEFAULT: "#7C3AED",
          light: "#F5F3FF",
          border: "#EDE9FE",
        },
        canvas: {
          DEFAULT: "#F8FAFC",
          card: "#FFFFFF",
          subtle: "#F1F5F9",
          border: "#E2E8F0",
          borderDark: "#CBD5E1",
        },
      },
      fontFamily: {
        editorial: ["Playfair Display", "Georgia", "Cambria", "serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 2px 6px 0 rgba(15, 23, 42, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'elevated': '0 20px 35px -10px rgba(10, 17, 40, 0.15), 0 10px 15px -5px rgba(10, 17, 40, 0.05)',
      },
    },
  },
  plugins: [],
};
