import { chromium } from 'file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'file:///d:/EazifyAi/eazifyai-web/node_modules/pngjs/lib/png.js';
import pixelmatch from 'file:///d:/EazifyAi/eazifyai-web/node_modules/pixelmatch/index.js';

const REF_URL = 'http://localhost:3001';
const NEXT_URL = 'http://localhost:3000';

const viewports = [
  { width: 1280, height: 800 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];

const locales = ['ar', 'en'];
const themes = ['dark', 'light'];

async function inspect() {
  const browser = await chromium.launch();

  console.log('--- COMPARING DOM & RENDER BETWEEN 3001 (REF) and 3000 (NEXT) ---');

  for (const vp of viewports) {
    for (const locale of locales) {
      for (const theme of themes) {
        // 1. Capture Reference (3001)
        const ctxRef = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
        });
        await ctxRef.addInitScript(({ l, th }) => {
          try {
            window.localStorage.setItem('ez-lang', l);
            window.localStorage.setItem('ez-theme', th);
          } catch {}
        }, { l: locale, th: theme });
        const pRef = await ctxRef.newPage();
        await pRef.goto(`${REF_URL}/about`, { waitUntil: 'networkidle', timeout: 15000 });
        await pRef.evaluate(({ l, th }) => {
          const d = document.documentElement;
          d.lang = l;
          d.dir = l === 'ar' ? 'rtl' : 'ltr';
          d.dataset.theme = th;
          d.style.colorScheme = th;
          try {
            window.localStorage.setItem('ez-lang', l);
            window.localStorage.setItem('ez-theme', th);
          } catch {}
        }, { l: locale, th: theme });
        await pRef.waitForTimeout(300);
        const refPngBuf = await pRef.screenshot({ fullPage: true });

        // Extract DOM info from Ref
        const refInfo = await pRef.evaluate(() => {
          return {
            h1: document.querySelector('h1')?.innerText,
            sub: document.querySelector('.ez-sub')?.innerText,
            chips: Array.from(document.querySelectorAll('.ez-abchips span')).map(s => s.innerText),
            whoHead: document.querySelector('.ez-who')?.previousElementSibling?.innerText,
            whoPs: Array.from(document.querySelectorAll('.ez-who p')).map(p => ({ text: p.innerText, isLead: p.classList.contains('lead') })),
            cards: Array.from(document.querySelectorAll('.ez-yn .ez-card')).map(c => ({
              title: c.querySelector('h3')?.innerText,
              items: Array.from(c.querySelectorAll('li')).map(li => li.innerText.trim())
            })),
            steps: Array.from(document.querySelectorAll('.ez-tl li')).map(li => ({
              node: li.querySelector('.ez-node')?.innerText,
              title: li.querySelector('b')?.innerText,
              desc: li.querySelector('small')?.innerText,
            })),
            aiCard: {
              title: document.querySelector('.ez-ai h2')?.innerText,
              p: document.querySelector('.ez-ai p')?.innerText,
            },
            founder: {
              photoHidden: document.querySelector('.ez-fimg img')?.hasAttribute('hidden'),
              photoSrc: document.querySelector('.ez-fimg img')?.getAttribute('src'),
              photoPlaceholder: document.querySelector('.ez-fph span')?.innerText,
              tags: Array.from(document.querySelectorAll('.ez-ftag')).map(t => t.innerText),
              label: document.querySelector('.ez-flab')?.innerText,
              name: document.querySelector('.ez-fbio h2')?.innerText,
              nameIsPh: document.querySelector('.ez-fbio h2')?.classList.contains('ez-ph'),
              role: document.querySelector('.ez-frole')?.innerText,
              bio: Array.from(document.querySelectorAll('.ez-fbio p:not(.ez-frole)')).map(p => ({ text: p.innerText, isPh: p.classList.contains('ez-ph') })),
            },
            contactForm: {
              title: document.querySelector('.ez-form h2')?.innerText,
              p: document.querySelector('.ez-form p')?.innerText,
              btn: document.querySelector('.ez-form button[type="submit"]')?.innerText,
              waText: document.querySelector('.ez-wa')?.innerText,
            }
          };
        });

        // 2. Capture Next (3000)
        const ctxNext = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
        });
        await ctxNext.addInitScript(({ l, th }) => {
          try {
            window.localStorage.setItem('ez-lang', l);
            window.localStorage.setItem('ez-theme', th);
          } catch {}
        }, { l: locale, th: theme });
        const pNext = await ctxNext.newPage();
        await pNext.goto(`${NEXT_URL}/${locale}/about`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await pNext.evaluate(async (th) => {
          document.documentElement.dataset.theme = th;
          document.documentElement.style.colorScheme = th;
          try {
            await Promise.race([
              document.fonts.ready,
              new Promise((resolve) => setTimeout(resolve, 1500)),
            ]);
          } catch {}
        }, theme);
        await pNext.waitForTimeout(300);
        const nextPngBuf = await pNext.screenshot({ fullPage: true });

        // Extract DOM info from Next
        const nextInfo = await pNext.evaluate(() => {
          return {
            h1: document.querySelector('h1')?.innerText,
            sub: document.querySelector('.ez-sub')?.innerText,
            chips: Array.from(document.querySelectorAll('.ez-abchips span')).map(s => s.innerText),
            whoHead: document.querySelector('.ez-who')?.previousElementSibling?.innerText,
            whoPs: Array.from(document.querySelectorAll('.ez-who p')).map(p => ({ text: p.innerText, isLead: p.classList.contains('lead') })),
            cards: Array.from(document.querySelectorAll('.ez-yn .ez-card')).map(c => ({
              title: c.querySelector('h3')?.innerText,
              items: Array.from(c.querySelectorAll('li')).map(li => li.innerText.trim())
            })),
            steps: Array.from(document.querySelectorAll('.ez-tl li')).map(li => ({
              node: li.querySelector('.ez-node')?.innerText,
              title: li.querySelector('b')?.innerText,
              desc: li.querySelector('small')?.innerText,
            })),
            aiCard: {
              title: document.querySelector('.ez-ai h2')?.innerText,
              p: document.querySelector('.ez-ai p')?.innerText,
            },
            founder: {
              photoHidden: document.querySelector('.ez-fimg img')?.hasAttribute('hidden'),
              photoSrc: document.querySelector('.ez-fimg img')?.getAttribute('src'),
              photoPlaceholder: document.querySelector('.ez-fph span')?.innerText,
              tags: Array.from(document.querySelectorAll('.ez-ftag')).map(t => t.innerText),
              label: document.querySelector('.ez-flab')?.innerText,
              name: document.querySelector('.ez-fbio h2')?.innerText,
              nameIsPh: document.querySelector('.ez-fbio h2')?.classList.contains('ez-ph'),
              role: document.querySelector('.ez-frole')?.innerText,
              bio: Array.from(document.querySelectorAll('.ez-fbio p:not(.ez-frole)')).map(p => ({ text: p.innerText, isPh: p.classList.contains('ez-ph') })),
            },
            contactForm: {
              title: document.querySelector('.ez-form h2')?.innerText,
              p: document.querySelector('.ez-form p')?.innerText,
              btn: document.querySelector('.ez-form button[type="submit"]')?.innerText,
              waText: document.querySelector('.ez-wa')?.innerText,
            }
          };
        });

        // Compute pixel diff between actual Ref (3001) and Next (3000)
        const imgRef = PNG.sync.read(refPngBuf);
        const imgNext = PNG.sync.read(nextPngBuf);
        const w = Math.min(imgRef.width, imgNext.width);
        const h = Math.min(imgRef.height, imgNext.height);

        const uRef = new PNG({ width: w, height: h });
        const uNext = new PNG({ width: w, height: h });
        PNG.bitblt(imgRef, uRef, 0, 0, w, h, 0, 0);
        PNG.bitblt(imgNext, uNext, 0, 0, w, h, 0, 0);

        const diff = new PNG({ width: w, height: h });
        const numDiff = pixelmatch(uRef.data, uNext.data, diff.data, w, h, { threshold: 0.15 });
        const ratio = (numDiff / (w * h)) * 100;

        console.log(`[${locale}-${theme}-${vp.width}]: Ref(${imgRef.width}x${imgRef.height}) vs Next(${imgNext.width}x${imgNext.height}) -> Overlap Diff: ${ratio.toFixed(4)}% (Diff pixels: ${numDiff}/${w*h})`);

        if (vp.width === 1280 && theme === 'dark') {
          console.log(`\n--- DOM Comparison [${locale}] ---`);
          console.log('REF Founder:', JSON.stringify(refInfo.founder, null, 2));
          console.log('NEXT Founder:', JSON.stringify(nextInfo.founder, null, 2));
          console.log('REF Contact Form:', JSON.stringify(refInfo.contactForm, null, 2));
          console.log('NEXT Contact Form:', JSON.stringify(nextInfo.contactForm, null, 2));
        }

        await ctxRef.close();
        await ctxNext.close();
      }
    }
  }

  await browser.close();
}

inspect().catch(console.error);
