# ANIMATIONS.md — every animation, transition and motion driver in the EazifyAi site

Source of truth: `design-reference/app/src/styles.css` (site layer, lines 115-750) and the five JS drivers listed in section 1. Nothing here uses an animation library. Copy the CSS verbatim and the JS verbatim; this file explains what each piece does so the port can be verified, not so it can be rewritten.

`ANIMATIONS_INVENTORY.md` is the exhaustive machine-generated list (228 rows, every selector and declaration, 39 keyframes). If this file and the inventory ever disagree, the CSS wins. Run `node scripts/audit-motion.mjs original.css port.css`; it must print `OK`.

Conventions used below: `ez-up` = the shared entrance (translateY 28px + near-transparent, to rest). `E1 = cubic-bezier(.2,.8,.2,1)` (smooth out, used almost everywhere). `E2 = cubic-bezier(.2,1.4,.4,1)` (overshoot pop). `E3 = cubic-bezier(.2,1.2,.4,1)` (soft spring). `E4 = cubic-bezier(.1,.8,.3,1)` (burst). `"both"` fill means the element sits at the `from` state during its delay.

Only `transform`, `opacity`, `translate`/`rotate`/`scale` (individual transform properties), `stroke-dashoffset`, `width` (progress bars), `background` (one flash), `box-shadow` (hover on a pill) and `grid-template-rows` (FAQ, unmounted) are ever animated. Nothing animates `top/left/height/margin`.

---

## 1. JS drivers (the only script-based motion)

| # | Driver | File | What it does |
|---|---|---|---|
| J1 | `Prog` | `Site.tsx` | `requestAnimationFrame`-throttled scroll listener (`passive`). `p = scrollTop / (scrollHeight - clientHeight)`; sets `.ez-prog` `transform: scaleX(p)` and dispatches `window` event `ez-prog` with `detail = p`. |
| J2 | `useReveal` | `Site.tsx` | `IntersectionObserver`, `rootMargin: "0px 0px -8% 0px"`. Adds class `in` to each `.rv` once when it enters, then unobserves. If `IntersectionObserver` is missing, adds `in` to all immediately. Re-run on every page mount. |
| J3 | Demo timers + scroll ease | `Demo.tsx` | Timeline of 8 steps (section 3) and the `--e` scroll ease that drives the 3D tilt. |
| J4 | Logo pointer parallax + click burst | `Logo.tsx` | `pointermove` (rAF-throttled) sets `--mx`/`--my` on the SVG; click toggles `.lg-hot` 900 ms and mounts a ring. Disabled when `prefers-reduced-motion: reduce` or `(pointer: fine)` is false. |
| J5 | Count-ups | `routes/profile.tsx`, `admin/Analytics.tsx` | rAF loop, ease-out cubic `v = to * (1 - (1 - p)^3)`; profile counter 900 ms, analytics KPIs 1000 ms. |
| J6 | Class toggles with timers | `Site.tsx` (bell `ring` 1400 ms), `Login.tsx` (`ez-shake` 500 ms), `Journey.tsx` ("copied" 1500 ms) | Add a class/state, remove it with `setTimeout`. |
| J7 | Chat timers | `Chat.tsx` | 800 ms greeting, 1800 ms job message, 700 ms agent reply (200 ms on failure), placeholder rotation every 3500 ms, `scrollIntoView({block:"nearest"})` on each message. |
| J8 | Redirect delays | `Auth.tsx` 1900 ms, `Login.tsx` 1500 ms | success animation plays, then navigate to `/chat`. |
| J9 | Journey entrance | `Journey.tsx` | mounts 1300 ms after the request exists, then `scrollIntoView({behavior:"smooth", block:"start"})`. |
| J10 | TOC spy | `Legal.tsx` | `IntersectionObserver`, `rootMargin: "-25% 0px -65% 0px"`; sets the active TOC item. Its highlight changes via CSS transition (.25 s). |

Global: `@media(prefers-reduced-motion:no-preference){html{scroll-behavior:smooth}}`; `body{transition:background .25s,color .25s}` (theme switch cross-fade).

---

## 2. Home hero and the logo

### 2.1 Hero entrance (`Hero` in `routes/index.tsx`, section `.ez-first`)
All entrances use `animation-fill-mode: both`, so before their delay everything is hidden.

| Element | Class | Animation | Start (s) | Duration | Easing |
|---|---|---|---|---|---|
| Logo hand | `.lg-a .lg-h` | `lg-up` (from translateY(40px), opacity .01) then loops `lg-float 5s ease-in-out infinite` after .9 s | 0 | .9 | `cubic-bezier(.2,.8,.2,1)` |
| Left bracket | `.lg-a .lg-l` | `lg-l` (from translateX(-40px)) + `lg-float` loop (starts 1.05 s) | .15 | .9 | same |
| Right bracket | `.lg-a .lg-r` | `lg-r` (from translateX(40px)) + `lg-float` loop (starts 1.05 s) | .15 | .9 | same |
| Star | `.lg-a .lg-s` | `lg-pop` (from scale(.2) rotate(-90deg), opacity .01) + `lg-pulse 3.2s ease-in-out infinite` (starts 1.4 s) | .5 | .9 | `cubic-bezier(.2,1.4,.4,1)` (E2) |
| Headline words | `.ez-w` | `ez-up` | `0.7 + 0.07 x i` (i = word index from `--i`) | .8 | E1 |
| Subtitle | `.ez-first .ez-sub` | `ez-up` | 1.6 | .8 | E1 |
| "Meet the agent" pill | `.ez-meet` | `ez-up`; hover: `transform: translateY(-2px)` over .2 s | 1.9 | .8 | E1 |
| Scroll cue | `.ez-cue` | `ez-up` | 2.2 | .8 | default ease |
| Cue wheel | `.ez-cue i::after` | `ez-wheel 1.6s ease-in-out infinite` (dot slides down 10px at 60%) | - | 1.6 | ease-in-out |
| Background orbs | `.ez-orb` | `ez-drift 16s ease-in-out infinite alternate` (to `translate3d(40px,-30px,0)`); `.ez-o2` uses `20s` and `alternate-reverse` | - | 16 / 20 | ease-in-out |
| Typing dots inside the meet pill | `.ez-dots i` | `ez-dot 1s infinite ease-in-out`, delays 0 / .15 / .3 s (each dot hops up 3px at 40%) | - | 1 | ease-in-out |

The headline is `t.hook.h.split(" ")`, one `<span class="ez-w" style="--i:N">` per word, so word timing depends on the number of spaces in the Arabic/English string.

### 2.2 The logo in `rich` mode (hero only: `<Logo size={160} animate rich />`)
Structure: three depth groups. `.lg-d1` (hand), `.lg-d2` (brackets), `.lg-d3` (star, particles, burst). All SVG children use `transform-box: fill-box; transform-origin: center` (`.lg *`), which is why they rotate/scale around their own center.

| Motion | Selector | Detail |
|---|---|---|
| Parallax | `.lg-rich .lg-d1/.lg-d2/.lg-d3` | `translate: calc(var(--mx) * -5px) calc(var(--my) * -4px)` (hand), `* 8px / 6px` (brackets), `* 14px / 10px` (star group). Follows the pointer; `transition: translate .4s ease-out` on all three. `--mx`/`--my` are the pointer offset from the logo center divided by half the window, clamped to -1..1. |
| Bracket breathing | `.lg-rich.lg-a .lg-l` / `.lg-r` | adds `lg-bl` / `lg-br` (`translate: -7px 0` / `7px 0` at 50%), `3.2s ease-in-out 1.4s infinite`, on top of entrance + float |
| Star twinkle | `.lg-rich.lg-a .lg-s` | adds `lg-tw` (`rotate: 14deg` at 50%), `3.2s ease-in-out 1.4s infinite`, on top of pop + pulse |
| Rising particles | `.lg-p` (5 of them: star, 2 bracket shards, a slash, a small star; gray `var(--mu)`) | `lg-rise 4.2s ease-out infinite`, delay `calc(var(--i) * .8s + 2s)`; 0%: translateY(0) scale(.7) opacity 0 -> 20%: opacity .5 -> 100%: translateY(-46px) scale(1) opacity 0. Stars are filled (`.lg-p.st`), brackets are 2.2px round strokes (`.lg-p.ch`). |
| Click burst | `.lg-hot .lg-s` + `circle.lg-burst` | star: `lg-flash .8s ease-out` (scale 1 -> 1.9 + rotate 45deg at 30% -> 1). Ring: `lg-ring .9s ease-out both` (scale .6 -> 4, opacity .9 -> 0), 3px sky stroke, mounted with a changing `key` so each click replays it. |
| Smaller animated logos | `<Logo animate>` (no `rich`) on /login visual (120), /register (96), /about hero (120), legal header (56), /track empty state (96) | Entrance + float + pulse only (the `.lg-a` rows of the table above). No parallax, particles or click burst. |
| Static logos | header (28), footer (30), demo avatar (22), /brand lockups | no motion |

`prefers-reduced-motion: reduce` -> `.lg *, .lg-orb, .lg-shine, .lg-p, .lg-burst {animation:none!important}`, particles hidden (`display:none`), parallax transitions off, pointer listener never attached.

---

## 3. Agent demo section (`#agent`, `Demo.tsx`)

### 3.1 Scripted timeline
Starts when the chat window `.ez-win` is **50% visible** (`IntersectionObserver threshold .5`, fires once). `GAPS = [500, 1100, 1400, 1400, 1100, 1400, 1500, 1300]` ms; each step is scheduled at the cumulative sum, so step N fires at:

| Step | Time from start | What appears |
|---|---|---|
| 1 | .5 s | visitor message 1; brief row 1 (problem) fills |
| 2 | 1.6 s | agent bubble appears showing typing dots |
| 3 | 3.0 s | agent bubble 1 becomes text |
| 4 | 4.4 s | visitor message 2; brief row 2 (who) fills |
| 5 | 5.5 s | agent bubble 2 with typing dots |
| 6 | 6.9 s | agent bubble 2 becomes text |
| 7 | 8.4 s | visitor message 3 (contact); brief row 3 fills |
| 8 | 9.7 s | agent final message; status pill "Received" turns green; progress bar full; success row with burst; "Try it yourself" + "Replay" fade in |

Process stepper phase: `ph = step<=0 ? -1 : step<=3 ? 0 : step<=6 ? 1 : 2`; node `i` is "on" when `i <= ph`; the connecting line width is `calc(66.8% * var(--f))` with `--f = max(0, ph) / 2`.
Brief progress bar width: `filled / 4 * 100%` where `filled` = number of filled rows (+1 at step 8).
Replay button: sets `seen=true` and bumps a counter; the effect re-runs, resets to step 0 and reschedules the same timeline.
Initial state is `step = 8` (the finished story), so server render, no-JS and reduced-motion users see everything. If reduced motion is off and `IntersectionObserver` exists, the effect immediately resets to `step = 0` and waits.

### 3.2 Per-element motion

| Element | Class | Motion |
|---|---|---|
| Chat bubbles | `.ez-dm` -> `.ez-dm.on` | from `opacity:0; transform: translateY(18px) scale(.94)` to rest; `transition: transform .5s cubic-bezier(.2,1.2,.4,1) (E3), opacity .35s` |
| Typing dots | `.ez-dots i` | `ez-dot 1s infinite ease-in-out`, delays 0 / .15 / .3 s |
| Avatar ping | `.ez-ping2` | `ez-ping 1s ease-out both` (scale .6 -> 2, opacity .8 -> 0), re-mounted on every step by `key={step}` so it pulses at each event |
| Live dot | `.ez-live` | `ez-pd 1.6s ease-in-out infinite` (scale 1.6 + opacity .5 at 50%) |
| Skeleton -> value | `.ez-sk` -> `.ez-fill` | the skeleton bar is replaced by the text, which plays `ez-up .5s E1 both` |
| Progress bar | `.ez-bar i` | `transition: width .4s ease-out` |
| Success row | `.ez-dsucc` | `ez-pop .5s E2 both` (from scale .5, opacity .01) + a 14-particle burst (section 8) + the check icon draw (`.ez-check path`, section 6) |
| Process line | `.ez-proc b` | `transition: width .8s E1` |
| Process nodes | `.ez-pn i` | `transition: background .4s, transform .4s`; "on" = gradient `135deg sky -> #7c6cf0`, `scale(1.1)`, black glyph |
| Actions | `.ez-dcta`, `.ez-rep` | hidden `opacity:0; pointer-events:none` (CTA also `translateY(16px) scale(.9)`); `.on` shows them; CTA `transition: transform .5s E2, opacity .3s`; replay `transition: opacity .3s` |

### 3.3 Scroll-driven 3D tilt and darkening (the "chat box leaning back")
`--e` is computed on every scroll/resize (rAF-throttled, set on the `#agent` section): `e = clamp((viewportHeight * 0.9 - procLine.top) / (viewportHeight * 0.55), 0, 1)` where `procLine` is `.ez-proc` (the stepper). It is 0 while the section is below the fold and reaches 1 once the stepper has scrolled up past ~35% of the viewport.

```css
.ez-demo-grid{transform:perspective(1400px) translateY(calc((1 - var(--e,1)) * 56px)) rotateX(calc((1 - var(--e,1)) * 12deg));transform-origin:50% 100%;will-change:transform}
@media(max-width:879px){.ez-demo-grid{transform:perspective(1000px) translateY(calc((1 - var(--e,1)) * 36px)) rotateX(calc((1 - var(--e,1)) * 8deg))}}
.ez-win::after,.ez-dbrief::after{background:#000;opacity:calc(max(0, 1 - var(--e,1) * 1.6) * .32)}   /* subtle darkening that fades out */
```
Reduced motion: `transform:none; will-change:auto`; the demo shows its finished state.

---

## 4. Reveal-on-scroll and the progress bar

| Piece | CSS | Behavior |
|---|---|---|
| `.rv` | `transform: translateY(32px); transition: transform .8s cubic-bezier(.2,.7,.2,1); transition-delay: var(--d,0s)`; `.rv.in{transform:none}` | Moves up 32px into place when it enters the viewport (`useReveal`). **Transform only, no opacity**, so content is never invisible without JS. Stagger via inline `--d`: `i*0.1s` (How steps, About steps), `i%2 * .1s` (audience cards), `i*.06s` (FAQ), `.12s` / `.15s` (About cards/bio). |
| Reduced motion | `.rv{transform:none; transition:none}` | |
| `.ez-prog` | fixed top, 3px, `z-index:50`, gradient `90deg sky -> #7c6cf0 -> #2563eb`, `transform: scaleX(p)`, origin left (right under `[dir=rtl]`) | updated by J1 each frame |
| `.ez-float` (home bottom CTA) | `transform: translateY(140px)` -> `none` when `.on`; `transition: transform .5s E1`; `.ez-float a` has a blue glow shadow | `.on` toggled when `ez-prog` detail `> 0.78` |

---

## 5. Onboarding card (home), buttons, inputs

| Element | Motion |
|---|---|
| `.ez-step` (each onboarding question / auth screen / journey step) | `ez-up .5s E1 both`; React `key` changes on every step so it replays |
| `.ez-dotsrow i` | `transition: width .3s, background .3s`; the active dot is 24px wide sky, others 8px |
| `.ez-opt` (option chips) | hover `transform: translateY(-2px)` (`transition: transform .2s`); `[aria-pressed=true]` -> gradient `135deg #2563eb -> #4f46e5`, white text |
| `.ez-btn:hover`, `.ez-go:hover` | `.ez-btn:hover{background:var(--g3)}`; `.ez-go:hover{filter:brightness(.88)}` (no transition) |
| `.ez-in:focus`, `.ez-big:focus`, `.ez-fl input:focus` | box-shadow ring becomes 2px sky (`.ez-fl input` has `transition: box-shadow .2s`) |
| Floating label | `.ez-fl label` rises with `transform: translateY(-10px) scale(.78)` + color sky when the input is focused or not empty (`placeholder=" "` trick, `:not(:placeholder-shown)`); `transition: transform .2s, color .2s`; origin `left top` (`right top` in RTL) |
| `.ez-sw` switch | track `transition: background .25s`; thumb `transition: transform .25s E3`; checked = `translateX(20px)` (`-20px` in RTL), gradient track |

---

## 6. SVG draw-on and "pop" micro-motions

| Name | Selector | Detail |
|---|---|---|
| Check draw | `.ez-check path` | `stroke-dasharray:24; stroke-dashoffset:24; animation: ez-draw .5s .1s ease-out forwards` (stroke draws on). Used in login button success, demo success row, feedback "thanks". |
| Big success check | `.ez-bc circle`, `.ez-bc path` | circle `stroke-dasharray:302` draws with `ez-d302 .8s ease-out forwards`; tick `stroke-dasharray:70` draws with `ez-d70 .5s .7s ease-out forwards` |
| Yes/No icons (About) | `.ez-yi` | `stroke-dasharray:30; stroke-dashoffset:0; transition: stroke-dashoffset .6s E1; transition-delay: calc(var(--i) * .12s + .3s)`; while the parent `.rv` is not `.in` the offset is 30 (hidden), so the marks draw when the card scrolls in |
| Pop | `ez-pop` (from scale(.5) opacity .01) | used by `.ez-tag` (delay `i*120ms`, `.5s E2`), `.ez-badge` (.4s E2), `.ez-back` (.4s E2), `.ez-dsucc` (.5s E2), `.ez-ev` (.4s E2), `.ez-thanks` (.5s E2), `.ez-dot2` chart dots (.4s E2) |
| Shake | `.ez-shake` | `ez-shk .45s`: translateX -8px at 20/60%, +8px at 40/80%; added for 500 ms on a failed login |
| Spinner | `.ez-spinner` | 18px ring, `border-top-color:transparent`, `ez-spin .7s linear infinite` |

---

## 7. Chat page

| Element | Class | Motion |
|---|---|---|
| Message in | `.ez-m` | `ez-rise .26s ease-out both` (translateY(6px), opacity .01 -> rest). In History expanded bodies each message also gets inline `animation-delay: k*60ms` |
| Agent typing | `.ez-dots` | 3 dots `ez-dot 1s infinite ease-in-out`, delays 0/.15/.3 s |
| New brief row highlight | `.ez-fresh` | `ez-flash 1.4s ease-out` (background `rgba(120,169,204,.25)` -> transparent); the `<tr>` is re-keyed by value so it replays when the answer changes |
| Brief progress | `.ez-bar i` | `transition: width .4s ease-out` (`filled/4`) |
| Reassurance checks | `.ez-assure span` | `ez-up .6s E1 both`, delay `calc(var(--i) * 140ms + 300ms)` |
| Quick replies | `.ez-qr button` | `ez-up .45s E1 both`, delay `calc(var(--i) * 70ms)`; hover lift 2px; the container is re-keyed per step so they re-enter each question |
| Back button | `.ez-back` | `ez-pop .4s E2 both` |
| Resume banner | `.ez-resume` | `ez-up .5s E1 both` |
| Mic (listening) | `.ez-mic.on` | gradient `135deg #ef4444 -> #f97316`, white; `::after` ring `ez-ping 1.2s ease-out infinite`; `transition: background .25s` |
| Voice bars | `.ez-wave i` | 4 bars `ez-wv .9s ease-in-out infinite` (scaleY .3 <-> 1), delays 0 / .15 / .3 / .45 s |
| Unused (CSS exists, not rendered) | `.ez-qp`, `.ez-qbar` progress pills | the question counter pills were removed by the founder; keep the CSS: `.ez-qp i.c` pulses with `ez-pd 1.6s` |
| Auto scroll | JS | `scrollIntoView({block:"nearest"})` |
| Placeholder | JS | rotates every 3500 ms until the visitor starts |

---

## 8. Burst particles (shared by 3 places)

`.ez-burst` (absolute, inset 0, no pointer events) holds N `<i>` dots (9x9, sky; every 3rd is `#7c6cf0`, every 3rd+1 is `#2563eb`). Each dot has inline `--a = k * (360 / N)deg` and animates `ez-fly 1.1s E4 both`: from `rotate(var(--a)) translateX(10px) scale(1)` to `rotate(var(--a)) translateX(150px) scale(.2)` with opacity -> 0.

| Where | N | Notes |
|---|---|---|
| Journey success (`.ez-bc`) | 16 (22.5deg) | the `.ez-bc .ez-burst` wrapper has `animation:none`; dots use `animation-delay:.8s` so the burst fires right after the circle finishes drawing |
| Register success (`.ez-authlogo`) | 16 | plays immediately |
| Demo success row (`.ez-dsucc`) | 14 | positioned at the check icon: `inset-inline-start:24px; inset-inline-end:auto; width:0` |

Reduced motion: `.ez-burst{display:none}` in all contexts.

---

## 9. Journey, timeline, tracking

| Element | Class | Motion |
|---|---|---|
| Journey card | `.ez-jr` | `ez-up .7s E1 both`; smooth scrolls into view 1300 ms after the request is created |
| Stepper | `.ez-stp b` | fill width `calc((100% - 32px) * var(--p))` with `--p = step / 3`, `transition: width .6s E1`; gradient flips to `270deg` under RTL |
| Stepper node | `.ez-sn.on i` | gradient `135deg sky -> #7c6cf0`, black text, `scale(1.12)`; `transition: background .3s, transform .3s` |
| Request ID | `.ez-ch` | each character `ez-up .6s E1 both`, delay `calc(.9s + var(--i) * 70ms)` (on /track: `calc(var(--i) * 70ms)`, no .9 s offset) |
| Timeline item | `.ez-tl li` | `ez-up .6s E1 both`, delay `calc(var(--i) * 180ms)` |
| Timeline connector | `.ez-tl li::after` | vertical 2px line, `transform-origin: top`, `ez-grow .5s both` (scaleY 0 -> 1), delay `calc(var(--i) * 180ms + 300ms)`; done items are green (`var(--ok)`); the last item has no connector |
| Current node pulse | `.ez-tl .cur .ez-node::after` | ring `ez-ping 1.6s ease-out infinite` |
| Status dot | `.ez-pdot` | `ez-pd 1.4s ease-in-out infinite` |
| "Numbered" About timeline | `.ez-num li`, `.ez-num li::after` | `animation:none` (reveals use `.rv` instead) |
| Request rows (profile) | `.ez-req` | `ez-up .5s E1 both`, delay `i*80ms`; hover `translateY(-2px)` (`transition: transform .2s`) |

---

## 10. Auth pages

| Element | Motion |
|---|---|
| Register logo ping | `.ez-ping` (120px ring) `ez-ping 1s ease-out both`, re-mounted on every question (`key={i + (ok ? "x" : "")}`) so each step pulses |
| Register steps | `.ez-step` re-keyed per question (`ez-up .5s`); counter `1 / 3`; password strength bars `.ez-str i` `transition: background .3s` (amber / lime / green by score) |
| Register success | burst (16) + headline `.ez-step`; redirect after 1900 ms |
| Login visual | `.ez-core` `ez-breathe 4s ease-in-out infinite` (scale 1.25, opacity .7 at 50%); rings `.ez-rx` `ez-spin 22s linear infinite` (`.r2` 34 s reverse, `.r3` 48 s), each with a 10px orbiting dot (sky / `#7c6cf0` / `#2563eb`); chat bubble `.ez-bub` `ez-bob 5s ease-in-out infinite`; four chips `.ez-fchip` `ez-bob 6s ease-in-out infinite` with delays `0`, `-2s`, `-4s`, `-1s` (classes `c0`-`c3`, positioned with logical `inset-inline-*`) |
| Login interactions | floating labels, show/hide button, `ez-shake`, spinner, check draw; redirect after 1500 ms |
| Avatar ring (header) | `.ez-avr` SVG ring `ez-spin 6s linear infinite` (stroke gradient `#78a9cc -> #7c6cf0 -> #2563eb`); the CSS `::before/::after` ring on `.ez-av` is disabled (`content:none`) |
| Profile ring | `.ez-ring::before` conic gradient ring `ez-spin 8s linear infinite` (animation-duration overridden to 8 s), masked to a 2px ring |

---

## 11. Profile, history, notifications

| Element | Motion |
|---|---|
| Chat counter | J5, 900 ms ease-out cubic |
| Tags | `.ez-tag` `ez-pop .5s E2 both`, delay `i*120ms` |
| History rows | `.ez-conv` `ez-up .5s E1 both`, delay `i*80ms` |
| Locked history | `.ez-ghost` blurred (`filter: blur(5px); opacity .6`); lock icon `.ez-lockic` `ez-wig 3s ease-in-out infinite` (wiggle at 75/85/92%: -12deg, +10deg, -6deg) |
| Bell ring | `.ez-bell.ring svg` `ez-ring 1.2s ease-in-out`, origin `50% 0`, rotates 16 / -14 / 10 / -8 / 4deg |
| Badge | `.ez-badge` `ez-pop .4s E2 both`, re-mounted per unread count |
| Notification panel | `.ez-npanel` `ez-up .3s E1 both`; each `li` `ez-up .4s E1 both` with inline `animation-delay: i*60ms` |

---

## 12. About page

| Element | Motion |
|---|---|
| Hero | two orbs (section 2.1), animated logo (section 2.2 table), chips `.ez-abchips span` `ez-up .6s E1 both` delay `calc(1s + var(--i) * 120ms)` |
| Sections | `.rv` reveals |
| Yes/No icons | stroke draw (section 6) |
| Founder photo | ring `.ez-fring` conic gradient `ez-spin 10s linear infinite` behind the photo (`z-index:-1`, `isolation:isolate` on the wrapper); three tags `.ez-ftag` `ez-bob 6s ease-in-out infinite` with delays `0 / -2s / -4s` (`g0` top-end, `g1` bottom-start, `g2` bottom-end) |
| Placeholders | `.ez-ph` dashed outline (no motion) |

---

## 13. Legal pages

Sticky TOC `.ez-toc` (grid at >= 900px): item `transition: background .25s, color .25s`; the active item gets the card look and a sky-gradient number bubble. Active item is set by J10. Sections use `.rv`. `scroll-margin-top: 24px` on `.ez-ls`; `html{scroll-behavior:smooth}` makes TOC clicks glide.

---

## 14. Footer

`.ez-fcta` hover: `transform: translateY(-2px)`, ring turns sky (`transition: transform .25s, box-shadow .25s`); arrow `.ez-farr` slides `translate: -4px 0` (RTL) / `4px 0` (LTR, the arrow is mirrored with `scale: -1 1`) over `.25s`; links `transition: color .2s`; the top hairline is a static gradient; the giant `.ez-fmark` is static (`opacity:.045`, `translateY(18%)`).

---

## 15. Admin

| Element | Motion |
|---|---|
| Tab pane | `.ez-pane` `ez-up .5s E1 both`, re-keyed per tab |
| Tabs | `.ez-tab` `transition: background .2s, color .2s` |
| Inbox rows | `.ez-li` `ez-up .45s E1 both`, delay `k*50ms`; hover lift 2px; selected ring 2px sky |
| Detail panel | `.ez-det` `ez-up .4s both`, re-keyed by item id; sticky at >= 1000px |
| Score meter | `@property --p {syntax:"<number>"; inherits:false; initial-value:0}`; `.ez-meter` is a conic-gradient circle (`calc(var(--p) * 1%)`) with `transition: --p .9s ease-out` and `animation: ez-m .9s ease-out` (from `--p:0`), so the ring fills when it appears and when the score changes |
| Idea cards | `.ez-idea` `ez-up .5s E1 both`, delay `k*70ms` |
| Calendar events | `.ez-ev` `ez-pop .4s E2 both` |
| KPI cards | `.ez-kpi` `ez-up .5s both`, delay `i*90ms`; number counts up (J5, 1000 ms) |
| Line chart | `.ez-line` (SVG path with `pathLength="1"`) `stroke-dasharray:1; stroke-dashoffset:1; animation: ez-dl 1.6s ease-out forwards`; area `.ez-area` `ez-fade 1.2s .6s both`; dots `.ez-dot2` `ez-pop .4s E2 both` with inline delay `1.2 + i*0.05 s` |
| Bars | `.ez-b2 i` `ez-gx .9s E1 both` (scaleX 0 -> 1), delay `i*90ms`, origin left (right in RTL, gradient `270deg`) |

---

## 16. Unmounted components that still carry motion CSS (keep the CSS)

| Component | Motion |
|---|---|
| `Faq` (`.ez-fq`) | accordion by `grid-template-rows: 0fr -> 1fr`, `transition .4s E1`; chevron `rotate(180deg)` + sky, `transition: transform .35s E1`; cards reveal with `.rv` and `--d = i*.06s` |
| `Fit` (`.ez-ba`) | each before/after row `ez-up .5s E1 both`, delay `i*140ms`; arrow `.ez-arr` `ez-nudge 1.8s ease-in-out infinite` (`translate: -5px 0` at 50%); in LTR the arrow is mirrored (`scale:-1 1`) and uses `ez-nudge2` (`5px 0`) |
| `Feedback` thanks | `.ez-thanks` `ez-pop .5s E2 both` + check draw (this one IS mounted in the journey) |

---

## 17. Reduced motion (what the visitor gets)

Every animated block has a matching `@media(prefers-reduced-motion:reduce)` rule in the CSS. Summary of the end state: all `animation` set to `none` (elements show their final state because none of the base styles start hidden except `.ez-dm`, `.ez-dcta`, `.ez-rep`, which the reduced rule resets to visible), transitions removed, `.rv` not translated, particles/bursts hidden, drawn strokes forced complete (`stroke-dashoffset:0` for `.ez-check path`, `.ez-bc circle/path`, `.ez-line`, `.ez-yi`), demo tilt off, logo parallax off, demo shows the finished conversation. Port every one of these blocks (the audit script checks them); there are 13 such `@media` blocks in the site layer.

---

## 18. All 39 keyframes (verbatim)

```
ez-rise    from{transform:translateY(6px);opacity:.01} to{transform:none;opacity:1}
ez-dot     0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-3px)}
ez-flash   from{background:rgba(120,169,204,.25)} to{background:transparent}
lg-up      from{transform:translateY(40px);opacity:.01}
lg-l       from{transform:translateX(-40px);opacity:.01}
lg-r       from{transform:translateX(40px);opacity:.01}
lg-pop     from{transform:scale(.2) rotate(-90deg);opacity:.01}
lg-float   50%{transform:translateY(-6px)}
lg-pulse   50%{transform:scale(1.2)}
ez-drift   to{transform:translate3d(40px,-30px,0)}
ez-up      from{transform:translateY(28px);opacity:.01}
ez-wheel   60%{transform:translateY(10px)}
ez-spin    to{transform:rotate(360deg)}
ez-ping    from{transform:scale(.6);opacity:.8} to{transform:scale(2);opacity:0}
ez-fly     from{transform:rotate(var(--a)) translateX(10px) scale(1)} to{transform:rotate(var(--a)) translateX(150px) scale(.2);opacity:0}
ez-pop     from{transform:scale(.5);opacity:.01}
ez-wig     0%,70%,100%{transform:rotate(0)} 75%{transform:rotate(-12deg)} 85%{transform:rotate(10deg)} 92%{transform:rotate(-6deg)}
ez-breathe 50%{transform:scale(1.25);opacity:.7}
ez-bob     50%{transform:translateY(-10px)}
ez-draw    to{stroke-dashoffset:0}
ez-shk     20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)}
ez-d302    to{stroke-dashoffset:0}
ez-d70     to{stroke-dashoffset:0}
ez-grow    from{transform:scaleY(0)}
ez-pd      50%{transform:scale(1.6);opacity:.5}
ez-ring    0%,100%{transform:rotate(0)} 15%{transform:rotate(16deg)} 30%{transform:rotate(-14deg)} 45%{transform:rotate(10deg)} 60%{transform:rotate(-8deg)} 75%{transform:rotate(4deg)}
ez-m       from{--p:0}
ez-dl      to{stroke-dashoffset:0}
ez-fade    from{opacity:0}
ez-gx      from{transform:scaleX(0)}
ez-wv      0%,100%{transform:scaleY(.3)} 50%{transform:scaleY(1)}
ez-nudge   50%{translate:-5px 0}
ez-nudge2  50%{translate:5px 0}
lg-bl      50%{translate:-7px 0}
lg-br      50%{translate:7px 0}
lg-tw      50%{rotate:14deg}
lg-flash   0%{transform:scale(1)} 30%{transform:scale(1.9) rotate(45deg)} 100%{transform:scale(1)}
lg-ring    from{transform:scale(.6);opacity:.9} to{transform:scale(4);opacity:0}
lg-rise    0%{transform:translateY(0) scale(.7);opacity:0} 20%{opacity:.5} 100%{transform:translateY(-46px) scale(1);opacity:0}
```

---

## 19. RTL / LTR motion rules (easy to break)

| Rule | Why |
|---|---|
| `[dir="rtl"] .ez-prog{transform-origin:right}` | the bar grows from the reading start |
| `[dir="rtl"] .ez-fl label{transform-origin:right top}` | the floating label shrinks toward the right |
| `[dir="rtl"] .ez-stp b{background:linear-gradient(270deg,...)}`, same for `.ez-proc b`, `.ez-b2 i` | gradients run in reading direction |
| `[dir="rtl"] .ez-sw[aria-checked="true"] i::after{transform:translateX(-20px)}` | switch thumb moves the other way |
| `[dir="rtl"] .ez-b2 i{transform-origin:right}` | bars grow from the right |
| `[dir="ltr"] .ez-arr{scale:-1 1; animation-name:ez-nudge2}`, `[dir="ltr"] .ez-farr{scale:-1 1}` + hover `translate:4px 0` | arrows drawn pointing left (for Arabic) are mirrored in English |
| All positions use logical properties (`inset-inline-start/end`, `margin-inline-end`, `padding-inline-end`, `text-align:start/end`) | one stylesheet serves both directions; do not convert to left/right |

---

## 20. How to verify each area (frame level)

Install a fake clock, load the page in the original and the port, advance, screenshot the same region, compare (<= 0.1% pixels):

| Area | Capture times (ms after load) | Notes |
|---|---|---|
| Home hero | 0, 300, 900, 1500, 2100, 2800 | words stagger from 700 ms; meet pill at 1900; cue at 2200 |
| Logo rich | 0, 900, 2000, 3500 + one mouse move to a corner + one click then 100 / 500 ms | parallax and burst |
| Demo | scroll so `.ez-win` is >= 50% visible, then 0, 500, 1600, 3000, 4400, 5500, 6900, 8400, 9700, 10500 | one capture per scripted step; also capture `--e` at 3 scroll positions |
| Reveal | scroll 300px steps, capture 0 / 400 / 900 ms after each `.rv` enters | |
| Chat | after answers 1, 2, 3, 4: 0 / 150 / 300 / 1500 ms | message rise, flash row, bar width |
| Journey | 1300 (appear), +400, +900 (check + burst), +1500 (ID letters), step changes | |
| Timeline / track | 0, 600, 1200, 2000 | connectors grow, current node pings |
| Login / Register | idle at 0 / 2000 / 6000 (orbit angles), failed submit at 100 / 300 ms (shake), success at 300 / 1000 / 1500 | |
| Profile / History / Bell | counter at 0 / 450 / 900; bell at 0 / 300 / 800 | |
| About | 0 / 1000 / 1600 (chips), scroll to cards then 0 / 600 / 1200 (icons draw) | |
| Admin | tab switch at 0 / 250 / 500; chart at 0 / 800 / 1600 / 2200; meter at 0 / 450 / 900 | |
| Reduced motion | each page with `emulateMedia({ reducedMotion: "reduce" })` | must equal the original's reduced state |

Pass criteria: the audit script prints `OK`, the 39 keyframes exist (`grep -c "@keyframes" app/globals.css` = 39), and every frame comparison is within the threshold.
