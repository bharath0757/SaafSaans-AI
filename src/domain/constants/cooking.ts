/**
 * @packageDocumentation
 * Cooking fuel indoor PM2.5 emission rates (µg/h during active cooking) and greenhouse gas emissions per hour.
 * @see docs/ASSUMPTIONS.md — WHO IAQ Guidelines 2014; Balakrishnan et al. Lancet 2019.
 */

/**
 * Specification for an indoor residential cooking fuel.
 */
export type CookingFuelSpec = {
  /** User-facing display label. */
  readonly label: string;
  /** Additional PM2.5 emitted indoors during active cooking in µg/h. */
  readonly pm25EmissionRate: {
    readonly low: number;
    readonly central: number;
    readonly high: number;
  };
  /** Greenhouse gas emissions in grams CO2 equivalent per cooking hour (g CO2e / hour). */
  readonly co2ePerHour: {
    readonly low: number;
    readonly central: number;
    readonly high: number;
  };
  /** Citation source for emission factors. */
  readonly source: string;
};

/**
 * Valid residential cooking fuel keys.
 */
export const COOKING_FUEL_KEYS = ["lpg", "png", "induction", "biomass", "kerosene"] as const;

/**
 * String union type of supported residential cooking fuels.
 */
export type CookingFuelKey = (typeof COOKING_FUEL_KEYS)[number];

/**
 * Catalogue of supported cooking fuels with emission rates and carbon footprints.
 */
export const COOKING_FUEL = {
  lpg: {
    label: "LPG",
    pm25EmissionRate: { low: 100, central: 300, high: 600 },
    co2ePerHour: { low: 800, central: 1200, high: 1600 },
    source: "WHO IAQ Guidelines 2014; Smith et al.",
  },
  png: {
    label: "PNG (Piped Natural Gas)",
    pm25EmissionRate: { low: 100, central: 300, high: 600 },
    co2ePerHour: { low: 700, central: 1000, high: 1400 },
    source: "WHO IAQ Guidelines 2014; IGL PNG norms",
  },
  induction: {
    label: "Induction / Electric",
    pm25EmissionRate: { low: 10, central: 50, high: 150 },
    co2ePerHour: { low: 300, central: 500, high: 800 },
    source: "WHO IAQ Guidelines 2014 (mostly from food, not fuel)",
  },
  biomass: {
    label: "Biomass / Wood / Dung",
    pm25EmissionRate: { low: 2000, central: 5000, high: 10000 },
    co2ePerHour: { low: 2000, central: 3500, high: 5000 },
    source: "WHO IAQ Guidelines 2014; Balakrishnan et al. Lancet 2019",
  },
  kerosene: {
    label: "Kerosene",
    pm25EmissionRate: { low: 500, central: 1500, high: 3000 },
    co2ePerHour: { low: 1500, central: 2200, high: 3000 },
    source: "WHO IAQ Guidelines 2014; Lam et al. 2012",
  },
} as const satisfies Record<CookingFuelKey, CookingFuelSpec>;

/**
 * Default cooking fuel specification (LPG) used when fuel is unspecified or unmapped.
 */
export const DEFAULT_COOKING_FUEL_SPEC: CookingFuelSpec = {
  label: "LPG",
  pm25EmissionRate: { low: 100, central: 300, high: 600 },
  co2ePerHour: { low: 800, central: 1200, high: 1600 },
  source: "WHO IAQ Guidelines 2014; Smith et al.",
};

/**
 * Retrieves the technical specification for a cooking fuel with fallback to LPG default.
 *
 * @param fuel - Selected cooking fuel key, or null/undefined.
 * @returns Corresponding CookingFuelSpec.
 */
export function getCookingFuelSpec(fuel?: CookingFuelKey | null): CookingFuelSpec {
  if (!fuel || !(fuel in COOKING_FUEL)) {
    return DEFAULT_COOKING_FUEL_SPEC;
  }
  return COOKING_FUEL[fuel];
}
