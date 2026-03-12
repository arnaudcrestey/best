import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#175cd3",
          accent: "#c3a55d",
        },
      },
      boxShadow: {
        soft: "0 16px 45px -24px rgba(23, 92, 211, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
