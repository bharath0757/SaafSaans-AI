/**
 * @packageDocumentation
 * CPCB National Air Quality Index (NAQI) sub-index breakpoints for PM2.5 and PM10.
 * Defines linear interpolation bands and AQI limits.
 * @see docs/ASSUMPTIONS.md — Table 2 CPCB National AQI categories.
 */

/**
 * Breakpoint interval mapping a pollutant concentration range to an AQI sub-index range.
 */
export type Breakpoint = {
  /** AQI lower bound (inclusive, 0–500). */
  readonly aqiLo: number;
  /** AQI upper bound (inclusive, 0–500). */
  readonly aqiHi: number;
  /** Concentration lower bound in µg/m³ (inclusive). */
  readonly concLo: number;
  /** Concentration upper bound in µg/m³ (inclusive). */
  readonly concHi: number;
};

/** Minimum valid AQI value on the CPCB NAQI scale. */
export const MIN_AQI = 0;

/** Maximum valid AQI value on the CPCB NAQI scale (clamped upper bound). */
export const MAX_AQI = 500;

/** AQI threshold at or above which health alerts and warnings are triggered (Poor category). */
export const AQI_ALERT_THRESHOLD = 201;

/**
 * PM2.5 24-hr average concentration breakpoints in µg/m³ with corresponding AQI bands.
 * Source: Central Pollution Control Board (CPCB) National Air Quality Index categories.
 */
export const PM25_BREAKPOINTS: readonly Breakpoint[] = [
  { aqiLo: 0, aqiHi: 50, concLo: 0, concHi: 30 },
  { aqiLo: 51, aqiHi: 100, concLo: 31, concHi: 60 },
  { aqiLo: 101, aqiHi: 200, concLo: 61, concHi: 90 },
  { aqiLo: 201, aqiHi: 300, concLo: 91, concHi: 120 },
  { aqiLo: 301, aqiHi: 400, concLo: 121, concHi: 250 },
  { aqiLo: 401, aqiHi: 500, concLo: 251, concHi: 380 },
] as const;

/**
 * PM10 24-hr average concentration breakpoints in µg/m³ with corresponding AQI bands.
 * Source: Central Pollution Control Board (CPCB) National Air Quality Index categories.
 */
export const PM10_BREAKPOINTS: readonly Breakpoint[] = [
  { aqiLo: 0, aqiHi: 50, concLo: 0, concHi: 50 },
  { aqiLo: 51, aqiHi: 100, concLo: 51, concHi: 100 },
  { aqiLo: 101, aqiHi: 200, concLo: 101, concHi: 250 },
  { aqiLo: 201, aqiHi: 300, concLo: 251, concHi: 350 },
  { aqiLo: 301, aqiHi: 400, concLo: 351, concHi: 430 },
  { aqiLo: 401, aqiHi: 500, concLo: 431, concHi: 510 },
] as const;
