## 2026-10-18T20:06:23Z
You are the Milestone 1 Implementation Worker (Route /privacy).
Your working directory is: d:\EazifyAi\.agents\teamwork\worker_m1_1

You MUST read d:\EazifyAi\.agents\teamwork\ORIGINAL_REQUEST.md first.
Read d:\EazifyAi\PROJECT.md.
Read the findings and implementation blueprints from the Explorer:
- d:\EazifyAi\.agents\teamwork\explorer_m1_1\handoff.md
- d:\EazifyAi\.agents\teamwork\explorer_m1_1\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive Write Ownership:
You have exclusive write ownership of these files only:
1. `d:\EazifyAi\eazifyai-web\src\styles\tokens.css`
2. `d:\EazifyAi\eazifyai-web\src\app\[locale]\(marketing)\privacy\page.tsx`
3. `d:\EazifyAi\eazifyai-web\scripts\run-visual-tests.mjs`

Tasks to Implement:
1. **Universal Box-Sizing Reset in `src/styles/tokens.css`**:
   Add `*, *::before, *::after { box-sizing: border-box; }` in `tokens.css`.
   Verify that this restores `.ez-top` and `.ez-wrap` to 1040px max-width (preventing the 48px width expansion and 24px horizontal drift).
2. **Implement `generateMetadata` in `src/app/[locale]/(marketing)/privacy/page.tsx`**:
   Export localized `generateMetadata` adhering to Next.js 16 App Router types:
   - For `ar`:
     title: "الخصوصية والسياسات | EazifyAi"
     description: "إيه اللي بنجمعه من بياناتك، وليه، وفين بيتخزن، وإزاي تطلب تعديلها أو مسحها."
   - For `en`:
     title: "Privacy & Policy | EazifyAi"
     description: "What data we collect, why, where it is stored, and how to request access or deletion."
   Include matching OpenGraph and Twitter tags.
3. **Harden Visual Test Runner (`scripts/run-visual-tests.mjs`)**:
   Ensure `page.goto` uses `waitUntil: 'domcontentloaded'` with a bounded `document.fonts.ready` race/timeout so screenshot runs never hang if external Google Fonts downloads stall.

Verification Requirements:
You MUST run the following commands in `d:\EazifyAi\eazifyai-web` and record their outputs in your handoff report:
1. `npm run typecheck` (must exit 0)
2. `npm run lint` (must exit 0)
3. `npm run stylelint` (must exit 0)
4. `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` (must exit 0 with `OK: every motion rule of the original exists in the port`)
5. `npm run build` (must exit 0)
6. Run visual test comparison for `/privacy` against `tests/visual/baseline/` across desktop and mobile. Report pixel diff ratio (must be <= 0.1%).

Output:
Write `d:\EazifyAi\.agents\teamwork\worker_m1_1\changes.md` with exact diffs.
Write `d:\EazifyAi\.agents\teamwork\worker_m1_1\handoff.md` with all 5 sections (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
Log continuous heartbeat to `d:\EazifyAi\.agents\teamwork\worker_m1_1\progress.md`.
When complete, send a message to the caller with the path to your handoff report.
