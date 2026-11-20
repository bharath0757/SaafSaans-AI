/**
 * @packageDocumentation
 * Portable air purifier clean-air delivery rates (CADR, m³/h) by unit size category.
 * @see docs/ASSUMPTIONS.md — AHAM AC-1 standard and India-market purifier specifications.
 */

/**
 * Clean-air delivery rate (CADR) in m³/h for portable HEPA purifiers.
 * Values reflect AHAM AC-1 testing standards across typical India market appliances.
 */
export const PURIFIER_CADR_M3_PER_HR = {
  none: 0,
  small: { low: 80, central: 120, high: 160 },
  medium: { low: 150, central: 230, high: 300 },
  large: { low: 300, central: 400, high: 500 },
  source: "AHAM AC-1 standard; typical India-market purifier specs",
} as const;
