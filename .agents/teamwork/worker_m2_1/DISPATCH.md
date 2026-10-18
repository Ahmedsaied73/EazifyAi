## 2026-10-18T20:45:31Z
You are the Milestone 2 Implementation Worker (Route /copyright).
Your working directory is: d:\EazifyAi\.agents\teamwork\worker_m2_1

You MUST read d:\EazifyAi\.agents\teamwork\ORIGINAL_REQUEST.md first.
Read d:\EazifyAi\PROJECT.md.
Read the findings and implementation blueprints from the Explorer:
- d:\EazifyAi\.agents\teamwork\explorer_m2_1\handoff.md
- d:\EazifyAi\.agents\teamwork\explorer_m2_1\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive Write Ownership:
You have exclusive write ownership of these files only:
1. `d:\EazifyAi\eazifyai-web\src\app\[locale]\layout.tsx`
2. `d:\EazifyAi\eazifyai-web\src\app\[locale]\(marketing)\copyright\page.tsx`

Tasks to Implement:
1. **Global CSS Reset in `src/app/[locale]/layout.tsx`**:
   Import `../../styles/tokens.css` alongside `../../styles/base.css` so that `tokens.css` (which contains `*, *::before, *::after { box-sizing: border-box; }`) is loaded globally across all routes.
2. **Implement Localized `generateMetadata` in `src/app/[locale]/(marketing)/copyright/page.tsx`**:
   Import `../../../../styles/tokens.css` and export localized `generateMetadata` adhering to Next.js 16 App Router types (`params: Promise<{ locale: string }>`):
   - For `ar`:
     title: "حقوق الملكية | EazifyAi"
     description: "حقوق الملكية والاستخدام لمحتوى وهوية EazifyAi."
   - For `en`:
     title: "Intellectual Property & Copyright | EazifyAi"
     description: "Intellectual property and usage rights for EazifyAi content and identity."
   - Include canonical link `${brand.siteUrl}/${locale}/copyright`, alternate language links (`ar` & `en`), OpenGraph, and Twitter tags (matching `privacy/page.tsx` pattern).

Verification Requirements:
You MUST run the following commands in `d:\EazifyAi\eazifyai-web` and record their outputs in your handoff report:
1. `npm run typecheck` (must exit 0)
2. `npm run lint` (must exit 0)
3. `npm run stylelint` (must exit 0)
4. `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` (must exit 0 with `OK: every motion rule of the original exists in the port`)
5. `npm run build` (must exit 0)
6. Run `node scripts/run-visual-tests.mjs copyright` and report diff ratios against baseline screenshots.
7. Verify computed styles via Playwright on `/ar/copyright` and `/en/copyright` at 1280px viewport (`.ez-top` and `.ez-wrap` must measure `1040px` width, centered at `x: 120px`, `box-sizing: border-box`).

Output:
Write `d:\EazifyAi\.agents\teamwork\worker_m2_1\changes.md` with exact diffs.
Write `d:\EazifyAi\.agents\teamwork\worker_m2_1\handoff.md` with all 5 sections (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
Log continuous heartbeat to `d:\EazifyAi\.agents\teamwork\worker_m2_1\progress.md`.
When complete, send a message to the caller with the path to your handoff report.
