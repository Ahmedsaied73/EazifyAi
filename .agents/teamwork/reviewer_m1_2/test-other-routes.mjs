import { chromium } from 'file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs';

async function testOtherRoutes() {
  const browser = await chromium.launch();
  for (const route of ['/ar/privacy', '/ar/copyright', '/ar/about', '/ar']) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.goto(`http://localhost:3000${route}`, { waitUntil: 'domcontentloaded' });
    const top = await page.evaluate(() => {
      const el = document.querySelector('.ez-top');
      if (!el) return null;
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { boxSizing: s.boxSizing, width: s.width, x: r.x };
    });
    console.log(`${route} -> .ez-top:`, top);
    await context.close();
  }
  await browser.close();
}

testOtherRoutes().catch(console.error);
