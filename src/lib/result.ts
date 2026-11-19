/**
 * Discriminated Result type for expected failures.
 * Unexpected errors are logged and mapped to generic AppError responses.
 */

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

/** Create a successful Result. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/** Create a failed Result. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/** Map the success value of a Result. */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (!result.ok) return result;
  return ok(fn(result.value));
}
