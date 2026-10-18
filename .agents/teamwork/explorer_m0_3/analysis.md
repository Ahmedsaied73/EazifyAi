# Milestone 0 (Step A0 Foundation): Shared Motion Drivers & Mock API Analysis

**Author**: Shared Motion Drivers & API Specialist (`explorer_m0_3`)  
**Workspace**: `d:\EazifyAi\eazifyai-web`  
**Date**: 2026-10-17  

---

## 1. Executive Summary

Milestone 0 (Step A0 Foundation) establishes the technical bedrock for porting the finished Higgsfield EazifyAi design into `eazifyai-web` (Next.js 16, App Router, React 19, Turbopack, Plain CSS).

Our investigation verified:
1. **Verification Commands**:
   - `npm run typecheck`: **PASS (exit code 0)** — TypeScript strict checking passes without emit.
   - `npm run lint`: **PASS (exit code 0)** — ESLint passes across all files.
   - `npm run stylelint`: **PASS (exit code 0)** — Stylelint passes across `src/**/*.css`.
   - `npm run build`: **PASS (exit code 0)** — Next.js 16 production build compiles and generates static/dynamic routes successfully.
   - `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`: **FAIL (exit code 1)** — `@keyframes ez-flash` is missing in `base.css` because it used `color-mix(...)` instead of the canonical `rgba(120,169,204,.25)` declaration. (Coordinated with `explorer_m0_1`).
2. **Shared Motion Drivers**:
   - `Prog`: Fully implemented in `src/components/layout/SiteLayout.tsx` (lines 88–111). Matches reference logic with passive scroll listener, RAF throttling, CSS transform `scaleX(p)`, and `ez-prog` window event.
   - `useReveal`: Implemented in `src/components/layout/SiteLayout.tsx` (lines 64–85) matching the reference `IntersectionObserver` contract (`rootMargin: "0px 0px -8% 0px"`). **Critical Defect Discovered**: In `src/app/[locale]/page.tsx`, the home page is an async Server Component and never calls `useReveal()`. Consequently, all 8 `.rv` sections on the home page remain stuck at `transform: translateY(32px)`. Moreover, because `SiteLayout` is hoisted in `layout.tsx`, navigation does not trigger `useReveal()` with empty deps `[]`. We provide the exact architectural solution.
   - `Logo.tsx`: Fully implemented in `src/components/brand/Logo.tsx` (lines 1–119). 100% parity with 3 depth layers (`.lg-d1`, `.lg-d2`, `.lg-d3`), pointer parallax updating `--mx`/`--my`, media query checks (`prefers-reduced-motion` and `pointer: fine`), and click burst mounting `<circle className="lg-burst" />`.
   - `Site.tsx` / `SiteLayout.tsx`: Examined context provider, theme switch, locale switcher, Bell notification trigger, and header/footer layout. In reference, `<Site>` wrapped each page to replay entrance animations. We document the bridge ensuring compatibility with both conventions.
   - `site/store.ts` vs `src/lib/mock-api.ts`: `src/lib/mock-api.ts` provides SSR safety via `memStore` fallback and wraps `localStorage` operations. Currently exports only `mockApi` object.
3. **Unified Mock API (`submitLead`)**:
   - `submitLead` is **missing** as an export from `src/lib/mock-api.ts`.
   - The 4 call sites (`Chat.tsx`, `Req.tsx`, `Feedback.tsx`, `AboutContactForm.tsx`) currently contain fragmented workarounds (an inline fetch to `localhost:3001`, an empty Promise resolve, and an inline `setTimeout`).
   - We specify the exact drop-in implementation for `submitLead` with 400ms latency simulation, dev switch `?fail=1`, SSR safety, and direct named exports.

---

## 2. Verification Commands Assessment

| Command | Status | Exit Code | Findings / Action Needed |
|---------|--------|-----------|--------------------------|
| `npm run typecheck` | **PASS** | `0` | `tsc --noEmit` clean across codebase. |
| `npm run lint` | **PASS** | `0` | `eslint .` clean across codebase. |
| `npm run stylelint` | **PASS** | `0` | `stylelint "src/**/*.css"` clean. |
| `npm run build` | **PASS** | `0` | Next.js 16 production build compiles, renders 24 static pages across locales. |
| `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` | **FAIL** | `1` | Fails on `@keyframes ez-flash`: `from{background:rgba(120,169,204,.25)}to{background:transparent}` vs `color-mix(...)`. Will be resolved when verbatim CSS is restored in `src/styles/base.css` (M0 Feature F0.1 / F0.9). |

---

## 3. Runtime Motion Drivers Deep Dive

### 3.1 `Prog` (Scroll Progress Indicator)
- **Reference**: `design-reference/site/Site.tsx` (lines 166–189).
- **Port Location**: `src/components/layout/SiteLayout.tsx` (lines 88–111).
- **Implementation**:
  ```tsx
  function Prog() {
    const r = useRef<HTMLDivElement>(null);
    useEffect(() => {
      let raf = 0;
      const f = () => {
        raf = 0;
        const d = document.documentElement;
        const m = d.scrollHeight - d.clientHeight;
        const p = m > 0 ? d.scrollTop / m : 0;
        if (r.current) r.current.style.transform = 'scaleX(' + p + ')';
        window.dispatchEvent(new CustomEvent('ez-prog', { detail: p }));
      };
      const on = () => {
        if (!raf) raf = requestAnimationFrame(f);
      };
      window.addEventListener('scroll', on, { passive: true });
      on();
      return () => {
        window.removeEventListener('scroll', on);
        cancelAnimationFrame(raf);
      };
    }, []);
    return <div className="ez-prog" ref={r} aria-hidden="true" />;
  }
  ```
- **CSS Binding**:
  - Class: `.ez-prog` (fixed at `top: 0; left: 0; right: 0; height: 3px; z-index: 50; transform-origin: left;`).
  - RTL Support: `[dir="rtl"] .ez-prog { transform-origin: right; }`.
- **Event Bus Consumer**:
  - `src/features/onboarding/Float.tsx` (lines 13–14) listens to `ez-prog`. When `(detail > 0.78)`, it toggles `.on`, sliding the bottom floating CTA into view.
- **Evaluation**: 100% parity with design reference. Exporting `Prog` as a named export allows modular usage.

---

### 3.2 `useReveal` (IntersectionObserver for `.rv` and `.in`)
- **Reference**: `design-reference/site/Site.tsx` (lines 191–211).
- **Port Location**: `src/components/layout/SiteLayout.tsx` (lines 64–85).
- **Implementation**:
  ```tsx
  export function useReveal(): void {
    useEffect(() => {
      const els = Array.from(document.querySelectorAll('.rv'));
      if (!('IntersectionObserver' in window)) {
        els.forEach((e) => e.classList.add('in'));
        return;
      }
      const io = new IntersectionObserver(
        (es) => {
          es.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      els.forEach((e) => io.observe(e));
      return () => io.disconnect();
    }, []);
  }
  ```
- **The Problem in Next.js App Router**:
  1. In `src/app/[locale]/page.tsx`, the home page is an `async function HomePage(...)` Server Component.
  2. Hooks cannot be called in Server Components. `page.tsx` has 8 `.rv` elements (`#how`, `#aud`, `#ideas`, `.ez-cta`, etc.), but `useReveal()` is **never called**!
  3. Consequently, all those sections on the home page remain permanently at `transform: translateY(32px)`.
  4. Furthermore, in `src/app/[locale]/layout.tsx`, `SiteLayout` is mounted once at the root. When navigating client-side between routes, `useEffect(..., [])` does not re-run, so new `.rv` elements on subsequent pages are not observed.
- **The Solution**:
  1. Add a route-aware reveal trigger in `SiteLayout`:
     ```tsx
     export function useReveal(pathname?: string): void {
       useEffect(() => {
         const els = Array.from(document.querySelectorAll('.rv:not(.in)'));
         if (!('IntersectionObserver' in window)) {
           els.forEach((e) => e.classList.add('in'));
           return;
         }
         const io = new IntersectionObserver(
           (es) => {
             es.forEach((e) => {
               if (e.isIntersecting) {
                 e.target.classList.add('in');
                 io.unobserve(e.target);
               }
             });
           },
           { rootMargin: '0px 0px -8% 0px' },
         );
         els.forEach((e) => io.observe(e));
         return () => io.disconnect();
       }, [pathname]);
     }
     ```
  2. Inside `SiteLayout`, invoke `useReveal(pathname)`. Since `pathname = usePathname()` is already present in `SiteLayout.tsx` (line 212), calling `useReveal(pathname)` automatically re-scans the DOM whenever the user navigates to any route!
  3. Create a lightweight client leaf component `<RevealDriver />` or wrap pages so that both Server Component pages and Client Components have guaranteed reveal coverage.

---

### 3.3 `Logo.tsx` (3 Layers, Parallax, Click Burst)
- **Reference**: `design-reference/site/Logo.tsx` (lines 1–89).
- **Port Location**: `src/components/brand/Logo.tsx` (lines 1–119).
- **Structure & Features**:
  1. **SVG Paths**:
     - `HAND` = `P[0] + "Z"`
     - `BL` = `"M" + P[1] + "Z"`
     - `BR` = `"M" + P[2]`
     - `S` = Sparkle star path
     - `BITS` = 5 micro-particles with coordinates and scaling
  2. **Layering**:
     - `.lg-d1`: `<path className="lg-h" fill="currentColor" d={HAND} />`
     - `.lg-d2`: `<path className="lg-l" ... d={BL} />` and `<path className="lg-r" ... d={BR} />`
     - `.lg-d3`: `<path className="lg-s" fill="var(--sky)" d={S} />`
  3. **Pointer Parallax**:
     - Guarded by `matchMedia('(prefers-reduced-motion: reduce)')` and `matchMedia('(pointer: fine)')`.
     - Pointer event calculates normalized `px` and `py` in range `[-1, 1]` relative to logo center.
     - Scheduled via `requestAnimationFrame`.
     - Writes CSS variables `--mx` and `--my` to the SVG root element.
  4. **Click Burst**:
     - Triggered on click when `rich=true`.
     - Mounts `<circle key={k} className="lg-burst" cx="251" cy="106" r="20" />`.
     - Toggles `.lg-hot` for 900ms.
- **Evaluation**: 100% compliant with reference.

---

### 3.4 `Site.tsx` vs `SiteLayout.tsx`
- **Reference**: `design-reference/site/Site.tsx`.
- **Port**: `src/components/layout/SiteLayout.tsx`.
- **Comparison & Architectural Nuance**:
  - In `design-reference` (TanStack Router), each route component wrapped its output in `<Site>...</Site>`.
  - In `eazifyai-web`, `SiteLayout` is currently rendered in `src/app/[locale]/layout.tsx`.
  - `ORIGINAL_REQUEST.md` requirement R3 specifies:
    *"Keep `page.tsx` as Server Components with `generateMetadata`. Keep `<Site>` inside the page (never hoisted to layout) so entrance animations replay identically."*
  - **Recommendation**:
    1. Maintain `src/components/layout/SiteLayout.tsx` as the core implementation.
    2. Provide `src/components/layout/Site.tsx` as an export:
       ```tsx
       export { SiteLayout as Site, useSite, useReveal, Prog } from './SiteLayout';
       ```
    3. Ensure page-level entrance animations (such as `.ez-page`, `.ez-glow`, and `.ez-top`) replay cleanly when navigating routes by attaching key or CSS transitions.

---

### 3.5 `store.ts` (Event Bus & SSR Safety)
- **Reference**: `design-reference/site/store.ts`.
- **Port**: `src/lib/mock-api.ts`.
- **Event Bus Mechanism**:
  - `ez-chats`: Dispatched when chats are saved.
  - `ez-reqs`: Dispatched when requests are saved.
  - `ez-notes`: Dispatched with `detail: "new"` on `addNote`, and `detail: "read"` on `readNotes`.
  - `ez-prog`: Dispatched by `Prog` on scroll with progress `p`.
- **SSR Safety**:
  - All operations in `src/lib/mock-api.ts` check `typeof window !== 'undefined'` before accessing `localStorage` or `window.dispatchEvent`.
  - In Node/SSR environment, a memory map `memStore` holds state safely without throwing errors.

---

## 4. Unified Mock API (`submitLead`) Technical Plan

### 4.1 Current Gap
In the reference, `submitLead` was the **sole backend server function** (D1 database call) with 4 call sites:
1. `Chat.tsx`: Submits lead when chat qualification completes.
2. `Req.tsx` (`useFollow`): Submits extra request details (budget, urgency, time, WhatsApp updates).
3. `Feedback.tsx`: Submits user feedback (clear, clarification, lost).
4. `AboutContactForm.tsx`: Submits contact message.

Currently in `eazifyai-web`:
- `submitLead` is **not exported** from `src/lib/mock-api.ts`.
- `Chat.tsx` defined a local ad-hoc function fetching `http://localhost:3001/v1/leads`.
- `Req.tsx` stubbed `useFollow` with an empty `Promise.resolve()`.
- `AboutContactForm.tsx` used an inline `setTimeout`.

### 4.2 Proposed Unified `submitLead` Implementation
Add to `src/lib/mock-api.ts`:

```typescript
export interface LeadData {
  problem: string;
  affected?: string;
  current?: string;
  contact?: string;
  lang?: 'ar' | 'en' | string;
  [key: string]: unknown;
}

export interface SubmitLeadParams {
  data: LeadData;
}

export interface SubmitLeadResult {
  ok: boolean;
}

/**
 * Unified mock API for lead submission matching the design-reference server function contract.
 * - Emulates 400ms server network delay
 * - SSR-safe (checks typeof window !== 'undefined')
 * - Stores lead in localStorage 'ez-leads' when in browser
 * - Supports dev error simulation via ?fail=1 in URL
 */
export async function submitLead({ data }: SubmitLeadParams): Promise<SubmitLeadResult> {
  // Simulate 400ms network delay matching reference UI expectations
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Dev mode error simulation: throw if ?fail=1 in URL or data._fail === true
  if (typeof window !== 'undefined') {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('fail') === '1' || data._fail === true) {
        throw new Error('Simulated submitLead failure (?fail=1)');
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('Simulated')) {
        throw e;
      }
    }
  }

  // Persist locally in browser for inspection / admin mock
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('ez-leads') || '[]');
      localStorage.setItem('ez-leads', JSON.stringify([...existing, { ...data, at: Date.now() }].slice(0, 50)));
    } catch {
      /* storage full or blocked */
    }
  }

  return { ok: true };
}
```

### 4.3 Named Exports in `src/lib/mock-api.ts`
To allow ported files to import named functions directly without rewriting call sites:
```typescript
// Named function exports for direct import compatibility:
export const sessionUser = mockApi.sessionUser;
export const register = mockApi.register;
export const login = mockApi.login;
export const logout = mockApi.logout;
export const updateUser = mockApi.updateUser;
export const getChats = mockApi.getChats;
export const saveChat = mockApi.saveChat;
export const getReqs = mockApi.getReqs;
export const saveReq = mockApi.saveReq;
export const newId = mockApi.newId;
export const getNotes = mockApi.getNotes;
export const addNote = mockApi.addNote;
export const readNotes = mockApi.readNotes;
```

### 4.4 Call Site Migration Plan

| Call Site | File | Current State | Target State |
|-----------|------|---------------|--------------|
| **Chat** | `src/features/chat/Chat.tsx` | Inline `async function submitLead` attempting `fetch('http://localhost:3001/v1/leads')` | Remove inline function; `import { submitLead } from '../../lib/mock-api';` |
| **Req / Journey** | `src/features/journey/Req.tsx` | `useFollow` stubs `Promise.resolve()` | `import { submitLead } from '../../lib/mock-api';` and restore full lead submission logic |
| **Feedback** | `design-reference/site/Feedback.tsx` | Imports TanStack server function | Port to `src/features/journey/Feedback.tsx` importing `submitLead` from `../../lib/mock-api` |
| **About Contact** | `src/features/about/AboutContactForm.tsx` | Inline `setTimeout(..., 400)` | `import { submitLead } from '../../lib/mock-api';` and call `submitLead({ data: { problem: m, affected: n, current: 'contact form', contact: c, lang } })` |

---

## 5. Step A0 Foundation Gate Checklist

| Verification Gate | Expected Result | Current Result | Readiness |
|-------------------|-----------------|----------------|-----------|
| `npm run typecheck` | Exit 0, no errors | Exit 0 | **READY** |
| `npm run lint` | Exit 0, no errors | Exit 0 | **READY** |
| `npm run stylelint` | Exit 0, no errors | Exit 0 | **READY** |
| `npm run build` | Exit 0, 24 static pages | Exit 0 | **READY** |
| `audit-motion.mjs` | Exit 0, `OK: every motion rule...` | Exit 1 (ez-flash color-mix) | Handled by `explorer_m0_1` CSS restoration |
| `submitLead` in `mock-api.ts` | Exported & SSR safe | Blueprint finalized | Implementation-ready for implementer |
| `useReveal` in App Router | Re-runs on page navigation | Gap identified & solved | Blueprint finalized |
