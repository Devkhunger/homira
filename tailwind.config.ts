import type { Config } from "tailwindcss";

// Brand colours come from CSS variables so the owner can change them
// from Admin → Settings without touching code.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          dark: "rgb(var(--brand-dark) / <alpha-value>)",
          accent: "rgb(var(--accent) / <alpha-value>)",
          soft: "rgb(var(--soft) / <alpha-value>)",
          cream: "rgb(var(--cream) / <alpha-value>)",
        },
        ink: "#1f1a17",
        sale: "#d0312d",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
