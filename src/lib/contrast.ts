/**
 * Relative luminance and contrast helpers (WCAG 2.x).
 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

/** Parse #RRGGBB into linear RGB channels 0–1. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalised = hex.replace("#", "");
  if (normalised.length !== 6) {
    throw new Error(`Expected #RRGGBB, got ${hex}`);
  }
  const r = Number.parseInt(normalised.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalised.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalised.slice(4, 6), 16) / 255;
  return { r, g, b };
}

function channelLuminance(c: number): number {
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of a hex colour (0–1). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

/** WCAG contrast ratio between two hex colours. */
export function contrastRatio(foreground: string, background: string): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Absolute difference in relative luminance. */
export function luminanceDelta(a: string, b: string): number {
  return Math.abs(relativeLuminance(a) - relativeLuminance(b));
}
