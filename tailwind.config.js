/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9f5",
          100: "#dcf2e6",
          200: "#b9e5cd",
          300: "#85d1a6",
          400: "#4fb577",
          500: "#00623A", // Main brand green
          600: "#005530",
          700: "#004527",
          800: "#003820",
          900: "#002e1b",
          950: "#001a10",
        },
        success: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
        },
        warning: {
          50: "#fffbeb",
          500: "#f59e0b",
          600: "#d97706",
        },
        error: {
          50: "#fef2f2",
          500: "#ef4444",
          600: "#dc2626",
        },
        neutral: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
      spacing: {
        "safe-top": "env(safe-area-inset-top)",
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      borderRadius: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      elevation: {
        sm: "2px 2px 4px rgba(0, 0, 0, 0.1)",
        md: "4px 4px 8px rgba(0, 0, 0, 0.12)",
        lg: "8px 8px 16px rgba(0, 0, 0, 0.15)",
      },
    },
  },
  plugins: [],
};
