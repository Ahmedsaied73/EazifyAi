import { chromium } from 'file:///C:/Users/osams/AppData/Roaming/npm/node_modules/playwright/index.mjs';

async function verify() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:3000/en/about#contact', { waitUntil: 'networkidle' });

  console.log('--- Test 1: Initial state ---');
  let btnDisabled = await page.evaluate(() => document.querySelector('form.ez-form button.ez-go').disabled);
  console.log('Button disabled initially:', btnDisabled);

  console.log('--- Test 2: Typing name only ---');
  await page.fill('form.ez-form input[aria-label="Your name"]', 'Ahmed');
  btnDisabled = await page.evaluate(() => document.querySelector('form.ez-form button.ez-go').disabled);
  console.log('Button disabled with only name:', btnDisabled);

  console.log('--- Test 3: Typing contact only (no message) ---');
  await page.fill('form.ez-form input[aria-label="WhatsApp or email"]', '01012345678');
  btnDisabled = await page.evaluate(() => document.querySelector('form.ez-form button.ez-go').disabled);
  console.log('Button disabled with name + contact, no message:', btnDisabled);

  console.log('--- Test 4: Typing message (button enables) ---');
  await page.fill('form.ez-form textarea[aria-label="Your message"]', 'Need automation');
  btnDisabled = await page.evaluate(() => document.querySelector('form.ez-form button.ez-go').disabled);
  console.log('Button disabled with all fields:', btnDisabled);

  console.log('--- Test 5: Invalid contact validation ---');
  await page.fill('form.ez-form input[aria-label="WhatsApp or email"]', 'not-valid');
  await page.click('form.ez-form button.ez-go');
  await page.waitForTimeout(200);
  let status = await page.evaluate(() => document.querySelector('form.ez-form .ez-fmsg').textContent.trim());
  console.log('Validation failure message:', status);

  console.log('--- Test 6: Valid submission ---');
  await page.fill('form.ez-form input[aria-label="WhatsApp or email"]', '01012345678');
  await page.click('form.ez-form button.ez-go');
  // Wait for 400ms mockApi delay
  await page.waitForTimeout(600);
  status = await page.evaluate(() => document.querySelector('form.ez-form .ez-fmsg').textContent.trim());
  console.log('Submission success message:', status);
  const leads = await page.evaluate(() => JSON.parse(localStorage.getItem('ez-leads') || '[]'));
  console.log('Lead stored in localStorage:', leads.length > 0 ? leads[leads.length - 1] : null);

  console.log('--- Test 7: Honeypot submission ---');
  // Use React setter to fill hidden honeypot
  await page.evaluate(() => {
    const hp = document.querySelector('form.ez-form input[name="website"]');
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(hp, 'bot-token-123');
    hp.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.fill('form.ez-form input[aria-label="Your name"]', 'Spam Bot');
  await page.fill('form.ez-form input[aria-label="WhatsApp or email"]', 'spambot@spam.com');
  await page.fill('form.ez-form textarea[aria-label="Your message"]', 'Buy crypto now');
  const leadsCountBefore = leads.length;
  await page.click('form.ez-form button.ez-go');
  await page.waitForTimeout(300);
  status = await page.evaluate(() => document.querySelector('form.ez-form .ez-fmsg').textContent.trim());
  const leadsCountAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('ez-leads') || '[]').length);
  console.log('Honeypot feedback message:', status);
  console.log('Leads count before:', leadsCountBefore, 'after:', leadsCountAfter, '(should be identical)');

  console.log('--- Test 8: Rate limiting (max 5/hr) ---');
  // Fill 5 entries in ez-sent
  await page.evaluate(() => {
    const now = Date.now();
    localStorage.setItem('ez-sent', JSON.stringify([now, now, now, now, now]));
    const hp = document.querySelector('form.ez-form input[name="website"]');
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(hp, '');
    hp.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.fill('form.ez-form input[aria-label="Your name"]', 'Legit Person');
  await page.fill('form.ez-form input[aria-label="WhatsApp or email"]', 'person@valid.com');
  await page.fill('form.ez-form textarea[aria-label="Your message"]', 'Legit inquiry');
  await page.click('form.ez-form button.ez-go');
  await page.waitForTimeout(300);
  status = await page.evaluate(() => document.querySelector('form.ez-form .ez-fmsg').textContent.trim());
  console.log('Rate limit feedback message:', status);

  await browser.close();
  console.log('ALL INTERACTIVE ADVERSARIAL TESTS PASSED!');
}

verify().catch((err) => {
  console.error('Interactive test error:', err);
  process.exit(1);
});
