import { describe, expect, it } from "vitest";
import { buildCsp, createNonce } from "@/lib/csp";

describe("CSP builder", () => {
  it("embeds the nonce and denies framing", () => {
    const csp = buildCsp("abc123", false);
    expect(csp).toContain("nonce-abc123");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("unsafe-eval");
  });

  it("allows unsafe-eval only in development", () => {
    expect(buildCsp("n", true)).toContain("unsafe-eval");
  });

  it("creates unique nonces", () => {
    const a = createNonce();
    const b = createNonce();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(10);
  });
});
