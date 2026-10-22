# EazifyAi API & WebSocket Specification

This document provides complete, exhaustive technical documentation for all REST API endpoints, Socket.io real-time streaming events, authentication levels, error schemas, and background job queues implemented across the EazifyAi platform.

---

## 1. Global Infrastructure & Standards

### 1.1 Base URLs & Protocols
- **Local Development**:
  - REST API: `http://localhost:3001`
  - WebSocket: `ws://localhost:3001` (Socket.io v4)
- **Production**:
  - REST API: `https://api.eazifyai.com`
  - WebSocket: `wss://api.eazifyai.com` (Socket.io v4)
- **Content Type**: `application/json; charset=utf-8`
- **Request Body Limit**: Strict `100kb` maximum body size (enforced via `express.json({ limit: '100kb' })`).

### 1.2 Request Tracing (`X-Request-Id`)
Every incoming HTTP request is assigned a unique UUIDv4 identifier via `requestIdMiddleware`.
- If the incoming client request provides an `X-Request-Id` header, it is validated and preserved.
- If omitted, a fresh UUIDv4 is generated.
- The `X-Request-Id` header is injected into the HTTP response headers and included in every structured log entry and error payload.

### 1.3 Standard Error Format
All API error responses share an invariant JSON envelope:

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable explanation of what went wrong",
    "requestId": "57dde18c-0b13-4dac-acef-15a58984fb2a",
    "details": {
      "fieldErrors": {
        "whatsapp": ["Invalid Egyptian phone number format"]
      }
    }
  }
}
```

#### Standard Error Codes Table

| Error Code | HTTP Status | Meaning |
| :--- | :--- | :--- |
| `AUTH_MISSING` | `401 Unauthorized` | Authorization header or Bearer token is missing. |
| `AUTH_INVALID` | `401 Unauthorized` | JWT signature verification failed, or token is malformed. |
| `AUTH_EXPIRED` | `401 Unauthorized` | JWT `exp` timestamp has passed. |
| `AUTH_FORBIDDEN` | `403 Forbidden` | Authenticated user lacks the required role (e.g. non-admin accessing admin route). |
| `MFA_REQUIRED` | `403 Forbidden` | Sensitive admin action requires Supabase MFA AAL2 (`aal2`). |
| `VALIDATION_ERROR` | `400 Bad Request` | Request parameters, query string, or JSON body violated Zod schema constraints. |
| `NOT_FOUND` | `404 Not Found` | Requested route or database entity was not found. |
| `RATE_LIMIT_EXCEEDED`| `429 Too Many Requests`| Exceeded allowable request quota for the assigned rate limiter tier. |
| `INTERNAL_ERROR` | `500 Internal Server Error`| Unhandled server exception. Stack traces and raw internal messages are masked in production. |

---

## 2. Authentication & Authorization Hierarchy

Authentication in EazifyAi is powered by Supabase Auth with asymmetric RS256 JWKS verification via `jose`. The API verifies JWTs against `${SUPABASE_URL}/auth/v1/.well-known/jwks.json` with in-memory key caching.

### Access Levels Table

| Access Level | Middleware Pipeline | Rate Limiter | Description & Requirements |
| :--- | :--- | :--- | :--- |
| **Level 0: Public** | None | `publicLimiter` (60 req/min) | Accessible anonymously without any credentials. Used for health checks, public order tracking by code, and initial onboarding. |
| **Level 1: Optional Auth** | `optionalAuth` | `publicLimiter` (60 req/min) | If a valid Bearer token is provided, `req.user` is populated and bound to the created record; if absent or invalid, the request proceeds anonymously without error. Used by the emergency fallback lead route. |
| **Level 2: User** | `requireAuth` | `authLimiter` (20 req/min) | Requires valid Supabase JWT in `Authorization: Bearer <token>`. Used for viewing and updating personal profile data (`/v1/me`) and user orders. |
| **Level 3: Admin** | `requireAuth` + `requireAdmin` | `adminLimiter` (120 req/min) | Requires valid JWT with `app_metadata.role === 'admin'`. Used for viewing all orders, modifying order status, and reading audit logs. |
| **Level 4: High-Security Admin** | `requireAuth` + `requireAdmin` + `requireAAL2` | `adminLimiter` (120 req/min) | Requires valid admin JWT with Authenticator Assurance Level 2 (`aal === 'aal2'`). Used for sensitive state deletions and permission updates. |

---

## 3. REST API Endpoints Reference

### 3.1 Health & Diagnostics

#### `GET /health`
Liveness check for container orchestrators and load balancers.
- **Access Level**: Public (Level 0)
- **Response Headers**: `X-Request-Id`
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "timestamp": "2026-10-21T18:00:00.000Z"
}
```

#### `GET /health/ready`
Readiness probe verifying active PostgreSQL database connectivity.
- **Access Level**: Public (Level 0)
- **Response `200 OK`** (Database healthy):
```json
{
  "status": "ready",
  "database": "connected",
  "timestamp": "2026-10-21T18:00:00.000Z"
}
```
- **Response `503 Service Unavailable`** (Database disconnected):
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "Database ping failed"
}
```

---

### 3.2 User Account & Profile (`/v1/me`)

#### `GET /v1/me`
Retrieves the profile of the currently authenticated user.
- **Access Level**: User (Level 2)
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "name": "Ahmed Saied",
  "job": "Pharmacist",
  "phone": "01023498242",
  "isAnonymous": false,
  "role": "authenticated",
  "createdAt": "2026-10-15T12:00:00.000Z",
  "updatedAt": "2026-10-20T14:30:00.000Z"
}
```

#### `PATCH /v1/me`
Updates user profile information.
- **Access Level**: User (Level 2)
- **Headers**: `Authorization: Bearer <token>`
- **Request Body (Zod `updateProfileSchema`)**:
```json
{
  "name": "Ahmed Saied",
  "job": "Lead Pharmacist",
  "phone": "01023498242"
}
```
- **Constraints**:
  - `name`: String, 1–100 characters *(optional)*
  - `job`: String, 1–100 characters *(optional)*
  - `phone`: String, 8–30 characters *(optional)*
- **Response `200 OK`**: Returns updated `MeResponse` object.

#### `DELETE /v1/me`
Deletes the current user's profile and disassociates linked records.
- **Access Level**: User (Level 2)
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

#### `GET /v1/me/requests`
Retrieves all requests submitted by the currently logged-in user.
- **Access Level**: User (Level 2)
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "requests": [
    {
      "id": "7b8d0a1b-3c4d-4e5f-6a7b-8c9d0e1f2a3b",
      "publicId": "e2f1a0b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      "code": "EZ-394812",
      "status": "NEW",
      "urgency": "MEDIUM",
      "summary": {
        "problem": "عايز أتابع نواقص الأدوية وتواريخ الصلاحية في الصيدلية",
        "businessType": "صيدلية",
        "toolsToday": "كشكول ورقي",
        "desiredOutcome": "تنبيه ذكي قبل انتهاء الصلاحية بـ 60 يوم"
      },
      "whatsapp": "01023498242",
      "createdAt": "2026-10-21T14:20:00.000Z",
      "updatedAt": "2026-10-21T14:20:00.000Z"
    }
  ]
}
```

---

### 3.3 Public Requests & Lead Capture

#### `GET /v1/requests/:publicId`
Retrieves public status summary and timeline events for order tracking.
- **Access Level**: Public (Level 0)
- **Path Parameters**:
  - `publicId`: UUIDv4 or Code string (`EZ-XXXXXX`).
- **Response `200 OK`**:
```json
{
  "id": "7b8d0a1b-3c4d-4e5f-6a7b-8c9d0e1f2a3b",
  "publicId": "e2f1a0b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
  "code": "EZ-394812",
  "status": "STUDYING",
  "urgency": "MEDIUM",
  "problem": "عايز أتابع نواقص الأدوية وتواريخ الصلاحية في الصيدلية",
  "businessType": "صيدلية",
  "toolsToday": "كشكول ورقي",
  "desiredOutcome": "تنبيه ذكي قبل انتهاء الصلاحية بـ 60 يوم",
  "whatsapp": "01023498242",
  "email": "doctor@pharmacy.com",
  "summary": {
    "problem": "عايز أتابع نواقص الأدوية وتواريخ الصلاحية في الصيدلية",
    "businessType": "صيدلية"
  },
  "events": [
    {
      "id": "11111111-2222-3333-4444-555555555555",
      "type": "CONVERSATION_COMPLETED",
      "note": "تم اكتمال محادثة المساعد الذكي وحفظ ملخص الطلب بنجاح",
      "createdAt": "2026-10-21T14:20:00.000Z"
    },
    {
      "id": "22222222-3333-4444-5555-666666666666",
      "type": "STATUS_CHANGE",
      "note": "تم بدء دراسة المتطلبات وتحديد الحل التقني الأنسب",
      "createdAt": "2026-10-21T15:00:00.000Z"
    }
  ],
  "createdAt": "2026-10-21T14:20:00.000Z",
  "updatedAt": "2026-10-21T15:00:00.000Z"
}
```

#### `POST /v1/requests/fallback`
Emergency fallback lead capture when AI assistant is offline or disabled.
- **Access Level**: Optional Auth (Level 1)
- **Headers**: *(Optional)* `Authorization: Bearer <token>`
- **Request Body (Zod `fallbackRequestSchema`)**:
```json
{
  "problem": "عندي مشكلة في جرد المخزن وعايز باركود وتنبيهات نواقص",
  "whatsapp": "01012345678",
  "name": "محمود التاجر",
  "businessType": "متجر أدوات منزلية"
}
```
- **Constraints**:
  - `problem`: String, 5–2000 characters *(required)*
  - `whatsapp`: String, 8–30 characters *(required, matches Egyptian phone pattern)*
  - `name`: String, 1–100 characters *(optional)*
  - `businessType`: String, 1–100 characters *(optional)*
- **Response `201 Created`**:
```json
{
  "success": true,
  "message": "Request submitted successfully",
  "code": "EZ-482019",
  "publicId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```
- **Side Effects**:
  - If a valid Bearer token is provided, upserts the user's `Profile` and links `userId` to the request record.
  - Enqueues `request:created` background job to alert company staff via Telegram.

#### `POST /v1/onboarding`
Saves anonymous 4-step intake survey choices from the landing page.
- **Access Level**: Public (Level 0)
- **Request Body (Zod `submitOnboardingSchema`)**:
```json
{
  "anonId": "anon_9k3d_8f4a1c",
  "job": "صيدلي",
  "pain": "تلف الأدوية منتهية الصلاحية",
  "tools": "ورقة وقلم",
  "metadata": {
    "device": "mobile",
    "referrer": "direct"
  }
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "id": "e4a722f8-90b4-4458-bbf1-55f78d07ea5a",
  "message": "Onboarding answers saved successfully"
}
```

---

### 3.4 Administration (`/v1/admin/*`)

#### `GET /v1/admin/requests`
Retrieves a paginated list of all customer requests with status and text filtering.
- **Access Level**: Admin (Level 3)
- **Headers**: `Authorization: Bearer <admin-token>`
- **Query Parameters**:
  - `cursor`: UUID of last seen item *(optional, for keyset pagination)*
  - `limit`: Number between 1 and 100 *(default `20`)*
  - `status`: Filter by `NEW`, `STUDYING`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED` *(optional)*
  - `search`: Case-insensitive search on code, whatsapp, or problem description *(optional)*
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "7b8d0a1b-3c4d-4e5f-6a7b-8c9d0e1f2a3b",
      "publicId": "e2f1a0b3-c4d5-4e6f-7a8b-9c0d1e2f3a4b",
      "code": "EZ-394812",
      "status": "NEW",
      "urgency": "MEDIUM",
      "whatsapp": "01023498242",
      "score": 0.85,
      "createdAt": "2026-10-21T14:20:00.000Z"
    }
  ],
  "nextCursor": "7b8d0a1b-3c4d-4e5f-6a7b-8c9d0e1f2a3b",
  "hasMore": true
}
```

#### `GET /v1/admin/requests/:id`
Retrieves full details of a specific request, including internal AI analysis, missing fields, completeness score, and chronological timeline events.
- **Access Level**: Admin (Level 3)
- **Headers**: `Authorization: Bearer <admin-token>`
- **Path Parameters**: `id` (Request UUID)
- **Response `200 OK`**: Returns complete `AdminRequestDetail` object.

#### `PATCH /v1/admin/requests/:id/status`
Updates request status and enqueues customer notification email.
- **Access Level**: Admin (Level 3)
- **Headers**: `Authorization: Bearer <admin-token>`
- **Path Parameters**: `id` (Request UUID)
- **Request Body (Zod `adminUpdateRequestStatusSchema`)**:
```json
{
  "status": "IN_PROGRESS",
  "note": "تم الاتفاق على المتطلبات وجاري تسليم النسخة الأولى خلال ٤٨ ساعة"
}
```
- **Allowed Statuses**: `NEW`, `STUDYING`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`.
- **Response `200 OK`**:
```json
{
  "success": true,
  "id": "7b8d0a1b-3c4d-4e5f-6a7b-8c9d0e1f2a3b",
  "status": "IN_PROGRESS",
  "updatedAt": "2026-10-21T16:00:00.000Z"
}
```
- **Side Effects**:
  - Automatically records an entry in `AuditLog` referencing the admin `actorId`.
  - Appends a `STATUS_CHANGE` timeline event to `RequestEvent`.
  - Enqueues a `request:status-changed` job in `pg-boss` to email the customer.

#### `POST /v1/admin/requests/:id/events`
Appends a manual note or meeting event to the request's public tracking timeline.
- **Access Level**: Admin (Level 3)
- **Request Body**:
```json
{
  "type": "CALL_SCHEDULED",
  "note": "تم تحديد موعد مكالمة استشارية يوم الخميس الساعة ٤ مساءً"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "eventId": "f3b5a1c2-d3e4-4a5b-6c7d-8e9f0a1b2c3d"
}
```

#### `GET /v1/admin/audit-logs`
Retrieves paginated immutable audit log trail of all administrative actions.
- **Access Level**: Admin (Level 3)
- **Query Parameters**: `cursor`, `limit` (1–100)
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": "4a8c2d1b-5e6f-4a7b-8c9d-0e1f2a3b4c5d",
      "actorId": "123e4567-e89b-12d3-a456-426614174000",
      "action": "admin.request.update_status",
      "target": "request:EZ-394812",
      "details": {
        "previousStatus": "STUDYING",
        "newStatus": "IN_PROGRESS",
        "note": "تم الاتفاق"
      },
      "at": "2026-10-21T16:00:00.000Z"
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

---

## 4. Socket.io Real-Time Agent Specification

EazifyAi uses Socket.io v4 over WebSockets with polling fallback to power the live streaming AI Discovery consultation.

### 4.1 Handshake & Authentication
Clients connect to `/` with credentials passed via `auth.token` or HTTP `Authorization` header:

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  auth: {
    token: supabaseAccessToken, // Optional: if logged in
  },
});
```
- If the token is valid, `socket.data.user` contains `{ sub, email, role, aal }`.
- In `development` mode, if no token is provided, a dev guest profile (`sub: '00000000-0000-0000-0000-000000000001'`) is assigned automatically.

---

### 4.2 Client-to-Server Events

#### `message:send`
Dispatches a user's text turn to the AI agent.
- **Payload Schema (Zod `messageSendSchema`)**:
```json
{
  "conversationId": "conv_m3k9z8_ab12cd",
  "clientMessageId": "msg_m3k9za_7f8e9",
  "text": "عندي عيادة أسنان والمرضى بيغيبوا عن المواعيد والسكرتيرة بتنسى تفكرهم"
}
```
- **Validation Constraints**:
  - `conversationId`: String, 1–100 characters *(required)*
  - `clientMessageId`: String, 1–100 characters *(required, used for deduplication)*
  - `text`: String, 1–4000 characters *(required)*
- **Acknowledgment Callback**:
```json
{
  "success": true,
  "clientMessageId": "msg_m3k9za_7f8e9"
}
```
*(Or `{ "error": { "code": "VALIDATION_ERROR", "message": "..." } }` on failure).*

---

### 4.3 Server-to-Client Events

#### `message:token`
Streamed response tokens generated by the Gemini LLM. Emitted sequentially as words/chunks are produced.
```json
{
  "conversationId": "conv_m3k9z8_ab12cd",
  "clientMessageId": "msg_m3k9za_7f8e9",
  "chunk": "تمام، "
}
```

#### `agent:summary`
Emitted after each AI turn, providing real-time extraction metrics, stage progression, and brief completeness.
```json
{
  "conversationId": "conv_m3k9z8_ab12cd",
  "summary": {
    "businessType": "عيادة أسنان",
    "problem": "غياب المرضى ونسيان السكرتارية تأكيد المواعيد",
    "toolsToday": "دفتر مواعيد ورقي",
    "volumeFrequency": "25 كشف يومياً",
    "desiredOutcome": "رسائل تذكير واتساب تلقائية للمرضى قبل الكشف بـ 24 ساعة",
    "urgency": "HIGH",
    "whatsapp": "01023498242"
  },
  "completeness": {
    "score": 85,
    "fieldsPresent": ["problem", "businessType", "toolsToday", "desiredOutcome", "whatsapp"],
    "missingFields": ["volumeFrequency"]
  },
  "stage": "confirm"
}
```

#### `message:done`
Emitted when the AI turn finishes generating. Signals the client to stop the typing indicator.
```json
{
  "conversationId": "conv_m3k9z8_ab12cd",
  "clientMessageId": "msg_m3k9za_7f8e9",
  "text": "تمام جداً يا دكتور، سجلت بيانات العيادة وهنتواصل مع حضرتك فوراً.",
  "isFinished": true
}
```

#### `request:created`
Emitted immediately when `newState.isFinished === true` and the request is successfully committed to PostgreSQL.
```json
{
  "code": "EZ-684910",
  "publicId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "conversationId": "conv_m3k9z8_ab12cd"
}
```

#### `agent:fallback`
Emitted if the LangChain agent or Google Gemini API encounters an unrecoverable failure or rate limit.
```json
{
  "conversationId": "conv_m3k9z8_ab12cd",
  "reason": "AI service temporarily unavailable",
  "fallbackUrl": "/v1/requests/fallback"
}
```

---

### 4.4 Agent State Machine & Discovery Lifecycle

```
[User Connects]
       │
       ▼
 [Stage: intake]    ──> User describes general problem in colloquial Arabic
       │
       ▼
 [Stage: clarify]   ──> Agent asks 1-2 focused questions (tools, volume, frequency)
       │
       ▼
 [Stage: extract]   ──> Validates phone number & business type; computes completeness
       │
       ▼
 [Stage: confirm]   ──> Presents concise summary brief and asks for user confirmation
       │
       ▼
 [Stage: close]     ──> Marks isFinished = true, provisions Request in PostgreSQL,
                        emits `request:created`, dispatches Telegram notification.
```

---

## 5. Background Job Queues (`pg-boss`)

EazifyAi incorporates an Outbox pattern with `pg-boss` for resilient, transactional background processing backed directly by PostgreSQL tables (`pgboss.*`).

### 5.1 Queue: `request:created`
- **Trigger**: Fired when a request is created via the interactive AI chat (`socket/index.ts`) or via the fallback lead form (`fallback.service.ts`).
- **Worker**: `handleTelegramNotification` (`src/jobs/workers/telegram.worker.ts`).
- **Payload Schema**:
```json
{
  "requestId": "7b8d0a1b-3c4d-4e5f-6a7b-8c9d0e1f2a3b",
  "code": "EZ-684910",
  "publicId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "whatsapp": "01023498242",
  "name": "د. أحمد",
  "businessType": "عيادة أسنان",
  "problem": "غياب المرضى عن المواعيد وتأخر الكشوفات",
  "urgency": "HIGH",
  "createdAt": "2026-10-21T18:00:00.000Z"
}
```
- **Action**: Formats an HTML notification message and posts to the company's internal operations Telegram channel via `https://api.telegram.org/bot<TOKEN>/sendMessage`.

### 5.2 Queue: `request:status-changed`
- **Trigger**: Fired when an administrator updates the status of an order via `PATCH /v1/admin/requests/:id/status`.
- **Worker**: `handleEmailNotification` (`src/jobs/workers/email.worker.ts`).
- **Payload Schema**:
```json
{
  "requestId": "7b8d0a1b-3c4d-4e5f-6a7b-8c9d0e1f2a3b",
  "code": "EZ-684910",
  "publicId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "email": "customer@example.com",
  "whatsapp": "01023498242",
  "status": "IN_PROGRESS",
  "note": "تم الاتفاق وجاري تنفيذ المرحلة الأولى",
  "updatedAt": "2026-10-21T18:30:00.000Z"
}
```
- **Action**: Composes a branded HTML status update email with a direct public tracking link (`https://eazifyai.com/ar/track/<publicId>`) and dispatches via Nodemailer.
