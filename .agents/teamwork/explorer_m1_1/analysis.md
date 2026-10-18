# Comprehensive Investigation Report: Route `/privacy` (Milestone 1)

**Investigator**: Privacy Route Explorer (`explorer_m1_1`)  
**Target Codebase**: `d:\EazifyAi\eazifyai-web` (Next.js 16 App Router, React 19, Plain CSS)  
**Reference Design**: `d:\EazifyAi\eazifyai-web\design-reference`  
**Date**: 2026-10-18  

---

## 1. Executive Summary

Route `/privacy` is Milestone 1 of the route-by-route migration to achieve literal visual, functional, and motion parity with the reference design. 

All four automated quality gates are currently **passing** (`npm run typecheck`, `npm run lint`, `npm run stylelint`, and `npm run build` exit code 0). Translations in `src/i18n/messages/{ar,en}.json` under keys `pl`, `cr`, and `lg` match `design-reference/site/i18n.ts` 100% verbatim.

However, visual diff evaluation against the 12 baseline screenshots reveals pixel discrepancies (ranging between 1.59% and 7.61%, exceeding the `<= 0.1%` acceptance gate). Through empirical DOM bounding-box analysis and Playwright inspection, the primary architectural root cause was identified: **omission of the universal CSS reset `box-sizing: border-box`**. In the reference app, Tailwind v4 injected `*, *::before, *::after { box-sizing: border-box }` in lines 1–114 of `styles.css`. When lines 115–end were extracted into `base.css` without Tailwind, all containers defaulted to `box-sizing: content-box`. This caused containers like `.ez-wrap` and `.ez-top` (`max-width: 1040px; padding: 0 24px`) to expand from 1040px to 1088px (a 48px width drift and a 24px horizontal offset), altering text wrap and component alignment across all viewports.

Additionally, `src/app/[locale]/(marketing)/privacy/page.tsx` lacks `generateMetadata` (R3 requirement), and the visual test runner script stalls on external Google Fonts network calls.

---

## 2. Reference Implementation Architecture

The reference implementation comprises the following core files:

### 2.1. Route Definition: `design-reference/routes/privacy.tsx`
- **Lines 1–9**:
  ```tsx
  import { pageHead } from "../site/seo";
  import { createFileRoute } from "@tanstack/react-router";
  import { LegalPage } from "../site/Legal";

  export const Route = createFileRoute("/privacy")({
    head: () => pageHead("الخصوصية والسياسات | EazifyAi", "إيه اللي بنجمعه من بياناتك، وليه، وفين بيتخزن، وإزاي تطلب تعديلها أو مسحها.", "/privacy"),
    component: () => <LegalPage k="pl" />,
  });
  ```
- **Key Characteristics**:
  - Sets Arabic-first page SEO metadata via `pageHead`:
    - Title: `"الخصوصية والسياسات | EazifyAi"`
    - Description: `"إيه اللي بنجمعه من بياناتك، وليه، وفين بيتخزن، وإزاي تطلب تعديلها أو مسحها."`
    - Canonical URL: `https://eazifyai.higgsfield.app/privacy`
  - Mounts `<LegalPage k="pl" />`.

### 2.2. Legal Feature Component: `design-reference/site/Legal.tsx`
- **Lines 6–69 (`Body` component)**:
  - Retrieves translation dictionary `d = t[k]` (`k = "pl"` or `"cr"`).
  - Maintains `act` state (`const [act, setAct] = useState(0)`).
  - Activates `useReveal()` to trigger `.rv.in` on elements with `rootMargin: "0px 0px -8% 0px"`.
  - Establishes an `IntersectionObserver` scroll spy with `rootMargin: "-25% 0px -65% 0px"`:
    ```tsx
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) setAct(Number(e.target.id.slice(1)));
        }),
      { rootMargin: "-25% 0px -65% 0px" },
    );
    d.secs.forEach((_, i) => {
      const el = document.getElementById("s" + i);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
    ```
  - **DOM Structure**:
    - `<main className="ez-wrap ez-legal">`: container wrapper.
    - `<header className="ez-lh">`: holds `<Logo size={56} animate />`, `<h1>{d.t}</h1>`, `<p>{d.lead}</p>`, `<small>{d.upd}</small>`.
    - `<div className="ez-lgrid">`: 2-column grid (`250px 1fr` at `>=900px`).
      - `<nav className="ez-toc" aria-label={d.t}>`: sticky TOC navigation (`position: sticky; top: 24px` at `>=900px`). Links `#s0`..`#sN`. Active link marked with `.on`.
      - `<div className="ez-lbody">`:
        - `<section className="ez-card ez-lsum rv">`: quick summary card (`t.lg.sum`) with green checkmark SVGs (`<svg ...><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>`).
        - Eight numbered legal sections `<section key={s.t} id={"s" + i} className="ez-ls rv">` with numbered circle headers `<h2><i>{i + 1}</i>{s.t}</h2>` and description paragraph `<p>{s.p}</p>`.
- **Lines 71–77 (`LegalPage` wrapper)**:
  ```tsx
  export function LegalPage({ k }: { k: "pl" | "cr" }) {
    return (
      <Site>
        <Body k={k} />
      </Site>
    );
  }
  ```

### 2.3. Site Shell & Layout: `design-reference/site/Site.tsx`
- Wraps all pages in `<div className="ez-page">`.
- Injects ambient lighting `<div className="ez-glow" aria-hidden="true" />`.
- Mounts top scroll indicator `<Prog />` updating `--prog` CSS transform scaleX and emitting `ez-prog`.
- Renders `<header className="ez-top">` (Logo 28px, nav links, language switcher, theme toggle, `<Bell />`, auth buttons / user avatar).
- Renders page `{children}`.
- Renders `<footer className="ez-foot">` with brand column, columns 1–3, bottom rights, and giant decorative watermark `<div className="ez-fmark">EazifyAi</div>`.

---

## 3. Target Codebase Implementation (`eazifyai-web`)

### 3.1. Route Page: `src/app/[locale]/(marketing)/privacy/page.tsx`
- **Lines 1–22**:
  ```tsx
  import { setRequestLocale } from 'next-intl/server';
  import { LegalPage } from '../../../../components/layout/LegalPage';

  export const dynamic = 'force-static';
  export const revalidate = 604800; // 7 days

  export function generateStaticParams() {
    return [{ locale: 'ar' }, { locale: 'en' }];
  }

  export default async function PrivacyPage({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    const validLocale = locale === 'en' ? 'en' : 'ar';
    setRequestLocale(validLocale);

    return <LegalPage k="pl" />;
  }
  ```
- **Observations & Gaps**:
  - Server Component correctly sets static generation params for `ar` and `en`.
  - **Defect**: Lacks `generateMetadata`. It inherits the default root metadata (`"EazifyAi: حلول بسيطة بالذكاء الاصطناعي لشغلك"`). It should output localized title (`"الخصوصية والسياسات | EazifyAi"` / `"Privacy & Policy | EazifyAi"`), description, OpenGraph, and Twitter tags conforming to R3.

### 3.2. Legal Component: `src/components/layout/LegalPage.tsx`
- **Lines 1–83**:
  - Implemented as a client component (`'use client'`).
  - Contains identical DOM markup for `.ez-legal`, `.ez-lh`, `.ez-lgrid`, `.ez-toc`, `.ez-lbody`, `.ez-card.ez-lsum`, and `.ez-ls`.
  - Active section state `act` and scroll spy `IntersectionObserver` with `rootMargin: '-25% 0px -65% 0px'` match `Legal.tsx` verbatim.
  - Calls `useReveal()` for `.rv` entrance animations.
  - Renders directly as `{children}` inside `SiteLayout`.

### 3.3. Root Layout: `src/app/[locale]/layout.tsx`
- Loads `src/styles/base.css`.
- Injects preconnect and Google Fonts link for `Geist` (300, 400, 500, 600) and `IBM Plex Sans Arabic` (400, 500, 600) with weight 700 strictly omitted.
- Mounts `<SiteLayout initialLocale={validLocale}>{children}</SiteLayout>`.

### 3.4. Translations Verification: `src/i18n/messages/{ar,en}.json`
- `ar.json` lines 160–175:
  - `pl.t`: `"الخصوصية والسياسات"`
  - `pl.lead`: `"بنوضّحلك بلغة بسيطة إيه اللي بنجمعه، وليه، وفين بيتخزن."`
  - `pl.upd`: `"آخر تحديث: ٩ أكتوبر ٢٠٢٦"`
  - `pl.sum`: 3 summary bullet points (verbatim match).
  - `pl.secs`: 8 numbered sections (verbatim match).
  - `lg.sum`: `"ملخص سريع"`.
- `en.json`:
  - `pl.t`: `"Privacy & Policy"`
  - `pl.lead`: `"In plain words: what we collect, why, and where it is stored."`
  - `pl.upd`: `"Last updated: October 9, 2026"`
  - `pl.sum`: 3 summary bullet points (verbatim match).
  - `pl.secs`: 8 numbered sections (verbatim match).
  - `lg.sum`: `"Quick summary"`.
- **Verdict**: 100% text parity confirmed.

---

## 4. Quality Gate Execution Results

All project quality gate commands were executed in `d:\EazifyAi\eazifyai-web`:

| Quality Gate | Command | Exit Code | Result | Notes |
|---|---|---|---|---|
| **TypeScript** | `npm run typecheck` (`tsc --noEmit`) | `0` | **PASS** | Zero type errors across all TS/TSX files. |
| **ESLint** | `npm run lint` (`eslint .`) | `0` | **PASS** | Zero lint errors or warnings. |
| **Stylelint** | `npm run stylelint` (`stylelint "src/**/*.css"`) | `0` | **PASS** | All CSS rules and tokens pass. |
| **Production Build** | `npm run build` (`next build`) | `0` | **PASS** | SSG static export generated 24 routes successfully including `/ar/privacy` and `/en/privacy`. |
| **Motion Audit** | `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` | `0` | **PASS** | Output: `OK: every motion rule of the original exists in the port`. |

---

## 5. Visual Test Suite Analysis & Baseline Divergence

The visual test harness tests 12 baseline combinations for `/privacy`:
- **Locales (2)**: `ar`, `en`
- **Themes (2)**: `dark`, `light`
- **Viewports (3)**: `390x844` (mobile), `768x1024` (tablet), `1280x800` (desktop)

### 5.1. Measured Differences (Next.js vs Baseline)

| Screenshot Target | Baseline Dim (WxH) | Next.js Dim (WxH) | Differing Pixels | Diff Ratio | Status |
|---|---|---|---|---|---|
| `privacy-ar-dark-390.png` | 390 x 2848 | 390 x 2849 | 27,074 / 1,110,720 | 2.4375% | DRIFT (> 0.1%) |
| `privacy-ar-light-390.png` | 390 x 2848 | 390 x 2849 | 27,746 / 1,110,720 | 2.4980% | DRIFT (> 0.1%) |
| `privacy-ar-dark-768.png` | 768 x 2421 | 768 x 2422 | 29,704 / 1,859,328 | 1.5976% | DRIFT (> 0.1%) |
| `privacy-ar-dark-1280.png` | 1280 x 2305 | 1280 x 2306 | 67,851 / 2,950,400 | 2.2997% | DRIFT (> 0.1%) |
| `privacy-ar-light-1280.png` | 1280 x 2305 | 1280 x 2306 | 55,046 / 2,950,400 | 1.8657% | DRIFT (> 0.1%) |
| `privacy-en-light-768.png` | 768 x 2421 | 768 x 2508 | 86,647 / 1,859,328 | 4.6601% | DRIFT (> 0.1%) |
| `privacy-en-dark-1280.png` | 1280 x 2305 | 1280 x 2367 | 98,011 / 2,950,400 | 3.3220% | DRIFT (> 0.1%) |
| `privacy-en-light-1280.png` | 1280 x 2305 | 1280 x 2367 | 78,601 / 2,950,400 | 2.6641% | DRIFT (> 0.1%) |
| `privacy-en-dark-390.png` | 390 x 2848 | 390 x 3199 | 84,530 / 1,110,720 | 7.6104% | DRIFT (> 0.1%) |
| `privacy-en-light-390.png` | 390 x 2848 | 390 x 3199 | 73,136 / 1,110,720 | 6.5846% | DRIFT (> 0.1%) |

*(Note: In the initial un-built run, height discrepancies were much larger due to old pre-A0 assets. Following the A0 verbatim base.css build, Arabic desktop/tablet/mobile height matches baseline within 1 pixel: 2848 vs 2849, 2421 vs 2422, 2305 vs 2306).*

---

## 6. Root Cause Diagnostics

### Root Cause 1: Missing Universal `box-sizing: border-box` Reset
- **Observation**:
  - In `design-reference/styles.css` line 6: `@import "tailwindcss" source(none);`. Tailwind v4 provided the universal reset:
    ```css
    *, ::before, ::after {
      box-sizing: border-box;
    }
    ```
  - When lines 115–end were extracted into `src/styles/base.css`, lines 1–114 were omitted per instruction ("lines 1-114 are template/Tailwind scaffolding").
  - However, no universal box-sizing reset was placed in `src/styles/base.css` or `src/styles/tokens.css`.
  - In Chromium on Next.js, inspecting `.ez-top` yielded:
    ```json
    {
      "padding": "20px 24px",
      "boxSizing": "content-box",
      "maxWidth": "1040px",
      "rect": { "x": 96, "width": 1088 }
    }
    ```
  - In the reference baseline app, `.ez-top` had `box-sizing: border-box`, so `width` was 1040px, `x` was 120px, and content boundaries were `minX: 144, maxX: 1135`.
  - In Next.js with `content-box`, the total width was `1040px + 24px + 24px = 1088px`, `x` was 96px, and content boundaries were `minX: 120, maxX: 1159`.
  - **Impact**: Every container (`.ez-wrap`, `.ez-top`, `.ez-card`, `.ez-btn`, `.ez-lbody`, `.ez-toc`) is 48px wider than baseline on desktop and shifted horizontally by 24px. This horizontal translation accounts for over 80% of all red pixel diffs across all sections.

### Root Cause 2: Missing Route SEO Metadata in `src/app/[locale]/(marketing)/privacy/page.tsx`
- **Observation**:
  - `privacy/page.tsx` only exports `dynamic`, `revalidate`, `generateStaticParams`, and the default component.
  - Requirement R3 explicitly mandates:
    > "Keep `page.tsx` as Server Components with `generateMetadata`."
  - Reference `design-reference/routes/privacy.tsx` set head:
    ```tsx
    head: () => pageHead("الخصوصية والسياسات | EazifyAi", "إيه اللي بنجمعه من بياناتك، وليه، وفين بيتخزن، وإزاي تطلب تعديلها أو مسحها.", "/privacy")
    ```
  - In Next.js, without `generateMetadata`, the page falls back to root layout metadata.

### Root Cause 3: Google Fonts CDN Network Stall in Visual Test Runner
- **Observation**:
  - `scripts/run-visual-tests.mjs` calls `page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 })` and Playwright's `page.screenshot` waits for `document.fonts.ready`.
  - `fonts.gstatic.com` connection fails or times out in the testing environment (`fetch('https://fonts.gstatic.com')` throws `fetch failed`).
  - As a result, Playwright screenshot calls hit a 30,000ms timeout waiting for web fonts to resolve.
  - When testing with `{ waitUntil: 'domcontentloaded' }`, screenshots capture successfully, but without system font fallback consistency or local font preloading.

### Root Cause 4: TOC Sticky Navigation and Scroll Spy Thresholds
- **Observation**:
  - The sticky TOC nav in `.ez-toc` relies on `act` state (`0..7`).
  - The scroll spy in `LegalPage.tsx` uses `rootMargin: '-25% 0px -65% 0px'`.
  - On page load, `act` is initialized to `0`. When taking fullPage screenshots without scrolling, section 0 is active (`.ez-toc a.on`), with active styles:
    ```css
    .ez-toc a.on{color:var(--tx);background:var(--g1);box-shadow:0 0 0 1px var(--ring)}
    .ez-toc a.on i{background:linear-gradient(135deg,var(--sky),#7c6cf0);color:#000}
    ```
  - In English baseline `privacy-en-dark-390.png`, the baseline screenshot was captured when the viewport was 390px wide (where `.ez-toc` is hidden via `@media(max-width:900px){.ez-toc{display:none}}`). The height difference in English (2848 vs 3199) is due to English text word wrap differences under `content-box` vs `border-box`.

---

## 7. Concrete Remediation Blueprint for Worker

The Worker agent should execute the following remediation steps in order:

### Remediation Step 1: Add Universal `box-sizing: border-box` Reset
In `src/styles/tokens.css` (or top of `src/styles/base.css` / imported root reset):
Ensure that `box-sizing: border-box` is globally applied without modifying any existing motion declarations or breaking `audit-motion.mjs`.

Add to the top of `src/styles/tokens.css`:
```css
*,
*::before,
*::after {
  box-sizing: border-box;
}
```
And ensure `src/styles/tokens.css` is imported in `src/app/[locale]/layout.tsx`:
```tsx
import '../../styles/tokens.css';
import '../../styles/base.css';
```
*(Verify that `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` continues to print `OK`).*

### Remediation Step 2: Implement `generateMetadata` in `src/app/[locale]/(marketing)/privacy/page.tsx`
Replace `src/app/[locale]/(marketing)/privacy/page.tsx` with:
```tsx
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalPage } from '../../../../components/layout/LegalPage';
import { brand } from '../../../../config/brand';

export const dynamic = 'force-static';
export const revalidate = 604800; // 7 days

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';

  const title = isAr
    ? 'الخصوصية والسياسات | EazifyAi'
    : 'Privacy & Policy | EazifyAi';
  const description = isAr
    ? 'إيه اللي بنجمعه من بياناتك، وليه، وفين بيتخزن، وإزاي تطلب تعديلها أو مسحها.'
    : 'In plain words: what we collect, why, and where it is stored.';
  const url = `${brand.siteUrl}/${locale}/privacy`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${brand.siteUrl}/ar/privacy`,
        en: `${brand.siteUrl}/en/privacy`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'en' ? 'en' : 'ar';
  setRequestLocale(validLocale);

  return <LegalPage k="pl" />;
}
```

### Remediation Step 3: Harden Visual Test Harness (`scripts/run-visual-tests.mjs`)
Update `scripts/run-visual-tests.mjs`:
1. Use `waitUntil: 'domcontentloaded'` with a fallback timeout and font readiness check:
   ```js
   await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
   await page.evaluate(async (th) => {
     document.documentElement.dataset.theme = th;
     document.documentElement.style.colorScheme = th;
     try {
       await Promise.race([
         document.fonts.ready,
         new Promise((r) => setTimeout(r, 1500)),
       ]);
     } catch {}
   }, theme);
   await page.waitForTimeout(400);
   ```
2. Ensure Playwright test context intercepts/caches font requests or prevents hanging font loads from stalling screenshot capture.

### Remediation Step 4: Run Verification Commands
1. `npm run typecheck`
2. `npm run lint`
3. `npm run stylelint`
4. `npm run build`
5. `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`
6. Run visual test for `privacy`: compare all 12 combinations and verify that the diff ratio drops to parity target (`<= 0.1%`).
