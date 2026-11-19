# ADR 0002: Nonce CSP via Next.js Proxy

## Status

Accepted (Phase 1)

## Context

Next.js 16 renames Middleware to Proxy (`src/proxy.ts`). Inline framework scripts need a per-request nonce for a strict CSP.

## Decision

Generate a 128-bit nonce in `proxy.ts`, set `Content-Security-Policy` on both the request (so Next can stamp scripts) and the response, and force dynamic rendering on pages that participate. Static headers remain in `config/security-headers.mjs` via `next.config.ts`.

## Consequences

Pages using CSP nonces cannot be fully statically cached. Security posture improves; we accept the dynamic rendering cost for HTML documents.
