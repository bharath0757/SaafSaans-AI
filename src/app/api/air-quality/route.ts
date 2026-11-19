/**
 * GET /api/air-quality?lat={lat}&lon={lon}
 * Returns current and 24-hour forecasted National AQI for rounded coordinates.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { apiRateLimiter, clientKeyFromHeaders } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getAirQuality } from "@/services/air-quality";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

export async function GET(request: Request): Promise<Response> {
  try {
    const key = clientKeyFromHeaders(request.headers);
    const limit = apiRateLimiter.check(key);
    if (!limit.allowed) {
      throw new AppError("RATE_LIMITED", "Too many requests. Please wait a moment.", 429);
    }

    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      lat: searchParams.get("lat"),
      lon: searchParams.get("lon"),
    });

    if (!parsed.success) {
      throw new AppError("BAD_REQUEST", "Invalid latitude or longitude parameters", 400);
    }

    const summary = await getAirQuality(parsed.data.lat, parsed.data.lon);

    return NextResponse.json(summary, {
      status: 200,
      headers: {
        "Cache-Control": summary.isStale
          ? "no-cache"
          : "public, max-age=600, stale-while-revalidate=3600",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(toErrorResponse(error), { status: error.status });
    }
    logger.error("api_air_quality_error", { error: String(error) });
    const internal = new AppError("INTERNAL", "Failed to retrieve air quality", 500);
    return NextResponse.json(toErrorResponse(internal), { status: 500 });
  }
}
