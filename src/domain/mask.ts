/**
 * Mask protection model.
 *
 * Effective concentration = ambient / protectionFactor
 * A better mask fit or higher efficiency never raises the dose.
 *
 * @see docs/ASSUMPTIONS.md
 */

import { MASKS, type MaskKey, type MaskSpec } from "@/domain/constants";

export type Estimate = "low" | "central" | "high";

/**
 * Get the mask specification for a given mask key.
 */
export function getMaskSpec(mask: MaskKey): MaskSpec {
  const spec = MASKS[mask];
  if (!spec) {
    return MASKS.none;
  }
  return spec;
}

/**
 * Compute the effective PM2.5 concentration after mask filtration.
 * Always returns a value <= ambient (never raises exposure).
 */
export function maskedConcentration(
  ambientPm25: number,
  mask: MaskKey,
  estimate: Estimate = "central",
): number {
  const spec = getMaskSpec(mask);
  const pf = spec.protectionFactor[estimate];
  const reduced = ambientPm25 / pf;
  // Safety invariant: mask never increases exposure
  return Math.min(reduced, ambientPm25);
}

/**
 * Compute the reduction fraction from wearing a mask (0 = no reduction, 1 = full).
 */
export function maskReduction(mask: MaskKey, estimate: Estimate = "central"): number {
  const spec = getMaskSpec(mask);
  const pf = spec.protectionFactor[estimate];
  return Math.max(0, 1 - 1 / pf);
}

/**
 * List all available mask options with their specs.
 */
export function listMasks(): Array<{ key: MaskKey; spec: MaskSpec }> {
  return Object.entries(MASKS).map(([key, spec]) => ({
    key: key as MaskKey,
    spec,
  }));
}
