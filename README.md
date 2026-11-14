# EazifyAI

> **Simple AI-Powered Software & Automation for Small Egyptian Businesses and Professionals.**  
> نسهّلها عليك ونطوّر شغلك بالذكاء الاصطناعي.

---

## 1. Overview

EazifyAI is a production-grade software and automation platform that connects non-technical Egyptian business owners (clinics, pharmacies, private tutors, workshops, retailers, merchants) with custom AI tools, workflow automation, and lightweight management software.

Rather than forcing clients through complex forms or confusing technical jargon, EazifyAI features an **interactive AI Discovery Agent** that conducts a friendly, 2-minute Egyptian Arabic consultation, extracts core operational bottlenecks, calculates a structured completeness score, generates an executive problem brief, and immediately provisions a tracked request with real-time status updates and WhatsApp/email follow-ups.

---

## 2. Monorepo Architecture

The repository is structured as a contract-driven monorepo composed of two core services:

```
d:\EazifyAi\
├── eazifyai-api/           # Express 5 REST API & WebSocket Backend
│   ├── prisma/             # PostgreSQL database schema & migrations (Prisma 7)
│   ├── scripts/            # Database seeders, OpenAPI generator, RLS setup
│   ├── src/
│   │   ├── agent/          # LangChain / LangGraph AI discovery agent & guardrails
│   │   ├── config/         # Environment schema validation (Zod)
│   │   ├── core/           # Request ID, structured logger (Pino), errors
│   │   ├── db/             # Prisma client singleton instance
│   │   ├── jobs/           # pg-boss background queues, Telegram listener & Uptime watchdog
│   │   ├── middleware/     # Auth (JWKS/JWT), Turnstile bot gate, rate limiting, error handling
│   │   ├── modules/        # Domain slices (health, auth, admin, requests, onboarding, webhooks)
│   │   ├── services/       # AI budget circuit breaker & Cloudflare Turnstile services
│   │   ├── socket/         # Socket.io real-time streaming agent server with concurrency mutex
│   │   ├── app.ts          # Express application initialization
│   │   └── server.ts       # HTTP + Socket.io server entry point with watchdog lifecycle
│   ├── tests/              # Vitest test suites (470+ unit, integration, scale, evals)
│   ├── API.md              # Backend-specific API reference
│   ├── ARCHITECTURE.md     # Backend architecture & data flow diagrams
│   ├── SETUP.md            # Backend developer setup guide
│   └── package.json
│
├── eazifyai-web/           # Next.js 16 (Turbopack) Full-Stack Web Frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router ([locale] localized routes & Server Actions)
│   │   ├── components/     # UI primitives, SvcMenu, OrderModal, CtaAurora, Brand Logo, Motion
│   │   ├── config/         # Brand constants and metadata
│   │   ├── features/       # Feature slices (chat, onboarding, journey, profile, admin, auth, services)
│   │   ├── i18n/           # Bidirectional internationalization (next-intl ar/en)
│   │   ├── lib/            # Supabase SSR/client, OpenAPI client, mock-api fallback
│   │   └── styles/         # Token-based CSS design system (variables, base, services, motion)
│   ├── scripts/            # i18n validator, contract checker, admin test, chat route test
│   ├── SETUP.md            # Frontend developer setup guide
│   └── package.json
│
├── README.md               # Master monorepo documentation (this file)
├── SETUP.md                # Comprehensive local development and environment setup guide
├── DEPLOYMENT.md           # Production deployment & operations runbook
├── API.md                  # Comprehensive REST & WebSocket API specification
├── API_DOCUMENTATION.md    # API specification mirror
└── ARCHITECTURE.md         # System topology, state machines, and ER schemas
```

---

## 3. Technology Stack

| Layer | Technology | Key Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16.4** | App Router, React 19, Turbopack, Server Components & Server Actions |
| **Internationalization** | **next-intl 4.14** | Egyptian Arabic (`ar`) as default with English (`en`) alternate, bidirectional RTL/LTR layout |
| **Frontend Styling** | **Vanilla CSS Tokens** | Zero runtime CSS overhead, dark/light theme switcher, fluid responsive typography |
| **Backend Runtime** | **Node.js 22+ (ESM)** | Express 5.3 with native ESM modules |
| **Real-time Engine** | **Socket.io 4.8 & SSE** | Dual-transport: persistent Socket.io streaming + Server-Sent Events (`/api/chat`) |
| **AI Orchestration** | **LangChain & LangGraph** | StateGraph state machine with Egyptian cultural calibration and sensitive guardrails |
| **LLM Provider** | **Google Gemini 2.0 Flash** | High-speed contextual processing (`gemini-flash-lite-latest` / `gemini-2.0-flash`) |
| **Database & ORM** | **PostgreSQL & Prisma 7.10** | UUID primary keys, JSONB summaries, connection pooling, indexed queries, RLS policies |
| **Authentication** | **Supabase Auth (SSR)** | Full Supabase Auth with `@supabase/ssr` cookies, RS256 JWKS verification via `jose`, MFA AAL2 support, Role-Based Access Control |
| **Background Queues** | **pg-boss 12.38** | PostgreSQL-backed queues (`request_created`, `request_status_changed`) |
| **Reliable Dispatch** | **Transactional Outbox** | Atomically commits `OutboxJob` rows with business mutations to prevent lost notifications |
| **Bot Protection** | **Cloudflare Turnstile** | Managed challenge verification on REST fallback leads and WebSocket handshakes |
| **Admin Bot & Monitoring** | **Telegram Bot & Watchdog** | Interactive admin bot (`/status`, `/simulate_down`, Gemini AI chat) + 30s uptime watchdog |
| **Clustering** | **@socket.io/redis-adapter** | Multi-node horizontal Socket.io scaling via Redis pub/sub |
| **Logging & Security** | **Pino & Helmet** | Structured JSON logging, unique X-Request-Id tracing, strict CORS, HTML sanitization, tiered rate limiting |

---

## 4. Key Systems & Features

### 4.1 Design Handoff Port & Interactive Service Scenes
The user interface implements the complete design handoff specification:
- **8 Animated Service Scenes** (`ServiceScenes.tsx`, `svcCommon.tsx`, `services.css`):
  1. **Clinic & Medical Booking** (`/services/clinic` or `agents`): Live interactive doctor queue, calendar slot assignment, and patient reminder animation.
  2. **WhatsApp Commerce Bot** (`/services/whatsapp` or `flow`): Interactive chat bubble flow, instant automated catalog delivery, and order confirmation.
  3. **Retail & Store Automation** (`/services/retail` or `web`): Multi-channel inventory sync, barcode scanning simulation, and stock threshold alerts.
  4. **Private Tutor & Academy Assistant** (`/services/tutors`): Student attendance tracker, automated parent WhatsApp homework report, and fee payment status.
  5. **Restaurant & Café Order Dispatcher** (`/services/restaurant`): Live kitchen display system (KDS), delivery driver dispatching, and table QR ordering.
  6. **Workshop & Crafts Job Tracker** (`/services/workshop`): Step-by-step repair progress tracker, spare parts cost calculator, and client pickup notification.
  7. **Real Estate & Broker Lead Qualifier** (`/services/realestate`): Instant buyer budget scoring, property matching carousel, and broker WhatsApp handoff.
  8. **Custom AI Software** (`/services/custom`): Custom internal tools, spreadsheet automation, and bespoke workflow integration.
- **SvcMenu Mega-Menu**: Multi-category navigation dropdown with icons, badge tags, and direct localized links.
- **Bento Industries Grid**: Responsive visual overview of targeted Egyptian business domains on the homepage.
- **OrderModal**: Universal conversion modal triggered via standard `window.dispatchEvent(new CustomEvent('ez-order', { detail: { serviceId } }))`. Features debounced Egyptian phone validation, zero layout-shift error states, and live fallback submission.
- **Removal of `#ideas` Mock Table**: Replaced the legacy static table with the production Bento showcase, interactive 3-stage `AgentDemo`, and conversion funnel.
- **CtaAurora**: Dynamic aurora gradient call-to-action banner driving immediate AI discovery sessions and consultation bookings.

### 4.2 Modern Clean Architecture & Supabase Auth
- **Next.js 16 (App Router) + React 19**: Modern server components, server actions, and Turbopack compiler.
- **Supabase SSR Authentication**: Clean elimination of legacy `localStorage` mock authentication in favor of secure `@supabase/ssr` cookies, server-side route guards, an authenticated user profile page, and a dedicated logout modal.
- **Clean Architecture Invariants**: Strict layer isolation in `eazifyai-api` (`routes` ➔ `controllers` ➔ `services` ➔ `repositories`), where Prisma Client is accessed solely through domain repositories.

### 4.3 Operations & Management Dashboard (`/admin`)
- **Bilingual Status & Urgency Filtering**: Full Arabic and English parallel dictionaries (`ST`, `ST_EN`, `URG`, `URG_EN`, `JOBS`, `JOBS_EN`), interactive filter chips for both status and urgency, cross-language job and urgency matching (`jobMatches`, `urgencyMatches`), and urgency/score sort priority.
- **Idea Scoring & Rating Sliders**: Interactive 1–5 sliders for **Fit** (ملاءمة للشغل), **Ease** (سهولة التنفيذ), and **Value** (القيمة والميزانية) with unweighted average scoring `Math.round(((fit + ease + value) / 15) * 100)`, debounced API synchronization, and optimistic UI updates.
- **Calendar Consultation Scheduler**: Day and slot booking (`١٠ ص إلى ١٢ ظ`, `١ إلى ٣ ع`, `٦ إلى ٨ م`), confirmation toggles, and visual conflict detection indicators (conflict alert banner, `.ez-conflict-badge`, and red-tinted cell boundaries) across overlapping appointments.
- **Analytics & Financial Forecasting**: Dynamic deal value aggregation, conversion rate analysis, and pipeline metrics.

### 4.4 Live Fallback Lead Creation, Tracking & Dual-Transport Chat
- **Fallback Lead Creation**: When visitors prefer not to complete a chat consultation, the fallback intake form validates Egyptian phone numbers (`010`, `011`, `012`, `015`), sanitizes inputs, generates a human-friendly 6-digit reference code (`EZ-XXXXXX`), and allocates a secure UUID `publicId`.
- **Public Request Tracking (`/track/[publicId]`)**: Real-time interactive timeline displaying request status milestones (`NEW`, `STUDYING`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`), consultation appointment details, and project notes.
- **Dual-Transport Discovery Chat**:
  - **Socket.io Streaming**: Low-latency bi-directional streaming for persistent Node.js servers with turn registry mutex.
  - **Server-Sent Events (`/api/chat`)**: Ultra-fast HTTP SSE fallback for serverless/edge environments (Netlify, Vercel) with Google Gemini 2.0 Flash (`gemini-flash-lite-latest`).
  - **Automatic Lead Extraction**: Real-time detection and extraction of Egyptian phone numbers, emails, customer names, and business categories from live conversation history.
  - **Discovery Agent Deepen Mode**: Context-aware clarifying questions and structured completion detection ("كفاية كده" / "stop").

---

## 5. Development & Quality Verification

Both applications enforce strict automated quality gates. Before merging or deploying changes, all checks must pass with **0 errors**.

### API Verification (`eazifyai-api`)
```powershell
cd d:\EazifyAi\eazifyai-api

# Run comprehensive test suite (470+ unit, integration, scale, evals)
npm test

# Run ESLint rules (including clean architecture import restrictions)
npm run lint

# Run TypeScript strict typecheck across all files
npm run typecheck

# Verify OpenAPI specification matches router definitions
npm run openapi:check

# Compile production build
npm run build
```

### Web Verification (`eazifyai-web`)
```powershell
cd d:\EazifyAi\eazifyai-web

# Run all automated test suites (i18n check, services integration, guard profanity tests, /api/chat tests, deepen mode tests, DOMPurify tests, and admin alignment tests)
npm test

# Run TypeScript strict typecheck
npm run typecheck

# Run Next.js / React 19 ESLint
npm run lint

# Run CSS Stylelint rules
npm run stylelint

# Verify complete translation key parity across ar.json and en.json (all 426 keys)
npm run i18n:check

# Verify frontend TypeScript types match backend openapi.json
npm run contract-check

# Compile optimized production Next.js build
npm run build
```

---

## 6. Essential Documentation Links

- **[SETUP.md](file:///d:/EazifyAi/SETUP.md)**: Exhaustive workstation setup, prerequisites, complete environment variable dictionary, database migration guide, and administrative seeding instructions.
- **[DEPLOYMENT.md](file:///d:/EazifyAi/DEPLOYMENT.md)**: Production launch runbook covering Docker containers, Cloudflare edge settings, zero-downtime database deployment, and monitoring.
- **[API.md](file:///d:/EazifyAi/API.md)**: Exhaustive REST API endpoints, schemas, authentication tiers, rate limits, and Socket.io real-time streaming event specification.
- **[ARCHITECTURE.md](file:///d:/EazifyAi/ARCHITECTURE.md)**: Component topology, end-to-end user journey state machine, database ER diagram, security, and scalability architectures.
