import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        muted: "#667085",
        line: "#E6E8EC",
        brand: {
          50: "#EAF6F2",
          100: "#CFECE3",
          500: "#168C72",
          600: "#0F745E",
          700: "#0D5F4E"
        },
        coral: "#D75F4B"
      },
      boxShadow: {
        soft: "0 10px 30px rgba(23, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
