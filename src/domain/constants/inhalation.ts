/**
 * @packageDocumentation
 * Human inhalation rates (m³/h) stratified by demographic group and physical exertion level.
 * @see docs/ASSUMPTIONS.md — EPA Exposure Factors Handbook Chapter 6.
 */

/**
 * Volumetric inhalation rates (m³/h) across physical exertion levels.
 */
export type InhalationRates = {
  /** Inhalation rate during rest or sleep (m³/h). */
  readonly rest: number;
  /** Inhalation rate during sedentary or light activity (m³/h). */
  readonly light: number;
  /** Inhalation rate during active transit, walking, or moderate exercise (m³/h). */
  readonly moderate: number;
};

/**
 * Demographic age categories for respiratory intake estimation.
 */
export type InhalationDemographic = "adult" | "child" | "elder";

/**
 * Inhalation rates in m³/h by demographic and physical activity level.
 * Sourced from EPA Exposure Factors Handbook Chapter 6, Table 6-2.
 */
export const INHALATION_RATE_M3_PER_HR: Record<
  InhalationDemographic,
  InhalationRates & { readonly source: string }
> = {
  adult: {
    rest: 0.45,
    light: 0.9,
    moderate: 1.6,
    source: "EPA EFH Ch 6, Table 6-2 (ages 21–64, mean)",
  },
  child: {
    rest: 0.3,
    light: 0.5,
    moderate: 0.8,
    source: "EPA EFH Ch 6, Table 6-2 (ages 3–10, mean)",
  },
  elder: {
    rest: 0.4,
    light: 0.7,
    moderate: 1.0,
    source: "EPA EFH Ch 6, Table 6-2 (ages 65+, mean)",
  },
} as const;
