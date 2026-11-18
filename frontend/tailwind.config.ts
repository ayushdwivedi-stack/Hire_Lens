import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F7F4",
        ink: {
          DEFAULT: "#1B1C1A",
          soft: "#4B4C48",
          faint: "#84857F",
        },
        line: {
          DEFAULT: "#DEDED7",
          strong: "#C3C4BB",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          sunken: "#F0F0EB",
        },
        accent: {
          DEFAULT: "#2F4F49",
          soft: "#E7EDEB",
          strong: "#1E3733",
        },
        good: {
          DEFAULT: "#3D7A54",
          soft: "#E7F1EA",
        },
        warn: {
          DEFAULT: "#9C6B15",
          soft: "#F3EBDA",
        },
        bad: {
          DEFAULT: "#AE4438",
          soft: "#F5E7E4",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "68ch",
        content: "1120px",
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
        md: "6px",
      },
      boxShadow: {
        none: "none",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-bar": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "pulse-bar": "pulse-bar 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
