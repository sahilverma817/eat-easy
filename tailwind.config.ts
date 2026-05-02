import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mango: {
          DEFAULT: "#F5B400",
          light: "#FFD557",
          dark: "#C99100",
        },
        mint: {
          DEFAULT: "#7DD3A0",
          light: "#B6E8C7",
          dark: "#3FA34D",
        },
        tomato: {
          DEFAULT: "#E94B3C",
          light: "#FF8A80",
        },
        curd: "#FFF8EC",
        roti: "#F1E4CB",
        leaf: "#3FA34D",
        charcoal: "#2A2A2A",
        soft: "#6B6155",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 8px 24px rgba(42,42,42,0.06)",
        glow: "0 0 40px rgba(245,180,0,0.35)",
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
        "spin-slow": "spin 8s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "sparkle": "sparkle 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
