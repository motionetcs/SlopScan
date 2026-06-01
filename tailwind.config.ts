import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b10",
        panel: "#111621",
        line: "rgba(255,255,255,0.12)",
        ghost: {
          mint: "#5ff1c8",
          cyan: "#77d9ff",
          amber: "#ffcf66",
          rose: "#ff6f91",
          violet: "#b79cff",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(119, 217, 255, 0.14), 0 24px 90px rgba(0, 0, 0, 0.45)",
        soft: "0 16px 50px rgba(0, 0, 0, 0.28)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
