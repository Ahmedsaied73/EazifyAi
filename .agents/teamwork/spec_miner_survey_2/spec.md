# Motion & CSS Specification: Step A0 Foundation & Overall Port

**Document Status**: Authoritative Specification  
**Source Baseline**: `design-reference/styles.css` (commit `bad70d7`), `design-reference/app/`  
**Target Project**: `eazifyai-web` (Next.js 16 App Router, plain CSS, NO Tailwind)  
**Author**: Motion & CSS Spec Miner  
**Date**: 2026-10-17  

---

## 1. Executive Summary & Core Constraints

This document defines the exact, authoritative specification for **Step A0 (Literal Site-Layer Stylesheet & Foundation)** and the **Step A1 (Strict Route-by-Route Migration)** of the EazifyAi website front end.

### Non-Negotiable Core Rules:
1. **Verbatim Site-Layer CSS**: Lines 115 to 750 (636 lines) of `design-reference/styles.css` form the complete, atomic stylesheet. No rules, properties, colors, timings, or keyframes may be altered, substituted, or deleted during Step A.
2. **Zero Animation Libraries**: The entire design runs on plain CSS transitions and keyframes, coordinated by 5 pure JavaScript motion drivers and local state timers. No Tailwind, Framer Motion, GSAP, Radix, or external animation libraries are permitted.
3. **Typography Discipline**: Exactly two font families: **Geist** (weights 300, 400, 500, 600) and **IBM Plex Sans Arabic** (weights 400, 500, 600). **Weight 700 is strictly prohibited** from being loaded in the Google Fonts request.
4. **Audit Gate Zero-Tolerance**: Step A0 foundation certification requires that `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` exits with code 0 and prints:
   `OK: every motion rule of the original exists in the port`.
5. **Exact Preservation of Scaffolding Boundaries**: Lines 1 to 114 of `design-reference/styles.css` are template/Tailwind scaffolding and must never be ported.

---

## 2. Step A0: Site-Layer Stylesheet Specification

### 2.1 File & Rule Boundaries
- **Source File**: `design-reference/styles.css` (or `Company-site-design/styles.css`).
- **Total Lines in Reference**: 751 lines (Line 751 is an empty trailing newline).
- **Scaffolding Section (Lines 1–114, 114 lines)**:
  - Starts: Line 1 (`@import "tailwindcss";`)
  - Contains: Tailwind imports, Quanta custom variants, `@theme` shadcn color mappings, generic reset.
  - Ends: Line 114 (`}`)
  - **Porting Action**: DO NOT PORT.
- **Site-Layer Section (Lines 115–750, exactly 636 lines)**:
  - Starts: Line 115 (`/* EazifyAi site layer: Geist-style tokens, rounded, soft shadows */`)
  - Ends: Line 750 (`.ez-wa a:hover{text-decoration:underline}`)
  - **Porting Action**: COPY VERBATIM into `app/globals.css` / `src/styles/base.css`.
- **Target Verification Metric**:
  `sed -n '115,$p' design-reference/styles.css | wc -l` yields 636 lines (or 637 including trailing newline).

### 2.2 Selector Inventory & Class Taxonomy
- **Total Rule Blocks in Site Layer**: 662 rule blocks.
- **Total Unique Selector Tokens**: 585 tokens.
- **Total Unique CSS Classes**: 282 classes.
- **Class Naming Convention (Public API)**:
  - Site layer components: prefix `.ez-*` (e.g., `.ez-page`, `.ez-glow`, `.ez-top`, `.ez-logo`, `.ez-btn`, `.ez-go`, `.ez-hero`, `.ez-box`, `.ez-m`, `.ez-jr`, `.ez-meter`).
  - Logo component & variants: prefix `.lg-*` (e.g., `.lg-a`, `.lg-h`, `.lg-l`, `.lg-r`, `.lg-s`, `.lg-rich`, `.lg-d1`, `.lg-d2`, `.lg-d3`, `.lg-p`, `.lg-burst`, `.lg-hot`).
  - Scroll reveal: `.rv` (base), `.rv.in` (visible state).
  - Component state classes: `.in`, `.on`, `.ok`, `.open`, `.done`, `.cur`, `.ring`, `.st`, `.ch`, `.c0`, `.c1`, `.c2`, `.c3`, `.g0`, `.g1`, `.g2`, `.r1`, `.r2`, `.r3`, `.s3`, `.s4`, `.a`, `.u`, `.y`, `.lead`.

#### Selector Inventory by Domain Category:
1. **Tokens & Global Shell (Lines 115–124)**:
   - `:root, [data-theme="dark"]`, `[data-theme="light"]`, `html`, `html[data-theme="light"]`, `body`, `:focus-visible`, `::selection`, `.ez-page`, `.ez-glow`.
2. **Navigation, Header & Global Actions (Lines 125–158)**:
   - `.ez-wrap`, `.ez-top`, `.ez-logo`, `.ez-logo b`, `.ez-nav`, `.ez-links`, `.ez-links a`, `.ez-links a:hover`, `.ez-btn`, `.ez-btn:hover`, `.ez-go`, `.ez-go:hover`, `.ez-go:disabled`, `.ez-go.ez-sm`, `.ez-prog`, `[dir="rtl"] .ez-prog`.
3. **Hero Section & Scroll Cue (Lines 159–200)**:
   - `.ez-hero`, `.ez-hero h1`, `.ez-hero b`, `.ez-sub`, `.ez-first`, `.ez-first h1`, `.ez-first .ez-sub`, `.ez-w`, `.ez-cue`, `.ez-cue span`, `.ez-cue i`, `.ez-cue i::after`, `.ez-orb`, `.ez-o1`, `.ez-o2`, `.ez-meet`, `.ez-meet:hover`.
4. **Chat Box, Messages & Brief Table (Lines 201–250)**:
   - `.ez-chatpage`, `.ez-box`, `.ez-assure`, `.ez-assure span`, `.ez-msgs`, `.ez-m`, `.ez-m.ez-a`, `.ez-m.ez-u`, `.ez-dots`, `.ez-dots i`, `.ez-row`, `.ez-row textarea`, `.ez-mic`, `.ez-mic.on`, `.ez-mic.on::after`, `.ez-wave`, `.ez-wave i`, `.ez-card.ez-brief`, `.ez-bar`, `.ez-bar i`, `.ez-tbl`, `.ez-fresh`, `.ez-trust`, `.ez-resume`, `.ez-back`, `.ez-qr`, `.ez-qr button`, `.ez-qr button:hover`.
5. **Logo Vector System & Parallax (Lines 251–300, 600–636)**:
   - `.lg *`, `.lg-a .lg-h`, `.lg-a .lg-l`, `.lg-a .lg-r`, `.lg-a .lg-s`, `.lg-rich .lg-d1`, `.lg-rich .lg-d2`, `.lg-rich .lg-d3`, `.lg-rich.lg-a .lg-l`, `.lg-rich.lg-a .lg-r`, `.lg-rich.lg-a .lg-s`, `.lg-rich.lg-hot .lg-s`, `.lg-burst`, `.lg-p`, `.lg-p.st`, `.lg-p.ch`.
6. **Reveal & Home Sections (Lines 301–380)**:
   - `.rv`, `.rv.in`, `.ez-how`, `.ez-step`, `.ez-sn`, `.ez-sn.on`, `.ez-aud`, `.ez-bento`, `.ez-onb`, `.ez-opt`, `.ez-opt:hover`, `.ez-opt[aria-pressed="true"]`, `.ez-dotsrow`, `.ez-dotsrow i`, `.ez-float`, `.ez-float.on`, `.ez-proof`, `.ez-cta`.
7. **Auth, Login & Profile Elements (Lines 381–460)**:
   - `.ez-av`, `.ez-av::before`, `.ez-av b`, `.ez-ring::before`, `.ez-ping`, `.ez-burst`, `.ez-burst i`, `.ez-str`, `.ez-str i`, `.ez-tag`, `.ez-core`, `.ez-rx`, `.ez-rx.r2`, `.ez-rx.r3`, `.ez-bub`, `.ez-fchip`, `.ez-fl`, `.ez-fl input`, `.ez-fl label`, `.ez-eye`, `.ez-spinner`, `.ez-check path`, `.ez-shake`, `.ez-conv`, `.ez-lockic`, `.ez-ghost`.
8. **Journey, Request, Tracking & Notifications (Lines 461–530)**:
   - `.ez-jr`, `.ez-stp`, `.ez-stp b`, `.ez-sn`, `.ez-bc circle`, `.ez-bc path`, `.ez-bc .ez-burst`, `.ez-ch`, `.ez-trk .ez-ch`, `.ez-tl`, `.ez-tl li`, `.ez-tl li::after`, `.ez-tl .cur .ez-node::after`, `.ez-pdot`, `.ez-sw`, `.ez-sw i`, `.ez-sw i::after`, `.ez-sw[aria-checked="true"] i::after`, `.ez-bell`, `.ez-bell.ring svg`, `.ez-badge`, `.ez-npanel`, `.ez-npanel li`, `.ez-req`, `.ez-req:hover`.
9. **Admin Dashboard (Lines 531–600)**:
   - `@property --p`, `.ez-adm`, `.ez-tab`, `.ez-pane`, `.ez-li`, `.ez-li:hover`, `.ez-det`, `.ez-meter`, `.ez-idea`, `.ez-ev`, `.ez-kpi`, `.ez-chart`, `.ez-line`, `.ez-area`, `.ez-dot2`, `.ez-b2`, `.ez-b2 i`.
10. **Agent Demo (Lines 601–660)**:
    - `.ez-demo`, `.ez-demo-grid`, `.ez-win`, `.ez-dbrief`, `.ez-dm`, `.ez-dm.on`, `.ez-fill`, `.ez-dsucc`, `.ez-dcta`, `.ez-dcta.on`, `.ez-proc`, `.ez-proc b`, `.ez-pn`, `.ez-pn.on`, `.ez-rep`, `.ez-live`, `.ez-ping2`.
11. **Footer, About, Legal, Brand & Preserved (Lines 661–750)**:
    - `.ez-foot`, `.ez-fcols`, `.ez-fcols a`, `.ez-fmark`, `.ez-fcta`, `.ez-fcta:hover`, `.ez-farr`, `.ez-toc`, `.ez-toc a`, `.ez-abchips`, `.ez-yi`, `.ez-num li`, `.ez-fring`, `.ez-ftag`, `.ez-fq`, `.ez-fq.open`, `.ez-fa`, `.ez-ba`, `.ez-arr`, `.ez-thanks`, `.ez-vars`, `.ez-var`, `.ez-tiles`, `.ez-tab2`, `.ez-wa`.

### 2.3 Keyframes Inventory (All 39 Verbatim @keyframes)

The table below lists all 39 `@keyframes` defined in the site-layer stylesheet in exact sequential order, including the critical `@keyframes ez-flash`:

| # | Keyframe Name | Verbatim Frames Body | Target Selectors | Animation Description |
|---|---------------|----------------------|------------------|-----------------------|
| 1 | `@keyframes ez-rise` | `from{transform:translateY(6px);opacity:.01}to{transform:none;opacity:1}` | `.ez-m`, expanded history messages | Subtle upward rise for chat and history message bubbles. |
| 2 | `@keyframes ez-dot` | `0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-3px)}` | `.ez-dots i` | Bouncing typing dots in chat, demo, and meet pill. |
| 3 | `@keyframes ez-flash` | `from{background:rgba(120,169,204,.25)}to{background:transparent}` | `.ez-fresh` | Soft blue background flash on updated table rows. **MUST MATCH VERBATIM.** |
| 4 | `@keyframes lg-up` | `from{transform:translateY(40px);opacity:.01}` | `.lg-a .lg-h` | Upward entrance for the Logo hand vector. |
| 5 | `@keyframes lg-l` | `from{transform:translateX(-40px);opacity:.01}` | `.lg-a .lg-l` | Inward slide from left for left bracket vector. |
| 6 | `@keyframes lg-r` | `from{transform:translateX(40px);opacity:.01}` | `.lg-a .lg-r` | Inward slide from right for right bracket vector. |
| 7 | `@keyframes lg-pop` | `from{transform:scale(.2) rotate(-90deg);opacity:.01}` | `.lg-a .lg-s` | Overshoot spinning pop entrance for Logo star. |
| 8 | `@keyframes lg-float` | `50%{transform:translateY(-6px)}` | `.lg-a .lg-h`, `.lg-a .lg-l`, `.lg-a .lg-r` | Continuous gentle floating drift for logo elements. |
| 9 | `@keyframes lg-pulse` | `50%{transform:scale(1.2)}` | `.lg-a .lg-s` | Continuous scale pulsing for the central Logo star. |
| 10 | `@keyframes ez-drift` | `to{transform:translate3d(40px,-30px,0)}` | `.ez-orb`, `.ez-o2` | Atmospheric drift of background hero color orbs. |
| 11 | `@keyframes ez-up` | `from{transform:translateY(28px);opacity:.01}` | `.ez-w`, `.ez-first .ez-sub`, `.ez-cue`, `.ez-step`, `.ez-jr`, `.ez-ch`, `.ez-tl li`, `.ez-npanel li`, `.ez-pane`, `.ez-li`, `.ez-fill`, etc. | Universal workhorse entrance animation across the site. |
| 12 | `@keyframes ez-wheel` | `60%{transform:translateY(10px)}` | `.ez-cue i::after` | Mouse scroll-wheel down-nudge animation in hero cue. |
| 13 | `@keyframes ez-spin` | `to{transform:rotate(360deg)}` | `.ez-spinner`, `.ez-av::before`, `.ez-ring::before`, `.ez-rx`, `.ez-avr`, `.ez-fring` | Universal linear rotation for loaders, rings, and orbits. |
| 14 | `@keyframes ez-ping` | `from{transform:scale(.6);opacity:.8}to{transform:scale(2);opacity:0}` | `.ez-ping`, `.ez-ping2`, `.ez-mic.on::after`, `.ez-tl .cur .ez-node::after` | Expanding radar ping ring for active states. |
| 15 | `@keyframes ez-fly` | `from{transform:rotate(var(--a)) translateX(10px) scale(1)}to{transform:rotate(var(--a)) translateX(150px) scale(.2);opacity:0}` | `.ez-burst i` | Radial particle burst explosion along angle `--a`. |
| 16 | `@keyframes ez-pop` | `from{transform:scale(.5);opacity:.01}` | `.ez-tag`, `.ez-badge`, `.ez-dsucc`, `.ez-ev`, `.ez-dot2`, `.ez-back`, `.ez-thanks` | Micro-bounce entrance pop for badges, pills, checks. |
| 17 | `@keyframes ez-wig` | `0%,70%,100%{transform:rotate(0)}75%{transform:rotate(-12deg)}85%{transform:rotate(10deg)}92%{transform:rotate(-6deg)}` | `.ez-lockic` | Wiggle vibration for locked history icon. |
| 18 | `@keyframes ez-breathe` | `50%{transform:scale(1.25);opacity:.7}` | `.ez-core` | Core glow breathing pulsation in login orbit. |
| 19 | `@keyframes ez-bob` | `50%{transform:translateY(-10px)}` | `.ez-bub`, `.ez-fchip`, `.ez-ftag` | Vertical bobbing float for floating chips and tags. |
| 20 | `@keyframes ez-draw` | `to{stroke-dashoffset:0}` | `.ez-check path` | SVG stroke drawing on completion checkmarks. |
| 21 | `@keyframes ez-shk` | `20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}` | `.ez-shake` | Horizontal error shake on failed auth/inputs. |
| 22 | `@keyframes ez-d302` | `to{stroke-dashoffset:0}` | `.ez-bc circle` | Journey success large checkmark outer circle draw. |
| 23 | `@keyframes ez-d70` | `to{stroke-dashoffset:0}` | `.ez-bc path` | Journey success large checkmark inner tick draw. |
| 24 | `@keyframes ez-grow` | `from{transform:scaleY(0)}` | `.ez-tl li::after` | Vertical growth of timeline connector lines. |
| 25 | `@keyframes ez-pd` | `50%{transform:scale(1.6);opacity:.5}` | `.ez-pdot`, `.ez-live`, `.ez-qp i.c` | Pulsing radar dot for live status indicators. |
| 26 | `@keyframes ez-ring` | `0%,100%{transform:rotate(0)}15%{transform:rotate(16deg)}30%{transform:rotate(-14deg)}45%{transform:rotate(10deg)}60%{transform:rotate(-8deg)}75%{transform:rotate(4deg)}` | `.ez-bell.ring svg` | Realistic physical bell swinging ring animation. |
| 27 | `@keyframes ez-m` | `from{--p:0}` | `.ez-meter` | Admin score gauge conic fill animation from 0 to `--p`. |
| 28 | `@keyframes ez-dl` | `to{stroke-dashoffset:0}` | `.ez-line` | Admin analytics SVG line chart stroke draw. |
| 29 | `@keyframes ez-fade` | `from{opacity:0}` | `.ez-area` | Admin analytics gradient area fill fade-in. |
| 30 | `@keyframes ez-gx` | `from{transform:scaleX(0)}` | `.ez-b2 i` | Admin analytics horizontal distribution bar growth. |
| 31 | `@keyframes ez-wv` | `0%,100%{transform:scaleY(.3)}50%{transform:scaleY(1)}` | `.ez-wave i` | Voice input active audio waveform equalizer bars. |
| 32 | `@keyframes ez-nudge` | `50%{translate:-5px 0}` | `.ez-arr` (RTL) | Horizontal nudge for RTL arrows. |
| 33 | `@keyframes ez-nudge2` | `50%{translate:5px 0}` | `[dir="ltr"] .ez-arr` | Horizontal nudge for LTR mirrored arrows. |
| 34 | `@keyframes lg-bl` | `50%{translate:-7px 0}` | `.lg-rich.lg-a .lg-l` | Horizontal breathing for left bracket in rich logo. |
| 35 | `@keyframes lg-br` | `50%{translate:7px 0}` | `.lg-rich.lg-a .lg-r` | Horizontal breathing for right bracket in rich logo. |
| 36 | `@keyframes lg-tw` | `50%{rotate:14deg}` | `.lg-rich.lg-a .lg-s` | Rotational twinkle for star in rich logo. |
| 37 | `@keyframes lg-flash` | `0%{transform:scale(1)}30%{transform:scale(1.9) rotate(45deg)}100%{transform:scale(1)}` | `.lg-rich.lg-hot .lg-s` | Interactive click star flash and twist in rich logo. |
| 38 | `@keyframes lg-ring` | `from{transform:scale(.6);opacity:.9}to{transform:scale(4);opacity:0}` | `.lg-burst` | Interactive expanding click burst ring in rich logo. |
| 39 | `@keyframes lg-rise` | `0%{transform:translateY(0) scale(.7);opacity:0}20%{opacity:.5}100%{transform:translateY(-46px) scale(1);opacity:0}` | `.lg-p` | Vertical upward drift and fade for 5 logo particles. |

### 2.4 Reduced-Motion Media Queries Inventory (All 13 Reduce + 1 No-Preference)

The site contains exactly 13 `@media(prefers-reduced-motion:reduce)` blocks and 1 `@media(prefers-reduced-motion:no-preference)` block (14 motion media queries total).

| # | Media Context | Overridden Selectors | Declarations Imposed | End-User Behavior Under Reduced Motion |
|---|---------------|----------------------|----------------------|-----------------------------------------|
| 1 | `@media(prefers-reduced-motion:reduce)` | `.ez-m, .ez-dots i, .ez-fresh` <br> `.ez-bar i, body` | `animation:none` <br> `transition:none` | Instant chat message render; no typing dots bounce; no row flash; theme switch instant. |
| 2 | `@media(prefers-reduced-motion:reduce)` | `.lg *, .ez-orb, .ez-w, .ez-first .ez-sub, .ez-cue, .ez-cue i::after, .ez-step` <br> `.rv` <br> `.ez-float` | `animation:none!important` <br> `transform:none; transition:none` <br> `transition:none` | Hero entrance static at final state; `.rv` elements render in place without scroll translations; float button appears without translation. |
| 3 | `@media(prefers-reduced-motion:reduce)` | `.ez-av::before, .ez-ring::before, .ez-ping, .ez-tag, .ez-conv, .ez-lockic` <br> `.ez-burst` | `animation:none!important` <br> `display:none` | Profile/avatar spinning rings halted; tags appear static; lock icon stops wiggling; particle bursts hidden. |
| 4 | `@media(prefers-reduced-motion:reduce)` | `.ez-core, .ez-rx, .ez-bub, .ez-fchip, .ez-shake, .ez-spinner` <br> `.ez-check path` <br> `.ez-fl label` | `animation:none!important` <br> `animation:none; stroke-dashoffset:0` <br> `transition:none` | Login orbit rings and floating chips freeze; checkmarks rendered complete; label transition instant. |
| 5 | `@media(prefers-reduced-motion:reduce)` | `.ez-jr, .ez-bc circle, .ez-bc path, .ez-ch, .ez-tl li, .ez-tl li::after, .ez-tl .cur .ez-node::after, .ez-pdot` <br> `.ez-bc circle, .ez-bc path` <br> `.ez-bc .ez-burst` | `animation:none!important` <br> `stroke-dashoffset:0` <br> `display:none` | Journey card and timeline appear fully rendered; checkmarks drawn instantly; connector lines full; bursts hidden. |
| 6 | `@media(prefers-reduced-motion:reduce)` | `.ez-bell.ring svg, .ez-badge, .ez-npanel, .ez-npanel li, .ez-req` <br> `.ez-sw i, .ez-sw i::after` | `animation:none!important` <br> `transition:none` | Notification bell static; badges appear instantly; switches snap without sliding transition. |
| 7 | `@media(prefers-reduced-motion:reduce)` | `.ez-pane, .ez-li, .ez-det, .ez-meter, .ez-idea, .ez-ev, .ez-kpi, .ez-line, .ez-area, .ez-dot2, .ez-b2 i` <br> `.ez-line` | `animation:none!important` <br> `stroke-dashoffset:0` | Admin dashboard tabs, lists, and KPI cards render instantly; SVG charts drawn immediately at 100%. |
| 8 | `@media(prefers-reduced-motion:no-preference)` | `html` | `scroll-behavior:smooth` | Smooth scrolling enabled **ONLY** when reduced motion is NOT requested. |
| 9 | `@media(prefers-reduced-motion:reduce)` | `.ez-dm` <br> `.ez-dcta, .ez-rep` <br> `.ez-meet, .ez-ping2, .ez-live, .ez-fill, .ez-dsucc` <br> `.ez-dsucc .ez-burst` <br> `.ez-pn i, .ez-proc b` | `opacity:1; transform:none; transition:none` <br> `opacity:1; transform:none; pointer-events:auto; transition:none` <br> `animation:none!important` <br> `display:none` <br> `transition:none` | Agent demo displays the completed story immediately; chat bubbles and buttons forced visible and interactive. |
| 10 | `@media(prefers-reduced-motion:reduce)` | `.ez-demo-grid` | `transform:none; will-change:auto` | 3D perspective tilt on agent demo disabled; grid lies flat. |
| 11 | `@media(prefers-reduced-motion:reduce)` | `.ez-resume, .ez-back, .ez-assure span, .ez-qr button, .ez-qp i.c, .ez-mic.on::after, .ez-wave i, .ez-ba, .ez-arr, .ez-thanks` <br> `.ez-fa, .ez-fq svg, .ez-qp i` | `animation:none!important` <br> `transition:none` | Chat helper buttons, waveforms, and FAQ accordions snap without animations or transitions. |
| 12 | `@media(prefers-reduced-motion:reduce)` | `.ez-avr, .ez-fring, .ez-ftag, .ez-abchips span` <br> `.ez-yi` <br> `.rv:not(.in) .ez-yi` | `animation:none!important` <br> `transition:none` <br> `stroke-dashoffset:0` | About page founder rings and tags freeze; check/cross icons displayed complete regardless of scroll state. |
| 13 | `@media(prefers-reduced-motion:reduce)` | `.lg-orb, .lg-shine, .lg-p, .lg-burst` <br> `.lg-p` <br> `.lg-d1, .lg-d2, .lg-d3` | `animation:none!important` <br> `display:none` <br> `transition:none` | Logo particles and bursts removed; parallax translation transitions disabled. |
| 14 | `@media(prefers-reduced-motion:reduce)` | `.lg-p` | `animation:none!important; display:none` | Re-enforces hiding of logo particles at stylesheet end (Line 747). |

### 2.5 Audit Tool Failure Diagnosis
- **Command**: `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`
- **Current Exit Code**: 1 (Failure)
- **Error Output**:
  ```
  MISSING in port:
  |@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
  ```
- **Root Cause Analysis**:
  - In `src/styles/base.css`, line 97 was prematurely modified to use CSS `color-mix`:
    `@keyframes ez-flash{from{background:color-mix(in srgb, var(--sky) 25%, transparent)}to{background:transparent}}`
  - In the authoritative reference (`scripts/site-layer.css` and `design-reference/styles.css` line 212), line 98 has:
    `@keyframes ez-flash{from{background:rgba(120,169,204,.25)}to{background:transparent}}`
  - The audit tool performs an exact string comparison of the parsed frames body (`frames: from{background:rgba(120,169,204,.25)}to{background:transparent}`).
  - Because Step A0 mandates literal verbatim copying, substituting `color-mix` violates the Step A0 gate. Restoring the verbatim `rgba(120,169,204,.25)` declaration will immediately resolve the failure.

---

## 3. Typography & Font Specifications

### 3.1 Font Families & Allowed Weights
The project relies on exactly two web font families loaded from Google Fonts:
1. **Geist**:
   - Used for: Latin text, numerals in English mode, wordmark, code, and UI elements.
   - Allowed Weights: **300**, **400**, **500**, **600**.
   - Note: Weight 300 is used exclusively by `.ez-wm` (brand wordmark on `/brand`). Weights 400, 500, 600 are used for body, navigation, and headings.
2. **IBM Plex Sans Arabic**:
   - Used for: Arabic typography (default primary language across all routes).
   - Allowed Weights: **400**, **500**, **600**.

### 3.2 Prohibited Weights & The Weight 700 Rationale
- **Prohibited**: **Weight 700 (Bold) is strictly forbidden** from being included in the Google Fonts link or loaded via font files.
- **Authoritative Rationale**:
  In `design-reference/styles.css`, selector `.ez-fmark` (the watermark logo text in the footer) specifies `font-weight: 700`. However, in the reference app (`__root.tsx`), the Google Fonts stylesheet link specifies weights only up to 600. Consequently, standard CSS font-matching algorithms cause browsers to synthesize or clamp weight 700 down to the nearest available bold weight, which is **600**.
  If an implementer "fixes" this by loading weight 700, the browser will render genuine 700-weight glyphs. This alters the character width, kerning, and ink footprint of the watermark, causing pixel difference test suites to exceed the `<= 0.1%` tolerance threshold.

### 3.3 Exact Google Fonts Link Format
The exact `<link>` tags from `design-reference/routes/__root.tsx` lines 99–101 must be placed into the HTML `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">
```

### 3.4 Fallback Font Stack & Language Typography Invariants
- **Body Font Stack** (verbatim from Line 120):
  `font-family: "Geist", "IBM Plex Sans Arabic", system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif; line-height: 1.7;`
- **Heading Tracking Rules**:
  - Arabic: `:lang(ar) h1, :lang(ar) .ez-h2 { letter-spacing: 0; }` (Arabic script letters connect cursive-style; positive or negative tracking breaks ligatures).
  - English: `h1, .ez-h2 { letter-spacing: -.035em; }` (tight tracking for Latin display headings).
- **Numeral Formatting**:
  - Arabic mode: All dynamic numbers, dates, and times must be formatted with `toLocaleString("ar-EG")` / `toLocaleDateString("ar-EG")` to render proper Arabic-Indic numerals.
  - English mode: Standard Latin numerals.

---

## 4. Motion Audit Tool Requirements

### 4.1 Script Location & Execution
- **Path**: `scripts/audit-motion.mjs` (in `eazifyai-web`).
- **Runtime**: Node.js ESM (`node scripts/audit-motion.mjs <original.css> [port.css]`).
- **Standard Invocation for Gate A0**:
  `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css`

### 4.2 Algorithm & Internal Mechanics
1. **Sanitization (`load`)**:
   Strips all CSS block comments (`/* ... */`) and removes at-rule statements matching `@import`, `@source`, `@custom-variant`, `@plugin`, `@config`, `@layer`.
2. **Recursive Bracket Parsing (`parse`)**:
   Walks character by character, tracking curly bracket depth to correctly parse nested at-rules (`@media`, `@supports`, `@layer`). Maintains context breadcrumbs in `ctx` (e.g. `@media (prefers-reduced-motion: reduce) >> `).
3. **Motion Declaration Filtering (`motionRows`)**:
   - Matches declarations using regex:
     `/^(animation|transition|transform|translate|rotate|scale|will-change|scroll-behavior)/`
   - Keeps all `@keyframes` rules (formatted as `frames: <clean body>`).
   - Keeps all `@property` declarations.
   - In any context containing `prefers-reduced-motion`, keeps **all** declarations in the block (e.g., `display: none`, `stroke-dashoffset: 0`, `opacity: 1`, `pointer-events: auto`).
4. **Tuple Mapping & Verification**:
   - Constructs a unique key for every declaration: `ctx + "|" + r.sel + "|" + d`.
   - Computes set `have` from `port.css`.
   - Filters reference declarations from `original.css` that do not exist in `have`:
     `const missing = A.flatMap((r) => r.decl.map((d) => key(r, d))).filter((k) => !have.has(k));`

### 4.3 Exit Conditions & Outputs
- **Single Argument (Inventory Mode)**:
  Outputs a markdown table of all motion rows, followed by:
  `${A.length} rows, ${A.filter((r) => r.sel.startsWith("@keyframes")).length} keyframes`
- **Two Arguments (Diff Mode)**:
  - **Pass**: If `missing.length === 0`:
    - Prints: `OK: every motion rule of the original exists in the port`
    - Exit code: `0`
  - **Fail**: If `missing.length > 0`:
    - Prints: `MISSING in port:\n` followed by newline-separated list of missing key tuples.
    - Exit code: `1`
- **Zero Arguments**:
  - Prints: `usage: node audit-motion.mjs original.css [port.css]`
  - Exit code: `2`

---

## 5. Complete Feature Inventory: Step A0 through Step A1

### 5.1 Shared Foundation & Motion Drivers (Step A0)

| # | Feature / Driver | File Location | Detailed Specification & Timing | Verification Gate |
|---|------------------|---------------|---------------------------------|-------------------|
| F0.1 | Site-Layer Stylesheet | `src/styles/base.css` | Verbatim copy of lines 115–750 (636 lines). Contains tokens, radii, 39 keyframes, 13 reduced-motion queries. | `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` exits 0 with `OK`. |
| F0.2 | Typography System | `app/layout.tsx` | Geist (300-600) and IBM Plex Sans Arabic (400-600) `<link>` tags in `<head>`. Zero weight 700. | Network inspection confirms no 700 font asset requested; visual diff <= 0.1%. |
| F0.3 | Document Shell & Locale | `app/layout.tsx`, `[locale]/layout.tsx` | Root `<html lang dir data-theme="dark" style="color-scheme:dark" suppressHydrationWarning>`. SSR default `ar`/`rtl`. Wrapped in `<div class="ez-page">` and `<div class="ez-glow">`. | SSR HTML inspection; zero hydration error warnings. |
| F0.4 | Motion Driver J1: `Prog` | `site/Site.tsx` | `requestAnimationFrame`-throttled passive scroll listener. Updates `p = scrollTop / (scrollHeight - clientHeight)`, sets `.ez-prog` `transform: scaleX(p)` and dispatches `ez-prog` event with detail `p`. | Scroll page; `.ez-prog` width tracks scroll from 0 to 100%. |
| F0.5 | Motion Driver J2: `useReveal` | `site/Site.tsx` | `IntersectionObserver` with `rootMargin: "0px 0px -8% 0px"`. Adds `.in` class to `.rv` elements once on entrance, then unobserves. | Scroll page; elements rise 32px into position with `--d` delay. |
| F0.6 | Motion Driver J3: Demo Timeline | `site/Demo.tsx` | IntersectionObserver (50% threshold) triggers 8-step timeline (`GAPS = [500, 1100, 1400, 1400, 1100, 1400, 1500, 1300]`). `--e` scroll tilt ease drives 3D perspective. | Timed frame capture at 0.5s, 1.6s, 3.0s, 4.4s, 5.5s, 6.9s, 8.4s, 9.7s. |
| F0.7 | Motion Driver J4: Logo Parallax | `site/Logo.tsx` | rAF-throttled pointermove sets `--mx`/`--my` (-1 to 1) on `.lg-rich`. Depth groups `.lg-d1`, `.lg-d2`, `.lg-d3` translate. Click triggers 900ms `.lg-hot` + burst ring. Disabled under reduced motion. | Simulated mouse moves to window corners verify depths; click generates burst ring. |
| F0.8 | Motion Driver J5: Count-ups | `profile.tsx`, `admin/Analytics.tsx` | rAF loop using ease-out cubic `v = to * (1 - (1 - p)^3)`. Profile counter: 900ms; Analytics KPIs: 1000ms. | Frame capture at 0ms, 450ms, 900ms verifies interpolated integer values. |
| F0.9 | Motion Drivers J6–J10: Timers | `Site.tsx`, `Chat.tsx`, `Auth.tsx`, `Journey.tsx`, `Legal.tsx` | Bell ring (1400ms), login shake (500ms), copy prompt (1500ms), chat greeting (800ms), job message (1800ms), agent reply (700ms), placeholder rotation (3500ms), auth redirect (1900ms), login redirect (1500ms), journey appear (1300ms), TOC spy (`rootMargin: "-25% 0px -65% 0px"`). | Automated test verifies class addition/removal at exact millisecond marks. |
| F0.10 | Core Components: `Site` | `site/Site.tsx` | Context provider (`useSite`), header with logo, navigation links, lang/theme toggles, `Bell` with dropdown, avatar / login buttons, footer with watermark `.ez-fmark`. Must be rendered per-page (never hoisted). | Pixel diff of header/footer on blank page <= 0.1% across all 8 matrix states. |
| F0.11 | Core Components: `Logo` | `site/Logo.tsx` | SVG logo with hand, brackets, star, 3 parallax depths, particles, burst ring, export of `Logo` and `PATHS`. | Pixel diff <= 0.1% in size 28, 30, 96, 120, 160. |
| F0.12 | Local Store & Storage Mock | `site/store.ts` | LocalStorage mock for users, sessions, chats, requests, notes, drafts. Safe `try/catch` wrapping. | Storage read/write tests; event dispatch verification (`ez-notes`, `ez-chats`, `ez-reqs`, `ez-onb`). |
| F0.13 | Mock Backend API | `lib/mock-api.ts` | Replaces `submitLead` with 400ms artificial delay and identical Zod payload shape. Supports `?fail=1` testing query. | API mock call returns `{ ok: true }` after 400ms. |
| F0.14 | Full i18n Dictionary | `site/i18n.ts` | Exactly 40 top-level keys in both `ar` and `en`. Strict typing: `typeof ar`. | TypeScript compilation verifies 100% key parity between `ar` and `en`. |
| F0.15 | Static Assets | `public/favicon.svg`, `public/og.png` | Dark rounded square SVG favicon and 1200x630 OpenGraph share card. | Asset existence and HTTP 200 response. |
| F0.16 | Preserved Unmounted Components | `site/Fit.tsx`, `site/Faq.tsx` | Fully functional components kept in repo with all styles and i18n keys preserved. | Component files exist; CSS classes `.ez-fq`, `.ez-fa`, `.ez-ba`, `.ez-arr` present. |

---

### 5.2 Route-by-Route Inventory (Step A1)

| Route # | Path | Primary Component | Milestone | Authoritative Source | Required Features & Visual Elements | Verification Criteria |
|---------|------|-------------------|-----------|----------------------|-------------------------------------|-----------------------|
| 1 | `/privacy` | `Legal.tsx` | Milestone A1.1 | `routes/privacy.tsx`, `site/Legal.tsx` | Title "الخصوصية والسياسات", sticky TOC with IntersectionObserver spy, summary card with checkmarks, numbered sections with `.rv` reveals. | Visual diff <= 0.1% (8 combinations); TOC scrolls smoothly to sections. |
| 2 | `/copyright` | `Legal.tsx` | Milestone A1.2 | `routes/copyright.tsx`, `site/Legal.tsx` | Title "حقوق الملكية", dictionary key `cr`, identical sticky TOC and layout structure. | Visual diff <= 0.1%; TOC spy updates active section. |
| 3 | `/about` | `about.tsx` | Milestone A1.3 | `routes/about.tsx` | Hero (logo 120 + 4 animated chips), "what we do / don't" with animated SVG check/cross draw (`.ez-yi`), numbered timeline, AI note card, founder photo with spinning gradient ring (`.ez-fring`) and 3 floating tags (`.ez-ftag`), contact form with honeypot and WhatsApp link. | Visual diff <= 0.1%; check/cross draw on scroll; contact form rate guard (5/hr). |
| 4 | `/` | `index.tsx` | Milestone A1.4 | `routes/index.tsx`, `site/Demo.tsx` | Hero with rich Logo (size 160, parallax, click burst), drifting orbs (`.ez-orb`), headline word stagger (`.ez-w`), scroll cue wheel (`.ez-cue`); AgentDemo with 3D tilt, stepper, 8-step timeline; How section (3 steps); Audience bento (4 cards); Onboarding intake card; Ideas table with status pills; Proof honest card; CTA block; Float button (appears at scroll > 0.78). | Visual diff <= 0.1%; Demo timeline executes 8 steps; Float button appears at 78% scroll. |
| 5 | `/chat` | `Chat.tsx` | Milestone A1.5 | `routes/chat.tsx`, `site/Chat.tsx`, `site/Journey.tsx` | Chat form (`.ez-box`), reassuring checks, message rise animations, typing dots, rotating placeholders (3500ms), voice input mic with animated waveform (`.ez-wave`), quick replies (`.ez-qr`), Back button, resume draft banner (`.ez-resume`), live sticky brief card with progress bar, post-chat 4-step `Journey` stepper with 16-particle burst (`.ez-bc`), call booking, extra form, and history list. | Visual diff <= 0.1%; 4-step chat progression; request `EZ-XXXXX` generation; Journey scroll. |
| 6 | `/login` | `Login.tsx` | Milestone A1.6 | `routes/login.tsx`, `site/Login.tsx` | Two-column layout: Orbit visual with breathing core (`.ez-core`), 3 counter-rotating rings (`.ez-rx`), 4 floating chips (`.ez-fchip`); card form with floating labels, show/hide password, error shake (`.ez-shake`), spinner, check draw, and 1500ms redirect to `/chat`. | Visual diff <= 0.1%; orbit rings rotate continuously; error shake triggers on bad login. |
| 7 | `/register` | `Auth.tsx` | Milestone A1.7 | `routes/register.tsx`, `site/Auth.tsx` | Step-by-step intake (one question per screen: name, email, password), password strength meter (4 bars colored amber/lime/green), 120px logo ping ring (`.ez-ping`), success 16-particle burst, and 1900ms redirect. | Visual diff <= 0.1%; password score calculation; particle burst on success. |
| 8 | `/profile` | `profile.tsx` | Milestone A1.8 | `routes/profile.tsx` | Auth guard redirecting to `/login` if unauthenticated. Avatar ring with spinning gradient, name/email, count-up chat counter (900ms cubic ease), member-since date, tags from onboarding, name/job update inputs, requests list. | Visual diff <= 0.1% with seeded test user; counter counts up from 0 to total. |
| 9 | `/track` | `track.tsx` | Milestone A1.9 | `routes/track.tsx`, `site/Req.tsx` | Request tracking: Letter-by-letter request ID entrance (`.ez-ch`), status pill with pulsing dot (`.ez-pdot`), timeline with growing connector lines (`.ez-grow`), request details table, extra info editor, call picker; empty state with animated logo. | Visual diff <= 0.1% with seeded request; timeline nodes reflect correct state. |
| 10 | `/admin` | `admin.tsx` | Milestone A1.10 | `routes/admin.tsx`, `admin/*.tsx` | Admin auth gate (mock login/setup with session storage); 4 dashboard tabs: Inbox (status chips, score meter, note persistence on blur), Ideas (fit/ease/value sliders, score recalculation), Calendar (7 days x 3 slots grid), Analytics (4 count-up KPIs, 14-day SVG line chart, area fade, distribution bars). | Visual diff <= 0.1%; score meter updates on slider change; KPIs count up. |
| 11 | `/brand` | `brand.tsx` | Milestone A1.11 | `routes/brand.tsx` | Brand asset showcase: 4 logo lockups (dark/light x horizontal/stacked), mark variant tiles (16px to 96px), tab and WhatsApp mock previews, SVG and PNG download buttons. | Visual diff <= 0.1%; SVG and PNG export buttons generate correct downloads. |
| 12 | 404 & Error | `not-found.tsx`, `error.tsx` | Milestone A1.12 | `routes/__root.tsx` | Not found: `.ez-wrap .ez-doc`, heading "الصفحة مش موجودة / Page not found", link to home. Error screen: "حصلت مشكلة / Something went wrong", retry button. | Visual diff <= 0.1%; 404 page renders for nonexistent routes. |
| 13 | Sitemap & Robots | `sitemap.ts`, `robots.ts` | Milestone A1.13 | `routes/sitemap[.]xml.ts`, `routes/robots[.]txt.ts` | `sitemap.xml`: `/` (1.0), `/chat` (0.9), `/about` (0.7), `/privacy` (0.3), `/copyright` (0.3). `robots.txt`: allow `/`; disallow `/admin`, `/profile`, `/track`, `/login`, `/register`, `/brand`. | Valid XML output matching reference URL list and priorities. |

---

## 6. Authoritative Tables

### 6.1 Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Stylesheet | Literal Site Layer | Verbatim copy of lines 115–750 (636 lines) from `design-reference/styles.css`. | Plain CSS input | CSS OM rules | Fails audit script if any rule missing | `design-reference/styles.css` |
| 2 | Keyframes | 39 `@keyframes` | Exact keyframe set including `ez-flash`, `lg-up`, `ez-rise`, `ez-m`, `lg-ring`, `ez-fly`. | Animation time | Interpolated styles | N/A | `scripts/site-layer.css` |
| 3 | Reduced Motion | 13 Reduced Blocks | `@media(prefers-reduced-motion:reduce)` rules that freeze motion and complete draws. | System preference | Instant final state | Fails audit script if altered | `scripts/site-layer.css` |
| 4 | Typography | Dual Font Link | Geist (300-600) + IBM Plex Sans Arabic (400-600) via Google Fonts `<link>`. | Google Fonts API | Font glyphs | Fails visual parity if 700 loaded | `design-reference/routes/__root.tsx` |
| 5 | Motion Driver | Scroll Progress (`Prog`) | Fixed 3px top progress bar tracking scroll progress 0..1. | Window scroll | ScaleX transform & event | Safe fallback to 0 on top | `site/Site.tsx` |
| 6 | Motion Driver | Scroll Reveal (`useReveal`) | IntersectionObserver adding `.in` to `.rv` elements on entering viewport. | DOM viewport intersect | Class `.in` applied | Adds `.in` immediately if IO missing | `site/Site.tsx` |
| 7 | Motion Driver | Demo Timeline | 8-step timed scripted conversation in Agent Demo section. | 50% viewport visibility | Timed UI states | Default to completed step 8 if no JS | `site/Demo.tsx` |
| 8 | Motion Driver | Demo 3D Tilt | Perspective tilt and darkening driven by stepper scroll position `--e`. | Stepper scroll position | Transform perspective | Disabled under reduced motion | `site/Demo.tsx` |
| 9 | Motion Driver | Logo Parallax | Pointer position drives 3 parallax depth groups in rich logo. | Pointermove coordinates | `--mx`, `--my` clamped CSS vars | Disabled if no fine pointer / reduced motion | `site/Logo.tsx` |
| 10 | Motion Driver | Logo Click Burst | Star twist and expanding ring burst on click. | Click event | Temporary `.lg-hot` & burst SVG | Burst hidden under reduced motion | `site/Logo.tsx` |
| 11 | Motion Driver | Count-Ups | Cubic ease-out integer number count-up. | Target number | Animated counter value | Snaps to target immediately under reduced motion | `profile.tsx`, `Analytics.tsx` |
| 12 | Navigation | Site Shell (`Site`) | Header, footer, theme toggle, lang toggle, notification bell. | SiteContext props | Full layout frame | Throws error if used outside provider | `site/Site.tsx` |
| 13 | Chat | Chat Intake & Draft | 4-question interactive chat with audio mic, draft save, and Back button. | User text/voice | Brief card & request ID | Validates contact format; shows error message | `site/Chat.tsx` |
| 14 | Journey | Post-Chat Journey | 4-step stepper with 16-particle burst and letter-by-letter request ID. | Generated request ID | Interactive tracking card | Bursts hidden under reduced motion | `site/Journey.tsx` |
| 15 | Auth | Single-Input Steps | Registration workflow showing one field per step with password meter. | User credentials | Stored mock user & session | Red error text on duplicate/invalid input | `site/Auth.tsx` |
| 16 | Login | Orbit Visual Form | Login form with rotating planetary rings and floating chips. | Email & password | Authenticated session | Triggers `.ez-shake` on invalid login | `site/Login.tsx` |
| 17 | Admin | 4-Tab Dashboard | Inbox, Ideas, Calendar, and Analytics with KPI count-ups and charts. | Mock admin credentials | Interactive control panel | Redirects to admin login if unauthorized | `routes/admin.tsx` |
| 18 | Legal | Sticky TOC Spy | Privacy & Copyright reader with active scroll spy TOC. | Section intersections | TOC active highlight | Collapses TOC on screens < 900px | `site/Legal.tsx` |
| 19 | Brand | Asset Downloader | SVG and PNG logo exports with preview tiles and lockups. | Dimension selections | File downloads | N/A | `routes/brand.tsx` |
| 20 | Backend Seam | Mock API (`submitLead`) | Unified lead submission mock for Chat, Feedback, Extra info, and Contact. | Form payload object | `{ ok: true }` after 400ms | Returns `{ ok: false }` if `?fail=1` | `lib/mock-api.ts` |

---

### 6.2 Edge Cases

| # | Feature | Input / Scenario | Observed / Required Behavior |
|---|---------|------------------|------------------------------|
| 1 | Stylesheet Audit | `@keyframes ez-flash` background color changed to `color-mix(...)` | `audit-motion.mjs` fails with exit code 1; requires exact literal `rgba(120,169,204,.25)`. |
| 2 | Typography | Google Fonts link includes `wght@700` | Browser draws genuine bold 700 for `.ez-fmark` instead of fallback 600, causing visual diff failure > 0.1%. |
| 3 | Reduced Motion | `prefers-reduced-motion: reduce` active on system | All 39 keyframes disabled (`animation: none!important`), transitions set to `none`, Demo displays completed step 8, bursts hidden (`display: none`), strokes set to `stroke-dashoffset: 0`. |
| 4 | Direction Switching | `dir="rtl"` vs `dir="ltr"` | `.ez-prog` transform-origin flips left <-> right; switch thumb translates 20px <-> -20px; arrows mirror (`scale: -1 1`) and use `ez-nudge2` instead of `ez-nudge`. |
| 5 | Screen Resizing | Viewport width < 700px | Desktop navigation pills `.ez-links` hidden (`display: none`); mobile header layout maintained. |
| 6 | Screen Resizing | Viewport width < 900px | Legal TOC `.ez-toc` hidden; content expands to full container width. |
| 7 | Demo Viewport | Section scrolled into view on mobile (< 880px) | 3D perspective tilt shifts from 1400px / 56px / 12deg to 1000px / 36px / 8deg. |
| 8 | Chat Back Button | User clicks "Back" at step 1 or 2 | Removes last answered message from chat array, rolls back brief row, and restores user text into `<textarea>`. |
| 9 | Chat Contact Validation | User enters invalid email / phone at step 3 | Regex `/@.+\..+/` or 8+ digits check fails; agent replies with `t.agent.bad` and does not submit. |
| 10 | Chat Voice Input | Browser speech recognition permission denied | Speech error triggers `t.ch.micDenied` error notification; mic state resets. |
| 11 | Admin Score Meter | Score updated via Fit/Ease/Value sliders | CSS `@property --p` transitions smoothly over 0.9s ease-out from current to new percentage. |
| 12 | History Access | Unauthenticated user opens History accordion | Blurred ghost card shown with lock icon running `ez-wig` animation and login CTA button. |

---

## 7. Verification Method

Independent verification of this specification can be executed via the following concrete commands:

1. **Verify Stylesheet Line Count**:
   ```bash
   sed -n '115,$p' design-reference/styles.css | wc -l
   ```
   *Expected Output*: `636` (or `637` with trailing newline).

2. **Verify Keyframe Count**:
   ```bash
   grep -c "@keyframes" scripts/site-layer.css
   ```
   *Expected Output*: `39`.

3. **Verify Reduced Motion Query Count**:
   ```bash
   grep -c "prefers-reduced-motion:reduce" scripts/site-layer.css
   ```
   *Expected Output*: `13`.

4. **Verify Motion Audit Tool**:
   ```bash
   node scripts/audit-motion.mjs scripts/site-layer.css scripts/site-layer.css
   ```
   *Expected Output*: `OK: every motion rule of the original exists in the port` (Exit code `0`).

5. **Verify Font Links**:
   Inspect `<head>` in `app/layout.tsx` to verify Google Fonts URL has only weights 300, 400, 500, 600 for Geist and 400, 500, 600 for IBM Plex Sans Arabic, with zero instances of `700`.
