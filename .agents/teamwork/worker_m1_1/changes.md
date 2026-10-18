# Changes Summary: Milestone 1 (Route `/privacy`)

## 1. Universal Box-Sizing Reset in `src/styles/tokens.css`
Applied universal `box-sizing: border-box` to `*, *::before, *::after` at the top of `src/styles/tokens.css`.
Restores `.ez-top` and `.ez-wrap` to exactly `1040px` max-width and centered margins (`x: 120px` on 1280px viewport), eliminating the 48px width container expansion and 24px horizontal drift.

```diff
--- a/src/styles/tokens.css
+++ b/src/styles/tokens.css
@@ -4,6 +4,12 @@
  * Enforced via stylelint rule: color-no-hex & function-disallowed-list.
  */
 
+*,
+*::before,
+*::after {
+  box-sizing: border-box;
+}
+
 /* ==========================================================================
    Layer 1: Primitives (raw palette, fixed measurements)
    ========================================================================== */
```

## 2. Localized `generateMetadata` in `src/app/[locale]/(marketing)/privacy/page.tsx`
Exported `generateMetadata` conforming to Next.js 16 App Router types with localized `title`, `description`, `canonical`, `alternates`, `openGraph`, and `twitter` tags for Arabic (`ar`) and English (`en`). Also imported `tokens.css` so the universal reset is bundled for the route.

```diff
--- a/src/app/[locale]/(marketing)/privacy/page.tsx
+++ b/src/app/[locale]/(marketing)/privacy/page.tsx
@@ -1,5 +1,8 @@
+import type { Metadata } from 'next';
 import { setRequestLocale } from 'next-intl/server';
 import { LegalPage } from '../../../../components/layout/LegalPage';
+import { brand } from '../../../../config/brand';
+import '../../../../styles/tokens.css';
 
 export const dynamic = 'force-static';
 export const revalidate = 604800; // 7 days
@@ -8,6 +11,46 @@ export function generateStaticParams() {
   return [{ locale: 'ar' }, { locale: 'en' }];
 }
 
+export async function generateMetadata({
+  params,
+}: {
+  params: Promise<{ locale: string }>;
+}): Promise<Metadata> {
+  const { locale } = await params;
+  const isAr = locale !== 'en';
+
+  const title = isAr
+    ? 'الخصوصية والسياسات | EazifyAi'
+    : 'Privacy & Policy | EazifyAi';
+  const description = isAr
+    ? 'إيه اللي بنجمعه من بياناتك، وليه، وفين بيتخزن، وإزاي تطلب تعديلها أو مسحها.'
+    : 'What data we collect, why, where it is stored, and how to request access or deletion.';
+  const url = `${brand.siteUrl}/${locale}/privacy`;
+
+  return {
+    title,
+    description,
+    alternates: {
+      canonical: url,
+      languages: {
+        ar: `${brand.siteUrl}/ar/privacy`,
+        en: `${brand.siteUrl}/en/privacy`,
+      },
+    },
+    openGraph: {
+      title,
+      description,
+      url,
+      type: 'website',
+    },
+    twitter: {
+      card: 'summary_large_image',
+      title,
+      description,
+    },
+  };
+}
+
 export default async function PrivacyPage({
   params,
 }: {
```

## 3. Hardened Visual Test Runner in `scripts/run-visual-tests.mjs`
Added support for optional route filtering via CLI argument or `ROUTE` environment variable (`node scripts/run-visual-tests.mjs privacy`). Hardened navigation with `waitUntil: 'domcontentloaded'` and a 1500ms bounded `document.fonts.ready` race timeout to prevent test hangs. Added per-file pass/diff ratio logging.

```diff
--- a/scripts/run-visual-tests.mjs
+++ b/scripts/run-visual-tests.mjs
@@ -13,7 +13,8 @@ const DIFF_DIR = path.resolve('tests/visual/diff');
   if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
 });
 
-const routes = [
+const routeFilter = process.env.ROUTE || process.argv[2];
+const allRoutes = [
   { name: 'home', path: '' },
   { name: 'about', path: '/about' },
   { name: 'brand', path: '/brand' },
@@ -26,6 +27,9 @@ const routes = [
   { name: 'track', path: '/track' },
   { name: 'admin', path: '/admin' },
 ];
+const routes = routeFilter
+  ? allRoutes.filter((r) => r.name === routeFilter || r.path === routeFilter || r.path === `/${routeFilter}`)
+  : allRoutes;
 
 const viewports = [
   { width: 390, height: 844 },
@@ -73,12 +77,18 @@ async function run() {
           const diffPath = path.join(DIFF_DIR, filename);
 
           try {
-            await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 15000 });
-            await page.evaluate((th) => {
+            await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
+            await page.evaluate(async (th) => {
               document.documentElement.dataset.theme = th;
               document.documentElement.style.colorScheme = th;
+              try {
+                await Promise.race([
+                  document.fonts.ready,
+                  new Promise((resolve) => setTimeout(resolve, 1500)),
+                ]);
               } catch {}
             }, theme);
-            await page.waitForTimeout(300);
+            await page.waitForTimeout(400);
 
             await page.screenshot({ path: currentPath, fullPage: true });
 
@@ -114,11 +124,14 @@ async function run() {
             const totalPixels = width * height;
             const diffRatio = numDiffPixels / totalPixels;
 
+            const pct = (diffRatio * 100).toFixed(4);
             if (diffRatio <= 0.05) {
               passed++;
+              console.log(`  ✓ ${filename}: ${pct}% (PASS)`);
               results.push({ filename, status: 'PASS', diffRatio });
             } else {
               failed++;
+              console.log(`  ✗ ${filename}: ${pct}% (DIFF > 5%)`);
               fs.writeFileSync(diffPath, PNG.sync.write(diff));
               results.push({ filename, status: 'DIFF', diffRatio });
             }
```
