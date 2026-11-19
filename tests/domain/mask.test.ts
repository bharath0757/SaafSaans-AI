import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { getMaskSpec, listMasks, maskedConcentration, maskReduction } from "@/domain/mask";

describe("Mask Protection Model", () => {
  it("retrieves mask specification correctly", () => {
    const spec = getMaskSpec("n95");
    expect(spec.mediaEfficiency).toBe(0.95);
    expect(spec.protectionFactor.central).toBe(10);

    const fallback = getMaskSpec("unknown" as never);
    expect(fallback.mediaEfficiency).toBe(0);
  });

  it("computes masked concentration accurately according to protection factor", () => {
    expect(maskedConcentration(200, "n95", "central")).toBe(20);
    expect(maskedConcentration(200, "surgical", "central")).toBe(80);
    expect(maskedConcentration(200, "none", "central")).toBe(200);
  });

  it("calculates reduction percentage correctly", () => {
    expect(maskReduction("n95", "central")).toBeCloseTo(0.9, 2);
    expect(maskReduction("none", "central")).toBe(0);
  });

  it("lists all available mask specifications", () => {
    const masks = listMasks();
    expect(masks.length).toBeGreaterThanOrEqual(4);
    expect(masks.some((m) => m.key === "n95")).toBe(true);
  });

  describe("Property-based invariants", () => {
    it("wearing a mask never increases concentration compared to ambient", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.constantFrom("none", "cloth", "surgical", "n95" as const),
          (ambient, mask) => {
            const effective = maskedConcentration(ambient, mask, "central");
            return effective <= ambient;
          },
        ),
      );
    });

    it("higher protection tier mask always yields lower or equal effective concentration", () => {
      fc.assert(
        fc.property(fc.float({ min: 0, max: 1000, noNaN: true }), (ambient) => {
          const cNone = maskedConcentration(ambient, "none", "central");
          const cCloth = maskedConcentration(ambient, "cloth", "central");
          const cSurg = maskedConcentration(ambient, "surgical", "central");
          const cN95 = maskedConcentration(ambient, "n95", "central");

          return cN95 <= cSurg && cSurg <= cCloth && cCloth <= cNone;
        }),
      );
    });
  });
});
