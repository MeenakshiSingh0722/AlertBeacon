/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0E1A",
        surface: "#111827",
        border: "#1F2937",
        critical: "#EF4444",
        high: "#F97316",
        medium: "#EAB308",
        low: "#22C55E",
        accent: "#3B82F6",
        ai: "#8B5CF6",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
