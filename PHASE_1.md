# PHASE_1.md — المرحلة 1: الأساس + النقل الحرفي للتصميم

## ليه نبدأ بيها؟
كل حاجة بعدها (حسابات، مساعد، طلبات) بتتبني فوقها. لو الأساس غلط، كل مرحلة هتورّث الغلطة. فالمرحلة دي هدفها واحد: **ريبوهين شغالين، متوصلين ببعض، التصميم منقول بنفس الشكل بالظبط، وكل حاجة متراقبة بفحص أوتوماتيك**. من غير ما نبني أي فيتشر حقيقي لسه.

مدتها المقدرة: 5 إلى 7 أيام عمل (تقدير مش التزام). بعدها نجرّب سوا قبل المرحلة 2، زي ما اتفقنا.

## اللي هيتعمل (بالترتيب، وليه كل خطوة)

| # | الخطوة | ليه الترتيب ده |
|---|---|---|
| 0 | قرارات لازم منك: مكان استضافة الـ API، الدومين، تليجرام/إيميل (ممكن نكمل من غيرهم في الأيام الأولى) | بتأخر حاجات لو اتأجلت |
| 1 | **Baseline التصميم**: Playwright يصوّر موقع Higgsfield كل صفحة × عربي/إنجليزي × داكن/فاتح × 3 مقاسات | لازم نثبت "الشكل الأصلي" قبل ما نلمس حاجة، وإلا مفيش دليل إننا حافظنا عليه |
| 2 | **ريبو الـ API**: TypeScript strict، ESLint/Prettier/Husky، هيكل المجلدات، `env.ts` بـ zod، pino، error handler، `/health`، `/v1/me` (تحقق JWT بـ jose)، OpenAPI، Vitest + Supertest، Dockerfile | الباك هو المالك للعقد، فلازم يتأسس الأول |
| 3 | **Supabase + Prisma**: 3 مشاريع (dev/staging/prod)، role محدود للتطبيق، أول migration (`Profile`)، RLS deny-all على كل جدول، اختبار اتصال pooler/direct | أخطر نقطة في الإعداد، والأحسن تتكشف مشاكلها بدري |
| 4 | **ريبو الـ Web**: Next 16، next-intl بمسارات `/ar` و`/en`، `design-reference/` بنسخة الكود الأصلي (قراءة فقط)، ESLint/Stylelint/Husky | |
| 5 | **النقل الحرفي (Step A)**: ننسخ المكونات والـ CSS والحركات زي ما هي، ونوصّل الـ routing والـ i18n بس. الحسابات والشات والأدمن لسه mock | عشان نعزل مشاكل النقل عن أي تغيير تاني |
| 6 | **الـ tokens والـ brand (Step B)**: نرفع كل الألوان المكتوبة يدوياً (حوالي 108) لـ `tokens.css`، وننقل النصوص لـ `messages/*.json`، ونعمل `config/brand.ts` (اسمك، الواتساب، الإيميل، وصفحة الإثبات) | **من غير أي تغيير في الشكل**. بعد كل دفعة بنشغّل مقارنة الصور |
| 7 | **العقد**: `openapi.json` من الـ API، توليد الأنواع في الـ Web، صفحة بتنادي `/health` بالـ typed client | نتأكد إن التوصيل بين الريبوهين شغال قبل ما نبني فوقه |
| 8 | **CI/CD للريبوهين**: lint، typecheck، tests، contract-check، visual، gitleaks، knip، size-limit. Branch protection على `main` | كده كل مرحلة بعد كده بتتحمي أوتوماتيك |
| 9 | **الملاحظة (observability)**: Sentry في الاتنين (من غير بيانات شخصية)، مراقبة خارجية على `/health` وتنبيه تليجرام | تعرف لو الموقع وقع قبل الزائر |
| 10 | **Deploy تجريبي**: staging للـ API، و preview للـ Web على الاستضافة المجانية (للتجربة بس) | |

## معيار "خلصت" (لازم كله يتحقق)
- [ ] ريبوهين منفصلين بـ CI أخضر وبرانش `main` محمي.
- [ ] كل صفحات التصميم شغالة على `/ar` و`/en` داكن وفاتح، ومقارنة الصور مع Higgsfield ضمن الحد (≤ 0.1% فرق لكل صفحة).
- [ ] مفيش لون hex/rgb خارج `tokens.css` (Stylelint بيفشل لو في).
- [ ] تغيير `--color-accent` في مكان واحد بيغيّر لون الموقع كله (دليل: لقطة قبل/بعد). تغيير `founderName` في `brand.ts` بيظهر في كل مكان مستخدم فيه.
- [ ] مفيش نص ظاهر مكتوب جوه TSX، وملفا الترجمة ليهم نفس المفاتيح.
- [ ] `GET /health` و`GET /v1/me` شغالين؛ `/v1/me` بيرفض من غير JWT، وبيقبل JWT صالح في الاختبارات (باستخدام JWKS محلي).
- [ ] `openapi.json` متولّد، والـ Web بيولّد منه الأنواع، وفحص contract-check أخضر.
- [ ] كل الجداول RLS مفعّل، والتطبيق متصل بـ role محدود، والـ migrations بتتشغّل من CI.
- [ ] `.env.example` في الريبوهين، والتطبيق مابيشتغلش لو env ناقص.
- [ ] Sentry شغال ومفيش بيانات شخصية في اللوجات، وتنبيه تليجرام اتجرّب فعلاً.
- [ ] ملخص التغيير مكتوب، وإنت جرّبت الموقع على موبايل حقيقي بالعربي.

## تعليمات للـ AI (انسخها زي ما هي)

### Prompt 1: ريبو الـ API
```
You are building the eazifyai-api repo. Read spec.md and CODE_STANDARDS.md first and follow them exactly.
Scope: PHASE_1 steps 2 and 3 only. Do not build any feature (no agent, no requests, no notifications).
Deliver: strict TypeScript Express 5 app with the folder structure in spec.md section 5; zod-validated env;
pino + pino-http with redaction; typed AppError + single error middleware; GET /health; GET /v1/me verifying Supabase JWTs with jose (JWKS);
OpenAPI generated from zod schemas into a committed openapi.json; Prisma 7 with the first migration (Profile), RLS enabled on every table;
Vitest + Supertest with a local JWKS test helper; ESLint no-restricted-imports enforcing routes→controller→service→repository→db; husky + lint-staged; Dockerfile; .env.example; GitHub Actions CI.
Do not add any dependency that is not listed for Phase 1 in LIBRARIES.md without asking. End with a change summary.
```

### Prompt 2: ريبو الـ Web (النقل الحرفي)
```
You are building the eazifyai-web repo (Next.js 16, React 19, next-intl). Read spec.md (especially section 6) and CODE_STANDARDS.md first.
The folder design-reference/ contains the original Higgsfield site source. It is READ-ONLY reference. Never import from it.
Goal: port the design LITERALLY. The result must look pixel-identical to the original in every route, language (ar/en), theme (dark/light) and viewport.
Port EVERY page and animation exactly as in the original, including /brand. Do it in this order and stop after each step so the visual suite can run:
 A) Copy the components, CSS classes (ez-*), markup and CSS animations verbatim into the Next.js App Router under app/[locale]/. Only change routing (TanStack Router → Next Link/navigation) and i18n wiring. Keep mocked accounts/chats/admin data behind one mockApi module. Do not redesign, rename classes, or "improve" anything.
 B) Without changing any rendered pixel: move every raw color/gradient/shadow/radius into styles/tokens.css using the three layers in spec.md 6.2 (derive soft/border/glow tones from --color-accent with color-mix so one change recolors the site); move every visible string into messages/ar.json and en.json using ICU placeholders; create config/brand.ts and a useT() wrapper that injects {brand}, {founder}, {whatsapp}, {email}.
 C) Add Stylelint (no raw colors outside tokens.css), the visual regression suite against the baseline screenshots in tests/visual/baseline, openapi-typescript + openapi-fetch wiring, and CI.
After every step run the visual suite; any page over 0.1% pixel difference blocks the step. If something cannot be ported identically, stop and tell me instead of approximating.
Do not add dependencies outside LIBRARIES.md Phase 1 without asking. End with a change summary.
```

## أسئلة محتاجة قرارك قبل ما نبدأ التنفيذ
1. **الـ API هيشتغل فين؟** لازم سيرفر شغال دايماً وقريب من مصر (EU). الاختيارات: VPS صغير (أرخص ومحتاج إعداد)، أو منصة PaaS مدفوعة بسيطة (أسهل). مش متحدد.
2. **الدومين** (يأخر روابط الدخول وإيميل الإشعارات).
3. **نبدأ بأنهي ريبو؟** مقترحي: الـ API الأول (الأساس) وبعدها الـ Web، أو بالتوازي لو هتشغّل agentين.
