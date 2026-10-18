import { readFileSync } from 'node:fs';

const css = readFileSync('d:/EazifyAi/eazifyai-web/scripts/site-layer.css', 'utf8');

function clean(s) { return s.replace(/\s+/g, ' ').trim(); }

const re = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)\s*\{/g;
let match;
let count = 0;
const blocks = [];

while ((match = re.exec(css)) !== null) {
  count++;
  const start = match.index;
  const lineNum = css.slice(0, start).split('\n').length;
  const origLineNum = lineNum + 114;
  const open = css.indexOf('{', start);
  let depth = 1;
  let j = open + 1;
  while (j < css.length && depth) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}') depth--;
    j++;
  }
  const body = css.slice(open + 1, j - 1);
  blocks.push({
    index: count,
    layerLine: lineNum,
    origLine: origLineNum,
    body: clean(body)
  });
}

console.log(JSON.stringify(blocks, null, 2));
