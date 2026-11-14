# EazifyAI — Production Deployment & Operations Runbook

This runbook provides comprehensive instructions for deploying, scaling, hardening, and operating the EazifyAI platform in production environments.

---

## 1. Pre-Deployment Verification Gates

Before deploying any release to staging or production, all automated verification gates must pass with **0 errors**.

### 1.1 Backend Verification (`eazifyai-api`)

Run from `d:\EazifyAi\eazifyai-api`:

```bash
# 1. Typecheck TypeScript across application and scripts
npm run typecheck

# 2. Strict ESLint rules (including architecture boundary rules)
npm run lint

# 3. Vitest automated test suite (470+ unit, integration, scale, evals)
npm test

# 4. OpenAPI Specification synchronization check
npm run openapi:check

# 5. Production build compilation
npm run build
```

### 1.2 Frontend Verification (`eazifyai-web`)

Run from `d:\EazifyAi\eazifyai-web`:

```bash
# 1. Typecheck TypeScript
npm run typecheck

# 2. ESLint
npm run lint

# 3. CSS Stylelint
npm run stylelint

# 4. Automated unit, integration, route, guard, and admin tests
npm test

# 5. Translation key synchronization check (all 426 keys in ar.json vs en.json)
npm run i18n:check

# 6. Type contract verification with backend openapi.json
npm run contract-check

# 7. Production Next.js build
npm run build
```

---

## 2. Infrastructure Architecture & Topology

```
                  ┌───────────────────────────────────────────────┐
                  │          Cloudflare Edge Network              │
                  │   - Strict SSL/TLS Termination (Full Strict)  │
                  │   - Cloudflare Turnstile Bot Defense          │
                  │   - DDoS & Web Application Firewall (WAF)     │
                  │   - Edge Caching & WebSocket Proxying         │
                  └───────────────┬───────────────────────────────┘
                                  │
                 ┌────────────────┴────────────────┐
                 │                                 │
                 ▼                                 ▼
    https://eazifyai.com              https://api.eazifyai.com
  ┌───────────────────────────┐     ┌───────────────────────────┐
  │   Next.js 16 Web Nodes    │     │   Express 5 API Nodes     │
  │   - Node 22 / Turbopack   │     │   - Node 22 Alpine        │
  │   - SSR & Server Actions  │────►│   - Socket.io 4.8 Server  │
  │   - @supabase/ssr Session │     │   - LangGraph AI Agent    │
  └───────────────────────────┘     └─────────────┬─────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────┐
                 │                                                 │
                 ▼                                                 ▼
  ┌───────────────────────────┐                     ┌───────────────────────────┐
  │    PostgreSQL Database    │◄────────────────────┤    Redis Pub/Sub (7+)     │
  │ - Supabase / Direct 5432  │   Transactional     │ - Socket.io Multi-Node    │
  │ - PgBouncer Pooler 6543   │      Outbox         │   Clustering Adapter      │
  │ - pg-boss Queue Engine    │                     └───────────────────────────┘
  └───────────────────────────┘
```

---

## 3. Containerization & Docker Builds

### 3.1 Backend Multi-Stage Dockerfile (`eazifyai-api`)

The `Dockerfile` in `eazifyai-api` is structured into three isolated stages:
- **`deps`**: Installs production dependencies and Prisma engines.
- **`builder`**: Generates Prisma Client, compiles TypeScript to `dist/`, and strips dev dependencies.
- **`runner`**: Ultra-minimal Node 22 Alpine runtime executing under a non-root user (`USER node`).

#### Building and Running Locally:

```bash
cd d:\EazifyAi\eazifyai-api

# Build image
docker build -t eazifyai-api:latest .

# Run with environment file
docker run -d \
  --name eazifyai-api \
  --restart unless-stopped \
  -p 3001:3001 \
  --env-file .env.production \
  eazifyai-api:latest
```

### 3.2 Frontend Container Build (`eazifyai-web`)

For containerized Next.js deployments, build using standalone output:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
USER node
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 4. Platform Deployment Guides

### 4.1 Railway / Render Deployment

#### Backend Service (`eazifyai-api`)
1. **Service Type**: Web Service.
2. **Build Command**: `npm ci && npm run build`.
3. **Start Command**: `npm run prisma:deploy && node dist/server.js`.
4. **Health Check Path**: `/health`.
5. **Port**: `3001` (or pass `$PORT` via environment).
6. **Environment Variables**: Add all mandatory variables listed in [SETUP.md](file:///d:/EazifyAi/SETUP.md).

#### Frontend Service (`eazifyai-web`)
1. **Service Type**: Web Service (Node.js).
2. **Build Command**: `npm ci && npm run build`.
3. **Start Command**: `npm start`.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL=https://api.eazifyai.com`
   - `NEXT_PUBLIC_SOCKET_URL=https://api.eazifyai.com`
   - `NEXT_PUBLIC_SITE_URL=https://eazifyai.com`
   - `NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co`
### 4.3 Netlify & Serverless Deployment (HTTP Transport Mode)

For serverless hosts where persistent WebSockets are unavailable or restricted (e.g. Netlify, Cloudflare Pages):

1. **Build Settings**:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Publish directory: `.next`
2. **Required Environment Variables**:
   ```ini
   NEXT_PUBLIC_TRANSPORT_MODE=http
   GEMINI_API_KEY=AIzaSy...              # Server-side only for /api/chat route
   API_URL=https://api.eazifyai.com      # Server-side lead forwarding address
   NEXT_PUBLIC_SITE_URL=https://eazifyai.com
   NEXT_PUBLIC_API_URL=https://api.eazifyai.com
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   ```
3. **Transport Behavior**:
   The web frontend automatically swaps from Socket.io to `/api/chat` using Server-Sent Events (SSE). Tokens stream progressively without persistent TCP socket connections, and customer leads are dispatched asynchronously in the background.

### 4.4 Bare-Metal Linux / VPS Deployment (Ubuntu 22.04 / 24.04)

#### Step 1: Install Node.js 22 LTS & Nginx
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
```

#### Step 2: Systemd Service Configuration (`/etc/systemd/system/eazifyai-api.service`)
```ini
[Unit]
Description=EazifyAI API Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/eazifyai/eazifyai-api
EnvironmentFile=/var/www/eazifyai/eazifyai-api/.env
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=eazifyai-api

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable eazifyai-api
sudo systemctl start eazifyai-api
```

#### Step 3: Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/api.eazifyai.com`)
```nginx
server {
    server_name api.eazifyai.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Enable site and configure SSL:
```bash
sudo ln -s /etc/nginx/sites-available/api.eazifyai.com /etc/nginx/sites-enabled/
sudo certbot --nginx -d api.eazifyai.com
```

---

## 5. Cloudflare Edge Configuration

When placing EazifyAI behind Cloudflare:

1. **SSL/TLS Mode**: Select **Full (strict)**. Ensure the origin server presents a valid certificate.
2. **WebSocket Support**: Navigate to **Network** -> Enable **WebSockets** (ON).
3. **HTTP/2 & HTTP/3**: Enable for ultra-low latency streaming.
4. **Cloudflare Turnstile**:
   - Create a widget in Cloudflare Turnstile dashboard.
   - Mode: **Managed** (or **Invisible**).
   - Domain: `eazifyai.com`.
   - Store the Secret Key in `TURNSTILE_SECRET_KEY` (API) and Site Key in `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (Web).
5. **Reverse Proxy Headers**: Ensure `CF-Connecting-IP` is passed to the backend. In `eazifyai-api`, `TRUST_PROXY=1` automatically parses `req.headers['cf-connecting-ip']` for rate limiting.

---

## 6. Database Operations & Migration Runbook

### 6.1 Database Pooling Architecture
- **Prisma Client (`DATABASE_URL`)**: Connects to the Supabase Transaction Pooler (PgBouncer port `6543`). This handles high-concurrency HTTP queries without exhausting PostgreSQL connection limits.
- **Prisma Migrations & pg-boss (`DIRECT_DATABASE_URL`)**: Connects directly to port `5432`. `pg-boss` relies on advisory locks and `LISTEN/NOTIFY`, which are incompatible with transaction-mode connection poolers.

### 6.2 Zero-Downtime Migration Execution
During deployment pipelines:
```bash
# Apply pending migrations
npm run prisma:deploy

# If schema changes introduce new columns, ensure they are optional or have defaults
# to prevent breaking in-flight API replicas before container swap.
```

---

## 7. Telegram Webhook vs Long-Polling

In multi-instance production environments, long-polling (`getUpdates`) will trigger `409 Conflict` errors when multiple containers poll the Telegram API simultaneously.

To ensure seamless operation:
1. Provide a public webhook URL in environment variables:
   ```ini
   TELEGRAM_WEBHOOK_URL=https://api.eazifyai.com/v1/webhooks/telegram
   TELEGRAM_WEBHOOK_SECRET=your-random-32-character-secret
   ```
2. When `TELEGRAM_WEBHOOK_URL` is set, `eazifyai-api` automatically disables long-polling and listens on `POST /v1/webhooks/telegram`.
3. Register the webhook with Telegram:
   ```bash
   curl -F "url=https://api.eazifyai.com/v1/webhooks/telegram" \
        -F "secret_token=your-random-32-character-secret" \
        https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook
   ```

---

## 8. Health Checks, Monitoring & Alerting

### 8.1 Health Endpoints
- **Liveness Probe**: `GET https://api.eazifyai.com/health` (HTTP 200). Used by load balancers to detect process crashes.
- **Readiness Probe**: `GET https://api.eazifyai.com/health/ready` (HTTP 200/503). Verifies active PostgreSQL database connectivity.

### 8.2 Uptime Watchdog & Operator Alerts
`eazifyai-api` includes an integrated 30-second uptime watchdog (`uptime-watchdog.ts`). It polls the frontend URL (`WEB_ORIGIN`) every 30 seconds. If two consecutive failures occur:
- An immediate high-priority alert is sent to the Telegram Admin Chat.
- Recovery alerts are automatically dispatched once normal connectivity is restored.

To test the alert flow:
```bash
npx tsx scripts/simulate-downtime.ts
```

### 8.3 Sentry Crash Reporting
Set `SENTRY_DSN` in `eazifyai-api/.env` and `NEXT_PUBLIC_SENTRY_DSN` in `eazifyai-web/.env.local`. Unhandled rejections, 500 errors, and agent failures are automatically aggregated with full stack traces and `X-Request-Id` correlation tags.

---

## 9. Production Feature Verification & Architecture Runbook

### 9.1 Complete Design Handoff Port
The production deployment packages the full design reference handoff:
1. **8 Animated Service Scenes**:
   - Clinic & Medical Booking (`/services/clinic` or `agents`)
   - WhatsApp Commerce Bot (`/services/whatsapp` or `flow`)
   - Retail & Store Automation (`/services/retail` or `web`)
   - Private Tutor & Academy Assistant (`/services/tutors`)
   - Restaurant & Café Order Dispatcher (`/services/restaurant`)
   - Workshop & Crafts Job Tracker (`/services/workshop`)
   - Real Estate & Broker Lead Qualifier (`/services/realestate`)
   - Custom AI Software (`/services/custom`)
   - Powered by interactive multi-step CSS motion diagrams, live queue/attendance simulators, and localized copy.
2. **SvcMenu Mega-Menu**: Multi-category navigation dropdown with badge tags, service icons, and direct localized links.
3. **Bento Industries Grid**: Homepage showcase replacing the legacy mock table.
4. **OrderModal (`ez-order` Event)**: Universal conversion modal listening to `window.dispatchEvent(new CustomEvent('ez-order', { detail: { serviceId } }))`. Validates Egyptian phone numbers (`010`, `011`, `012`, `015`), prevents layout shifts, and dispatches leads immediately.
5. **Removal of `#ideas`**: Cleaned up mock table in favor of production Bento grid and interactive 3-stage `AgentDemo`.
6. **CtaAurora**: Dynamic aurora glow banner for instant discovery initiation.

### 9.2 Modern Architecture & Supabase SSR Auth
- **Next.js 16 (App Router) + React 19 + Turbopack**: Server Components, Server Actions (`updateRequestStatusAction`, `updateCallSlotAction`, `updateAgentFeedbackAction`), zero-runtime CSS tokens.
- **Express 5 (Native ESM) + Prisma 7.10**: Strict clean architecture (`routes` ➔ `controllers` ➔ `services` ➔ `repositories`).
- **Supabase SSR Auth**: Elimination of `localStorage` mock auth. Cookie-based session validation via `@supabase/ssr`, server-side route guards, profile management, and confirmation logout modal.
- **PostgreSQL Database**: UUID primary keys, JSONB executive problem briefs, connection pooling via PgBouncer (6543) and unpooled direct migrations (5432).

### 9.3 Operations & Admin Dashboard (`/admin`)
- **Bilingual Status & Urgency Filtering**: Full Arabic (`ST`, `URG`, `JOBS`) and English (`ST_EN`, `URG_EN`, `JOBS_EN`) parallel dictionaries, interactive status and urgency filter chips, cross-language job and urgency matching (`jobMatches`, `urgencyMatches`), and urgency sort priority.
- **Idea Scoring & Rating Sliders**: Interactive 1–5 sliders for **Fit**, **Ease**, and **Value** with scoring formula `Math.round(((fit + ease + value) / 15) * 100)`, debounced API synchronization, and optimistic UI updates.
- **Consultation Calendar**: Day and slot booking (`١٠ ص إلى ١٢ ظ`, `١ إلى ٣ ع`, `٦ إلى ٨ م`), confirmation toggles, conflict alert banner, `.ez-conflict-badge`, and visual conflict detection indicators across overlapping appointments.
- **Analytics & Financial Forecasting**: Dynamic deal value aggregation, conversion rate analysis, and pipeline metrics.

### 9.4 Live Fallback Lead Creation, Tracking & Dual-Transport Chat
- **Live Fallback Lead Creation**: `/v1/requests` endpoint and client fallback with Egyptian phone normalization, 6-digit reference code generation (`EZ-XXXXXX`), and UUID `publicId`.
- **Public Request Tracking (`/track/[publicId]`)**: Real-time interactive timeline displaying request status milestones (`NEW`, `STUDYING`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`), consultation appointment details, and project notes.
- **Dual-Transport Discovery Chat**:
  - **Socket.io Streaming**: Low-latency bi-directional streaming for persistent Node.js servers with turn registry mutex.
  - **Server-Sent Events (`/api/chat`)**: Ultra-fast HTTP SSE fallback for serverless/edge environments (Netlify, Vercel) with Google Gemini 2.0 Flash (`gemini-flash-lite-latest`).
  - **Automatic Lead Extraction**: Real-time detection and extraction of Egyptian phone numbers, emails, customer names, and business categories from live conversation history.
  - **Discovery Agent Deepen Mode**: Context-aware clarifying questions and structured completion detection ("كفاية كده" / "stop").

