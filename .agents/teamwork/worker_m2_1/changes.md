# Code Changes: Milestone 2 (/copyright)

## Summary of Changes
1. `src/app/[locale]/layout.tsx`:
   - Imported `../../styles/tokens.css` right after `../../styles/base.css` to load universal CSS reset (`*, *::before, *::after { box-sizing: border-box; }`) and CSS variables globally across all routes.
2. `src/app/[locale]/(marketing)/copyright/page.tsx`:
   - Imported `Metadata` type from `next`.
   - Imported `brand` from `../../../../config/brand`.
   - Imported `../../../../styles/tokens.css` for route-level self-containment.
   - Exported localized `generateMetadata` function supporting Next.js 16 App Router types (`params: Promise<{ locale: string }>`) with:
     - Arabic metadata (`حقوق الملكية | EazifyAi`, description `حقوق الملكية والاستخدام لمحتوى وهوية EazifyAi.`).
     - English metadata (`Intellectual Property & Copyright | EazifyAi`, description `Intellectual property and usage rights for EazifyAi content and identity.`).
     - Canonical link `${brand.siteUrl}/${locale}/copyright`.
     - Alternate language links for `ar` and `en`.
     - OpenGraph title, description, url, and type.
     - Twitter summary_large_image card.

## Exact Git Diff

```diff
diff --git a/src/app/[locale]/(marketing)/copyright/page.tsx b/src/app/[locale]/(marketing)/copyright/page.tsx
index b111a73..e2f1e79 100644
--- a/src/app/[locale]/(marketing)/copyright/page.tsx
+++ b/src/app/[locale]/(marketing)/copyright/page.tsx
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
+    ? 'حقوق الملكية | EazifyAi'
+    : 'Intellectual Property & Copyright | EazifyAi';
+  const description = isAr
+    ? 'حقوق الملكية والاستخدام لمحتوى وهوية EazifyAi.'
+    : 'Intellectual property and usage rights for EazifyAi content and identity.';
+  const url = `${brand.siteUrl}/${locale}/copyright`;
+
+  return {
+    title,
+    description,
+    alternates: {
+      canonical: url,
+      languages: {
+        ar: `${brand.siteUrl}/ar/copyright`,
+        en: `${brand.siteUrl}/en/copyright`,
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
 export default async function CopyrightPage({
   params,
 }: {
diff --git a/src/app/[locale]/layout.tsx b/src/app/[locale]/layout.tsx
index fc35057..46f096a 100644
--- a/src/app/[locale]/layout.tsx
+++ b/src/app/[locale]/layout.tsx
@@ -1,6 +1,7 @@
 import type { Metadata } from 'next';
 import type { ReactNode } from 'react';
 import '../../styles/base.css';
+import '../../styles/tokens.css';
 import { SiteLayout } from '../../components/layout/SiteLayout';
 import { brand } from '../../config/brand';
 import { setRequestLocale } from 'next-intl/server';
```
