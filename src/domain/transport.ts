/**
 * Transport mode model: PM2.5 exposure and CO2e emissions per km.
 *
 * @see docs/ASSUMPTIONS.md
 */

import { TRANSPORT, type TransportKey, type TransportSpec } from "@/domain/constants";

export type Estimate = "low" | "central" | "high";

const DIVISOR_TWO = 2;
const PERCENT_MULTIPLIER = 100;
const ZERO_VALUE = 0;

/**
 * Get the transport specification for a given mode.
 */
export function getTransportSpec(mode: TransportKey): TransportSpec {
  const spec = TRANSPORT[mode];
  if (!spec) {
    return TRANSPORT.walk;
  }
  return spec;
}

/**
 * Compute PM2.5 concentration experienced while commuting in a given mode.
 * Returns ambient × multiplier (which may be >1 for open-air modes).
 */
export function transitPm25(
  ambientPm25: number,
  mode: TransportKey,
  estimate: Estimate = "central",
): number {
  const spec = getTransportSpec(mode);
  return ambientPm25 * spec.pm25Multiplier[estimate];
}

/**
 * CO2e emissions for a given distance and mode (grams).
 */
export function transitCo2e(
  distanceKm: number,
  mode: TransportKey,
  estimate: Estimate = "central",
): number {
  const spec = getTransportSpec(mode);
  return distanceKm * spec.co2ePerPkm[estimate];
}

export type TransportComparison = {
  pm25DeltaPct: number;
  co2eDeltaGrams: number;
  betterForPm25: TransportKey;
  betterForCo2e: TransportKey;
};

export type CompareTransportParams = {
  ambientPm25: number;
  distanceKm: number;
  modeA: TransportKey;
  modeB: TransportKey;
  estimate?: Estimate;
};

/**
 * Compare two transport modes on PM2.5 and CO2e.
 */
export function compareTransport(params: CompareTransportParams): TransportComparison {
  const { ambientPm25, distanceKm, modeA, modeB, estimate = "central" } = params;
  const pm25A = transitPm25(ambientPm25, modeA, estimate);
  const pm25B = transitPm25(ambientPm25, modeB, estimate);
  const co2eA = transitCo2e(distanceKm, modeA, estimate);
  const co2eB = transitCo2e(distanceKm, modeB, estimate);

  const pm25Avg = (pm25A + pm25B) / DIVISOR_TWO;
  const pm25DeltaPct =
    pm25Avg > ZERO_VALUE ? ((pm25B - pm25A) / pm25Avg) * PERCENT_MULTIPLIER : ZERO_VALUE;

  return {
    pm25DeltaPct,
    co2eDeltaGrams: co2eB - co2eA,
    betterForPm25: pm25A <= pm25B ? modeA : modeB,
    betterForCo2e: co2eA <= co2eB ? modeA : modeB,
  };
}

/**
 * Returns a list of all supported transport mode keys.
 */
export function listTransportModes(): TransportKey[] {
  return Object.keys(TRANSPORT) as TransportKey[];
}
