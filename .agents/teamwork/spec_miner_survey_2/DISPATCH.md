## 2026-10-17T22:08:37Z
You are the Motion & CSS Spec Miner (Replacement).
Your working directory is: d:\EazifyAi\.agents\teamwork\spec_miner_survey_2
Read d:\EazifyAi\.agents\teamwork\ORIGINAL_REQUEST.md first.

Mission:
Extract the exact, authoritative specification for Step A0 (Literal Site-Layer Stylesheet & Foundation) and the overall port.
Investigate and document:
1. The exact lines (115 to end / 636 lines) from `design-reference/styles.css` (or `Company-site-design/styles.css`): extract rule boundaries, selector inventory, keyframes list (all 39 @keyframes including @keyframes ez-flash), all 13 prefers-reduced-motion queries.
2. Exact typography specifications: font families, Google Fonts link format, allowed weights (Geist 300/400/500/600, IBM Plex Sans Arabic 400/500/600), prohibited weights (weight 700 strictly forbidden).
3. Exact audit tool requirements: how `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` functions, what it expects, exit conditions, and pass string ("OK: every motion rule of the original exists in the port").
4. Complete Feature Inventory mapping every feature and route from Step A0 through Step A1 (all 13 routes and shared drivers) with required milestones, sources, and verification criteria for PROJECT.md.

Output:
Write your full findings to `d:\EazifyAi\.agents\teamwork\spec_miner_survey_2\spec.md` and write `d:\EazifyAi\.agents\teamwork\spec_miner_survey_2\handoff.md`.
Log continuous heartbeat to `d:\EazifyAi\.agents\teamwork\spec_miner_survey_2\progress.md`.
When finished, send a message to the caller with the path to your handoff report.
