# EazifyAi API & WebSocket Specification

This document provides exhaustive, contract-grade technical documentation for all REST API endpoints, real-time Socket.io streaming events, authentication and authorization schemes, rate limiting tiers, error envelopes, and background worker queues across the EazifyAi platform.

---

## 1. Global Standards & Infrastructure

### 1.1 Base URLs & Protocol Topology

| Environment | REST API Base URL | WebSocket (Socket.io v4) Base URL |
| :--- | :--- | :--- |
| **Local Development** | `http://localhost:3001` | `ws://localhost:3001` |
| **Staging** | `https://staging-api.eazifyai.com` | `wss://staging-api.eazifyai.com` |
| **Production** | `https://api.eazifyai.com` | `wss://api.eazifyai.com` |

- **Default Content-Type**: `application/json; charset=utf-8`
- **Request Body Size Limit**: Strict `100kb` maximum body size (enforced via `express.json({ limit: '100kb' })`).
- **CORS Policy**: Strictly locked down to `env.WEB_ORIGIN`. Credentials (`credentials: true`) are supported.

### 1.2 Request Tracing (`X-Request-Id`)

Every HTTP transaction and structured log is bound by a unique UUIDv4 identifier via `requestIdMiddleware`:
- Clients may provide their own `X-Request-Id` header (alphanumeric, dashes, underscores, max 64 chars).
- If absent or invalid, the server automatically generates a fresh UUIDv4.
- The `X-Request-Id` is returned in response headers and included in all structured Pino log entries and error JSON payloads.

### 1.3 Standard Error Format & HTTP Status Mapping

All REST API error responses adhere to an invariant JSON envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description of the error",
    "requestId": "123e4567-e89b-12d3-a456-426614174000",
    "details": {
      "fieldErrors": {
        "whatsapp": ["Invalid Egyptian phone number format"]
      }
    }
  }
}
```

#### Error Code Reference Table

| Error Code | HTTP Status | Description & Trigger Scenarios |
| :--- | :--- | :--- |
| `AUTH_MISSING` | `401 Unauthorized` | Missing `Authorization: Bearer <token>` header on protected routes. |
| `AUTH_INVALID` | `401 Unauthorized` | Invalid JWT signature, malformed token, or unrecognized issuer/audience. |
| `AUTH_EXPIRED` | `401 Unauthorized` | Expired Supabase JWT token (`exp` timestamp is in the past). |
| `AUTH_FORBIDDEN` | `403 Forbidden` | Authenticated user lacks sufficient permissions (e.g. non-admin accessing `/v1/admin/*`). |
| `MFA_REQUIRED` | `403 Forbidden` | Sensitive admin operation requires Authenticator Assurance Level 2 (`aal2`). |
| `VALIDATION_ERROR` | `400 Bad Request` | Request parameters, query string, or body violated Zod validation schemas. |
| `NOT_FOUND` | `404 Not Found` | Route does not exist, or database record (`Request`, `Profile`) was not found. |
| `RATE_LIMIT_EXCEEDED` | `429 Too Many Requests` | Request volume exceeded the rate limiter tier quota. |
| `INTERNAL_ERROR` | `500 Internal Server Error` | Unexpected server exception. In production, raw error messages and stacks are redacted. |
| `SERVICE_UNAVAILABLE` | `503 Service Unavailable` | Dependency failure (e.g. database disconnected during readiness probe). |

---

## 2. Authentication & Authorization Hierarchy

Authentication in EazifyAi is built upon Supabase Auth, verified asymmetrically on the API via remote JSON Web Key Sets (JWKS) using `jose`.

```
                    ┌──────────────────────────────────────────────┐
                    │               Client Request                 │
                    └──────────────────────┬───────────────────────┘
                                           │
                        Is Authorization header present?
                                ├─── No ────► Level 0: Public
                                │             (or Level 1: Optional Auth)
                                ▼
                       Validate Supabase JWT
                     via RS256 JWKS Cache
                                │
                                ├─── Valid ──► Level 2: Authenticated User
                                │
                     Does JWT contain admin role?
                     (app_metadata.role === 'admin')
                                │
                                ├─── Yes ───► Level 3: Admin
                                │
                     Does JWT satisfy MFA AAL2?
                     (payload.aal === 'aal2')
                                │
                                └─── Yes ───► Level 4: High-Security Admin
```

### 2.1 Access Tiers Table

| Access Level | Middleware Pipeline | Rate Limiter | Description |
| :--- | :--- | :--- | :--- |
| **Level 0: Public** | None | `publicLimiter` (60 req/min) | Unauthenticated endpoints (health checks, public order tracking). |
| **Level 1: Optional Auth** | `optionalAuth` | `publicLimiter` (60 req/min) | Reads Bearer token if present to associate `userId`; proceeds anonymously if missing. |
| **Level 2: User** | `requireAuth` | `authLimiter` (15 req/15 min) or `apiLimiter` (120 req/min) | Requires valid Supabase JWT in `Authorization: Bearer <token>`. Scoped to own resources. |
| **Level 3: Admin** | `requireAuth` + `requireRole('admin')` | `adminLimiter` (120 req/min) | Requires `app_metadata.role === 'admin'`. Full access to administrative actions. |
| **Level 4: High-Security Admin** | `requireAuth` + `requireRole('admin')` + `requireAal2` | `adminLimiter` (120 req/min) | Requires Supabase MFA AAL2 (`aal === 'aal2'`). Mandatory when `ENFORCE_AAL2=true`. |
| **Capability Token** | `verifyManageToken` | `publicLimiter` (60 req/min) | HMAC-SHA256 token (`manageToken`) allowing anonymous users to update their created request. |

### 2.2 Anonymous Request Capability Tokens (`manageToken`)

When an anonymous user creates a request via the interactive AI chat, the backend generates an HMAC-SHA256 capability token:

$$\text{token} = \text{HMAC-SHA256}(\text{JWT\_SECRET}, \text{"manage-request:"} + \text{publicId})$$

- Returned to the client in the `request:created` WebSocket event.
- Stored locally in browser `localStorage` or cookies.
- Allows the anonymous creator to update urgency, preferred call slots, and extra details on `PATCH /v1/requests/:publicId`.
- Passed via `X-Request-Token: <token>` header or `manageToken=<token>` cookie.
- Verified in constant time via `crypto.timingSafeEqual` to eliminate timing attacks.

---

## 3. Rate Limiting Architecture

Rate limits are enforced at the router layer using `express-rate-limit`:

| Tier | Window | Limit | Response Code | Headers Returned |
| :--- | :--- | :--- | :--- | :--- |
| `publicLimiter` | 1 minute | 60 requests | 429 Too Many Requests | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| `authLimiter` | 15 minutes | 15 requests | 429 Too Many Requests | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| `fallbackLimiter` | 1 minute | 3 requests | 429 Too Many Requests | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| `agentLimiter` | 1 minute | 20 messages | 429 Too Many Requests | Standard WebSocket error event |
| `apiLimiter` | 1 minute | 120 requests | 429 Too Many Requests | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |
| `adminLimiter` | 1 minute | 120 requests | 429 Too Many Requests | `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` |

When behind a reverse proxy (Cloudflare, Nginx, ALB), `TRUST_PROXY=1` ensures client IPs are resolved from `CF-Connecting-IP` or the first address in `X-Forwarded-For`.

---

## 4. REST Endpoints Specification

### 4.1 Health & Diagnostics

#### `GET /health`
Liveness probe for orchestrators (Docker, Kubernetes, Render, Railway).
- **Access Level**: Public (Level 0)
- **Response Headers**: `X-Request-Id`
- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-05T18:00:00.000Z"
  }
  ```

#### `GET /health/ready`
Readiness probe verifying active PostgreSQL database connectivity.
- **Access Level**: Public (Level 0)
- **Response `200 OK`**:
  ```json
  {
    "status": "ready",
    "database": "connected",
    "timestamp": "2026-11-05T18:00:00.000Z"
  }
  ```
- **Response `503 Service Unavailable`** (Database disconnected):
  ```json
  {
    "error": {
      "code": "SERVICE_UNAVAILABLE",
      "message": "Database readiness probe failed",
      "requestId": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
  ```

---

### 4.2 Lead Intake & Onboarding

#### `POST /v1/onboarding`
Records anonymous pre-chat survey responses from the homepage widget.
- **Access Level**: Optional Auth (Level 1)
- **Rate Limit**: `publicLimiter` (60 req/min)
- **Request Body**:
  ```json
  {
    "anonId": "anon_68a9f24b-3211-489e-9d2a",
    "job": "صيدلي / مدير صيدلية",
    "pain": "صعوبة في تتبع النواقص وصلاحيات الأدوية",
    "tools": "ورقة وقلم وإكسيل قديم",
    "metadata": {
      "referrer": "https://google.com",
      "locale": "ar"
    }
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "id": "77e3848b-3e5e-4c22-b235-90875c7e1001"
  }
  ```

#### `POST /v1/requests/fallback`
Emergency fallback lead submission when AI budget circuit breaker is tripped or user prefers form intake.
- **Access Level**: Optional Auth (Level 1)
- **Bot Defense**: Cloudflare Turnstile token verified via `requireTurnstile` middleware.
- **Rate Limit**: `fallbackLimiter` (3 submissions/min)
- **Request Headers**:
  - `CF-Turnstile-Response`: Turnstile token from client widget (or in body `cf-turnstile-response`).
- **Request Body**:
  ```json
  {
    "problem": "عندي عيادة أسنان وعايز سيستم ذكي لتأكيد مواعيد المرضى عبر الواتساب تلقائياً",
    "whatsapp": "01012345678",
    "name": "د. هاني شاكر",
    "businessType": "عيادة طبية",
    "cf-turnstile-response": "0x4AAAAAAAx_sampleTokenString..."
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "success": true,
    "code": "EZ-294810",
    "publicId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "manageToken": "a3b4c5d6e7f80123456789abcdef0123456789abcdef0123456789abcdef01"
  }
  ```

---

### 4.3 Public & Client Request Management

#### `GET /v1/requests/:publicId`
Public lookup of a submitted request by its UUID `publicId`.
- **Access Level**: Optional Auth (Level 1)
- **Rate Limit**: `publicLimiter` (60 req/min)
- **Privacy Masking**: If the viewer is NOT the request owner or an admin, sensitive fields (`whatsapp`, `email`, `phone`) are automatically masked (e.g. `010****5678` and `h***@gmail.com`).
- **Response `200 OK`**:
  ```json
  {
    "id": "c1f7a40b-782a-4382-b7e1-884ec26190a1",
    "publicId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "code": "EZ-294810",
    "status": "NEW",
    "urgency": "HIGH",
    "problem": "عندي عيادة أسنان وعايز سيستم ذكي لتأكيد مواعيد المرضى",
    "businessType": "عيادة طبية",
    "toolsToday": "أجندة ورقية",
    "desiredOutcome": "تقليل تخلف المرضى عن المواعيد بنسبة 50%",
    "name": "د. هاني شاكر",
    "whatsapp": "010****5678",
    "email": "d***@gmail.com",
    "budgetHint": "5000-10000 EGP",
    "bestTime": "مساءً بعد الساعة 6",
    "extraDetails": "يفضل التواصل واتساب أولاً",
    "summary": {
      "problem": "عندي عيادة أسنان وعايز سيستم ذكي لتأكيد مواعيد المرضى",
      "businessType": "عيادة طبية"
    },
    "events": [
      {
        "id": "e4b5c6d7-1111-2222-3333-444455556666",
        "type": "STATUS_CHANGE",
        "note": "تم تسجيل الطلب بنجاح",
        "createdAt": "2026-11-05T18:00:00.000Z"
      }
    ],
    "createdAt": "2026-11-05T18:00:00.000Z",
    "updatedAt": "2026-11-05T18:00:00.000Z"
  }
  ```

#### `PATCH /v1/requests/:publicId`
Updates client-managed details of a request (urgency, budget, best contact time, extra notes, or scheduled consultation call slot).
- **Access Level**:
  - Authenticated user owning the request (`userId === req.user.sub`), OR
  - Admin user (`req.user.role === 'admin'`), OR
  - Anonymous creator providing valid capability token via `X-Request-Token: <manageToken>` header or cookie.
- **Rate Limit**: `publicLimiter` (60 req/min)
- **Request Headers**:
  - `X-Request-Token: a3b4c5d6e7f80123456789abcdef0123456789abcdef0123456789abcdef01` *(for guest requests)*
- **Request Body**:
  ```json
  {
    "urgency": "URGENT",
    "budgetHint": "10000+ EGP",
    "bestTime": "خلال ساعات العمل من 10 صباحاً",
    "extraDetails": "جاهز للبدء الفوري الأسبوع القادم",
    "callDay": 2,
    "callSlot": 14
  }
  ```
- **Response `200 OK`**: Updated request summary JSON.
- **Response `403 Forbidden`**:
  ```json
  {
    "error": {
      "code": "AUTH_FORBIDDEN",
      "message": "Forbidden: Missing or invalid request management token",
      "requestId": "123e4567-e89b-12d3-a456-426614174000"
    }
  }
  ```

---

### 4.4 User Profile & Self-Service (`/v1/me`)

#### `GET /v1/me`
Fetches current authenticated profile.
- **Access Level**: User (Level 2)
- **Response `200 OK`**:
  ```json
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "أحمد الشناوي",
    "job": "صاحب صيدلية",
    "phone": "01098765432",
    "isAnonymous": false,
    "createdAt": "2026-10-15T10:00:00.000Z",
    "updatedAt": "2026-11-01T12:00:00.000Z"
  }
  ```

#### `PATCH /v1/me`
Updates user profile information.
- **Access Level**: User (Level 2)
- **Rate Limit**: `authLimiter` (15 req/15 min)
- **Request Body**:
  ```json
  {
    "name": "أحمد السيد الشناوي",
    "job": "مدير سلسلة صيدليات",
    "phone": "01098765432"
  }
  ```
- **Response `200 OK`**: Updated profile JSON.

#### `DELETE /v1/me`
Anonymizes/deletes user profile and removes authentication identity from Supabase Auth via Admin API.
- **Access Level**: User (Level 2)
- **Rate Limit**: `authLimiter` (15 req/15 min)
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Account deleted successfully"
  }
  ```

#### `GET /v1/me/requests`
Retrieves all historical requests submitted by the authenticated user.
- **Access Level**: User (Level 2)
- **Response `200 OK`**: Array of request summaries.

---

### 4.5 Administrative Management (`/v1/admin/*`)

All `/v1/admin/*` endpoints require `app_metadata.role === 'admin'`. When `ENFORCE_AAL2=true`, they additionally require MFA Authenticator Assurance Level 2 (`aal === 'aal2'`).

#### `GET /v1/admin/analytics`
High-level operational metrics for the administrative dashboard.
- **Access Level**: Admin (Level 3/4)
- **Rate Limit**: `adminLimiter` (120 req/min)
- **Response `200 OK`**:
  ```json
  {
    "totalRequests": 142,
    "newRequests": 18,
    "inProgressRequests": 24,
    "completedRequests": 89,
    "rejectedRequests": 11,
    "totalDealValue": 245000.0,
    "averageScore": 76.5,
    "statusBreakdown": {
      "NEW": 18,
      "STUDYING": 12,
      "CONTACTED": 15,
      "IN_PROGRESS": 24,
      "COMPLETED": 89,
      "REJECTED": 11
    },
    "urgencyBreakdown": {
      "LOW": 14,
      "MEDIUM": 65,
      "HIGH": 43,
      "URGENT": 20
    }
  }
  ```

#### `GET /v1/admin/requests`
Paginated, searchable, filterable list of all requests.
- **Query Parameters**:
  - `status`: `NEW` | `STUDYING` | `CONTACTED` | `IN_PROGRESS` | `COMPLETED` | `REJECTED`
  - `urgency`: `LOW` | `MEDIUM` | `HIGH` | `URGENT`
  - `search`: Search query matching code, whatsapp, email, problem, or customer name.
  - `page`: Page index (default: `1`).
  - `limit`: Items per page (default: `20`, max: `100`).
- **Response `200 OK`**:
  ```json
  {
    "items": [
      {
        "id": "c1f7a40b-782a-4382-b7e1-884ec26190a1",
        "publicId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "code": "EZ-294810",
        "status": "NEW",
        "urgency": "HIGH",
        "whatsapp": "01012345678",
        "email": "doctor@clinic.com",
        "summary": {
          "problem": "تأكيد مواعيد العيادة تلقائياً"
        },
        "score": 82.0,
        "scoreOverride": null,
        "dealValue": 7500.0,
        "createdAt": "2026-11-05T18:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 142,
      "totalPages": 8
    }
  }
  ```

#### `GET /v1/admin/requests/:id`
Exhaustive internal view of a specific request, including full internal AI analysis, audit logs, and status event histories.
- **Parameters**: `:id` (UUID primary key or `EZ-XXXXXX` code)
- **Response `200 OK`**: Complete request entity with `internalAnalysis`, `completeness`, `events`, and unmasked contact details.

#### `PATCH /v1/admin/requests/:id/status`
Updates request lifecycle status. Automatically records an `AuditLog` and transactional `OutboxJob` (`REQUEST_STATUS_CHANGED`), triggering email and Telegram updates.
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS",
    "note": "تم الاتفاق مع العميل والبدء في بناء النظام التجريبي",
    "dealValue": 8500.0,
    "scoreOverride": 90
  }
  ```
- **Response `200 OK`**: Updated request JSON.

#### `PATCH /v1/admin/requests/:id/call`
Confirms or reschedules an onboarding consultation phone call.
- **Request Body**:
  ```json
  {
    "callDay": 3,
    "callSlot": 16,
    "callConfirmed": true,
    "note": "تم الاتفاق على موعد المكالمة يوم الأربعاء الساعة 4 عصراً"
  }
  ```
- **Response `200 OK`**: Updated request JSON.

---

### 4.6 Webhooks (`/v1/webhooks/telegram`)

#### `POST /v1/webhooks/telegram`
Receives inbound webhook notifications from Telegram's Bot API.
- **Security**:
  - Telegram sends the shared secret in the `X-Telegram-Bot-Api-Secret-Token` header.
  - Verified using `crypto.timingSafeEqual` against `env.TELEGRAM_WEBHOOK_SECRET`.
  - In production, requests lacking a valid secret are rejected with `401 Unauthorized` or `403 Forbidden`.
- **Supported Bot Commands**:
  - `/status`: Returns live status summary of API, Frontend, Database, and Memory.
  - `/simulate_down`: Activates simulated frontend outage to test watchdog alerting.
  - `/simulate_up`: Clears simulated outage and tests recovery alerting.
  - Conversational messages: Routed through Gemini 2.0 Flash with live system prompt for intelligent operations partner chat.
- **Response `200 OK`**:
  ```json
  { "ok": true }
  ```

---

## 5. WebSocket Specification (Socket.io `/chat`)

Socket.io enables real-time, bidirectional streaming dialogue with the Egyptian Arabic AI Discovery Agent.

### 5.1 Connection Handshake

- **Endpoint**: `/socket.io/` (transports: `['websocket', 'polling']`)
- **Connection Auth Options**:
  ```javascript
  import { io } from 'socket.io-client';

  const socket = io('https://api.eazifyai.com', {
    transports: ['websocket', 'polling'],
    auth: {
      token: '<supabase_access_token>', // Optional: User JWT if logged in
      sessionId: '<anonymous_uuid_v4>',  // Required: Persistent client session UUID
      'cf-turnstile-response': '<token>' // Optional/Required: Cloudflare Turnstile token
    }
  });
  ```
- **Handshake Validation Rules**:
  1. **Turnstile Bot Verification**: If `TURNSTILE_SECRET_KEY` is set, `turnstileService.verifyToken` validates the provided token.
  2. **JWT Authentication**: If `token` is supplied, verifies against `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`.
  3. **Anonymous Fallback**: If `token` is omitted, assigns a guest session scoped to `sessionId`.
  4. **Active Connection Cap**: Maximum 5 simultaneous sockets per user/IP. Excess connections receive `{ code: 'TOO_MANY_CONNECTIONS' }` and are disconnected.

---

### 5.2 Client-to-Server Events

#### `message:send`
Submits a user message turn to the AI discovery agent.
- **Rate Limit**: 20 messages / minute per user (`SOCKET_MESSAGE_LIMIT`).
- **AI Budget Guardrail**: If `aiBudgetService.isBudgetExceeded()` is true, immediately emits `agent:fallback` with `reason: 'budget_exceeded'`.
- **Concurrency Mutex**: Only one active in-flight turn is permitted per conversation (`TurnRegistry`). Concurrent messages return error `TURN_IN_FLIGHT`.
- **Payload Schema**:
  ```typescript
  {
    conversationId: string;    // UUIDv4
    clientMessageId: string;   // Unique client message ID (e.g. "msg_17300000_abc")
    text: string;              // User message content (max 2000 chars, HTML stripped)
  }
  ```
- **Acknowledgment Callback**:
  ```typescript
  // Success:
  { success: true, clientMessageId: "msg_17300000_abc" }

  // Error:
  { error: { code: "RATE_LIMITED" | "TURN_IN_FLIGHT" | "BUDGET_EXCEEDED" | "VALIDATION_ERROR", message: string } }
  ```

#### `message:cancel`
Explicitly cancels an in-flight AI turn, triggering an `AbortSignal` on the LLM request and discarding buffered tokens.
- **Payload Schema**:
  ```typescript
  {
    conversationId: string;    // UUIDv4
    clientMessageId: string;   // Active turn message ID
  }
  ```
- **Acknowledgment Callback**:
  ```typescript
  { success: boolean }
  ```

#### `conversation:sync`
Requests historical dialogue messages, current structured summary, and completeness metrics for an existing conversation session. Used when a client reconnects or restores an in-progress consultation from localStorage.
- **Payload Schema**:
  ```typescript
  {
    conversationId: string;    // UUIDv4
  }
  ```
- **Acknowledgment Callback**:
  ```typescript
  {
    success: boolean;
    data?: {
      conversationId: string;
      summary: Record<string, unknown> | null;
      completeness: { score: number; fieldsPresent: string[]; missingFields: string[] } | null;
      stage: "intake" | "clarify" | "extract" | "confirm" | "close";
      isFinished: boolean;
      request: { code: string; publicId: string; status: string } | null;
      messages: Array<{ role: string; text: string; createdAt: string }>;
    };
    error?: { code: string; message: string };
  }
  ```
- **Associated Server Event**: Also broadcasts `conversation:synced` directly to the requesting socket.

---

### 5.3 Server-to-Client Streaming Events

#### `message:token`
Emitted token-by-token as the Gemini model streams its conversational reply.
- **Payload**:
  ```typescript
  {
    conversationId: string;
    clientMessageId: string;
    chunk: string; // Token text chunk (e.g. "أهلاً ", "بيك! ")
  }
  ```

#### `agent:summary`
Emitted whenever the AI agent's internal analysis extracts or refines structured business parameters, calculation stages, or completeness score.
- **Payload**:
  ```typescript
  {
    conversationId: string;
    summary: {
      businessType: string;       // e.g. "صيدلية"
      problem: string;            // e.g. "تتبع النواقص والطلبيات"
      toolsToday: string;         // e.g. "دفتر ورقي"
      volumeFrequency: string;    // e.g. "50 عميل يومياً"
      desiredOutcome: string;     // e.g. "توفير وقت الجرد"
      urgency: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      whatsapp: string;           // e.g. "01012345678"
    };
    completeness: {
      score: number;              // Completeness percentage (0 to 100)
      fieldsPresent: string[];    // ["problem", "businessType", "whatsapp"]
      missingFields: string[];    // ["toolsToday", "desiredOutcome"]
    };
    stage: "intake" | "clarify" | "extract" | "confirm" | "close";
  }
  ```

#### `completeness:update`
Emitted simultaneously with `agent:summary` to stream real-time updates to the 0–100% problem completeness score, list of captured attributes, and remaining required questions.
- **Payload**:
  ```typescript
  {
    conversationId: string;
    completeness: {
      score: number;              // Completeness score (0 to 100)
      fieldsPresent: string[];    // ["problem", "businessType", "whatsapp"]
      missingFields: string[];    // ["toolsToday", "desiredOutcome"]
    };
    stage: "intake" | "clarify" | "extract" | "confirm" | "close";
    summary: Record<string, unknown>;
  }
  ```

#### `conversation:synced`
Emitted in response to a `conversation:sync` request, delivering complete historical messages and active session state.
- **Payload**:
  ```typescript
  {
    conversationId: string;
    summary: Record<string, unknown> | null;
    completeness: { score: number; fieldsPresent: string[]; missingFields: string[] } | null;
    stage: "intake" | "clarify" | "extract" | "confirm" | "close";
    isFinished: boolean;
    request: { code: string; publicId: string; status: string } | null;
    messages: Array<{
      role: string;
      text: string;
      createdAt: string; // ISO 8601 string
    }>;
  }
  ```

#### `message:done`
Emitted when the AI turn has completely finished and streaming is finalized.
- **Payload**:
  ```typescript
  {
    conversationId: string;
    clientMessageId: string;
    text: string;               // Complete finalized text response
    isFinished: boolean;        // True when all necessary fields are captured
  }
  ```

#### `message:cancelled`
Emitted if the turn was cancelled by a client `message:cancel` request.
- **Payload**:
  ```typescript
  {
    conversationId: string;
    clientMessageId: string;
  }
  ```

#### `agent:fallback`
Emitted if the Gemini API times out (`AI_REPLY_TIMEOUT_MS`), hits an unrecoverable model error, or the daily spending cap is reached.
- **Payload**:
  ```typescript
  {
    conversationId: string;
    clientMessageId: string;
    reason: "budget_exceeded" | "timeout" | "agent_error";
    fallbackUrl: "/v1/requests/fallback";
  }
  ```

#### `request:created`
Emitted when `isFinished === true` and the request is successfully committed to PostgreSQL. Includes the generated tracking code and HMAC capability token.
- **Payload**:
  ```typescript
  {
    code: string;         // e.g. "EZ-839201"
    publicId: string;     // UUIDv4
    manageToken: string;  // HMAC-SHA256 capability token for anonymous edits
    conversationId: string;
  }
  ```

#### `request:failed`
Emitted if database persistence fails after conversation conclusion.
- **Payload**:
  ```typescript
  {
    conversationId: string;
    clientMessageId: string;
    code: "PERSISTENCE_ERROR";
  }
  ```

#### `error`
General socket error event.
- **Payload**:
  ```typescript
  {
    code: "UNAUTHORIZED" | "TOO_MANY_CONNECTIONS" | "VALIDATION_ERROR";
    message: string;
  }
  ```

---

## 6. Multi-Instance Clustering (Redis Adapter)

In scaled container environments (multiple replicas of `eazifyai-api`), Socket.io uses `@socket.io/redis-adapter` to synchronize socket rooms, broadcast events, and cross-server messaging.

- **Configuration**: Set `REDIS_URL=redis://redis-cluster:6379`.
- **Automatic Reconnection**: Pub/Sub clients feature exponential backoff with a maximum retry ceiling.
- **Graceful Termination**: On server SIGTERM / close, pub/sub connections are safely severed using `Promise.allSettled([pubClient.quit(), subClient.quit()])`.

---

## 7. Background Queues & Transactional Outbox

Asynchronous operations (customer emails, Telegram operator alerts) are orchestrated via a **Transactional Outbox Pattern**:

1. When a request is created or status is modified, an `OutboxJob` record (`REQUEST_CREATED` or `REQUEST_STATUS_CHANGED`) is written inside the **same database transaction** as the business mutation.
2. The `outbox` worker dispatches the job to `pg-boss`.
3. If `pg-boss` or external network channels are temporarily unavailable, jobs remain safely stored in PostgreSQL with status `PENDING` and are re-attempted with exponential backoff.
4. Once completed, jobs transition to `COMPLETED` with `processedAt` timestamp.
