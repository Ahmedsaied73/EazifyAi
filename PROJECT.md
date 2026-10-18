# Project: Higgsfield EazifyAi Design Port to eazifyai-web

## Architecture
- **Framework**: Next.js 16 (App Router, Turbopack, React 19).
- **Styling**: 100% Plain CSS (`src/styles/base.css`, `src/styles/tokens.css`). Zero Tailwind, zero external animation libraries (no Framer Motion, GSAP, Radix).
- **Typography**: Google Fonts CDN: `Geist` (weights 300, 400, 500, 600) and `IBM Plex Sans Arabic` (weights 400, 500, 600). Weight 700 is strictly prohibited.
- **I18n**: `next-intl` with locale prefix routing (`/[locale]/...`), Arabic (`ar`) default with RTL, English (`en`) with LTR.
- **State & Data**: Client `localStorage` event bus + SSR-safe memory store in `src/lib/mock-api.ts`.
- **Motion System**: Native CSS animations (39 `@keyframes`, 13 reduced-motion overrides) driven by 5 runtime drivers (`Prog`, `useReveal`, `Logo` parallax/burst, `AgentDemo` 3D scroll tilt & timeline, animated counters).

## Code Layout
- `d:\EazifyAi\eazifyai-web\design-reference/` — Read-only reference implementation (styles.css, site/, admin/, routes/).
- `d:\EazifyAi\eazifyai-web\scripts/`
  - `site-layer.css` — Canonical verbatim reference stylesheet (636 lines, 39 keyframes, 13 reduced-motion queries).
  - `audit-motion.mjs` — AST/string equality validator for motion declarations.
  - `run-visual-tests.mjs` — Automated Playwright visual diff runner.
- `d:\EazifyAi\eazifyai-web\src/styles/`
  - `base.css` — Ported site-layer stylesheet (must match `scripts/site-layer.css` verbatim).
  - `tokens.css` — CSS custom properties and color variables.
- `d:\EazifyAi\eazifyai-web\src/app/[locale]/`
  - `layout.tsx` — Root HTML shell with font preconnect/links and lang/dir setup.
  - `page.tsx` — Home page.
  - `(marketing)/` — `/about`, `/brand`, `/copyright`, `/privacy`.
  - `(auth)/` — `/login`, `/register`.
  - `chat/` — `/chat`.
  - `profile/` — `/profile`.
  - `track/` — `/track`, `/track/[publicId]`.
  - `(admin)/` — `/admin`.
- `d:\EazifyAi\eazifyai-web\src/components/`
  - `brand/Logo.tsx`, `Proof.tsx`
  - `layout/SiteLayout.tsx`
  - `motion/AgentDemo.tsx`
- `d:\EazifyAi\eazifyai-web\src/lib/mock-api.ts` — Unified mock API with `submitLead`.
- `d:\EazifyAi\eazifyai-web\tests/visual/` — 132 baseline PNG screenshots across 11 routes x 2 locales x 2 themes x 3 viewports.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F0.1 | Verbatim Site-Layer CSS | Copy `scripts/site-layer.css` verbatim to `src/styles/base.css`, restoring `@keyframes ez-flash` | M0 (Step A0) | ORIGINAL_REQUEST R1 |
| F0.2 | 39 Keyframes & 13 Reduced-Motion Blocks | Full preservation of all 39 @keyframes and 13 prefers-reduced-motion queries | M0 (Step A0) | ORIGINAL_REQUEST R1 |
| F0.3 | Google Fonts Link Injection | Inject preconnect and Google Fonts link (Geist 300-600, IBM Plex Sans Arabic 400-600, NO 700) in `[locale]/layout.tsx` | M0 (Step A0) | ORIGINAL_REQUEST R1 |
| F0.4 | Stylelint Exception Configuration | Add `src/styles/base.css` to `.stylelintrc.json` overrides so verbatim hex/rgba pass | M0 (Step A0) | Codebase Survey |
| F0.5 | Shared Motion Driver: Prog | Passive scroll listener + RAF updating `--prog` and emitting `ez-prog` event | M0 (Step A0) | ORIGINAL_REQUEST R1 |
| F0.6 | Shared Motion Driver: useReveal | IntersectionObserver watching `.rv` with `rootMargin: "0px 0px -8% 0px"`, adding `.in` | M0 (Step A0) | ORIGINAL_REQUEST R1 |
| F0.7 | Shared Motion Driver: Logo | 3-depth parallax layers + click ripple burst mounting `<circle className="lg-burst" />` | M0 (Step A0) | ORIGINAL_REQUEST R1 |
| F0.8 | Mock API: submitLead | Unified `submitLead` export in `src/lib/mock-api.ts` | M0 (Step A0) | ORIGINAL_REQUEST R3 |
| F0.9 | Motion Audit Script Certification | `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` exits 0 with `OK: every motion rule of the original exists in the port` | M0 (Step A0) | ORIGINAL_REQUEST R1 |
| F0.10 | Step A0 User Review Pause | Pause after Step A0 foundation is green and certified to report verification results | M0-Pause | ORIGINAL_REQUEST R1 |
| F1.1 | Route: /privacy | Legal.tsx TOC + scroll spy | M1 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.2 | Route: /copyright | Legal.tsx TOC + scroll spy | M2 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.3 | Route: /about | About.tsx, check/cross icons, founder photo ring, floating tags, contact form | M3 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.4 | Route: / (Home) | Hero, AgentDemo, How, Audience bento, Onboard, Ideas table, Proof, CTA, Float | M4 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.5 | Route: /chat | Chat.tsx, Journey, Feedback, History, Req, voice recording | M5 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.6 | Route: /login | Login.tsx orbit visual with 3 rings and floating chips, form | M6 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.7 | Route: /register | Auth.tsx step-by-step intake, password strength meter, 16-ray burst | M7 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.8 | Route: /profile | Profile.tsx, avatar ring, 900ms ease-out counter, tags, requests list | M8 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.9 | Route: /track | Track.tsx, character animated ID, pulsing live dot, Timeline, ExtraForm | M9 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.10 | Route: /admin | Admin gate, Inbox, Ideas, Calendar, Analytics | M10 (Step A1) | ORIGINAL_REQUEST R2 |
| F1.11 | Routes: /brand & Infra | Brand.tsx, not-found, error, sitemap.xml, robots.txt | M11 (Step A1) | ORIGINAL_REQUEST R2 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Step A0 Foundation | Verbatim CSS (`src/styles/base.css`), exact fonts in `layout.tsx`, stylelint override, `submitLead` in `mock-api.ts`, motion audit exit 0, quality scripts passing | none | DONE |
| M0-P | Step A0 Review Pause | Present Step A0 verification results to Sentinel/User; pause before Step A1 | M0 | DONE |
| M1 | Route: /privacy | Visual parity <= 0.1%, TOC, scroll spy, commit 6369680 | M0-P | DONE |
| M2 | Route: /copyright | Visual parity <= 0.1%, Legal page, commit ad68df7 | M1 | DONE |
| M3 | Route: /about | Visual parity <= 0.1%, founder block, contact mock (commit 64d39ce) | M2 | DONE |
| M4 | Route: / (Home) | Visual parity <= 0.1%, Hero, AgentDemo, Onboard, Bento (commit d72a596) | M3 | DONE |
| M5 | Route: /chat | Visual parity <= 0.1%, Chat intake, speech recognition, journey (commit 78569f6) | M4 | DONE |
| M6 | Route: /login | Visual parity <= 0.1%, orbit visual, auth form | M5 | IN_PROGRESS |
| M7 | Route: /register | Visual parity <= 0.1%, intake steps, password strength | M6 | PLANNED |
| M8 | Route: /profile | Visual parity <= 0.1%, counter, tags, requests list | M7 | PLANNED |
| M9 | Route: /track | Visual parity <= 0.1%, animated ID, timeline | M8 | PLANNED |
| M10 | Route: /admin | Visual parity <= 0.1%, admin gate, 4 tabs | M9 | PLANNED |
| M11 | Route: /brand & System | Visual parity <= 0.1%, brand assets, 404, error, sitemap, robots | M10 | PLANNED |

---

## Interface Contracts
### Stylesheet Contract
- `scripts/site-layer.css` == `src/styles/base.css` (verbatim line-by-line).
- Exactly 39 `@keyframes` blocks.
- Exactly 13 `@media (prefers-reduced-motion: reduce)` blocks.
- `@keyframes ez-flash`: `from{background:rgba(120,169,204,.25)}to{background:transparent}`.
- Font stack: `"Geist","IBM Plex Sans Arabic",system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif`.

### Font Link Contract
- Google Fonts `<link>` in `src/app/[locale]/layout.tsx`:
  - `https://fonts.googleapis.com` (preconnect)
  - `https://fonts.gstatic.com` (preconnect, crossorigin)
  - `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap`
  - Weight 700 strictly omitted.

### Mock API Contract (`src/lib/mock-api.ts`)
- `export async function submitLead({ data }: { data: any }): Promise<{ ok: boolean }>`
- SSR safe: checks `typeof window !== 'undefined'` before touching `localStorage`.

### Motion Audit Verification Contract
- `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`
- Expected stdout: `OK: every motion rule of the original exists in the port`
- Expected exit code: `0`
