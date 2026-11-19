import type { Config } from "tailwindcss";
import { tokens } from "./src/design/tokens";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        fog: "var(--color-fog)",
        paper: "var(--color-paper)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        line: "var(--color-line)",
        teal: "var(--color-teal)",
        saffron: "var(--color-saffron)",
        "contrast-border": "var(--color-contrast-border)",
        "badge-border": "var(--color-badge-border)",
        aqi: {
          good: tokens.aqi.good.color,
          satisfactory: tokens.aqi.satisfactory.color,
          moderate: tokens.aqi.moderate.color,
          poor: tokens.aqi.poor.color,
          "very-poor": tokens.aqi.veryPoor.color,
          severe: tokens.aqi.severe.color,
        },
      },
      fontFamily: {
        display: [...tokens.fonts.display],
        sans: [...tokens.fonts.sans],
      },
      fontSize: {
        xs: [tokens.fontSize.xs[0], { ...tokens.fontSize.xs[1] }],
        sm: [tokens.fontSize.sm[0], { ...tokens.fontSize.sm[1] }],
        base: [tokens.fontSize.base[0], { ...tokens.fontSize.base[1] }],
        lg: [tokens.fontSize.lg[0], { ...tokens.fontSize.lg[1] }],
        xl: [tokens.fontSize.xl[0], { ...tokens.fontSize.xl[1] }],
        "2xl": [tokens.fontSize["2xl"][0], { ...tokens.fontSize["2xl"][1] }],
        "3xl": [tokens.fontSize["3xl"][0], { ...tokens.fontSize["3xl"][1] }],
      },
      spacing: tokens.spacing,
      borderRadius: {
        control: tokens.radii.control,
        surface: tokens.radii.surface,
      },
      maxWidth: {
        prose: "70ch",
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
    },
  },
  plugins: [],
};

export default config;
