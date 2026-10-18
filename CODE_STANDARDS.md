# CODE_STANDARDS.md — rules for every line of code

Copy this file into both repos as `CODE_STANDARDS.md` and reference it from `AGENTS.md`/`CLAUDE.md` ("read spec.md and CODE_STANDARDS.md before coding"). Rules marked **[CI]** are enforced automatically; anything not enforced by a tool will be forgotten, so prefer making rules machine-checkable.

## 1. Both repos
1. TypeScript `strict`, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`. No `any`, no `@ts-ignore` (use `@ts-expect-error` with a reason). **[CI]**
2. ESLint (flat config) + `typescript-eslint` strict + Prettier. Warnings fail CI. **[CI]**
3. One feature = one folder. Files stay small (aim < 250 lines); a function does one thing.
4. Names: files `kebab-case`, types/components `PascalCase`, functions/vars `camelCase`, constants `SCREAMING_SNAKE` only for true constants, env vars `SCREAMING_SNAKE`. Booleans read as questions (`isOpen`, `hasAccess`).
5. Comments explain *why*, never *what*. No dead code, no commented-out code, no TODO without an issue.
6. Git: trunk-based, short-lived branches, one PR per slice. Conventional commits (`feat:`, `fix:`, `chore:`). `main` is always deployable and protected (CI required). Husky + lint-staged run lint/format on commit. **[CI]**
7. Dependencies: add one only if it removes real work; pin exact versions, commit the lockfile, install with `npm ci`. `knip` fails CI on unused deps/exports. Renovate/Dependabot weekly with a 7-day release-age delay. **[CI]**
8. Secrets never in code. `gitleaks` in pre-commit and CI. `.env.example` is the only env file committed. **[CI]**
9. Node version pinned in `.nvmrc` and `engines`; CI uses the same.
10. Every PR ends with a short change summary (what, why, how tested, risks) — this is what the founder reviews before release.

## 2. API repo (Express)
**Layering (enforced with ESLint `no-restricted-imports` per folder) [CI]**
- `routes` → `controller` → `service` → `repository` → `db`. A layer may only import the one below it.
- Only `repository` files import Prisma. Only `controller`/`middleware` import Express types. `service` is plain TypeScript and unit-testable.
- Every repository method takes the owner (`userId`) or is explicitly named `…AsAdmin`. No `findUnique({ id })` on user data without owner scope. This is how IDOR is prevented at the root.

**Validation & contract**
- Every input (params, query, body, headers that matter) passes zod `.strict()` before the controller runs; every response is shaped by a zod schema. Types are inferred from schemas, never written twice.
- Never pass `req.body` to Prisma. Never use raw SQL (`$queryRawUnsafe` is banned; tagged `$queryRaw` only with justification).
- Routes live under `/v1`; OpenAPI is generated from the same schemas. **[CI]**

**Errors & logging**
- Throw typed `AppError(code, httpStatus, safeMessage)`. One error middleware maps everything; unknown errors become `500 internal_error` with a `requestId`. Express 5 handles async errors; no `try/catch` boilerplate in controllers.
- `pino` JSON logs, `pino-http` with `requestId`, `redact` for phone, email, auth headers, message text. Log events, not payloads. Never `console.log`. **[CI: no-console]**
- Sentry: scrub PII in `beforeSend`; no request bodies.

**Security defaults**
- `helmet`, CORS with one explicit origin, `express.json({ limit: '100kb' })`, `trust proxy` set to the real number of proxies, compression must not interfere with websocket upgrades.
- Every route declares its access level (`public | user | admin`) and rate-limit class; a startup test fails if a route has none.
- Admin routes additionally require the admin role (`app_metadata`) and `aal2` (MFA) and write an `AuditLog` row.
- Timeouts: DB ~5 s, LLM ~30 s, outbound HTTP ~10 s. Retries use jittered backoff and only for idempotent calls.
- socket.io: verify the auth token in the handshake before accepting any event; validate every event payload with zod; per-socket rate limits; abort the model call on disconnect; `clientMessageId` makes retries idempotent; heartbeat/ping configured; CORS origin restricted to the web origin.
- FingerprintJS values are never trusted for auth; store only a salted hash.
- Graceful shutdown on SIGTERM (stop accepting, drain, close Prisma and pg-boss).

**Database**
- Schema changes only through Prisma migrations, additive first (expand → migrate code → contract). Never `db push` on shared envs. Prod runs `prisma migrate deploy` from CI only.
- Index every foreign key and every `where/orderBy` used by a list endpoint. Cursor pagination, never offset on growing tables. `select` only the needed fields.
- All tables: RLS enabled, no policies. App uses a restricted role.

**Agent code**
- Prompts live in `agent/prompts/` as versioned files, not inline strings. Changing a prompt or model requires the eval suite to pass. **[CI]**
- The model never triggers side effects; code does, after validation.

**Tests**
- Unit tests for services; integration tests for routes against a real Postgres; the authorization matrix (A vs B on every resource) is mandatory for every new resource. **[CI]**
- Coverage is a signal, not a goal; branches that handle auth and money-like limits (rate/budget) must be covered.

## 3. Web repo (Next.js)
**Structure**
- Server Components by default; `"use client"` only for interactivity. Data fetching in server code where possible.
- No business logic and no DB access in Next. All data comes from the API through the generated typed client; hand-written API types are banned. **[CI: contract-check]**
- One folder per feature in `features/`; shared UI in `components/ui`; no cross-feature imports except through `components/` or `lib/`.

**Text, brand, tokens (the "control everything" rules)**
- No visible text in TSX. Every string is a key in `messages/ar.json` and `en.json`; both files must have identical keys. **[CI]**
- Brand/founder/contact values come only from `config/brand.ts`, injected into messages as `{brand}`, `{founder}`, `{whatsapp}`, `{email}`. No literal duplicates anywhere.
- No raw color/shadow/radius values outside `styles/tokens.css`. Components use semantic tokens (`var(--color-*)`). Stylelint bans hex/rgb/hsl and raw px radius/shadow elsewhere. **[CI]**
- Dark/light differ only by redefining semantic tokens under `[data-theme]`.
- Logical CSS properties only (`inline-start/end`, `margin-inline`, `text-align: start`); direction comes from `dir` set per locale.

**UX quality**
- Accessible by default: labels, focus states, keyboard path for the whole main flow, contrast AA, `aria-live` for streamed chat replies, `prefers-reduced-motion` respected (tokens set durations to 0).
- Motion: only `transform` and `opacity`; no layout-thrashing animation; heavy motion code is lazy-loaded.
- Forms: react-hook-form + the same zod schemas semantics as the API; never trust client validation.
- Rendering model output: plain text/escaped markdown only; `dangerouslySetInnerHTML` is banned **[CI]**; links allowed only `https:`, `tel:`, `wa.me`.

**Performance**
- `next/font` with Arabic subset and the fewest weights; images via `next/image` or SVG; The Supabase client, socket.io and fingerprinting code are loaded only on routes that need them (chat, auth, profile, admin), never on the landing page.
- JS budget per route checked in CI (`size-limit`); Lighthouse CI on the landing page (mobile) with thresholds from `spec.md`.

**Security**
- Strict CSP with per-request nonce (no `unsafe-inline`/`unsafe-eval`), `frame-ancestors 'none'`, HSTS, Referrer-Policy, Permissions-Policy.
- Only `NEXT_PUBLIC_*` public values in the browser; The Supabase `service_role` never exists in this repo. Redirect targets (`?next=`) must be same-origin paths.
- Tokens stay in Supabase's storage; XSS defense (CSP + no raw HTML) is the main protection.

**Tests**
- Playwright e2e for the main path (visitor → chat → request); visual parity suite against the Higgsfield baseline until launch, then against the previous release; unit tests for pure logic only.

## 4. Review checklist (what the founder checks before any release)
1. CI is green (lint, types, tests, contract, visual, secrets scan).
2. Authorization matrix passes for anything touching user data.
3. Manual run of the main path on a real phone in Arabic.
4. Change summary read: nothing unexpected, no new dependency without a reason.
5. For releases touching the database: backup taken, migration is additive.

## 5. Template for `AGENTS.md` / `CLAUDE.md` in each repo
```
Read spec.md and CODE_STANDARDS.md before writing code. Work only on the phase in PHASE_N.md.
Never add a dependency without stating why and checking LIBRARIES.md. Never invent product decisions: if the spec is silent, ask.
Never put raw colors, visible text, or brand values in components. Never bypass the repository layer.
Run lint, typecheck and tests before saying a task is done. End each task with a change summary.
```
