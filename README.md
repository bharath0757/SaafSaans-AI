# SaafSaans

**Clearer choices for smog days** — a GenAI assistant that helps families and communities navigate severe winter smog and urban air pollution.

[![CI](https://github.com/bharath0757/saafsaans-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/bharath0757/saafsaans-ai/actions/workflows/ci.yml)
[![CodeQL](https://github.com/bharath0757/saafsaans-ai/actions/workflows/codeql.yml/badge.svg)](https://github.com/bharath0757/saafsaans-ai/actions/workflows/codeql.yml)

## Problem

Families in smog-affected Indian cities need plain-language guidance: when to go out, how to cut indoor exposure, and which low-emission swaps actually help — with numbers they can trust.

## Solution

SaafSaans combines live air-quality context (Open-Meteo), a **deterministic Impact Engine** for every figure, and optional GenAI for personalised explanations. With no API key, a rule-based planner still works. Profiles stay on-device; nothing health-related is logged server-side.

## Build status

| Phase              | Status      | Notes                                     |
| ------------------ | ----------- | ----------------------------------------- |
| 1 Foundation       | Done        | Scaffold, AQI domain, CSP, health API, CI |
| 2 Impact Engine    | Not started |                                           |
| 3 Services & API   | Not started |                                           |
| 4 Experience       | Not started |                                           |
| 5 Community & chat | Not started |                                           |
| 6 Hardening        | Not started |                                           |

## Problem-statement traceability

| Requirement                   | Feature                        | File(s)                         | Test                       | Status             |
| ----------------------------- | ------------------------------ | ------------------------------- | -------------------------- | ------------------ |
| Suggest low-emission routines | Daily plan (later)             | Phase 3–4                       | —                          | Planned            |
| Indoor air quality hacks      | Actions catalogue (later)      | Phase 2 `actions.ts`            | —                          | Planned            |
| Sustainable alternatives      | Transport / fuel swaps (later) | Phase 2 `transport.ts`          | —                          | Planned            |
| Tailored to location          | Geolocation + geocode (later)  | Phase 3–4                       | —                          | Planned            |
| Explain direct impact         | Impact Engine + cards          | Phase 2 + 4                     | Phase 2 tests              | Planned            |
| Right-now verdict             | AQI band + action sentence     | `src/domain/aqi.ts`, `HomeHero` | `tests/domain/aqi.test.ts` | Partial (demo AQI) |
| Repo &lt; 10 MB               | Size guard                     | `scripts/check-size.mjs`        | `npm run check:size`       | Done               |

## How it works

```mermaid
flowchart TB
  user[Household] --> ui[Accessible UI]
  ui --> api[API routes]
  api --> aq[Open-Meteo clients - Phase 3]
  api --> llm[LLMProvider / rule planner - Phase 3]
  api --> impact[Impact Engine - Phase 2]
  ui --> local[localStorage profile - Phase 4]
```

## Impact Engine

Phase 2 will publish formulas, assumptions and sources in `docs/ASSUMPTIONS.md`. Phase 1 ships the National AQI band model only — the LLM never invents numbers.

## Features (sample)

Phase 1 ships the accessible shell: answer-first hero, AQI ladder with band icon + label, skip link, en/hi/te dictionaries, `/api/health`.

## Tech stack

| Choice                                         | Why                                 |
| ---------------------------------------------- | ----------------------------------- |
| Next.js 16 App Router                          | Vercel-ready, Proxy CSP nonces      |
| TypeScript strict + `noUncheckedIndexedAccess` | Fewer silent undefined bugs         |
| Tailwind 3 + `tokens.ts`                       | One colour source; no large UI kits |
| Zod 4                                          | Env and API validation              |
| Vitest + axe + fast-check                      | Unit, a11y, property tests          |

## Quick start

```bash
npm ci
cp .env.example .env.local
npm run dev
```

No API keys required for Phase 1. Later phases keep a rule-based planner when LLM keys are absent.

## Evaluation criteria map

### Code quality

Strict TS, no `any`, ESLint complexity/size limits, layered `domain` / `lib` / `app`, TSDoc, ADRs in `docs/adr/`.

**Verify:** `npm run lint && npm run typecheck`

### Security

Nonce CSP (`src/proxy.ts`), static headers, Zod env, rate limiter, redacting logger, Dependabot, CodeQL, `SECURITY.md`.

**Verify:** `npm audit --omit=dev --audit-level=high` and `tests/lib/csp.test.ts`

### Efficiency

No web fonts, SVG icons only, repo soft budget 5 MB, air-quality caching in Phase 3.

**Verify:** `npm run check:size`

### Testing

Vitest coverage thresholds, domain + contrast + a11y + health API tests.

**Verify:** `npm run test:coverage`

### Accessibility

`jsx-a11y` strict, axe on home shell, skip link, focus rings, dark + `forced-colors` CSS hooks, CVD-aware AQI shapes.

**Verify:** `npm run test -- tests/components/HomeHero.test.tsx`

### Problem-statement alignment

Traceability table above; educational-estimate disclaimer in footer.

## Testing summary

Run `npm run test:coverage` for the current line/branch numbers (reported at each phase exit).

## Security and privacy

See `SECURITY.md`. Location and household health fields are browser-only by design.

## Accessibility statement

Target WCAG 2.2 AA. Phase 1 establishes landmarks, one `h1`, skip link, focus styles, and axe coverage on the home shell.

## Performance and size

Tracked repo must stay under 5 MB (`check:size`). First-load JS budget (&lt; 150 KB) enforced in Phase 6.

## Project structure — where to look first

| Look here              | For                 |
| ---------------------- | ------------------- |
| `src/domain/aqi.ts`    | National AQI bands  |
| `src/design/tokens.ts` | Colours and type    |
| `src/proxy.ts`         | CSP nonce           |
| `src/app/api/health`   | Health probe        |
| `docs/ARCHITECTURE.md` | Diagrams and layers |
| `docs/ASSUMPTIONS.md`  | Cited constants     |

## Limitations

Phase 1 uses a **demo AQI** on the home page. Live data, Impact Engine maths, onboarding and chat arrive in later phases.

## Contributing and licence

See `CONTRIBUTING.md`. MIT — `LICENSE`.
