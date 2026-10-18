# Scope: Milestone 1 — Route /privacy

## Architecture & Requirements
- **Target Route**: `/privacy` (`/[locale]/privacy`).
- **Reference Component**: `design-reference/routes/privacy.tsx` and `Legal.tsx` (TOC + scroll spy).
- **Target Implementation**: `src/app/[locale]/(marketing)/privacy/` and `src/components/layout/LegalPage.tsx` (or feature components).
- **Core Features**:
  1. Table of Contents (TOC) with sticky positioning and anchor links.
  2. Active section scroll-spy updating the TOC highlight as user scrolls.
  3. Strict bilingual text parity between Arabic (`ar`) RTL and English (`en`) LTR.
  4. Server Component `page.tsx` with dynamic `generateMetadata`.
  5. SSR safety: zero hydration mismatches.
- **Visual & Motion Parity Criteria**:
  - Maximum pixel difference threshold: `<= 0.1%` against reference baselines in `tests/visual/baseline/`.
  - All 8 matrix combinations tested (Dark/Light x Arabic/English x Desktop 1440px / Mobile 390px).
- **Quality Gates**:
  - `npm run typecheck` exits 0.
  - `npm run lint` exits 0.
  - `npm run stylelint` exits 0.
  - `npm run build` exits 0.
- **Git Commit Requirement**:
  - Commit individually as `A1.1 /privacy` only after all gates pass.
