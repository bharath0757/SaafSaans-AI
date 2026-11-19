import { describe, expect, it } from "vitest";
import { tokens } from "@/design/tokens";
import { contrastRatio, luminanceDelta, relativeLuminance } from "@/lib/contrast";

describe("design token contrast", () => {
  it("body ink on fog meets WCAG AA (≥ 4.5:1)", () => {
    expect(contrastRatio(tokens.colors.ink, tokens.colors.fog)).toBeGreaterThanOrEqual(4.5);
  });

  it("body ink on paper meets WCAG AAA (≥ 7:1)", () => {
    expect(contrastRatio(tokens.colors.ink, tokens.colors.paper)).toBeGreaterThanOrEqual(7);
  });

  it("teal on paper meets WCAG AA for UI text", () => {
    expect(contrastRatio(tokens.colors.teal, tokens.colors.paper)).toBeGreaterThanOrEqual(4.5);
  });

  it("adjacent AQI bands differ enough in luminance", () => {
    const colours = [
      tokens.aqi.good.color,
      tokens.aqi.satisfactory.color,
      tokens.aqi.moderate.color,
      tokens.aqi.poor.color,
      tokens.aqi.veryPoor.color,
      tokens.aqi.severe.color,
    ];
    for (let i = 0; i < colours.length - 1; i += 1) {
      const a = colours[i]!;
      const b = colours[i + 1]!;
      expect(luminanceDelta(a, b)).toBeGreaterThan(0.025);
    }
  });

  it("AQI severity generally darkens (lightness steps down)", () => {
    const luminances = [
      relativeLuminance(tokens.aqi.good.color),
      relativeLuminance(tokens.aqi.satisfactory.color),
      relativeLuminance(tokens.aqi.moderate.color),
      relativeLuminance(tokens.aqi.poor.color),
      relativeLuminance(tokens.aqi.veryPoor.color),
      relativeLuminance(tokens.aqi.severe.color),
    ];
    expect(luminances[0]!).toBeGreaterThan(luminances[luminances.length - 1]!);
  });
});
