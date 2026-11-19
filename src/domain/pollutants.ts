/**
 * India National AQI sub-index calculator.
 * Computes per-pollutant sub-indices from concentrations using CPCB
 * breakpoints, and an overall AQI as the worst sub-index.
 *
 * Formula: Ip = ((Ihi - Ilo) / (Bhi - Blo)) × (Cp - Blo) + Ilo
 * @see docs/ASSUMPTIONS.md — CPCB breakpoint table
 */

import { type Breakpoint, PM25_BREAKPOINTS, PM10_BREAKPOINTS } from "@/domain/constants";

function linearInterpolate(
  concentration: number,
  concLo: number,
  concHi: number,
  aqiLo: number,
  aqiHi: number,
): number {
  const cRange = concHi - concLo;
  if (cRange === 0) return aqiLo;
  return ((aqiHi - aqiLo) / cRange) * (concentration - concLo) + aqiLo;
}

function interpolateSegment(
  concentration: number,
  bp: Breakpoint,
  next?: Breakpoint,
): number | null {
  if (concentration <= bp.concHi) {
    return linearInterpolate(concentration, bp.concLo, bp.concHi, bp.aqiLo, bp.aqiHi);
  }
  if (next && concentration < next.concLo) {
    return linearInterpolate(concentration, bp.concHi, next.concLo, bp.aqiHi, next.aqiLo);
  }
  return null;
}

/**
 * Linearly interpolate a sub-index value from concentration using CPCB formula.
 * Returns NaN for negative concentrations.
 */
export function subIndex(concentration: number, breakpoints: readonly Breakpoint[]): number {
  if (!Number.isFinite(concentration) || concentration < 0) return NaN;

  // Clamp to max breakpoint: beyond last Bhi returns 500
  const last = breakpoints[breakpoints.length - 1];
  if (!last) return NaN;
  if (concentration > last.concHi) return 500;

  for (let i = 0; i < breakpoints.length; i++) {
    const bp = breakpoints[i]!;
    if (concentration >= bp.concLo) {
      const result = interpolateSegment(concentration, bp, breakpoints[i + 1]);
      if (result !== null) return result;
    }
  }

  return NaN;
}

/**
 * PM2.5 sub-index from 24-hr average concentration (µg/m³).
 */
export function pm25SubIndex(concentration: number): number {
  return subIndex(concentration, PM25_BREAKPOINTS);
}

/**
 * PM10 sub-index from 24-hr average concentration (µg/m³).
 */
export function pm10SubIndex(concentration: number): number {
  return subIndex(concentration, PM10_BREAKPOINTS);
}

export type PollutantReading = {
  /** PM2.5 24-hr average in µg/m³ */
  pm25?: number;
  /** PM10 24-hr average in µg/m³ */
  pm10?: number;
};

export type AqiResult = {
  /** Overall AQI (worst sub-index) */
  aqi: number;
  /** PM2.5 sub-index (NaN if not provided) */
  pm25SI: number;
  /** PM10 sub-index (NaN if not provided) */
  pm10SI: number;
  /** Which pollutant drove the overall AQI */
  dominant: "pm25" | "pm10" | "none";
};

/**
 * Compute the overall National AQI from pollutant concentrations.
 * The overall AQI is the maximum of all available sub-indices.
 */
export function computeAqi(reading: PollutantReading): AqiResult {
  const pm25SI = reading.pm25 !== undefined ? pm25SubIndex(reading.pm25) : NaN;
  const pm10SI = reading.pm10 !== undefined ? pm10SubIndex(reading.pm10) : NaN;

  const valid: Array<{ key: "pm25" | "pm10"; si: number }> = [];
  if (Number.isFinite(pm25SI)) valid.push({ key: "pm25", si: pm25SI });
  if (Number.isFinite(pm10SI)) valid.push({ key: "pm10", si: pm10SI });

  if (valid.length === 0) {
    return { aqi: 0, pm25SI, pm10SI, dominant: "none" };
  }

  let dominant: "pm25" | "pm10" = valid[0]!.key;
  let maxSI = valid[0]!.si;

  for (let i = 1; i < valid.length; i++) {
    const v = valid[i]!;
    if (v.si > maxSI) {
      maxSI = v.si;
      dominant = v.key;
    }
  }

  return {
    aqi: Math.round(maxSI),
    pm25SI: Number.isFinite(pm25SI) ? Math.round(pm25SI) : pm25SI,
    pm10SI: Number.isFinite(pm10SI) ? Math.round(pm10SI) : pm10SI,
    dominant,
  };
}
