/**
 * India National Air Quality Index (NAQI) band model.
 * Breakpoints follow CPCB National AQI categories (0–500).
 * Full pollutant sub-index math lands in Phase 2 (`pollutants.ts`).
 * @see docs/ASSUMPTIONS.md
 */

import { tokens, type AqiBandKey } from "@/design/tokens";

export type AqiBand = {
  key: AqiBandKey;
  label: string;
  icon: string;
  color: string;
  min: number;
  max: number;
};

const BAND_ORDER: AqiBandKey[] = ["good", "satisfactory", "moderate", "poor", "veryPoor", "severe"];

/**
 * Clamp an AQI value to the displayable National AQI range.
 */
export function clampAqi(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(500, Math.max(0, Math.round(value)));
}

/**
 * Resolve the National AQI band for a numeric index.
 */
export function getAqiBand(aqi: number): AqiBand {
  const value = clampAqi(aqi);
  for (const key of BAND_ORDER) {
    const band = tokens.aqi[key];
    if (value >= band.min && value <= band.max) {
      return { key, ...band };
    }
  }
  const severe = tokens.aqi.severe;
  return { key: "severe", ...severe };
}

/**
 * True when the band warrants a persistent alert banner (Poor or worse).
 */
export function isAlertBand(band: AqiBandKey): boolean {
  return band === "poor" || band === "veryPoor" || band === "severe";
}

/**
 * Position of an AQI value on the 0–500 ladder as a fraction (0–1).
 */
export function aqiLadderPosition(aqi: number): number {
  return clampAqi(aqi) / 500;
}

/**
 * One-sentence action hint for the current band (generic; personalised in Phase 4).
 */
export function defaultActionForBand(band: AqiBandKey): string {
  switch (band) {
    case "good":
      return "Air is good — outdoor activity is fine for most people.";
    case "satisfactory":
      return "Air is acceptable — sensitive groups may prefer shorter outdoor time.";
    case "moderate":
      return "Limit long outdoor exertion; prefer indoor exercise if you feel symptoms.";
    case "poor":
      return "Keep children and elders indoors when possible; wear a well-fitted mask outside.";
    case "veryPoor":
      return "Keep children indoors this morning. Prefer sealed rooms and a purifier if you have one.";
    case "severe":
      return "Stay indoors. Avoid outdoor exercise and unnecessary trips until air improves.";
  }
}

export function listAqiBands(): AqiBand[] {
  return BAND_ORDER.map((key) => ({ key, ...tokens.aqi[key] }));
}
