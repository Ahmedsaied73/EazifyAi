# BRIEFING — 2026-10-17T23:20:00Z

## Mission
Establish the exact technical plan for Milestone 0 (Step A0 Foundation) regarding shared motion drivers (Prog, useReveal, Logo.tsx, Site/SiteLayout.tsx, site/store.ts) and unified mock API (src/lib/mock-api.ts), and verify build/lint commands.

## 🔒 My Identity
- Archetype: explorer
- Roles: Shared Motion Drivers & API Specialist
- Working directory: d:\EazifyAi\.agents\teamwork\explorer_m0_3
- Original parent: cc29a969-b977-43dc-9cdf-00980e2ddb74
- Milestone: Milestone 0 (Step A0 Foundation)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Verify shared runtime motion drivers: Prog, useReveal, Logo.tsx, Site.tsx / SiteLayout.tsx, site/store.ts
- Unified Mock API in src/lib/mock-api.ts with SSR safety (typeof window !== 'undefined')
- Check overall build and lint verification commands: npm run typecheck, npm run lint, npm run stylelint, npm run build
- Output analysis.md and handoff.md in working directory
- Maintain progress.md heartbeat

## Current Parent
- Conversation ID: cc29a969-b977-43dc-9cdf-00980e2ddb74
- Updated: 2026-10-17T23:20:00Z

## Investigation State
- **Explored paths**:
  - `d:\EazifyAi\PROJECT.md`, `ORIGINAL_REQUEST.md`, `docs/ANIMATIONS.md`, `docs/DESIGN_PORT.md`
  - `src/components/layout/SiteLayout.tsx` (Prog, useReveal, SiteContext, Bell, SiteLayout)
  - `src/components/brand/Logo.tsx` (3 layers, pointer parallax, burst)
  - `src/lib/mock-api.ts` (SSR-safe store, missing submitLead)
  - `src/app/[locale]/layout.tsx` and `src/app/[locale]/page.tsx`
  - `src/features/chat/Chat.tsx`, `src/features/journey/Req.tsx`, `src/features/about/AboutContactForm.tsx`
  - `scripts/audit-motion.mjs`, `scripts/site-layer.css`, `src/styles/base.css`
- **Key findings**:
  1. Build/lint scripts: `npm run typecheck`, `npm run lint`, `npm run stylelint`, `npm run build` all pass with exit code 0.
  2. Motion audit script `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` exits with code 1 because `@keyframes ez-flash` in `base.css` used `color-mix(...)` instead of `rgba(...)`.
  3. `Prog`: Fully implemented in `SiteLayout.tsx`, emits `ez-prog`, scales bar, passive scroll listener.
  4. `useReveal`: Implemented in `SiteLayout.tsx` with `rootMargin: "0px 0px -8% 0px"`. BUT Server Component `page.tsx` does not call `useReveal()`, leaving home page `.rv` elements un-animated (`translateY(32px)`). Recommended triggering in `SiteLayout` on pathname change or per-page client wrapper.
  5. `Logo.tsx`: 100% parity in `src/components/brand/Logo.tsx`.
  6. `Site.tsx` vs `SiteLayout.tsx`: In reference, `<Site>` was inside each route to replay entrance animations. In port, `SiteLayout` is in `[locale]/layout.tsx`. Exporting `Site` alias and ensuring entrance animations replay is documented.
  7. `submitLead`: Missing top-level export in `src/lib/mock-api.ts`. All 4 call sites identified (`Chat.tsx`, `Req.tsx`, `Feedback.tsx`, `AboutContactForm.tsx`). Detailed drop-in implementation plan ready.
- **Unexplored areas**: None for M0 scope.

## Key Decisions Made
- Fully documented exact code proposals for `src/lib/mock-api.ts` (`submitLead` and named exports) and `useReveal` lifecycle integration.

## Artifact Index
- `DISPATCH.md` — incoming dispatch records
- `BRIEFING.md` — persistent situational awareness
- `progress.md` — liveness heartbeat
- `analysis.md` — detailed investigation and implementation blueprints
- `handoff.md` — 5-component handoff report
