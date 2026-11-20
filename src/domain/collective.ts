/**
 * Collective Impact Domain: deterministic calculations for community action packs.
 * Computes avoided PM2.5 inhalation, CO2e savings, and clean air volume
 * scaled across apartments, blocks, RWAs, or neighborhood communities.
 *
 * @see docs/ASSUMPTIONS.md
 */

import type { DayImpactSummary, ImpactMetrics } from "@/domain/impact";

export type CollectiveImpact = {
  readonly households: number;
  readonly totalPm25AvoidedGrams: number;
  readonly totalCo2eAvoidedKg: number;
  readonly totalCigarettesAvoided: number;
  readonly cleanAirVolumeM3: number;
  readonly collectiveActions: readonly string[];
};

/**
 * Standard inhalation conversion: 1 cigarette-equivalent ≈ 220 µg inhaled PM2.5.
 * Grounded in Berkeley Earth / WHO ambient exposure equivalents.
 */
const CIGARETTE_EQUIVALENT_DOSE_UG = 220;

const CADR_M3_PER_HOUR = 230;
const PURIFIER_ACTIVE_HOURS_PER_DAY = 8;
const DAILY_PURIFIER_VOLUME_M3 = CADR_M3_PER_HOUR * PURIFIER_ACTIVE_HOURS_PER_DAY;
const MICROGRAMS_PER_GRAM = 1_000_000;
const GRAMS_PER_KG = 1000;
const DECIMAL_PLACES_GRAMS = 2;
const DECIMAL_PLACES_KG = 1;
const MIN_HOUSEHOLDS = 1;
const ZERO_DOSE = 0;

export function computeCollectiveImpact(
  households: number,
  impact: DayImpactSummary | ImpactMetrics,
): CollectiveImpact {
  const safeCount = Math.max(MIN_HOUSEHOLDS, Math.floor(households));
  const metrics: ImpactMetrics = "central" in impact ? impact.central : impact;

  const totalDoseSavedUg = Math.max(ZERO_DOSE, metrics.doseSavedUg) * safeCount;
  const totalPm25AvoidedGrams = Number(
    (totalDoseSavedUg / MICROGRAMS_PER_GRAM).toFixed(DECIMAL_PLACES_GRAMS),
  );
  const totalCo2eAvoidedKg = Number(
    ((metrics.totalCo2eSavedG * safeCount) / GRAMS_PER_KG).toFixed(DECIMAL_PLACES_KG),
  );
  const totalCigarettesAvoided = Math.round(totalDoseSavedUg / CIGARETTE_EQUIVALENT_DOSE_UG);
  const cleanAirVolumeM3 = Math.round(DAILY_PURIFIER_VOLUME_M3 * safeCount);

  const collectiveActions = [
    `Establish a shared HEPA/Corsi-Rosenthal clean air room in community clubhouse or library`,
    `Enforce a strict zero open leaf and trash burning policy across the society premises`,
    `Synchronize morning school carpools to eliminate idling at society entrance gates`,
    `Perform wet misting on unpaved pathways and access roads between 11 AM and 3 PM`,
  ];

  return {
    households: safeCount,
    totalPm25AvoidedGrams,
    totalCo2eAvoidedKg,
    totalCigarettesAvoided,
    cleanAirVolumeM3,
    collectiveActions,
  };
}
