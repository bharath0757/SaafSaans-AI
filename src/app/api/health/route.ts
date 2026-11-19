import { NextResponse } from "next/server";
import { z } from "zod";
import { getEnv, hasLlmKey } from "@/lib/env";
import { apiRateLimiter, clientKeyFromHeaders } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";

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
    const key = clientKeyFromHeaders(request.headers);
    const limit = apiRateLimiter.check(key);
    if (!limit.allowed) {
      throw new AppError("RATE_LIMITED", "Too many requests. Try again shortly.", 429);
    }

    getEnv();
    const body = healthSchema.parse({
      status: "ok",
      version: "0.1.0",
      llmConfigured: hasLlmKey(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(body, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(toErrorResponse(error), { status: error.status });
    }
    logger.error("health_failed", { error: String(error) });
    const internal = new AppError("INTERNAL", "Something went wrong.", 500);
    return NextResponse.json(toErrorResponse(internal), { status: 500 });
  }
}
