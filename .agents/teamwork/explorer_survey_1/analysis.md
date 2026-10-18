# Comprehensive Survey & Analysis Report: Reference Design

**Date**: 2026-10-17  
**Explorer**: Reference Design Explorer (`explorer_survey_1`)  
**Mission**: Survey reference implementation, stylesheet architecture, animation & motion drivers, font specifications, route structures, and verification harness for literal porting of Higgsfield EazifyAi site into `eazifyai-web`.

---

## Executive Summary

The reference design is located at `d:\EazifyAi\eazifyai-web\design-reference\`. It is a pure React + plain CSS application (originally built on TanStack Start / Cloudflare Workers). It does **not** use Tailwind CSS, Radix UI, Framer Motion, GSAP, or any external animation library. Every animation is powered by pure CSS `@keyframes` and transitions, coordinated with five lightweight JavaScript runtime drivers (`Prog`, `useReveal`, `Demo` 3D scroll tilt & timer, `Logo` pointer parallax & click burst, and ease-out count-ups).

Critical baseline observations:
1. **Site Layer Stylesheet**: Lines 115 to 751 (637 lines) of `design-reference/styles.css` constitute the entire design layer. It contains exactly **39 `@keyframes`** and exactly **13 `@media (prefers-reduced-motion: reduce)`** queries.
2. **Current Defect in Port**: Running `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` revealed that `@keyframes ez-flash` is missing from `src/styles/base.css` due to previous token substitution (`color-mix(...)` and CSS variables instead of literal values).
3. **Fonts**: Google Fonts link strictly requests **Geist (300, 400, 500, 600)** and **IBM Plex Sans Arabic (400, 500, 600)**. Weight **700 is strictly absent** from the font link.
4. **Visual Baseline**: 132 reference screenshot baselines (covering all 11 routes, 2 locales `ar`/`en`, 2 themes `dark`/`light`, and 3 viewports `390px`, `768px`, `1280px`) are already captured in `tests/visual/baseline/`.
5. **Runtime Architecture**: All 13 routes and shared drivers have been cataloged with their exact state machines and animation dependencies.

---

## 1. Reference App Location & Directory Structure

- **Root Location**: `d:\EazifyAi\eazifyai-web\design-reference\`
- **Design Snapshot Type**: Complete source tree of the reference application.

```
d:\EazifyAi\eazifyai-web\design-reference\
├── admin\                         # Admin dashboard components
│   ├── Analytics.tsx              # Analytics charts & KPI cards
│   ├── Calendar.tsx               # Call scheduling list & status
│   ├── data.ts                    # Admin state, auth, and mock lead store
│   ├── Ideas.tsx                  # Idea evaluation matrix
│   └── Inbox.tsx                  # Request review, status change & note posting
├── assets\                        # Preset assets & icons
├── components\                    # Scaffolding (shadcn/ui - DO NOT PORT)
├── hooks\                         # Scaffolding (use-mobile.tsx - DO NOT PORT)
├── layouts\                       # Scaffolding (DO NOT PORT)
├── lib\
│   ├── api\
│   │   ├── example.functions.ts   # Scaffolding
│   │   └── lead.functions.ts      # Cloudflare D1 backend call (to be replaced with mockApi)
│   ├── bindings.server.ts         # Scaffolding
│   ├── config.server.ts           # Scaffolding
│   ├── error-capture.ts           # Scaffolding
│   ├── error-page.ts              # Fallback 500 HTML renderer
│   ├── higgsfield-error-reporting.ts # Scaffolding
│   ├── quanta-material-icons.ts   # Scaffolding
│   └── security-headers.server.ts # Server headers
├── module\
│   └── design-inspector\          # Scaffolding (Higgsfield inspector - DO NOT PORT)
├── routes\                        # 15 Route files
│   ├── __root.tsx                 # HTML shell, fonts, notFoundComponent, errorComponent
│   ├── about.tsx                  # /about page
│   ├── admin.tsx                  # /admin gate and dashboard
│   ├── brand.tsx                  # /brand assets preview & download
│   ├── chat.tsx                   # /chat intake interface
│   ├── copyright.tsx              # /copyright legal page
│   ├── index.tsx                  # / (home) landing page
│   ├── login.tsx                  # /login orbit visual & form
│   ├── privacy.tsx                # /privacy legal page
│   ├── profile.tsx                # /profile user dashboard
│   ├── register.tsx               # /register intake flow
│   ├── robots[.]txt.ts            # robots.txt server route
│   ├── sitemap[.]xml.ts           # sitemap.xml server route
│   └── track.tsx                  # /track request timeline
├── site\                          # Core Design Components & Drivers
│   ├── Auth.tsx                   # Step-by-step registration/login flow
│   ├── Chat.tsx                   # Interactive chat & speech recognition
│   ├── contact.ts                 # WhatsApp configuration & constants
│   ├── Demo.tsx                   # AgentDemo 3D scroll tilt & timeline
│   ├── Faq.tsx                    # Unmounted reference component
│   ├── Feedback.tsx               # Rating widget
│   ├── Fit.tsx                    # Unmounted reference component
│   ├── founder.ts                 # Founder metadata
│   ├── History.tsx                # Chat history drawer/list
│   ├── i18n.ts                    # Complete bilingual dictionaries (ar & en)
│   ├── Journey.tsx                # Post-chat journey (4 steps)
│   ├── Legal.tsx                  # Reusable legal layout with TOC & scroll spy
│   ├── Login.tsx                  # Orbit visual and login form
│   ├── Logo.tsx                   # Master SVG logo, parallax & burst driver
│   ├── Proof.tsx                  # Proof/trust card
│   ├── proof.ts                   # Proof data placeholders
│   ├── Req.tsx                    # Request timeline, call picker & extra form
│   ├── seo.ts                    # Page head metadata helper
│   ├── Site.tsx                   # Site wrapper, Prog, useReveal, Bell, header, footer
│   └── store.ts                   # Browser localStorage store & event bus
├── app-meta.json                  # Default OG meta & titles
├── cloudflare-workers.d.ts        # Scaffolding
├── routeTree.gen.ts               # TanStack Router route tree
├── router.tsx                     # TanStack Router initialization
├── server.ts                      # Server fetch entry
├── start.ts                       # TanStack Start initialization
├── styles.css                     # Complete stylesheet (751 lines)
└── svg.d.ts                       # SVG module declarations
```

---

## 2. Examination of `styles.css` (Lines 115 to 751)

### 2.1 File Boundaries
- **Lines 1 to 114**: Scaffolding CSS (Tailwind imports, Quanta styles, `@theme` shadcn color mappings). **DO NOT PORT.**
- **Line 115**: Starts with comment `/* EazifyAi site layer: Geist-style tokens, rounded, soft shadows */`.
- **Lines 115 to 751**: Exactly 637 lines.
- **Reference Extraction**: `d:\EazifyAi\eazifyai-web\scripts\site-layer.css` is an exact, byte-for-byte identical copy of lines 115-751.

### 2.2 Enumeration of All 39 Keyframes

| # | Keyframe Name | Line in `styles.css` | Line in `site-layer.css` | Animation Purpose |
|---|---|---|---|---|
| 1 | `@keyframes ez-rise` | 210 | 96 | General entrance upward fade (`translateY(6px)`) |
| 2 | `@keyframes ez-dot` | 211 | 97 | Pulsing loader dots (`translateY(-3px)`) |
| 3 | `@keyframes ez-flash` | 212 | 98 | Sky highlight flash (`rgba(120,169,204,.25)` fade out) |
| 4 | `@keyframes lg-up` | 223 | 109 | Logo Hand upward entrance (`translateY(40px)`) |
| 5 | `@keyframes lg-l` | 224 | 110 | Logo Left bracket slide-in (`translateX(-40px)`) |
| 6 | `@keyframes lg-r` | 225 | 111 | Logo Right bracket slide-in (`translateX(40px)`) |
| 7 | `@keyframes lg-pop` | 226 | 112 | Logo Star rotation & scale pop (`scale(.2) rotate(-90deg)`) |
| 8 | `@keyframes lg-float` | 227 | 113 | Logo subtle floating oscillation (`translateY(-6px)`) |
| 9 | `@keyframes lg-pulse` | 228 | 114 | Logo Star pulse (`scale(1.2)`) |
| 10 | `@keyframes ez-drift` | 232 | 118 | Glowing background orb drift (`translate3d(40px,-30px,0)`) |
| 11 | `@keyframes ez-up` | 239 | 125 | Card/element entrance slide-up (`translateY(28px)`) |
| 12 | `@keyframes ez-wheel` | 245 | 131 | Mouse scroll cue wheel drop (`translateY(10px)`) |
| 13 | `@keyframes ez-spin` | 271 | 157 | Continuous linear 360° rotation (`rotate(360deg)`) |
| 14 | `@keyframes ez-ping` | 275 | 161 | Radar ping expansion & fade (`scale(2); opacity: 0`) |
| 15 | `@keyframes ez-fly` | 280 | 166 | Radial ray flight outward |
| 16 | `@keyframes ez-pop` | 305 | 191 | Button/badge pop entrance (`scale(.5) -> 1`) |
| 17 | `@keyframes ez-wig` | 319 | 205 | Wiggle rotation (`rotate(-12deg) -> rotate(12deg)`) |
| 18 | `@keyframes ez-breathe` | 326 | 212 | Pulse/breathe scaling (`scale(1.25)`) |
| 19 | `@keyframes ez-bob` | 340 | 226 | Floating tag oscillation (`translateY(-10px)`) |
| 20 | `@keyframes ez-draw` | 353 | 239 | SVG path stroke drawing (`stroke-dashoffset: 0`) |
| 21 | `@keyframes ez-shk` | 355 | 241 | Error shake vibration (`translateX(-8px)` / `8px`) |
| 22 | `@keyframes ez-d302` | 371 | 257 | SVG circle dashoffset completion (length 302) |
| 23 | `@keyframes ez-d70` | 372 | 258 | SVG path dashoffset completion (length 70) |
| 24 | `@keyframes ez-grow` | 385 | 271 | Vertical growth from baseline (`scaleY(0) -> 1`) |
| 25 | `@keyframes ez-pd` | 396 | 282 | Pulsing live indicator dot (`scale(1.6); opacity: .5`) |
| 26 | `@keyframes ez-ring` | 408 | 294 | Notification bell ring wobble (`rotate(16deg) / -14deg`) |
| 27 | `@keyframes ez-m` | 454 | 340 | Registered `@property --p` counter animation |
| 28 | `@keyframes ez-dl` | 480 | 366 | SVG polyline dashoffset draw |
| 29 | `@keyframes ez-fade` | 482 | 368 | Simple opacity fade (`opacity: 0 -> 1`) |
| 30 | `@keyframes ez-gx` | 490 | 376 | Horizontal scale expansion (`scaleX(0) -> 1`) |
| 31 | `@keyframes ez-wv` | 594 | 480 | Voice recording wave equalizer (`scaleY(.3) -> 1`) |
| 32 | `@keyframes ez-nudge` | 614 | 500 | RTL arrow nudge (`translate(-5px, 0)`) |
| 33 | `@keyframes ez-nudge2` | 615 | 501 | LTR arrow nudge (`translate(5px, 0)`) |
| 34 | `@keyframes lg-bl` | 717 | 603 | Logo Left bracket subtle breathing (`translate(-7px, 0)`) |
| 35 | `@keyframes lg-br` | 718 | 604 | Logo Right bracket subtle breathing (`translate(7px, 0)`) |
| 36 | `@keyframes lg-tw` | 719 | 605 | Logo Star twist (`rotate(14deg)`) |
| 37 | `@keyframes lg-flash` | 720 | 606 | Logo Star click burst flash (`scale(1.9) rotate(45deg)`) |
| 38 | `@keyframes lg-ring` | 722 | 608 | Logo Star click ring expansion (`scale(4); opacity: 0`) |
| 39 | `@keyframes lg-rise` | 727 | 613 | Logo background particles rising (`translateY(-46px)`) |

### 2.3 Enumeration of All 13 `prefers-reduced-motion: reduce` Queries

| # | Line in `styles.css` | Line in `site-layer.css` | Target Elements & Applied Overrides |
|---|---|---|---|
| 1 | 213 | 99 | `.ez-m, .ez-dots i, .ez-fresh { animation: none }` <br> `.ez-bar i, body { transition: none }` |
| 2 | 266 | 152 | `.lg *, .ez-orb, .ez-w, .ez-first .ez-sub, .ez-cue, .ez-cue i::after, .ez-step { animation: none!important }` <br> `.rv { transform: none; transition: none }` <br> `.ez-float { transition: none }` |
| 3 | 320 | 206 | `.ez-av::before, .ez-ring::before, .ez-ping, .ez-tag, .ez-conv, .ez-lockic { animation: none!important }` <br> `.ez-burst { display: none }` |
| 4 | 356 | 242 | `.ez-core, .ez-rx, .ez-bub, .ez-fchip, .ez-shake, .ez-spinner { animation: none!important }` <br> `.ez-check path { animation: none; stroke-dashoffset: 0 }` <br> `.ez-fl label { transition: none }` |
| 5 | 397 | 283 | `.ez-jr, .ez-bc circle, .ez-bc path, .ez-ch, .ez-tl li, .ez-tl li::after, .ez-tl .cur .ez-node::after, .ez-pdot { animation: none!important }` <br> `.ez-bc circle, .ez-bc path { stroke-dashoffset: 0 }` <br> `.ez-bc .ez-burst { display: none }` |
| 6 | 422 | 308 | `.ez-bell.ring svg, .ez-badge, .ez-npanel, .ez-npanel li, .ez-req { animation: none!important }` <br> `.ez-sw i, .ez-sw i::after { transition: none }` |
| 7 | 493 | 379 | `.ez-pane, .ez-li, .ez-det, .ez-meter, .ez-idea, .ez-ev, .ez-kpi, .ez-line, .ez-area, .ez-dot2, .ez-b2 i { animation: none!important }` <br> `.ez-line { stroke-dashoffset: 0 }` |
| 8 | 562 | 448 | `.ez-dm { opacity: 1; transform: none; transition: none }` <br> `.ez-dcta, .ez-rep { opacity: 1; transform: none; pointer-events: auto; transition: none }` <br> `.ez-meet, .ez-ping2, .ez-live, .ez-fill, .ez-dsucc { animation: none!important }` <br> `.ez-dsucc .ez-burst { display: none }` <br> `.ez-pn i, .ez-proc b { transition: none }` |
| 9 | 565 | 451 | `.ez-demo-grid { transform: none; will-change: auto }` |
| 10 | 620 | 506 | `.ez-resume, .ez-back, .ez-assure span, .ez-qr button, .ez-qp i.c, .ez-mic.on::after, .ez-wave i, .ez-ba, .ez-arr, .ez-thanks { animation: none!important }` <br> `.ez-fa, .ez-fq svg, .ez-qp i { transition: none }` |
| 11 | 708 | 594 | `.ez-avr, .ez-fring, .ez-ftag, .ez-abchips span { animation: none!important }` <br> `.ez-yi { transition: none }` <br> `.rv:not(.in) .ez-yi { stroke-dashoffset: 0 }` |
| 12 | 723 | 609 | `.lg-orb, .lg-shine, .lg-p, .lg-burst { animation: none!important }` <br> `.lg-p { display: none }` <br> `.lg-d1, .lg-d2, .lg-d3 { transition: none }` |
| 13 | 747 | 633 | `.lg-p { animation: none!important; display: none }` |

### 2.4 Critical Defect Found via `audit-motion.mjs`
Running:
```bash
node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
```
Outputs:
```
MISSING in port:
|@keyframes ez-flash|frames: from{background:rgba(120,169,204,.25)}to{background:transparent}
```
**Cause**: Line 97 of `src/styles/base.css` was previously altered from `rgba(120,169,204,.25)` to `color-mix(in srgb, var(--sky) 25%, transparent)`.  
**Resolution Required for Step A0**: Replace `src/styles/base.css` with a literal copy of `scripts/site-layer.css` without token abstraction.

---

## 3. Font Loading & Weight Inspection

### 3.1 Font Link Definition
In `design-reference/routes/__root.tsx` lines 99-101:
```tsx
links: [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" as const },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap" },
  // ...
]
```

### 3.2 CSS Font-Family Specification
In `design-reference/styles.css` line 120 (and `scripts/site-layer.css` line 6):
```css
body {
  font-family: "Geist", "IBM Plex Sans Arabic", system-ui, -apple-system, "Segoe UI", Tahoma, sans-serif;
}
```

### 3.3 Weight 700 Analysis & Absence
- **Geist Requested Weights**: `300`, `400`, `500`, `600`.
- **IBM Plex Sans Arabic Requested Weights**: `400`, `500`, `600`.
- **Weight 700**: **Strictly absent** in the Google Fonts stylesheet URL.
- **Why weight 700 must NOT be loaded**:
  In CSS line 530 (`styles.css` line 644 / `site-layer.css` line 430), the decorative giant footer watermark has:
  ```css
  .ez-fmark {
    font-size: clamp(3.5rem, 19vw, 13rem);
    font-weight: 700;
    letter-spacing: -.05em;
    line-height: .85;
    /* ... */
  }
  ```
  Because Google Fonts does not serve weight 700, the browser clamps or synthesizes bold from weight 600. Loading real weight 700 alters font rendering metrics, shifting letter spacing and height, causing visual regression in the footer.

---

## 4. Shared Runtime Motion Drivers & State Store

### 4.1 `site/i18n.ts`
- Total lines: 398 lines.
- Type exports: `export type Lang = "ar" | "en";`.
- Language dictionaries: `const ar = { ... }`, `const en: typeof ar = { ... }`.
- Export: `export const T: Record<Lang, typeof ar> = { ar, en };`.
- Dictionary keys: `nav`, `h`, `sub`, `ph`, `chips`, `send`, `trust`, `agent`, `brief`, `how`, `ideas`, `about`, `aud`, `cta`, `ft`, `hook`, `chat`, `onb`, `fit`, `faq`, `feed`, `hist`, `auth`, `log`, `prof`, `trk`, `adm`, `br`, `abt`, `lg`, `fp`, `pl`, `cr`, `foot`, `priv`, `nf`, `lang`, `themeLabel`.

### 4.2 Shared Runtime Drivers

#### `Prog` (Scroll Progress Bar Driver)
- **File**: `site/Site.tsx` lines 166-189
- **Element**: `<div className="ez-prog" ref={r} aria-hidden="true" />` (fixed at `top: 0`, 3px high gradient).
- **Driver Mechanism**:
  1. Passive `scroll` event listener with `requestAnimationFrame` debouncing.
  2. Measures `const p = m > 0 ? d.scrollTop / m : 0` where `m = d.scrollHeight - d.clientHeight`.
  3. Updates DOM directly: `r.current.style.transform = "scaleX(" + p + ")"`.
  4. Dispatches window event: `window.dispatchEvent(new CustomEvent("ez-prog", { detail: p }))`.
  5. RTL handling: CSS `[dir="rtl"] .ez-prog { transform-origin: right }`, LTR defaults to `left`.

#### `useReveal` (Scroll Reveal Intersection Driver)
- **File**: `site/Site.tsx` lines 191-211
- **Driver Mechanism**:
  1. Queries all elements matching `.rv`.
  2. If `IntersectionObserver` is not supported, instantly adds `.in` to all.
  3. Creates `IntersectionObserver` with `rootMargin: "0px 0px -8% 0px"`.
  4. When an element enters within 8% of viewport bottom, adds `.in` class (triggering `transform: translateY(32px) -> none`) and immediately unobserves the element.

#### `Site.tsx` (Root Shell & Layout Wrapper)
- **File**: `site/Site.tsx` lines 1-280
- **Responsibilities**:
  1. Context Provider (`SiteContext`): provides `lang`, `t`, `setLang`, `theme`, `setTheme`, `user`, `setUser`.
  2. Hydrates preferences from `localStorage` (`ez-lang`, `ez-theme`, `ez-session`).
  3. Synchronizes to `document.documentElement`: `d.lang`, `d.dir`, `d.dataset.theme`, `d.style.colorScheme`.
  4. Renders top glow `<div className="ez-glow" />`, `<Prog />`, header `<header className="ez-top">` with Logo, Nav links, Lang toggle, Theme toggle, Notification Bell, User Avatar/Login buttons.
  5. Renders footer `<footer className="ez-foot">` with brand links, WhatsApp contact link, legal links, and giant watermark `<div className="ez-fmark">EazifyAi</div>`.
  6. Renders Notification Bell (`<Bell />`): listens to `ez-notes`, displays unread count badge, wobbles with `.ring` class for 1400ms on new notifications, opens popover.

#### `Logo.tsx` (SVG Logo, Parallax & Burst Driver)
- **File**: `site/Logo.tsx` lines 1-89
- **Geometry**: SVG `viewBox="0 0 450 385"`, aspect ratio 450/385.
- **Layers**:
  - `.lg-d1`: Hand SVG path (`d={HAND}`, `fill="currentColor"`).
  - `.lg-d2`: Left bracket `d={BL}` and Right bracket `d={BR}` (`fill="currentColor"`).
  - `.lg-d3`: Star `d={S}` (`fill="var(--sky)"`), floating particles `BITS` when `rich`, and expanding click ring `<circle className="lg-burst" />` when `hot`.
- **Motion Features**:
  1. `animate` prop (`.lg-a`): plays entrance animations (`lg-up`, `lg-l`, `lg-r`, `lg-pop`) followed by staggered infinite floating & pulsing.
  2. `rich` prop (`.lg-rich`): pointer parallax driver using RAF. Calculates normalized pointer coordinates `px` and `py` in range `[-1, 1]` relative to window center, sets CSS variables `--mx` and `--my` on the SVG element.
  3. Click burst: clicking in `rich` mode triggers `hot=true` for 900ms, mounting `<circle className="lg-burst" />` with keyframe `lg-ring`.
  4. Motion reduction: disables pointer tracking and bursts when `prefers-reduced-motion: reduce` matches.

#### `store.ts` (Client State Management)
- **File**: `site/store.ts` lines 1-96
- **Storage Keys**:
  - `ez-users`: List of registered users with hashed passwords (`sha256(email + ":" + pw)`).
  - `ez-session`: Active user ID.
  - `ez-chats-<id>`: Conversation history per user ID.
  - `ez-reqs`: List of submitted project requests (`Req`).
  - `ez-notes`: In-app notifications list.
- **Event Bus**:
  - `ez-chats`: Dispatched when conversations update.
  - `ez-reqs`: Dispatched when requests are added or modified.
  - `ez-notes`: Dispatched on new note (`detail: "new"`) or read (`detail: "read"`).

#### `lib/mock-api.ts` (Unified Mock API for Next.js SSR)
- **File**: `src/lib/mock-api.ts` (202 lines)
- **Design Pattern**: Dual memory/localStorage store. During Next.js SSR (`typeof window === 'undefined'`), data resides in a memory `Map` to prevent server hydration crashes; in the browser, data synchronizes with `localStorage`.
- **API Methods**:
  - `sessionUser()`, `register()`, `login()`, `logout()`, `updateUser()`
  - `getChats()`, `saveChat()`
  - `getReqs()`, `saveReq()`, `newId()`
  - `getNotes()`, `addNote()`, `readNotes()`

---

## 5. Route Architecture & Component Mapping

| # | Route | Reference Route File | Primary Components | Key Motion & Interactive Features |
|---|---|---|---|---|
| 1 | `/privacy` | `routes/privacy.tsx` | `LegalPage k="pl"`, `site/Legal.tsx` | TOC sticky navigation, IntersectionObserver scroll spy tracking sections `#s0`..`#sN`, `.rv` reveal animations. |
| 2 | `/copyright` | `routes/copyright.tsx` | `LegalPage k="cr"`, `site/Legal.tsx` | TOC sticky navigation with scroll spy, `.rv` reveal animations. |
| 3 | `/about` | `routes/about.tsx` | `site/about.tsx`, `Founder`, `Contact` | Hero with animated Logo size 120, animated chips (`--i`), "Yes/No" cards with SVG animated draw marks (`.ez-yi`), 3-step numbered timeline, founder photo with rotating ring `.ez-fring` and floating tags `.ez-ftag`, contact form with honeypot & WhatsApp CTA. |
| 4 | `/` (home) | `routes/index.tsx` | `Hero`, `AgentDemo`, `How`, `Audience`, `Onboard`, `Ideas`, `Proof`, `CTA`, `Float` | Hero greeting pill, Logo size 160 rich/parallax/burst, word-by-word staggered entrance `.ez-w` with `--i`; `AgentDemo` with 3D scroll tilt perspective `--e` and 8-step timer; 4-card audience bento grid; 4-step interactive onboarding wizard; Ideas table; honest Proof card; floating CTA `Float` triggered when scroll progress > 0.78. |
| 5 | `/chat` | `routes/chat.tsx` | `site/Chat.tsx`, `History`, `Journey`, `Req` | 4-question intake agent, live brief summary card, SpeechRecognition voice input with animated audio wave bars (`.ez-wave i`), draft auto-saving, back button, request creation, post-chat 4-step `Journey`. |
| 6 | `/login` | `routes/login.tsx` | `site/Login.tsx` | Rotating orbital visual (`.ez-vis`, `.ez-core`, 3 orbital rings `.ez-rx r1..r3`, floating audience chips `.ez-fchip`, Logo size 120), floating labels (`.ez-fl`), password visibility toggle, error shake animation (`.ez-shake`), animated success check mark. |
| 7 | `/register` | `routes/register.tsx` | `site/Auth.tsx` | Step-by-step 3-step intake, step counter `i+1 / 3`, password strength meter (`.ez-str` with classes `s1` to `s4`), ping animation (`.ez-ping`), 16-ray success burst (`.ez-burst`), animated Logo size 96. |
| 8 | `/profile` | `routes/profile.tsx` | `routes/profile.tsx` | Profile card with rotating avatar ring (`.ez-ring`), 900ms ease-out cubic animated chat counter (`1 - Math.pow(1 - p, 3)`), user tags with staggered delay, requests list, inline profile edit. |
| 9 | `/track` | `routes/track.tsx` | `site/Req.tsx` (`Timeline`, `ExtraForm`, `CallPicker`) | Request tracker, request ID character-by-character animation (`.ez-ch` with `--i`), pulsing live dot (`.ez-pdot`), interactive timeline with animated nodes, extra details intake, call scheduler. |
| 10 | `/admin` | `routes/admin.tsx` | `admin/Inbox.tsx`, `Ideas.tsx`, `Calendar.tsx`, `Analytics.tsx`, `data.ts` | Gated admin interface (setup/login form), 4-tab panel (`inbox`, `ideas`, `cal`, `stats`), lead status updating, note posting, mock charts. |
| 11 | `/brand` | `routes/brand.tsx` | `routes/brand.tsx` | Brand asset preview & export tool; light & dark horizontal/stacked lockups; mark variants A (Brackets+Star) and B (Hand); instant SVG and PNG 512 downloading. |
| 12 | `not-found` | `routes/__root.tsx` | `NotFoundComponent` | `.ez-wrap .ez-doc` container, bilingual error message, Home CTA. |
| 13 | `error` | `routes/__root.tsx` | `ErrorComponent` | `.ez-wrap .ez-doc` container, bilingual error message, retry button. |
| 14 | `sitemap.xml` | `routes/sitemap[.]xml.ts` | XML generator | Public pages: `/`, `/chat`, `/about`, `/privacy`, `/copyright`. |
| 15 | `robots.txt` | `routes/robots[.]txt.ts` | TXT generator | Allow `/`, disallow `/admin`, `/profile`, `/track`, `/login`, `/register`, `/brand`. |

---

## 6. Local Execution, Baseline Verification & Port Topology

### 6.1 Port Separation
- **Port 3000**: Next.js 16 App Router application (`eazifyai-web`). Run via `npm run dev`.
- **Port 3001**: Backend Fastify / Node API (`eazifyai-api`). Configured with `PORT=3001`.
- **Port 5173 / 3001**: Original reference app (TanStack Start / Vite).

### 6.2 Pre-Captured Baselines
All visual baselines have been captured and verified in:
`d:\EazifyAi\eazifyai-web\tests\visual\baseline\`
Total: **132 screenshot files**
- 11 Routes: `about`, `admin`, `brand`, `chat`, `copyright`, `home`, `login`, `privacy`, `profile`, `register`, `track`
- 2 Locales: `ar`, `en`
- 2 Themes: `dark`, `light`
- 3 Viewports: `390x844` (mobile), `768x1024` (tablet), `1280x800` (desktop)
Formula: $11 \times 2 \times 2 \times 3 = 132$ PNG files.

### 6.3 Automated Parity Test Harness
`scripts/run-visual-tests.mjs` executes automated visual comparison:
1. Launches Chromium via Playwright.
2. Iterates over all 132 viewport / locale / theme / route combinations against `http://localhost:3000`.
3. Injects `ez-lang` and `ez-theme` into localStorage.
4. Compares captured screenshots against `tests/visual/baseline/` using `pixelmatch`.
5. Emits diff images to `tests/visual/diff/` and asserts pixel difference $\le 0.1\%$ (`maxDiffPixelRatio: 0.001`).

---

## 7. Actionable Findings for Step A0 Implementation

1. **Fix `src/styles/base.css`**: Overwrite `src/styles/base.css` with a verbatim copy of `scripts/site-layer.css` (or `design-reference/styles.css` lines 115-751). Verify with:
   ```bash
   node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css
   ```
   Must print: `OK: every motion rule of the original exists in the port`.
2. **Font URL in `app/layout.tsx`**: Retain exact Google Fonts link without weight 700:
   `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap`
3. **Mount `<Site>` inside pages**: Keep `page.tsx` as server components and keep `<Site>` inside each page (not hoisted to layout) so entrance animations replay identically per route navigation.
4. **No Tailwind / No Animation Libraries**: Ensure zero imports of Tailwind, Framer Motion, Radix, or GSAP across all components.
