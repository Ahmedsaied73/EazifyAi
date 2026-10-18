# Technical Remediation Analysis: Fonts and Root Layout (Milestone 0 / Step A0 Foundation)

**Author:** Typography & Layout Specialist (`explorer_m0_2`)  
**Target File:** `d:\EazifyAi\eazifyai-web\src\app\[locale]\layout.tsx`  
**Date:** 2026-10-18  

---

## 1. Executive Summary

`src/app/[locale]/layout.tsx` currently lacks an HTML `<head>` tag and contains no Google Fonts preconnect or stylesheet links, forcing browsers to render system fallback fonts and risking substantial visual regression across all routes. To satisfy Milestone 0 (Step A0 Foundation) and match `design-reference/routes/__root.tsx` verbatim, `<head>` must be injected with preconnect links to `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (`crossOrigin="anonymous"`), along with the exact Google Fonts stylesheet for **Geist** (300, 400, 500, 600) and **IBM Plex Sans Arabic** (400, 500, 600). Weight 700 must be strictly omitted because `.ez-fmark` relies on browser fallback to weight 600 to maintain pixel parity with baseline screenshots.

---

## 2. Google Fonts Link Injection Analysis

### 2.1 Current State
In `src/app/[locale]/layout.tsx`, the JSX output is currently:
```tsx
return (
  <html
    lang={validLocale}
    dir={dir}
    data-theme="dark"
    style={{ colorScheme: 'dark' }}
    suppressHydrationWarning
  >
    <body>
      <SiteLayout initialLocale={validLocale}>{children}</SiteLayout>
    </body>
  </html>
);
```
No `<head>` element exists, and neither preconnect links nor the Google Fonts stylesheet link are present in the layout or metadata.

### 2.2 Reference Implementation Parity
In `design-reference/routes/__root.tsx` (lines 98–104) and `docs/DESIGN_PORT.md` (lines 90–114):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">
```

### 2.3 Exact Links & Attributes Specification
The following three tags must be injected into `<head>`:

1. **API Origin Preconnect:**
   ```tsx
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   ```
   *Rationale:* Establishes early DNS resolution, TCP handshake, and TLS negotiation to the CSS endpoint, reducing initial round-trip latency.

2. **Static Asset Origin Preconnect (with CORS):**
   ```tsx
   <link
     rel="preconnect"
     href="https://fonts.gstatic.com"
     crossOrigin="anonymous"
   />
   ```
   *Rationale:* Font binary files (`.woff2`) are loaded from `fonts.gstatic.com` via anonymous CORS requests per the W3C CSS Fonts specification. Setting `crossOrigin="anonymous"` in JSX ensures the preconnected TCP/TLS socket is matched to the subsequent font fetch. Omitting `crossOrigin` would cause the preconnected socket to be discarded by the browser, resulting in a redundant connection penalty.

3. **Google Fonts Stylesheet Link:**
   ```tsx
   <link
     rel="stylesheet"
     href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"
   />
   ```

### 2.4 Why Weight 700 Is Strictly Prohibited
An exhaustive audit of `src/styles/base.css` and `design-reference` reveals:
- **Weight 300:** Used specifically by `.ez-wm` (the brand wordmark on `/brand`).
- **Weight 400:** Standard body copy, navigation, and paragraphs across both Latin and Arabic scripts.
- **Weight 500:** Medium accents, table headers (`.ez-tbl th`, `.ez-wide th`), and pills (`.ez-pill`).
- **Weight 600:** Primary headings (`h1`, `.ez-h2`, `h3`, `h4`), buttons (`.ez-btn`, `.ez-go`), and brand logo (`.ez-logo`).
- **Weight 700:** Declared only once in `src/styles/base.css` at line 529:
  ```css
  .ez-fmark{font-size:clamp(3.5rem,19vw,13rem);font-weight:700;letter-spacing:-.05em;line-height:.85;text-align:center;direction:ltr;color:var(--tx);opacity:.045;user-select:none;white-space:nowrap;margin-top:32px;transform:translateY(18%)}
  ```
- **Browser Font Matching Behavior:** When CSS specifies `font-weight: 700` and weight 700 is not loaded in `@font-face`, the browser CSS Font Matching Algorithm falls back to the nearest available weight, selecting weight 600.
- **Regression Impact:** The baseline screenshots in `tests/visual/baseline` were captured from the reference app where weight 700 was not loaded. If weight 700 is added to the Google Fonts link, `.ez-fmark` renders with substantially bolder glyph strokes and different kerning, causing visual diff failures exceeding the `<= 0.1%` tolerance threshold.
- **Live Upstream Verification:** Querying `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap` confirms that Google Fonts returns `@font-face` rules for Geist at weights 300, 400, 500, 600 and IBM Plex Sans Arabic at weights 400, 500, 600, with no 700 rules included.

---

## 3. HTML Structure & Hydration Invariance

### 3.1 Layout Tree Architecture
```text
RootLayout (src/app/[locale]/layout.tsx) [Server Component]
├── html [lang={validLocale}, dir={dir}, data-theme="dark", style={{ colorScheme: 'dark' }}, suppressHydrationWarning]
│   ├── head
│   │   ├── <link rel="preconnect" href="https://fonts.googleapis.com" />
│   │   ├── <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
│   │   ├── <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" />
│   │   └── Next.js Metadata (meta charset, viewport, icons, title, description) [auto-injected]
│   └── body
│       └── SiteLayout (src/components/layout/SiteLayout.tsx) [Client Component]
│           └── SiteContext.Provider
│               └── div.ez-page
│                   ├── div.ez-glow
│                   ├── Prog (.ez-prog scroll indicator)
│                   ├── header.ez-top (Logo, Nav links, Lang toggle, Theme toggle, Bell, Auth/Profile)
│                   ├── {children} (Page Content)
│                   └── footer.ez-foot (Footer cols, rights, .ez-fmark)
```

### 3.2 HTML Attribute Guarantees
1. `lang={validLocale}`:
   - Validated server-side via `const validLocale = locale === 'en' ? 'en' : 'ar';`.
   - Guarantees valid ISO 639-1 language code.
   - Activates CSS language rules in `base.css`:
     - `:lang(ar) .ez-hero h1 { letter-spacing: 0; line-height: 1.35; }`
     - `:lang(ar) .ez-h2 { letter-spacing: 0; }`
     - `:lang(ar) .ez-abhero h1 { letter-spacing: 0; }`
     - `:lang(en) .ez-first h1 { letter-spacing: -.03em; line-height: 1.15; }`
2. `dir={dir}`:
   - Derived as `const dir = validLocale === 'ar' ? 'rtl' : 'ltr';`.
   - Directly establishes document layout direction for bidirectional text and flex/grid alignment.
3. `data-theme="dark"` & `style={{ colorScheme: 'dark' }}`:
   - Provides consistent dark-mode SSR baseline matching `:root, [data-theme="dark"]`.
   - Prevents unstyled white flash during initial page load.
4. `suppressHydrationWarning`:
   - Necessary on `<html>` because `SiteLayout` checks `localStorage.getItem('ez-theme')` upon mount and updates `document.documentElement.dataset.theme` and `style.colorScheme` if the user previously selected `'light'`.
   - Prevents React 19 hydration mismatch warnings on the `<html>` node.

### 3.3 Zero Hydration Regression Verification
- The initial render in `SiteLayout.tsx` initializes state as:
  - `lang`: `useState<Lang>(initialLocale)` (matches SSR `validLocale`)
  - `theme`: `useState<Theme>('dark')` (matches SSR `data-theme="dark"`)
  - `user`: `useState<User | null>(null)` (matches SSR anonymous render)
- All client-side updates (`localStorage` reads, Supabase session checks) execute exclusively inside `useEffect` callbacks, which run after hydration completes.
- Adding `<head>` containing static `<link>` elements does not alter client component reconciliation. Next.js App Router seamlessly merges the layout's `<head>` children with its internally generated metadata elements.

---

## 4. Remediation Implementation Specification

### 4.1 Target File
`d:\EazifyAi\eazifyai-web\src\app\[locale]\layout.tsx`

### 4.2 Exact Code Unified Diff
```diff
--- a/src/app/[locale]/layout.tsx
+++ b/src/app/[locale]/layout.tsx
@@ -41,6 +41,16 @@ export default async function RootLayout({
       style={{ colorScheme: 'dark' }}
       suppressHydrationWarning
     >
+      <head>
+        <link rel="preconnect" href="https://fonts.googleapis.com" />
+        <link
+          rel="preconnect"
+          href="https://fonts.gstatic.com"
+          crossOrigin="anonymous"
+        />
+        <link
+          rel="stylesheet"
+          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"
+        />
+      </head>
       <body>
         <SiteLayout initialLocale={validLocale}>{children}</SiteLayout>
       </body>
```

### 4.3 Complete Proposed File Content
```tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../../styles/base.css';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { brand } from '../../config/brand';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'EazifyAi: حلول بسيطة بالذكاء الاصطناعي لشغلك',
  description:
    'بنبني برامج بسيطة بالذكاء الاصطناعي لأصحاب الأنشطة الصغيرة: المدرسين، المخازن، المحلات، وأي شغل شخصي.',
  metadataBase: new URL(brand.siteUrl),
  icons: {
    icon: '/favicon.svg',
  },
};

export function generateStaticParams() {
  return [{ locale: 'ar' }, { locale: 'en' }];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === 'en' ? 'en' : 'ar';
  setRequestLocale(validLocale);
  const dir = validLocale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={validLocale}
      dir={dir}
      data-theme="dark"
      style={{ colorScheme: 'dark' }}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <SiteLayout initialLocale={validLocale}>{children}</SiteLayout>
      </body>
    </html>
  );
}
```

---

## 5. Verification Method

To verify the implementation once applied by the Worker agent:

1. **TypeScript Compilation:**
   ```bash
   npm run typecheck
   ```
   *Expected outcome:* Exit code 0, zero type diagnostics.

2. **ESLint Verification:**
   ```bash
   npm run lint
   ```
   *Expected outcome:* Exit code 0, zero lint errors or warnings.

3. **Production Build:**
   ```bash
   npm run build
   ```
   *Expected outcome:* Exit code 0, static pages `/ar` and `/en` generated cleanly.

4. **Rendered HTML Tag Verification:**
   Inspect the server-rendered HTML for route `/ar` (e.g. via `curl` or Playwright page source):
   - Verify `<link rel="preconnect" href="https://fonts.googleapis.com">` is present in `<head>`.
   - Verify `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">` (or `crossorigin`) is present in `<head>`.
   - Verify `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">` is present in `<head>`.
   - Confirm weight `700` is strictly absent from the query string.
