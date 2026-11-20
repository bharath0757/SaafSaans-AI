import { NextResponse } from "next/server";
import { type RateLimiter, clientKeyFromHeaders } from "@/lib/rate-limit";
import { AppError, toErrorResponse } from "@/lib/errors";
import { logger } from "@/lib/logger";

export function checkRateLimit(
  headers: Headers,
  limiter: RateLimiter,
  message = "Too many requests. Please wait a moment.",
): { remaining: number } {
  const key = clientKeyFromHeaders(headers);
  const limit = limiter.check(key);
  if (!limit.allowed) {
    throw new AppError("RATE_LIMITED", message, 429);
  }
  return { remaining: limit.remaining };
}

export function handleRouteError(
  error: unknown,
  logEvent: string,
  fallbackMessage: string,
): Response {
  if (error instanceof AppError) {
    return NextResponse.json(toErrorResponse(error), { status: error.status });
  }
  logger.error(logEvent, { error: String(error) });
  const internal = new AppError("INTERNAL", fallbackMessage, 500);
  return NextResponse.json(toErrorResponse(internal), { status: 500 });
}
