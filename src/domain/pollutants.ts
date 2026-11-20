/**
 * India National AQI sub-index calculator.
 * Computes per-pollutant sub-indices from concentrations using CPCB
 * breakpoints, and an overall AQI as the worst sub-index.
 *
 * Formula: Ip = ((Ihi - Ilo) / (Bhi - Blo)) × (Cp - Blo) + Ilo
 * @see docs/ASSUMPTIONS.md — CPCB breakpoint table
 */

import { type Breakpoint, MAX_AQI, PM25_BREAKPOINTS, PM10_BREAKPOINTS } from "@/domain/constants";

type Interval = {
  readonly concLo: number;
  readonly concHi: number;
  readonly aqiLo: number;
  readonly aqiHi: number;
};

function linearInterpolate(concentration: number, interval: Interval): number {
  const cRange = interval.concHi - interval.concLo;
  if (cRange === 0) return interval.aqiLo;
  return (
    ((interval.aqiHi - interval.aqiLo) / cRange) * (concentration - interval.concLo) +
    interval.aqiLo
  );
}

function interpolateSegment(
  concentration: number,
  bp: Breakpoint,
  next?: Breakpoint,
): number | null {
  if (concentration <= bp.concHi) {
    return linearInterpolate(concentration, bp);
  }
  if (next && concentration < next.concLo) {
    return linearInterpolate(concentration, {
      concLo: bp.concHi,
      concHi: next.concLo,
      aqiLo: bp.aqiHi,
      aqiHi: next.aqiLo,
    });
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
  if (concentration > last.concHi) return MAX_AQI;

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

function roundIfFinite(val: number): number {
  return Number.isFinite(val) ? Math.round(val) : val;
}

/**
 * Compute the overall National AQI from pollutant concentrations.
 * The overall AQI is the maximum of all available sub-indices.
 */
export function computeAqi(reading: PollutantReading): AqiResult {
  const pm25SI = reading.pm25 !== undefined ? pm25SubIndex(reading.pm25) : NaN;
  const pm10SI = reading.pm10 !== undefined ? pm10SubIndex(reading.pm10) : NaN;

  const hasPm25 = Number.isFinite(pm25SI);
  const hasPm10 = Number.isFinite(pm10SI);

  if (!hasPm25 && !hasPm10) {
    return { aqi: 0, pm25SI, pm10SI, dominant: "none" };
  }

  if (hasPm25 && (!hasPm10 || pm25SI >= pm10SI)) {
    return {
      aqi: Math.round(pm25SI),
      pm25SI: Math.round(pm25SI),
      pm10SI: roundIfFinite(pm10SI),
      dominant: "pm25",
    };
  }

  return {
    aqi: Math.round(pm10SI),
    pm25SI: roundIfFinite(pm25SI),
    pm10SI: Math.round(pm10SI),
    dominant: "pm10",
  };
}
