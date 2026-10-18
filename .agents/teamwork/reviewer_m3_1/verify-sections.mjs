import { chromium } from 'file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs';

async function verifySections() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3000/ar/about', { waitUntil: 'networkidle' });

  console.log('--- Section 1: Hero (.ez-abhero) ---');
  const hero = await page.evaluate(() => {
    const el = document.querySelector('.ez-abhero');
    const o1 = el.querySelector('.ez-orb.ez-o1');
    const o2 = el.querySelector('.ez-orb.ez-o2');
    const logo = el.querySelector('svg.lg');
    const h1 = el.querySelector('h1');
    const sub = el.querySelector('.ez-sub');
    const chips = Array.from(el.querySelectorAll('.ez-abchips span'));
    return {
      exists: !!el,
      o1: !!o1,
      o2: !!o2,
      logo: !!logo,
      h1: h1?.textContent.trim(),
      sub: sub?.textContent.trim(),
      chipsCount: chips.length,
      chipDelays: chips.map((c) => window.getComputedStyle(c).animationDelay),
    };
  });
  console.log('Hero:', JSON.stringify(hero, null, 2));

  console.log('--- Section 2: Who We Are (.ez-who) ---');
  const who = await page.evaluate(() => {
    const el = document.querySelector('.ez-who');
    const pEls = Array.from(el.querySelectorAll('p'));
    return {
      exists: !!el,
      paragraphsCount: pEls.length,
      firstIsLead: pEls[0]?.classList.contains('lead'),
      firstTextSnippet: pEls[0]?.textContent.trim().slice(0, 30),
    };
  });
  console.log('Who:', JSON.stringify(who, null, 2));

  console.log('--- Section 3: Comparison Cards (.ez-yn) ---');
  const yn = await page.evaluate(() => {
    const el = document.querySelector('.ez-yn');
    const yCard = el.querySelector('.ez-card.ez-y');
    const nCard = el.querySelector('.ez-card.ez-n');
    const yChecks = yCard.querySelectorAll('ul li svg.ez-yi path');
    const nCrosses = nCard.querySelectorAll('ul li svg.ez-yi path');
    return {
      exists: !!el,
      yTitle: yCard.querySelector('h3')?.textContent.trim(),
      yCount: yChecks.length,
      yCheckPathD: yChecks[0]?.getAttribute('d'),
      nTitle: nCard.querySelector('h3')?.textContent.trim(),
      nCount: nCrosses.length,
      nCrossPathD: nCrosses[0]?.getAttribute('d'),
    };
  });
  console.log('Comparison (.ez-yn):', JSON.stringify(yn, null, 2));

  console.log('--- Section 4: 4-Step Timeline (ol.ez-tl.ez-num) ---');
  const tl = await page.evaluate(() => {
    const ol = document.querySelector('ol.ez-tl.ez-num');
    const items = Array.from(ol.querySelectorAll('li'));
    return {
      exists: !!ol,
      stepsCount: items.length,
      nodes: items.map((li) => li.querySelector('.ez-node')?.textContent.trim()),
      titles: items.map((li) => li.querySelector('b')?.textContent.trim()),
    };
  });
  console.log('Timeline:', JSON.stringify(tl, null, 2));

  console.log('--- Section 5: AI Card (.ez-ai) ---');
  const ai = await page.evaluate(() => {
    const el = document.querySelector('.ez-card.ez-ai');
    return {
      exists: !!el,
      title: el.querySelector('h2')?.textContent.trim(),
      p: el.querySelector('p')?.textContent.trim(),
    };
  });
  console.log('AI Card:', JSON.stringify(ai, null, 2));

  console.log('--- Section 6: Founder Block (.ez-founder) ---');
  const founder = await page.evaluate(() => {
    const el = document.querySelector('.ez-founder');
    const photo = el.querySelector('.ez-fphoto');
    const ring = photo.querySelector('.ez-fring');
    const ringAnim = window.getComputedStyle(ring).animationName;
    const img = photo.querySelector('.ez-fimg img');
    const fph = photo.querySelector('.ez-fimg .ez-fph');
    const tags = Array.from(photo.querySelectorAll('.ez-ftag'));
    const bio = el.querySelector('.ez-fbio');
    const flab = bio.querySelector('.ez-flab');
    const fh2 = bio.querySelector('h2');
    const frole = bio.querySelector('.ez-frole');
    const dashedPh = bio.querySelector('.ez-ph');
    return {
      exists: !!el,
      ringAnim,
      imgHidden: img?.hidden,
      fallbackVisible: !!fph,
      fallbackText: fph?.querySelector('span')?.textContent.trim(),
      tagsCount: tags.length,
      tagsText: tags.map((t) => t.textContent.trim()),
      flabText: flab?.textContent.trim(),
      nameText: fh2?.textContent.trim(),
      roleText: frole?.textContent.trim(),
      dashedPlaceholder: !!dashedPh,
    };
  });
  console.log('Founder Block:', JSON.stringify(founder, null, 2));

  console.log('--- Section 7: Reduced Motion Verification ---');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const reduced = await page.evaluate(() => {
    const ring = document.querySelector('.ez-fring');
    const tag = document.querySelector('.ez-ftag');
    const chip = document.querySelector('.ez-abchips span');
    return {
      ringAnim: window.getComputedStyle(ring).animationName,
      tagAnim: window.getComputedStyle(tag).animationName,
      chipAnim: window.getComputedStyle(chip).animationName,
    };
  });
  console.log('Reduced motion check:', JSON.stringify(reduced, null, 2));

  await browser.close();
  console.log('ALL SECTION AND DOM CHECKS COMPLETE!');
}

verifySections().catch((err) => {
  console.error('Section verification error:', err);
  process.exit(1);
});
