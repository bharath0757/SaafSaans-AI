/**
 * @packageDocumentation
 * Aggregator and index for domain constants, specifications, and physical reference parameters.
 * Re-exports breakpoints, indoor physical parameters, purifier CADR ratings, inhalation rates,
 * mask filtration specifications, transit modes, and cooking fuel emission parameters.
 * Provides 100% backward compatibility for all imports from `@/domain/constants`.
 * @see docs/ASSUMPTIONS.md
 */

export * from "./breakpoints";
export * from "./indoor";
export {
  AIR_EXCHANGE_PER_HR as AIR_EXCHANGE,
  DEPOSITION_RATE_PER_HR as DEPOSITION_RATE,
  DEFAULT_ROOM_VOLUME_M3 as ROOM_VOLUME_M3,
} from "./indoor";
export * from "./purifier";
export { PURIFIER_CADR_M3_PER_HR as PURIFIER_CADR } from "./purifier";
export * from "./inhalation";
export { INHALATION_RATE_M3_PER_HR as INHALATION_RATE } from "./inhalation";
export * from "./mask";
export * from "./transport";
export * from "./cooking";
