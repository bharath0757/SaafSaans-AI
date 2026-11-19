/**
 * Typed application errors returned from API routes.
 */

export type ErrorCode =
  "BAD_REQUEST" | "UNAUTHORIZED" | "RATE_LIMITED" | "NOT_FOUND" | "UPSTREAM" | "INTERNAL";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly publicMessage: string;

  constructor(code: ErrorCode, publicMessage: string, status: number, cause?: unknown) {
    super(publicMessage);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.publicMessage = publicMessage;
    if (cause !== undefined) {
      this.cause = cause;
    }
  }
}

export function toErrorResponse(error: AppError): {
  error: { code: ErrorCode; message: string };
} {
  return {
    error: {
      code: error.code,
      message: error.publicMessage,
    },
  };
}
