import { describe, expect, it } from "vitest";
import { TtlCache } from "@/lib/cache";

describe("TtlCache", () => {
  it("stores and retrieves values before expiry", () => {
    const cache = new TtlCache<string>(1000, 2000);
    cache.set("k1", "v1");

    const res = cache.get("k1");
    expect(res).not.toBeNull();
    expect(res?.value).toBe("v1");
    expect(res?.isStale).toBe(false);
  });

  it("returns null for non-existent keys", () => {
    const cache = new TtlCache<string>();
    expect(cache.get("missing")).toBeNull();
  });

  it("deletes and clears values", () => {
    const cache = new TtlCache<string>();
    cache.set("k1", "v1");
    cache.set("k2", "v2");
    expect(cache.size()).toBe(2);

    cache.delete("k1");
    expect(cache.get("k1")).toBeNull();
    expect(cache.get("k2")?.value).toBe("v2");

    cache.clear();
    expect(cache.size()).toBe(0);
  });
});
