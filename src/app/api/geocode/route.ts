/**
 * GET /api/geocode?q={city}
 * Search cities with geocoding, returning coordinates and names.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { apiRateLimiter, clientKeyFromHeaders } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { searchCities } from "@/services/geocoding";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().min(2, "Search query must be at least 2 characters").max(60),
});

export async function GET(request: Request): Promise<Response> {
  try {
    const key = clientKeyFromHeaders(request.headers);
    const limit = apiRateLimiter.check(key);
    if (!limit.allowed) {
      throw new AppError("RATE_LIMITED", "Too many requests. Please wait a moment.", 429);
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({ q: searchParams.get("q") });

    if (!parsed.success) {
      throw new AppError("BAD_REQUEST", parsed.error.issues[0]?.message ?? "Invalid query", 400);
    }

    const cities = await searchCities(parsed.data.q);

    return NextResponse.json(
      { results: cities },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=86400",
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(toErrorResponse(error), { status: error.status });
    }
    logger.error("api_geocode_error", { error: String(error) });
    const internal = new AppError("INTERNAL", "Failed to search cities", 500);
    return NextResponse.json(toErrorResponse(internal), { status: 500 });
  }
}
