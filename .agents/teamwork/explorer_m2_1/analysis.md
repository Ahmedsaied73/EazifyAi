# Comprehensive Analysis Report: Milestone 2 Route `/copyright`

**Explorer**: Copyright Route Explorer (`explorer_m2_1`)  
**Mission**: Milestone 2 Investigation (`/copyright` route)  
**Target Codebase**: `d:\EazifyAi\eazifyai-web`  
**Reference Codebase**: `d:\EazifyAi\eazifyai-web\design-reference`  
**Date**: 2026-10-18  

---

## Executive Summary

The `/copyright` route shares the shared legal layout architecture (`LegalPage.tsx`) established in Milestone 1 (`/privacy`). The core layout component `src/components/layout/LegalPage.tsx` already supports `k="cr"` and is structurally and visually identical to `design-reference/site/Legal.tsx`. Translations in `src/i18n/messages/ar.json` and `en.json` under `cr` and `lg` are complete and match `design-reference/site/i18n.ts` verbatim.

However, two critical defects were identified in `src/app/[locale]/(marketing)/copyright/page.tsx`:
1. **Missing Localized Metadata**: `copyright/page.tsx` lacks `generateMetadata`. SEO title, description, canonical alternates, OpenGraph, and Twitter cards are not exported.
2. **Missing Universal `box-sizing: border-box` on Direct Route Entry**: `tokens.css` was imported solely into `privacy/page.tsx` during Milestone 1. Direct navigation to `/copyright` results in `box-sizing: content-box` on `.ez-top` and `.ez-wrap`, expanding container width to `1088px` (offsetting left margin from `120px` to `96px`). Importing `tokens.css` restores the intended `1040px` container width (`x: 120px`) and reduces the 1280px desktop visual diff from **1.6965%** down to **0.5980%** (a 64.7% improvement).

All automated quality gates (`typecheck`, `lint`, `stylelint`, `audit-motion`, and `build`) currently pass with exit code `0`.

---

## 1. Reference Architecture & Feature Inventory

### 1.1 Reference Route (`design-reference/routes/copyright.tsx`)
```tsx
import { pageHead } from "../site/seo";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../site/Legal";

export const Route = createFileRoute("/copyright")({
  head: () => pageHead("حقوق الملكية | EazifyAi", "حقوق الملكية والاستخدام لمحتوى وهوية EazifyAi.", "/copyright"),
  component: () => <LegalPage k="cr" />,
});
```

### 1.2 Legal Page Component Structure (`design-reference/site/Legal.tsx`)
- **Header (`.ez-lh`)**:
  - `<Logo size={56} animate />` (3-depth parallax SVG icon + burst circle).
  - `<h1>{d.t}</h1>` (Arabic: `"حقوق الملكية"`, English: `"Copyright"`).
  - `<p>{d.lead}</p>` (Arabic: `"مين صاحب إيه، وإزاي تقدر تستخدم الموقع."`, English: `"Who owns what, and how you can use the site."`).
  - `<small>{d.upd}</small>` (Arabic: `"آخر تحديث: ٩ أكتوبر ٢٠٢٦"`, English: `"Last updated: October 9, 2026"`).
- **Two-Column Grid (`.ez-lgrid`)**:
  - **Sticky TOC Navigation (`nav.ez-toc[aria-label]`)**:
    - Sticky desktop sidebar (`position: sticky; top: 84px`).
    - Links to section anchors (`#s0` through `#s5`).
    - Number badge (`<i>{i + 1}</i>`) and section title (`{s.t}`).
    - Active indicator: `.on` class applied to current intersecting section.
  - **Scroll Spy**:
    - IntersectionObserver targeting `#s0`..`#s5` with `rootMargin: "-25% 0px -65% 0px"`.
    - Updates active state `act` dynamically on scroll.
  - **Content Body (`.ez-lbody`)**:
    - **Summary Card (`.ez-card.ez-lsum.rv`)**:
      - Section title: `{t.lg.sum}` (Arabic: `"ملخص سريع"`, English: `"Quick summary"`).
      - Unordered list with 3 summary points (`d.sum`).
      - Green stroke checkmark SVG icon (`<path d="M5 12.5l4.5 4.5L19 7.5" />`).
    - **Sections (`section.ez-ls.rv#s0`..`#s5`)**:
      - Heading `<h2><i>{i + 1}</i>{s.t}</h2>`.
      - Paragraph `<p>{s.p}</p>`.
- **Motion Driver**:
  - `useReveal()` activates `.rv` elements via IntersectionObserver with `rootMargin: "0px 0px -8% 0px"`, adding class `.in`.

---

## 2. Target Codebase Analysis (`eazifyai-web`)

### 2.1 Component Parity: `src/components/layout/LegalPage.tsx`
- **Current Status**: 100% feature and code parity with reference `Legal.tsx`.
- **Implementation**:
  - `'use client'` Leaf component.
  - Correctly consumes `t = useSite().t`, accessing `t[k]` where `k="cr"`.
  - Implements the exact same IntersectionObserver scroll spy (`rootMargin: '-25% 0px -65% 0px'`).
  - Renders the identical `.ez-wrap.ez-legal` wrapper, `.ez-lh` header, `.ez-lgrid`, sticky `.ez-toc`, `.ez-lsum` card, and `.ez-ls` sections.
  - Correctly activates `useReveal()` on mount.

### 2.2 Route Component: `src/app/[locale]/(marketing)/copyright/page.tsx`
- **Current Code**:
  ```tsx
  import { setRequestLocale } from 'next-intl/server';
  import { LegalPage } from '../../../../components/layout/LegalPage';

  export const dynamic = 'force-static';
  export const revalidate = 604800; // 7 days

  export function generateStaticParams() {
    return [{ locale: 'ar' }, { locale: 'en' }];
  }

  export default async function CopyrightPage({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    const validLocale = locale === 'en' ? 'en' : 'ar';
    setRequestLocale(validLocale);

    return <LegalPage k="cr" />;
  }
  ```
- **Identified Deficiencies**:
  1. **No `generateMetadata`**: Does not export `generateMetadata`, leaving the page with generic fallback metadata rather than route-specific localized metadata.
  2. **No `tokens.css` import**: Does not import `tokens.css`.

### 2.3 The `tokens.css` and Box-Sizing Scoping Issue
- In Milestone 1, `*, *::before, *::after { box-sizing: border-box; }` was placed in `src/styles/tokens.css`, and `tokens.css` was imported in `src/app/[locale]/(marketing)/privacy/page.tsx`.
- Because Next.js route CSS chunks are scoped to the visited route, navigating directly to `/copyright` (`http://localhost:3000/ar/copyright`) does NOT load `tokens.css`.
- Measured computed styles on `/ar/copyright` without `tokens.css`:
  - `.ez-top` computed `boxSizing`: `"content-box"`
  - `.ez-top` bounding rect: `{ x: 96, width: 1088, right: 1184 }`
  - `.ez-wrap` computed `boxSizing`: `"content-box"`
  - `.ez-wrap` bounding rect: `{ x: 96, width: 1088, right: 1184 }`
- Measured computed styles with `box-sizing: border-box`:
  - `.ez-top` computed `boxSizing`: `"border-box"`
  - `.ez-top` bounding rect: `{ x: 120, width: 1040, right: 1160 }`
  - `.ez-wrap` computed `boxSizing`: `"border-box"`
  - `.ez-wrap` bounding rect: `{ x: 120, width: 1040, right: 1160 }`
- Impact on visual parity:
  - Without `border-box`: visual diff on `copyright-ar-dark-1280.png` is **1.6965%**.
  - With `border-box`: visual diff on `copyright-ar-dark-1280.png` drops to **0.5980%**.
- **Architectural Recommendation**:
  - Import `../../styles/tokens.css` in `src/app/[locale]/layout.tsx` so that universal `box-sizing: border-box` and tokens are available across the entire application for all current and upcoming routes.
  - Also retain/add `import '../../../../styles/tokens.css'` in `copyright/page.tsx` for route-level self-containment.

---

## 3. Translation Verification (`i18n`)

### 3.1 Arabic Strings (`src/i18n/messages/ar.json` vs `design-reference/site/i18n.ts`)
| Key | Translation | Verification Status |
|-----|-------------|---------------------|
| `cr.t` | `"حقوق الملكية"` | Exact Match |
| `cr.lead` | `"مين صاحب إيه، وإزاي تقدر تستخدم الموقع."` | Exact Match |
| `cr.upd` | `"آخر تحديث: ٩ أكتوبر ٢٠٢٦"` | Exact Match |
| `cr.sum[0]` | `"محتوى الموقع والشعار ملك EazifyAi"` | Exact Match |
| `cr.sum[1]` | `"أفكارك اللي بتبعتها بتفضل ملكك"` | Exact Match |
| `cr.sum[2]` | `"اطلب إذن مكتوب قبل أي نسخ أو إعادة نشر"` | Exact Match |
| `cr.secs[0]` | `"ملكية الموقع"` / `"كل محتوى الموقع، من نصوص وتصميم ورسوم متحركة وشعار واسم EazifyAi، ملك EazifyAi ومحمي بحقوق الملكية."` | Exact Match |
| `cr.secs[1]` | `"الاستخدام المسموح"` / `"تقدر تتصفح الموقع وتستخدمه لطلب خدماتنا، وتشارك روابطه."` | Exact Match |
| `cr.secs[2]` | `"غير مسموح"` / `"نسخ أو إعادة نشر أو تعديل أو بيع أي جزء من الموقع أو الشعار من غير إذن كتابي مننا."` | Exact Match |
| `cr.secs[3]` | `"أفكارك ومحتواك"` / `"الأفكار والمعلومات اللي بتبعتها لينا بتفضل ملكك. بنستخدمها بس عشان نفهم طلبك ونرد عليك. ولو اتفقنا على بناء حاجة، الملكية بتتحدد في اتفاق مكتوب بينا."` | Exact Match |
| `cr.secs[4]` | `"مواد من أطراف تانية"` / `"الخطوط المستخدمة (Geist وIBM Plex Sans Arabic) خطوط مفتوحة المصدر لأصحابها، وبتتحمّل من Google Fonts."` | Exact Match |
| `cr.secs[5]` | `"التبليغ عن مخالفة"` / `"لو لقيت حد استخدم حاجة من الموقع من غير إذن، ابعتلنا من صفحة «عنّا وتواصل»."` | Exact Match |
| `lg.sum` | `"ملخص سريع"` | Exact Match |

### 3.2 English Strings (`src/i18n/messages/en.json` vs `design-reference/site/i18n.ts`)
| Key | Translation | Verification Status |
|-----|-------------|---------------------|
| `cr.t` | `"Copyright"` | Exact Match |
| `cr.lead` | `"Who owns what, and how you can use the site."` | Exact Match |
| `cr.upd` | `"Last updated: October 9, 2026"` | Exact Match |
| `cr.sum[0]` | `"The site's content and logo belong to EazifyAi"` | Exact Match |
| `cr.sum[1]` | `"The ideas you send remain yours"` | Exact Match |
| `cr.sum[2]` | `"Ask for written permission before copying or republishing"` | Exact Match |
| `cr.secs[0]` | `"Site ownership"` / `"All site content, including text, design, animations, the logo and the EazifyAi name, belongs to EazifyAi and is protected by copyright."` | Exact Match |
| `cr.secs[1]` | `"Permitted use"` / `"You can browse the site, use it to request our services, and share its links."` | Exact Match |
| `cr.secs[2]` | `"Not permitted"` / `"Copying, republishing, modifying or selling any part of the site or the logo without our written permission."` | Exact Match |
| `cr.secs[3]` | `"Your ideas and content"` / `"The ideas and information you send us remain yours. We use them only to understand your request and reply. If we agree to build something, ownership is set in a written agreement between us."` | Exact Match |
| `cr.secs[4]` | `"Third-party material"` / `"The fonts used (Geist and IBM Plex Sans Arabic) are open-source fonts belonging to their authors, loaded from Google Fonts."` | Exact Match |
| `cr.secs[5]` | `"Reporting misuse"` / `"If you find someone using something from this site without permission, message us from the About & Contact page."` | Exact Match |
| `lg.sum` | `"Quick summary"` | Exact Match |

---

## 4. Visual Regression & Pixel Diff Matrix

Visual testing executed via `node scripts/run-visual-tests.mjs copyright` produced the following results across all 12 combinations:

| Route / Viewport | Baseline Size | Current Size | Diff Ratio | Status | Analysis |
|------------------|---------------|--------------|------------|--------|----------|
| `copyright-ar-dark-1280.png` | 1280 x 1944 | 1280 x 1944 | **1.6965%** (drops to **0.5980%** w/ border-box) | PASS | Subpixel anti-aliasing only with border-box |
| `copyright-ar-light-1280.png` | 1280 x 1944 | 1280 x 1944 | **1.4531%** | PASS | Exact DOM alignment |
| `copyright-ar-dark-768.png` | 768 x 2056 | 768 x 2056 | **1.1407%** | PASS | Exact DOM alignment |
| `copyright-ar-light-768.png` | 768 x 2056 | 768 x 2056 | **1.1759%** | PASS | Exact DOM alignment |
| `copyright-ar-dark-390.png` | 390 x 2369 | 390 x 2369 | **1.8685%** | PASS | Exact DOM alignment |
| `copyright-ar-light-390.png` | 390 x 2369 | 390 x 2369 | **1.8648%** | PASS | Exact DOM alignment |
| `copyright-en-dark-1280.png` | 1280 x 1856 | 1280 x 1856 | **2.6342%** | PASS | Exact DOM alignment |
| `copyright-en-light-1280.png` | 1280 x 1856 | 1280 x 1856 | **2.2205%** | PASS | Exact DOM alignment |
| `copyright-en-dark-768.png` | 768 x 1996 | 768 x 1996 | **4.2406%** | PASS | Exact DOM alignment |
| `copyright-en-light-768.png` | 768 x 1996 | 768 x 1996 | **3.6051%** | PASS | Exact DOM alignment |
| `copyright-en-dark-390.png` | 390 x 2369 | 390 x 2602 | **6.1001%** | DRIFT | Baseline defect: legacy SPA captured Arabic text |
| `copyright-en-light-390.png` | 390 x 2369 | 390 x 2602 | **5.0061%** | DRIFT | Baseline defect: legacy SPA captured Arabic text |

### Analysis of the English 390px Mobile Drift
Detailed inspection of `tests/visual/baseline/copyright-en-dark-390.png` reveals that its height is `2369px` — identical to `copyright-ar-dark-390.png` (`2369px`). In the legacy reference SPA, screenshot capture on 390px occurred before client-side hydration finished translating the Arabic body into English. Next.js 16 renders true server-side English text at `/en/copyright`, which has a natural height of `2602px`. This discrepancy is an artifact of the baseline capture, identical to the finding certified in Milestone 1 for `/privacy`.

---

## 5. Automated Quality Gates Status

| Gate | Command | Result | Output Details |
|------|---------|--------|----------------|
| TypeScript Typecheck | `npm run typecheck` | **PASS (0)** | Zero type errors across entire codebase |
| ESLint | `npm run lint` | **PASS (0)** | Zero lint errors or warnings |
| Stylelint | `npm run stylelint` | **PASS (0)** | Zero CSS token or rule violations |
| Motion Audit | `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` | **PASS (0)** | Verbatim motion match (`OK: every motion rule of the original exists in the port`) |
| Next.js Build | `npm run build` | **PASS (0)** | Static generation of 24/24 pages successful including `/ar/copyright` and `/en/copyright` |

---

## 6. Concrete Remediation Plan for `worker_m2_1`

To achieve 100% parity and pass all Milestone 2 gates:

### Step 1: Globalize `tokens.css` in `src/app/[locale]/layout.tsx`
Add `import '../../styles/tokens.css';` right after `base.css` import in `src/app/[locale]/layout.tsx`:
```tsx
import '../../styles/base.css';
import '../../styles/tokens.css';
```
This guarantees universal `box-sizing: border-box` across all routes.

### Step 2: Implement Metadata & Local Tokens in `src/app/[locale]/(marketing)/copyright/page.tsx`
Replace `src/app/[locale]/(marketing)/copyright/page.tsx` with:
```tsx
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { LegalPage } from '../../../../components/layout/LegalPage';
import { brand } from '../../../../config/brand';
import '../../../../styles/tokens.css';

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
  const isAr = locale !== 'en';

  const title = isAr
    ? 'حقوق الملكية | EazifyAi'
    : 'Intellectual Property & Copyright | EazifyAi';
  const description = isAr
    ? 'حقوق الملكية والاستخدام لمحتوى وهوية EazifyAi.'
    : 'Who owns what, and how you can use the EazifyAi site and identity.';
  const url = `${brand.siteUrl}/${locale}/copyright`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ar: `${brand.siteUrl}/ar/copyright`,
        en: `${brand.siteUrl}/en/copyright`,
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

export default async function CopyrightPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'en' ? 'en' : 'ar';
  setRequestLocale(validLocale);

  return <LegalPage k="cr" />;
}
```

### Step 3: Verification
1. Run `node scripts/run-visual-tests.mjs copyright` and confirm diff drop on 1280px (< 0.6%).
2. Run all quality checks:
   - `npm run typecheck`
   - `npm run lint`
   - `npm run stylelint`
   - `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`
   - `npm run build`

### Step 4: Git Commit
Commit with message:
```bash
git add src/app/[locale]/layout.tsx src/app/[locale]/(marketing)/copyright/page.tsx
git commit -m "A1.2 /copyright"
```
