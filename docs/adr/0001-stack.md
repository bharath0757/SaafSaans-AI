# ADR 0001: Core stack

## Status

Accepted (Phase 1)

## Context

We need a small, accessible, Vercel-ready web app with strict TypeScript, no accounts, and a path to GenAI without requiring an API key.

## Decision

- Next.js App Router (latest patched) + React + TypeScript `strict` + `noUncheckedIndexedAccess`
- Tailwind CSS 3 with colours defined once in `src/design/tokens.ts`
- Zod for env, request and (later) LLM output validation
- Vitest + Testing Library + axe-core for unit/component tests
- System font stacks only (including Nirmala UI / Noto fallbacks for Hindi and Telugu)

## Consequences

Fast iteration on Vercel, strong a11y linting via `jsx-a11y` strict, and a clear seam for the Impact Engine before any LLM copy is shown.
