# EazifyAi — Comprehensive Setup & Environment Configuration Guide

This guide provides end-to-end instructions for configuring, provisioning, running, and deploying the complete EazifyAi platform locally and across production environments.

---

## 1. System Architecture Overview

EazifyAi is architected as an integrated full-stack monorepo consisting of two primary services:

- **`eazifyai-api`** (Backend): Express 5 (native ESM), Prisma 7, PostgreSQL, Socket.io 4.8 real-time streaming, Google Gemini AI Discovery Agent (LangChain / LangGraph), pg-boss asynchronous job queues, Cloudflare Turnstile bot verification, Redis Socket.io adapter, and Telegram administrative webhooks.
- **`eazifyai-web`** (Frontend): Next.js 16 (Turbopack), React 19, `@supabase/ssr` authentication, bidirectional Egyptian Arabic (`ar`) and English (`en`) internationalization (`next-intl`), zero-runtime CSS design tokens, and live interactive AI discovery chat.

For complete deep architectural diagrams, ER schemas, and component topologies, see [ARCHITECTURE.md](file:///d:/EazifyAi/ARCHITECTURE.md).

---

## 2. Global Prerequisites

Before provisioning either service, ensure your local or staging workstation satisfies the following requirements:

1. **Node.js**: `v22.0.0` or higher (`v22.14.0+` LTS recommended). Verify with:
   ```bash
   node -v
   ```
2. **Package Manager**: `npm` v10+ (bundled with Node.js 22). Verify with:
   ```bash
   npm -v
   ```
3. **Database**: PostgreSQL 15+ instance (local PostgreSQL, Docker container, or hosted on [Supabase](https://supabase.com)).
4. **Third-Party Accounts & Credentials**:
   - **Supabase**: Account & Project (for Authentication, JWKS keys, and PostgreSQL database).
   - **Google AI Studio**: Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
   - **Cloudflare Turnstile**: Site Key and Secret Key from [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile).
   - **Telegram Bot** *(Optional but recommended)*: Bot API token from [@BotFather](https://t.me/botfather) and Admin Chat ID.
   - **Email Service** *(Optional)*: [Resend](https://resend.com) API key or standard SMTP credentials (Gmail, SendGrid, Amazon SES) for customer order emails.
   - **Redis** *(Optional for single node, required for multi-instance socket clustering)*: Redis 7+ instance.

---

## 3. Backend Setup (`eazifyai-api`)

Navigate to the backend directory:

```bash
cd d:\EazifyAi\eazifyai-api
```

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Configure Backend Environment Variables (`.env`)

Create a `.env` file in `d:\EazifyAi\eazifyai-api\.env`.

#### Complete Environment Variable Dictionary

| Variable | Type | Default | Required? | Description & Acquisition Guide |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | `development` | Yes | Runtime mode: `development`, `staging`, `production`, `test`. Controls error masking, stack traces, and local anonymous dev fallbacks in Socket.io. |
| `PORT` | Number | `3001` | No | HTTP & WebSocket port. Defaults to `3001` so it does not conflict with Next.js on `3000`. |
| `TRUST_PROXY` | String / Number | `0` (dev) / `1` (prod) | No | Number of upstream reverse-proxy hops to trust. Set to `1` behind Cloudflare, Nginx, or AWS ALB to enable client IP extraction via `CF-Connecting-IP` and `X-Forwarded-For`. |
| `SUPABASE_URL` | String (URL) | — | **Yes** | Supabase Project URL (`https://<project-ref>.supabase.co`). Used to fetch remote JWKS keys (`/auth/v1/.well-known/jwks.json`) and initialize Supabase clients. |
| `SUPABASE_ANON_KEY` | String | — | **Yes** | Public client key for Supabase Auth. Safe to share with client applications. |
| `SUPABASE_SERVICE_ROLE_KEY` | String | — | **Yes** | Master privileged service key bypassing Row Level Security. **Strictly backend only.** Used for administrative user role assignment (`app_metadata.role = 'admin'`). |
| `SUPABASE_JWT_SECRET` | String | — | No | Legacy symmetric JWT secret. Optional because EazifyAi uses asymmetric RS256 JWKS verification by default. |
| `JWT_SECRET` | String | — | No | Secret used to sign and verify HMAC-SHA256 capability tokens (`manageToken`) for anonymous order management. Defaults to `SUPABASE_JWT_SECRET` or `SUPABASE_SERVICE_ROLE_KEY` if omitted. |
| `DATABASE_URL` | String (URL) | — | **Yes** | Connection-pooled PostgreSQL connection string (PgBouncer port `6543` on Supabase). Used by Prisma Client for routine queries. Format: `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | String (URL) | — | **Yes** | Direct unpooled PostgreSQL connection string (port `5432` on Supabase). **Mandatory** for Prisma migrations (`prisma migrate`) and `pg-boss` queues requiring advisory locks and LISTEN/NOTIFY. Format: `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres` |
| `WEB_ORIGIN` | String (URL) | `http://localhost:3000` | **Yes** | Allowed CORS origin. Exact URL of the frontend web application. Browser requests and credentials from any other origin are rejected. |
| `GEMINI_API_KEY` | String | — | No (Dev) / **Yes** (Prod) | Google Gemini API key powering the LangGraph AI discovery agent. Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey). If omitted in development, mock fallback is active. |
| `AI_MODEL_NAME` | String | `gemini-flash-lite-latest` | No | Gemini model identifier (e.g. `gemini-flash-lite-latest`, `gemini-2.0-flash`). |
| `AI_DAILY_BUDGET_USD` | Number | `5.0` | No | Maximum daily spending cap in USD for Gemini API calls. Prevents unexpected bills; automatically trips circuit breaker and falls back to manual lead capture form. |
| `AI_REPLY_TIMEOUT_MS` | Number | `25000` | No | Maximum execution timeout (in milliseconds) for a single AI agent turn before timeout fallback is emitted. Min: `5000`, Max: `60000`. |
| `AI_MAX_OUTPUT_TOKENS` | Number | `700` | No | Hard cap on output tokens per LLM completion. |
| `AI_THINKING_BUDGET` | Number | — | No | Optional token budget allocated for model extended reasoning / thinking. |
| `AI_MOCK_FALLBACK_ENABLED` | Boolean | `true` (dev) / `false` (prod) | No | Allows mock heuristic replies when the Gemini API is unreachable or budget is exceeded. |
| `TELEGRAM_BOT_TOKEN` | String | — | No | Telegram Bot API token from [@BotFather](https://t.me/botfather). Powers operator alerts and interactive admin chat. |
| `TELEGRAM_CHAT_ID` | String | — | No | Destination numeric chat ID authorized to receive alerts and manage the bot. Run `npm run get:chatid` to auto-discover. |
| `TELEGRAM_WEBHOOK_URL` | String (URL) | — | No | Public URL for Telegram webhooks (e.g. `https://api.eazifyai.com/v1/webhooks/telegram`). When set, long-polling is disabled to avoid 409 Conflict across multiple container replicas. |
| `TELEGRAM_WEBHOOK_SECRET` | String | — | No | Secret token sent by Telegram in `X-Telegram-Bot-Api-Secret-Token` header. Verified via constant-time comparison (`crypto.timingSafeEqual`). |
| `REDIS_URL` | String (URL) | — | No | Redis connection string (e.g. `redis://localhost:6379`). Enables `@socket.io/redis-adapter` for multi-instance socket clustering. |
| `TURNSTILE_SECRET_KEY` | String | — | No (Dev) / **Yes** (Prod) | Cloudflare Turnstile secret key. Used by `requireTurnstile` middleware to verify bot challenges on fallback lead submissions and WebSocket handshakes. If empty in dev, verification is safely bypassed. |
| `RESEND_API_KEY` | String | — | No | Resend API key for transactional email delivery. |
| `SMTP_HOST` | String | — | No | Fallback SMTP host (e.g. `smtp.resend.com`, `smtp.gmail.com`). |
| `SMTP_PORT` | Number | `587` | No | SMTP port (typically `587` for STARTTLS or `465` for SSL). |
| `SMTP_USER` | String | — | No | SMTP authentication username. |
| `SMTP_PASS` | String | — | No | SMTP authentication password or App Password. |
| `SMTP_FROM` | String | `noreply@eazify.ai` | No | Default `From:` sender header for transactional emails. |
| `ENFORCE_AAL2` | Boolean | `false` | No | When `true`, enforces Authenticator Assurance Level 2 (MFA) for administrative endpoints. |
| `SENTRY_DSN` | String (URL) | — | No | Sentry project DSN for backend exception tracking and performance tracing. |
| `LOG_LEVEL` | String | `info` | No | Pino logging verbosity: `fatal`, `error`, `warn`, `info`, `debug`, `trace`. |

#### Example `eazifyai-api/.env` File

```ini
NODE_ENV=development
PORT=3001
TRUST_PROXY=0

# Supabase Authentication & Project
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=super-secret-jwt-key-min-32-chars

# PostgreSQL & Prisma Connections
DATABASE_URL="postgresql://postgres.xyzcompany:SecretPassword123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_DATABASE_URL="postgresql://postgres:SecretPassword123@db.xyzcompany.supabase.co:5432/postgres"

# CORS
WEB_ORIGIN=http://localhost:3000

# Google Gemini AI Agent
GEMINI_API_KEY=AIzaSyD-your-google-gemini-api-key
AI_MODEL_NAME=gemini-flash-lite-latest
AI_DAILY_BUDGET_USD=5.0
AI_REPLY_TIMEOUT_MS=25000

# Cloudflare Turnstile Bot Protection
TURNSTILE_SECRET_KEY=0x4AAAAAAAx_sampleSecretKey_Turnstile

# Telegram Notifications & Admin Bot
TELEGRAM_BOT_TOKEN=8194795997:AAGpInx84Mu75aiVUhoNQjWaanLygqPCFRs
TELEGRAM_CHAT_ID=7710040347
# Optional Webhook configuration (production container deployments):
# TELEGRAM_WEBHOOK_URL=https://api.eazifyai.com/v1/webhooks/telegram
# TELEGRAM_WEBHOOK_SECRET=telegram-webhook-secret-token-32chars

# Optional Redis Clustering:
# REDIS_URL=redis://localhost:6379

# Customer Email Notifications
RESEND_API_KEY=re_1234567890abcdef
SMTP_FROM=EazifyAi <orders@eazifyai.com>

# Logging
LOG_LEVEL=info
```

---

## 4. Database Setup & Migration Guide

The PostgreSQL schema is managed using Prisma 7 and stored in `eazifyai-api/prisma/schema.prisma`.

### 4.1 Fresh Database Deployment

If you are connecting to a **brand-new, clean PostgreSQL database**:

```bash
# 1. Run all pending migrations against the database
npm run prisma:deploy

# 2. Generate the Prisma TypeScript Client
npm run prisma:generate
```

### 4.2 Baseline Resolution for Existing Databases

If you are connecting to an existing PostgreSQL database where some or all tables (`Profile`, `Request`, `OutboxJob`, etc.) already exist (e.g. created during prior development passes or manual SQL executions), running `prisma migrate deploy` directly may fail with `P3005: The database schema is not empty`.

To resolve this safely without losing existing data, apply **baseline resolution**:

```bash
# Mark historical migrations as already applied:
npx prisma migrate resolve --applied 20261015000000_init_profile
npx prisma migrate resolve --applied 20261103000000_init_full_schema
npx prisma migrate resolve --applied 20261105000000_chat_messages_and_outbox

# Deploy any subsequent outstanding migrations:
npx prisma migrate deploy

# Regenerate Prisma Client types:
npm run prisma:generate
```

### 4.3 Direct Schema Push (Local Rapid Prototyping Only)

For rapid local testing against a temporary container without generating migration files:

```bash
npx prisma db push
```

---

## 5. Administrative Seeding & Access Setup

EazifyAi uses role-based access control (RBAC). Admin authorization requires `app_metadata.role === 'admin'` embedded within the Supabase JWT.

> **Security Rule**: The admin role must **always** be stored in `app_metadata` (which can only be modified by the Supabase Service Role key). Never store roles in `user_metadata` (which is client-writable).

### 5.1 Grant Admin Role to an Account

Create a user in your Supabase Auth dashboard or sign up via the web app (`/ar/login`), then run:

```bash
# Using email address:
npm run seed:admin admin@eazifyai.com

# Or using the Supabase Auth UUID:
npm run seed:admin 123e4567-e89b-12d3-a456-426614174000
```

The script will securely update the user's `app_metadata` using the backend `SUPABASE_SERVICE_ROLE_KEY`. When the user next signs in (or refreshes their token), their JWT will contain `"role": "admin"`.

### 5.2 Seed Sample Egyptian Business Requests

To populate the admin dashboard with realistic mock Egyptian requests across various statuses:

```bash
npm run seed:requests
```

This seeds 10 realistic business profiles and requests (clinics, pharmacies, tutoring academies, workshops, e-commerce stores) with Egyptian phone numbers, pain point summaries, and status event histories.

### 5.3 Discover Telegram Chat ID

To find your Telegram Chat ID for alerts:

1. Open Telegram and send `/start` or any greeting to your bot.
2. In `eazifyai-api`, run:
   ```bash
   npx tsx scripts/get-telegram-chat-id.ts
   ```
3. Copy the numeric ID output to `TELEGRAM_CHAT_ID` in your `.env`.

---

## 6. Frontend Setup (`eazifyai-web`)

Navigate to the frontend directory:

```bash
cd d:\EazifyAi\eazifyai-web
```

### 6.1 Install Dependencies

```bash
npm install
```

### 6.2 Configure Frontend Environment Variables (`.env.local`)

Create a `.env.local` file in `d:\EazifyAi\eazifyai-web\.env.local`.

#### Complete Environment Variable Dictionary

| Variable | Type | Default | Required? | Description & Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | String (URL) | `http://localhost:3000` | **Yes** | Canonical public URL of the website. Used for OpenGraph tags, sitemaps, and Supabase auth redirect verification. |
| `NEXT_PUBLIC_API_URL` | String (URL) | `http://localhost:3001` | **Yes** | Base URL for backend REST API calls (Server Actions and client fetches). |
| `NEXT_PUBLIC_TRANSPORT_MODE` | String (`websocket` \| `http`) | `websocket` | No | Chat transport protocol. Set to `http` for serverless environments (Netlify/Pages) using Server-Sent Events (SSE). |
| `GEMINI_API_KEY` | String | — | Conditional | Server-side Gemini API key used by the `/api/chat` route handler when `NEXT_PUBLIC_TRANSPORT_MODE=http`. Never exposed to browser. |
| `NEXT_PUBLIC_SOCKET_URL` | String (URL) | `http://localhost:3001` | No | WebSocket URL for Socket.io real-time chat streaming. Defaults to `NEXT_PUBLIC_API_URL` if omitted. |
| `NEXT_PUBLIC_SUPABASE_URL` | String (URL) | — | **Yes** | Supabase Project URL. Must match `SUPABASE_URL` in the API. Used by `@supabase/ssr` to manage cookies and session state. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | String | — | **Yes** | Supabase Anonymous Client Key. Safe for browser exposure. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | String | — | No (Dev) / **Yes** (Prod) | Public Cloudflare Turnstile Site Key for rendering interactive/invisible bot challenges on fallback forms. |
| `NEXT_PUBLIC_POSTHOG_KEY` | String | — | No | PostHog API Key for privacy-first analytics and funnel tracking. |
| `NEXT_PUBLIC_POSTHOG_HOST` | String (URL) | `https://eu.i.posthog.com` | No | PostHog ingest host. |
| `NEXT_PUBLIC_SENTRY_DSN` | String (URL) | — | No | Sentry Client DSN for frontend browser exception monitoring. |

#### Example `eazifyai-web/.env.local` File

```ini
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TRANSPORT_MODE=websocket
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAx_sampleSiteKey_Turnstile
```

#### Netlify & Serverless Deployments (HTTP Mode)
When deploying to Netlify or similar serverless hosts:
1. Set `NEXT_PUBLIC_TRANSPORT_MODE=http`
2. Set `GEMINI_API_KEY=<your-key>` (server-side only)
3. Set `API_URL=https://api.yourdomain.com` (for background lead forwarding)
4. Run `netlify deploy --build`

### 6.3 Contract Verification & Type Generation

Ensure frontend API types are 100% in sync with the backend OpenAPI schema:

```bash
# 1. Regenerate TypeScript interfaces from openapi.json
npm run api:types

# 2. Verify contract compatibility
npm run contract-check
```

---

## 7. Supabase Auth Dashboard Configuration

In your [Supabase Dashboard](https://supabase.com/dashboard):

1. **Enable Email Auth**:
   - Navigate to **Authentication** -> **Providers** -> **Email**.
   - Ensure **Email** is toggled ON.
   - *(Recommended for local development)* Toggle **Confirm email** OFF so newly registered test users can log in immediately without inbox verification.
2. **Configure Allowed Redirect URLs**:
   - Navigate to **Authentication** -> **URL Configuration**.
   - Set **Site URL** to `http://localhost:3000` (or your production domain).
   - Under **Redirect URLs**, add:
     - `http://localhost:3000/**`
     - `http://localhost:3000/ar/login`
     - `http://localhost:3000/en/login`
     - `http://localhost:3000/ar/profile`
     - `http://localhost:3000/en/profile`
     - `http://localhost:3000/ar/admin`
     - `http://localhost:3000/en/admin`

---

## 8. Running the System Locally

To run both services simultaneously during development:

### Terminal 1: Backend API

```powershell
cd d:\EazifyAi\eazifyai-api
npm run dev
# Backend listening on http://localhost:3001
# Socket.io listening on ws://localhost:3001
```

### Terminal 2: Frontend Web

```powershell
cd d:\EazifyAi\eazifyai-web
npm run dev
# Frontend listening on http://localhost:3000
```

Navigate to `http://localhost:3000/ar`:
- **Interactive AI Discovery Agent**: `/ar/chat`
- **Order Tracking**: `/ar/track`
- **User Profile & History**: `/ar/profile`
- **Admin Management Portal**: `/ar/admin`

---

## 9. Production Launch Runbook

For production environments (Render, Railway, Fly.io, AWS ECS, or bare-metal VPS):

### 9.1 Container Build (`eazifyai-api`)

The backend includes a production-optimized multi-stage `Dockerfile`:

```bash
cd d:\EazifyAi\eazifyai-api
docker build -t eazifyai-api:latest .
```

Run container:

```bash
docker run -d \
  --name eazifyai-api \
  -p 3001:3001 \
  --env-file .env.production \
  eazifyai-api:latest
```

### 9.2 Zero-Downtime Deployment Steps

1. **Run Migrations**: In your CI/CD pipeline, execute migrations before cutting traffic:
   ```bash
   npm run prisma:deploy
   ```
2. **Start API Instances**: Launch container instances behind a load balancer. The liveness probe is `GET /health` and the readiness probe is `GET /health/ready`.
3. **Configure Telegram Webhook**: Once the API is reachable over HTTPS, set `TELEGRAM_WEBHOOK_URL=https://api.eazifyai.com/v1/webhooks/telegram` and `TELEGRAM_WEBHOOK_SECRET` in environment variables.
4. **Deploy Web Application**: Build and deploy `eazifyai-web`:
   ```bash
   npm run build
   npm run start
   ```

For detailed infrastructure architecture, Cloudflare proxy settings, and recovery protocols, refer to [DEPLOYMENT.md](file:///d:/EazifyAi/DEPLOYMENT.md).
