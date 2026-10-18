import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire('d:/EazifyAi/eazifyai-web/package.json');
const { PNG } = require('pngjs');

const baselineDir = 'd:/EazifyAi/eazifyai-web/tests/visual/baseline';

const files = [
  'privacy-ar-dark-390.png',
  'privacy-ar-light-390.png',
  'privacy-en-dark-390.png',
  'privacy-en-light-390.png',
  'privacy-ar-dark-1280.png',
  'privacy-en-dark-1280.png',
];

for (const file of files) {
  const filePath = path.join(baselineDir, file);
  if (fs.existsSync(filePath)) {
    const png = PNG.sync.read(fs.readFileSync(filePath));
    console.log(`${file}: width=${png.width}, height=${png.height}`);
  } else {
    console.log(`${file}: NOT FOUND`);
  }
}
