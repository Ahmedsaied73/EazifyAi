## 2026-10-18T22:13:48Z

You are the Milestone 5 Implementation Worker (Route /chat).
Your working directory is: d:\EazifyAi\.agents\teamwork\worker_m5_1

You MUST read d:\EazifyAi\.agents\teamwork\ORIGINAL_REQUEST.md first.
Read d:\EazifyAi\PROJECT.md.
Read the findings and implementation blueprints from the Explorer:
- d:\EazifyAi\.agents\teamwork\explorer_m5_1\handoff.md
- d:\EazifyAi\.agents\teamwork\explorer_m5_1\analysis.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusive Write Ownership:
You have exclusive write ownership of these files only:
1. `d:\EazifyAi\eazifyai-web\src\features\chat\Chat.tsx`
2. `d:\EazifyAi\eazifyai-web\src\features\journey\Req.tsx`
3. `d:\EazifyAi\eazifyai-web\src\components\layout\Feedback.tsx`
4. `d:\EazifyAi\eazifyai-web\src\features\journey\Journey.tsx`
5. `d:\EazifyAi\eazifyai-web\src\app\[locale]\chat\page.tsx`

Tasks to Implement:
1. **Unify `submitLead` Call Site 1 in `src/features/chat/Chat.tsx`**:
   - Remove the local dummy `submitLead` function.
   - Import `submitLead` directly from `../../lib/mock-api`:
     `import { mockApi, submitLead, type Req } from '../../lib/mock-api';`
   - Ensure the call site passes genuine lead data: `{ data: { problem, affected, current, contact, lang } }`.
2. **Unify `submitLead` Call Site 2 in `src/features/journey/Req.tsx`**:
   - Import `submitLead` directly from `../../lib/mock-api`:
     `import { mockApi, submitLead, type Req } from '../../lib/mock-api';`
   - Implement `useFollow` according to the Explorer blueprint to call `submitLead` with the follow-up details (urgency, budget, time, call slot, notification channels, contact, lang).
3. **Unify `submitLead` Call Site 3 in `src/components/layout/Feedback.tsx`**:
   - Import `submitLead` directly from `../../lib/mock-api`:
     `import { submitLead, type Req } from '../../lib/mock-api';`
   - Wire `send(choice: number, text: string)` to invoke `submitLead` with the feedback payload and set sent state.
4. **Localize and Verify `src/features/journey/Journey.tsx`**:
   - Ensure tracking links include the active language prefix (`/${lang}/track?id=` + req.id) or navigate cleanly.
5. **Verify Route & Metadata in `src/app/[locale]/chat/page.tsx`**:
   - Verify localized `generateMetadata` exports valid Arabic and English metadata conforming to Next.js 16 types (`params: Promise<{ locale: string }>`).
   - Arabic: Title `"احكيلنا مشكلتك | EazifyAi"`, Description `"اكتب مشكلتك في الشغل بالمصري، والمساعد هيسمعك ويفهمها وياخد وسيلة التواصل، وإحنا نرجعلك بخطوة تالية خلال ٤٨ ساعة."`.
   - English: Title `"Tell Us Your Problem | EazifyAi"`, Description `"Describe your work problem; our assistant listens, clarifies, and takes your contact info so we get back to you within 48 hours."`.
   - OpenGraph and Twitter cards matching the `/privacy` and `/about` patterns.
   - Verify `generateStaticParams` for `[{ locale: 'ar' }, { locale: 'en' }]`.

Verification Requirements:
You MUST run the following commands in `d:\EazifyAi\eazifyai-web` and record their outputs in your handoff report:
1. `npm run typecheck` (must exit 0)
2. `npm run lint` (must exit 0)
3. `npm run stylelint` (must exit 0)
4. `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` (must exit 0 with `OK: every motion rule of the original exists in the port`)
5. `npm run build` (must exit 0, prerendering 24/24 static pages)
6. Run `node scripts/run-visual-tests.mjs chat` and report diff ratios.
7. Verify all 3 `submitLead` call sites import from `src/lib/mock-api.ts`.
8. Commit changes individually with git commit message: `A1.5 /chat`.

Output:
Write `d:\EazifyAi\.agents\teamwork\worker_m5_1\changes.md` with exact diffs.
Write `d:\EazifyAi\.agents\teamwork\worker_m5_1\handoff.md` with all 5 sections (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
Log continuous heartbeat to `d:\EazifyAi\.agents\teamwork\worker_m5_1\progress.md`.
When complete, send a message to the caller with the path to your handoff report.
