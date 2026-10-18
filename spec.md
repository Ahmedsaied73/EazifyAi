# EazifyAi — spec.md (source of truth for the AI coder)

> Read this file first, every session. If code and spec disagree, stop and ask. Product decisions live in the PRD doc; this file is the technical translation. Rules for writing code: `CODE_STANDARDS.md`. Current work: `PHASE_1.md`.

## 1. Product in one paragraph
EazifyAi is a bilingual (Arabic-first, Egyptian dialect; English second) company site for small-business owners. The landing page is a chat box. A Gemini-powered agent listens to the visitor's problem, asks only what is needed, extracts a structured request, and stores it. The founder (the only admin) is notified instantly on Telegram and email, studies the request, replies on WhatsApp. Visitors track their request through a private link or an optional account.

## 2. Non-negotiables (decided by the founder)
- Two separate repos: `eazifyai-web` (Next.js) and `eazifyai-api` (Node + Express). No monorepo, no shared package.
- Stack: Next.js, Node/Express, Prisma + PostgreSQL on Supabase, LangChain/LangGraph + Gemini. TypeScript strict everywhere.
- The UI and animations are ported **literally** from the Higgsfield site: every page (including `/brand`), every component, every animation, every interaction, exactly as is. Nothing is redesigned, simplified or dropped. Only the architecture underneath changes (section 6), and that must not change a single rendered pixel or motion.
- Languages: `/ar` (default) and `/en`, separate URLs. Dark default, light option.
- Only mandatory visitor contact: WhatsApp number.
- Gemini: free tier for development with fake conversations only; paid tier before any real visitor.
- Cost target: as low as possible. No Redis, no queue server, no extra paid services in the first launch.
- Auth: **Supabase Auth** (free, no extra service; founder reconfirmed after considering Clerk). Admin uses TOTP (authenticator app) via Supabase MFA, allowed from anywhere; admin role in `app_metadata` (never `user_metadata`), set only by us.
- Chat transport: **socket.io** (founder's decision, replaces SSE).
- Visitor identity signal: **FingerprintJS** (founder's decision), used only as an anti-abuse signal under the rules in section 3.1.
- Sensitive data typed by a visitor (card, password, their clients' data): agent stops them politely; that part is never stored or sent to the model.
- Summary + phone are kept permanently; raw chat text is deleted after a retention period (proposed 6 months, unconfirmed); deletion requests are honored.
- Agent never promises price or delivery time. Unsuitable ideas are stored normally; the human decides.
- Call booking is out of the first launch. Voice input and chat resume are cut first if time runs short. Phase 7 hardening is never cut.
- Target: launch within one month of 2026-10-15.

## 3. Architecture

```
Browser ── Next.js (UI, SEO, i18n) ──HTTPS + WebSocket──▶ Express API + socket.io ──▶ Prisma ──▶ Supabase Postgres
                │                                          │  └──▶ Gemini via LangGraph (tokens streamed over socket)
        Supabase Auth (login, MFA) ◀── JWT ────────────────┘  └──▶ pg-boss jobs ─▶ Telegram + email
```

- Next.js renders UI only. No business logic, no DB access, no secrets beyond public keys.
- Express owns the database, the agent, notifications, and all authorization.
- Auth: Supabase Auth issues JWTs. The API verifies them against Supabase's JWKS with `jose`. No custom password handling anywhere (no bcrypt, no own JWT signing).
- Anonymous visitors get a Supabase anonymous session so every call carries a JWT. Registering later links the email to the same user. Visitors can also follow a request without an account through the private long `publicId` link.
- Chat: socket.io on the same Express server. The handshake carries the Supabase JWT and is verified before any event is accepted. Events are zod-validated like HTTP routes. Reply tokens stream over the socket; `clientMessageId` makes retries idempotent. One API instance at first (socket.io needs sticky sessions or an adapter to scale out); Next.js never hosts the socket server.
- Jobs: `pg-boss` on the same Postgres (outbox pattern). No Redis.

## 4. Contract between the repos
- API is the owner of the contract. Every route declares zod schemas (params, query, body, response). OpenAPI is generated from them: `npm run openapi` writes `openapi.json` (committed; CI fails if stale).
- Web generates types from it: `npm run api:types` → `src/lib/api/schema.d.ts` via `openapi-typescript`; calls go through `openapi-fetch`. No hand-written API types in web.
- Routes are versioned under `/v1`. Breaking change = expand/contract (add new, migrate web, remove old), never a silent edit.
- Web CI job `contract-check`: fetch the API's `openapi.json` at the pinned ref, regenerate types, fail if the diff is non-empty.
- Error shape (all routes): `{ "error": { "code": "string_machine_code", "message": "safe for visitor", "requestId": "uuid" } }`. Never leak stack traces or DB errors.

## 5. Repo structures

### eazifyai-api
```
src/
  server.ts                 # boot, graceful shutdown (only file that listens)
  app.ts                    # builds the express app (testable without listening)
  config/env.ts             # zod-validated env; app refuses to start if invalid
  core/                     # logger, errors, http helpers, request-id, openapi registry
  middleware/               # auth, requireRole, requireAal2, rateLimit, errorHandler, notFound
  modules/<feature>/        # auth, conversations, agent, requests, notifications,
    <feature>.routes.ts     #   onboarding, admin, analytics (later: bookings)
    <feature>.controller.ts #   parse → call service → shape response
    <feature>.service.ts    #   business rules; no express types
    <feature>.repository.ts #   the ONLY place that calls Prisma; every query scoped by owner
    <feature>.schemas.ts    #   zod: single source for validation + types + OpenAPI
    <feature>.test.ts
  agent/                    # graph.ts, nodes/, prompts/ (ar/en), guardrails.ts, extract.ts, evals/
  jobs/                     # pg-boss workers: notify, digest, retention
  db/                       # prisma client singleton
prisma/schema.prisma, prisma/migrations/
scripts/                    # openapi, seed-admin, backup
tests/                      # integration + authorization matrix + helpers (local JWKS)
```

### eazifyai-web
```
src/
  app/[locale]/             # (marketing)/ page, about, privacy, copyright · chat · track/[publicId]
                            # (auth)/ login, register · profile · (admin)/ admin/*
  app/api/                  # none (no business logic in Next)
  components/               # ui/ (Button, Card, Chip…), brand/ (Logo), layout/, motion/
  features/                 # chat, journey, onboarding, admin, auth — one folder per feature
  config/
    brand.ts                # section 6.1  (replaces site/founder.ts, contact.ts, proof.ts, seo.ts)
    site.ts                 # routes, nav, feature flags
  i18n/                     # request config, messages/ar.json, messages/en.json, useT wrapper
  styles/
    tokens.css              # section 6.2 — ONLY file allowed to contain raw colors/sizes
    base.css, components/*.css
  lib/api/                  # generated schema.d.ts + client.ts (openapi-fetch)
  lib/supabase/             # browser + server clients (public anon key only)
design-reference/           # read-only copy of the Higgsfield source. Never imported by the app.
tests/e2e/ tests/visual/    # Playwright
```

## 6. Design port: look identical, architecture controllable

Facts about the Higgsfield source (checked): it is React 19 on TanStack Start. The custom site lives in `src/site/*`, `src/routes/*`, `src/admin/*`, and ~650 lines of `src/styles.css`. It uses plain CSS classes prefixed `ez-` and CSS variables (`--bg --g1 --g2 --g3 --mu --tx --box --ring --sh --sky --ok --glow`, dark and light blocks). It imports no UI or animation library; only `react`, `@tanstack/react-router`, `@tanstack/react-query`. About 108 raw colors remain hardcoded in the CSS (e.g. the user-bubble gradient, tag backgrounds). Accounts and chats are mocked in `localStorage`. Config already exists in `founder.ts`, `contact.ts`, `proof.ts`, `seo.ts`; all strings are in `i18n.ts` (`ar`/`en` objects).

### 6.1 Brand and text variables (`src/config/brand.ts`)
One typed object, the only place these values exist:
```ts
export const brand = {
  name: 'EazifyAi', founderName: 'Ahmed Saied', founderRole: '', tagline: { ar: '', en: '' },
  whatsapp: { number: '201023498242', display: '01023498242' },
  email: '', siteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
  social: {}, proof: { works: [], quotes: [] },   // real proof only; empty = honest "we're just starting" card
} as const;
```
- Message files use ICU placeholders: `"about.hello": "أنا {founder}، مؤسس {brand}"`. A `useT()` wrapper injects `brand`, `founder`, `whatsapp`, `email` automatically so components never pass them. Changing the founder name = one edit in `brand.ts`.
- No visible text is hardcoded in TSX. Every string is a key in `messages/ar.json` and `en.json`; a CI check fails if the two files have different keys.
- SEO helper reads `brand.siteUrl`; no URL is typed anywhere else.

### 6.2 Design tokens (`src/styles/tokens.css`)
Three layers:
1. **Primitives** (raw values): palette, radii, spacing, type scale, shadows, durations.
2. **Semantic** (what components use): `--color-bg`, `--color-surface-1/2/3`, `--color-text`, `--color-text-muted`, `--color-accent`, `--color-success`, `--ring`, `--shadow-card`, `--glow`, `--radius-card/pill/box`.
3. **Component** (only when needed): `--chat-user-bubble-bg`, `--brief-border`, `--tag-bg`.

Rules:
- Changing the accent in one place changes the whole site: derived tones use `color-mix()` / relative colors from `--color-accent` (soft backgrounds, borders, gradients, glow). The current `--sky` becomes `--color-accent`; the hardcoded `#2563eb/#4f46e5/#7c6cf0/rgba(...)` values are lifted into tokens.
- Dark/light are two blocks that redefine **semantic** tokens only: `[data-theme="dark"]`, `[data-theme="light"]`.
- Raw hex/rgb/hsl and raw px for radius/shadow are forbidden outside `tokens.css` (stylelint rule, fails CI).
- Motion durations are tokens; `prefers-reduced-motion` zeroes them.
- RTL: use logical properties (`padding-inline-start`, `inset-inline`, `text-align: start`). No `left/right` for layout.

### 6.3 How "identical" is proven (UI and animations included)
1. Before any code: Playwright captures baseline screenshots from the live Higgsfield site: every route × {ar,en} × {dark,light} × {390, 768, 1280 px}.
2. Step A: copy components, CSS and motion verbatim into Next. Wire routing/i18n only.
3. Step B: tokenize and extract strings/brand with **zero visual change**.
4. After every step the visual suite runs against the baseline; allowed diff ≤ 0.1% pixels per page (fonts/anti-aliasing tolerance). Any larger diff blocks the step.
5. Improvements to the design happen only after launch, on their own branch.

Everything is ported, including the `/brand` page, all motion (scroll-driven agent graphic, tilt effect, logo motion, progress bar, avatar ring, post-chat journey) and every state of every page. The only code replaced later is the `localStorage` mock auth (`store.ts`) and the mock admin data, swapped for Supabase Auth and the real API in their phases; until then Phase 1 keeps them behind one `mockApi` module so the pages behave exactly as today. Animation parity is checked with Playwright recordings/frame screenshots at fixed timestamps and scroll positions, not only static screenshots.

## 7. Data model (Prisma, built incrementally; every table gets RLS enabled with no policies)
- `Profile` (id = Supabase user id, name, job, isAnonymous, createdAt)
- `Conversation` (id, userId, locale, status, startedAt, completedAt, rawDeleteAt)
- `Message` (id, conversationId, role, text, clientMessageId unique per conversation, createdAt)
- `Request` (id, publicId 128-bit random unique, code `EZ-XXXXXX` unique, userId?, conversationId, status, summary Json, internalAnalysis Json, completeness Json, score?, whatsapp, email?, urgency, budgetHint?, bestTime?, extraDetails?, createdAt)
- `RequestEvent` (id, requestId, type, note, createdAt) — append-only timeline
- `OnboardingAnswer` (id, userId?, anonId, key, value, createdAt) — no PII
- `OutboxEvent` handled by pg-boss tables (no custom table needed)
- `AuditLog` (id, actorId, action, target, at) — admin actions
- Later: `Booking` with exclusion constraint on `tstzrange`.

DB rules: app connects with a restricted role (no DDL); migrations use a separate role and `directUrl`; prod migrations run from CI only (`prisma migrate deploy`); every change is additive/expand-contract. IDs shown to users are `publicId`/`code`, never sequential.

## 8. API surface (versioned `/v1`)
Phase 1: `GET /health`, `GET /v1/me` (Supabase JWT check), `GET /v1/openapi.json` (non-prod only). Chat uses socket.io events (`message:send`, `message:token`, `message:done`, `error`), documented in `docs/socket-events.md` with zod schemas; OpenAPI covers HTTP only.
Later phases: `POST /v1/onboarding`, conversations CRUD + conversation messages over socket.io, `POST /v1/requests/:id/details`, `GET /v1/requests/:publicId` (private link), `GET /v1/me/requests`, `POST /v1/me/export`, `DELETE /v1/me`, admin: `GET /v1/admin/requests`, `GET /v1/admin/requests/:id`, `PATCH …/status`, `GET /v1/admin/analytics`.
Every route: zod `.strict()` input, auth level declared (`public | user | admin+aal2`), rate-limit class declared, owner-scoped repository call.

## 9. The agent
- LangGraph state machine: `intake → clarify → extract → confirm → close`. The model talks and extracts; **code** creates the `Request`, writes the outbox event and sends notifications after zod validation. The agent has no tools that read data.
- Done when the request is **complete**: business type, problem + how it is done today, volume/frequency, current tools, desired outcome, urgency, WhatsApp. Unknown answers are stored as `"unknown"`; never nag. Hard cap on questions as a safety ceiling (value set after the first real conversations).
- Also produces `internalAnalysis` (problem type, possible solution direction, missing info, notes) visible to admin only.
- Tone: Egyptian, professional, short. Identifies itself as an AI assistant always. No price/time promises (prompt + output filter).
- Sensitive-data guard runs **before** the model call and before persistence: detect card numbers/password-like strings; stop politely; strip that text.
- Limits: message length, messages per conversation, `max_tokens`, per-IP/user rate limits, global daily AI budget with circuit breaker. On model failure or budget exhaustion the chat switches to a static form (problem + WhatsApp). **Lead capture never depends on the LLM.**
- Evals: 30+ Egyptian-Arabic conversations (some adversarial) run on every change to prompts/model; result must not regress.
- Tracing: no third-party trace service by default (conversation text would leave our control). If LangSmith/Langfuse is enabled it must be listed on the Privacy page.

## 10. Security (summary; details in CODE_STANDARDS)
Authorization on every route and every socket event, owner-scoped queries, authorization test matrix in CI, RLS deny-all, restricted DB role, zod `.strict()`, body limit 100kb, helmet, CORS single origin, CSP with nonce on web, `trust proxy` configured, layered rate limits (Cloudflare → app → AI budget), Turnstile on public submit, no PII in logs/Sentry, secrets only in env, `gitleaks` in CI, lockfile installs, admin MFA (`aal2` check), audit log, Telegram alert on suspicious activity.

## 11. Performance
Mobile 4G targets: LCP < 2.5 s, INP < 200 ms, CLS < 0.1; JS budget enforced in CI (landing ≤ ~150 KB gzip, to be calibrated after port); animations use `transform`/`opacity` only; Arabic font subsetting with minimal weights via `next/font`; Supabase client, socket.io and fingerprinting loaded only on routes that need them (chat, auth, profile, admin), never on the landing page; server timeouts everywhere (DB ~5 s, LLM ~30 s); concurrency cap on the agent; API region near Egypt (EU); no cold starts in production.

## 12. Environments and secrets
`dev` (local), `staging`, `prod`: separate Supabase projects and keys. Web may use only `NEXT_PUBLIC_*` public values (Supabase URL + anon key, site URL, API URL, PostHog key, Turnstile site key). Never expose the Supabase `service_role`. Each repo ships `.env.example` listing every variable; env is zod-validated at boot.

## 13. Testing
Unit (Vitest), API integration (Supertest + Postgres service container; tests mint JWTs with a local JWKS), authorization matrix (user A vs user B on every resource → 404), contract check, Playwright e2e for the main path (visitor → chat → request → admin sees it), visual parity suite (section 6.3), agent evals, k6 load test before launch.

## 14. Definition of done (any change)
Lint + typecheck + tests green; contract regenerated if API changed; new strings in both languages; no raw colors outside tokens; visual suite green; migration is additive; change summary written for the founder.

### 3.1 FingerprintJS rules (founder's decision, with guardrails)
- The open-source library gives a probabilistic identifier, not a real identity: it can collide across similar devices and changes with browser updates. It is **never** used for authentication or authorization, and never to decide who owns data.
- Allowed use: an anti-abuse signal (rate limiting, spam/bot scoring, linking repeat anonymous visits). The API stores only a salted hash, never raw components.
- It loads only on routes that need it (chat entry, request submit), lazily.
- It is personal-data processing: the Privacy page must say it is used, why, and for how long; the Egyptian personal data protection law (151/2020) should be checked with a lawyer. Consent wording is decided with the lawyer; the plan assumes a short notice in the chat entry.
- Session replay and fingerprint data are never combined.

## 15. Open decisions (need the founder)
1. API host: **Render Free for development/staging (decided).** Known limits: sleeps after ~15 min idle (~60 s cold start), so the chat's first load and pg-boss jobs stall while asleep; keep-alive pings are a stopgap only; free Render Postgres is not used (we use Supabase). Before real visitors: move to an always-on host (small paid Render instance or a ~$5 VPS). Check Render's terms on commercial use of the free tier.
2. Domain name (blocks auth redirect URLs, email sender, Cloudflare setup).
3. Telegram bot token + notification email provider.
4. Raw-chat retention (proposed 6 months).
5. Front-end host before launch (Vercel Pro vs Cloudflare); Hobby is for testing only.
6. Consent wording for fingerprinting (with a lawyer).
