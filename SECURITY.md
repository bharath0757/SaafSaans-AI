# Security Policy

## Supported versions

| Version              | Supported |
| -------------------- | --------- |
| `main` (pre-1.0)     | Yes       |
| `v1.x` (when tagged) | Yes       |

## Reporting a vulnerability

Email the maintainer via the GitHub profile on this repository, or open a **private** security advisory on GitHub. Do not file a public issue for exploitable vulnerabilities.

Please include:

- Affected URL or file path
- Steps to reproduce
- Impact assessment (data exposure, XSS, SSRF, etc.)

We aim to acknowledge within 7 days.

## Security model (Phase 1)

- **No accounts.** Household profiles (Phase 4+) stay in the browser.
- **Secrets** only in server environment variables; redacted from logs.
- **CSP** with per-request nonce (`src/proxy.ts`) plus static headers (`config/security-headers.mjs`).
- **Zod** validation on `/api/health` responses and env parsing.
- **Rate limiting** on API routes with a bounded in-memory map.
- **`npm audit --omit=dev --audit-level=high`** must report 0 high/critical findings in CI.

Phase 3 adds outbound host allowlists, LLM output schemas, and prompt-injection tests.
