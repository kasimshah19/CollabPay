import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // Override colors completely to ensure no default colors exist
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      bg: "var(--bg)",
      surface: "var(--surface)",
      ink: "var(--ink)",
      muted: "var(--muted)",
      line: "var(--line)",
      primary: "var(--primary)",
      "primary-ink": "var(--primary-ink)",
      soft: "var(--soft)",
      gold: "var(--gold)",
      "gold-ink": "var(--gold-ink)",
      ok: "var(--ok)",
      warn: "var(--warn)",
      bad: "var(--bad)",
      hero: "var(--hero)",
      "hero-ink": "var(--hero-ink)",
      "hero-muted": "var(--hero-muted)",
    },
    extend: {
      fontFamily: {
        sora: ["var(--font-sora)", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        'button-sm': '10px',
        'button': '12px',
        'input': '12px',
        'card': '20px',
        'hero': '28px', // Using 28px as per spec (24-28px)
      },
      maxWidth: {
        'content': '1080px',
      },
      boxShadow: {
        'soft': '0 1px 6px rgba(20, 17, 46, 0.12)',
        'receipt': '0 18px 40px rgba(0, 0, 0, 0.35)',
      },
      spacing: {
        'page': '20px',
        'grid-gap': '16px',
      }
    },
  },
  plugins: [],
};

export default config;
