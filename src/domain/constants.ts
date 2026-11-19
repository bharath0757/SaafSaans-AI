/**
 * Cited constants for the Impact Engine.
 * Every value has a source, range, and unit.
 * All figures are **educational estimates**, not medical advice.
 * @see docs/ASSUMPTIONS.md
 */

// ---------------------------------------------------------------------------
// CPCB National AQI sub-index breakpoints (PM2.5 and PM10, 24-hr average)
// Source: CPCB "National Air Quality Index" document, Table 2
// https://cpcb.nic.in/displaypdf.php?id=bmF0aW9uYWwtYWlyLXF1YWxpdHktaW5kZXg=
// ---------------------------------------------------------------------------

export type Breakpoint = {
  /** AQI lower bound (inclusive) */
  readonly aqiLo: number;
  /** AQI upper bound (inclusive) */
  readonly aqiHi: number;
  /** Concentration lower bound (µg/m³, inclusive) */
  readonly concLo: number;
  /** Concentration upper bound (µg/m³, inclusive) */
  readonly concHi: number;
};

/**
 * PM2.5 24-hr average breakpoints (µg/m³).
 * Source: CPCB National AQI categories.
 */
export const PM25_BREAKPOINTS: readonly Breakpoint[] = [
  { aqiLo: 0, aqiHi: 50, concLo: 0, concHi: 30 },
  { aqiLo: 51, aqiHi: 100, concLo: 31, concHi: 60 },
  { aqiLo: 101, aqiHi: 200, concLo: 61, concHi: 90 },
  { aqiLo: 201, aqiHi: 300, concLo: 91, concHi: 120 },
  { aqiLo: 301, aqiHi: 400, concLo: 121, concHi: 250 },
  { aqiLo: 401, aqiHi: 500, concLo: 251, concHi: 380 },
] as const;

/**
 * PM10 24-hr average breakpoints (µg/m³).
 * Source: CPCB National AQI categories.
 */
export const PM10_BREAKPOINTS: readonly Breakpoint[] = [
  { aqiLo: 0, aqiHi: 50, concLo: 0, concHi: 50 },
  { aqiLo: 51, aqiHi: 100, concLo: 51, concHi: 100 },
  { aqiLo: 101, aqiHi: 200, concLo: 101, concHi: 250 },
  { aqiLo: 201, aqiHi: 300, concLo: 251, concHi: 350 },
  { aqiLo: 301, aqiHi: 400, concLo: 351, concHi: 430 },
  { aqiLo: 401, aqiHi: 500, concLo: 431, concHi: 510 },
] as const;

// ---------------------------------------------------------------------------
// Indoor air quality: mass-balance model parameters
// Source: EPA Exposure Factors Handbook, various peer-reviewed studies
// ---------------------------------------------------------------------------

/** Penetration factor P for PM2.5 through building envelope (dimensionless). */
export const PENETRATION = {
  /** Sealed / modern construction, windows closed */
  sealed: { low: 0.6, central: 0.7, high: 0.8 },
  /** Leaky / old construction or windows partly open */
  leaky: { low: 0.8, central: 0.9, high: 0.95 },
  source: "EPA, Chen & Zhao 2011, Environ. Sci. Technol. 45:6",
} as const;

/** Air exchange rate a (h⁻¹). */
export const AIR_EXCHANGE = {
  sealed: { low: 0.1, central: 0.3, high: 0.5 },
  leaky: { low: 0.7, central: 1.0, high: 1.5 },
  ventilating: { low: 2.0, central: 5.0, high: 10.0 },
  source: "ASHRAE 62.2, EPA Exposure Factors Handbook Ch 19",
} as const;

/** Deposition rate k (h⁻¹) for PM2.5 onto indoor surfaces. */
export const DEPOSITION_RATE = {
  low: 0.15,
  central: 0.3,
  high: 0.5,
  source: "Lai & Nazaroff 2000, J. Aerosol Sci. 31:4",
} as const;

/** Default room volume V (m³). ~40 m² × 2.7 m ceiling = ~108 m³. */
export const DEFAULT_ROOM_VOLUME_M3 = 108;

// ---------------------------------------------------------------------------
// Purifier clean-air delivery rate (CADR, m³/h)
// Source: AHAM standards, typical consumer purifier specs
// ---------------------------------------------------------------------------

export const PURIFIER_CADR = {
  none: 0,
  small: { low: 80, central: 120, high: 160 },
  medium: { low: 150, central: 230, high: 300 },
  large: { low: 300, central: 400, high: 500 },
  source: "AHAM AC-1 standard; typical India-market purifier specs",
} as const;

// ---------------------------------------------------------------------------
// Inhalation rates (m³/h) by demographic
// Source: EPA Exposure Factors Handbook, Ch 6, Table 6-1 to 6-38
// ---------------------------------------------------------------------------

export type InhalationRates = {
  readonly rest: number;
  readonly light: number;
  readonly moderate: number;
};

export const INHALATION_RATE: Record<
  "adult" | "child" | "elder",
  InhalationRates & { readonly source: string }
> = {
  adult: {
    rest: 0.45,
    light: 0.9,
    moderate: 1.6,
    source: "EPA EFH Ch 6, Table 6-2 (ages 21–64, mean)",
  },
  child: {
    rest: 0.3,
    light: 0.5,
    moderate: 0.8,
    source: "EPA EFH Ch 6, Table 6-2 (ages 3–10, mean)",
  },
  elder: {
    rest: 0.4,
    light: 0.7,
    moderate: 1.0,
    source: "EPA EFH Ch 6, Table 6-2 (ages 65+, mean)",
  },
} as const;

// ---------------------------------------------------------------------------
// Mask filtration efficiency (fraction of PM2.5 removed when worn)
// Source: NIOSH, CDC, peer-reviewed mask studies
// ---------------------------------------------------------------------------

export type MaskSpec = {
  readonly label: string;
  /** Filtration efficiency of the media itself (0–1) */
  readonly mediaEfficiency: number;
  /** Realistic assigned protection factor (1 = no protection) */
  readonly protectionFactor: { low: number; central: number; high: number };
  readonly source: string;
};

export const MASKS: Record<string, MaskSpec> = {
  none: {
    label: "No mask",
    mediaEfficiency: 0,
    protectionFactor: { low: 1, central: 1, high: 1 },
    source: "N/A",
  },
  cloth: {
    label: "Cloth mask",
    mediaEfficiency: 0.3,
    protectionFactor: { low: 1.2, central: 1.5, high: 2.0 },
    source: "CDC; Drewnick et al. 2021, Aerosol Sci. Technol. 55:1",
  },
  surgical: {
    label: "Surgical mask",
    mediaEfficiency: 0.6,
    protectionFactor: { low: 1.5, central: 2.5, high: 4.0 },
    source: "CDC; NIOSH fit-testing data",
  },
  n95: {
    label: "N95 / KN95",
    mediaEfficiency: 0.95,
    protectionFactor: { low: 5, central: 10, high: 15 },
    source: "NIOSH 42 CFR 84; OSHA APF Table (29 CFR 1910.134)",
  },
} as const;

export type MaskKey = keyof typeof MASKS;

// ---------------------------------------------------------------------------
// Transport modes: PM2.5 exposure multiplier and CO2e per km
// Source: Indian commuter studies (IIT Delhi, CSTEP), IPCC, MoRTH
// ---------------------------------------------------------------------------

export type TransportSpec = {
  readonly label: string;
  /**
   * Exposure multiplier relative to ambient PM2.5.
   * >1 means higher exposure than ambient (e.g. sitting in traffic on a 2-wheeler).
   * <1 means lower (e.g. sealed car cabin).
   */
  readonly pm25Multiplier: { low: number; central: number; high: number };
  /** CO2 equivalent emissions (grams per passenger-km). */
  readonly co2ePerPkm: { low: number; central: number; high: number };
  readonly source: string;
};

export const TRANSPORT: Record<string, TransportSpec> = {
  walk: {
    label: "Walk",
    pm25Multiplier: { low: 0.9, central: 1.1, high: 1.5 },
    co2ePerPkm: { low: 0, central: 0, high: 0 },
    source: "EEER 2019; zero direct emissions",
  },
  cycle: {
    label: "Cycle",
    pm25Multiplier: { low: 1.0, central: 1.2, high: 1.6 },
    co2ePerPkm: { low: 0, central: 0, high: 0 },
    source: "EEER 2019; zero direct emissions",
  },
  twoWheeler: {
    label: "Two-wheeler",
    pm25Multiplier: { low: 1.2, central: 1.5, high: 2.0 },
    co2ePerPkm: { low: 40, central: 55, high: 70 },
    source: "CSTEP 2020, Shakti Foundation",
  },
  car: {
    label: "Car",
    pm25Multiplier: { low: 0.3, central: 0.5, high: 0.9 },
    co2ePerPkm: { low: 110, central: 150, high: 200 },
    source: "CAFE norms India; windows-closed AC on",
  },
  bus: {
    label: "Bus",
    pm25Multiplier: { low: 0.8, central: 1.3, high: 1.8 },
    co2ePerPkm: { low: 30, central: 60, high: 90 },
    source: "CSTEP 2020; per-passenger at avg occupancy",
  },
  metro: {
    label: "Metro",
    pm25Multiplier: { low: 0.2, central: 0.3, high: 0.5 },
    co2ePerPkm: { low: 15, central: 22, high: 30 },
    source: "Delhi Metro Rail Corp; ITF-OECD",
  },
} as const;

export type TransportKey = keyof typeof TRANSPORT;

// ---------------------------------------------------------------------------
// Cooking fuel indoor PM2.5 emission rates (µg/hr during active cooking)
// Source: WHO Indoor Air Quality Guidelines, IITK studies
// ---------------------------------------------------------------------------

export type CookingFuelSpec = {
  readonly label: string;
  /** Additional PM2.5 emitted indoors during cooking (µg/h). */
  readonly pm25EmissionRate: { low: number; central: number; high: number };
  readonly co2ePerHour: { low: number; central: number; high: number };
  readonly source: string;
};

export const COOKING_FUEL: Record<string, CookingFuelSpec> = {
  lpg: {
    label: "LPG",
    pm25EmissionRate: { low: 100, central: 300, high: 600 },
    co2ePerHour: { low: 800, central: 1200, high: 1600 },
    source: "WHO IAQ Guidelines 2014; Smith et al.",
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
} as const;

export type CookingFuelKey = "lpg" | "induction" | "biomass" | "kerosene";

export const DEFAULT_COOKING_FUEL_SPEC: CookingFuelSpec = {
  label: "LPG",
  pm25EmissionRate: { low: 100, central: 300, high: 600 },
  co2ePerHour: { low: 800, central: 1200, high: 1600 },
  source: "WHO IAQ Guidelines 2014; Smith et al.",
};

export function getCookingFuelSpec(fuel: CookingFuelKey): CookingFuelSpec {
  return COOKING_FUEL[fuel] ?? DEFAULT_COOKING_FUEL_SPEC;
}
