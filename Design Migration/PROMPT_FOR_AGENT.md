# PROMPT_FOR_AGENT.md — give this whole file to your AI coding agent

Copy everything below the line into the agent. Put these files in the web repo first (e.g. in `docs/`): `PROMPT_FOR_AGENT.md`, `DESIGN_PORT.md`, `ANIMATIONS.md`, `ANIMATIONS_INVENTORY.md`, `spec.md`, `CODE_STANDARDS.md`, `scripts/audit-motion.mjs`. Download `eazifyai-design-reference.zip` in a browser and unzip it into the web repo root so you get `design-reference/` (with `MANIFEST.sha256` and `app/` inside).

---

## Your role

You are the implementation agent for the EazifyAi website front end (`eazifyai-web`, **Next.js 16, App Router, plain CSS, NOT Tailwind**). Your job is to port an existing, finished design into this repo **literally**. The design was built as a React + plain-CSS app (TanStack Start, React 19). It is the product's visual and motion identity. It must look and move **identically** in the port: same pixels, same fonts, same timings, same easing, same RTL/LTR behavior, same reduced-motion behavior.

You are porting, not redesigning. Do not "improve", modernize, simplify, rename, merge, or reorganize anything in step A.

## Read first, in this order (all of it, not a summary)

1. `docs/DESIGN_PORT.md` — the master guide: what to copy, what to skip, target structure, fonts, runtime contract, tokens, route mapping, every component's spec, backend seams, step-by-step procedure, proof, and the "nothing left behind" checklist.
2. `docs/ANIMATIONS.md` — every animation, transition, JS motion driver and all 39 keyframes, plus the frame-capture verification table.
3. `docs/ANIMATIONS_INVENTORY.md` — the machine-generated list of all 228 motion rows. This is the contract the audit script enforces.
4. `docs/spec.md` and `docs/CODE_STANDARDS.md` — product spec and code rules for the real back end and later steps.

## The source of truth

`design-reference/` (unzipped from `eazifyai-design-reference.zip`). It contains 580 files listed in `design-reference/MANIFEST.sha256`.

Before anything else run, from `design-reference/`:

```bash
sha256sum -c MANIFEST.sha256 | grep -v ': OK$' || echo "all 580 files verified"
```

If any file fails or is missing, stop and report it. Do not guess.

Facts you must keep in mind:

- The design is plain React + plain CSS. Classes are `ez-*`, `lg-*` and `rv`. The site-layer CSS is `design-reference/app/src/styles.css` **lines 115 to the end (636 lines)**; lines 1-114 are template/Tailwind scaffolding that is **not** ported.
- 39 `@keyframes`, 13 `prefers-reduced-motion` blocks, 228 motion rows. There are no animation libraries.
- Tokens are CSS variables: `--bg --g1 --g2 --g3 --mu --tx --box --ring --sh --sky --ok --glow`. Dark is the default; light is `[data-theme="light"]`; RTL is `[dir]` with logical properties only.
- Fonts: **Geist** (300/400/500/600) and **IBM Plex Sans Arabic** (400/500/600), loaded through the Google Fonts link exactly as in the original. **Do not load weight 700.** Keep the body font stack exactly.
- Pages: 13 routes (listed in DESIGN_PORT.md section 7). i18n has 40 top-level keys (`nav h sub ph chips send trust agent brief how ideas about aud cta ft hook chat onb contact auth prof hist jr nt demo ch qr faq fit fb ab lg fp pl cr foot priv nf lang themeLabel`).
- JS motion drivers (all five must exist, unchanged): `Prog` scroll bar, `useReveal`, the Demo timeline plus `--e` scroll ease, Logo pointer parallax and click burst, count-ups; plus the timers listed in ANIMATIONS.md section 1.
- CSS variables written from JS: `--d --i --a --p --f --e --mx --my`.
- localStorage keys: `ez-lang ez-theme ez-onb ez-users ez-session ez-chats-<id> ez-draft ez-reqs ez-notes ez-sent ez-admin ez-admin-s ez-adm-ov`. Window events: `ez-prog ez-notes ez-chats ez-reqs ez-onb`.
- The only back-end seam in the design is `submitLead` (4 call sites: Chat, Req.useFollow, Feedback, About contact form). In step A replace it with a mock (`lib/mock-api.ts`) that behaves the same (same delay, same success/failure shape).

## The procedure (do it in this order; do not skip ahead)

### Step A — literal copy (no visual change at all), **foundation first, then ONE PAGE AT A TIME**

Do NOT port everything in one go. Work in two phases: A0 (shared foundation, all at once) and A1 (pages, strictly one by one, each with its full components). A page is not started until the previous page is green and committed.

**A0 — Foundation (all at once, nothing page-specific is skipped here):**

1. Create the Next 16 structure from DESIGN_PORT.md section 2 (`app/[locale]/...`, `site/`, `admin/`, `lib/`, `scripts/`, `tests/visual/`).
2. `sed -n '115,$p' design-reference/app/src/styles.css > app/globals.css`. Import it once in the root layout. Do not edit it. **The whole stylesheet is copied now, for every page** (it is one file; splitting it risks losing a rule). So all 39 keyframes and all 13 reduced-motion blocks exist from the start and the audit script must print `OK` from the very first commit.
3. Layout shell, fonts (Google Fonts links exactly as original, no weight 700), `html` attributes, theme/lang runtime (`ez-lang`, `ez-theme`), the whole i18n dictionary (all 40 keys, both languages), `store.ts`, `lib/mock-api.ts` (the `submitLead` mock), the motion helpers (`Prog`, `useReveal`), `Site.tsx` (header, footer, bell, avatar, theme/lang switches) and `Logo.tsx` (all variants), plus all assets in `public/`.
4. Build the Playwright harness: original app running locally from `design-reference/app`, port running, a script that screenshots a route in both and diffs it (dark/light x ar/en x 1440/390), and a frame-capture helper with a fake clock.
5. Gate A0: audit `OK`, counts right (39 / 13 / 636 lines), fonts correct in the Network panel, an empty page with only `<Site>` matches the original's header/footer pixel for pixel in all 8 combinations. Commit: `A0 foundation`.

**A1 — Pages, one at a time, in THIS order** (simplest first so the foundation is proven before the big pages):

| # | Page / route | Components it brings with it |
|---|---|---|
| 1 | `/privacy` | `Legal.tsx` (sticky TOC + scroll spy) |
| 2 | `/copyright` | same `Legal.tsx`, second dictionary key |
| 3 | `/about` | about sections, animated check/cross icons, founder block, contact form (`submitLead` call site 4) |
| 4 | `/` (home) | hero with rich Logo, `Demo.tsx` (timeline + 3D tilt), onboarding card, home sections, floating CTA, `Proof.tsx` if mounted |
| 5 | `/chat` | `Chat.tsx`, `Journey.tsx`, `Feedback.tsx`, `History.tsx`, `Req.tsx` (call sites 1-3) |
| 6 | `/login` | `Login.tsx` orbit visual |
| 7 | `/register` | `Auth.tsx` steps, burst |
| 8 | `/profile` | counter, tags, requests list |
| 9 | `/track` | request tracking, timeline |
| 10 | `/admin` | whole admin (gate, Inbox, Ideas, Calendar, Analytics) |
| 11 | `/brand`, not-found, error, `sitemap.xml`, `robots.txt` | brand lockups, generated files |

**For each page, do exactly this loop:**

1. Copy that page's files verbatim (every component it uses, complete, not a first draft). Allowed changes only: routing (mapping in DESIGN_PORT.md section 6), imports, `"use client"` on hook files, `submitLead` replaced by the mock. Keep `<Site>` inside the page (never hoist it into the layout, so entrance animations replay exactly as in the original). `page.tsx` is a server component with `generateMetadata`; read `localStorage` only inside effects.
2. Tick that page's lines in the DESIGN_PORT.md section 12 checklist (every component, every state, every storage key, every event it uses).
3. Gate for the page: (a) audit script `OK`; (b) visual parity for this route in all 8 combinations (dark/light x ar/en x 1440/390) at <= 0.1% differing pixels, including every state the page has (for example chat after each answer, journey steps, admin tabs, profile with seeded data); (c) motion parity: the frame captures in ANIMATIONS.md section 20 for every feature on this page, plus the page with reduced motion; (d) `diff` of its files against `design-reference` shows only the allowed changes.
4. If a gate fails, fix the port toward the original and re-run. Do not move on and do not "come back later".
5. Write the page's result (what was copied, gate outputs, oddities found) to `PORT_LOG.md`, put oddities in `PORT_NOTES.md`, and make **one commit per page**: `A1.<n> <route>`.
6. Only then start the next page.

After the last page: run the full route x state x theme x language x viewport matrix once more, and the full-app checks below.

Cross-page rule: a shared component (for example `Logo`) is already complete from A0. If a later page needs a variant or helper that A0 did not include, add it verbatim from the original and re-run the earlier pages' visual checks, because shared files can break them.

### Step B — structure, no pixel change

Move colors/names into `config/brand.ts`, text into `messages/{ar,en}.json` with next-intl, tokens stay as CSS variables. After this step every visual and audit check must still pass unchanged.

### Step C — real back end

Typed API client to `eazifyai-api` (see spec.md), replacing the mock, plus CI. Visual and audit checks stay in CI.

## Checks you must run (after A0, after EVERY page, and at the end; report the results)

1. **Motion audit** (must print `OK: every motion rule of the original exists in the port`):
   ```bash
   sed -n '115,$p' design-reference/app/src/styles.css > /tmp/site-layer.css
   node scripts/audit-motion.mjs /tmp/site-layer.css app/globals.css
   ```
2. **Counts**: `grep -c "@keyframes" app/globals.css` = 39; `grep -c "prefers-reduced-motion:reduce" app/globals.css` = 13; globals.css is 636 lines in step A.
3. **File completeness**: every file listed under "port" in DESIGN_PORT.md section 1 exists in the port; `diff -r` the component files against `design-reference` and list every difference (only the allowed ones from step A may differ).
4. **Visual parity** (Playwright, `tests/visual/`): screenshot every route in dark/light and Arabic (RTL)/English (LTR), desktop 1440 and mobile 390, original vs port, **at most 0.1% differing pixels**. Original = run `design-reference/app` locally.
5. **Motion parity**: capture the frame times in ANIMATIONS.md section 20 for each feature, original vs port, same threshold, with a fake clock. Also run each page with `reducedMotion: "reduce"`.
6. **Behavior**: fonts load (Network panel: only Geist 300/400/500/600 and Plex Arabic 400/500/600); language and theme switch without a flash; demo timeline plays when 50% visible and Replay works; reveal-on-scroll works on every page; the progress bar tracks scroll; bell rings; counters count; admin tabs and charts animate.

## Libraries (strict, per step; `docs/LIBRARIES.md` has the full reviewed list)

**Step A (literal port) uses almost nothing extra.** Allowed dependencies: `next@16`, `react@19`, `react-dom@19`, `typescript`, `@types/*`, `eslint` + `eslint-config-next` + `typescript-eslint`, `prettier`, `@playwright/test`, `pixelmatch` + `pngjs` (image diff), `vitest` (unit tests for pure helpers like the store). Nothing else. The design is plain CSS and plain React; a library here would change pixels or timing.

**Step B (structure, no pixel change):** `next-intl` (routing `/ar` `/en`, messages JSON), `stylelint` + `stylelint-config-standard` (ban raw colors outside `styles/tokens.css`), `zod` (validate `config/brand.ts` and message keys), `knip` (find unused files/exports, only report).

**Step C (real back end), install only when the phase needs it:** `@supabase/supabase-js` + `@supabase/ssr` (auth), `openapi-typescript` + `openapi-fetch` (typed API client from the API's OpenAPI), `@tanstack/react-query` (server data), `react-hook-form` + `@hookform/resolvers` + `zod` (forms), `socket.io-client` (chat page only, lazy), `@fingerprintjs/fingerprintjs` (lazy, with the spec.md guardrails), `posthog-js`, `@sentry/nextjs` (scrub personal data), `recharts` only if the admin analytics later needs real charts (visual parity first).

**Never install:** Tailwind, `tailwind-merge`, `clsx`/`cva` before they are needed, Radix, shadcn, MUI, Chakra, `framer-motion`/`motion`, GSAP, Redux, styled-components/emotion, `lucide-react`, `next-themes` (theme is the `data-theme` code already in the design). If you believe a library is needed that is not listed, stop and ask with the reason; do not add it.

Rules for every dependency: exact versions pinned, installed with the package manager's lockfile committed, each addition justified in one line in `DEPENDENCIES.md` (what, why, which step), and the audit script plus visual checks re-run after adding it.

## Hard rules

- **Never** approximate an animation, easing, delay, duration, color, spacing or font. If something cannot be ported exactly, **stop and report** it instead of substituting.
- **Never** add Tailwind, CSS-in-JS, Framer Motion, GSAP, or any animation/UI library.
- **Never** convert logical properties (`inset-inline-*`, `margin-inline-*`, `text-align:start/end`) to left/right.
- **Never** delete CSS that looks unused (the FAQ, Fit, qp/qbar classes are intentionally kept; ANIMATIONS.md section 16 explains).
- **Never** change copy, i18n keys, class names or markup structure in step A.
- If you find a bug or oddity in the original, **do not fix it**. Write it in `PORT_NOTES.md` (what, where, why it matters) and keep behavior identical.
- Do not skip a component because it looks minor. The checklist in DESIGN_PORT.md section 12 is the definition of done; tick every line.
- Do not claim done without pasting the output of checks 1-3 and the visual/motion test summary.

## Definition of done for step A

All of the following are true and shown in your final report: manifest verified; every file in the checklist ported; audit script prints OK; 39 keyframes and 13 reduced-motion blocks present; zero differences from the original other than the allowed list; visual and motion suites pass within threshold for all routes, both themes, both directions, both viewports, plus reduced motion; `PORT_NOTES.md` lists every oddity found; nothing in `design-reference/` was modified.

Final report format: (1) checklist with a tick per item, (2) command outputs, (3) list of every deviation from the original and why, (4) `PORT_NOTES.md` contents, (5) anything you could not do.
