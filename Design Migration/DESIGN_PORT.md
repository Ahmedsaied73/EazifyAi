# DESIGN_PORT.md — Port the Higgsfield EazifyAi site to Next.js 16 (plain CSS, no Tailwind)

Audience: the AI coding agent that builds `eazifyai-web`. Read this whole file, then `ANIMATIONS.md`, then `PROMPT_FOR_AGENT.md`.
Goal: the production site looks and moves **exactly** like the Higgsfield site (https://eazifyai.higgsfield.app). Same pixels, same motion, same fonts, same text. Improvements come after launch, never during the port.

Source snapshot: `eazifyai-design-reference.zip` (580 files = the whole Higgsfield repo, taken at commit `bad70d7`, "Keep WhatsApp number on About page only"). Unzip it into the web repo as `design-reference/` (read-only, never import from it). `MANIFEST.sha256` inside lists a checksum for every file; run `sha256sum -c MANIFEST.sha256` from inside the unzipped folder to prove nothing is missing or changed.

---

## 0. The one thing to understand first

The design is **plain React + plain CSS**. It does not use Tailwind, Radix, shadcn, Quanta, framer-motion or any animation library. Every animation is a CSS `@keyframes` / `transition`, plus four small JS helpers (scroll progress, reveal-on-scroll, a timed demo, pointer parallax).

Everything else in the Higgsfield repo is platform scaffolding (Quanta/Tailwind setup, shadcn `components/ui`, `packages/fnf*`, a design-inspector, Cloudflare Workers config). **None of it is used by the design.** It stays in `design-reference/` for completeness and is not ported.

Proof (already checked): `grep -rn "components/\|@higgsfield\|radix\|lucide\|tailwind\|framer" src/routes src/site src/admin` finds nothing except the root route's Higgsfield error reporter, and every `className` in the design files starts with `ez-`, `lg-` or is `rv` / state words (`on`, `in`, `ok`, `open`, `done`, `cur`, `ring`, `st`, `ch`, `c0-c3`, `g0-g2`, `r1-r3`, `s3`, `s4`, `a`, `u`, `y`, `n`, `lead`).

---

## 1. What is design (port it) vs scaffolding (do not port)

### 1.1 PORT — the design set (everything the visitor sees)

| Path in `design-reference/app/` | What it is | Port as |
|---|---|---|
| `src/styles.css` **lines 115 to 750 only** (starts at the comment `/* EazifyAi site layer ... */`) | All site CSS: tokens, layout, 39 keyframes, every component style, RTL overrides, reduced-motion rules | `app/globals.css`, copied verbatim |
| `src/site/Site.tsx` | Provider, header, footer, scroll bar, reveal hook, notification bell | `site/Site.tsx` |
| `src/site/Logo.tsx` | The SVG logo with all motion variants | `site/Logo.tsx` |
| `src/site/Demo.tsx` | Scroll-driven "agent demo" section on the home page | `site/Demo.tsx` |
| `src/site/Chat.tsx` | The real chat (4 questions, live brief card, voice, resume, back) | `site/Chat.tsx` |
| `src/site/Journey.tsx` | Post-chat journey (4 steps) | `site/Journey.tsx` |
| `src/site/Req.tsx` | Chips, ExtraForm, CallPicker, Timeline, `useFollow`, `useNote`, `fmtDay`, `isPhone` | `site/Req.tsx` |
| `src/site/Auth.tsx` | Register flow (step by step, one input per step) | `site/Auth.tsx` |
| `src/site/Login.tsx` | Login page (single form with orbit visual) | `site/Login.tsx` |
| `src/site/History.tsx` | Per-user chat history + locked state | `site/History.tsx` |
| `src/site/Feedback.tsx` | "Were the steps clear?" rating | `site/Feedback.tsx` |
| `src/site/Legal.tsx` | Privacy + Copyright page body with sticky TOC | `site/Legal.tsx` |
| `src/site/Proof.tsx`, `proof.ts` | Honest "we're just starting" card (empty WORKS/QUOTES) | `site/Proof.tsx`, `site/proof.ts` |
| `src/site/Fit.tsx`, `Faq.tsx` | **Built but not rendered anywhere** (removed from the home page by the founder). Port them unchanged and keep their i18n keys, but do not mount them | `site/Fit.tsx`, `site/Faq.tsx` |
| `src/site/i18n.ts` (397 lines, ar + en) | All text. `T = { ar, en }`, type `Lang` | `site/i18n.ts` verbatim in step A, then `messages/ar.json` + `en.json` in step B |
| `src/site/store.ts` | localStorage mock: users, sessions, chats, requests, notifications | `site/store.ts` in step A (mock), replaced by API in later phases |
| `src/site/contact.ts`, `founder.ts`, `seo.ts` | WhatsApp number, founder placeholders, page-head helper | `config/brand.ts` (step B) / `site/seo.ts` |
| `src/admin/Inbox.tsx`, `Ideas.tsx`, `Calendar.tsx`, `Analytics.tsx`, `data.ts` | Admin dashboard (mock data, 4 tabs) | `admin/*` |
| `src/routes/index.tsx` | Home: Hero, AgentDemo, How, Audience, Onboard, Ideas table, Proof, CTA, Float | `app/[locale]/page.tsx` |
| `src/routes/chat.tsx`, `about.tsx`, `brand.tsx`, `login.tsx`, `register.tsx`, `profile.tsx`, `track.tsx`, `admin.tsx`, `privacy.tsx`, `copyright.tsx` | The other 10 pages | one `page.tsx` each |
| `src/routes/__root.tsx` | `<html lang dir data-theme>` shell, fonts, 404 and error screens, default head | `app/layout.tsx`, `app/not-found.tsx`, `app/error.tsx` |
| `src/routes/sitemap[.]xml.ts`, `robots[.]txt.ts` | SEO files | `app/sitemap.ts`, `app/robots.ts` |
| `public/favicon.svg`, `public/og.png` | Favicon (rounded dark square with the hand logo) and 1200x630 share image | `public/` |
| `src/app-meta.json` | Default title/description/og image | `app/layout.tsx` metadata |
| `migrations/0002_leads.sql` | The only table the mock uses (`leads`) | reference for the Prisma `Request` model |

### 1.2 DO NOT PORT — scaffolding (keep only inside `design-reference/`)

`app/packages/**` (fnf, fnf-react, quanta), `src/components/**` (shadcn `ui/`, composer, gallery, prompt-box, media-card, etc.), `src/layouts/**`, `src/module/design-inspector/**`, `src/lib/**` (Higgsfield error reporting, bindings, config, security headers), `src/hooks/use-mobile.tsx`, `src/assets/**`, `src/routeTree.gen.ts`, `src/router.tsx`, `src/start.ts`, `src/server.ts`, `src/cloudflare-workers.d.ts`, `public/presets/*.png`, `vite.config.ts`, `wrangler.jsonc`, `app.manifest.json`, `bun.lock`, `bunfig.toml`, `components.json`, `.github/`, and **lines 1 to 114 of `styles.css`** (Tailwind/Quanta imports and the `@theme` shadcn color aliases; no design rule depends on them).

Do not leave the scaffolding behind silently: the checklist in section 12 forces you to confirm each item was considered.

---

## 2. Target structure (Next.js 16, App Router, plain CSS)

```
eazifyai-web/
  design-reference/                 # unzipped snapshot, READ-ONLY
  app/
    layout.tsx                      # <html> shell, fonts, metadata (from __root.tsx)
    globals.css                     # styles.css lines 115-750, verbatim
    not-found.tsx  error.tsx        # same markup as NotFoundComponent / ErrorComponent
    sitemap.ts  robots.ts
    [locale]/
      layout.tsx                    # sets lang + dir from the locale param
      page.tsx                      # /
      chat/page.tsx  about/page.tsx  brand/page.tsx
      login/page.tsx  register/page.tsx  profile/page.tsx  track/page.tsx
      admin/page.tsx  privacy/page.tsx  copyright/page.tsx
  site/    Site.tsx Logo.tsx Demo.tsx Chat.tsx Journey.tsx Req.tsx Auth.tsx Login.tsx
           History.tsx Feedback.tsx Legal.tsx Proof.tsx Fit.tsx Faq.tsx
           store.ts i18n.ts seo.ts proof.ts   (+ contact.ts founder.ts until brand.ts exists)
  admin/   Inbox.tsx Ideas.tsx Calendar.tsx Analytics.tsx data.ts
  lib/mock-api.ts                   # replaces submitLead (see section 9)
  public/  favicon.svg og.png
  scripts/audit-motion.mjs          # section 11
  tests/visual/                     # baselines + parity tests
```

No `tailwind.config`, no `postcss` Tailwind plugin, no `@import "tailwindcss"`. Next 16 handles plain CSS imports natively: `import "./globals.css"` in `app/layout.tsx`.

---

## 3. Fonts (exactly as the original loads them)

Original `__root.tsx` head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">
```

| Font | Weights loaded | Used for |
|---|---|---|
| **Geist** | 300, 400, 500, 600 | Latin text. 300 is used only by `.ez-wm` (brand wordmark on /brand) |
| **IBM Plex Sans Arabic** | 400, 500, 600 | Arabic text (the default language) |

Body stack (do not change): `"Geist","IBM Plex Sans Arabic",system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif`, `line-height:1.7`.

Gotchas that change pixels if you "fix" them:
1. **Weight 700 is requested but never loaded.** `.ez-fmark` (the huge faint "EazifyAi" in the footer) sets `font-weight:700`. Because 700 is not loaded the browser draws 600. Keep loading 300/400/500/600 only. Do not add 700.
2. Arabic letter-spacing is reset with `:lang(ar) h1/.ez-h2 {letter-spacing:0}` and English headings use negative tracking (`-.035em` etc.). This relies on `<html lang>` being correct. Keep it set per locale.
3. Numbers are formatted with `toLocaleString("ar-EG")` / `toLocaleDateString("ar-EG")` in Arabic mode (Arabic-Indic digits). Keep those calls.

Step A: use the same `<link>` tags in `app/layout.tsx` `<head>` (identical rendering). Step B (optional, after parity is proven): swap to `next/font/google` with the same families and weights, map the CSS variable into the same stack, and re-run the visual suite; revert if any page exceeds the 0.1% threshold.

---

## 4. Global runtime contract (set by `Site`, relied on by CSS)

| Thing | Value | Where it matters |
|---|---|---|
| `<html lang>` | `ar` or `en` | `:lang(ar)` / `:lang(en)` typography rules |
| `<html dir>` | `rtl` for `ar`, `ltr` for `en` | every `[dir="rtl"]` / `[dir="ltr"]` rule, logical properties |
| `<html data-theme>` | `dark` (default) or `light` | token set (`:root,[data-theme="dark"]` vs `[data-theme="light"]`) |
| `<html style="color-scheme">` | same as theme | native form controls, scrollbars |
| SSR default | `lang="ar" dir="rtl" data-theme="dark"` | first paint. Use `suppressHydrationWarning` on `<html>` |
| Wrapper | `<div class="ez-page">` (position:relative, `overflow-x:clip`) around header + page + footer | clipping of orbs and the footer mark |
| First child | `<div class="ez-glow">` (920px radial-gradient wash, masked) | the soft colored glow behind the hero |

**Keep `<Site>` per page, do not hoist it into the root layout.** In the original every route renders its own `<Site>`; navigation is mostly plain `<a href>` (full page loads), so header, logo entrance, hero words and the scroll bar replay on every page. If you hoist `Site` into a shared layout, those entrance animations stop replaying and the site no longer moves the same. Wrap each page's client component in `<Site>` exactly like the original.

Persistence keys (localStorage unless noted) and the custom events that tie components together:

| Key / event | Written by | Read by |
|---|---|---|
| `ez-lang` (`ar`/`en`) | `Site` | `Site` |
| `ez-theme` (`dark`/`light`) | `Site` | `Site` |
| `ez-onb` `{name,job,pain,tools}` | Home `Onboard` | Home `Hero` (greeting pill), `Chat` (greeting + job message), `Profile` (tags), `Fit` |
| event `ez-onb` | `Onboard` | `Fit` |
| `ez-users`, `ez-session` | `store.ts` (register/login) | `Site`, `Profile`, `Chat`, `History` |
| `ez-chats-<userId>` + event `ez-chats` | `saveChat` | `History`, `Profile` |
| `ez-draft` (unfinished chat, valid 7 days = `6048e5` ms) | `Chat` | `Chat` resume banner |
| `ez-reqs` + event `ez-reqs` | `saveReq` | `Track`, `Profile` |
| `ez-notes` + event `ez-notes` (`detail:"new"` rings the bell, `"read"`) | `addNote`/`readNotes` | `Bell` in `Site` |
| `ez-sent` (timestamps, max 5 per hour) | About contact form | About contact form (client rate guard) |
| `ez-admin` (localStorage), `ez-admin-s` (sessionStorage), `ez-adm-ov` | `admin/data.ts` | admin pages |
| event `ez-prog` (`detail` = scroll progress 0..1) | `Prog` in `Site` | Home `Float` button (shows when > 0.78) |

All storage access is wrapped in `try/catch` in the original. Keep that.

CSS variables set from JS (never rename): `--d` (reveal delay), `--i` (stagger index), `--a` (burst angle, deg), `--p` (progress, number), `--f` (process fraction 0..1), `--e` (scroll ease 0..1 on the demo), `--mx` / `--my` (logo parallax -1..1).

---

## 5. Tokens (what changes color with one variable)

Step A copies them as they are. Step B (tokens + brand) moves every raw color into `styles/tokens.css` (3 layers) with no pixel change.

Dark (default) and light values:

| Token | Dark | Light | Meaning |
|---|---|---|---|
| `--bg` | `#000` | `#fafafa` | page background |
| `--g1` | `#101010` | `#fff` | surface 1 (cards, pills) |
| `--g2` | `#1a1a1a` | `#f2f2f2` | surface 2 (inputs, bubbles) |
| `--g3` | `#262626` | `#e8e8e8` | surface 3 (hover, tracks) |
| `--mu` | `#a1a1a1` | `#666` | muted text |
| `--tx` | `#ededed` | `#171717` | main text |
| `--box` | `#161616` | `#fff` | chat box / window background |
| `--ring` | `rgba(255,255,255,.1)` | `rgba(0,0,0,.08)` | 1px hairline ring |
| `--sh` | `0 1px 2px rgba(0,0,0,.4),0 12px 32px rgba(0,0,0,.5)` | `0 1px 2px rgba(0,0,0,.05),0 12px 32px rgba(0,0,0,.08)` | soft shadow |
| `--sky` | `#78a9cc` | `#4a82a8` | the brand sky blue (accent) |
| `--ok` | `#4ade80` | `#15803d` | success green |
| `--glow` | 3 radial gradients (blue `rgba(37,70,190,.55)` bottom, violet `rgba(110,64,200,.3)` left, teal `rgba(36,150,180,.24)` right) | lighter versions (`rgba(90,140,255,.34)`, `rgba(170,130,255,.24)`, `rgba(90,200,220,.24)`) | the hero glow wash |

Hard-coded colors that are not tokens in the original (list them in `tokens.css` as primitives in step B; the value must stay identical):
`#7c6cf0` (violet, second stop of almost every gradient), `#2563eb` and `#4f46e5` (user chat bubble gradient `135deg`, `.ez-opt[aria-pressed=true]`), `#ef4444` / `#f97316` (mic active, notification badge), `#f59e0b` (password strength 2, calendar pending), `#84cc16` (strength 3), `#22c55e` + `#04210f` (timeline done node), `#f87171` (errors, "no" icons, voice hint), `rgba(120,169,204,.25|.22)`, `rgba(124,108,240,.16|.2)`, `rgba(120,100,230,.5)`, `rgba(74,222,128,.12|.16|.25|.28)`, `rgba(245,158,11,.25|.1)`, `rgba(80,140,200,.18)`, `rgba(37,99,235,.45)` (floating CTA shadow). Hex colors also appear in two TSX places: the avatar ring SVG gradient in `Site.tsx` (`#78a9cc`, `#7c6cf0`, `#2563eb`) and `INK` in `routes/brand.tsx` (`#0a0a0a`, `#ededed`, `#78a9cc`, `#fafafa`, `#171717`, `#4a82a8`) plus `favicon.svg` (`#0a0a0a`, `#fff`).

Spacing/radius scale used everywhere: radii `999px` (pills), `28px` (chat box/window), `24px` (cards), `20px` (bubbles/panels), `16px` (inputs/rows), `32px` (CTA block); container `max-width:1040px` (`.ez-wrap`), `1280px` for chat/admin, side padding `24px`; section rhythm `64px`.

---

## 6. TanStack to Next mapping (the only code changes allowed in step A)

| Original (TanStack Start / Higgsfield) | Next.js 16 equivalent |
|---|---|
| `createFileRoute("/x")({ head, component })` | `app/[locale]/x/page.tsx` (server) with `generateMetadata`, rendering a client component |
| `pageHead(title, desc, path, noindex)` in `seo.ts` | returns a `Metadata`: `title`, `description`, `openGraph {title, description, url}`, `twitter {title, description}`, `alternates.canonical`, and `robots: {index:false, follow:false}` when `noindex` |
| `head: scripts: [{type:"application/ld+json"}]` on `/` | `<script type="application/ld+json">` inside the home page (Organization: name EazifyAi, url, logo `/favicon.svg`) |
| `import appCss from "../styles.css?url"` | `import "./globals.css"` in `app/layout.tsx` |
| `HeadContent`, `Scripts`, `RootShell`, `shellComponent` | `app/layout.tsx` returning `<html><body>`; add `suppressHydrationWarning` |
| `Link to="/privacy"` (TanStack) in the footer | `next/link` `href="/privacy"` (locale-aware in step B) |
| `useNavigate()` + `nav({to:"/chat"})` | `useRouter().push()` from `next/navigation` |
| Plain `<a href="/chat">` | keep as `<a>` in step A (same full-load behavior); step B moves to a locale-aware link helper |
| `notFoundComponent` / `errorComponent` | `app/not-found.tsx` / `app/error.tsx` with the same markup (`.ez-wrap .ez-doc`, `h1.ez-h2` "الصفحة مش موجودة / Page not found", `a.ez-go` "الرئيسية / Home"; error: "حصلت مشكلة / Something went wrong", `button.ez-go` "حاول تاني / Try again") |
| `routes/sitemap[.]xml.ts` | `app/sitemap.ts`: `/` (1.0, weekly), `/chat` (0.9, monthly), `/about` (0.7, monthly), `/privacy` (0.3, yearly), `/copyright` (0.3, yearly) |
| `routes/robots[.]txt.ts` | `app/robots.ts`: allow `/`; disallow `/admin /profile /track /login /register /brand`; sitemap URL |
| `QueryClientProvider`, `routeTree.gen.ts`, `router.tsx`, `start.ts` | not needed in step A (React Query returns in step C for the typed API client) |
| `__HF_DESIGN_INSPECTOR__`, `reportHiggsfieldError`, `error-capture`, `security-headers.server` | drop (Higgsfield only). Sentry replaces error reporting in Phase 1 step 9 |
| `submitLead({ data })` server function (D1) | `lib/mock-api.ts` with the same call shape in step A (see section 9) |

Client/server rule: every file that uses hooks, events, `window`, `document` or `localStorage` gets `"use client"` at the top: all of `site/*.tsx`, `admin/*.tsx`, and one small `*-client.tsx` per page. `page.tsx` files stay server components that export metadata and render the client component, which renders `<Site>...</Site>`.

Hydration: the original sets lang/theme/user from `localStorage` inside `useEffect` after the first render. Do the same (state starts with `ar`/`dark`/`null`, effect reads storage). Do not read `localStorage` during render.

Locale handling (step A, minimal): `[locale]` is `ar` or `en`. `Site` takes the initial `lang` from the route param instead of `localStorage`; the language button navigates to the same path under the other locale (and still writes `ez-lang`). `<html lang dir>` is set on the server from the param. Everything else about `Site` stays identical. Text stays in `T[lang]` until step B.

---

## 7. Pages (all 13 routes) and what each renders

All pages (except `/brand`) set `<title>` and description through `pageHead`. `noindex` = also `robots noindex,nofollow`.

| Route | Title (ar) | noindex | Contents (top to bottom) |
|---|---|---|---|
| `/` | EazifyAi: حلول بسيطة بالذكاء الاصطناعي لشغلك | no | **Hero** (`.ez-first`): two drifting orbs, optional greeting pill, `Logo size 160 animate rich`, wordmark `Eazify<b>Ai</b>`, h1 split into words (`.ez-w`), sub, "meet the agent" pill (`.ez-meet`), scroll cue (`.ez-cue`). **AgentDemo** (`#agent`). **How** (`#how`: h2 + card with 3 numbered steps). **Audience** (`#aud`: 4 bento cards with SVG icons). **Onboard** (4-question card). **Ideas table** (`#ideas`: note + 3-column table + status pills). **Proof** (honest card). **CTA** block. **Float** button (appears after 78% scroll) |
| `/chat` | احكيلنا مشكلتك | no | `main.ez-wrap.ez-chatpage` > `Chat` (chat box + live brief card + Journey after completion + History) |
| `/about` | عن EazifyAi وإزاي بنشتغل | no | hero (logo 120 + h1 + sub + 4 chips), "who we are", "what we do / don't" (two cards with animated check/cross icons), "how we work" (numbered timeline), "AI note" card (gradient border), founder block (photo with spinning ring, 3 floating tags, bio/quote placeholders), contact form (`#contact`, honeypot field, WhatsApp link) |
| `/brand` | (no head) | (disallowed in robots) | logo lockups (4: dark/light x horizontal/stacked), two small-size mark variants with 16-96px tiles, tab/WhatsApp previews, SVG and PNG download buttons |
| `/login` | تسجيل الدخول | yes | two-column: orbit visual (core glow, 3 rotating rings, logo 120, chat bubble with dots, 4 floating chips from `t.aud.items`) + card form with floating labels, show/hide password, shake on error, spinner, success check, redirect to `/chat` after 1500 ms |
| `/register` | حساب جديد | yes | one question per screen (name, email, password with 4-bar strength meter), `1 / 3` counter, logo with ping ring, success burst, redirect after 1900 ms |
| `/profile` | حسابي | yes | redirects to `/login` if no session. Avatar ring, name/email, animated chat counter + member-since, tags from onboarding, name/job inputs, save/continue/logout, requests list |
| `/track` | متابعة طلبك | yes | request id letters, status pill with pulsing dot, timeline, details table, "extra info" editor, call picker; empty state with logo |
| `/admin` | لوحة التحكم | yes | gate (create/login admin, mock, `localStorage` + `sessionStorage`) then sidebar with 4 tabs: Inbox, Ideas, Calendar, Analytics |
| `/privacy` | الخصوصية والسياسات | no | `LegalPage k="pl"` |
| `/copyright` | حقوق الملكية | no | `LegalPage k="cr"` |
| `/sitemap.xml`, `/robots.txt` | - | - | generated files (section 6) |

The Arabic page titles and descriptions are the literal strings inside each `routes/*.tsx` `pageHead(...)` call; copy them, do not rewrite them. English titles do not exist in the original (the SSR language is Arabic); in step B, reuse the Arabic strings for `ar` and add English ones to `messages/en.json`.

---

## 8. Components (every one, with what it must keep)

Class names are API. Never rename, merge or "clean up" a class.

### 8.1 `Site.tsx`
Exports `useSite()` (`{lang, t, setLang, theme, setTheme, user, setUser}`; throws "Site provider missing" outside the provider), `Site`, `useReveal()`.
- **Header** `.ez-top`: logo link (`Logo size 28` + `Eazify<b>Ai</b>`), `nav.ez-nav` with a pill group `.ez-nav.ez-links` (Home, Agent, About: hidden under 700px), language button (`.ez-btn`, text `t.lang`), theme button (`.ez-btn`, 16px moon/sun icon), `Bell`, then either the avatar link `.ez-av` (40px, rotating gradient ring svg `.ez-avr` with gradient id `ez-avg`, first letter uppercased in `<b>`) or `Login` `.ez-btn` + `Register` `.ez-go.ez-sm`.
- **`Prog`**: fixed 3px bar `.ez-prog` (see ANIMATIONS.md section 1).
- **`Bell`**: renders only if there are notifications. `.ez-bellw > button.ez-bell` with bell svg (18px), unread badge `.ez-badge` (keyed by count so it re-pops), panel `.ez-npanel` (role dialog, closes on outside click, max 8 items, each an `<a href="/track?id=...">` with localized time `day numeric, month short, hh:mm`), footnote `t.nt.note`. Ring animation when `ez-notes` fires with `detail:"new"` (class `ring` for 1400 ms). Opening marks all read.
- **Footer** `.ez-foot`: gradient hairline on top, brand column (logo 30, tagline, `.ez-fcta` pill with animated arrow), 3 link columns (site: home/chat/track; company: about/contact; legal: privacy/copyright), bottom row (rights + note), giant faint wordmark `.ez-fmark`.
- Language toggle writes `ez-lang`; theme toggle writes `ez-theme`; both set `html` attributes in an effect.

### 8.2 `Logo.tsx`
Props `size=28`, `animate=false`, `rich=false`. SVG `viewBox="0 0 450 385"`, width = `size*450/385`. Paths: one combined string `W` split on `"ZM"` into `HAND`, `BL` (left bracket), `BR` (right bracket); `S` is the 4-point star (sky blue via `fill:var(--sky)`; the rest `currentColor`). Groups `.lg-d1` (hand), `.lg-d2` (brackets), `.lg-d3` (star, particles, burst) give three parallax depths. `rich` adds: 5 drifting particles (`BITS`: star, two bracket shards, a slash, a small star), pointer parallax (only when `(pointer: fine)` and not reduced motion; sets `--mx`/`--my`, clamped -1..1), and click-to-burst (`.lg-hot` for 900 ms + an expanding ring circle, re-keyed each click). Exports `Logo` and `PATHS` (used by `/brand`). **Copy the file verbatim; never redraw or simplify the path data.**

### 8.3 `Demo.tsx` (`AgentDemo`)
Section `#agent.ez-demo`: heading, 3-node process stepper (`.ez-proc`), then a grid `.ez-demo-grid` with a chat window (`.ez-win`: bar with logo avatar, name, live dot, 6 scripted messages, fake input) and a brief card (`.ez-card.ez-dbrief`: progress bar, 3 rows that go from skeleton to value, success pill with burst), then actions (`Replay` `.ez-btn.ez-rep`, `Try it yourself` `.ez-go.ez-dcta` to `/chat`). Fully scripted by timers; timeline in ANIMATIONS.md section 3. Initial state is the finished state (`step=8`) so no-JS and reduced-motion users see the completed story.

### 8.4 `Chat.tsx`
State: `msgs`, `f` (4 brief fields), `step` 0..3, `typing`, `val`, `ph` (placeholder index), `done`, `fresh`, `req`, `nm`, `job`, `draft`, `canVoice`, `listening`, `vErr`. Refs: `end`, `cid`, `acc` (indexes of user messages, for Back), `lock`, `rec`, `langRef`.
Behavior to preserve exactly:
1. On mount read `ez-onb` (name, job) and a saved draft (< 7 days, contains a user message). Detect `SpeechRecognition`/`webkitSpeechRecognition`.
2. On language change (or first load) reset and show typing, then after **800 ms** the greeting (`t.chat.hi` with `{n}` = user name or onboarding name, else `t.chat.hiG`); if a job exists, after **1800 ms** add `t.chat.job` with `{j}`.
3. Placeholder rotates every **3500 ms** through `t.ph` until the visitor starts.
4. Auto-scroll with `scrollIntoView({block:"nearest"})` on every message/typing change.
5. `send`: steps 0-2 save the answer into `f[step]`, flash that brief row (`fresh`), advance, and the agent replies `t.agent.q[step]` after **700 ms** (typing dots shown). Step 3 requires a contact (`/@.+\..+/` or 8+ digits); invalid -> `t.agent.bad`. Valid -> `submitLead({problem, affected, current, contact, lang})`; success -> `done`, agent says `t.agent.done`, a request `EZ-XXXXX` (`"EZ-" + 5 random base36 chars uppercased`) is saved, a notification added (`t.nt.recv`), Journey mounts; failure -> remove the last user mark, clear contact, agent says `t.agent.fail` after 200 ms.
6. Enter sends, Shift+Enter newline, never while IME composing.
7. **Back** button (only when there is an answer and not done) removes the last answered message and restores it into the textarea.
8. Resume banner (`.ez-resume`) when a draft exists in the same language and the chat has not started; "Continue" restores everything, "Start over" deletes the draft.
9. Draft is saved to `ez-draft` on every change until done (then removed). Logged-in users also get the conversation saved via `saveChat`.
10. Voice: mic toggles recognition (`ar-EG` or `en-US`, interim results, appends to existing text); permission denied -> `t.ch.micDenied`; other error -> `t.ch.micErr`; listening shows 4 animated bars and placeholder `t.ch.micOn`.
11. Quick replies `.ez-qr`: at step 0 the starter chips (`t.chips`) fill the textarea; later steps show `t.qr[step-1]` that send immediately, plus the "or type" hint.
12. Layout: `.ez-on > .ez-stage` grid (box 3fr + brief 2fr from 880px; 1.9fr/1fr from 1100px on the chat page), brief card sticky on the chat page.
Markup contract: `.ez-box` form, `.ez-assure` (3 reassurance checks), `.ez-msgs` (`aria-live="polite"`), `.ez-m.ez-a|.ez-u`, `.ez-dots`, `.ez-row` textarea + `.ez-mic` + send `.ez-go` (48x48), `aside.ez-card.ez-brief` with `.ez-bar` and table `.ez-tbl`, trust line, then `Journey`, then `History`.

### 8.5 `Journey.tsx`
Appears **1300 ms** after the request is created and scrolls itself into view (`smooth`, `block:start`). `.ez-jr > .ez-card` with a 4-node stepper (`.ez-stp`, `--p = step/3`). Steps (content re-keyed per step so `.ez-step` replays): 0 success (animated check circle + 16-particle burst, request id letter by letter, Copy id / Continue), 1 extra info (`ExtraForm`; Save or Skip), 2 call booking (`CallPicker`; Book or Later), 3 timeline + "Track" link + `Feedback`. Saving extras or booking calls `useFollow().send` and `useNote`.

### 8.6 `Req.tsx`
`Chips` (pressable options, toggle off on second click), `isPhone`, `Sw` (switch: `role="switch"`), `useNote`, `ExtraForm` (urgency, budget, best time, details textarea max 1200, WhatsApp updates switch + number input when the contact is not a phone, in-site updates switch), `days()` (next 5 days, skipping Fridays: `getDay() !== 5`), `fmtDay`, `CallPicker`, `Timeline` (4 nodes: received=done, studying=current with ETA = request time + 48 h, WhatsApp/email reply, call), `useFollow` (posts the extra info through `submitLead`).

### 8.7 `Auth.tsx` / `Login.tsx` / `store.ts`
Register: 3 single-input screens; validation messages `t.auth.errName/errEmail/errPw/errExists/errBad`; password strength `score()` = length>=6 + length>=10 + letters-and-digits + symbol (0-4) shown as 4 bars colored amber / lime / green. Login: single card. The store is a **mock** (SHA-256 of `email:password` in localStorage). It is replaced by Supabase Auth in Phase 2; in step A copy it unchanged so the UX works.

### 8.8 `History.tsx`, `Feedback.tsx`, `Legal.tsx`, `Proof.tsx`
- History: signed-out -> blurred ghost list with lock icon (wiggle) and a login button; signed-in -> accordion list of past chats (first 70 chars, status pill, short date), expanded messages animate in.
- Feedback: 3 options (Clear / Needs clarification / I felt a bit lost); first sends immediately, the others reveal a 400-char textarea. Sends through `submitLead` with `[ID] feedback: ...`.
- Legal: logo 56, title/lead/updated date, sticky TOC (hidden under 900px) whose active item follows scrolling (IntersectionObserver, `rootMargin:"-25% 0px -65% 0px"`), a summary card with check list, numbered sections with `.rv` reveals.
- Proof: while `WORKS` and `QUOTES` are empty shows the honest card (hard-coded ar/en text inside the component).

### 8.9 Home-only helpers inside `routes/index.tsx`
`Hero`, `Onboard` (4 questions; options per question from `t.onb.q[i].o`, plus "Other" which reveals a text input; saves `ez-onb`; final state greets by name and links to `/chat`), `Float`, `Body` (calls `useReveal()`), `ICONS` (4 SVG path groups for the audience cards), `d(i)` helper (`--d = i*0.1s`).

### 8.10 Admin
`Gate` (setup vs login) and `Panel` in `routes/admin.tsx`; `Inbox` (search, status filters, sort by newest/urgency, detail with status chips, score meter, WhatsApp quick-reply templates, notes saved on blur), `Ideas` (min-score range, job filter, pending-only, per-idea fit/ease/value sliders, go/later/drop), `Calendar` (7 days x 3 slots grid, min-width 900px, click to confirm a pending call), `Analytics` (4 count-up KPIs, 14-day SVG line+area chart, funnel bars, 4 distribution bar cards). 10 demo rows in `data.ts`. Score = `round((fit+ease+value)/15*100)`.

---

## 9. Backend seams (what step A mocks and later phases replace)

`submitLead` is the only server call in the whole site. It has 4 call sites:

| Call site | Payload it sends today | Real API later |
|---|---|---|
| `Chat.send` (step 3) | `problem=f[0]`, `affected=f[1]`, `current=f[2]`, `contact`, `lang` | the agent conversation (socket.io) creates the `Request` |
| `Req.useFollow.send` (extras / call booking) | `problem="[EZ-ID] details"`, `affected=name`, `current="urgency=..; budget=..; time=..; call=..; notify=.."`, `contact`, `lang` | `PATCH /v1/requests/:id` (extra details, booking) |
| `Feedback.send` | `problem="[EZ-ID] feedback: ..."`, `current="feedback"` | `POST /v1/requests/:id/feedback` |
| `about.tsx` contact form | `problem=message`, `affected=name`, `current="contact form"`, `contact`, `lang` | `POST /v1/contact` |

D1 schema it writes to: `leads(id, problem, affected, current_way, contact, lang, created_at)`. Map to the Prisma `Request` model in `spec.md` (do not copy the table as is).

Step A `lib/mock-api.ts`: `export async function submitLead({ data }) { await sleep(400); return { ok: true } }` with the same zod shape, so the UI behaves identically (loading, success, failure paths). Add a `?fail=1` dev switch if you want to test the failure branches.

---

## 10. Step-by-step port procedure

Run the visual suite after every step. A step is done only when it passes.

**Order of work (decided): foundation first, then one page at a time.** Steps 1, 2 (shared files), 4 and the whole CSS (`globals.css`, all of it, once) are the foundation and are done at once. Steps 2-3 for pages are then done page by page in this order: `/privacy`, `/copyright`, `/about`, `/` (home), `/chat`, `/login`, `/register`, `/profile`, `/track`, `/admin`, `/brand` + misc. Each page ends with its own parity gate and its own commit before the next begins. `PROMPT_FOR_AGENT.md` has the exact loop.

0. **Baseline first.** Unzip the snapshot into `design-reference/`, verify `MANIFEST.sha256`. Run the original (`bun install && bun run dev` inside `design-reference/app`, or point Playwright at https://eazifyai.higgsfield.app) and capture baselines: every route x `ar`/`en` x `dark`/`light` x viewports 390, 768, 1280 (13 routes; `/profile` and `/track` need seeded `localStorage`, `/admin` needs a created admin; see section 11).
1. **Scaffold.** `create-next-app` (Next 16, TypeScript, App Router, **no Tailwind**, no `src/` dir). Add the `<link>` fonts (section 3). Create `app/globals.css` from the site layer:
   `sed -n '115,$p' design-reference/app/src/styles.css > app/globals.css`
   (line 115 is the `EazifyAi site layer` comment; verify with `grep -n "EazifyAi site layer" styles.css`). Import it once in `app/layout.tsx`.
2. **Copy files verbatim** (`site/*`, `admin/*`, `public/favicon.svg`, `public/og.png`), add `"use client"`, change only the imports listed in section 6, swap `submitLead` for the mock.
3. **Routes.** Create each `page.tsx` + `*-client.tsx` per section 7, keeping `<Site>` inside each page.
4. **Layout shell.** `app/layout.tsx`: `<html lang="ar" dir="rtl" data-theme="dark" style={{colorScheme:"dark"}} suppressHydrationWarning>`, fonts, default metadata (from `app-meta.json`: title "EazifyAi: حلول بسيطة بالذكاء الاصطناعي لشغلك", description, og image `/og.png` 1200x630, `og:locale ar_EG`, `og:site_name EazifyAi`, `twitter:card summary_large_image`, author EazifyAi, favicon `/favicon.svg`).
5. **Not found / error / sitemap / robots.**
6. **Run the parity suite** (section 11). Fix differences by fixing the port, never the original.
7. **Step B (no pixel change):** `styles/tokens.css` (primitives -> semantic -> component), stylelint ban on raw colors outside it, `config/brand.ts` + `useT()` with `{brand}` `{founder}` `{whatsapp}` `{email}`, move `i18n.ts` into `messages/ar.json` / `en.json` (same keys), switch language to next-intl routing. Re-run the suite after every batch.
8. **Step C:** typed API client (openapi-typescript + openapi-fetch), CI, and replace the mocks phase by phase per `PHASE_1.md` / `spec.md`.

Never during the port: change a color, spacing, radius, font weight, duration, delay, easing or copy; rename a class; add a library for something the CSS already does; "fix" an oddity you notice (list it in `PORT_NOTES.md` for after launch).

---

## 11. Proving it is identical

1. **Static parity:** Playwright screenshots, `maxDiffPixelRatio: 0.001` per page (0.1%), against the baselines from step 0. Disable animations for static shots with `page.emulateMedia({ reducedMotion: "reduce" })` (the original's reduced-motion rules freeze everything at the final state), and also take "motion on" shots at fixed timestamps (below).
2. **Motion parity (rule level):** `node scripts/audit-motion.mjs design-reference/app/src/site-layer.css app/globals.css` must print `OK`. Create `site-layer.css` with the `sed` above. The script lists every animation, transition, transform and keyframe, and fails if any rule from the original is missing or changed in the port. `ANIMATIONS_INVENTORY.md` is the same list pre-generated (228 rows, 39 keyframes).
3. **Motion parity (frame level):** for each entry in `ANIMATIONS.md` section "How to verify", load the page in both apps, install a fake clock (`page.clock.install()` then `page.clock.fastForward(ms)`), capture at `t = 0, 300, 800, 1600, 3000, 6000, 10000 ms`, and compare. Pointer-driven motion (logo parallax) is checked with `page.mouse.move`.
4. **File parity:** `sha256sum -c MANIFEST.sha256` for the snapshot; for ported files that must be verbatim, `diff` them against `design-reference` (only the import and `"use client"` lines may differ).
5. **Behavior parity:** a Playwright e2e that runs the main path: home -> demo plays -> chat (4 answers) -> journey (all 4 steps) -> track -> register -> login -> profile -> admin.

---

## 12. "Nothing left behind" checklist (tick every line before saying done)

Pages: [ ] `/` [ ] `/chat` [ ] `/about` [ ] `/brand` [ ] `/login` [ ] `/register` [ ] `/profile` [ ] `/track` [ ] `/admin` [ ] `/privacy` [ ] `/copyright` [ ] sitemap [ ] robots [ ] 404 [ ] error screen.
Components: [ ] Site (header, footer, Prog, Bell, useReveal) [ ] Logo (+PATHS) [ ] AgentDemo [ ] Chat [ ] Journey [ ] Req (Chips, ExtraForm, CallPicker, Timeline, useFollow, useNote) [ ] Auth [ ] Login [ ] History [ ] Feedback [ ] Legal [ ] Proof [ ] Fit (unmounted) [ ] Faq (unmounted) [ ] Hero/Onboard/Float [ ] Inbox [ ] Ideas [ ] Calendar [ ] Analytics [ ] admin Gate/Panel.
Data/config: [ ] `i18n.ts` has all 40 top-level keys in both `ar` and `en` (`nav h sub ph chips send trust agent brief how ideas about aud cta ft hook chat onb contact auth prof hist jr nt demo ch qr faq fit fb ab lg fp pl cr foot priv nf lang themeLabel`); `en` is typed as `typeof ar`, so a missing key fails the type check [ ] WhatsApp `201023498242` / display `01023498242` [ ] FOUNDER placeholders [ ] WORKS/QUOTES empty [ ] favicon [ ] og image.
Typography/CSS: [ ] both fonts and weights [ ] all 636 lines of the site layer present (`wc -l app/globals.css` = 636) [ ] 39 `@keyframes` (`grep -c @keyframes app/globals.css`) [ ] all `@media(prefers-reduced-motion...)` blocks [ ] all `[dir="rtl"]` / `[dir="ltr"]` overrides [ ] `@property --p`.
Motion: [ ] every item in `ANIMATIONS.md` [ ] audit script prints OK.
Scaffolding considered: [ ] section 1.2 list read and intentionally skipped.

If a count above does not match, something was lost. Fix it before moving on.
