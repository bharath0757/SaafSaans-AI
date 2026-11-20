/**
 * GET /api/geocode?q={city}
 * Search cities with geocoding, returning coordinates and names.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { apiRateLimiter } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";
import { searchCities } from "@/services/geocoding";
import { checkRateLimit, handleRouteError } from "../_lib/api-helpers";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  q: z.string().trim().min(2, "Search query must be at least 2 characters").max(60),
});

export async function GET(request: Request): Promise<Response> {
  try {
    const { remaining } = checkRateLimit(request.headers, apiRateLimiter);
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
          "X-RateLimit-Remaining": String(remaining),
        },
      },
    );
  } catch (error) {
    return handleRouteError(error, "api_geocode_error", "Failed to search cities");
  }
}
