# Design notes

Phase 4 will complete the research write-up from the master-prompt reference list. Phase 1 locks the non-negotiable visual system:

## Decisions already in code

1. **Answer first** — `HomeHero` leads with a one-sentence action; AQI and band sit beneath.
2. **Signature element** — `AqiLadder` scale bar with position marker; band label + geometric icon (never colour alone).
3. **Calm palette** — fog / paper / ink / teal / saffron from `src/design/tokens.ts`; dark theme via `prefers-color-scheme`; `forced-colors` overrides in `globals.css`.
4. **Two radii only** — 4 px controls, 12 px surfaces.
5. **Focus** — 3 px teal ring with 3 px offset.
6. **Type** — Georgia display stack + system sans with Nirmala UI / Noto Devanagari / Telugu fallbacks (no font files).
7. **Motion** — marker transition respects `prefers-reduced-motion`.

## Research backlog (Phase 4)

Capture patterns (not pixels) from: Cansaas / Airly dashboards, AQI Me, Breezy Weather, Forecast Bar, Google Weather redesign, SCAQMD accessible scale, Smashing Magazine colour-blindness guidance, OPENAIR UI guide.
