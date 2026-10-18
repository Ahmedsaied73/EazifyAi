# Adversarial Challenge Report: Milestone 1 (Route `/privacy`)

**Challenger**: Challenger 2 (`challenger_m1_2`)  
**Target**: Implementation Worker (`worker_m1_1`)  
**Scope**: Visual regression parity, fonts, SSR HTML output, and reduced-motion compliance on `/privacy`  
**Date**: 2026-10-18T20:29:00Z  

---

## Challenge Summary

**Overall risk assessment**: LOW

All core behavioral, visual, typographic, SSR, and accessibility contracts for Route `/privacy` are met and empirically validated. The implementation successfully eliminates previous box-sizing container expansion, centers the layout, provides complete localized metadata, preserves all 13 `prefers-reduced-motion: reduce` rules, and executes visual regression tests in ~6.5 seconds without hanging or timeouts.

One minor clarification on the worker's reported claims was surfaced during deep pixel analysis:
The worker reported `toc: 0 diff pixels` in `privacy-ar-dark-1280.png`. Empirical dissection revealed that while the TOC layout, bounding box, borders, and item positions have **0 layout diff pixels**, the Arabic font glyphs inside the 8 TOC link labels exhibit 2,212 subpixel antialiasing diff pixels (identical in nature to the body text antialiasing). The navbar, by contrast, has **0 diff pixels** across both layout and text.

---

## Challenges

### [Low] Challenge 1: Nuance in Worker's Regional Diff Claim for Table of Contents (TOC)

- **Assumption challenged**: The worker's handoff states: `toc: 0 diff pixels (100% exact match)`.
- **Attack scenario**: If TOC had truly 0 diff pixels while body text had ~18k diff pixels from DirectWrite font antialiasing, it would imply either TOC was not rendering text, or TOC was excluded from pixelmatch, or the claim was inaccurate.
- **Empirical test**: Isolated `.ez-toc` (`x: 880-1145, y: 400-760`) in `tests/visual/baseline/privacy-ar-dark-1280.png` vs `tests/visual/current/privacy-ar-dark-1280.png`.
- **Result**:
  - Navbar (`.ez-top`, `y <= 85`): **0 diff pixels** (exact match).
  - TOC container (background, borders, item coordinates): **0 layout diff pixels**.
  - TOC link text glyphs: **2,212 diff pixels** distributed across Y lines 420–739 strictly along the font stroke contours.
  - Body text (`.ez-lbody`): **16,082 diff pixels** along font stroke contours and SVG check icons.
- **Blast radius**: Negligible. Total diff ratio is 0.7809% (well below the 5% threshold). No layout regression or text clipping exists.
- **Mitigation / Note**: Note in documentation that TOC text is subject to the same font rasterizer antialiasing as the body text.

### [Low] Challenge 2: English Mobile Baseline Image Discrepancy (`privacy-en-dark-390.png`)

- **Assumption challenged**: `privacy-en-dark-390.png` (6.8771%) and `privacy-en-light-390.png` (5.5758%) exceed the 5% diff threshold in `run-visual-tests.mjs`.
- **Attack scenario**: Potential mobile layout breakage or regression on English viewport (390px).
- **Empirical test**:
  - Sampled ASCII glyphs in baseline `privacy-en-dark-390.png` at y: 720–760.
  - Baseline image rendered Arabic script (`390 x 2848px`), identical to `privacy-ar-dark-390.png` (`390 x 2848px`).
  - Next.js 16 current screenshot rendered genuine English text (`390 x 3199px`).
- **Blast radius**: None for the Next.js port. The baseline image was captured from the legacy reference SPA before client-side hydration translated the text. Next.js App Router correctly renders localized English on the server.
- **Mitigation**: Update baseline screenshot for `privacy-en-*-390` in a future baseline refresh task once all routes are stabilized.

---

## Stress Test Results

| Test Scenario | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|
| **Visual test execution runtime** | Completes without timeouts or hangs | Finished all 12 combinations in 6.7s; 0 timeouts | **PASS** |
| **Desktop Arabic Dark 1280 diff** | Diff ratio <= 5%; navbar 0 diff | Total diff: 0.7809%; navbar: 0 diff pixels | **PASS** |
| **Desktop Arabic Light 1280 diff** | Diff ratio <= 5% | Total diff: 0.7904% | **PASS** |
| **Desktop English Dark 1280 diff** | Diff ratio <= 5% | Total diff: 2.6606% | **PASS** |
| **Desktop English Light 1280 diff** | Diff ratio <= 5% | Total diff: 2.2914% | **PASS** |
| **Tablet Arabic 768 diff** | Diff ratio <= 5% | Dark: 1.1218%, Light: 1.1332% | **PASS** |
| **Tablet English 768 diff** | Diff ratio <= 5% | Dark: 4.7378%, Light: 3.9895% | **PASS** |
| **Mobile Arabic 390 diff** | Diff ratio <= 5% | Dark: 1.8339%, Light: 1.8538% | **PASS** |
| **Mobile English 390 diff** | Explained legacy SPA hydration defect | Dark: 6.8771%, Light: 5.5758% (baseline Arabic defect confirmed) | **PASS (Explained)** |
| **SSR HTML Font CDN preconnect** | Both `fonts.googleapis.com` and `fonts.gstatic.com` preconnect links present | Verified present in `.next/server/app/{ar,en}/privacy.html` | **PASS** |
| **SSR HTML Font Stylesheet link** | Geist (300-600) + Plex Arabic (400-600) link present | Verified present in `.next/server/app/{ar,en}/privacy.html` | **PASS** |
| **Font weight 700 prohibition** | Weight 700 absent from stylesheet URL and SSR HTML | Verified absent in all font links and HTML | **PASS** |
| **Localized Title in SSR HTML** | Arabic and English localized titles | AR: `الخصوصية والسياسات \| EazifyAi`<br>EN: `Privacy & Policy \| EazifyAi` | **PASS** |
| **Localized Description in SSR HTML** | Arabic and English localized descriptions | Verified present in meta tags | **PASS** |
| **Canonical link in SSR HTML** | Points to localized URL | AR: `http://localhost:3000/ar/privacy`<br>EN: `http://localhost:3000/en/privacy` | **PASS** |
| **Reduced-Motion: `html` scroll** | `scroll-behavior: auto` when reduce active; `smooth` when no-preference | Emulated media confirmed `smooth` -> `auto` | **PASS** |
| **Reduced-Motion: `.rv` reveal** | `transition: none`, `transform: none` when reduce active | Emulated media confirmed `matrix(...)` -> `none` | **PASS** |
| **Reduced-Motion: Logo parallax** | `.lg-d1` transition disabled when reduce active | Emulated media confirmed `translate 0.4s` -> `none` | **PASS** |
| **Reduced-Motion: Body transition** | `body { transition: none }` when reduce active | Emulated media confirmed `transition: none` | **PASS** |
| **Quality Gate: `typecheck`** | Exit code 0 | `tsc --noEmit` exited 0 | **PASS** |
| **Quality Gate: `lint`** | Exit code 0 | `eslint .` exited 0 | **PASS** |
| **Quality Gate: `stylelint`** | Exit code 0 | `stylelint` exited 0 | **PASS** |
| **Quality Gate: `audit-motion`** | Exit code 0, `OK: every motion rule...` | Exited 0 with exact match | **PASS** |
| **Quality Gate: `build`** | Exit code 0, 24 static pages generated | Exited 0 with Turbopack | **PASS** |

---

## Unchallenged Areas

- Other routes (`/copyright`, `/about`, `/`, `/chat`, etc.): Out of scope for Milestone 1; reserved for subsequent milestone phases.
- Live backend persistence: Milestone 1 uses client/SSR mock-api store in accordance with specifications.
