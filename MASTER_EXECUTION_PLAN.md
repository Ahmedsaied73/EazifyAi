# EazifyAi — Master Execution Plan & Architecture Guide
**Platform**: EazifyAi (Next.js 16 App Router + Express 5 TypeScript API + Supabase Auth & PostgreSQL)
**Author**: Engineering Lead / Antigravity Agent
**Status**: Approved Master Guide — Phases 1 through 6 Production Ready; Phase 7 Deployment Prepared

---

## 1. Architecture & System Overview

EazifyAi is an enterprise-grade AI automation and workflow consultation platform tailored for entrepreneurs, businesses, and clinics in Egypt and the MENA region.

### Core Architecture Components
1. **Frontend (`eazifyai-web`)**:
   - **Framework**: Next.js 16 (App Router, Turbopack, React 19).
   - **Styling**: 100% Plain CSS (`base.css` + `tokens.css`), 39 keyframes, 13 reduced-motion overrides, zero runtime styling libraries.
   - **Localization**: `next-intl` prefix routing (`/ar` default RTL, `/en` LTR) with 336 strictly matched translation keys.
   - **Authentication**: Supabase Auth with cookie-based SSR session verification, MFA/AAL check, and role-based access control.
   - **Live Admin Portal**: Server-rendered dashboard (`/admin`) fetching live requests via typed server actions, zero mock data, real-time status management.

2. **Backend API (`eazifyai-api`)**:
   - **Framework**: Express 5 on Node.js 22 (strict TypeScript, ES modules).
   - **Database**: PostgreSQL with Prisma 7 ORM, connection pooler, and comprehensive Row-Level Security (RLS) deny-all / authenticated-scoped policies.
   - **Background Queue & Workers**: `pg-boss` transactional outbox processing for Telegram alerts and customer notification emails.
   - **AI Consultation Agent**: LangGraph/LangChain agent powered by Google Gemini with tool calling, context compression, and streaming SSE responses.
   - **Email Engine**: Dual-mode engine supporting Resend API (via `RESEND_API_KEY`) and standard SMTP fallback.
   - **Containerization**: Multi-stage Dockerfile optimized for Render PaaS deployment.

---

## 2. Completed Milestones (Phases 1–6)

### Phase 1: Foundation & Verbatim Design Port
- Extracted and ported 100% of Higgsfield reference styles into `src/styles/base.css` and `tokens.css`.
- Preserved all 39 `@keyframes` and 13 `prefers-reduced-motion` rules verified with `scripts/audit-motion.mjs`.
- Established OpenAPI contract sync between `eazifyai-api/openapi.json` and `eazifyai-web/src/lib/api/schema.d.ts`.

### Phase 2: Authentication & Multi-Tenant Identity
- Supabase Auth integration for web and API with JWT verification via `jose` and local JWKS validation.
- User profile management (`/profile`), session recovery, and MFA authenticator assurance levels (AAL1/AAL2).
- Server-side redirect protection for authenticated and admin routes.

### Phase 3: AI Consultation & Interactive Intake
- Multilingual Gemini-powered AI agent (`/v1/agent/chat`) with intent parsing, budget assessment, and project scoping.
- SSE streaming intake chat with audio recording integration and auto-summarization.

### Phase 4: Request Intake, Tracking & Notifications
- Public tracking page (`/track/[publicId]`) with animated verification code, milestone timeline, and real-time status updates.
- Transactional outbox pattern using `pg-boss`.
- Telegram Bot worker (`telegram.worker.ts`) sending rich HTML formatted alerts on new submissions.
- Customer status email worker (`email.worker.ts`) with Arabic localized templates and XSS sanitization.

### Phase 5: Production Admin Dashboard
- Complete removal of demo accounts, mock storage (`localStorage['ez-adm-ov']`, `ez-admin`), and fallback arrays.
- Server-enforced role verification (`app_metadata.role === 'admin'`) with automatic redirect to login.
- Real-time management across 4 tabs: Inbox (filters & status overrides), Ideas (scoring matrix), Calendar (call slot reservations), and Analytics.
- Mutations strictly dispatched through Server Actions (`updateRequestStatusAction`, `updateCallSlotAction`).

### Phase 6: Security Hardening & Observability
- Strict Helmet security headers, CORS origin enforcement, and tiered IP rate limiting.
- Row-Level Security (RLS) enabled across all tables (`Profile`, `Request`, `Message`, `AuditLog`, etc.).
- Sentry error tracking configured without PII logging.

---

## 3. Phase 7: Production Deployment Guide

### A. Deploying Backend API to Render
1. **Service Type**: Web Service (Docker).
2. **Repository**: Point to `eazifyai-api` directory.
3. **Build Command**: Uses Dockerfile multi-stage build automatically.
4. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   WEB_ORIGIN=https://eazify.ai
   DATABASE_URL=postgres://user:password@pooler.supabase.com:6543/postgres?pgbouncer=true
   DIRECT_DATABASE_URL=postgres://user:password@db.supabase.com:5432/postgres
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   SUPABASE_JWT_SECRET=<jwt-secret>
   GEMINI_API_KEY=<gemini-api-key>
   AI_MODEL_NAME=gemini-flash-lite-latest
   AI_DAILY_BUDGET_USD=5.0
   TELEGRAM_BOT_TOKEN=<telegram-bot-token>
   TELEGRAM_CHAT_ID=<telegram-chat-id>
   RESEND_API_KEY=<resend-api-key>
   SMTP_FROM=EazifyAi <notifications@eazify.ai>
   LOG_LEVEL=info
   ```
5. **Health Check Path**: `/health` (returns 200 OK with database connection status).

### B. Deploying Frontend Web to Vercel
1. **Framework Preset**: Next.js.
2. **Root Directory**: `eazifyai-web`.
3. **Build Command**: `npm run build`.
4. **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://api.eazify.ai
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   NEXT_PUBLIC_SITE_URL=https://eazify.ai
   ```

### C. Seed Initial Admin Account
Run from `eazifyai-api`:
```bash
npm run seed:admin
```
Or execute `scripts/create-or-update-admin.ts` to grant the `admin` role in Supabase `auth.users` app metadata.

---

## 4. Verification Quality Gates

All automated verification commands must pass with **0 errors**:

### Frontend Quality Suite (`eazifyai-web`)
```bash
npm run typecheck       # TypeScript strict checking
npm run lint            # ESLint rules
npm run stylelint       # CSS syntax and token enforcement
npm run i18n:check      # Key parity between ar.json and en.json
npm run contract-check  # API OpenAPI schema sync check
npm run build           # Next.js production build
```

### Backend Quality Suite (`eazifyai-api`)
```bash
npm test                # Vitest unit and integration test suite
npm run typecheck       # TypeScript strict checking across tsconfig.all.json
npm run lint            # ESLint rules
npm run build           # Prisma client generation and TypeScript compiler
```

---

## 5. Maintenance & Runbook

- **Database Migrations**: When schema changes occur, run `npx prisma migrate deploy` in staging/production.
- **Contract Synchronization**: When modifying API routes or schemas, run `npm run openapi` in `eazifyai-api` and `npm run openapi:generate` in `eazifyai-web`.
- **Worker Queue Health**: Inspect `pg-boss` queues in PostgreSQL table `pgboss.job` to monitor pending or failed outbox jobs.
