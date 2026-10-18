import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire('d:/EazifyAi/eazifyai-web/package.json');
const { PNG } = require('pngjs');

const enBase = PNG.sync.read(fs.readFileSync('d:/EazifyAi/eazifyai-web/tests/visual/baseline/privacy-en-dark-390.png'));
const arBase = PNG.sync.read(fs.readFileSync('d:/EazifyAi/eazifyai-web/tests/visual/baseline/privacy-ar-dark-390.png'));
const enCurr = PNG.sync.read(fs.readFileSync('d:/EazifyAi/eazifyai-web/tests/visual/current/privacy-en-dark-390.png'));

// Check how many non-background pixels differ between enBase and arBase
// Let's sample sections in the body, say between y = 600 and y = 2000
let bodySame = 0;
let bodyTotal = 0;
let bodyDiff = 0;

for (let y = 600; y < 2000; y++) {
  for (let x = 0; x < 390; x++) {
    const idx = (enBase.width * y + x) << 2;
    // Check if it's text pixel (not background #101010 or #000000)
    const isEnBaseText = enBase.data[idx] > 30 || enBase.data[idx+1] > 30 || enBase.data[idx+2] > 30;
    const isArBaseText = arBase.data[idx] > 30 || arBase.data[idx+1] > 30 || arBase.data[idx+2] > 30;
    
    if (isEnBaseText || isArBaseText) {
      bodyTotal++;
      if (Math.abs(enBase.data[idx] - arBase.data[idx]) < 15 &&
          Math.abs(enBase.data[idx+1] - arBase.data[idx+1]) < 15 &&
          Math.abs(enBase.data[idx+2] - arBase.data[idx+2]) < 15) {
        bodySame++;
      } else {
        bodyDiff++;
      }
    }
  }
}

console.log('Body text pixels sample (y: 600..2000):');
console.log('Total text pixels in baseline EN/AR:', bodyTotal);
console.log('Exact matching text pixels between baseline EN and baseline AR:', bodySame, `(${((bodySame/bodyTotal)*100).toFixed(1)}%)`);
console.log('Differing text pixels between baseline EN and baseline AR:', bodyDiff, `(${((bodyDiff/bodyTotal)*100).toFixed(1)}%)`);
