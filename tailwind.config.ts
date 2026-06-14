import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        broker: {
          bg: "#131722",
          card: "#1e222d",
          surface: "#2a2e39",
          "surface-hover": "#363a45",
          border: "#2a2e39",
          text: {
            primary: "#d1d4dc",
            secondary: "#787b86",
            muted: "#50535e",
          },
          green: "#089981",
          red: "#f23645",
          yellow: "#f0b90b",
          blue: "#5e9bff",
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"SF Mono"', '"Fira Code"', "Consolas", "monospace"],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["10px", "14px"],
        xs: ["11px", "16px"],
        sm: ["12px", "18px"],
        base: ["13px", "20px"],
      },
      spacing: {
        header: "44px",
        sidebar: "190px",
        orderbook: "280px",
      },
      borderRadius: {
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
};

export default config;
