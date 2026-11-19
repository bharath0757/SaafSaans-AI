/**
 * Indoor air quality: steady-state mass-balance model.
 *
 * C_in = (P × a × C_out + S/V) / (a + k + CADR/V)
 *
 * Where:
 * - P    = penetration factor (0–1)
 * - a    = air exchange rate (h⁻¹)
 * - C_out = outdoor PM2.5 (µg/m³)
 * - S    = indoor source emission (µg/h), e.g. cooking
 * - V    = room volume (m³)
 * - k    = deposition rate (h⁻¹)
 * - CADR = purifier clean-air delivery rate (m³/h)
 *
 * @see docs/ASSUMPTIONS.md
 */

import {
  PENETRATION,
  AIR_EXCHANGE,
  DEPOSITION_RATE,
  DEFAULT_ROOM_VOLUME_M3,
  PURIFIER_CADR,
} from "@/domain/constants";

export type HomeType = "sealed" | "leaky";
export type PurifierSize = "none" | "small" | "medium" | "large";
export type Estimate = "low" | "central" | "high";

export type IndoorParams = {
  outdoorPm25: number;
  homeType: HomeType;
  purifier: PurifierSize;
  /** Additional indoor source emission rate (µg/h), e.g. from cooking */
  indoorSourceRate?: number;
  /** Room volume in m³ (defaults to DEFAULT_ROOM_VOLUME_M3) */
  roomVolume?: number;
  /** Whether windows are open for ventilation */
  ventilating?: boolean;
};

export type IndoorResult = {
  /** Indoor PM2.5 concentration (µg/m³) */
  indoorPm25: number;
  /** Indoor-to-outdoor ratio */
  ioRatio: number;
  /** Parameters used (for transparency) */
  params: {
    penetration: number;
    airExchange: number;
    deposition: number;
    cadr: number;
    volume: number;
    sourceRate: number;
  };
};

/**
 * Compute steady-state indoor PM2.5 from outdoor concentration and home config.
 */
export function indoorPm25(input: IndoorParams, estimate: Estimate = "central"): IndoorResult {
  const { outdoorPm25, homeType, purifier } = input;
  const sourceRate = input.indoorSourceRate ?? 0;
  const volume = input.roomVolume ?? DEFAULT_ROOM_VOLUME_M3;

  // Look up parameters by home type and estimate tier
  const p = PENETRATION[homeType][estimate];
  const a = input.ventilating
    ? AIR_EXCHANGE.ventilating[estimate]
    : AIR_EXCHANGE[homeType][estimate];
  const k = DEPOSITION_RATE[estimate];

  let cadr = 0;
  if (purifier !== "none") {
    cadr = PURIFIER_CADR[purifier][estimate];
  }

  // Steady-state formula
  const removalRate = a + k + cadr / volume;
  const indoor =
    removalRate > 0 ? (p * a * outdoorPm25 + sourceRate / volume) / removalRate : outdoorPm25;

  const ioRatio = outdoorPm25 > 0 ? indoor / outdoorPm25 : 0;

  return {
    indoorPm25: Math.max(0, indoor),
    ioRatio: Math.max(0, ioRatio),
    params: {
      penetration: p,
      airExchange: a,
      deposition: k,
      cadr,
      volume,
      sourceRate,
    },
  };
}

/**
 * Compute indoor PM2.5 for all three estimate tiers (low, central, high).
 */
export function indoorPm25Range(input: IndoorParams): {
  low: IndoorResult;
  central: IndoorResult;
  high: IndoorResult;
} {
  return {
    low: indoorPm25(input, "low"),
    central: indoorPm25(input, "central"),
    high: indoorPm25(input, "high"),
  };
}
