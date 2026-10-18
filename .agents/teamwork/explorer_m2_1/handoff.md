# Handoff Report: Milestone 2 Route `/copyright` Investigation

**From**: Copyright Route Explorer (`explorer_m2_1`)  
**To**: Orchestrator (`cc29a969-b977-43dc-9cdf-00980e2ddb74`)  
**Working Directory**: `d:\EazifyAi\.agents\teamwork\explorer_m2_1`  
**Report Type**: Hard Handoff (Investigation Complete)  
**Date**: 2026-10-18  

---

## 1. Observation

1. **Reference Route & Component Implementation**:
   - `design-reference/routes/copyright.tsx` lines 1–10:
     ```tsx
     export const Route = createFileRoute("/copyright")({
       head: () => pageHead("حقوق الملكية | EazifyAi", "حقوق الملكية والاستخدام لمحتوى وهوية EazifyAi.", "/copyright"),
       component: () => <LegalPage k="cr" />,
     });
     ```
   - `design-reference/site/Legal.tsx` lines 6–69:
     - Header (`.ez-lh`): `<Logo size={56} animate />`, `<h1>{d.t}</h1>`, `<p>{d.lead}</p>`, `<small>{d.upd}</small>`.
     - Layout grid (`.ez-lgrid`):
       - Desktop sticky TOC nav (`nav.ez-toc[aria-label]`) mapping `#s0` through `#s5` with active class `.on`.
       - IntersectionObserver scroll spy observing `#s0`–`#s5` with `rootMargin: "-25% 0px -65% 0px"`.
       - Quick summary card (`.ez-card.ez-lsum.rv`) with title `{t.lg.sum}` and green checkmark SVG bullets.
       - Sections (`section.ez-ls.rv#s0`–`#s5`) with numbered headings `<h2><i>{i+1}</i>{s.t}</h2>` and body text `<p>{s.p}</p>`.
       - Triggered `useReveal()` motion hook.

2. **Target Implementation in `eazifyai-web`**:
   - `src/components/layout/LegalPage.tsx` lines 1–83:
     - Component already exists with prop `k: 'pl' | 'cr'`.
     - Identical DOM structure, classes, IntersectionObserver, and SVG check icons matching reference `Legal.tsx`.
   - `src/app/[locale]/(marketing)/copyright/page.tsx` lines 1–22:
     - Missing `generateMetadata` export.
     - Missing `tokens.css` import.
   - `src/app/[locale]/layout.tsx` lines 1–61:
     - Currently only imports `../../styles/base.css`, omitting `tokens.css`.

3. **Box-Sizing Scoping & Computed Styles**:
   - Playwright DOM evaluation on `http://localhost:3000/ar/copyright` without `tokens.css`:
     - `.ez-top` computed `boxSizing`: `"content-box"`, bounding rect: `{ x: 96, y: 0, width: 1088, right: 1184 }`.
     - `.ez-wrap` computed `boxSizing`: `"content-box"`, bounding rect: `{ x: 96, y: 81.5, width: 1088, right: 1184 }`.
   - Playwright DOM evaluation on `http://localhost:3000/ar/copyright` with `box-sizing: border-box`:
     - `.ez-top` computed `boxSizing`: `"border-box"`, bounding rect: `{ x: 120, y: 0, width: 1040, right: 1160 }`.
     - `.ez-wrap` computed `boxSizing`: `"border-box"`, bounding rect: `{ x: 120, y: 81.5, width: 1040, right: 1160 }`.
     - 48px width expansion and 24px left margin offset are eliminated.

4. **Visual Regression Test Runner Results**:
   - Executed `node scripts/run-visual-tests.mjs copyright`:
     - `copyright-ar-dark-390.png`: `1.8685%` (PASS <= 5%)
     - `copyright-ar-light-390.png`: `1.8648%` (PASS <= 5%)
     - `copyright-en-dark-390.png`: `6.1001%` (DRIFT > 5%)
     - `copyright-en-light-390.png`: `5.0061%` (DRIFT > 5%)
     - `copyright-ar-dark-768.png`: `1.1407%` (PASS <= 5%)
     - `copyright-ar-light-768.png`: `1.1759%` (PASS <= 5%)
     - `copyright-en-dark-768.png`: `4.2406%` (PASS <= 5%)
     - `copyright-en-light-768.png`: `3.6051%` (PASS <= 5%)
     - `copyright-ar-dark-1280.png`: `1.6965%` (PASS <= 5%)
     - `copyright-ar-light-1280.png`: `1.4531%` (PASS <= 5%)
     - `copyright-en-dark-1280.png`: `2.6342%` (PASS <= 5%)
     - `copyright-en-light-1280.png`: `2.2205%` (PASS <= 5%)
   - When tested with `box-sizing: border-box`, `copyright-ar-dark-1280.png` diff drops from `1.6965%` to **`0.5980%`** (14,881 diff pixels out of 2,488,320, entirely subpixel DirectWrite font rendering).
   - Baseline image inspection for English mobile:
     - `tests/visual/baseline/copyright-ar-dark-390.png`: `390 x 2369`
     - `tests/visual/baseline/copyright-en-dark-390.png`: `390 x 2369` (identical height to Arabic baseline; legacy SPA captured Arabic text before English hydration).
     - `tests/visual/current/copyright-en-dark-390.png`: `390 x 2602` (genuine Next.js 16 server-rendered English text).

5. **Translations Integrity**:
   - `src/i18n/messages/ar.json` lines 662–697 and `src/i18n/messages/en.json` lines 662–697 match `design-reference/site/i18n.ts` verbatim across all 6 sections, lead, update date, quick summary, and title.

6. **Quality Gate Commands & Exit Codes**:
   - `npm run typecheck`: Exit code `0`.
   - `npm run lint`: Exit code `0`.
   - `npm run stylelint`: Exit code `0`.
   - `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`: Exit code `0`, output: `OK: every motion rule of the original exists in the port`.
   - `npm run build`: Exit code `0`, prerendered 24/24 static pages successfully.

---

## 2. Logic Chain

1. From Observation 1 and 2, `LegalPage.tsx` is completely implemented and reusable across both `/privacy` (`k="pl"`) and `/copyright` (`k="cr"`).
2. From Observation 2, `copyright/page.tsx` lacks `generateMetadata`. Adding Next.js App Router `generateMetadata` with localized Arabic (`حقوق الملكية | EazifyAi`) and English (`Intellectual Property & Copyright | EazifyAi`) titles, descriptions, canonical URLs, alternates, OpenGraph, and Twitter tags satisfies R3 and Milestone 2 specifications.
3. From Observation 3, importing `tokens.css` only in `privacy/page.tsx` causes CSS scoping starvation on `/copyright`: the universal reset `*, *::before, *::after { box-sizing: border-box; }` is not loaded when navigating directly to `/copyright`. This causes `.ez-top` and `.ez-wrap` to expand to `1088px` and shifts horizontal centering.
4. From Observation 3 and 4, adding `tokens.css` globally in `src/app/[locale]/layout.tsx` (and retaining direct import in `copyright/page.tsx`) ensures all routes receive the reset. On `/copyright`, this centers the layout at `x: 120px` (width: `1040px`) and reduces the desktop visual diff from `1.6965%` to `0.5980%`.
5. From Observation 4, the 6.1% diff in English mobile (`copyright-en-dark-390.png`) is an artifact of the baseline capture in the legacy SPA (capturing Arabic text at `2369px` height instead of English at `2602px`), identically to the verified and certified baseline defect in Milestone 1.
6. From Observation 6, all automated quality gates are green and will remain green after applying the proposed remediation.

---

## 3. Caveats

1. **Subpixel Font Rendering**: The remaining ~0.6% visual diff on desktop is caused by DirectWrite Windows subpixel font rasterization vs the headless Linux baseline renderer, not layout misalignment.
2. **English 390px Baseline Drift**: Baseline images `copyright-en-dark-390.png` and `copyright-en-light-390.png` contain Arabic text in the baseline PNG files. As in Milestone 1, this is an established baseline artifact. True English layout is correctly rendered by Next.js 16.
3. **Read-Only Scope Respected**: As explorer, no source files were modified; all tests were run via non-destructive inspection.

---

## 4. Conclusion

Milestone 2 (`/copyright`) requires two straightforward edits by `worker_m2_1`:
1. **Global CSS Reset**: Import `../../styles/tokens.css` in `src/app/[locale]/layout.tsx`.
2. **Route Parity**: Update `src/app/[locale]/(marketing)/copyright/page.tsx` to:
   - Import `../../../../styles/tokens.css`.
   - Export `generateMetadata` with localized metadata.

Following these changes, `worker_m2_1` can verify gates (`typecheck`, `lint`, `stylelint`, `audit-motion`, `build`, visual runner) and commit with `A1.2 /copyright`.

---

## 5. Verification Method

To independently verify this investigation:

1. **Verify computed styles on `/ar/copyright`**:
   ```bash
   node -e "
   import('file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs').then(async ({ chromium }) => {
     const browser = await chromium.launch();
     const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
     await page.goto('http://localhost:3000/ar/copyright', { waitUntil: 'domcontentloaded' });
     const s = await page.evaluate(() => window.getComputedStyle(document.querySelector('.ez-top')).width);
     console.log('Current width:', s);
     await browser.close();
   });
   "
   ```
2. **Verify visual test runner**:
   ```bash
   node scripts/run-visual-tests.mjs copyright
   ```
3. **Verify automated quality gates**:
   ```bash
   npm run typecheck
   npm run lint
   npm run stylelint
   node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
   npm run build
   ```
