import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('d:/EazifyAi/eazifyai-web/package.json');
const { PNG } = require('pngjs');

const baselinePath = 'd:/EazifyAi/eazifyai-web/tests/visual/baseline/privacy-en-dark-390.png';
const currentPath = 'd:/EazifyAi/eazifyai-web/tests/visual/current/privacy-en-dark-390.png';
const arBaselinePath = 'd:/EazifyAi/eazifyai-web/tests/visual/baseline/privacy-ar-dark-390.png';

const bImg = PNG.sync.read(fs.readFileSync(baselinePath));
const cImg = PNG.sync.read(fs.readFileSync(currentPath));
const arImg = PNG.sync.read(fs.readFileSync(arBaselinePath));

console.log('baseline EN height:', bImg.height);
console.log('current EN height:', cImg.height);
console.log('baseline AR height:', arImg.height);

// Compare baseline EN with baseline AR!
let diffWithAr = 0;
const minH = Math.min(bImg.height, arImg.height);
for (let y = 0; y < minH; y++) {
  for (let x = 0; x < bImg.width; x++) {
    const idx = (bImg.width * y + x) << 2;
    const rDiff = Math.abs(bImg.data[idx] - arImg.data[idx]);
    const gDiff = Math.abs(bImg.data[idx+1] - arImg.data[idx+1]);
    const bDiff = Math.abs(bImg.data[idx+2] - arImg.data[idx+2]);
    if (rDiff > 30 || gDiff > 30 || bDiff > 30) {
      diffWithAr++;
    }
  }
}

console.log('Diff between baseline EN and baseline AR:', diffWithAr, 'pixels', ((diffWithAr / (bImg.width * minH)) * 100).toFixed(2) + '%');
