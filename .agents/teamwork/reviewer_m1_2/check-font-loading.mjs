import { chromium } from 'file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs';

async function checkFonts() {
  const browser = await chromium.launch();
  for (const locale of ['ar', 'en']) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(`http://localhost:3000/${locale}/privacy`, { waitUntil: 'domcontentloaded' });
    
    const initialStatus = await page.evaluate(() => document.fonts.status);
    
    const fontReadyTime = await page.evaluate(async () => {
      const start = performance.now();
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
      return {
        elapsed: performance.now() - start,
        status: document.fonts.status,
        geistLoaded: document.fonts.check('16px Geist'),
        arabicLoaded: document.fonts.check('16px "IBM Plex Sans Arabic"'),
      };
    });
    
    console.log(`${locale} font check:`, fontReadyTime);
    await page.close();
  }
  await browser.close();
}

checkFonts().catch(console.error);
