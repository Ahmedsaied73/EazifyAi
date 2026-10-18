# PRD: EazifyAi Website (English)

## Overview

EazifyAi is a company website where visitors describe their problem to an AI assistant instead of reading a list of services. The assistant understands it with a few questions and collects a contact method. The team then studies the idea, replies, and schedules a call.

The company builds software that makes people's lives and work easier, especially AI-integrated software. The site is the first step of that process: it receives the idea, organizes it, and hands it to the team ready for study.

The site is Arabic (Egyptian focus) and English, dark by default with a light option, minimal, comfortable on the eyes, and never annoying.

## Problem and opportunity

Small business owners have work problems that AI could solve, but they cannot describe them technically, and company websites present services without listening.

- **Visitor side:** they do not know where to start, and a classic contact form feels like throwing words into the void.
- **Company side:** ideas arrive scattered and need time to judge which are worth building and what is required.

Opportunity: the site runs the first discovery session itself and hands the team an organized request (problem, context, contact), so the visitor feels speed and care, and the team saves time.

## Goals and success metrics

Every suitable visitor should describe their problem and leave contact details in under 5 minutes, and every request should reach the team organized and on time. Targets are proposed starting points to adjust after the first 100 real conversations.

| Metric | Target (proposed) |
| --- | --- |
| Visitors who start a chat with the assistant | 15% of visitors |
| Chats completed with contact details left | 50% of those who start |
| Qualified requests worth studying | 30% of requests |
| First reply from the team | Within 24 hours |
| Requests lost or never delivered | Zero |
| First screen load on an average phone over 4G | Under 2.5 seconds |

## Target users

- **Visitor (primary):** a small business owner (teacher, warehouse owner, shop owner, personal business) in a field where AI can help. Not technical; needs to feel credibility, speed and professionalism from the first second. Large companies are not targeted for now.
- **Admin (the team):** currently one person, the founder, who receives requests, studies each idea, and decides whether and how to build it.

## Visitor journey

1. The visitor opens the home page.
2. Optional quick questions while scrolling (job, etc.).
3. The visitor starts the chat with the assistant. If the assistant is down, a fallback form (problem + phone number) is used instead.
4. The visitor tells the problem and reviews the live summary.
5. The visitor leaves a contact method. **The request is saved at this moment.**
6. Optional extra details (best contact time, rough budget, urgency, more details).
7. The visitor sees the request number, a reply timeline, and (later) call booking.
8. The visitor follows the request on a tracking page.

In parallel, the team gets an instant notification, studies the idea, replies on WhatsApp and schedules a call, and the visitor sees updates.

## Features

The project has three parts: the visitor experience, the AI assistant, and the admin dashboard.

### For the visitor

| Feature | What it does | Built with |
| --- | --- | --- |
| Home page | Clear logo and a simple line about the company; a motion graphic explaining that an assistant listens to the problem, without annoying the visitor | Next.js and light animation |
| Questions while scrolling | Visitor states their job (choice or text) so the assistant knows them before chat | Next.js, answers saved via the API |
| Chat with the assistant | Egyptian-professional dialogue, reply appears as it is written | LangChain, live streaming from the API |
| Live problem-summary card | A summary built in front of the visitor as they talk | Extracted by the assistant |
| Voice input | Speak instead of typing | Browser voice feature |
| Resume chat and history | Continue an unfinished chat and see old ones | Server and database storage |
| After chat | Add details, see request number and reply timeline, book a call | Next.js and the API |
| Request tracking | A page showing request status step by step | API and database |
| Account | Register, login, profile (optional); the assistant greets by name | Supabase Auth |
| Company pages | About and contact, privacy and copyright, direct WhatsApp | Next.js |
| Languages and theme | Egyptian Arabic and English; dark and light | Next.js |
| Credibility section | Transparency about the company and how it works instead of invented testimonials, until real work exists | Content written by the founder |
| Quick clarity rating | One question after the journey: was it clear what happens next? | Next.js and the API |

### The AI assistant

| Feature | What it does | Built with |
| --- | --- | --- |
| Understanding the problem | Asks only key questions, then closes so the visitor feels no time was wasted | LangChain |
| Structured summary | Produces a structured request: problem, business type, urgency | LangChain and validation rules |
| Clear limits | Never promises prices or delivery times; says the team replies after studying | Assistant instructions and tests |
| Fallback mode | If the assistant is down, a simple form (problem and phone) replaces the chat | The API |

### For the admin

| Feature | What it does | Built with |
| --- | --- | --- |
| Requests inbox and request page | All requests in one place, each with details and chat history | Next.js and the API |
| Instant notification | Every new request reaches you on Telegram or email | The API and a notification service |
| Quick WhatsApp reply | A button that opens WhatsApp with a ready message | A ready WhatsApp link |
| Call calendar | Booked slots; a slot can never be booked twice | Database |
| Idea scoring and filtering | Suggested score with reason; the final decision is yours | Simple rules plus an AI suggestion |
| Analytics | How many started, finished, and qualified | The API and database |
| Protected login | Email and password with two-step verification, and a log of every action | Supabase Auth |

## Quality requirements

- **Security and privacy:** each visitor sees only their own data and requests; the admin is protected by two-step verification; bot and spam protection; a cap on AI cost. The privacy page must match what is actually stored; visitors can request deletion.
- **Performance:** fast on an average phone over 4G; calm, light motion for weak devices.
- **Reliability:** a visitor's request must never be lost, even if the assistant or notification service is down.
- **Languages:** Egyptian Arabic first, then English; right-to-left layout correct on mobile.
- **Usability:** the visitor always knows where they are and what comes next; nothing annoys or restricts them.
- **Search visibility (SEO):** title and description per page, share image, sitemap.

## Technologies (high level)

Two separate codebases: one for the front end and one for the server.

| Part | Technology | What it does |
| --- | --- | --- |
| Front end | Next.js | All site pages and the visitor and admin experience |
| Server (API) | Node.js with Express | Receives requests, runs the assistant, sends notifications |
| Database | PostgreSQL on Supabase with Prisma | Stores conversations, requests, bookings |
| Accounts | Supabase Auth | Sign up, login, admin protection |
| AI assistant | LangChain (Gemini model) | Runs the dialogue and extracts the problem summary |
| Bot protection | Cloudflare Turnstile | Stops spam before it reaches the assistant |
| Notifications | Telegram and email | Alerts you of every new request |

### Why each technology and where it is used

| Technology | Why | Where |
| --- | --- | --- |
| Next.js | Fast pages on mobile that appear in Google; supports two languages and right-to-left | All interfaces |
| TypeScript | Catches errors before visitors see them | Both repos |
| Node.js with Express | Simple, well known, supports streaming the assistant's reply, suits a small team | The API |
| PostgreSQL on Supabase | Strong database that prevents errors at the root (such as double booking), managed so no server to run | All data |
| Prisma | Writes queries safely and keeps table changes in reversible files | The API only |
| Supabase Auth | Ready, proven sign-up, login and two-step verification | Accounts and admin protection |
| LangChain with LangGraph | Splits the conversation into clear stages instead of a free-roaming assistant, so cost and behavior are controlled | The AI assistant |
| Zod | Validates every input, from a visitor or from the assistant itself | Both repos |
| OpenAPI | A document generated from the server that is the contract between the repos | Between front end and server |
| Cloudflare and Turnstile | Protection from bots and attacks before they reach the server; free to start | In front of the site and chat |
| Telegram and an email service | Instant alert on the channel you actually use | Admin notifications |

## Code standards

These standards keep the code correct, understandable and secure, and are enforced automatically on every change instead of relying on memory. Full details are in CODE\_STANDARDS.md.

1. **General:** strict TypeScript with no `any`, ESLint and Prettier, every change as a pull request, `main` always working, and any failing lint, type or test check blocks the change.
2. **Server structure:** modules by feature. The controller receives the request, the service holds the logic, and the repository is the only layer that talks to the database, with every query scoped to the data owner so one visitor cannot see another's data.
3. **Input validation:** everything entering the server, from a visitor or the assistant, is checked with Zod and rejected if it has extra fields. Nothing from outside is trusted.
4. **Errors and logs:** a uniform error shape; the visitor sees a generic message; details go to logs without personal data such as phone or message text.
5. **Front end:** small single-purpose components; pages load from the server by default for speed; all text lives in translation files; styling uses start and end instead of left and right so Arabic layout works; motion uses transform and opacity only, respects the reduced-motion setting, and the site works with keyboard and screen readers.
6. **Security in code:** no secrets or keys in code, no `dangerouslySetInnerHTML`, no raw SQL, and request data is never passed straight to the database.
7. **Database:** every table change is a migration file, never manual; risky changes happen in two steps (add the new, then remove the old); production runs from CI only.
8. **Tests:** unit tests for logic (Vitest), integration tests on a test database, an automatic permission test that a visitor cannot reach another visitor's data, an end-to-end test of the main path (Playwright), and an assistant test set.
9. **The assistant:** any change to its instructions or model must pass the test set before release; the assistant never writes to the database itself, code does that after validation.
10. **When a change is done:** checks are green, a short self-review, the OpenAPI contract is updated if it changed, and a big feature stays behind a switch until tested.

## Decisions made

- **Way of working:** AI writes the code; the founder focuses on decisions and tests.
- **Review before any release:** test results, a manual run of the main path, and a change summary.
- **Notifications:** Telegram and email together; email is the backup.
- **Assistant model:** Gemini through LangChain. Free in testing with fake conversations only; paid before launch so visitor conversations are not used to improve Google's products.
- **Front-end hosting:** try on the free plan, then move to a plan that allows commercial use before the site is shown to real visitors.
- **Database:** Supabase free, with automatic weekly backups of our own, an alert if the backup fails, and periodic activity to prevent pausing. Every request is also sent in full to Telegram and email as a second copy.
- **Budget:** as low as possible; revisit when real visitors arrive.

### Privacy and data

- **Mandatory contact detail:** the WhatsApp number only.
- **Retention:** the summary and WhatsApp number are kept permanently; raw chat text is deleted after a period (proposed 6 months) and any deletion request from a visitor is carried out. The privacy page must say so plainly.
- **Analytics:** aggregated numbers without personal tracking, plus PostHog for site tracking. Session recording is not enabled on the chat page so it does not capture chat text.
- **Sensitive data:** if a visitor types a card number, a password or their own clients' data, the assistant politely stops them and that part is not stored or sent to the AI.

### Assistant rules and request completeness

- **When it closes the chat:** not by a fixed number of questions. There is a maximum as a safety ceiling, but the real test is whether the request reached the team clearly enough to decide without going back to the visitor.
- **Its job:** save the founder the questions, research and back-and-forth.
- **Prices and timelines:** it promises nothing; the team decides after studying.
- **Unsuitable ideas:** recorded normally; the team decides, with no automatic rejection.
- **If the visitor does not know an answer:** record it as unknown and continue without pushing.
- **Identity:** as in the current design; a name may be discussed later. It always identifies itself as an AI assistant.
- **Internal analysis:** with every request the assistant adds, for the admin only, the problem type, a possible solution direction, what is missing, and notes. It is never shown to the visitor.

A request counts as complete when the assistant knows: business type, the problem and how it is done today, volume or frequency, current tools, the desired outcome, urgency, and the WhatsApp number.

### Security

- **Admin login:** an authenticator app on the phone as the second factor, from anywhere with it.
- **Visitor tracking of a request:** two ways: a private long link sent on WhatsApp, and an optional account.
- **Alerts:** any suspicious activity (many failed logins, abnormal AI cost, a spam attack) reaches you instantly on Telegram.
- **Fixed rules from the code standards:** each visitor sees only their own data, with an automatic test for it; bot protection; a daily cap on AI cost.

### Design transfer from Higgsfield

- **Current state:** the test site is built in React on TanStack Start, running on Cloudflare with a D1 database. Our own design code is about 3,900 lines; the rest is ready-made Higgsfield tooling that does not transfer.
- **Decision:** a literal port of the exact same look to Next.js; improvements after launch.
- **What changes under the look:** routes and SEO move to Next.js, requests go to the real API, and browser-stored accounts are replaced by Supabase Auth.
- **Languages:** one URL per language: /ar and /en.
- **Existing data:** all test data, so nothing to migrate. The current site stays as a design reference until the new one is ready.

### After launch

- **Monitoring:** an instant Telegram alert if the site or the assistant goes down.
- **Reviewing numbers:** weekly for the first two months: share who started and finished the chat, qualified requests, and AI cost.
- **First 10 trials:** from the founder's network before launch.
- **Marketing:** content and a personal brand under Ahmed Saied pointing to the site; a marketing plan may follow.
- **Backups:** weekly and automatic. In the worst case we could lose the last week of accounts and chats, but the requests themselves stay with you because they are sent to Telegram and email.

## Out of scope for now

Proposed for the first version, and adjustable:

- Targeting large companies
- Online payment
- A mobile app
- The official WhatsApp Business API (start with a direct WhatsApp link)
- Live chat with humans
- A blog and languages other than Arabic and English
- Call booking and its calendar (after the first launch)

## Proof that the project is done and working

The project is ready to launch when every item below is met and tried for real, not only written. Numbers are proposed.

### Main path

- [ ] A new visitor opens the site, tells their problem, leaves a phone number, and the request appears in the admin inbox with a notification within a minute
- [ ] If the assistant is down, the visitor can still send their problem from the fallback form and it reaches the admin
- [ ] The request is not duplicated if the visitor presses twice or the connection drops
- [ ] Arabic and English are complete, and layout direction is right on a real phone

### Security

- [ ] A visitor cannot see another visitor's request or conversation (an automatic test that runs on every update)
- [ ] The admin cannot log in without two-step verification
- [ ] The automatic security scan has no high-severity findings
- [ ] No secrets or keys in the code
- [ ] A backup restore was actually tried at least once

### Performance

- [ ] Lighthouse mobile score of 90 or more on the home page
- [ ] First screen loads in under 2.5 seconds on 4G
- [ ] A load test of 200 concurrent conversations without errors

### Assistant quality

- [ ] A test set of at least 30 Egyptian conversations, including attempts to trick it
- [ ] 90% of normal conversations end with a correct summary
- [ ] Zero promises of prices or delivery times

### Real trial

- [ ] 10 small business owners tried the site and most finished the conversation without help
- [ ] The monthly AI budget is set, with an alert before it runs out

## Risks and how to handle them

| Risk | Handling |
| --- | --- |
| A bot floods the chat and AI cost rises | Bot protection, a daily cost cap, and an automatic fallback form |
| A visitor's request is lost | The request is saved before any notification, retries, and a daily email digest of the last 24 hours of requests |
| Visitor data leaks | Strict permissions, automatic tests, and database protection |
| The assistant promises a visitor something wrong | The assistant does not act by itself; the decision is always human |
| The admin account is breached | Two-step verification, a log of every action, and short sessions |
| Spam fills the inbox | Bot protection plus idea scoring and filtering |
| No past work or testimonials to build trust | Transparency on the site; first real trials become examples with the owners' permission |
| The founder is the whole team and work is large | A small scope for version one and strict prioritization |

## Implementation phases and open questions

Each phase is only finished when its items in the proof section are met. After each phase we test it together before continuing. The target launch is within a month of 15 October 2026.

1. **Foundation:** the two repos, environments, automatic tests and checks, connecting the front end to the server, and the database.
2. **Accounts and admin:** register, login and profile, admin login with the authenticator app, and the requests inbox and request page with sample data, plus permission tests.
3. **The assistant:** the real chat, the completeness rule, the summary and internal analysis, the fallback form, and the test set.
4. **Request flow:** saving the real request, Telegram and email notifications, the tracking page and the private link.
5. **Visitor journey:** extra details, voice input, and resuming a chat.
6. **Rest of the admin:** quick reply, scoring, and analytics.
7. **Launch preparation:** security scan, load and performance tests, a backup whose restore was tried, moving to production plans (paid Gemini and hosting that allows commercial use), a trial with 10 business owners, then launch.

### Open questions

- [ ] Where will the API run (always on, near Egypt)? Not decided.
- [ ] The domain name: chosen and bought?
- [ ] A Telegram bot and a notification email
- [ ] After how many months is raw chat text deleted? (proposed 6)
- [ ] What real material exists now for the credibility section?
- [ ] The founder photo and story for the About page

## Implementation documents (for the AI coder)

Written as ready files to place in the repos: `spec.md` (technical source of truth), `CODE_STANDARDS.md`, `PHASE_1.md` (first-phase plan and AI instructions), and `LIBRARIES.md` (libraries per phase). Decisions that changed or were added:

- **Auth:** Supabase Auth, verified on the API with `jose`. bcrypt and jsonwebtoken are removed.
- **Jobs:** `pg-boss` on the same Postgres instead of BullMQ and Redis (lower cost). socket.io, axios, busboy and ua-parser-js are removed.
- **Versions:** Next 16, React 19, Express 5, Prisma 7.x instead of Next 13, Express 4, Prisma 5. The front end is much smaller because the current design is plain CSS without UI libraries.
- **Design:** a literal port, then tokens: one color changes in one place, and the founder name and contact details are variables in `brand.ts`. All text lives in translation files. Sameness is proven by comparing screenshots with the Higgsfield site.
- **Phase 1:** foundation and the literal port (about 5 to 7 days), then we test together.
- **Open decisions:** where the API runs, the domain, and the Telegram bot and email.

## Updated decisions (these override anything above that conflicts)

- **UI and animations:** a literal port of everything in the Higgsfield code (every page including /brand, every animation), with no redesign. Verified with screenshots and motion recordings.
- **Auth:** Supabase Auth (free), reconfirmed instead of Clerk, which could cost money or need a paid plan for MFA.
- **Chat:** socket.io instead of SSE.
- **Identity:** FingerprintJS as an anti-abuse signal only (stored as a salted hash, disclosed on the Privacy page); never used for login or permissions.
- **Open:** the consent wording for fingerprinting, to be reviewed with a lawyer.
