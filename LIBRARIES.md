# LIBRARIES.md — مراجعة قوايمك + المكتبات لكل مرحلة

الإصدارات اتشيكت من npm بتاريخ 2026-10-15. نسخة Node عندي 22 LTS. ثبّت الإصدار بالظبط (من غير `^`) وقت التركيب، وراجع الـ changelog لو في major جديد.

## 1) مراجعة قايمة الـ Back end بتاعتك

| الحزمة | القرار | السبب |
|---|---|---|
| express ^4.21 | **غيّر لـ 5.x** (5.3.0) | الأخطاء الـ async بتتعالج تلقائياً، وده النسخة الحالية |
| @prisma/client + prisma ^5.22 | **غيّر لـ 7.x** (`@prisma/client` 7.10.0) | 5.22 قديم. آخر `prisma` على npm دلوقتي 8.0.0-rc، فاستخدم 7.x المستقرة، وجرّب الاتصال بـ Supabase pooler في أول يوم (7.x فيها تغيير في الـ config والـ adapters) |
| bcrypt, jsonwebtoken, cookie-parser | **احذف** | Supabase Auth (مجاني)، فمفيش باسوردات ولا JWT بنوقّعه. بدالهم `jose` للتحقق من الـ JWT |
| @supabase/supabase-js 2.116 | **خليه** (2.118.0 دلوقتي) | الأدمن والـ anonymous sign-in والـ MFA |
| bullmq + ioredis | **احذف دلوقتي** | محتاجين Redis (تكلفة وصيانة) وإنت عايز أقل تكلفة. بدالهم `pg-boss` على نفس Postgres |
| socket.io | **خليه** (4.x) قرارك | الشات عليه. شروط: تحقق توكن في الـ handshake، zod على كل event، instance واحد في الأول، وCORS لأصل واحد. بيشتغل على VPS/PaaS مش على Vercel |
| axios | **احذف** | `fetch` موجود في Node. تليجرام وغيره بـ fetch |
| busboy | **احذف** | مفيش رفع ملفات في النسخة الأولى |
| ua-parser-js | **احذف** | مش محتاجينه مع fingerprint |
| node-cron | **احذف** | `pg-boss` عنده جدولة (cron) جاهزة |
| helmet 7.2 | **حدّثه** (8.3.0) | |
| express-rate-limit | **خليه** (8.7.1) | مع قواعد Cloudflare. ملحوظة: التخزين in-memory يكفي طالما instance واحد |
| nodemailer ^6 | **حدّثه** (10.1.1) أو مزوّد SMTP زي Resend | |
| @sentry/node | **خليه** (11.8.0) | مع تنظيف أي بيانات شخصية |
| zod 4.6.0 | **خليه** (4.6.7) | |
| langchain 1.5.11, @langchain/langgraph, @langchain/google-genai | **خليهم** (1.5.16 / 1.5.0 / 2.3.2) | |
| dotenv | **اختياري** | Node بيقرأ `--env-file` لوحده |
| nodemon | **استبدله بـ `tsx watch`** | مفيش TypeScript في قايمتك أصلاً. `tsx watch src/server.ts` بيعمل نفس الشغل. لو عايز nodemon: `nodemon --exec tsx src/server.ts` |
| eslint 9 / prettier / globals | خليهم، وزوّد `typescript-eslint` | |
| **ناقص:** typescript, tsx, @types/*, vitest | **ضيفهم** | |

## 2) مراجعة قايمة الـ Front end بتاعتك

القايمة دي شكلها منسوخة من مشروع تاني (فيها survey-core وreact-player وfingerprintjs وRedux). التصميم اللي عندك على Higgsfield **مابيستخدمش أي مكتبة UI ولا animation**: بيستخدم React وCSS عادي بس. فالـ front المطلوب أصغر بكتير.

| الحزمة | القرار | السبب |
|---|---|---|
| next 13.5.x + @next/swc-wasm-nodejs | **غيّر لـ Next 16** (16.4.1) مع React 19 | 13.5 قديم من 2023، والتصميم أصلاً React 19. الـ wasm swc ده حل لمشكلة بيئة مش عندك |
| react / react-dom 18.2 | **React 19** (19.3.1) | |
| tailwindcss 4 + @tailwindcss/postcss | **مش محتاجه للنقل الحرفي** | التصميم CSS عادي بـ classes `ez-*`. لو حبيت Tailwind بعد الإطلاق نضيفه |
| @radix-ui/* (30 حزمة), cmdk, vaul, sonner, embla, input-otp, react-day-picker, react-resizable-panels, recharts | **احذف كلهم** | مفيش استخدام في التصميم. ضيف حاجة منهم بس لما فيتشر معينة تحتاجها (مثلاً recharts لتحليلات الأدمن لاحقاً) |
| @reduxjs/toolkit, react-redux | **احذف** | الـ state بسيط. `@tanstack/react-query` للبيانات و`zustand` لو احتجت state صغير |
| framer-motion | **مش دلوقتي** | الحركات في التصميم CSS. لو احتجنا مكتبة بعدين نستخدم `motion` (14.3.0) lazy-loaded |
| @fingerprintjs/fingerprintjs | **خليه** قرارك، بضوابط | إشارة ضد السبام بس، مش هوية ولا صلاحيات. بيتخزن hash مملّح، وبيتذكر في صفحة الخصوصية، ويتحمّل lazy. شوف spec.md قسم 3.1 |
| socket.io-client | **خليه** قرارك | بيتحمّل في صفحة الشات بس |
| survey-core, survey-react-ui, react-player, dompurify, react-markdown, remark-gfm | **احذف** | الرد بيتعرض نص عادي. لو احتجنا markdown نضيف بنظافة |
| react-hot-toast + sonner | **اختار واحدة لو احتجت** | حالياً مش مطلوبين |
| @hookform/resolvers, react-hook-form, zod | **خليهم** (للفورمز) | |
| next-themes | **اختياري** | الثيم بسيط (`data-theme`) ممكن نعمله بكود صغير من غير حزمة |
| lucide-react, clsx, tailwind-merge, class-variance-authority | **اشيلهم لحد ما نحتاجهم** | الأيقونات في التصميم SVG موجودة |
| date-fns, sharp | **sharp مش لازم** (Next بيتعامل معاه) | |

## 3) المكتبات لكل مرحلة

### المرحلة 1: الأساس + نقل التصميم
**API:** `express@5`, `socket.io`, `jose`, `@supabase/supabase-js`, `zod`, `@asteasolutions/zod-to-openapi` (9.1.0), `pino`, `pino-http`, `pino-pretty` (dev), `helmet`, `cors`, `express-rate-limit`, `@prisma/client` + `prisma` (7.x), `@sentry/node`. Dev: `typescript`, `tsx`, `vitest` (5.0.5), `supertest`, `eslint` + `typescript-eslint` + `prettier`, `husky`, `lint-staged`, `knip`.
**Web:** `next`, `react`, `react-dom`, `next-intl` (4.14.9), `socket.io-client`, `@fingerprintjs/fingerprintjs`, `zod`, `@tanstack/react-query`, `openapi-fetch` (0.17.0) + `openapi-typescript` (dev, 7.13.0), `@sentry/nextjs`. Dev: `typescript`, `@playwright/test` (1.64.1), `stylelint` (+ config), `eslint-config-next`, `husky`, `lint-staged`, `knip`, `size-limit`.
**الأدوات:** GitHub Actions (CI) + `gitleaks`.

### المرحلة 2: الحسابات والأدمن
**API:** مفيش جديد (jose + supabase). **Web:** `@supabase/ssr` (0.12.7) + `@supabase/supabase-js` (محمّلين lazy)، `react-hook-form` + `@hookform/resolvers`. **الأدمن:** MFA بتاع Supabase (TOTP) من غير حزمة إضافية.

### المرحلة 3: المساعد (Agent)
**API:** `langchain`, `@langchain/langgraph`, `@langchain/google-genai`. الـ streaming عبر socket.io. للـ evals: سكربت vitest بسيط. التتبع: سجل داخلي في الداتابيز بدل خدمة خارجية (أو Langfuse لو قررت، وتتحط في صفحة الخصوصية).
**Web:** مفيش جديد (socket.io-client).

### المرحلة 4: مسار الطلب
**API:** `pg-boss` (12.38.0)، `nodemailer`. تليجرام بـ `fetch`. **Web:** مفيش.

### المرحلة 5: رحلة الزائر
**Web:** Web Speech API في المتصفح للصوت (من غير حزمة)، `posthog-js` (1.438.11) بتحميل مؤجل وبإعدادات خصوصية (من غير تسجيل جلسات على صفحة الشات). **API:** مفيش.

### المرحلة 6: باقي الأدمن
**Web:** `recharts` أو رسم SVG بسيط للتحليلات. **API:** مفيش.

### المرحلة 7: التجهيز للإطلاق
`k6` (اختبار حمل، مش حزمة npm)، Lighthouse CI، `@playwright/test` (اختبارات e2e + visual)، `@sentry/*`، خدمة مراقبة خارجية مجانية (UptimeRobot أو Better Stack) متوصلة بتليجرام، سكربت نسخ احتياطي `pg_dump` على GitHub Actions أسبوعياً.

## 4) أدوات الـ auth والـ logger اللي سألت عنها
- **Auth:** Supabase Auth (مجاني) + `jose` على الـ API. مفيش bcrypt ولا jsonwebtoken.
- **Logger:** `pino` + `pino-http` (+ `pino-pretty` في التطوير فقط)، مع `redact` للتليفون والإيميل ونص الرسائل.
- **nodemon:** بدله `tsx watch`.
