/**
 * Transport mode model: PM2.5 exposure and CO2e emissions per km.
 *
 * @see docs/ASSUMPTIONS.md
 */

import { TRANSPORT, type TransportKey, type TransportSpec } from "@/domain/constants";

export type Estimate = "low" | "central" | "high";

/**
 * Get the transport specification for a given mode.
 */
export function getTransportSpec(mode: TransportKey): TransportSpec {
  const spec = TRANSPORT[mode];
  if (!spec) {
    return TRANSPORT.walk!;
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

/**
 * Compare two transport modes on PM2.5 and CO2e.
 */
export function compareTransport(
  ambientPm25: number,
  distanceKm: number,
  modeA: TransportKey,
  modeB: TransportKey,
  estimate: Estimate = "central",
): {
  pm25DeltaPct: number;
  co2eDeltaGrams: number;
  betterForPm25: TransportKey;
  betterForCo2e: TransportKey;
} {
  const pm25A = transitPm25(ambientPm25, modeA, estimate);
  const pm25B = transitPm25(ambientPm25, modeB, estimate);
  const co2eA = transitCo2e(distanceKm, modeA, estimate);
  const co2eB = transitCo2e(distanceKm, modeB, estimate);

  const pm25Avg = (pm25A + pm25B) / 2;
  const pm25DeltaPct = pm25Avg > 0 ? ((pm25B - pm25A) / pm25Avg) * 100 : 0;

  return {
    pm25DeltaPct,
    co2eDeltaGrams: co2eB - co2eA,
    betterForPm25: pm25A <= pm25B ? modeA : modeB,
    betterForCo2e: co2eA <= co2eB ? modeA : modeB,
  };
}

/**
 * List all available transport options with their specs.
 */
export function listTransportModes(): Array<{
  key: TransportKey;
  spec: TransportSpec;
}> {
  return Object.entries(TRANSPORT).map(([key, spec]) => ({
    key: key as TransportKey,
    spec,
  }));
}
