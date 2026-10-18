# Motion & CSS Spec Miner Handoff Report

**Agent**: Motion & CSS Spec Miner (Replacement)  
**Task Folder**: `d:\EazifyAi\.agents\teamwork\spec_miner_survey_2`  
**Target Recipient**: Orchestrator / Parent Agent (`cc29a969-b977-43dc-9cdf-00980e2ddb74`)  
**Date**: 2026-10-17  
**Artifact**: `d:\EazifyAi\.agents\teamwork\spec_miner_survey_2\spec.md`  

---

## 1. Observation

Direct observations and evidence obtained from the authoritative specification sources and codebase:

1. **Stylesheet Boundaries & Line Counts**:
   - `d:\EazifyAi\eazifyai-web\design-reference\styles.css`: Total 751 lines (Line 751 is an empty newline).
   - Lines 1–114 (114 lines): Template and Tailwind/Quanta scaffolding. Starts with Line 1 `@import "tailwindcss";` and ends with Line 114 `}`.
   - Lines 115–750 (636 lines): The verbatim site layer. Starts at Line 115 with `/* EazifyAi site layer: Geist-style tokens, rounded, soft shadows */` and ends at Line 750 with `.ez-wa a:hover{text-decoration:underline}`.
   - `d:\EazifyAi\eazifyai-web\scripts\site-layer.css`: Exactly 637 lines (636 lines of site-layer content plus trailing newline).

2. **Keyframe Count & Content**:
   - `node -e "..."` parsing of `scripts/site-layer.css` identified **exactly 39 `@keyframes` blocks**.
   - Line 98 of `scripts/site-layer.css` (and Line 212 of `design-reference/styles.css`):
     `@keyframes ez-flash{from{background:rgba(120,169,204,.25)}to{background:transparent}}`
   - In contrast, in `d:\EazifyAi\eazifyai-web\src\styles\base.css` Line 97:
     `@keyframes ez-flash{from{background:color-mix(in srgb, var(--sky) 25%, transparent)}to{background:transparent}}`

3. **Motion Audit Command Execution**:
   - Running `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` in `d:\EazifyAi\eazifyai-web`:
     - Exited with code `1`.
     - Output:
       ```
       MISSING in port:
       |@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
       ```
   - Running `node scripts/audit-motion.mjs scripts/site-layer.css scripts/site-layer.css`:
     - Exited with code `0`.
     - Output: `OK: every motion rule of the original exists in the port`.

4. **Reduced-Motion Media Queries**:
   - Parsing of `scripts/site-layer.css` identified **exactly 13 `@media(prefers-reduced-motion:reduce)` blocks** and **1 `@media(prefers-reduced-motion:no-preference)` block** (`html{scroll-behavior:smooth}`).
   - Total motion media queries: 14.

5. **Typography Specifications & Layout State**:
   - `design-reference/routes/__root.tsx` lines 99–101:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">
     ```
   - Fonts specified: `Geist` (weights 300, 400, 500, 600) and `IBM Plex Sans Arabic` (weights 400, 500, 600).
   - `src/app/[locale]/layout.tsx`: Currently has **zero** `<link>` tags for Google Fonts.
   - Body font stack in CSS (Line 120): `"Geist","IBM Plex Sans Arabic",system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif; line-height:1.7;`.

6. **Selector & Class Inventory**:
   - `scripts/site-layer.css` contains **662 rule blocks**, **585 unique selector tokens**, and **282 unique CSS classes** (starting with `.ez-*`, `.lg-*`, and state utilities like `.rv`, `.in`, `.on`).

---

## 2. Logic Chain

1. **Premise 1 (Step A0 CSS Integrity)**: Step A0 mandates literal copying of lines 115–750 (636 lines) from `design-reference/styles.css` into the port stylesheet without manual edits or rule substitutions.
2. **Premise 2 (Audit Tool Failure Root Cause)**: Running `audit-motion.mjs` comparing `scripts/site-layer.css` and `src/styles/base.css` identified exactly one discrepancy: `@keyframes ez-flash`. In `base.css`, `rgba(120,169,204,.25)` was substituted with `color-mix(in srgb, var(--sky) 25%, transparent)`. The audit tool relies on exact string equality of parsed declaration bodies. Therefore, restoring the literal `rgba(120,169,204,.25)` declaration in `src/styles/base.css` will immediately satisfy the audit tool and achieve exit code 0 (`OK: every motion rule of the original exists in the port`).
3. **Premise 3 (Weight 700 Prohibition)**: In `styles.css`, selector `.ez-fmark` specifies `font-weight: 700`. However, the Google Fonts URL in `__root.tsx` intentionally omits weight 700, loading only 300, 400, 500, 600. The browser falls back to drawing weight 600. If weight 700 is loaded, the browser renders true bold 700, altering character footprints and failing visual parity tests. Therefore, weight 700 must remain strictly prohibited.
4. **Premise 4 (Font Tags Missing in Layout)**: `src/app/[locale]/layout.tsx` currently lacks the required `<link>` tags to Google Fonts. Adding the exact `<link>` tags from `design-reference/routes/__root.tsx` is required for Step A0 font parity.
5. **Premise 5 (Feature & Route Structure)**: The entire site consists of Step A0 foundation (shared CSS, 5 motion drivers J1-J5, timers J6-J10, `Site.tsx`, `Logo.tsx`, `store.ts`, `lib/mock-api.ts`, `i18n.ts`) followed by 13 routes in Step A1 (privacy, copyright, about, home, chat, login, register, profile, track, admin, brand, 404/error, sitemap/robots). Each route is gated by <= 0.1% visual diff across 8 matrix combinations.

---

## 3. Caveats

- As a Specification Miner, I am strictly read-only and did not modify `src/styles/base.css` or `src/app/[locale]/layout.tsx`. The implementation fixes must be executed by the implementer agent.
- `Company-site-design/styles.css` was referenced in the prompt as an alternative name; the physical directory on disk in this repo is `eazifyai-web/design-reference/styles.css`, which contains the identical commit `bad70d7` reference.
- Step B introduces tokens and brand configurations (`tokens.css`), but Step A0 requires that `base.css` maintains exact motion rule parity with `site-layer.css`.

---

## 4. Conclusion

1. **Step A0 Motion & CSS Specification is fully discovered, verified, and documented** in `d:\EazifyAi\.agents\teamwork\spec_miner_survey_2\spec.md`.
2. **Audit Tool Barrier Identified**: The failure of `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` is isolated to a single line in `src/styles/base.css` where `@keyframes ez-flash` uses `color-mix(...)` instead of the verbatim `rgba(120,169,204,.25)`.
3. **Typography Invariants Certified**: Google Fonts `<link>` must request only Geist (300, 400, 500, 600) and IBM Plex Sans Arabic (400, 500, 600). Weight 700 is strictly prohibited to avoid breaking footer watermark font fallback behavior.
4. **Feature Inventory Complete**: All 13 routes and shared foundation drivers are documented with sources, input/output contracts, error behaviors, edge cases, and verification criteria for `PROJECT.md`.

---

## 5. Verification Method

To independently verify the findings in this report:

1. **Verify Stylesheet Line Boundaries**:
   ```powershell
   # In d:\EazifyAi\eazifyai-web
   (Get-Content design-reference/styles.css | Select-Object -Skip 114).Count
   # Expected: 637 (636 lines + trailing empty line)
   ```

2. **Verify 39 Keyframes & 13 Reduced-Motion Blocks**:
   ```powershell
   node -e "const fs = require('fs'); const css = fs.readFileSync('scripts/site-layer.css', 'utf8'); console.log('Keyframes:', (css.match(/@keyframes\s+[a-zA-Z0-9_-]+/g) || []).length); console.log('Reduced:', (css.match(/prefers-reduced-motion:reduce/g) || []).length);"
   # Expected: Keyframes: 39, Reduced: 13
   ```

3. **Verify Audit Tool Mechanics & Discrepancy**:
   ```powershell
   node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
   # Expected output:
   # MISSING in port:
   # |@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
   # Exit code: 1
   ```

4. **Verify Baseline Parity with Self**:
   ```powershell
   node scripts/audit-motion.mjs scripts/site-layer.css scripts/site-layer.css
   # Expected: OK: every motion rule of the original exists in the port (Exit code 0)
   ```
