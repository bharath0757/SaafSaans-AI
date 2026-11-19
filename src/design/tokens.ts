/**
 * Design tokens — single source of colour, type, space and radii.
 * AQI colours step in lightness so severity order survives colour-vision deficiency.
 * @see docs/DESIGN.md (Phase 4) and SCAQMD accessible AQI scale.
 */

export const tokens = {
  colors: {
    fog: "#F1F4F5",
    paper: "#FFFFFF",
    ink: "#11222C",
    muted: "#3E5360",
    line: "#C9D3D8",
    teal: "#0B5D66",
    saffron: "#8F4A00",
  },
  dark: {
    fog: "#0E161A",
    paper: "#152028",
    ink: "#E8EEF1",
    muted: "#A8B8C0",
    line: "#2A3A42",
    teal: "#3DB8C4",
    saffron: "#E09A4A",
  },
  /**
   * India National AQI bands. Colour + lightness ramp + distinct shape icon name.
   * Never rely on colour alone — always pair with band label and icon.
   */
  aqi: {
    good: { color: "#30A85C", label: "Good", icon: "circle", min: 0, max: 50 },
    satisfactory: {
      color: "#6B9018",
      label: "Satisfactory",
      icon: "diamond",
      min: 51,
      max: 100,
    },
    moderate: {
      color: "#8A6200",
      label: "Moderate",
      icon: "triangle",
      min: 101,
      max: 200,
    },
    poor: { color: "#9A3800", label: "Poor", icon: "square", min: 201, max: 300 },
    veryPoor: {
      color: "#701028",
      label: "Very poor",
      icon: "hexagon",
      min: 301,
      max: 400,
    },
    severe: {
      color: "#3A0810",
      label: "Severe",
      icon: "octagon",
      min: 401,
      max: 500,
    },
  },
  fonts: {
    display: [
      "Georgia",
      "Cambria",
      "Times New Roman",
      "Noto Serif Devanagari",
      "Noto Serif Telugu",
      "serif",
    ],
    sans: [
      "system-ui",
      "Segoe UI",
      "Nirmala UI",
      "Roboto",
      "Noto Sans",
      "Noto Sans Devanagari",
      "Noto Sans Telugu",
      "sans-serif",
    ],
  },
  /** Modular scale ≈ 1.25 */
  fontSize: {
    xs: ["0.8rem", { lineHeight: "1.4" }],
    sm: ["0.9rem", { lineHeight: "1.45" }],
    base: ["1.0625rem", { lineHeight: "1.6" }],
    lg: ["1.25rem", { lineHeight: "1.5" }],
    xl: ["1.563rem", { lineHeight: "1.35" }],
    "2xl": ["1.953rem", { lineHeight: "1.25" }],
    "3xl": ["2.441rem", { lineHeight: "1.2" }],
  },
  spacing: {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
  },
  radii: {
    control: "4px",
    surface: "12px",
  },
  focus: {
    ringWidth: "3px",
    ringOffset: "3px",
    ringColor: "#0B5D66",
  },
} as const;

export type AqiBandKey = keyof typeof tokens.aqi;
export type TokenColors = typeof tokens.colors;
