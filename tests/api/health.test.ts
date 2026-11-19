import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  it("returns ok status without secrets", async () => {
    const response = await GET(new Request("http://localhost/api/health"));
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      status: string;
      llmConfigured: boolean;
      version: string;
    };
    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
    expect(typeof body.llmConfigured).toBe("boolean");
    expect(JSON.stringify(body)).not.toMatch(/sk-|AIza|api[_-]?key/i);
  });
});
