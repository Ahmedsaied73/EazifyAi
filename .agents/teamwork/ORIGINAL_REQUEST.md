# Original User Request

## 2026-10-17T21:51:20Z

Port the finished Higgsfield EazifyAi design (`Company-site-design` / `design-reference`) into `eazifyai-web` (Next.js 16, App Router, plain CSS, NO Tailwind) literally, achieving identical pixels, fonts, timings, easing, RTL/LTR behavior, and reduced-motion behavior. Pause for user review after Step A0 foundation is green and verified.

Working directory: `D:\EazifyAi\eazifyai-web`
Integrity mode: development

## Requirements

### R1. Literal Site-Layer Stylesheet & Foundation (Step A0)
- Extract lines 115 to end (636 lines) from `design-reference/styles.css` into `app/globals.css` / `src/styles/base.css`. Verbatim copy — no manual editing, no rule deletions.
- Retain all 39 `@keyframes` (including `@keyframes ez-flash`) and all 13 `prefers-reduced-motion:reduce` media queries.
- Retain exact Google Fonts link for **Geist** (300/400/500/600) and **IBM Plex Sans Arabic** (400/500/600). Strictly do not load weight 700.
- Load `site/i18n.ts` verbatim for Step A (transitioning to `messages/{ar,en}.json` in Step B).
- Port shared runtime motion drivers (`Prog`, `useReveal`, `Site.tsx`, `Logo.tsx`, `store.ts`, `lib/mock-api.ts`).
- Verification check: `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` must print `OK: every motion rule of the original exists in the port`.
- Once A0 is complete and certified, pause and present the verification results to the user before starting A1.

### R2. Strict Route-by-Route Migration (Step A1 — Post-A0 Review)
Port routes strictly one by one in the defined sequence:
1. `/privacy` (`Legal.tsx` TOC + scroll spy)
2. `/copyright` (`Legal.tsx`)
3. `/about` (`about.tsx`, check/cross icons, founder block, contact form mock)
4. `/` (home: Hero, `AgentDemo`, How, Audience bento, `Onboard`, Ideas table, `Proof`, CTA, `Float`)
5. `/chat` (`Chat.tsx`, `Journey.tsx`, `Feedback.tsx`, `History.tsx`, `Req.tsx`)
6. `/login` (`Login.tsx` orbit visual)
7. `/register` (`Auth.tsx` step-by-step intake)
8. `/profile` (counter, tags, requests list)
9. `/track` (request tracking, timeline)
10. `/admin` (admin gate, Inbox, Ideas, Calendar, Analytics)
11. `/brand`, not-found, error, `sitemap.xml`, `robots.txt`

Each route must be committed individually (`A1.<n> <route>`) only after its visual and motion gates pass.

### R3. Next.js 16 App Router & SSR Seams
- Keep `page.tsx` as Server Components with `generateMetadata`. Keep `<Site>` inside the page (never hoisted to layout) so entrance animations replay identically.
- Isolate interactive components into client Leaf Components marked with `'use client'`.
- Replace backend call sites (`submitLead`) with the unified mock API (`lib/mock-api.ts`).

### R4. Automated Visual & Motion Parity Verification
- Run original reference app locally from `design-reference/app` (port 3001) alongside the Next.js port (port 3000).
- Playwright visual harness in `tests/visual/` captures and diffs screenshots across all 8 matrix combinations (Dark/Light x Arabic/English x Desktop 1440px / Mobile 390px).
- Maximum pixel difference threshold: `<= 0.1%`.

## Acceptance Criteria

### Motion & CSS Integrity (Step A0 Gate)
- [ ] `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` exits 0 with `OK: every motion rule of the original exists in the port`.
- [ ] Exactly 39 `@keyframes` blocks present in stylesheet.
- [ ] Exactly 13 `prefers-reduced-motion:reduce` blocks present in stylesheet.
- [ ] Zero usage of Tailwind, Framer Motion, GSAP, Radix, or external animation libraries.

### Visual & Route Parity (Step A1 Gate)
- [ ] All 13 routes match reference design within `<= 0.1%` differing pixels on desktop (1440px) and mobile (390px).
- [ ] All 5 motion drivers (`Prog`, `useReveal`, `Demo` timeline, `Logo` parallax/burst, count-ups) operate identically to reference.
- [ ] Font network inspection confirms Geist (300-600) and Plex Sans Arabic (400-600) with no weight 700.
- [ ] Full quality gate passes: `npm run typecheck`, `npm run lint`, `npm run stylelint`, `npm run build`.

## 2026-10-18T00:00:34Z

User has reviewed and approved Step A0 Foundation. Please unpause execution and proceed with Step A1 (Route-by-Route Migration) in the defined sequence: Page 1 (/privacy), Page 2 (/copyright), Page 3 (/about), Page 4 (/ home), Page 5 (/chat), Page 6 (/login), Page 7 (/register), Page 8 (/profile), Page 9 (/track), Page 10 (/admin), Page 11 (/brand, not-found, error, sitemap.xml, robots.txt), committing each page individually upon passing visual and motion gates.

## 2026-10-18T20:00:11Z

Server was restarted and agents were paused. Please resume execution of Step A1 route migration starting with Milestone 1 (/privacy), revive any required orchestrators or specialist workers, and proceed through the approved route sequence: /privacy, /copyright, /about, / (home), /chat, /login, /register, /profile, /track, /admin, /brand and system routes.

## 2026-10-18T21:00:36Z

Server restarted. Please resume execution of Step A1 route migration from Milestone 3 (/about) and proceed through the sequence: /about, / (home), /chat, /login, /register, /profile, /track, /admin, /brand.

## 2026-10-18T21:44:06Z

Milestone 3 (/about) and Milestone 4 (/ home) have been fully implemented, verified with 12/12 visual passes, and committed as:
- `64d39ce` A1.3 /about
- `d72a596` A1.4 /

Resume immediately with Milestone 5 (`/chat`):
- Wire `Chat.tsx`, `Journey.tsx`, `Feedback.tsx`, `History.tsx`, `Req.tsx`
- Ensure all 3 `submitLead` call sites import the unified mock `submitLead` from `src/lib/mock-api.ts`
- Implement localized `generateMetadata` in `src/app/[locale]/chat/page.tsx`
- Verify Playwright visual diffs across all 12 combinations and run quality gates (`typecheck`, `lint`, `stylelint`, `audit-motion.mjs`, `build`)
- Commit as `A1.5 /chat` and proceed down the table (Milestone 6 `/login`, Milestone 7 `/register`, etc.).
