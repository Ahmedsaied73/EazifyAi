# EazifyAi Target Web App Survey Report

**Location**: `d:\EazifyAi\eazifyai-web`  
**Date**: 2026-10-18  
**Investigator**: Target Web App Explorer (`explorer_survey_2`)  
**Mission**: Comprehensive codebase survey across project architecture, dependencies, scripts, stylesheets, motion drivers, testing tools, and prerequisites for Step A0.

---

## 1. Executive Summary

The target application `eazifyai-web` is an active Next.js 16 (`16.4.2`) App Router application running on React 19 (`19.3.1`). It contains extensive scaffolding and ports of the 11 primary product routes, with all core npm build and validation scripts (`typecheck`, `lint`, `stylelint`, `build`, `i18n:check`, `contract-check`) currently passing with exit code 0.

However, the audit motion verification command:
```bash
node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
```
**currently fails with exit code 1**. The failure is caused by an intentional or accidental tokenization edit in `src/styles/base.css`, where `@keyframes ez-flash` was changed from `rgba(120,169,204,.25)` to `color-mix(in srgb, var(--sky) 25%, transparent)`.

Furthermore, five other critical gaps were identified that impact Step A0 readiness:
1. **Stylelint Conflict**: `.stylelintrc.json` forbids raw hex and rgba outside `src/styles/tokens.css`. Restoring `src/styles/base.css` verbatim will break `npm run stylelint` unless `.stylelintrc.json` is updated to exempt `src/styles/base.css`.
2. **Missing Google Fonts `<link>`**: No font `<link>` exists in `src/app/[locale]/layout.tsx`. The site relies on system font fallbacks, causing visual regression diffs.
3. **Missing `submitLead` in `lib/mock-api.ts`**: The shared mock API lacks `submitLead`, which was ad-hoc inlined in some components.
4. **Layout Architecture Divergence**: `<SiteLayout>` is hoisted in `src/app/[locale]/layout.tsx`, conflicting with requirement R3 ("Keep `<Site>` inside the page (never hoisted to layout) so entrance animations replay identically").
5. **Playwright Import Paths**: `scripts/run-visual-tests.mjs` imports Playwright directly from the local Windows user global path (`file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs`) rather than repo devDependencies.

---

## 2. Project Architecture & Setup

### 2.1 Framework & Core Dependencies
- **Next.js Version**: `16.4.2` (configured with Turbopack).
- **React Version**: `19.3.1` (`react-dom`: `19.3.1`, `@types/react`: `19.2.15`).
- **TypeScript**: `5.8.3` (`tsconfig.json` target ES2022, bundler module resolution, `@/*` path mapping to `./src/*`).
- **Next Config** (`next.config.ts`):
  ```typescript
  import type { NextConfig } from 'next';
  import createNextIntlPlugin from 'next-intl/plugin';
  const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
  const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
  };
  export default withNextIntl(nextConfig);
  ```

### 2.2 Directory Layout
The codebase is structured under `src/`:
```
eazifyai-web/
├── design-reference/         # Read-only reference site & TanStack app
├── docs/                     # Porting specifications and animation inventories
├── public/                   # Static assets (favicon.svg, og.png, etc.)
├── scripts/                  # Audit, verification, and visual test scripts
├── tests/                    # Visual test baselines, diffs, and e2e harness
├── src/
│   ├── app/                  # Next.js App Router root
│   │   ├── actions/          # Next.js server actions (profile.ts, requests.ts)
│   │   └── [locale]/         # Dynamic locale route tree
│   │       ├── (admin)/      # /admin
│   │       ├── (auth)/       # /login, /register
│   │       ├── (marketing)/  # /about, /brand, /copyright, /privacy
│   │       ├── chat/         # /chat
│   │       ├── profile/      # /profile
│   │       ├── track/        # /track, /track/[publicId]
│   │       ├── layout.tsx    # Root HTML shell & SiteLayout wrapper
│   │       └── page.tsx      # Root marketing home page (/)
│   ├── components/           # Shared brand and layout components
│   │   ├── brand/            # Logo.tsx, Proof.tsx
│   │   ├── layout/           # SiteLayout.tsx, LegalPage.tsx, Faq.tsx, Fit.tsx, Feedback.tsx
│   │   └── motion/           # AgentDemo.tsx
│   ├── config/               # brand.ts, site.ts
│   ├── features/             # Route-specific client/leaf components
│   ├── i18n/                 # next-intl configuration, messages/ar.json, messages/en.json
│   ├── lib/                  # mock-api.ts, supabase client/server/middleware, api client
│   └── styles/               # base.css, tokens.css
```

---

## 3. Package.json Scripts Verification

All primary verification scripts were executed and measured:

| Script | Command | Result | Notes |
|---|---|---|---|
| `npm run typecheck` | `tsc --noEmit` | **PASS (Exit 0)** | Zero TypeScript compiler errors. |
| `npm run lint` | `eslint .` | **PASS (Exit 0)** | ESLint 9 + Next.js flat config passed cleanly. |
| `npm run stylelint` | `stylelint "src/**/*.css"` | **PASS (Exit 0)** | Passes on current `src/styles/*.css`, but see Section 4 for caveat. |
| `npm run build` | `next build` | **PASS (Exit 0)** | Successfully generated 24 static and dynamic SSG/SSR pages in 2.3s. |
| `npm run i18n:check` | `tsx scripts/check-i18n.ts` | **PASS (Exit 0)** | All 336 translation keys match 1:1 between `ar.json` and `en.json`. |
| `npm run contract-check` | `tsx scripts/check-contract.ts`| **PASS (Exit 0)** | `src/lib/api/schema.d.ts` matches `../eazifyai-api/openapi.json`. |
| `npm run test:visual` | `node scripts/run-visual-tests.mjs` | **Conditional** | Requires local dev server on port 3000 and global Playwright. |

---

## 4. CSS Architecture, Tailwind Audit & Motion Integrity

### 4.1 Absence of Tailwind and External Animation Libraries
An exhaustive grep of `src/` and `package.json` confirmed:
- **Tailwind**: Zero presence in `src/`. No `tailwind.config`, no Tailwind directives, no `tailwindcss` package.
- **Animation Libraries**: Zero usage of `framer-motion`, `motion`, `gsap`, `radix-ui`, `lucide-react`, `styled-components`, or `emotion`.
- The reference styling is 100% plain CSS and native CSS animations.

### 4.2 Stylesheet Structure & Discrepancies
There are two stylesheets in `src/styles/`:
1. `src/styles/tokens.css` (184 lines): Design tokens defining `--primitive-*` palette, typography, radii, and semantic tokens.
2. `src/styles/base.css` (635 lines): The ported site-layer stylesheet imported in `src/app/[locale]/layout.tsx`.

### 4.3 Motion Audit Failure: `scripts/site-layer.css` vs `src/styles/base.css`
Executing:
```bash
node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
```
Result:
```
MISSING in port:
|@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
```
Exit code: `1`.

**Root Cause Analysis**:
- `scripts/site-layer.css` has 637 lines and is an **exact, byte-for-byte slice** of `design-reference/styles.css` from line 115 to line 751 (`exact match: true`).
- Running `node scripts/audit-motion.mjs scripts/site-layer.css scripts/site-layer.css` exits `0` with `OK: every motion rule of the original exists in the port`.
- In `src/styles/base.css`, line 56 has:
  ```css
  @keyframes ez-flash{from{background:color-mix(in srgb, var(--sky) 25%, transparent)}to{background:transparent}}
  ```
  whereas `scripts/site-layer.css` has:
  ```css
  @keyframes ez-flash{from{background:rgba(120,169,204,.25)}to{background:transparent}}
  ```
- Furthermore, `src/styles/base.css` has several manual substitutions replacing hex colors (`#000`, `#fff`, `#2563eb`) with `var(--primitive-*)`. This directly contradicts Requirement R1:
  > *"Extract lines 115 to end (636 lines) from `design-reference/styles.css` into `app/globals.css` / `src/styles/base.css`. Verbatim copy — no manual editing, no rule deletions."*

### 4.4 Stylelint Rule Constraint
`.stylelintrc.json` is currently configured as:
```json
{
  "rules": {
    "color-no-hex": true,
    "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla"],
    "declaration-property-value-disallowed-list": {
      "/^(background|color|border|box-shadow|outline)/": ["/^#/", "/^rgb/", "/^hsl/"]
    }
  },
  "overrides": [
    {
      "files": ["src/styles/tokens.css"],
      "rules": {
        "color-no-hex": null,
        "function-disallowed-list": null,
        "declaration-property-value-disallowed-list": null
      }
    }
  ]
}
```
If `src/styles/base.css` is reverted to the literal verbatim site-layer, `npm run stylelint` will fail on the hundreds of raw `#hex` and `rgba()` declarations in `base.css`.
**Remediation**: Update `.stylelintrc.json` overrides to include `src/styles/base.css` (or `app/globals.css`) alongside `src/styles/tokens.css` for Step A.

---

## 5. Tooling, Scripts & Visual Regression Setup

### 5.1 Existing Tooling
- `scripts/audit-motion.mjs`: AST/block parser tracking all 39 `@keyframes` and 13 `prefers-reduced-motion` media queries. Ready and functioning.
- `scripts/site-layer.css`: Canonical verbatim baseline stylesheet (637 lines, 57,060 bytes).
- `scripts/run-visual-tests.mjs`: Node script for visual comparison using `pixelmatch` (threshold 0.15) and `pngjs`. Iterates across:
  - 11 routes: `home`, `about`, `brand`, `privacy`, `copyright`, `chat`, `login`, `register`, `profile`, `track`, `admin`.
  - 3 viewports: Mobile `390x844`, Tablet `768x1024`, Desktop `1280x800`.
  - 2 locales: `ar`, `en`.
  - 2 themes: `dark`, `light`.
  - Total combinations: 132 screenshot comparisons.
- `tests/visual/baseline/`: Contains 100+ baseline PNG screenshots captured from the reference app.

### 5.2 Tooling Caveat
`scripts/run-visual-tests.mjs` line 1:
```javascript
import { chromium } from 'file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs';
```
Playwright is not in `package.json` devDependencies. It relies on the environment's global npm modules.

---

## 6. Runtime Motion Drivers, i18n & Architecture State

### 6.1 Motion Drivers Status
| Driver | Reference Location | Target Web App Location | Status |
|---|---|---|---|
| `Prog` (scroll progress) | `design-reference/site/Site.tsx` | `src/components/layout/SiteLayout.tsx:88` | Implemented |
| `useReveal` (IntersectionObserver) | `design-reference/site/Site.tsx` | `src/components/layout/SiteLayout.tsx:64` | Implemented |
| `Logo.tsx` (rich parallax & burst) | `design-reference/site/Logo.tsx` | `src/components/brand/Logo.tsx` | Implemented |
| `AgentDemo.tsx` (timeline + tilt) | `design-reference/site/Demo.tsx` | `src/components/motion/AgentDemo.tsx` | Implemented |
| Count-ups / Timers | Various routes | Implemented in feature leaf components | Implemented |

### 6.2 The Layout Hoisting Divergence (Requirement R3)
In the reference TanStack app, every route returned:
```tsx
function About() {
  return (
    <Site>
      <Body />
    </Site>
  );
}
```
Requirement R3 explicitly states:
> *"Keep `page.tsx` as Server Components with `generateMetadata`. Keep `<Site>` inside the page (never hoisted to layout) so entrance animations replay identically."*

In `eazifyai-web`, `<SiteLayout>` is currently mounted at the root of `src/app/[locale]/layout.tsx` (line 43), wrapping `{children}`. The implications:
- Layout-level header, glow, and progress bar do not re-mount or replay entrance transitions when navigating between routes.
- If strict R3 conformance is required for Step A1, the layout must become a minimal pass-through shell and `<Site>` mounted per route.

### 6.3 Missing Google Fonts Link
In `design-reference/routes/__root.tsx` lines 99-101:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">
```
In `src/app/[locale]/layout.tsx`, this link tag is **completely missing**. As a result, the fonts are not fetched over the network, failing the acceptance criterion:
> *"Font network inspection confirms Geist (300-600) and Plex Sans Arabic (400-600) with no weight 700."*

### 6.4 `submitLead` Missing in Mock API
`src/lib/mock-api.ts` defines auth, sessions, chats, and requests, but is missing the unified `submitLead` function required by R3:
```typescript
export async function submitLead({ data }: { data: any }) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ok: true };
}
```
Currently, `Chat.tsx` defined its own internal `submitLead`, and `AboutContactForm.tsx` used a direct `setTimeout`.

---

## 7. Step A0 Gap Matrix & Actionable Remediation Plan

| Item | Requirement | Current State | Remediation Action for Implementer |
|---|---|---|---|
| **1. Site-Layer CSS** | Exact verbatim copy of `design-reference/styles.css` lines 115-751 (637 lines) | `src/styles/base.css` has manual edits and modified `@keyframes ez-flash` | Copy `scripts/site-layer.css` directly over `src/styles/base.css` without modification. |
| **2. Motion Audit Script** | `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` must exit 0 | Exits 1 with missing `ez-flash` | Restoring verbatim CSS resolves this immediately. |
| **3. Stylelint Config** | `npm run stylelint` must exit 0 | Fails if verbatim CSS is in `src/styles/base.css` due to strict color rules | Add `"src/styles/base.css"` (or `"src/styles/*.css"`) to `.stylelintrc.json` overrides. |
| **4. Google Fonts** | Load Geist (300-600) and Plex Sans Arabic (400-600), strictly no weight 700 | Missing from `<head>` / layout | Add Google Fonts `<link>` tags into `src/app/[locale]/layout.tsx`. |
| **5. Mock API Seams** | Unified `submitLead` in `src/lib/mock-api.ts` | Missing from `mock-api.ts`; ad-hoc inlined in components | Add `submitLead` export to `src/lib/mock-api.ts` and import across call sites. |
| **6. Site Wrapper Architecture** | `<Site>` mounted per page, not hoisted in layout (R3) | `<SiteLayout>` hoisted in `[locale]/layout.tsx` | Align with R3 specification prior to Step A1 page-by-page visual signoff. |
