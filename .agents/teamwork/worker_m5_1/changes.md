# Changes — Milestone 5 (/chat)

## Overview
This document records the exact changes made to unify the `submitLead` call sites across `Chat.tsx`, `Req.tsx`, and `Feedback.tsx`, localize tracking links in `Journey.tsx`, and verify the route and metadata in `src/app/[locale]/chat/page.tsx`.

## Modified Files

### 1. `src/features/chat/Chat.tsx`
- Replaced the local dummy `submitLead` function with the unified `submitLead` imported directly from `../../lib/mock-api`.
- Retained full conversational leaf component state, speech recognition, live brief card updates, and lead dispatch:
```diff
@@ -12,7 +12,7 @@ import {
 import { History } from './History';
 import { Journey } from '../journey/Journey';
 import { useSite } from '../../components/layout/SiteLayout';
-import { mockApi, type Req } from '../../lib/mock-api';
+import { mockApi, submitLead, type Req } from '../../lib/mock-api';
 
 type Msg = { r: 'a' | 'u'; x: string };
 type Draft = {
@@ -54,24 +54,6 @@ const Check = () => (
   </svg>
 );
 
-async function submitLead({
-  data,
-}: {
-  data: { problem: string; affected: string; current: string; contact: string; lang: string };
-}) {
-  try {
-    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
-    await fetch(`${apiUrl}/v1/leads`, {
-      method: 'POST',
-      headers: { 'Content-Type': 'application/json' },
-      body: JSON.stringify(data),
-    });
-  } catch {
-    // Offline / local preview fallback
-  }
-  return { ok: true };
-}
-
 export function Chat() {
   const { t, lang, user } = useSite();
   const [msgs, setMsgs] = useState<Msg[]>([]);
```

### 2. `src/features/journey/Req.tsx`
- Imported `submitLead` from `../../lib/mock-api`.
- Replaced the dummy `useFollow` stub with a genuine implementation sending follow-up details (urgency, budget, time, booking call slot, notification channels, contact, and language) to `submitLead`:
```diff
@@ -2,7 +2,7 @@
 
 import { useState, type CSSProperties } from 'react';
 import { useSite } from '../../components/layout/SiteLayout';
-import { mockApi, type Req } from '../../lib/mock-api';
+import { mockApi, submitLead, type Req } from '../../lib/mock-api';
 import { formatDeterministicDate } from '../../lib/date';
 
 export function Chips({
@@ -212,10 +212,33 @@ export function Timeline({ req }: { req: Req }) {
 }
 
 export function useFollow() {
+  const { lang } = useSite();
   const [busy, setBusy] = useState(false);
-  const send = (_r: Req) => {
+  const send = (r: Req) => {
     setBusy(true);
-    return Promise.resolve()
+    const x = r.x;
+    return submitLead({
+      data: {
+        problem: ('[' + r.id + '] ' + (x.details || '-')).slice(0, 2000),
+        affected: r.name || '-',
+        current: (
+          'urgency=' +
+          (x.urgency || '-') +
+          '; budget=' +
+          (x.budget || '-') +
+          '; time=' +
+          (x.time || '-') +
+          '; call=' +
+          (r.call ? r.call.day + ' ' + r.call.slot : '-') +
+          '; notify=' +
+          [x.wa ? 'wa:' + (x.waNum || r.f[3]) : '', x.site !== false ? 'site' : '']
+            .filter(Boolean)
+            .join('+')
+        ).slice(0, 2000),
+        contact: r.f[3] ?? '',
+        lang: lang === 'ar' ? 'ar' : 'en',
+      },
+    })
       .catch(() => undefined)
       .finally(() => setBusy(false));
   };
```

### 3. `src/components/layout/Feedback.tsx`
- Imported `submitLead` from `../../lib/mock-api`.
- Destructured `lang` from `useSite()`.
- Replaced the dummy `send` handler with genuine invocation of `submitLead`:
```diff
@@ -2,16 +2,25 @@
 
 import { useState } from 'react';
 import { useSite } from './SiteLayout';
-import type { Req } from '../../lib/mock-api';
+import { submitLead, type Req } from '../../lib/mock-api';
 
-export function Feedback({ req: _req }: { req: Req }) {
-  const { t } = useSite();
+export function Feedback({ req }: { req: Req }) {
+  const { t, lang } = useSite();
   const f = t.fb;
   const [c, setC] = useState(-1);
   const [txt, setTxt] = useState('');
   const [sent, setSent] = useState(false);
 
-  const send = (_choice: number, _text: string) => {
+  const send = (choice: number, text: string) => {
+    submitLead({
+      data: {
+        problem: ('[' + req.id + '] feedback: ' + (f.o[choice] ?? '') + (text ? ' - ' + text : '')).slice(0, 2000),
+        affected: req.name || '-',
+        current: 'feedback',
+        contact: req.f[3] ?? '',
+        lang: lang === 'ar' ? 'ar' : 'en',
+      },
+    }).catch(() => undefined);
     setSent(true);
   };
```

### 4. `src/features/journey/Journey.tsx`
- Localized the request tracking link to include the active language prefix (`/' + lang + '/track?id=' + req.id`):
```diff
@@ -173,7 +173,7 @@ export function Journey({ req, onChange }: { req: Req; onChange: (r: Req) => voi
               </h2>
               <Timeline req={cur} />
               <div style={{ marginTop: 32 }}>
-                <a className="ez-go" href={'/track?id=' + req.id}>
+                <a className="ez-go" href={'/' + lang + '/track?id=' + req.id}>
                   {j.track}
                 </a>
               </div>
```

### 5. `src/app/[locale]/chat/page.tsx`
- Verified conforming implementation of Next.js 16 asynchronous params `Promise<{ locale: string }>`, `generateStaticParams` for `[{ locale: 'ar' }, { locale: 'en' }]`, localized `generateMetadata` for Arabic (`"احكيلنا مشكلتك | EazifyAi"`) and English (`"Tell Us Your Problem | EazifyAi"`), canonical alternates, OpenGraph, and Twitter tags.
