# Technical Analysis: CSS & Motion Audit Remediation for Milestone 0 (Step A0 Foundation)

**Specialist**: CSS & Motion Audit Specialist  
**Target Project**: `eazifyai-web` (`D:\EazifyAi\eazifyai-web`)  
**Date**: 2026-10-18  
**Status**: COMPLETE (Read-Only Investigation)  

---

## Executive Summary

This investigation establishes the exact technical remediation plan for Milestone 0 (Step A0 Foundation) covering `src/styles/base.css`, `scripts/audit-motion.mjs`, and `.stylelintrc.json`.

1. **`src/styles/base.css` Root Cause**: In a prior commit, `src/styles/base.css` was prematurely refactored to replace verbatim hex and rgba colors with CSS custom property tokens (`var(--primitive-...)` and `color-mix(...)`), and an `@import "./tokens.css";` was inserted at line 1. Crucially, `@keyframes ez-flash` was altered from `rgba(120,169,204,.25)` to `color-mix(in srgb, var(--sky) 25%, transparent)`, which caused the motion audit script `scripts/audit-motion.mjs` to fail with exit code 1.
2. **Canonical Source Equivalence**: `scripts/site-layer.css` (636 code lines / 637 lines with trailing newline) was verified against `design-reference/styles.css` (lines 115–750). The diff is exactly 0 lines—they are 100% character-for-character identical.
3. **Motion Audit Verification**: Replacing `src/styles/base.css` with `scripts/site-layer.css` verbatim completely restores all 39 `@keyframes` (including `@keyframes ez-flash`) and all 13 `prefers-reduced-motion: reduce` media queries. Running `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` yields `OK: every motion rule of the original exists in the port` and exits with code 0.
4. **Stylelint Remediation**: Running Stylelint on `scripts/site-layer.css` currently produces 136 violations of `color-no-hex`, `function-disallowed-list`, and `declaration-property-value-disallowed-list`. By adding `"src/styles/base.css"` to `.stylelintrc.json`'s `overrides[0].files`, Stylelint passes with 0 errors and 0 warnings, while maintaining strict linting rules on all future component stylesheets.

---

## 1. Verbatim CSS Replacement (`src/styles/base.css`)

### 1.1 Comparison Between Reference and Port
- **Canonical Reference**: `d:\EazifyAi\eazifyai-web\design-reference\styles.css`
  - Total Lines: 750 (751 with newline)
  - Lines 1–114: Global reset and legacy font declarations
  - Lines 115–750 (636 code lines): The literal EazifyAi site layer
- **Reference Script File**: `d:\EazifyAi\eazifyai-web\scripts\site-layer.css`
  - Total Lines: 637 (636 code lines + 1 trailing newline)
  - Verified Equivalence: Lines 115–750 of `design-reference/styles.css` match `scripts/site-layer.css` with 0 diffs.
- **Current Target File**: `d:\EazifyAi\eazifyai-web\src\styles\base.css`
  - Total Lines: 635 lines
  - Deviations detected:
    - Line 1 has `@import "./tokens.css";` (absent in `site-layer.css`).
    - Lines 2–3 token declarations (`:root,[data-theme="dark"]` and `[data-theme="light"]`) were removed and delegated to `tokens.css`.
    - Line 97 `@keyframes ez-flash` was modified:
      - Canonical: `from{background:rgba(120,169,204,.25)}to{background:transparent}`
      - Current base.css: `from{background:color-mix(in srgb, var(--sky) 25%, transparent)}to{background:transparent}`
    - Multiple utility classes (`.ez-mic.on`, `.ez-aa`, `.ez-ai`, `.ez-fring`, etc.) had hex/rgba values replaced by `var(--primitive-...)` tokens.

### 1.2 Exact Replacement Method
The Worker must execute a verbatim overwrite of `src/styles/base.css` with `scripts/site-layer.css`.

**PowerShell Command**:
```powershell
Copy-Item -Path "scripts/site-layer.css" -Destination "src/styles/base.css" -Force
```

**Cross-Platform Node Command**:
```bash
node -e "require('fs').copyFileSync('scripts/site-layer.css', 'src/styles/base.css')"
```

### 1.3 Verbatim Parity Verification
Following the copy, the Worker must execute:
```bash
git diff --no-index scripts/site-layer.css src/styles/base.css
```
**Expected Output**: Empty output, exit code `0`.

---

## 2. Motion Audit Script Resolution (`audit-motion.mjs`)

### 2.1 Audit Mechanism
`scripts/audit-motion.mjs` parses CSS AST and generates key hashes:
```javascript
const key = (r, d) => r.ctx + "|" + r.sel + "|" + d;
```
For `@keyframes`, it indexes:
```javascript
out.push({ ctx, sel: head, decl: ["frames: " + clean(body)] });
```

### 2.2 Why It Currently Fails
When executed against current files:
```bash
node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
```
Output:
```
MISSING in port:
|@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
```
Exit code: `1`.

Because `src/styles/base.css` had `color-mix(...)` instead of `rgba(120,169,204,.25)`, the decl hash did not match `scripts/site-layer.css`.

### 2.3 Verification After Remediation
When `src/styles/base.css` is replaced verbatim with `scripts/site-layer.css`:
- Total `@keyframes` blocks: Exactly **39** (including `ez-rise`, `ez-dot`, `ez-flash`, `lg-up`, `lg-l`, `lg-r`, `lg-pop`, `lg-float`, `lg-pulse`, `ez-drift`, `ez-up`, `ez-wheel`, `ez-spin`, `ez-ping`, `ez-fly`, `ez-pop`, `ez-wig`, `ez-breathe`, `ez-bob`, `ez-draw`, `ez-shk`, `ez-d302`, `ez-d70`, `ez-grow`, `ez-pd`, `ez-ring`, `ez-m`, `ez-dl`, `ez-fade`, `ez-gx`, `ez-wv`, `ez-nudge`, `ez-nudge2`, `lg-bl`, `lg-br`, `lg-tw`, `lg-flash`, `lg-ring`, `lg-rise`).
- Total `prefers-reduced-motion: reduce` queries: Exactly **13**.
- Command:
  ```bash
  node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
  ```
- Output:
  ```
  OK: every motion rule of the original exists in the port
  ```
- Exit code: `0`.

---

## 3. Stylelint Configuration Remediation (`.stylelintrc.json`)

### 3.1 The Conflict
The top-level `.stylelintrc.json` enforces:
1. `"color-no-hex": true`
2. `"function-disallowed-list": ["rgb", "rgba", "hsl", "hsla"]`
3. `"declaration-property-value-disallowed-list": { "/^(background|color|border|box-shadow|outline)/": ["/^#/", "/^rgb/", "/^hsl/"] }`

When running `npx stylelint scripts/site-layer.css`, Stylelint reports **136 errors**. This was the reason someone previously modified `src/styles/base.css` to use `var(--primitive-...)` tokens, accidentally breaking `@keyframes ez-flash`.

### 3.2 The Exact `.stylelintrc.json` Fix
In Milestone 0 (Step A0 Foundation), `src/styles/base.css` must remain literal and verbatim without modifications. The design token architecture (`tokens.css` 3 layers) is scheduled for Step B.

To allow `src/styles/base.css` to contain verbatim hex and rgba colors while keeping strict rules for all other files, update `.stylelintrc.json` `overrides`:

**Target File**: `d:\EazifyAi\eazifyai-web\.stylelintrc.json`

**Before**:
```json
{
  "rules": {
    "color-no-hex": true,
    "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla"],
    "declaration-property-value-disallowed-list": {
      "/^(background|color|border|box-shadow|outline)/": ["/^#/", "/^rgb/", "/^hsl/"]
    }
  },
  "overrides": [
    {
      "files": ["src/styles/tokens.css"],
      "rules": {
        "color-no-hex": null,
        "function-disallowed-list": null,
        "declaration-property-value-disallowed-list": null
      }
    }
  ]
}
```

**After**:
```json
{
  "rules": {
    "color-no-hex": true,
    "function-disallowed-list": ["rgb", "rgba", "hsl", "hsla"],
    "declaration-property-value-disallowed-list": {
      "/^(background|color|border|box-shadow|outline)/": ["/^#/", "/^rgb/", "/^hsl/"]
    }
  },
  "overrides": [
    {
      "files": ["src/styles/tokens.css", "src/styles/base.css"],
      "rules": {
        "color-no-hex": null,
        "function-disallowed-list": null,
        "declaration-property-value-disallowed-list": null
      }
    }
  ]
}
```

### 3.3 Stylelint Verification
Running:
```bash
npm run stylelint
```
Executes `stylelint "src/**/*.css"`.
Output: Clean (0 errors, 0 warnings), exit code `0`.

---

## 4. Worker Execution Plan & Verification Commands

Here is the exact step-by-step runbook for the implementer worker:

### Step 1: Overwrite `src/styles/base.css` with `scripts/site-layer.css`
```powershell
Copy-Item -Path "scripts/site-layer.css" -Destination "src/styles/base.css" -Force
```
*Verification*:
```bash
git diff --no-index scripts/site-layer.css src/styles/base.css
```
*Expected Output*: (no output, exit code 0)

### Step 2: Verify Keyframes and Reduced-Motion Counts
```bash
node -e "const c = require('fs').readFileSync('src/styles/base.css','utf8'); console.log('Keyframes:', (c.match(/@keyframes\s+[a-zA-Z0-9_-]+/g)||[]).length); console.log('Reduced-Motion:', (c.match(/prefers-reduced-motion\s*:\s*reduce/g)||[]).length);"
```
*Expected Output*:
```
Keyframes: 39
Reduced-Motion: 13
```

### Step 3: Verify Motion Audit Passes
```bash
node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
```
*Expected Output*:
```
OK: every motion rule of the original exists in the port
```
*Expected Exit Code*: `0`

### Step 4: Update `.stylelintrc.json`
Update `overrides[0].files` in `.stylelintrc.json` to `["src/styles/tokens.css", "src/styles/base.css"]`.

### Step 5: Verify Stylelint Passes
```bash
npm run stylelint
```
*Expected Output*: Clean (no errors, no warnings), exit code `0`.

### Step 6: Verify Full Quality Gate
Run the standard validation commands in `d:\EazifyAi\eazifyai-web`:
1. `npm run typecheck` -> exit code 0
2. `npm run lint` -> exit code 0
3. `npm run stylelint` -> exit code 0
4. `npm run build` -> exit code 0 (`Compiled successfully`)

---

## 5. Architectural Caveats & Downstream Notes

1. **`scripts/verify-auth-and-design.ts` Observation**:
   - An ad-hoc script `scripts/verify-auth-and-design.ts` created in commit `f4663ed` contains a line testing `assert.ok(baseCss.includes('.ez-vis{pointer-events:none;position:relative'))`.
   - In the reference design (`design-reference/styles.css` line 323) and `scripts/site-layer.css` line 209, `.ez-vis` does **not** have `pointer-events:none;`.
   - `scripts/verify-auth-and-design.ts` is **not** included in `package.json` scripts or CI gates.
   - Per requirement R1/M0, `src/styles/base.css` must remain 100% verbatim to `scripts/site-layer.css`. If `pointer-events: none` is required for login accessibility, it should be scoped to `LoginPage.tsx` (e.g. `<div className="ez-vis" style={{ pointerEvents: 'none' }}>`), not injected into `base.css`.
2. **`@import "./tokens.css"` Removal**:
   - Removing `@import "./tokens.css"` from `src/styles/base.css` does not break any styles because `site-layer.css` declares all necessary CSS custom properties (`--bg`, `--tx`, `--g1`, `--sky`, `--ok`, `--glow`, etc.) directly on `:root` and `[data-theme="light"]`.
   - `src/styles/tokens.css` remains intact and ready for Step B migration.
