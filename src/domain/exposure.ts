/**
 * Personal PM2.5 exposure (dose) model.
 *
 * Dose = Σ (concentration_i × inhalationRate_i × time_i)
 *
 * summed over micro-environments: outdoor, indoor, in-transit (with optional mask).
 * Result is in µg inhaled (not per kg body weight, to keep it simple and transparent).
 *
 * @see docs/ASSUMPTIONS.md
 */

import { INHALATION_RATE } from "@/domain/constants";
import { maskedConcentration } from "@/domain/mask";
import { transitPm25 } from "@/domain/transport";
import type { MaskKey, TransportKey } from "@/domain/constants";

export type Demographic = "adult" | "child" | "elder";
export type ActivityLevel = "rest" | "light" | "moderate";
export type Estimate = "low" | "central" | "high";

export type MicroEnvironment = {
  /** Name for transparency */
  label: string;
  /** PM2.5 concentration in this micro-environment (µg/m³) */
  concentration: number;
  /** Time spent in this environment (hours) */
  hours: number;
  /** Activity level during this time */
  activity: ActivityLevel;
  /** Mask worn in this environment */
  mask: MaskKey;
};

export type ExposureResult = {
  /** Total PM2.5 dose inhaled (µg) */
  totalDose: number;
  /** Breakdown per micro-environment */
  breakdown: Array<{
    label: string;
    concentration: number;
    effectiveConcentration: number;
    hours: number;
    inhalationRate: number;
    dose: number;
  }>;
};

/**
 * Compute personal PM2.5 exposure for a set of micro-environments.
 */
export function computeExposure(
  environments: readonly MicroEnvironment[],
  demographic: Demographic,
  estimate: Estimate = "central",
): ExposureResult {
  const rates = INHALATION_RATE[demographic];

  const breakdown = environments.map((env) => {
    const inhalationRate = rates[env.activity];
    const effectiveConc = maskedConcentration(env.concentration, env.mask, estimate);
    const dose = effectiveConc * inhalationRate * env.hours;

    return {
      label: env.label,
      concentration: env.concentration,
      effectiveConcentration: effectiveConc,
      hours: env.hours,
      inhalationRate,
      dose: Math.max(0, dose),
    };
  });

  const totalDose = breakdown.reduce((sum, b) => sum + b.dose, 0);

  return { totalDose, breakdown };
}

/**
 * Build a standard day's micro-environments from a household profile.
 */
export function buildDayEnvironments(params: {
  outdoorPm25: number;
  indoorPm25: number;
  commuteMode: TransportKey;
  commuteDistanceKm: number;
  outdoorHours: number;
  commuteHours: number;
  indoorHours: number;
  outdoorMask: MaskKey;
  commuteMask: MaskKey;
  outdoorActivity: ActivityLevel;
  commuteActivity: ActivityLevel;
  indoorActivity: ActivityLevel;
  estimate?: Estimate;
}): MicroEnvironment[] {
  const est = params.estimate ?? "central";
  const transitConc = transitPm25(params.outdoorPm25, params.commuteMode, est);

  return [
    {
      label: "Indoor (home)",
      concentration: params.indoorPm25,
      hours: params.indoorHours,
      activity: params.indoorActivity,
      mask: "none",
    },
    {
      label: "Outdoor",
      concentration: params.outdoorPm25,
      hours: params.outdoorHours,
      activity: params.outdoorActivity,
      mask: params.outdoorMask,
    },
    {
      label: `Commute (${params.commuteMode})`,
      concentration: transitConc,
      hours: params.commuteHours,
      activity: params.commuteActivity,
      mask: params.commuteMask,
    },
  ];
}
