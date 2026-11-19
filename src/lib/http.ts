/**
 * Safe HTTP fetch utility with SSRF allowlist, timeout, and response body size limits.
 */

import { AppError } from "@/lib/errors";

export const ALLOWED_OUTBOUND_HOSTS = new Set([
  "air-quality-api.open-meteo.com",
  "api.open-meteo.com",
  "geocoding-api.open-meteo.com",
  "api.anthropic.com",
  "generativelanguage.googleapis.com",
]);

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_RESPONSE_BYTES = 512 * 1024; // 512 KB

export type SafeFetchOptions = {
  timeoutMs?: number;
  maxBytes?: number;
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  body?: string;
};

/**
 * Validate that an outbound target URL is an allowlisted HTTPS destination.
 */
export function validateOutboundUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError("BAD_REQUEST", "Invalid target URL", 400);
  }

  if (parsed.protocol !== "https:") {
    throw new AppError("BAD_REQUEST", "Only HTTPS outbound requests allowed", 400);
  }

  if (!ALLOWED_OUTBOUND_HOSTS.has(parsed.hostname)) {
    throw new AppError("BAD_REQUEST", `Outbound host '${parsed.hostname}' is not permitted`, 403);
  }

  return parsed;
}

function handleFetchError(error: unknown): never {
  if (error instanceof AppError) throw error;
  if (error instanceof Error && error.name === "AbortError") {
    throw new AppError("UPSTREAM", "Upstream service timed out", 504, error);
  }
  throw new AppError("UPSTREAM", "Failed to communicate with upstream service", 502, error);
}

/**
 * Perform a hardened fetch with SSRF guard, timeout, and response size bounds.
 */
export async function safeFetch(
  rawUrl: string,
  options: SafeFetchOptions = {},
): Promise<{ status: number; text: string }> {
  const url = validateOutboundUrl(rawUrl);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? MAX_RESPONSE_BYTES;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: options.method ?? "GET",
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
    });

    const text = await response.text();
    if (text.length > maxBytes) {
      throw new AppError("UPSTREAM", "Response exceeded allowed size", 502);
    }

    return { status: response.status, text };
  } catch (error) {
    handleFetchError(error);
  } finally {
    clearTimeout(timer);
  }
}
