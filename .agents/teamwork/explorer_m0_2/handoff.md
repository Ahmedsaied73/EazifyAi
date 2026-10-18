# Handoff Report: Milestone 0 (Step A0 Foundation) Fonts & Root Layout

**Author:** Typography & Layout Specialist (`explorer_m0_2`)  
**Target:** Parent Orchestrator (`cc29a969-b977-43dc-9cdf-00980e2ddb74`) / Milestone 0 Workers  
**Report Type:** Hard Handoff (Investigation Complete)  
**Date:** 2026-10-18  

---

## 1. Observation

1. **`src/app/[locale]/layout.tsx` (lines 34–46):**
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
   Direct observation: There is no `<head>` element rendered, and no Google Fonts `<link>` or `<link rel="preconnect">` tags exist in this layout.

2. **Reference Implementation `design-reference/routes/__root.tsx` (lines 98–104):**
   ```tsx
   links: [
     { rel: "preconnect", href: "https://fonts.googleapis.com" },
     { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
     { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" },
     { rel: "stylesheet", href: appCss },
     ...(favicon ? [{ rel: "icon", href: favicon }] : []),
   ],
   ```

3. **`docs/DESIGN_PORT.md` (lines 90–112):**
   ```text
   ## 3. Fonts (exactly as the original loads them)
   Original __root.tsx head:
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">
   ...
   Gotchas that change pixels if you "fix" them:
   1. Weight 700 is requested but never loaded. .ez-fmark (the huge faint "EazifyAi" in the footer) sets font-weight:700. Because 700 is not loaded the browser draws 600. Keep loading 300/400/500/600 only. Do not add 700.
   ```

4. **Font Weight Usage in `src/styles/base.css`:**
   - Line 5: `body { font-family: "Geist","IBM Plex Sans Arabic",system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif; ... }`
   - Line 529: `.ez-fmark{font-size:clamp(3.5rem,19vw,13rem);font-weight:700;letter-spacing:-.05em;line-height:.85;text-align:center;direction:ltr;color:var(--tx);opacity:.045;user-select:none;white-space:nowrap;margin-top:32px;transform:translateY(18%)}`
   - Line 545: `.ez-wm{font-size:2.25rem;font-weight:300;letter-spacing:-.02em;direction:ltr;line-height:1}`
   - Weights across all other elements: 400 (body), 500 (`.ez-tbl th`, `.ez-wide th`, `.ez-pill`), 600 (`h1`, `.ez-h2`, `.ez-btn`, `.ez-go`, `.ez-logo`).

5. **Upstream Google Fonts Endpoint Verification:**
   Executed:
   ```powershell
   Invoke-RestMethod -Uri "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" -Headers @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" }
   ```
   Result: HTTP 200 OK. Contains `@font-face` definitions for Geist (weights 300, 400, 500, 600) and IBM Plex Sans Arabic (weights 400, 500, 600). Weight 700 is absent.

6. **Current Repository Quality Checks:**
   - `npm run typecheck`: Exit code 0 (clean).
   - `npm run lint`: Exit code 0 (clean).
   - `npm run stylelint`: Exit code 0 (clean).

---

## 2. Logic Chain

1. **Missing Web Font Links Cause Visual Regressions:**
   - From Observation 1, `src/app/[locale]/layout.tsx` does not inject Google Fonts links.
   - From Observation 4, `src/styles/base.css` specifies `"Geist", "IBM Plex Sans Arabic"` as the primary fonts.
   - Without Google Fonts links, the browser uses system fallback fonts (`system-ui`, `-apple-system`, `Tahoma`), altering line heights, glyph metrics, and kerning. This will cause failures in the visual parity test suite (`tests/visual/`) which has a `<= 0.1%` tolerance against the reference baselines.

2. **Preconnect Optimization with CORS Requirement:**
   - From Observation 2, the reference design uses preconnect to `https://fonts.googleapis.com` and `https://fonts.gstatic.com`.
   - From W3C CSS Fonts specification, `@font-face` binary fetches from `fonts.gstatic.com` require CORS. Therefore, `<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />` is mandatory to avoid redundant TCP/TLS handshakes.

3. **Strict Omission of Weight 700 Preserves Pixel Parity:**
   - From Observation 3 & 4, `.ez-fmark` is the sole CSS selector specifying `font-weight: 700`.
   - In the reference application, weight 700 was not included in the Google Fonts request URL; the browser's font matching algorithm synthesized/rendered it at weight 600.
   - If weight 700 were added, `.ez-fmark` would render with visibly heavier strokes, violating the `<= 0.1%` visual parity criterion against `tests/visual/baseline`.
   - Therefore, the font URL must remain strictly:
     `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap`

4. **Hydration and HTML Structure Invariance:**
   - From Observation 1, `layout.tsx` is a Server Component with `lang={validLocale}`, `dir={dir}`, `data-theme="dark"`, `style={{ colorScheme: 'dark' }}`, and `suppressHydrationWarning`.
   - Adding a `<head>` element with static `<link>` elements is standard in Next.js 16 App Router and does not cause hydration mismatches because these tags are static and merged server-side with Next.js metadata.
   - `SiteLayout` initializes its client state using `initialLocale={validLocale}`, `theme='dark'`, and `user=null`, exactly matching the server render. Dynamic client state synchronization occurs strictly inside `useEffect` post-hydration.

---

## 3. Caveats

1. **Step A vs Step B Scope:**
   This remediation is scoped strictly for Milestone 0 / Step A (literal `<link>` tag injection in `<head>`). Migration to `next/font/google` is deferred to Step B per `docs/DESIGN_PORT.md` section 3 and should only be evaluated after complete visual test parity is established.
2. **Motion Audit Script Dependency:**
   `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` currently reports missing `@keyframes ez-flash`. This is an independent task for Feature F0.1/F0.2 and does not affect the layout or font link implementation.
3. **No other caveats.**

---

## 4. Conclusion

The exact technical remediation for `src/app/[locale]/layout.tsx` is:
Inject a `<head>` element containing the two preconnect links (`fonts.googleapis.com` and `fonts.gstatic.com` with `crossOrigin="anonymous"`) and the single Google Fonts stylesheet link requesting Geist (300, 400, 500, 600) and IBM Plex Sans Arabic (400, 500, 600), with weight 700 strictly omitted.

### Implementation Snippet for Worker
Replace lines 34–46 of `d:\EazifyAi\eazifyai-web\src\app\[locale]\layout.tsx`:

```tsx
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
```

---

## 5. Verification Method

Once the Worker applies the remediation to `src/app/[locale]/layout.tsx`, verify with the following commands in `d:\EazifyAi\eazifyai-web`:

1. **Typecheck Verification:**
   ```bash
   npm run typecheck
   ```
   *Pass Condition:* Exit code 0, 0 errors.

2. **Linter Verification:**
   ```bash
   npm run lint
   ```
   *Pass Condition:* Exit code 0, 0 warnings/errors.

3. **Build Verification:**
   ```bash
   npm run build
   ```
   *Pass Condition:* Exit code 0, successful static export of `/[locale]` routes.

4. **DOM / HTML Inspection:**
   Run `curl http://localhost:3000/ar` (or inspect generated HTML in `.next/server/app/[locale].html`):
   - Confirm `<link rel="preconnect" href="https://fonts.googleapis.com"` is present in `<head>`.
   - Confirm `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"` is present in `<head>`.
   - Confirm `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"` is present in `<head>`.
   - Confirm weight `700` is strictly NOT in the URL.

5. **Invalidation Conditions:**
   - If `npm run typecheck` or `npm run lint` fails.
   - If weight 700 is added or weight 300/400/500/600 is omitted.
   - If `crossOrigin="anonymous"` is omitted from `fonts.gstatic.com`.
