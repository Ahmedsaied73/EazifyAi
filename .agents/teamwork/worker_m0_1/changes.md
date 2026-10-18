# Changes Made for Milestone 0 (Step A0 Foundation)

## Modified Files
1. `d:\EazifyAi\eazifyai-web\src\styles\base.css`
2. `d:\EazifyAi\eazifyai-web\.stylelintrc.json`
3. `d:\EazifyAi\eazifyai-web\src\app\[locale]\layout.tsx`
4. `d:\EazifyAi\eazifyai-web\src\lib\mock-api.ts`

---

### 1. `d:\EazifyAi\eazifyai-web\src\styles\base.css`
- **Description**: Replaced with the canonical `scripts/site-layer.css` verbatim. Restores `@keyframes ez-flash` using `rgba(120,169,204,.25)`, exact CSS variables in `:root`, and guarantees 100% byte-for-byte equivalence with `scripts/site-layer.css`.
- **Diff against `scripts/site-layer.css`**:
```bash
git diff --no-index scripts/site-layer.css src/styles/base.css
# 0 diff lines (identical)
```

---

### 2. `d:\EazifyAi\eazifyai-web\.stylelintrc.json`
- **Description**: Added `"src/styles/base.css"` to `overrides[0].files` so that verbatim hex and rgba declarations in the site-layer CSS pass stylelint without requiring manual modifications to the canonical CSS.
- **Diff**:
```diff
--- a/.stylelintrc.json
+++ b/.stylelintrc.json
@@ -8,7 +8,7 @@
   },
   "overrides": [
     {
-      "files": ["src/styles/tokens.css"],
+      "files": ["src/styles/tokens.css", "src/styles/base.css"],
       "rules": {
         "color-no-hex": null,
         "function-disallowed-list": null,
```

---

### 3. `d:\EazifyAi\eazifyai-web\src\app\[locale]\layout.tsx`
- **Description**: Injected `<head>` element with preconnect links for `https://fonts.googleapis.com` and `https://fonts.gstatic.com` (with `crossOrigin="anonymous"`), and stylesheet `<link>` for Geist (weights 300, 400, 500, 600) and IBM Plex Sans Arabic (weights 400, 500, 600). Strictly omitted weight 700. Added Next.js ESLint suppression comment.
- **Diff**:
```diff
--- a/src/app/[locale]/layout.tsx
+++ b/src/app/[locale]/layout.tsx
@@ -39,6 +39,19 @@ export default async function RootLayout({
       style={{ colorScheme: 'dark' }}
       suppressHydrationWarning
     >
+      <head>
+        <link rel="preconnect" href="https://fonts.googleapis.com" />
+        <link
+          rel="preconnect"
+          href="https://fonts.gstatic.com"
+          crossOrigin="anonymous"
+        />
+        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
+        <link
+          rel="stylesheet"
+          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap"
+        />
+      </head>
       <body>
         <SiteLayout initialLocale={validLocale}>{children}</SiteLayout>
       </body>
```

---

### 4. `d:\EazifyAi\eazifyai-web\src\lib\mock-api.ts`
- **Description**: Implemented and exported the unified `submitLead` function conforming to R3. Provides simulated 400ms server network delay, SSR safety with `memStore` fallback, dev mode error testing (`?fail=1` / `_fail: true`), and local browser persistence in `ez-leads`. Also exported named function helpers (`sessionUser`, `register`, `login`, `logout`, etc.) for direct call site compatibility.
- **Diff**:
```diff
--- a/src/lib/mock-api.ts
+++ b/src/lib/mock-api.ts
@@ -198,4 +198,82 @@ export const mockApi = {
       window.dispatchEvent(new CustomEvent('ez-notes', { detail: 'read' }));
     }
   },
+
+  submitLead,
 };
+
+export interface LeadData {
+  problem: string;
+  affected?: string;
+  current?: string;
+  contact?: string;
+  lang?: 'ar' | 'en' | string;
+  [key: string]: unknown;
+}
+
+export interface SubmitLeadParams {
+  data: LeadData;
+}
+
+export interface SubmitLeadResult {
+  ok: boolean;
+  id?: string;
+}
+
+/**
+ * Unified mock API for lead submission matching the design-reference server function contract.
+ * - Emulates 400ms server network delay
+ * - SSR-safe (checks typeof window !== 'undefined')
+ * - Stores lead in localStorage 'ez-leads' when in browser, memStore when SSR
+ * - Supports dev error simulation via ?fail=1 in URL or data._fail === true
+ */
+export async function submitLead({ data }: SubmitLeadParams): Promise<SubmitLeadResult> {
+  await new Promise((resolve) => setTimeout(resolve, 400));
+  const id = 'lead_' + Math.random().toString(36).slice(2, 9);
+
+  if (typeof window !== 'undefined') {
+    try {
+      const url = new URL(window.location.href);
+      if (url.searchParams.get('fail') === '1' || data._fail === true) {
+        throw new Error('Simulated submitLead failure (?fail=1)');
+      }
+    } catch (e) {
+      if (e instanceof Error && e.message.includes('Simulated')) {
+        throw e;
+      }
+    }
+  }
+
+  if (typeof window !== 'undefined') {
+    try {
+      const existing = JSON.parse(localStorage.getItem('ez-leads') || '[]');
+      localStorage.setItem('ez-leads', JSON.stringify([...existing, { ...data, id, at: Date.now() }].slice(0, 50)));
+    } catch {
+      /* storage full or blocked */
+    }
+  } else {
+    try {
+      const existing = JSON.parse(memStore.get('ez-leads') || '[]');
+      memStore.set('ez-leads', JSON.stringify([...existing, { ...data, id, at: Date.now() }].slice(0, 50)));
+    } catch {
+      /* ignore */
+    }
+  }
+
+  return { ok: true, id };
+}
+
+export const sessionUser = mockApi.sessionUser;
+export const register = mockApi.register;
+export const login = mockApi.login;
+export const logout = mockApi.logout;
+export const updateUser = mockApi.updateUser;
+export const getChats = mockApi.getChats;
+export const saveChat = mockApi.saveChat;
+export const getReqs = mockApi.getReqs;
+export const saveReq = mockApi.saveReq;
+export const newId = mockApi.newId;
+export const getNotes = mockApi.getNotes;
+export const addNote = mockApi.addNote;
+export const readNotes = mockApi.readNotes;
+
```
