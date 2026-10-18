## 2026-10-17T23:21:50Z
You are the Milestone 0 Implementation Worker.
Your working directory is: d:\EazifyAi\.agents\teamwork\worker_m0_1

You MUST read d:\EazifyAi\.agents\teamwork\ORIGINAL_REQUEST.md first.
Read d:\EazifyAi\PROJECT.md.
Read the findings and implementation blueprints from the three Explorers:
- d:\EazifyAi\.agents\teamwork\explorer_m0_1\handoff.md (CSS verbatim copy & .stylelintrc.json override)
- d:\EazifyAi\.agents\teamwork\explorer_m0_2\handoff.md (Google Fonts injection in layout.tsx)
- d:\EazifyAi\.agents\teamwork\explorer_m0_3\handoff.md (submitLead in mock-api.ts)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive Write Ownership:
You have exclusive write ownership of these files only:
1. `d:\EazifyAi\eazifyai-web\src\styles\base.css`
2. `d:\EazifyAi\eazifyai-web\.stylelintrc.json`
3. `d:\EazifyAi\eazifyai-web\src\app\[locale]\layout.tsx`
4. `d:\EazifyAi\eazifyai-web\src\lib\mock-api.ts`

Tasks to Implement:
1. **Verbatim Site-Layer CSS**:
   Copy `d:\EazifyAi\eazifyai-web\scripts\site-layer.css` verbatim into `d:\EazifyAi\eazifyai-web\src\styles\base.css`.
   Verify that it matches line-for-line, preserving all 39 @keyframes (including @keyframes ez-flash) and all 13 prefers-reduced-motion queries.
2. **Stylelint Override**:
   In `d:\EazifyAi\eazifyai-web\.stylelintrc.json`, update `overrides[0].files` to include `"src/styles/base.css"` (e.g. `["src/styles/tokens.css", "src/styles/base.css"]`) so verbatim hex/rgba colors pass stylelint.
3. **Google Fonts Link Injection**:
   In `d:\EazifyAi\eazifyai-web\src\app\[locale]\layout.tsx`, inject `<head>` with preconnect to `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (with `crossOrigin="anonymous"`), and stylesheet link for `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap`. Strictly omit weight 700.
4. **Unified Mock API (`submitLead`)**:
   In `d:\EazifyAi\eazifyai-web\src\lib\mock-api.ts`, export the unified `submitLead` function matching R3 (SSR-safe, 400ms delay, returning `{ ok: true, id?: string }`).

Verification Requirements:
You MUST run the following commands in `d:\EazifyAi\eazifyai-web` and record their outputs in your handoff report:
1. `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` (must exit 0 and print `OK: every motion rule of the original exists in the port`)
2. Keyframes count verification: exactly 39
3. Reduced-motion count verification: exactly 13
4. `npm run typecheck` (must exit 0)
5. `npm run lint` (must exit 0)
6. `npm run stylelint` (must exit 0)
7. `npm run build` (must exit 0)

Output:
Write `d:\EazifyAi\.agents\teamwork\worker_m0_1\changes.md` with exact diffs.
Write `d:\EazifyAi\.agents\teamwork\worker_m0_1\handoff.md` with all 5 sections (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
Log heartbeat in `d:\EazifyAi\.agents\teamwork\worker_m0_1\progress.md`.
When complete, send a message to caller with the path to your handoff report.
