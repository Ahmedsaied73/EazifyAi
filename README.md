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
│   ├── prisma/             # PostgreSQL database schema & migrations
│   ├── scripts/            # Database seeders, OpenAPI generator, RLS setup
│   ├── src/
│   │   ├── agent/          # LangChain / LangGraph AI discovery agent & guardrails
│   │   ├── config/         # Environment schema validation (Zod)
│   │   ├── core/           # Request ID, structured logger (Pino), errors
│   │   ├── db/             # Prisma client instance
│   │   ├── jobs/           # pg-boss background queues, Telegram listener & Uptime watchdog
│   │   ├── middleware/     # Auth (JWKS/JWT), Turnstile bot gate, rate limiting, error handling
│   │   ├── modules/        # Domain slices (health, auth, admin, requests, onboarding, webhooks)
│   │   ├── services/       # AI budget circuit breaker & Cloudflare Turnstile services
│   │   ├── socket/         # Socket.io real-time streaming agent server with concurrency mutex
│   │   ├── app.ts          # Express application initialization
│   │   └── server.ts       # HTTP + Socket.io server entry point with watchdog lifecycle
│   ├── tests/              # Vitest test suites (270+ unit, integration, scale, evals)
│   ├── API.md              # Backend-specific API reference
│   ├── ARCHITECTURE.md     # Backend architecture & data flow diagrams
│   ├── SETUP.md            # Backend developer setup guide
│   └── package.json
│
├── eazifyai-web/           # Next.js 16 (Turbopack) Full-Stack Web Frontend
│   ├── src/
│   │   ├── app/            # Next.js App Router ([locale] localized routes & Server Actions)
│   │   ├── components/     # UI primitives, Brand Logo, Motion & Interactive widgets
│   │   ├── config/         # Brand constants and metadata
│   │   ├── features/       # Feature slices (chat, onboarding, journey, profile, admin, auth)
│   │   ├── i18n/           # Bidirectional internationalization (next-intl ar/en)
│   │   ├── lib/            # Supabase SSR/client, OpenAPI client, mock-api fallback
│   │   └── styles/         # Token-based CSS design system
│   ├── scripts/            # i18n validator, contract checker, visual regression runners
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
| **Real-time Engine** | **Socket.io 4.8** | Low-latency bi-directional streaming for token-by-token AI agent responses |
| **AI Orchestration** | **LangChain & LangGraph** | StateGraph state machine with Egyptian cultural calibration and sensitive guardrails |
| **LLM Provider** | **Google Gemini 2.0 Flash** | High-speed contextual processing (`gemini-flash-lite-latest` / `gemini-2.0-flash`) |
| **Database & ORM** | **PostgreSQL & Prisma 7.10** | UUID primary keys, JSONB summaries, connection pooling, indexed queries, RLS policies |
| **Authentication** | **Supabase Auth** | Asymmetric RS256 JWKS verification via `jose`, MFA AAL2 support, Role-Based Access Control |
| **Background Queues** | **pg-boss 12.38** | PostgreSQL-backed queues (`request_created`, `request_status_changed`) |
| **Reliable Dispatch** | **Transactional Outbox** | Atomically commits `OutboxJob` rows with business mutations to prevent lost notifications |
| **Bot Protection** | **Cloudflare Turnstile** | Managed challenge verification on REST fallback leads and WebSocket handshakes |
| **Admin Bot & Monitoring** | **Telegram Bot & Watchdog** | Interactive admin bot (`/status`, `/simulate_down`, Gemini AI chat) + 30s uptime watchdog |
| **Clustering** | **@socket.io/redis-adapter** | Multi-node horizontal Socket.io scaling via Redis pub/sub |
| **Logging & Security** | **Pino & Helmet** | Structured JSON logging, unique X-Request-Id tracing, strict CORS, HTML sanitization, tiered rate limiting |

---

## 4. Architectural Invariants & Security Principles

1. **Strict Clean Architecture (Layered Boundaries)**:
   - `Routes` define endpoints, rate limiters, validation schemas, and bot gates.
   - `Controllers` extract parameters and invoke domain services.
   - `Services` encapsulate business logic, domain rules, and orchestrate background jobs.
   - `Repositories` are the **exclusive** point of access to Prisma / database clients. Direct Prisma imports in controllers or services are forbidden by ESLint architecture boundaries.
2. **Asymmetric JWKS Authentication**:
   - The API verifies Supabase JWTs locally using remote JWKS sets (`/.well-known/jwks.json`) with in-memory caching.
   - No shared JWT secret is required between frontend and backend.
3. **AI Daily Budget Circuit Breaker**:
   - An in-memory circuit breaker monitors token consumption and estimated spending.
   - If spend reaches `AI_DAILY_BUDGET_USD` (default `$5.00/day`), it automatically trips, gracefully falling back to a structured lead form without crashing or producing billing surprises.
4. **Defense-in-Depth Rate Limiting**:
   - `publicLimiter`: 60 requests/minute (anonymous survey intake, tracking lookup).
   - `authLimiter`: 15 requests/15 minutes (profile updates, account actions).
   - `fallbackLimiter`: 3 requests/minute (fallback lead submission).
   - `agentLimiter`: 20 messages/minute (WebSocket chat messages).
   - `apiLimiter`: 120 requests/minute (polled reads).
   - `adminLimiter`: 120 requests/minute (management operations, status updates).
5. **Data Privacy & AI Guardrails**:
   - Pre-flight and post-flight regex filters scan for sensitive Egyptian data (National IDs via Luhn verification, payment cards, credentials).
   - Contact information (phone and email) is automatically masked for non-owner public requests.
6. **Transactional Outbox Pattern**:
   - Asynchronous events are persisted in `OutboxJob` within the database transaction, guaranteeing reliable at-least-once delivery to queues even during network outages.

---

## 5. Development & Quality Verification

Both applications enforce strict automated quality gates. Before merging or deploying changes, all checks must pass with **0 errors**.

### API Verification (`eazifyai-api`)
```powershell
cd d:\EazifyAi\eazifyai-api

# Run comprehensive test suite (270+ unit, integration, scale, evals)
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

# Run TypeScript strict typecheck
npm run typecheck

# Run Next.js / React 19 ESLint
npm run lint

# Run CSS Stylelint rules
npm run stylelint

# Verify complete translation key parity across ar.json and en.json
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