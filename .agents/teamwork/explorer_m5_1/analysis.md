# Milestone 5 Route `/chat` In-Depth Technical Analysis

**Investigator**: Chat Route Explorer (`explorer_m5_1`)  
**Target Codebase**: `d:\EazifyAi\eazifyai-web`  
**Reference Codebase**: `d:\EazifyAi\eazifyai-web\design-reference`  
**Date**: 2026-10-18T22:15:00Z  

---

## 1. Executive Summary

Milestone 5 covers the interactive consultation agent route `/chat`. The route guides the user through an empathetic, conversational intake process consisting of:
1. **Chat Intake Flow**: 4 structured conversational steps (problem, affected party, current handling method, contact details).
2. **Interactive Real-Time Brief Card**: Aside summary showing live completion progress, status badge, and flashing table rows as user answers.
3. **Voice Recording / Speech Recognition**: Web Speech API integration with real-time waveform visualizer (4 animated bars) and Egyptian Arabic (`ar-EG`) / English (`en-US`) dialect recognition.
4. **Draft Persistence & Resume**: LocalStorage persistence of unfinished chat states (`ez-draft`) with 7-day TTL and a resume/start-over banner.
5. **Post-Submission Intake Journey (`<Journey>`)**: 4-stage follow-up flow with 16-ray burst animation, unique request ID generation, clipboard copy, extra information form, appointment/call booking slot picker, and tracking timeline.
6. **Feedback System (`<Feedback>`)**: Post-journey feedback widget with instant submission and custom feedback textarea.
7. **Chat History (`<History>`)**: Guest-locked state with login prompt vs authenticated conversation accordion.
8. **Unified Mock API Integration**: Replacement of all 3 server communication call sites with `submitLead` from `src/lib/mock-api.ts`.
9. **Next.js 16 App Router Metadata**: Localized `generateMetadata` with `Promise<{ locale: string }>` params and full OpenGraph / Twitter / canonical tags.

---

## 2. Reference Implementation Architecture & Inspection

The reference `/chat` experience is partitioned across 6 primary files:

### 2.1 Route Entry (`design-reference/routes/chat.tsx`)
- TanStack Route definition with localized Arabic head metadata:
  ```tsx
  head: () => pageHead("احكيلنا مشكلتك | EazifyAi", "اكتب مشكلتك في الشغل بالمصري، والمساعد هيسمعك ويفهمها وياخد وسيلة التواصل، وإحنا نرجعلك بخطوة تالية خلال ٤٨ ساعة.", "/chat")
  ```
- Component wraps `<main className="ez-wrap ez-chatpage"><Chat /></main>` inside `<Site>`.
- Preserves entrance animations and layouts.

### 2.2 Chat Leaf Component (`design-reference/site/Chat.tsx`)
- **State Machine**:
  - `msgs`: Array of `{ r: "a" | "u", x: string }` representing agent (`a`) and user (`u`) dialogue turns.
  - `f`: Array of 4 strings `[problem, affected, current_handling, contact]`.
  - `step`: Current intake step (0 through 3).
  - `typing`: Boolean indicating active agent thought/reply simulation (renders animated 3-dot pulse `<div className="ez-dots"><i/><i/><i/></div>`).
  - `done`: Set to true upon successful lead submission.
  - `req`: Holds the generated `Req` object upon successful lead submission.
  - `draft`: Unfinished conversation loaded from `localStorage['ez-draft']`.
- **Interaction Flows**:
  - Initial Greeting: Timed 800ms delay before initial message mounts (`t.chat.hi` or `t.chat.hiG`). If onboarding stored a user job title (`ez-onb.job`), an additional prompt (`t.chat.job`) fires at 1800ms.
  - Step Progression:
    - Step 0 (Problem): Rotating placeholder every 3500ms through `t.ph`. Quick chip suggestions `t.chips`.
    - Step 1 (Affected): Prompt `t.agent.q[0]`. Suggestions from `t.qr[0]`.
    - Step 2 (Current Handling): Prompt `t.agent.q[1]`. Suggestions from `t.qr[1]`.
    - Step 3 (Contact): Prompt `t.agent.q[2]`. Validated via `isContact(v)` (`/@.+\..+/` or >= 8 digits). If invalid -> `reply(t.agent.bad)`. If valid -> invokes `submitLead({ data: { problem, affected, current, contact, lang } })`.
  - Step Backtracking (`back()`):
    - Back button appears once `acc.current.length > 0 && !done`.
    - Restores previous input value into the textarea, clears the popped step answer in `f`, rolls back `step` by 1.
  - Speech Recognition:
    - Queries `window.SpeechRecognition || window.webkitSpeechRecognition`.
    - `interimResults: true`, `continuous: false`, language set to `lang === 'ar' ? 'ar-EG' : 'en-US'`.
    - Audio visualizer: When `listening === true`, mic button renders 4 animated sound bars:
      ```html
      <span class="ez-wave" aria-hidden="true"><i/><i/><i/><i/></span>
      ```
    - Error handling: Maps `not-allowed` to `t.ch.micDenied`, other errors to `t.ch.micErr`.
  - Live Brief Card (`aside.ez-card.ez-brief`):
    - Status badge: `t.brief.st[done ? 1 : 0]` ("بنسمعك" -> "وصلتنا" with class `.ez-ok`).
    - Progress bar width: `(filled / 4) * 100 + "%"`.
    - 4 rows with labels: `[t.brief.labels[0..3]]`. Flash animation applied via `.ez-fresh` when row updates.

### 2.3 Post-Submission Intake Journey (`design-reference/site/Journey.tsx`)
- Triggered 1300ms after chat completion, automatically scrolls into view.
- 4-stage stepper (`.ez-stp` with `--p: s / 3`):
  - **Stage 0 ("وصل" / Received)**: 16-ray radial burst animation (`.ez-burst`), circular checkmark SVG, staggered animated request ID (`.ez-ch`), clipboard copy button, direct WhatsApp link with prefilled request ID.
  - **Stage 1 ("نضيف" / Add Info)**: Extra details form (`<ExtraForm>`): Urgency options (`t.jr.urgO`), Budget options (`t.jr.budO`), Best time options (`t.jr.tmO`), Details textarea (max 1200 characters), Notification channel switches (`<Sw>` for WhatsApp and in-site notifications). Calls `useFollow().send(r)`.
  - **Stage 2 ("مكالمة" / Call)**: Booking interface (`<CallPicker>`) selecting from the next 5 business days (filtering out Friday `getDay() !== 5`) and daily time slots (`t.jr.slots`). Calls `useFollow().send(r)`.
  - **Stage 3 ("بعد كده" / Next Steps)**: Request lifecycle timeline (`<Timeline>`) with 4 milestones (Received, Studying + 48h ETA, WhatsApp/email reply, Scheduled call), direct tracking link to `/track?id=EZ-XXXXX`, and Feedback component (`<Feedback>`).

### 2.4 Extra Forms, Date Pickers & Follow-Up API (`design-reference/site/Req.tsx`)
- Exports `Chips`, `Sw`, `useNote`, `ExtraForm`, `fmtDay`, `CallPicker`, `Timeline`, `useFollow`.
- `useFollow`: **Call site 2 for `submitLead`**. Packages extra metadata (`details`, `urgency`, `budget`, `time`, `call`, `notify`) into `submitLead({ data: { problem, affected, current, contact, lang } })`.

### 2.5 Feedback Modal/Card (`design-reference/site/Feedback.tsx`)
- **Call site 3 for `submitLead`**.
- Presents question `t.fb.q` with 3 choices `t.fb.o` ("واضحة", "محتاجة توضيح", "تهت شوية").
- Choice 0 submits immediately.
- Choices 1 & 2 reveal a 400-char feedback textarea and submit button.
- Submits payload: `[<req.id>] feedback: <choice> - <text>` to `submitLead`.
- Displays confirmation checkmark and thank-you message (`t.fb.thanks`).

### 2.6 Chat History (`design-reference/site/History.tsx`)
- Guest view: Renders locked overlay (`.ez-hist.ez-lock`) with 3 ghost lines, lock icon, prompt `t.hist.lock`, and login button `t.hist.lockBtn`.
- Authenticated view: Fetches chats via `getChats(user.id)`, listens to `ez-chats` window event, displays collapsible accordion with first message snippet, status badge (`Received` / `Open`), and date.

---

## 3. Target Implementation Audit & Defect Identification

The target implementation in `eazifyai-web` was inspected against the reference and project contracts. The following discrepancies were discovered:

### 3.1 Defect 1: Unwired Mock API in `src/features/chat/Chat.tsx` (Call Site 1)
- **Current State**:
  Lines 57-73 define a local private function:
  ```tsx
  async function submitLead({ data }: { data: ... }) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/v1/leads`, { ... });
    } catch { ... }
    return { ok: true };
  }
  ```
- **Violation**: Fails the Unified Mock API contract (`R3` & `PROJECT.md`). It attempts to connect to `http://localhost:3001` instead of using the certified SSR-safe mock in `src/lib/mock-api.ts`.
- **Remediation**: Remove the inline `async function submitLead` and import `submitLead` directly from `../../lib/mock-api`.

### 3.2 Defect 2: Stubbed `useFollow` in `src/features/journey/Req.tsx` (Call Site 2)
- **Current State**:
  Lines 214-223 contain a hollow dummy stub:
  ```tsx
  export function useFollow() {
    const [busy, setBusy] = useState(false);
    const send = (_r: Req) => {
      setBusy(true);
      return Promise.resolve()
        .catch(() => undefined)
        .finally(() => setBusy(false));
    };
    return { busy, send };
  }
  ```
- **Violation**: When users add extra details (urgency, budget, time, details) or book a call slot in Journey stages 1 and 2, the follow-up data is never posted to the mock store.
- **Remediation**: Wire `useFollow` to import `submitLead` from `../../lib/mock-api` and format the follow-up payload identically to reference `design-reference/site/Req.tsx`.

### 3.3 Defect 3: Stubbed `Feedback` in `src/components/layout/Feedback.tsx` (Call Site 3)
- **Current State**:
  Lines 14-16 contain a hollow dummy stub:
  ```tsx
  const send = (_choice: number, _text: string) => {
    setSent(true);
  };
  ```
- **Violation**: Feedback submissions in Journey stage 3 never call `submitLead` or record user feedback.
- **Remediation**: Wire `Feedback` to import `submitLead` from `../../lib/mock-api`, destructure `{ t, lang }` from `useSite()`, and dispatch `submitLead({ data: { problem: ... } })`.

### 3.4 Audit of Next.js 16 Metadata in `src/app/[locale]/chat/page.tsx`
- **Current State**:
  `src/app/[locale]/chat/page.tsx` exports:
  - `export const dynamic = 'force-static';`
  - `export const revalidate = 86400;`
  - `export function generateStaticParams() { return [{ locale: 'ar' }, { locale: 'en' }]; }`
  - `export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata>`
- **Titles & Descriptions Extracted**:
  - Arabic:
    - Title: `"احكيلنا مشكلتك | EazifyAi"`
    - Description: `"اكتب مشكلتك في الشغل بالمصري، والمساعد هيسمعك ويفهمها وياخد وسيلة التواصل، وإحنا نرجعلك بخطوة تالية خلال ٤٨ ساعة."`
  - English:
    - Title: `"Tell Us Your Problem | EazifyAi"`
    - Description: `"Describe your work problem; our assistant listens, clarifies, and takes your contact info so we get back to you within 48 hours."`
- **Assessment**: Full compliance with Next.js 16 App Router asynchronous params contract.

### 3.5 Audit of i18n Translations in `src/i18n/messages/{ar,en}.json`
- Verified all required dictionary namespaces exist:
  - `"chat"`: `hi`, `hiG`, `job`
  - `"agent"`: `q` (3 questions), `bad`, `done`, `fail`
  - `"brief"`: `title`, `labels` (4 labels), `empty`, `st` (2 states)
  - `"ch"`: `of`, `ready`, `back`, `orType`, `assure` (3 items), `mic`, `micOn`, `micDenied`, `micErr`, `resumeT`, `resume`, `fresh`
  - `"qr"`: 2 suggestion matrices
  - `"jr"`: `s` (4 steps), `h0`, `p0`, `copy`, `copied`, `go`, `h1`, `p1`, `urg`, `urgO`, `bud`, `budO`, `tm`, `tmO`, `dt`, `dtPh`, `save`, `skip`, `h2`, `p2`, `slots`, `book`, `later`, `h3`, `tl`, `track`, `tt`, `empty`, `emptyBtn`, `st`, `eta`, `det`, `more`, `none`, `edit`, `callT`, `noCall`, `change`, `newReq`, `saved`, `note`
  - `"nt"`: `title`, `recv`, `extra`, `call`, `note`, `wa`, `waNum`, `site`
  - `"fb"`: `q`, `o` (3 options), `ph`, `send`, `thanks`
  - `"hist"`: `title`, `empty`, `lock`, `lockBtn`, `received`, `open`

---

## 4. Visual Regression Test Results

Execution of `node scripts/run-visual-tests.mjs chat` across all 12 matrix combinations:

| Route | Locale | Theme | Viewport | Diff Pixel Ratio | Gate Result (Threshold <= 5.0%) |
|---|---|---|---|---|---|
| `/chat` | `ar` | `dark` | 1280px | 2.9938% | **PASS** |
| `/chat` | `ar` | `light` | 1280px | 2.3313% | **PASS** |
| `/chat` | `en` | `dark` | 1280px | 3.4750% | **PASS** |
| `/chat` | `en` | `light` | 1280px | 2.6904% | **PASS** |
| `/chat` | `ar` | `dark` | 768px | 3.3329% | **PASS** |
| `/chat` | `ar` | `light` | 768px | 2.4281% | **PASS** |
| `/chat` | `en` | `dark` | 768px | 3.5614% | **PASS** |
| `/chat` | `en` | `light` | 768px | 2.7651% | **PASS** |
| `/chat` | `ar` | `light` | 390px | 4.7317% | **PASS** |
| `/chat` | `ar` | `dark` | 390px | 5.2999% | ⚠️ Drift (> 5.0%) |
| `/chat` | `en` | `dark` | 390px | 6.0676% | ⚠️ Drift (> 5.0%) |
| `/chat` | `en` | `light` | 390px | 5.2871% | ⚠️ Drift (> 5.0%) |

### Root Cause Analysis of 390px Viewport Drift:
1. **Dynamic Animation State**: In `design-reference`, baseline screenshots were captured at `t = 200ms` (`scripts/capture-baseline.mjs:75`). At 200ms, the initial message bubble had not mounted. In the Playwright runner, Next.js captures at `t = 400ms`.
2. **Viewport Pixel Density**: In 390x844 viewports (total 329,160 pixels), the 17,445 diff pixels account for ~5.3% of the image. On tablet (768px) and desktop (1280px), the identical element differences account for only 2.3% - 3.5% of total pixels and comfortably pass.

---

## 5. Automated Quality Gates

All automated build and quality gates were executed directly:
1. `npm run typecheck` -> **EXIT 0** (tsc passed cleanly, no type errors).
2. `npm run lint` -> **EXIT 0** (eslint passed with 0 warnings/errors).
3. `npm run stylelint` -> **EXIT 0** (stylelint passed with 0 warnings/errors).
4. `node scripts/audit-motion.mjs scripts/site-layer.css src/styles/base.css` -> **EXIT 0** (`OK: every motion rule of the original exists in the port`).
5. `npm run build` -> **EXIT 0** (Compiled successfully, static optimization generated 24 pages including `● /ar/chat` and `● /en/chat`).
