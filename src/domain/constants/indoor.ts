/**
 * @packageDocumentation
 * Indoor air quality: mass-balance model physical parameters.
 * Covers envelope penetration factors, air exchange rates, surface deposition rates, and room geometries.
 * @see docs/ASSUMPTIONS.md — EPA Exposure Factors Handbook, Chen & Zhao 2011.
 */

/** Default room floor area in square meters (~40 m² for typical urban Delhi-NCR residential room). */
export const DEFAULT_ROOM_FLOOR_AREA_M2 = 40;

/** Default ceiling height in meters (2.7 m standard residential construction). */
export const DEFAULT_CEILING_HEIGHT_M = 2.7;

/** Default room volume V in cubic meters (40 m² × 2.7 m = 108 m³). */
export const DEFAULT_ROOM_VOLUME_M3 = 108;

/**
 * Penetration factor P for PM2.5 through building envelope (dimensionless, 0–1).
 * Fraction of outdoor PM2.5 that enters through building infiltration paths.
 */
export const PENETRATION = {
  sealed: { low: 0.6, central: 0.7, high: 0.8 },
  leaky: { low: 0.8, central: 0.9, high: 0.95 },
  source: "EPA, Chen & Zhao 2011, Environ. Sci. Technol. 45:6",
} as const;

/**
 * Air exchange rate a (per hour, h⁻¹).
 * Air changes per hour via natural infiltration or intentional natural ventilation.
 */
export const AIR_EXCHANGE_PER_HR = {
  sealed: { low: 0.1, central: 0.3, high: 0.5 },
  leaky: { low: 0.7, central: 1.0, high: 1.5 },
  ventilating: { low: 2.0, central: 5.0, high: 10.0 },
  source: "ASHRAE 62.2, EPA Exposure Factors Handbook Ch 19",
} as const;

/**
 * Deposition rate k (per hour, h⁻¹) for PM2.5 onto indoor room surfaces.
 * Loss rate due to gravitational settling, Brownian diffusion, and turbulent impaction.
 */
export const DEPOSITION_RATE_PER_HR = {
  low: 0.15,
  central: 0.3,
  high: 0.5,
  source: "Lai & Nazaroff 2000, J. Aerosol Sci. 31:4",
} as const;
