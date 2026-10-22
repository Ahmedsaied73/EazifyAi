# EazifyAi Setup & Environment Configuration Guide

This guide provides complete instructions for configuring, provisioning, and running the EazifyAi platform locally and in production.

---

## 1. Prerequisites

Before starting, ensure your local workstation meets the following minimum requirements:

1. **Node.js**: `v22.0.0` or higher (Node 22 LTS recommended). Verify with `node -v`.
2. **Package Manager**: `npm` v10+ (comes bundled with Node.js).
3. **Database**: PostgreSQL 15+ database (local instance or hosted on [Supabase](https://supabase.com)).
4. **Accounts & API Keys**:
   - A [Supabase](https://supabase.com) account & project.
   - A [Google AI Studio](https://aistudio.google.com/) account for Google Gemini API access.
   - *(Optional)* A Telegram Bot from [@BotFather](https://t.me/botfather) for real-time order alerts.
   - *(Optional)* An SMTP email provider (e.g. Resend, SendGrid, Amazon SES, or Gmail App Password) for order status emails.

---

## 2. Backend Setup (`eazifyai-api`)

The backend API is an Express 5 + Socket.io + Prisma service located in `D:\EazifyAi\eazifyai-api`.

### Step 2.1: Install Dependencies
```powershell
cd D:\EazifyAi\eazifyai-api
npm install
```

### Step 2.2: Configure Environment Variables
Create a file named `.env` in `D:\EazifyAi\eazifyai-api\.env`.

#### Exhaustive `.env` Variables Breakdown

| Variable | Type & Default | Description, Purpose & Acquisition Guide |
| :--- | :--- | :--- |
| `NODE_ENV` | String (`development`) | **Runtime environment**: Allowed values are `development`, `staging`, `production`, `test`. Controls error logging detail, stack traces, and enables local anonymous dev fallbacks in Socket.io when testing without active Supabase sessions. |
| `PORT` | Number (`3001`) | **HTTP & WebSocket Port**: The network port on which the Express server and Socket.io engine listen. Default is `3001` to prevent conflicts with Next.js running on `3000`. |
| `SUPABASE_URL` | String (URL) | **Supabase Project URL**: Needed by the API to fetch remote JWKS public keys from `${SUPABASE_URL}/auth/v1/.well-known/jwks.json` to verify incoming user JWTs, and to initialize the Supabase client.<br/>*How to get:* In your Supabase Dashboard, go to **Project Settings** -> **API** -> **Project URL** (format: `https://<project-ref>.supabase.co`). |
| `SUPABASE_ANON_KEY` | String | **Supabase Anonymous Client Key**: Public client API key for standard Supabase operations.<br/>*How to get:* In Supabase Dashboard -> **Project Settings** -> **API** -> `anon public` key. |
| `SUPABASE_SERVICE_ROLE_KEY` | String | **Supabase Service Role Secret Key**: Privileged master key that bypasses Row Level Security (RLS). Used exclusively on the backend for administrative operations, setting `app_metadata.role = 'admin'`, and automated sync scripts.<br/>*How to get:* In Supabase Dashboard -> **Project Settings** -> **API** -> `service_role secret` key. **Never expose this to the frontend!** |
| `SUPABASE_JWT_SECRET` | String *(Optional)* | **Supabase JWT Secret**: Legacy symmetric signing secret. Optional because EazifyAi uses asymmetric RS256 JWKS verification by default.<br/>*How to get:* In Supabase Dashboard -> **Project Settings** -> **API** -> **JWT Secret**. |
| `DATABASE_URL` | String (URL) | **Prisma Database Connection URL**: PostgreSQL connection string with connection pooling enabled (e.g. PgBouncer / Supabase Transaction pooler on port `6543`). Used by Prisma Client for routine API queries.<br/>*Format:* `postgresql://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | String (URL) | **Direct Database Connection URL**: Direct unpooled PostgreSQL connection string directly connecting to port `5432`. **Required** for Prisma migrations (`prisma migrate`) and `pg-boss` background queues which require persistent LISTEN/NOTIFY and transactional table locks.<br/>*Format:* `postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres` |
| `WEB_ORIGIN` | String (URL) | **CORS Allowed Origin**: The exact URL of the frontend web application (e.g. `http://localhost:3000` for local development, or `https://eazifyai.com` in production). CORS requests and credentials from any other origin are strictly rejected. |
| `SENTRY_DSN` | String (URL) *(Optional)* | **Sentry DSN**: DSN string for backend crash reporting and performance tracing.<br/>*How to get:* Sentry Dashboard -> Project Settings -> Client Keys (DSN). |
| `GEMINI_API_KEY` | String *(Optional)* | **Google Gemini API Key**: Powers the LangChain / LangGraph AI Discovery Agent that chats with users, clarifies business problems, and computes brief completeness.<br/>*How to get:* Visit [Google AI Studio](https://aistudio.google.com/app/apikey), sign in with your Google account, click **Create API Key**, and copy the generated key. |
| `AI_MODEL_NAME` | String (`gemini-2.0-flash`) | **Gemini Model Identifier**: The specific Google Gemini model to execute. Defaults to `gemini-2.0-flash`, balancing ultra-low latency with nuanced Egyptian Arabic understanding. |
| `AI_DAILY_BUDGET_USD` | Number (`5.0`) | **Daily Spending Cap**: Maximum allowable daily cost in USD for LLM API calls. Built-in guardrail preventing unexpected bills from viral traffic or abuse. |
| `TELEGRAM_BOT_TOKEN` | String *(Optional)* | **Telegram Bot API Token**: Token for the bot that sends real-time order notifications and powers the interactive admin bot listener.<br/>*How to get:* Open Telegram, message `@BotFather`, run `/newbot`, name your bot, and copy the HTTP API token provided. |
| `TELEGRAM_CHAT_ID` | String *(Optional)* | **Telegram Admin Chat ID**: Destination chat ID authorized to receive alerts and interact with the admin bot.<br/>*How to get:* Message your bot in Telegram, then run `npx tsx scripts/get-telegram-chat-id.ts` in `eazifyai-api` to discover your numeric Chat ID. |
| `RESEND_API_KEY` | String *(Optional)* | **Resend API Key**: Used by the notification worker for high-deliverability transactional customer emails. |
| `SMTP_HOST` | String *(Optional)* | **SMTP Mail Server Hostname**: E.g., `smtp.gmail.com`, `smtp.resend.com`, `smtp.sendgrid.net`. Fallback if `RESEND_API_KEY` is not provided. |
| `SMTP_PORT` | Number (`587`) | **SMTP Port**: Typically `587` (STARTTLS) or `465` (SSL). |
| `SMTP_USER` | String *(Optional)* | **SMTP Username / Email Address**: The account identifier for sending outgoing emails. |
| `SMTP_PASS` | String *(Optional)* | **SMTP Password**: Account password or provider API key (e.g. Resend API key or Gmail App Password). |
| `SMTP_FROM` | String (`noreply@eazify.ai`) | **Sender Email Header**: Format `EazifyAi Notifications <noreply@eazify.ai>`. |
| `LOG_LEVEL` | String (`info`) | **Pino Logger Verbosity**: Options: `fatal`, `error`, `warn`, `info`, `debug`, `trace`. In production, set to `info` or `warn`. |

#### Example `eazifyai-api/.env` File
```ini
NODE_ENV=development
PORT=3001

# Supabase
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PostgreSQL & Prisma
DATABASE_URL="postgresql://postgres:password@localhost:5432/eazifyai?schema=public"
DIRECT_DATABASE_URL="postgresql://postgres:password@localhost:5432/eazifyai?schema=public"

# CORS
WEB_ORIGIN=http://localhost:3000

# Google Gemini AI Agent
GEMINI_API_KEY=AIzaSyD-sample-gemini-api-key-here
AI_MODEL_NAME=gemini-2.0-flash
AI_DAILY_BUDGET_USD=5.0

# Telegram Operator Alerts & Interactive Admin Bot
TELEGRAM_BOT_TOKEN=8194795997:AAGpInx84Mu75aiVUhoNQjWaanLygqPCFRs
TELEGRAM_CHAT_ID=7710040347

# Customer Emails (Resend or SMTP)
RESEND_API_KEY=re_1234567890abcdef
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=re_1234567890abcdef
SMTP_FROM=EazifyAi <orders@eazifyai.com>

# Logging
LOG_LEVEL=info
```

### Step 2.3: Database Setup & Prisma Migrations
Run the following commands inside `D:\EazifyAi\eazifyai-api`:

```powershell
# 1. Push schema directly to database (for fast dev sync)
npx prisma db push

# 2. Or apply migration files
npm run prisma:migrate

# 3. Generate Prisma TypeScript Client
npm run prisma:generate
```

### Step 2.4: Seed Database & Operational Scripts
Run the following utility scripts as needed inside `D:\EazifyAi\eazifyai-api`:

```powershell
# 1. Seed or promote the primary administrator account (ahmedosaied73@gmail.com)
npx tsx scripts/create-or-update-admin.ts

# 2. Retrieve your Telegram Chat ID automatically from recent bot updates
npx tsx scripts/get-telegram-chat-id.ts

# 3. Apply Phase 6 Row Level Security (RLS) policies directly to PostgreSQL
npx tsx scripts/apply-phase6-rls.ts

# 4. Simulate a website outage to test the automated Telegram watchdog alert
npx tsx scripts/simulate-downtime.ts
```

### Step 2.5: Start API Server
```powershell
# Start development server with live watch (tsx)
npm run dev
# The API will be available at http://localhost:3001
```

---

## 3. Frontend Setup (`eazifyai-web`)

The frontend is a localized Next.js 16 (App Router + Turbopack) application located in `D:\EazifyAi\eazifyai-web`.

### Step 3.1: Install Dependencies
```powershell
cd D:\EazifyAi\eazifyai-web
npm install
```

### Step 3.2: Configure Environment Variables
Create a file named `.env.local` in `D:\EazifyAi\eazifyai-web\.env.local`.

#### Exhaustive `.env.local` Variables Breakdown

| Variable | Description & Acquisition Guide |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Backend API URL**: Base URL for backend REST API calls (e.g. `http://localhost:3001` locally, `https://api.eazifyai.com` in production). |
| `NEXT_PUBLIC_SOCKET_URL` | **Backend WebSocket URL**: URL used by `socket.io-client` for live AI agent chat. If omitted, the web app automatically falls back to `NEXT_PUBLIC_API_URL`. |
| `NEXT_PUBLIC_SUPABASE_URL` | **Supabase Project URL**: Must match `SUPABASE_URL` in the API. Used by `@supabase/ssr` to manage authentication cookies and browser sessions. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Supabase Anonymous Public Key**: Safe to expose in client code. Must match `SUPABASE_ANON_KEY`. |
| `NEXT_PUBLIC_SITE_URL` | **Public Web Application Canonical URL**: Used for OpenGraph tags, Twitter cards, and sitemaps (e.g. `http://localhost:3000` or `https://eazifyai.com`). |
| `NEXT_PUBLIC_POSTHOG_KEY` | *(Optional)* **PostHog Project API Key**: Enables analytics tracking for page visits, button clicks, and funnel progress. |
| `NEXT_PUBLIC_POSTHOG_HOST` | *(Optional)* **PostHog Host**: Usually `https://eu.i.posthog.com` or `https://us.i.posthog.com`. |
| `NEXT_PUBLIC_SENTRY_DSN` | *(Optional)* **Sentry Client DSN**: Client-side JavaScript exception monitoring. |

#### Example `eazifyai-web/.env.local` File
```ini
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3.3: Verify Type Contracts
Generate TypeScript definitions directly from the backend's OpenAPI specification:

```powershell
# Sync TypeScript interfaces with eazifyai-api/openapi.json
npm run api:types

# Verify that client schemas match the contract
npm run contract-check
```

### Step 3.4: Start Frontend Dev Server
```powershell
npm run dev
# The web app will be available at http://localhost:3000
```

---

## 4. Supabase Auth Configuration (Dashboard Setup)

To allow users to sign up and sign in smoothly:

1. **Email Auth**:
   - Go to **Authentication** -> **Providers** -> **Email**.
   - Enable **Email**.
   - *(Recommended for local dev)* Disable **Confirm email** so test users can log in immediately without waiting for verification emails.
2. **Redirect URLs**:
   - Go to **Authentication** -> **URL Configuration**.
   - Set **Site URL** to `http://localhost:3000`.
   - Add Redirect URLs:
     - `http://localhost:3000/**`
     - `http://localhost:3000/ar/login`
     - `http://localhost:3000/en/login`
     - `http://localhost:3000/ar/profile`
     - `http://localhost:3000/en/profile`

---

## 5. Running the Complete System

To run both services side-by-side during active development:

**Terminal 1 (Backend API):**
```powershell
cd D:\EazifyAi\eazifyai-api
npm run dev
```

**Terminal 2 (Frontend Web):**
```powershell
cd D:\EazifyAi\eazifyai-web
npm run dev
```

Open `http://localhost:3000/ar` in your browser. You can immediately:
- Chat with the AI Discovery Agent at `/ar/chat`.
- Fill the anonymous onboarding survey on the landing page.
- Track any order code (e.g. `EZ-100001`) at `/ar/track`.
- Sign in with an admin account and manage orders at `/ar/admin`.
