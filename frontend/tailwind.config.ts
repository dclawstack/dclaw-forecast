import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#0D9488",
      },
    },
  },
  plugins: [],
};

export default config;
