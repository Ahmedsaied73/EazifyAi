# Handoff Report: Reference Design Survey & Verification

**Sender**: Reference Design Explorer (`explorer_survey_1`)  
**Recipient**: Parent Orchestrator (`cc29a969-b977-43dc-9cdf-00980e2ddb74`)  
**Milestone**: Step A0 Survey & Reference Architecture Analysis  
**Date**: 2026-10-17  

---

## 1. Observation

1. **Reference Location & Contents**:
   - Location: `d:\EazifyAi\eazifyai-web\design-reference\`
   - Contains: `admin/`, `assets/`, `components/`, `hooks/`, `layouts/`, `lib/`, `module/`, `routes/`, `site/`, `styles.css`, `start.ts`, `server.ts`, `router.tsx`, `routeTree.gen.ts`, `app-meta.json`, `cloudflare-workers.d.ts`, `svg.d.ts`.
   - The original app was TanStack Start on Cloudflare Workers / Vite.
   - Design assets are plain React + plain CSS with zero Tailwind, Radix, Framer Motion, GSAP, or Lucide dependencies.

2. **Stylesheet & Motion Rules**:
   - `design-reference/styles.css` has 751 lines total.
   - Lines 1-114 contain scaffolding CSS (Tailwind/Quanta imports).
   - Lines 115-751 (637 lines) contain the verbatim site layer, beginning with:
     ```css
     /* EazifyAi site layer: Geist-style tokens, rounded, soft shadows */
     ```
   - `eazifyai-web/scripts/site-layer.css` is an exact, byte-for-byte duplicate of lines 115-751.
   - Keyframe audit: exactly **39 `@keyframes`** blocks are present.
   - Reduced motion audit: exactly **13 `@media (prefers-reduced-motion: reduce)`** query blocks are present.
   - Direct command execution:
     `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`
     Output:
     ```
     MISSING in port:
     |@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
     ```
     Exit code: `1`.
     Direct inspection of `src/styles/base.css` line 97:
     `@keyframes ez-flash{from{background:color-mix(in srgb, var(--sky) 25%, transparent)}to{background:transparent}}`
     Confirming that `src/styles/base.css` suffered manual modification and token substitution, dropping `@keyframes ez-flash` in its literal form.

3. **Fonts**:
   - In `design-reference/routes/__root.tsx` lines 99-101:
     ```tsx
     { rel: "preconnect", href: "https://fonts.googleapis.com" },
     { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
     { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" },
     ```
   - In `scripts/site-layer.css` line 6:
     `body{margin:0;min-height:100vh;background:var(--bg);color:var(--tx);font-family:"Geist","IBM Plex Sans Arabic",system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;line-height:1.7;transition:background .25s,color .25s}`
   - In `scripts/site-layer.css` line 430 (styles.css line 530 / 644):
     `.ez-fmark{font-size:clamp(3.5rem,19vw,13rem);font-weight:700;letter-spacing:-.05em;line-height:.85;text-align:center;direction:ltr;color:var(--tx);opacity:.045;user-select:none;white-space:nowrap;margin-top:32px;transform:translateY(18%)}`
   - Weight 700 is **strictly absent** from the Google Fonts link. The font link only requests Geist (300, 400, 500, 600) and IBM Plex Sans Arabic (400, 500, 600).

4. **Shared Runtime Motion Drivers & State Store**:
   - `site/i18n.ts`: 398 lines; complete Arabic and English dictionary structures exported as `T: Record<Lang, typeof ar>`.
   - `Prog` (`Site.tsx:166-189`): Passive scroll listener with RAF updating `.ez-prog` transform (`scaleX(p)`) and emitting window event `ez-prog`.
   - `useReveal` (`Site.tsx:191-211`): IntersectionObserver watching `.rv` with `rootMargin: "0px 0px -8% 0px"`, adding `.in`.
   - `Site.tsx` (`Site.tsx:1-280`): Site shell syncing `lang`, `theme`, and `user` to `localStorage` and `document.documentElement`, rendering header, Prog, glow, Bell, and footer with watermark.
   - `Logo.tsx` (`Logo.tsx:1-89`): 3-depth layers (Hand, Brackets, Star/Particles/Ring), pointer parallax via RAF setting `--mx`/`--my`, click burst mounting `<circle className="lg-burst" />` with `lg-ring` keyframe.
   - `store.ts` (`site/store.ts:1-96`): LocalStorage state store and window event bus (`ez-chats`, `ez-reqs`, `ez-notes`).
   - `lib/mock-api.ts` (`src/lib/mock-api.ts:1-202`): Next.js SSR-safe mock API implementing the store with dual memory Map and localStorage persistence.

5. **Routes in Reference**:
   - All 13 routes plus error and not-found components cataloged:
     - `/privacy` (`Legal.tsx`, TOC + scroll spy)
     - `/copyright` (`Legal.tsx`, TOC + scroll spy)
     - `/about` (`about.tsx`, check/cross marks `.ez-yi`, founder photo ring `.ez-fring`, floating tags `.ez-ftag`, contact form)
     - `/` (home: Hero word animation `.ez-w` with `--i`, `AgentDemo` 3D scroll tilt perspective `--e` and 8-step timer, How, Audience bento, `Onboard` wizard, Ideas table, `Proof` card, CTA, `Float` scroll CTA)
     - `/chat` (`Chat.tsx`, 4-step intake, speech recognition voice wave `.ez-wave`, live brief card, `Journey.tsx`, `Feedback.tsx`, `History.tsx`, `Req.tsx`)
     - `/login` (`Login.tsx`, orbit visual `.ez-vis` with 3 rings `.ez-rx` and floating chips `.ez-fchip`, floating labels, error shake `.ez-shake`, check mark)
     - `/register` (`Auth.tsx`, 3-step intake, password strength meter `.ez-str`, ping animation `.ez-ping`, 16-ray success burst `.ez-burst`)
     - `/profile` (`profile.tsx`, avatar ring `.ez-ring`, 900ms ease-out cubic animated counter `n`, user tags, requests list)
     - `/track` (`track.tsx`, character-by-character animated request ID `.ez-ch`, pulsing live dot `.ez-pdot`, `Timeline`, `ExtraForm`, `CallPicker`)
     - `/admin` (`admin.tsx`, admin gate form, 4 tabs: Inbox, Ideas, Calendar, Analytics)
     - `/brand` (`brand.tsx`, light/dark lockups, mark variants A & B, SVG/PNG 512 export)
     - `not-found` (`__root.tsx`, `NotFoundComponent` with `.ez-wrap .ez-doc`)
     - `error` (`__root.tsx`, `ErrorComponent` with `.ez-wrap .ez-doc`)
     - `sitemap.xml` (`routes/sitemap[.]xml.ts`)
     - `robots.txt` (`routes/robots[.]txt.ts`)

6. **Local Run & Baseline Harness**:
   - Baselines pre-captured: `tests/visual/baseline/` contains **132 PNG images** representing all 11 routes $\times$ 2 locales $\times$ 2 themes $\times$ 3 viewports.
   - Parity runner: `node scripts/run-visual-tests.mjs` compares `http://localhost:3000` against `tests/visual/baseline/` with pixel diff threshold $\le 0.1\%$.
   - Next.js development server runs on `http://localhost:3000` (`npm run dev`).
   - Fastify backend API runs on port `3001` (`PORT=3001`).

---

## 2. Logic Chain

1. **From Observation 1 to Structure**: The reference design is located entirely in `d:\EazifyAi\eazifyai-web\design-reference`. The UI components are localized in `site/`, `admin/`, and `routes/`. All other folders (`components/`, `hooks/`, `layouts/`, `module/`) are unused Higgsfield platform scaffolding that must be ignored during migration.
2. **From Observation 2 to CSS Extraction**: The site-layer CSS begins exactly at line 115 of `design-reference/styles.css` and ends at line 751. This 637-line slice contains all 39 keyframes and all 13 reduced-motion media queries. `scripts/site-layer.css` already exists as an exact verbatim copy of this slice.
3. **From Observation 2 to Step A0 Blocker**: `audit-motion.mjs` proves that the current `src/styles/base.css` has deviated from the reference by dropping `@keyframes ez-flash` and abstracting tokens into CSS variables. Copying `scripts/site-layer.css` directly to `src/styles/base.css` (or `app/globals.css`) immediately satisfies R1 and passes the motion audit.
4. **From Observation 3 to Font Constraint**: Loading weight 700 from Google Fonts would cause browser rendering divergence on `.ez-fmark` and headings, breaking visual pixel thresholds. Preserving the exact Google Fonts link without weight 700 is mandatory for `<= 0.1%` visual parity.
5. **From Observation 4 & 5 to SSR Architecture**: In Next.js App Router, `<Site>` must not be hoisted into `layout.tsx` because layout caching would prevent entrance animations (`ez-rise`, `ez-w`, `lg-a`) from replaying on page navigation. Each `page.tsx` must render `<Site>` around client leaf components. In addition, `mockApi` must handle SSR by falling back to memory storage so server rendering does not throw `localStorage is not defined`.
6. **From Observation 6 to Verification Gate**: Because 132 baseline images are already captured in `tests/visual/baseline/`, the verification pipeline for each route can be executed immediately via `npm run test:visual` once a route is migrated.

---

## 3. Caveats

1. **TanStack Start vs Next.js 16 Navigation**: In the reference app, `<Link to="...">` was from `@tanstack/react-router`. In the Next.js port, navigation uses Next.js `Link` or standard `<a>` tags with locale prefixes (e.g. `/${lang}/about` or `/${lang}/chat`).
2. **Admin Route Mock vs Production**: The reference `/admin` uses client-side mock credentials stored in `localStorage` via `admin/data.ts`. This is suitable for Step A0/A1 visual parity, with API-backed authentication scheduled for subsequent phases.
3. **SpeechRecognition Browser Support**: Voice recording on `/chat` depends on `webkitSpeechRecognition` or `SpeechRecognition`, which is supported in Chromium-based browsers (Chrome, Edge) but not Firefox. The reference handles this gracefully with `canVoice` checks.

---

## 4. Conclusion

The reference design is cleanly isolated, fully audited, and ready for immediate Step A0 certification and Step A1 route-by-route porting:
1. **CSS Layer**: Verbatim source is `scripts/site-layer.css` (and `design-reference/styles.css:115-751`), containing all 39 keyframes and 13 reduced-motion queries.
2. **Immediate Fix Required**: Overwrite `src/styles/base.css` with `scripts/site-layer.css` to restore `@keyframes ez-flash` and satisfy `audit-motion.mjs`.
3. **Fonts**: Google Fonts link strictly retains Geist (300-600) and IBM Plex Sans Arabic (400-600) with weight 700 absent.
4. **Shared Drivers**: `Prog`, `useReveal`, `Site.tsx`, `Logo.tsx`, `store.ts`, and `mockApi` have exact 1:1 migration specifications documented in `analysis.md`.
5. **Visual Parity**: 132 baseline images are present and ready for automated testing.

---

## 5. Verification Method

1. **Verify Motion Audit (Step A0 Gate)**:
   ```bash
   cd d:\EazifyAi\eazifyai-web
   node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
   ```
   *Expected Result*: Exits with code `0` and prints:
   `OK: every motion rule of the original exists in the port`
2. **Verify Keyframe Count**:
   ```bash
   node -e "const fs = require('fs'); const c = fs.readFileSync('scripts/site-layer.css', 'utf8'); const kf = [...c.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)]; console.log('Keyframes:', kf.length);"
   ```
   *Expected Result*: Prints `Keyframes: 39`.
3. **Verify Reduced-Motion Query Count**:
   ```bash
   node -e "const fs = require('fs'); const c = fs.readFileSync('scripts/site-layer.css', 'utf8'); const rm = [...c.matchAll(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/g)]; console.log('Reduced motion:', rm.length);"
   ```
   *Expected Result*: Prints `Reduced motion: 13`.
4. **Verify Baseline Assets**:
   ```bash
   node -e "const fs = require('fs'); const files = fs.readdirSync('tests/visual/baseline'); console.log('Baseline PNGs:', files.filter(f => f.endsWith('.png')).length);"
   ```
   *Expected Result*: Prints `Baseline PNGs: 132`.
5. **Inspect Detailed Survey Report**:
   Inspect `d:\EazifyAi\.agents\teamwork\explorer_survey_1\analysis.md`.
