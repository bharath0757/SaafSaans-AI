/**
 * Action catalogue for smog navigation: routines, indoor hacks, and alternatives.
 * Every action has a deterministic effect, cost band, and transparency metadata.
 * @see docs/ASSUMPTIONS.md
 */

import type { MaskKey, TransportKey } from "@/domain/constants";
import type { HomeType, PurifierSize } from "@/domain/indoor";

export type CostBand = "free" | "low" | "medium" | "high";
export type ActionCategory = "routine" | "indoor" | "alternative";

export type HouseholdProfile = {
  readonly hasChildren: boolean;
  readonly hasElders: boolean;
  readonly hasRespiratoryCondition: boolean;
  readonly commuteMode: TransportKey;
  readonly commuteDistanceKm: number;
  readonly cookingFuel: "lpg" | "induction" | "biomass" | "kerosene";
  readonly homeType: HomeType;
  readonly purifier: PurifierSize;
  readonly mask: MaskKey;
  readonly budget: CostBand;
};

export type ActionPlanModifier = {
  readonly targetMask?: MaskKey;
  readonly targetPurifier?: PurifierSize;
  readonly targetHomeType?: HomeType;
  readonly targetCommuteMode?: TransportKey;
  readonly targetCookingFuel?: "lpg" | "induction";
  readonly outdoorHoursReduction?: number; // hours shifted indoors
  readonly ventilationWindowOnly?: boolean;
};

export type ActionItem = {
  readonly id: string;
  readonly category: ActionCategory;
  readonly title: string;
  readonly description: string;
  readonly costBand: CostBand;
  readonly icon: string;
  readonly isApplicable: (profile: HouseholdProfile, aqi: number) => boolean;
  readonly modifier: ActionPlanModifier;
  readonly explanation: string;
  readonly source: string;
};

export const ACTIONS: readonly ActionItem[] = [
  {
    id: "shift-outdoor-window",
    category: "routine",
    title: "Shift outdoor activity to afternoon",
    description:
      "Move walks, errands and children's outdoor play to 1:00 PM – 4:00 PM when winter inversion weakens.",
    costBand: "free",
    icon: "sun",
    isApplicable: (_profile, aqi) => aqi > 100,
    modifier: { outdoorHoursReduction: 1.0 },
    explanation:
      "Smog traps pollutants near the ground in morning and night inversions; afternoon solar warming disperses surface PM2.5.",
    source: "CPCB diurnal boundary-layer studies; SAFAR-India",
  },
  {
    id: "wear-n95-outside",
    category: "routine",
    title: "Wear an N95 respirator outdoors and during transit",
    description:
      "Fit a tight-sealing N95/KN95 respirator covering nose and mouth whenever outside.",
    costBand: "low",
    icon: "shield",
    isApplicable: (profile, aqi) => aqi > 150 && profile.mask !== "n95",
    modifier: { targetMask: "n95" },
    explanation:
      "Certified N95 media filters ≥95% of fine particulates; real-world assigned protection factor cuts inhaled dose by 80–90%.",
    source: "NIOSH 42 CFR 84; OSHA 29 CFR 1910.134",
  },
  {
    id: "seal-room-gaps",
    category: "indoor",
    title: "Seal window and door gaps",
    description:
      "Use rolled towels, weatherstripping, or tape to block infiltration cracks on external windows.",
    costBand: "low",
    icon: "door",
    isApplicable: (profile, aqi) => aqi > 200 && profile.homeType === "leaky",
    modifier: { targetHomeType: "sealed" },
    explanation:
      "Reduces air exchange rate from 1.0 h⁻¹ to 0.3 h⁻¹, cutting outdoor particulate infiltration by up to 50%.",
    source: "Chen & Zhao 2011; EPA Exposure Factors Handbook",
  },
  {
    id: "add-purifier-diy",
    category: "indoor",
    title: "Run a HEPA air purifier or DIY Corsi-Rosenthal box",
    description:
      "Operate a certified HEPA cleaner or box-fan MERV-13 filter in your primary bedroom/living room.",
    costBand: "medium",
    icon: "fan",
    isApplicable: (profile, aqi) => aqi > 150 && profile.purifier === "none",
    modifier: { targetPurifier: "medium" },
    explanation:
      "Adds 230 m³/h clean air delivery rate (CADR), rapidly reducing steady-state indoor PM2.5 concentration.",
    source: "AHAM AC-1 standard; Rosenthal & Corsi 2020",
  },
  {
    id: "timed-ventilation",
    category: "indoor",
    title: "Time ventilation strictly during peak afternoon",
    description:
      "Air out rooms for only 15–20 minutes between 1:00 PM and 3:00 PM; keep windows closed otherwise.",
    costBand: "free",
    icon: "window",
    isApplicable: (_profile, aqi) => aqi > 200,
    modifier: { ventilationWindowOnly: true },
    explanation:
      "Prevents high morning and nocturnal PM2.5 from accumulating indoors while allowing necessary CO2 release.",
    source: "IIT Delhi IAQ Guidelines; WHO Air Quality Guidelines",
  },
  {
    id: "switch-to-metro",
    category: "alternative",
    title: "Switch commute to Metro / Rapid Rail",
    description: "Replace solo two-wheeler or car trips with electric metro transit.",
    costBand: "low",
    icon: "train",
    isApplicable: (profile) =>
      profile.commuteMode === "twoWheeler" || profile.commuteMode === "car",
    modifier: { targetCommuteMode: "metro" },
    explanation:
      "Cuts personal PM2.5 transit exposure by ~70% and slashes commute CO2 emissions by up to 85%.",
    source: "Delhi Metro DMRC Environmental Impact Reports; CSTEP 2020",
  },
  {
    id: "switch-to-induction",
    category: "alternative",
    title: "Switch to induction cooktop",
    description:
      "Use an electric induction stove instead of unvented solid biomass, kerosene, or dirty gas.",
    costBand: "medium",
    icon: "zap",
    isApplicable: (profile) =>
      profile.cookingFuel === "biomass" || profile.cookingFuel === "kerosene",
    modifier: { targetCookingFuel: "induction" },
    explanation:
      "Eliminates direct indoor combustion smoke, avoiding thousands of micrograms of PM2.5 per hour.",
    source: "WHO Guidelines for Indoor Air Quality: Household Fuel Combustion (2014)",
  },
];

/**
 * Filter applicable actions for a given household profile and ambient AQI.
 */
export function getApplicableActions(
  profile: HouseholdProfile,
  aqi: number,
): readonly ActionItem[] {
  return ACTIONS.filter((action) => action.isApplicable(profile, aqi));
}
