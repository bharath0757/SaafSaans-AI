# Contributing

## Branch policy

Work only on `main` for this project phase plan. Prefer small Conventional Commits:

- `feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`, `ci:`

## Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

## Before every commit

```bash
npm run verify
npm run build
npm audit --omit=dev --audit-level=high
```

Husky + lint-staged format and lint staged files on commit.

## Code rules

- No `any`. Public functions get TSDoc.
- Domain code stays pure (no fetch, no `process.env`).
- Never invent numeric impact claims — use the Impact Engine (Phase 2+).
- Never rely on colour alone; pair with text and an icon/shape.
- Keep the tracked repo under 5 MB (`npm run check:size`).

## Accessibility

`jsx-a11y` strict is enforced. Component tests run axe. Aim for WCAG 2.2 AA.
