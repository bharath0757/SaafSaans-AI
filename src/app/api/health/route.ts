import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv, hasLlmKey } from "@/lib/env";
import { apiRateLimiter } from "@/lib/rate-limit";
import { checkRateLimit, handleRouteError } from "../_lib/api-helpers";

export const dynamic = "force-dynamic";

const healthSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
  llmConfigured: z.boolean(),
  timestamp: z.string(),
});

/**
 * GET /api/health — liveness probe; no secrets in the body.
 */
export async function GET(request: Request): Promise<Response> {
  try {
    const { remaining } = checkRateLimit(
      request.headers,
      apiRateLimiter,
      "Too many requests. Try again shortly.",
    );
    getEnv();
    const body = healthSchema.parse({
      status: "ok",
      version: "0.1.0",
      llmConfigured: hasLlmKey(),
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(body, {
      status: 200,
      headers: { "Cache-Control": "no-store", "X-RateLimit-Remaining": String(remaining) },
    });
  } catch (error) {
    return handleRouteError(error, "health_failed", "Something went wrong.");
  }
}
