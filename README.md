# EazifyAi

> **Simple AI-Powered Software & Automation for Small Egyptian Businesses and Professionals.**
> نسهّلها عليك ونطوّر شغلك بالذكاء الاصطناعي.

---

## 1. Overview

EazifyAi is a production-grade software platform that connects non-technical Egyptian business owners (pharmacies, clinics, private tutors, workshops, retailers, merchants) with custom AI tools, automation systems, and lightweight management software.

Rather than forcing clients through complex forms or technical jargon, EazifyAi features an **interactive AI Discovery Agent** that conducts a friendly, 2-minute Egyptian Arabic consultation, extracts the core operational pain points, calculates a structured completeness score, generates a problem brief, and immediately provisions a tracked request with real-time status updates and WhatsApp/email follow-ups.

---

## 2. Monorepo Architecture

The repository is structured as a cohesive monorepo composed of two core applications sharing a contract-driven API schema:

```
D:\EazifyAi\
├── eazifyai-api/           # Express 5 REST API & WebSocket Backend
│   ├── prisma/             # PostgreSQL database schema & migrations
│   ├── scripts/            # Database seeders, OpenAPI generator, RLS setup
│   ├── src/
│   │   ├── agent/          # LangChain / LangGraph AI discovery agent & guardrails
│   │   ├── config/         # Environment schema validation (Zod)
│   │   ├── core/           # Request ID, structured logger (Pino), errors
│   │   ├── db/             # Prisma client instance
│   │   ├── jobs/           # pg-boss background queues (Telegram & Email workers)
│   │   ├── middleware/     # Auth (JWKS/JWT), rate limiting, Zod validation, error handling
│   │   ├── modules/        # Modular domain slices (health, auth, admin, requests, onboarding)
│   │   ├── socket/         # Socket.io real-time streaming agent server
│   │   ├── app.ts          # Express application initialization
│   │   └── server.ts       # HTTP + Socket.io server entry point
│   ├── tests/              # Vitest test suites (evals, integration, matrix, unit)
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
│   └── package.json
│
├── README.md               # Master project overview & architecture (this file)
├── SETUP.md                # Exhaustive local development and environment setup guide
└── API_DOCUMENTATION.md    # Comprehensive REST & WebSocket API specification
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
| **LLM Provider** | **Google Gemini 3.8 / 1.5** | High-speed contextual processing via `@langchain/google-genai` |
| **Database & ORM** | **PostgreSQL & Prisma 7.10** | UUID primary keys, JSONB summaries, connection pooling, indexed queries |
| **Authentication** | **Supabase Auth** | Asymmetric RS256 JWKS verification via `jose`, MFA AAL2 support, Role-Based Access Control |
| **Background Queues** | **pg-boss 12.38** | Reliable PostgreSQL-backed job queues for Telegram alerts and customer notification emails |
| **Logging & Security** | **Pino & Helmet** | Structured JSON logging, unique X-Request-Id tracing, strict CORS, tiered rate limiting |

---

## 4. Architectural Invariants & Security Principles

1. **Strict Clean Architecture (Layered Boundaries)**:
   - `Routes` define endpoints, rate limiters, and validation schemas.
   - `Controllers` extract parameters and invoke domain services.
   - `Services` encapsulate business logic, domain rules, and orchestrate background jobs.
   - `Repositories` are the **exclusive** point of access to Prisma / database clients. Direct Prisma imports in controllers or services are forbidden by ESLint boundaries.
2. **Asymmetric JWKS Authentication**:
   - The API verifies Supabase JWTs locally using remote JWKS sets (`/.well-known/jwks.json`) with in-memory caching.
   - No shared JWT secret is required, ensuring zero credential leak risk between frontend and backend.
3. **Defense-in-Depth Rate Limiting**:
   - `publicLimiter`: 60 requests/minute (anonymous survey intake, tracking lookup).
   - `authLimiter`: 20 requests/minute (profile updates, user request queries).
   - `adminLimiter`: 120 requests/minute (management operations, status updates).
4. **Data Privacy & AI Guardrails**:
   - Pre-flight and post-flight regex filters scan for sensitive Egyptian data (National IDs via Luhn verification, payment cards, credentials).
   - AI outputs containing hallucinated quotes, currency commitments, or personal data are strictly redacted before delivery.
5. **Fail-Safe Offline Operation**:
   - In development or during API maintenance, `eazifyai-web` utilizes client-side storage fallbacks to ensure uninterrupted user demonstrations.

---

## 5. Development & Quality Verification

Both applications enforce strict automated quality gates. Before merging or submitting changes, all checks must pass with **0 errors**.

### API Verification (`eazifyai-api`)
```powershell
cd D:\EazifyAi\eazifyai-api

# Run comprehensive test suite (82+ unit, integration, eval, and matrix tests)
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
cd D:\EazifyAi\eazifyai-web

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

## 6. Next Steps & Documentation Links

- For a complete, step-by-step installation and environment configuration guide, see [SETUP.md](file:///D:/EazifyAi/SETUP.md).
- For complete REST endpoints, parameters, schemas, and Socket.io events, see [API_DOCUMENTATION.md](file:///D:/EazifyAi/API_DOCUMENTATION.md).