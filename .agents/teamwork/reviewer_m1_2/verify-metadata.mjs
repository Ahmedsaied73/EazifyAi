import fs from 'node:fs';

const arHtml = fs.readFileSync('d:/EazifyAi/eazifyai-web/.next/server/app/ar/privacy.html', 'utf8');
const enHtml = fs.readFileSync('d:/EazifyAi/eazifyai-web/.next/server/app/en/privacy.html', 'utf8');

function extractMeta(html) {
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const desc = html.match(/<meta name="description" content="(.*?)"\/>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="(.*?)"\/>/)?.[1];
  const ogTitle = html.match(/<meta property="og:title" content="(.*?)"\/>/)?.[1];
  const ogDesc = html.match(/<meta property="og:description" content="(.*?)"\/>/)?.[1];
  const twTitle = html.match(/<meta name="twitter:title" content="(.*?)"\/>/)?.[1];
  const twCard = html.match(/<meta name="twitter:card" content="(.*?)"\/>/)?.[1];
  return { title, desc, canonical, ogTitle, ogDesc, twTitle, twCard };
}

console.log('AR HTML Metadata:\n', JSON.stringify(extractMeta(arHtml), null, 2));
console.log('EN HTML Metadata:\n', JSON.stringify(extractMeta(enHtml), null, 2));
