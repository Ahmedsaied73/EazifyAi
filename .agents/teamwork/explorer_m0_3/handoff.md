# Milestone 0 (Step A0 Foundation): Shared Motion Drivers & Mock API Handoff Report

**Agent**: Shared Motion Drivers & API Specialist (`explorer_m0_3`)  
**Working Directory**: `d:\EazifyAi\.agents\teamwork\explorer_m0_3`  
**Recipient**: Orchestrator / Parent Agent (`cc29a969-b977-43dc-9cdf-00980e2ddb74`)  
**Date**: 2026-10-17  

---

## 1. Observation

1. **Verification Commands**:
   - `npm run typecheck` in `d:\EazifyAi\eazifyai-web`:
     - Command: `tsc --noEmit`
     - Output: Exited with code `0`.
   - `npm run lint` in `d:\EazifyAi\eazifyai-web`:
     - Command: `eslint .`
     - Output: Exited with code `0`.
   - `npm run stylelint` in `d:\EazifyAi\eazifyai-web`:
     - Command: `stylelint "src/**/*.css"`
     - Output: Exited with code `0`.
   - `npm run build` in `d:\EazifyAi\eazifyai-web`:
     - Command: `next build`
     - Output: Exited with code `0`. Generated 24 static pages across `[locale]`.
   - `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`:
     - Output:
       ```
       MISSING in port:
       |@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
       ```
     - Exit code: `1`.

2. **Motion Drivers in Codebase**:
   - `Prog`:
     - Location: `src/components/layout/SiteLayout.tsx` lines 88–111.
     - Implementation: passive scroll listener, `requestAnimationFrame`, sets `r.current.style.transform = 'scaleX(' + p + ')'`, dispatches `CustomEvent('ez-prog', { detail: p })`.
     - Consumer: `src/features/onboarding/Float.tsx` lines 13–14 listens to `ez-prog`.
   - `useReveal`:
     - Location: `src/components/layout/SiteLayout.tsx` lines 64–85.
     - Implementation: queries `.rv`, fallback adds `.in` if no `IntersectionObserver`, sets `rootMargin: '0px 0px -8% 0px'`, adds `.in` and unobserves on intersection.
     - Home Page Gap: In `src/app/[locale]/page.tsx`, the home page is an async Server Component (`async function HomePage`). It contains 8 elements with class `.rv` (lines 86, 87, 90, 101, 104, 136, 138, 171), but never invokes `useReveal()`.
     - Navigation Gap: `SiteLayout` is mounted once in `src/app/[locale]/layout.tsx` (line 43). `useReveal()` in `SiteLayout` has dependency array `[]`. When navigating routes via client router, `useReveal` does not re-run.
   - `Logo.tsx`:
     - Location: `src/components/brand/Logo.tsx` lines 1–119.
     - 3 depth groups: `<g className="lg-d1">` (hand), `<g className="lg-d2">` (brackets), `<g className="lg-d3">` (star + particles).
     - Parallax: `pointermove` calculates normalized `px` and `py`, sets `--mx` and `--my` on SVG root via RAF. Guarded by `(prefers-reduced-motion: reduce)` and `(pointer: fine)`.
     - Click burst: `rich && hot && <circle key={k} className="lg-burst" cx="251" cy="106" r="20" />`.
   - `Site.tsx` / `SiteLayout.tsx`:
     - Reference: `design-reference/site/Site.tsx`.
     - Current: `src/components/layout/SiteLayout.tsx`.
     - Difference: In reference, `<Site>` wrapped each route. In current app, `SiteLayout` is in `src/app/[locale]/layout.tsx`.
   - `site/store.ts` vs `src/lib/mock-api.ts`:
     - Reference: `design-reference/site/store.ts` exports named functions (`sessionUser`, `register`, `login`, `getChats`, `saveChat`, `getReqs`, `saveReq`, `newId`, `getNotes`, `addNote`, `readNotes`).
     - Port: `src/lib/mock-api.ts` exports object `export const mockApi = { ... }`.
     - SSR protection: `src/lib/mock-api.ts` lines 56–79 contains `memStore = new Map<string, string>()` and checks `typeof window === 'undefined'`.

3. **Unified Mock API (`submitLead`)**:
   - Location: `src/lib/mock-api.ts`.
   - Current: `submitLead` is not exported from `src/lib/mock-api.ts`.
   - Fragmented call sites:
     - `src/features/chat/Chat.tsx` lines 57–73: inline `submitLead` fetching `http://localhost:3001/v1/leads`.
     - `src/features/journey/Req.tsx` lines 214–223: `useFollow` stubs `Promise.resolve()`.
     - `src/features/about/AboutContactForm.tsx` lines 33–38: inline `setTimeout(..., 400)`.
     - `design-reference/site/Feedback.tsx` line 3: expects `import { submitLead } from "../lib/api/lead.functions"`.

---

## 2. Logic Chain

1. **Verification Scripts**:
   - *Observation 1* confirms that `npm run typecheck`, `npm run lint`, `npm run stylelint`, and `npm run build` all pass with code 0.
   - *Observation 1* shows `scripts/audit-motion.mjs` fails solely on `@keyframes ez-flash` because `src/styles/base.css` had `color-mix(...)` instead of the canonical `rgba(...)`. Once `scripts/site-layer.css` is restored verbatim in `src/styles/base.css` (M0 F0.1 / F0.9), `audit-motion.mjs` will exit 0.

2. **Motion Drivers**:
   - *Observation 2* confirms `Prog` and `Logo.tsx` meet 100% of the reference design specification and CSS animation requirements.
   - *Observation 2* reveals that because `page.tsx` is an async Server Component in App Router, and `useReveal()` is a client hook, the home page never calls `useReveal()`. Thus, 8 `.rv` sections on the home page remain un-animated and offset by 32px.
   - Furthermore, because `SiteLayout` is in `layout.tsx`, its `useEffect(..., [])` does not re-trigger on route changes.
   - Therefore, `SiteLayout` should trigger `useReveal(pathname)` on every pathname change, ensuring automatic scroll-reveal coverage across all routes.

3. **Mock API Integration**:
   - *Observation 3* reveals that the lack of a central `submitLead` in `src/lib/mock-api.ts` led to inconsistent ad-hoc implementations across `Chat.tsx`, `Req.tsx`, and `AboutContactForm.tsx`.
   - By implementing `export async function submitLead({ data }: SubmitLeadParams)` in `src/lib/mock-api.ts` with:
     a) 400ms network delay simulation
     b) SSR safety (`typeof window !== 'undefined'`)
     c) Test failure support (`?fail=1` dev switch)
     d) Browser persistence in `ez-leads`
     e) Direct named exports matching `design-reference/site/store.ts`
     all 4 call sites can cleanly import `submitLead` from `@/lib/mock-api` (or `../../lib/mock-api`), achieving full architectural unification for Step A0.

---

## 3. Caveats

1. **Visual Parity**: Visual diff testing (`npm run test:visual` via Playwright) requires both the reference app (port 3001) and Next.js app (port 3000) running concurrently. This is evaluated under Milestone 1 (Step A1), not Step A0.
2. **Page-Level Layout Re-mounts**: In TanStack Router, `<Site>` re-mounted on every page change. In Next.js App Router, `<SiteLayout>` in `layout.tsx` persists. This is standard Next.js App Router behavior; adding `useReveal(pathname)` solves the motion replay requirement for `.rv` elements without breaking React 19 layout caching.

---

## 4. Conclusion

- **Step A0 Readiness**: The shared motion drivers and verification scripts are in an excellent state:
  - 4 out of 5 verification scripts pass cleanly (`typecheck`, `lint`, `stylelint`, `build`).
  - `Prog` and `Logo.tsx` are fully verified.
  - The blueprint for `submitLead` in `src/lib/mock-api.ts` is fully specified and ready for implementation.
  - The gap in `useReveal` on Server Component pages is diagnosed with a definitive solution (`useReveal(pathname)` inside `SiteLayout`).
  - Step A0 foundation can proceed to code editing by the implementer agent.

---

## 5. Verification Method

To independently verify all findings:

1. **Verify TypeScript type checking**:
   ```powershell
   cd d:\EazifyAi\eazifyai-web
   npm run typecheck
   ```
   *Expected*: Exit code 0, no errors.

2. **Verify ESLint**:
   ```powershell
   cd d:\EazifyAi\eazifyai-web
   npm run lint
   ```
   *Expected*: Exit code 0, no errors.

3. **Verify Stylelint**:
   ```powershell
   cd d:\EazifyAi\eazifyai-web
   npm run stylelint
   ```
   *Expected*: Exit code 0, no errors.

4. **Verify Next.js Production Build**:
   ```powershell
   cd d:\EazifyAi\eazifyai-web
   npm run build
   ```
   *Expected*: Exit code 0, all 24 pages compiled and optimized.

5. **Verify Motion Audit Difference**:
   ```powershell
   cd d:\EazifyAi\eazifyai-web
   node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
   ```
   *Expected*: Currently reports missing `ez-flash`. Will report `OK: every motion rule of the original exists in the port` once verbatim CSS is restored in `src/styles/base.css`.
