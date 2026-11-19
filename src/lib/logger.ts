/**
 * Structured logger that redacts secrets and sensitive profile fields.
 */

import { getEnv } from "@/lib/env";

const SECRET_KEYS = /api[_-]?key|authorization|password|secret|token|cookie|anthropic|gemini/i;
const HEALTH_KEYS = /condition|breathing|heart|health|diagnosis|medication/i;

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function redactObject(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    out[k] = SECRET_KEYS.test(k) || HEALTH_KEYS.test(k) ? "[REDACTED]" : redact(v);
  }
  return out;
}

/**
 * Deep-clone and redact keys that look like secrets or health fields.
 */
export function redact(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value.length > 8 && /sk-|AIza|Bearer\s/i.test(value) ? "[REDACTED]" : value;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === "object") return redactObject(value as Record<string, unknown>);
  return value;
}

function shouldLog(level: LogLevel): boolean {
  try {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[getEnv().LOG_LEVEL];
  } catch {
    return level !== "debug";
  }
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...(meta ? { meta: redact(meta) as Record<string, unknown> } : {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  // Structured server logs — allowlisted here only.
  // eslint-disable-next-line no-console -- intentional structured info/debug sink
  console.log(line);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
