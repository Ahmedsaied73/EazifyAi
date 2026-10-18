import { chromium } from 'file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('d:/EazifyAi/eazifyai-web/package.json');
const { PNG } = require('pngjs');
const pmModule = require('pixelmatch');
const pixelmatch = pmModule.default || pmModule;

const BASE_URL = 'http://localhost:3000';
const BASELINE_DIR = path.resolve('d:/EazifyAi/eazifyai-web/tests/visual/baseline');
const OUT_DIR = path.resolve('d:/EazifyAi/eazifyai-web/tests/visual/current_fresh');
const DIFF_DIR = path.resolve('d:/EazifyAi/eazifyai-web/tests/visual/diff_fresh');

[OUT_DIR, DIFF_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];
const locales = ['ar', 'en'];
const themes = ['dark', 'light'];

async function test() {
  const browser = await chromium.launch();
  for (const vp of viewports) {
    for (const locale of locales) {
      for (const theme of themes) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: 1,
        });

        await context.addInitScript(
          ({ l, th }) => {
            try {
              window.localStorage.setItem('ez-lang', l);
              window.localStorage.setItem('ez-theme', th);
            } catch {}
          },
          { l: locale, th: theme },
        );

        const page = await context.newPage();
        const targetUrl = `${BASE_URL}/${locale}/privacy`;
        const filename = `privacy-${locale}-${theme}-${vp.width}.png`;
        const currentPath = path.join(OUT_DIR, filename);
        const baselinePath = path.join(BASELINE_DIR, filename);
        const diffPath = path.join(DIFF_DIR, filename);

        try {
          await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.evaluate((th) => {
            document.documentElement.dataset.theme = th;
            document.documentElement.style.colorScheme = th;
          }, theme);
          // Wait for fonts & rendering
          await page.waitForTimeout(1000);

          await page.screenshot({ path: currentPath, fullPage: true });

          if (!fs.existsSync(baselinePath)) {
            console.warn('Baseline missing:', filename);
            continue;
          }

          const imgBaseline = PNG.sync.read(fs.readFileSync(baselinePath));
          const imgCurrent = PNG.sync.read(fs.readFileSync(currentPath));

          const width = Math.min(imgBaseline.width, imgCurrent.width);
          const height = Math.min(imgBaseline.height, imgCurrent.height);

          const baseUniform = new PNG({ width, height });
          const currUniform = new PNG({ width, height });
          PNG.bitblt(imgBaseline, baseUniform, 0, 0, width, height, 0, 0);
          PNG.bitblt(imgCurrent, currUniform, 0, 0, width, height, 0, 0);

          const diff = new PNG({ width, height });
          const numDiffPixels = pixelmatch(
            baseUniform.data,
            currUniform.data,
            diff.data,
            width,
            height,
            { threshold: 0.1 },
          );

          const totalPixels = width * height;
          const diffRatio = (numDiffPixels / totalPixels) * 100;

          fs.writeFileSync(diffPath, PNG.sync.write(diff));
          console.log(`${filename}: diff=${diffRatio.toFixed(4)}% (${numDiffPixels} / ${totalPixels} px), dimB=${imgBaseline.width}x${imgBaseline.height}, dimC=${imgCurrent.width}x${imgCurrent.height}`);
        } catch (err) {
          console.error(`Error on ${filename}:`, err.message);
        } finally {
          await context.close();
        }
      }
    }
  }
  await browser.close();
}

test().catch(console.error);
