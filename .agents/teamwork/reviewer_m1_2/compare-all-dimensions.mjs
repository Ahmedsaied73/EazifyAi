import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('d:/EazifyAi/eazifyai-web/package.json');
const { PNG } = require('pngjs');

const baselineDir = 'd:/EazifyAi/eazifyai-web/tests/visual/baseline';
const currentDir = 'd:/EazifyAi/eazifyai-web/tests/visual/current';

const viewports = [390, 768, 1280];
const locales = ['ar', 'en'];
const themes = ['dark', 'light'];

console.log('Comparing dimensions across all 12 combinations:');
for (const vp of viewports) {
  for (const locale of locales) {
    for (const theme of themes) {
      const file = `privacy-${locale}-${theme}-${vp}.png`;
      const bp = path.join(baselineDir, file);
      const cp = path.join(currentDir, file);
      
      const bImg = fs.existsSync(bp) ? PNG.sync.read(fs.readFileSync(bp)) : null;
      const cImg = fs.existsSync(cp) ? PNG.sync.read(fs.readFileSync(cp)) : null;
      
      console.log(`${file}: baseline=${bImg ? `${bImg.width}x${bImg.height}` : 'N/A'}, current=${cImg ? `${cImg.width}x${cImg.height}` : 'N/A'}`);
    }
  }
}
