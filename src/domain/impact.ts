/**
 * Impact Engine: deterministic comparison of baseline vs. planned routine.
 * Computes personal PM2.5 inhaled dose and CO2e emissions across low/central/high estimates.
 *
 * The LLM NEVER invents numbers. All figures, formulas, and ranges are computed here.
 * @see docs/ASSUMPTIONS.md
 */

import { getCookingFuelSpec, type CookingFuelKey } from "@/domain/constants";
import { indoorPm25, type IndoorResult } from "@/domain/indoor";
import { computeExposure, type ExposureResult, type Demographic } from "@/domain/exposure";
import { transitCo2e } from "@/domain/transport";
import type { ActionItem, HouseholdProfile, ActionPlanModifier } from "@/domain/actions";

export type EstimateTier = "low" | "central" | "high";

export type ImpactMetrics = {
  readonly indoorPm25Before: number;
  readonly indoorPm25After: number;
  readonly personalDoseBeforeUg: number;
  readonly personalDoseAfterUg: number;
  readonly doseReductionPct: number;
  readonly doseSavedUg: number;
  readonly transportCo2eBeforeG: number;
  readonly transportCo2eAfterG: number;
  readonly transportCo2eSavedG: number;
  readonly cookingCo2eBeforeG: number;
  readonly cookingCo2eAfterG: number;
  readonly cookingCo2eSavedG: number;
  readonly totalCo2eSavedG: number;
};

export type DayImpactSummary = {
  readonly low: ImpactMetrics;
  readonly central: ImpactMetrics;
  readonly high: ImpactMetrics;
  readonly appliedActions: readonly ActionItem[];
  readonly formulaSummary: string;
  readonly primarySources: readonly string[];
};

type DaySimulation = {
  indoor: IndoorResult;
  exposure: ExposureResult;
  transportCo2e: number;
  cookingCo2e: number;
};

function resolveDemographic(profile: HouseholdProfile): Demographic {
  if (profile.hasChildren) return "child";
  if (profile.hasElders) return "elder";
  return "adult";
}

function mergeModifiers(actions: readonly ActionItem[]): ActionPlanModifier {
  return actions.reduce<ActionPlanModifier>((acc, action) => {
    return {
      targetMask: action.modifier.targetMask ?? acc.targetMask,
      targetPurifier: action.modifier.targetPurifier ?? acc.targetPurifier,
      targetHomeType: action.modifier.targetHomeType ?? acc.targetHomeType,
      targetCommuteMode: action.modifier.targetCommuteMode ?? acc.targetCommuteMode,
      targetCookingFuel: action.modifier.targetCookingFuel ?? acc.targetCookingFuel,
      outdoorHoursReduction: Math.max(
        acc.outdoorHoursReduction ?? 0,
        action.modifier.outdoorHoursReduction ?? 0,
      ),
      ventilationWindowOnly: acc.ventilationWindowOnly || action.modifier.ventilationWindowOnly,
    };
  }, {});
}

function simulateDay(
  profile: HouseholdProfile,
  ambientPm25: number,
  tier: EstimateTier,
  modifier: ActionPlanModifier = {},
): DaySimulation {
  const homeType = modifier.targetHomeType ?? profile.homeType;
  const purifier = modifier.targetPurifier ?? profile.purifier;
  const commuteMode = modifier.targetCommuteMode ?? profile.commuteMode;
  const mask = modifier.targetMask ?? profile.mask;
  const fuelKey: CookingFuelKey = modifier.targetCookingFuel ?? profile.cookingFuel;

  const cookingSpec = getCookingFuelSpec(fuelKey);
  const cookingEmission = cookingSpec.pm25EmissionRate[tier];
  const cookingCo2e = cookingSpec.co2ePerHour[tier] * 1.5; // ~1.5 hours cooking/day

  const indoor = indoorPm25(
    {
      outdoorPm25: ambientPm25,
      homeType,
      purifier,
      indoorSourceRate: cookingEmission,
    },
    tier,
  );

  const outdoorHours = Math.max(0.5, 2.0 - (modifier.outdoorHoursReduction ?? 0));
  const commuteHours = 1.5;
  const indoorHours = Math.max(0, 24 - outdoorHours - commuteHours);

  const demographic = resolveDemographic(profile);
  const exposure = computeExposure(
    [
      {
        label: "Home",
        concentration: indoor.indoorPm25,
        hours: indoorHours,
        activity: "rest",
        mask: "none",
      },
      {
        label: "Outdoors",
        concentration: ambientPm25,
        hours: outdoorHours,
        activity: "moderate",
        mask,
      },
      {
        label: "Transit",
        concentration: ambientPm25,
        hours: commuteHours,
        activity: "light",
        mask,
      },
    ],
    demographic,
    tier,
  );

  const transportCo2e = transitCo2e(profile.commuteDistanceKm, commuteMode, tier);

  return { indoor, exposure, transportCo2e, cookingCo2e };
}

function calculateTierMetrics(
  profile: HouseholdProfile,
  ambientPm25: number,
  tier: EstimateTier,
  modifier: ActionPlanModifier,
): ImpactMetrics {
  const before = simulateDay(profile, ambientPm25, tier);
  const after = simulateDay(profile, ambientPm25, tier, modifier);

  const doseSavedUg = Math.max(0, before.exposure.totalDose - after.exposure.totalDose);
  const doseReductionPct =
    before.exposure.totalDose > 0 ? (doseSavedUg / before.exposure.totalDose) * 100 : 0;

  const transportCo2eSavedG = Math.max(0, before.transportCo2e - after.transportCo2e);
  const cookingCo2eSavedG = Math.max(0, before.cookingCo2e - after.cookingCo2e);
  const totalCo2eSavedG = transportCo2eSavedG + cookingCo2eSavedG;

  return {
    indoorPm25Before: Math.round(before.indoor.indoorPm25),
    indoorPm25After: Math.round(after.indoor.indoorPm25),
    personalDoseBeforeUg: Math.round(before.exposure.totalDose),
    personalDoseAfterUg: Math.round(after.exposure.totalDose),
    doseReductionPct: Math.round(doseReductionPct),
    doseSavedUg: Math.round(doseSavedUg),
    transportCo2eBeforeG: Math.round(before.transportCo2e),
    transportCo2eAfterG: Math.round(after.transportCo2e),
    transportCo2eSavedG: Math.round(transportCo2eSavedG),
    cookingCo2eBeforeG: Math.round(before.cookingCo2e),
    cookingCo2eAfterG: Math.round(after.cookingCo2e),
    cookingCo2eSavedG: Math.round(cookingCo2eSavedG),
    totalCo2eSavedG: Math.round(totalCo2eSavedG),
  };
}

/**
 * Compare baseline day against planned routine across all three uncertainty tiers.
 */
export function computeImpact(
  profile: HouseholdProfile,
  ambientPm25: number,
  actions: readonly ActionItem[],
): DayImpactSummary {
  const modifier = mergeModifiers(actions);

  const low = calculateTierMetrics(profile, ambientPm25, "low", modifier);
  const central = calculateTierMetrics(profile, ambientPm25, "central", modifier);
  const high = calculateTierMetrics(profile, ambientPm25, "high", modifier);

  const primarySources = Array.from(
    new Set(
      actions
        .map((a) => a.source)
        .concat([
          "CPCB National AQI standards",
          "EPA Exposure Factors Handbook (Inhalation rates)",
          "Chen & Zhao 2011 (Indoor mass-balance)",
        ]),
    ),
  );

  return {
    low,
    central,
    high,
    appliedActions: actions,
    formulaSummary:
      "Dose = Σ(Conc × InhalationRate × Hours / MaskFactor); C_in = (P·a·C_out + S/V)/(a + k + CADR/V)",
    primarySources,
  };
}
