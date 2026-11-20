/**
 * @packageDocumentation
 * Commuter transport modes: PM2.5 in-transit exposure multiplier and greenhouse gas emissions per passenger-km.
 * @see docs/ASSUMPTIONS.md — CSTEP 2020, DMRC, CAFE norms India.
 */

/**
 * Specification for a commuter transportation mode.
 */
export type TransportSpec = {
  /** User-facing display label. */
  readonly label: string;
  /**
   * Exposure multiplier relative to outdoor ambient PM2.5.
   * Multipliers > 1 denote elevated roadway microenvironment exposure (e.g. open-air two-wheeler in traffic).
   * Multipliers < 1 denote filtered or protected microenvironments (e.g. air-conditioned metro or cabin filter car).
   */
  readonly pm25Multiplier: {
    readonly low: number;
    readonly central: number;
    readonly high: number;
  };
  /**
   * Greenhouse gas emissions in grams CO2 equivalent per passenger-kilometer (g CO2e / passenger-km).
   */
  readonly co2ePerPkm: {
    readonly low: number;
    readonly central: number;
    readonly high: number;
  };
  /** Citation source for emission and microenvironment exposure parameters. */
  readonly source: string;
};

/**
 * Valid commuter transport mode identifier keys.
 */
export const TRANSPORT_KEYS = ["walk", "cycle", "twoWheeler", "car", "bus", "metro"] as const;

/**
 * String union type of supported commuter transport modes.
 */
export type TransportKey = (typeof TRANSPORT_KEYS)[number];

/**
 * Catalogue of supported commuter transportation modes and their technical specifications.
 */
export const TRANSPORT = {
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
} as const satisfies Record<TransportKey, TransportSpec>;
