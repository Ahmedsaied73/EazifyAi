# Adversarial Challenge & Stress Test Report: Milestone 1 Route `/privacy`

**Target Route**: `http://localhost:3000/ar/privacy` and `http://localhost:3000/en/privacy`  
**Challenger**: Challenger 1 (`challenger_m1_1`)  
**Date**: 2026-10-18T20:28:30Z  

---

## Challenge Summary

**Overall risk assessment**: LOW

Empirical testing confirmed that the layout metrics, box-sizing reset, container dimensions, Table of Contents mechanics, and zero-foreign-animation requirements for Route `/privacy` conform strictly to specification.

---

## Challenges

### [Low] Challenge 1: TOC IntersectionObserver RootMargin Detection Band vs Anchor Click Offset

- **Assumption challenged**: Clicking a TOC anchor navigates to the target section and immediately marks that section's TOC link as active.
- **Attack scenario**: When a user clicks `<a href="#s0">`, the browser scrolls `#s0` to the top of the viewport (`targetTop ~ 48px`). The IntersectionObserver in `LegalPage.tsx` defines `{ rootMargin: "-25% 0px -65% 0px" }`, which restricts the intersection trigger window to a vertical band between 25% (200px) and 35% (280px) down from the viewport top (on an 800px viewport). Because section `#s0` is relatively compact (133px height), its bottom reaches ~181px from the top of the viewport, placing the subsequent section `#s1` in the 200px–280px detection band upon click completion.
- **Blast radius**: The page scrolls smoothly to the clicked section `#s0`, which is fully visible in the viewport (`targetInView: true`). The active TOC class reflects the section currently intersecting the 25%–35% reading line. When the user scrolls naturally down the document, each section `#s0` through `#s7` triggers its corresponding TOC indicator with 100% precision.
- **Root Cause & Reference Parity**: The implementation in `src/components/layout/LegalPage.tsx` is an exact verbatim port of `design-reference/site/Legal.tsx` lines 11–24. The behavior matches the reference design verbatim.
- **Mitigation**: Retain verbatim code in accordance with R1/R2.

### [Low] Challenge 2: Mobile & Tablet Responsiveness and TOC Breakpoint

- **Assumption challenged**: On narrow viewports (tablet 768px, mobile 390px), does the TOC interfere with content layout or cause horizontal scrolling?
- **Attack scenario**: Rendered `/ar/privacy` and `/en/privacy` at 768x1024 and 390x844 viewports. Inspected computed styles and DOM overflow.
- **Result**: `.ez-toc` computes to `display: none` below 900px (`@media(min-width:900px)`). Document `scrollWidth` equals `clientWidth` (768px and 390px respectively). Zero horizontal scrolling or overflow detected. PASS.

### [Low] Challenge 3: Universal Box-Sizing Reset Blast Radius

- **Assumption challenged**: Does the universal reset `*, *::before, *::after { box-sizing: border-box; }` introduce negative side-effects or break text padding?
- **Attack scenario**: Inspected computed `boxSizing` on all elements (`body`, `.ez-top`, `.ez-wrap`, `.ez-legal`, `.ez-toc`, `.ez-lh`, `.ez-lgrid`, `.ez-lbody`, `.ez-ls`, `h1`, `h2`, `p`, `a`).
- **Result**: All elements evaluate to `border-box`. Container width for `.ez-top` and `.ez-wrap` on 1280px is exactly `1040px`, centered at `x = 120px` (`right = 1160px`). On 1440px, width is `1040px`, centered at `x = 200px`. Navbar and TOC pixel diff against baseline is 0. PASS.

### [Low] Challenge 4: Verification of Zero Foreign Animation & UI Libraries

- **Assumption challenged**: Are any unapproved third-party UI/animation libraries (Tailwind, Framer Motion, GSAP, Radix) present in dependencies, runtime globals, or loaded stylesheets?
- **Attack scenario**: Audited `package.json`, scanned browser `window` object for library globals, and inspected loaded stylesheet resources.
- **Result**:
  - `window.tailwind`: `undefined`
  - `window.gsap` / `window.TweenMax`: `undefined`
  - `window.FramerMotion`: `undefined`
  - `window.Radix*`: none found
  - Loaded styles: Next.js static CSS chunks and Google Fonts stylesheet only. PASS.

---

## Stress Test Results

| Scenario | Input / Viewport | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| Container Width & Centering | 1280px Desktop (`ar` & `en`) | `.ez-top` & `.ez-wrap` width = 1040px, x = 120px | Width = 1040px, x = 120px, right = 1160px | **PASS** |
| Container Width & Centering | 1440px Desktop (`ar` & `en`) | `.ez-top` & `.ez-wrap` width = 1040px, x = 200px | Width = 1040px, x = 200px, right = 1240px | **PASS** |
| Responsive Tablet Layout | 768px Tablet (`ar` & `en`) | `scrollWidth <= clientWidth`, TOC hidden | `scrollWidth` = 768px, TOC `display: none` | **PASS** |
| Responsive Mobile Layout | 390px Mobile (`ar` & `en`) | `scrollWidth <= clientWidth`, TOC hidden | `scrollWidth` = 390px, TOC `display: none` | **PASS** |
| Smooth Scrolling Mechanism | Desktop (`prefers-reduced-motion: no-preference`) | `html { scroll-behavior: smooth }` | Computed `scrollBehavior: "smooth"` | **PASS** |
| TOC Scroll Spy Trigger Precision | Desktop (`ar` & `en`) | Scrolling each `#s0`..`#s7` to reading line (y=240px) triggers corresponding TOC item | 8 of 8 sections activate `#s0`..`#s7` with 100% match | **PASS** |
| Foreign Animation Libraries | Browser runtime | Zero instances of Tailwind, GSAP, Framer Motion, Radix | All checks returned negative | **PASS** |
| Typecheck Gate | Repo root | `npm run typecheck` exits 0 | Exited 0 with 0 errors | **PASS** |
| Lint Gate | Repo root | `npm run lint` exits 0 | Exited 0 with 0 errors | **PASS** |
| Stylelint Gate | Repo root | `npm run stylelint` exits 0 | Exited 0 with 0 errors | **PASS** |
| Motion Audit Gate | Repo root | `audit-motion.mjs` exits 0 with `OK: every motion rule...` | Exited 0 with verbatim message | **PASS** |
| Production Build Gate | Repo root | `npm run build` exits 0 with static pages generated | Exited 0, prerendered 24 static pages | **PASS** |

---

## Unchallenged Areas

- Routes other than `/privacy` (`/about`, `/chat`, `/login`, etc.) are scheduled for subsequent milestones and were not part of this evaluation.
