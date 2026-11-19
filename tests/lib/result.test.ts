import { describe, expect, it } from "vitest";
import { err, mapResult, ok } from "@/lib/result";

describe("Result", () => {
  it("maps success values and preserves errors", () => {
    expect(mapResult(ok(2), (n) => n * 2)).toEqual(ok(4));
    expect(mapResult(err("nope"), (n: number) => n * 2)).toEqual(err("nope"));
  });
});
