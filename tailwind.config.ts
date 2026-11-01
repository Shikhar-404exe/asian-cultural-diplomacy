import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#142D4E",       // Deep Diplomatic Navy - primary brand & headings
          blue: "#315C85",       // Classic Blue - buttons, links, nav
          sky: "#7699B8",        // Muted Sky Blue - secondary accents, subtitles
          powder: "#DCE7EF",     // Powder Blue - soft section backgrounds, highlights
          ivory: "#F5F1E8",      // Warm Ivory - main website background
          cream: "#E9E1D3",      // Soft Cream - cards & secondary surfaces
          dark: "#0F2038",       // Deep shadow tone
          border: "#D5CCBC",     // Subtle border tone for cream surfaces
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(20, 45, 78, 0.05)",
        card: "0 4px 20px rgba(20, 45, 78, 0.07)",
        elevated: "0 10px 30px rgba(20, 45, 78, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
