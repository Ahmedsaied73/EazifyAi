import { chromium } from 'file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs';

async function checkFontsDetail() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/ar/privacy', { waitUntil: 'domcontentloaded' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  const res = await page.evaluate(() => {
    const fontFaces = Array.from(document.fonts).map(f => ({
      family: f.family,
      weight: f.weight,
      status: f.status,
    }));
    return {
      totalFontFaces: fontFaces.length,
      fontFaces: fontFaces.slice(0, 10),
      checkArText: document.fonts.check("400 16px 'IBM Plex Sans Arabic'", "الخصوصية"),
      checkGeist: document.fonts.check("400 16px Geist", "Privacy"),
    };
  });
  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

checkFontsDetail().catch(console.error);
