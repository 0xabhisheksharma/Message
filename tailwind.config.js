/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body: ["Inter", "Segoe UI", "sans-serif"],
        hand: ["Caveat", "Segoe Print", "cursive"]
      },
      boxShadow: {
        glow: "0 24px 90px rgba(244, 114, 182, 0.22)",
        glass: "0 24px 70px rgba(31, 41, 55, 0.12)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        }
      },
      animation: {
        shimmer: "shimmer 10s ease infinite"
      }
    }
  },
  plugins: []
};
