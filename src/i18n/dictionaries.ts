/**
 * Internationalization dictionaries and lookup helper.
 */

import { en } from "./en";
import { hi } from "./hi";
import { te } from "./te";

export type Locale = "en" | "hi" | "te";

export const dictionaries = {
  en,
  hi,
  te,
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

/** Typed dictionary lookup. */
export function t(locale: Locale, key: keyof Dictionary): string {
  return dictionaries[locale][key];
}
