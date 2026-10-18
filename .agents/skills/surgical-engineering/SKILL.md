---
name: surgical-engineering
description: Use when planning, executing, or surgically editing features in an existing codebase as a Staff Engineer / Tech Lead — enforces Think Before Coding, simplicity-first architecture, a PROJECT_MAP.md external memory, goal-driven TDD verification, and state sync between plan and code. Triggers "follow the protocols", "staff engineer mode", "surgical change", "execute with the protocols".
---

# Surgical Engineering Protocol

## Overview

A three-mode working agreement codifying Staff Engineer discipline:

| Situation | Mode | Entry |
|-----------|------|-------|
| New feature / spec arrives | **PLAN** | State assumptions → protocols P1–P5 → milestone plan → wait for approval |
| Approved plan in hand | **EXECUTE** | Per step: Execute → Verify → Update map. No check-ins |
| Small change to working code | **EDIT** | Impact analysis → surgical change → TDD → sync |

**Core principle:** every line serves the declared user journey; nothing exists without a verified goal and a map entry. If a 50-line solution works, a 200-line one is a defect.

## Mode 1 — PLAN (Planning Protocol)

**Pre-planning (Think Before Coding):**
1. State assumptions about the requirements explicitly.
2. Ambiguity → stop and ask. Never silently pick a path.
3. Propose the simplest solution; reject unnecessary complexity.

**Protocols (sequential):**
- **P1 — Time awareness & dependency reliability:** get the current year/month from the shell, then verify latest stable dependency versions against official sources (npm, GitHub) as of that date. Document versions; never use deprecated ones.
- **P2 — No feature creep:** strictly the requested scope. No extra features, no unrequested flexibility. Map the user journey (GUI) or data flow (API) as *verifiable goals*.
- **P3 — Surgical architecture:** minimum code that solves the problem. Shared/Core layer only for logic that is actually repeated. Domain-based (feature) organization; no micro-files.
- **P4 — Safe logging:** non-blocking (async), simple, essential levels only; must not affect performance.
- **P5 — External memory:** create/update `PROJECT_MAP.md` (see contract below).

**Output:** dense, precise technical summary + milestone plan built from verifiable goals. **Wait for approval.**

## Mode 2 — EXECUTE (Execution Engine)

You have full authority; do not stop to check in. Per step: **1. Execute → 2. Verify → 3. Update the map.**

- **Simplicity:** no speculative code; if it isn't required by a verifiable goal, it doesn't get written.
- **Goal-driven:** define the success criterion BEFORE writing the code; do not move past it until it's met.
- **Production quality:** placeholders and `// TODO` are forbidden. Complete code, error-handled, wired into logging.
- **Self-verification (loop until verified):** automated tests or flow simulation for every part; internally confirm no regression; clean up only orphans you caused.
- **State sync:** update `PROJECT_MAP.md` immediately. Any feature not yet wired appears in `[ORPHANS & PENDING]` and is removed once complete.
- **Flow adherence:** every change traces back to `[SYSTEM_FLOW]`.
- **Done** = `[ORPHANS & PENDING]` is empty and all verifiable goals pass.

## Mode 3 — EDIT (Surgical Change)

- **Only touch what must be touched:** no reformatting adjacent code, no rephrasing old comments, no refactoring working code unless explicitly asked.
- **Match the existing style** even if imperfect.
- **Clean up only your own leftovers:** remove orphans your change created; leave old dead code alone.
- **Impact analysis first:** read `PROJECT_MAP.md`, identify affected files precisely, verify current versions if new tech is needed.
- **DRY + Core layer:** reuse the shared layer; add logging for the new change.
- **TDD:** turn the change into a verifiable goal → failing test → make it pass → confirm old tests still pass (no regression).
- **State sync:** update `PROJECT_MAP.md` immediately; handle or log any code deprecated by the change in pending items.

## PROJECT_MAP.md contract

```markdown
# PROJECT_MAP
[TECH_STACK]      # languages, frameworks, versions, run/test commands
[SYSTEM_FLOW]     # numbered user journeys / data flows — the verifiable goals trace here
[ARCHITECTURE]    # layer/dir map, entry points, key modules and their single responsibility
[ORPHANS & PENDING]  # unwired features, pending migrations, user-side actions owed
```

Update it on every Execute/Edit step. An empty `[ORPHANS & PENDING]` is the definition of done.

## Red flags

| Thought | Reality |
|---------|---------|
| "I'll add this flag just in case" | Feature creep — cut it |
| "It probably works, moving on" | Unverified = not done. Run the test/simulation |
| "I'll fill in the error handling later" | Forbidden. Complete code now |
| "While I'm here, this function could be cleaner" | Surgical rule: only touch what must be touched |
| "PROJECT_MAP can wait until the end" | State sync means immediately, per step |
| "Ambiguous — I'll pick the common approach" | Stop and ask in PLAN; in EXECUTE, rule and record the ruling in the ledger |
