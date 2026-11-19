import { describe, expect, it } from "vitest";
import { ALLOWED_OUTBOUND_HOSTS, validateOutboundUrl } from "@/lib/http";
import { AppError } from "@/lib/errors";

describe("Safe HTTP & SSRF Guard", () => {
  it("allows configured outbound hosts", () => {
    for (const host of ALLOWED_OUTBOUND_HOSTS) {
      const url = validateOutboundUrl(`https://${host}/test`);
      expect(url.hostname).toBe(host);
    }
  });

  it("blocks non-https schemes", () => {
    expect(() => validateOutboundUrl("http://api.open-meteo.com/test")).toThrowError(AppError);
  });

  it("blocks unapproved internal and external hosts (SSRF prevention)", () => {
    // Localhost / cloud metadata SSRF attempts
    expect(() => validateOutboundUrl("https://localhost:8080/")).toThrowError(AppError);
    expect(() => validateOutboundUrl("https://169.254.169.254/")).toThrowError(AppError);
    expect(() => validateOutboundUrl("https://evil-host.com/data")).toThrowError(AppError);
  });

  it("rejects malformed URLs", () => {
    expect(() => validateOutboundUrl("not-a-url")).toThrowError(AppError);
  });
});
