import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire('d:/EazifyAi/eazifyai-web/package.json');
const { PNG } = require('pngjs');
const pm = require('pixelmatch');
const pixelmatch = pm.default || pm;

const base = PNG.sync.read(fs.readFileSync('d:/EazifyAi/eazifyai-web/tests/visual/baseline/privacy-ar-dark-1280.png'));
const curr = PNG.sync.read(fs.readFileSync('d:/EazifyAi/eazifyai-web/tests/visual/current/privacy-ar-dark-1280.png'));

const width = Math.min(base.width, curr.width);
const height = Math.min(base.height, curr.height);

const bUnif = new PNG({ width, height });
const cUnif = new PNG({ width, height });
const diff = new PNG({ width, height });

PNG.bitblt(base, bUnif, 0, 0, width, height, 0, 0);
PNG.bitblt(curr, cUnif, 0, 0, width, height, 0, 0);

pixelmatch(bUnif.data, cUnif.data, diff.data, width, height, { threshold: 0.15 });

function countDiff(x0, y0, x1, y1) {
  let count = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = (width * y + x) << 2;
      if (diff.data[idx] === 255 && diff.data[idx+1] === 0) {
        count++;
      }
    }
  }
  return count;
}

console.log('Total diff pixels:', countDiff(0, 0, width, height), 'out of', width * height, `(${((countDiff(0, 0, width, height) / (width * height))*100).toFixed(4)}%)`);
console.log('Navbar (y: 0..80):', countDiff(0, 0, width, 80));
console.log('Header (y: 80..350):', countDiff(0, 80, width, 350));
console.log('TOC region (RTL right column, x: 820..1160, y: 350..1200):', countDiff(820, 350, 1160, 1200));
console.log('Main Body text (y: 350..height):', countDiff(0, 350, width, height));
