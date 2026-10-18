# Handoff Report: Target Web App Survey (`eazifyai-web`)

## 1. Observation

1. **Framework & Dependencies**:
   - `d:\EazifyAi\eazifyai-web\package.json` lines 21, 24: `"next": "16.4.2"`, `"react": "19.3.1"`, `"react-dom": "19.3.1"`.
   - Zero Tailwind or foreign animation packages (`framer-motion`, `gsap`, `radix`, `lucide-react`) are present in `package.json` dependencies or devDependencies.
2. **Package Scripts Execution**:
   - `npm run typecheck` (`tsc --noEmit`): Exited 0 with no errors.
   - `npm run lint` (`eslint .`): Exited 0 with no errors.
   - `npm run stylelint` (`stylelint "src/**/*.css"`): Exited 0.
   - `npm run build` (`next build`): Exited 0, successfully compiling 24 static and dynamic routes.
   - `npm run i18n:check` (`tsx scripts/check-i18n.ts`): Exited 0 (`All 336 translation keys match between ar.json and en.json`).
   - `npm run contract-check` (`tsx scripts/check-contract.ts`): Exited 0 (`schema.d.ts matches openapi.json`).
3. **Motion Audit Command Failure**:
   - Command: `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`
   - Result: Exited code 1 with output:
     ```
     MISSING in port:
     |@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
     ```
4. **CSS Files Comparison**:
   - `scripts/site-layer.css` line 57:
     ```css
     .ez-fresh{animation:ez-flash 1.4s ease-out}
     ```
     and keyframe definition:
     ```css
     @keyframes ez-flash{from{background:rgba(120,169,204,.25)}to{background:transparent}}
     ```
   - `src/styles/base.css` line 56:
     ```css
     @keyframes ez-flash{from{background:color-mix(in srgb, var(--sky) 25%, transparent)}to{background:transparent}}
     ```
   - Exact slice comparison: Lines 115-751 of `design-reference/styles.css` match `scripts/site-layer.css` 100% byte-for-byte (57,060 bytes, 637 lines). Running `node scripts/audit-motion.mjs scripts/site-layer.css scripts/site-layer.css` outputs `OK: every motion rule of the original exists in the port` (exit 0).
   - Keyframe count: exactly 39 `@keyframes` in both `scripts/site-layer.css` and `src/styles/base.css`.
   - Media query count: exactly 13 `prefers-reduced-motion:reduce` blocks in both.
5. **Stylelint Rule Conflict**:
   - `d:\EazifyAi\eazifyai-web\.stylelintrc.json` lines 3-6:
     ```json
     "rules": {
       "color-no-hex": true,
       "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla"],
       "declaration-property-value-disallowed-list": {
         "/^(background|color|border|box-shadow|outline)/": ["/^#/", "/^rgb/", "/^hsl/"]
       }
     }
     ```
   - Only `src/styles/tokens.css` is currently listed in `overrides` (lines 10-18).
6. **Font Loading**:
   - `src/app/[locale]/layout.tsx` does not include `<link>` tags for Google Fonts.
   - Reference `design-reference/routes/__root.tsx` lines 99-101 contains:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">
     ```
7. **Mock API Seam**:
   - `src/lib/mock-api.ts` does not export `submitLead`. `submitLead` was inlined in `Chat.tsx` and mocked with `setTimeout` in `AboutContactForm.tsx`.
8. **Visual Regression Suite**:
   - `scripts/run-visual-tests.mjs` exists, referencing 11 routes, 3 viewports (390, 768, 1280), 2 locales (`ar`, `en`), and 2 themes (`dark`, `light`).
   - `tests/visual/baseline/` has 100+ reference PNG screenshots.
   - Line 1 of `scripts/run-visual-tests.mjs` imports Playwright via absolute Windows file URL: `file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs`.

---

## 2. Logic Chain

1. **Premise**: Requirement R1 requires that lines 115 to end from `design-reference/styles.css` be copied verbatim into the stylesheet, and `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` must print `OK: every motion rule of the original exists in the port`.
2. **Inference**: The current failure of `audit-motion.mjs` is caused solely by the substitution of `rgba(...)` with `color-mix(...)` in `@keyframes ez-flash` in `src/styles/base.css` (Observation 3 & 4).
3. **Inference**: Copying `scripts/site-layer.css` verbatim over `src/styles/base.css` will immediately satisfy `audit-motion.mjs` (Observation 4).
4. **Inference**: However, because `scripts/site-layer.css` contains raw hex and rgba values, `npm run stylelint` will fail immediately upon copying unless `.stylelintrc.json` is configured to exempt `src/styles/base.css` in its overrides (Observation 5).
5. **Inference**: Typography rendered in screenshots will deviate without the exact Google Fonts link loaded, because the browser falls back to system fonts (Observation 6).
6. **Inference**: Adding `submitLead` to `src/lib/mock-api.ts` is required to complete the Step A runtime contract (Observation 7).

---

## 3. Caveats

1. **Visual Test Execution**: `npm run test:visual` was not run end-to-end against a running dev server during this survey, because this agent operates under a read-only investigation mandate and dev servers consume long-running ports.
2. **Layout Hoisting**: `SiteLayout` is currently placed in `src/app/[locale]/layout.tsx`. While Next.js App Router works cleanly with this structure, Requirement R3 specified keeping `<Site>` inside `page.tsx`. Changing this is an architectural refactor for the implementer agent to coordinate.

---

## 4. Conclusion

The target web app `eazifyai-web` is highly functional, cleanly compiled, and free of foreign UI/motion libraries. However, it cannot achieve the Step A0 signoff gate in its current state due to:
1. `audit-motion.mjs` failure on `src/styles/base.css` (`@keyframes ez-flash` deviation).
2. Missing `.stylelintrc.json` override for verbatim `base.css`.
3. Missing Google Fonts link in layout.
4. Missing `submitLead` export in `mock-api.ts`.

Executing the 4 remediation actions in Section 7 of `analysis.md` will unblock Step A0 certification completely.

---

## 5. Verification Method

1. **Verify Motion Audit**:
   ```bash
   node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
   ```
   *Expected once remediated*: Exit 0 and output `OK: every motion rule of the original exists in the port`.
2. **Verify Full Quality Suite**:
   ```bash
   npm run typecheck
   npm run lint
   npm run stylelint
   npm run build
   ```
   *Expected*: All commands exit with code 0.
3. **Verify Fonts in Layout**:
   Inspect `src/app/[locale]/layout.tsx` to confirm `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">` is present.
4. **Invalidation Conditions**:
   - If `src/styles/base.css` contains any differences from `scripts/site-layer.css` in motion properties or keyframes, `audit-motion.mjs` will exit 1.
   - If `.stylelintrc.json` does not exempt `src/styles/base.css`, `npm run stylelint` will fail with disallowed color declarations.
