/**
 * @packageDocumentation
 * Personal respiratory protection specifications: mask filtration efficiency and assigned protection factors.
 * @see docs/ASSUMPTIONS.md — NIOSH 42 CFR 84; OSHA 29 CFR 1910.134.
 */

/**
 * Technical specification for a respiratory protective mask type.
 */
export type MaskSpec = {
  /** User-facing display label. */
  readonly label: string;
  /** Filtration efficiency of the media material itself (fraction between 0 and 1). */
  readonly mediaEfficiency: number;
  /**
   * Realistic workplace assigned protection factor (APF), accounting for face-seal leakage.
   * 1 represents zero protection (ambient concentration unchanged).
   */
  readonly protectionFactor: {
    readonly low: number;
    readonly central: number;
    readonly high: number;
  };
  /** Citation source for filtration and APF values. */
  readonly source: string;
};

/**
 * Valid mask identifier keys in order of increasing filtration protection.
 */
export const MASK_KEYS = ["none", "cloth", "surgical", "n95"] as const;

/**
 * String union type of supported mask identifiers.
 */
export type MaskKey = (typeof MASK_KEYS)[number];

/**
 * Catalogue of supported personal masks and their protective specifications.
 */
export const MASKS = {
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
} as const satisfies Record<MaskKey, MaskSpec>;
