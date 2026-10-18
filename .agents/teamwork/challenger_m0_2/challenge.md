# Adversarial Review & Challenge Report — Milestone 0 (Step A0 Foundation)

- **Challenger**: Challenger 2 (`challenger_m0_2`)
- **Target**: CSS and Layout Architecture (`scripts/site-layer.css`, `src/styles/base.css`, `src/styles/tokens.css`, `src/app/[locale]/layout.tsx`, SSR builds)
- **Date**: 2026-10-18T02:53:00Z
- **Verdict**: APPROVE

---

## Challenge Summary

**Overall risk assessment**: LOW

All four core challenge areas were empirically tested using independent scripts, AST/string parsers, production bundle inspection, and live SSR server querying. No regressions, shadowing, rogue selectors, stripped variables, or hydration warnings were discovered.

---

## Challenges & Stress Scenarios Tested

### [Low Risk] Challenge 1: CSS Byte Parity & Rogue Classes/Variables
- **Assumption challenged**: Did verbatim restoration of `src/styles/base.css` omit, alter, or inject rogue classes, selectors, or custom properties?
- **Attack scenario**: Compare SHA-256 hashes, exact byte lengths, and perform deep set difference across all CSS variables and class selectors.
- **Empirical Findings**:
  - `scripts/site-layer.css`: 57,060 bytes, SHA-256 `58894a1bf5ebf3c84f18a4dacafe00161d3d7aba784bc1acb59f1e3e8e3380f0`, 637 lines (pure LF).
  - `src/styles/base.css`: 57,060 bytes, SHA-256 `58894a1bf5ebf3c84f18a4dacafe00161d3d7aba784bc1acb59f1e3e8e3380f0`, 637 lines (pure LF).
  - `git diff --no-index scripts/site-layer.css src/styles/base.css`: exit code 0, 0 diff lines.
  - Unique CSS classes: exactly 351 in both files (0 missing, 0 extra).
  - `:root` CSS custom properties: exactly 13 in both files (0 altered, 0 stripped).
  - Extraction fidelity: Checked against `design-reference/styles.css` lines 115..751; confirmed byte-exact match.
- **Result**: PASS (0 deviations).

### [Low Risk] Challenge 2: Motion Rules, Keyframes & Reduced-Motion Shadowing
- **Assumption challenged**: Are all 39 keyframes and 13 reduced-motion media queries preserved, active, and not shadowed by `tokens.css` or stripped in production builds?
- **Attack scenario**:
  1. Extract all keyframes and verify if any are dead or unreferenced.
  2. Inspect `tokens.css` for conflicting keyframes, animation resets, or reduced-motion queries.
  3. Verify Turbopack client CSS chunk (`.next/static/chunks/34gf0yzvmjcsu.css`) for purged or mangled keyframes.
- **Empirical Findings**:
  - `src/styles/base.css` contains exactly 39 `@keyframes` blocks and 13 `prefers-reduced-motion: reduce` media query blocks.
  - Every single one of the 39 keyframes is actively referenced by at least one animation rule (e.g. `ez-up` used 24 times, `ez-pop` used 8 times, `ez-flash` used 2 times).
  - `tokens.css` contains 0 keyframes, 0 reduced-motion blocks, and 0 animation/transition properties.
  - `tokens.css` is NOT imported anywhere in `layout.tsx` or `base.css` for Milestone 0.
  - In the compiled Next.js production chunk (`.next/static/chunks/34gf0yzvmjcsu.css`), exactly 39 keyframes and 13 reduced-motion media queries are present.
  - Motion audit verification: `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` exits 0 with `OK: every motion rule of the original exists in the port`.
- **Result**: PASS (0 conflicts, 0 shadowed rules).

### [Low Risk] Challenge 3: Google Fonts Preconnect and CrossOrigin Attributes
- **Assumption challenged**: Does `src/app/[locale]/layout.tsx` properly configure preconnect, CORS, and weight restrictions without loading weight 700?
- **Attack scenario**:
  1. Check JSX attributes in `layout.tsx` for `crossOrigin="anonymous"`.
  2. Inspect rendered SSR HTML in `.next/server/app/ar.html` and `en.html`.
  3. Query the Google Fonts CDN endpoint over HTTPS to verify response status and weight availability.
  4. Verify that weight 700 is absent from font links.
- **Empirical Findings**:
  - `preconnect` for `https://fonts.googleapis.com` is present in `<head>`.
  - `preconnect` for `https://fonts.gstatic.com` is present with `crossOrigin="anonymous"` in JSX and `crossorigin="anonymous"` in SSR HTML.
  - Stylesheet link: `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap`.
  - Google Fonts CDN returned HTTP 200 OK.
  - Weight 700 is strictly omitted from the link and SSR HTML.
- **Result**: PASS.

### [Low Risk] Challenge 4: Clean SSR Bundles and Runtime Hydration
- **Assumption challenged**: Does Next.js 16 App Router build clean SSR bundles without hydration warnings, syntax errors, or runtime exceptions?
- **Attack scenario**:
  1. Execute `npm run typecheck`, `npm run lint`, `npm run stylelint`, and `npm run build`.
  2. Spin up production server (`next start -p 3009`) and execute concurrent HTTP queries across 15 routes (`/`, `/ar`, `/en`, `/ar/about`, `/en/about`, `/ar/privacy`, `/en/privacy`, `/ar/copyright`, `/en/copyright`, `/ar/chat`, `/ar/login`, `/ar/register`, `/ar/profile`, `/ar/track`, `/ar/admin`).
  3. Inspect HTTP status codes, SSR HTML payloads, and server stdout/stderr logs for hydration warnings.
- **Empirical Findings**:
  - `npm run typecheck`: exit code 0.
  - `npm run lint`: exit code 0 (0 warnings, 0 errors).
  - `npm run stylelint`: exit code 0 (0 warnings, 0 errors).
  - `npm run build`: exit code 0 (24 static pages generated cleanly in 2.4s).
  - Production server requests:
    - `/ar`: 200 OK, 36,430 bytes, font preconnects and stylesheets present, 0 hydration warnings.
    - `/en`: 200 OK, 37,558 bytes, font preconnects and stylesheets present, 0 hydration warnings.
    - All subroutes returned expected 200 or 307 (auth/locale redirects).
    - Server process logged 0 errors, 0 hydration warnings, and 0 uncaught exceptions.
- **Result**: PASS.

---

## Stress Test Results Matrix

| Scenario | Expected Behavior | Actual Behavior | Pass/Fail |
|---|---|---|---|
| CSS SHA-256 Parity | `site-layer.css` == `base.css` | Identical hash `58894a1bf5...` (57,060 bytes) | PASS |
| Git Diff Check | 0 diff lines | 0 diff lines, exit 0 | PASS |
| Motion Audit Script | Exit 0 with `OK: ...` | Exit 0 with `OK: every motion rule of the original exists in the port` | PASS |
| Keyframe Inventory | Exactly 39 keyframes | Exactly 39 keyframes present and referenced | PASS |
| Reduced Motion Media Queries | Exactly 13 queries | Exactly 13 media queries present | PASS |
| Turbopack CSS Production Chunk | Keyframes & RM queries intact | Exactly 39 keyframes and 13 RM queries in chunk | PASS |
| Google Fonts URL Live Check | Status 200, no weight 700 | Status 200, Geist 300-600 & Plex Arabic 400-600 | PASS |
| Preconnect & crossOrigin | `crossorigin="anonymous"` in SSR HTML | Rendered correctly in `.next/server/app/*.html` | PASS |
| Quality Tooling Gates | All exit 0 cleanly | typecheck: 0, lint: 0, stylelint: 0, build: 0 | PASS |
| Live SSR Route Requests | 15 routes tested on :3009 | All returned 200/307 with clean SSR and 0 errors | PASS |

---

## Unchallenged Areas

- **Step A1 Route Visual Parity Harness (`npm run test:visual`)**: Scoped to Milestone 1 (Step A1) after Step A0 Foundation is approved.
- **Component Mock API Call Site Wiring**: Downstream page components (`Chat.tsx`, `Req.tsx`, `AboutContactForm.tsx`) will be wired to consume `submitLead` during their respective route milestones in Step A1.
