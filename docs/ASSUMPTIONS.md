# Assumptions and sources

All figures shown in SaafSaans are **educational estimates**, not medical advice.

## Phase 1 constants

| Constant                | Value                                                                                             | Source / note                                      | Range / uncertainty                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------- |
| National AQI band edges | 0–50 Good, 51–100 Satisfactory, 101–200 Moderate, 201–300 Poor, 301–400 Very Poor, 401–500 Severe | CPCB National Air Quality Index categories (India) | Exact pollutant sub-index breakpoints land in Phase 2 |
| Demo AQI on home shell  | 312                                                                                               | Placeholder for UI layout only                     | Replaced by live Open-Meteo data in Phase 3           |
| API rate limit          | 60 requests / minute / client                                                                     | Engineering choice for single-instance protection  | Tunable; not a published standard                     |
| Repo size soft budget   | 5 MB tracked                                                                                      | Problem statement requires &lt; 10 MB              | Soft fail at 5 MB via `npm run check:size`            |

## Colour contrast

Body ink `#11222C` on paper `#FFFFFF` targets WCAG AAA (≥ 7:1). AQI band colours step in relative luminance so adjacent bands remain distinguishable under colour-vision deficiency; each band also has a unique shape icon and text label.

## Forthcoming (Phase 2+)

Penetration factors, air-exchange rates, CADR, inhalation rates, mask efficiencies, transport PM2.5 and CO2e factors will be cited here with primary sources before any UI displays them.
