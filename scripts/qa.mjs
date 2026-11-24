// Interaction QA against the production preview (npm run build && npm run preview).
// Usage: node scripts/qa.mjs [url]
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://localhost:4173/';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const results = [];
const check = (name, ok, info = '') => results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? ' — ' + info : ''}`);

async function run(width) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await page.setViewport({ width, height: 900, isMobile: width < 768, hasTouch: width < 768 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle0' });
  const tag = `[${width}]`;

  // Tabs
  await page.click('#tab-pad');
  const tab = await page.evaluate(() => ({
    sel: document.querySelector('#tab-pad').getAttribute('aria-selected'),
    padHidden: document.querySelector('#panel-pad').hidden,
    deskHidden: document.querySelector('#panel-desk').hidden,
  }));
  check(`${tag} tabs switch to Prescription pad`, tab.sel === 'true' && !tab.padHidden && tab.deskHidden);
  await page.focus('#tab-pad');
  await page.keyboard.press('ArrowRight');
  check(`${tag} tabs arrow-key navigation`, await page.evaluate(() => document.activeElement.id === 'tab-phone' && !document.querySelector('#panel-phone').hidden));

  // Accordion
  await page.click('#faq-q-texts');
  const acc = await page.evaluate(() => ({
    open: !document.querySelector('#faq-a-texts').inert,
    firstClosed: document.querySelector('#faq-a-serial').inert,
    expanded: document.querySelector('#faq-q-texts').getAttribute('aria-expanded'),
  }));
  check(`${tag} FAQ opens one item and closes the other`, acc.open && acc.firstClosed && acc.expanded === 'true');

  // Pricing toggle
  const visiblePrice = () => page.evaluate(() => [...document.querySelectorAll('.plan__price')].filter((e) => e.offsetParent).map((e) => e.textContent.trim().replace(/\s+/g, ' '))[0]);
  const monthly = await visiblePrice();
  await page.click('[data-billing-option="yearly"]');
  const yearly = await visiblePrice();
  check(`${tag} pricing toggle`, monthly.includes('1,000') && yearly.includes('10,000'), `${monthly} → ${yearly}`);
  await page.click('[data-billing-option="monthly"]');

  // Mobile menu
  if (width < 1200) {
    await page.click('[data-menu-open]');
    const opened = await page.evaluate(() => !document.querySelector('[data-menu]').hidden);
    await page.keyboard.press('Escape');
    const closed = await page.evaluate(() => document.querySelector('[data-menu]').hidden && document.activeElement.matches('[data-menu-open]'));
    check(`${tag} mobile menu opens and closes with Esc (focus restored)`, opened && closed);
  }

  // Language switch
  const toggle = width < 768 ? '[data-menu] [data-lang-toggle]' : 'header nav [data-lang-toggle]';
  if (width < 768) await page.click('[data-menu-open]');
  await page.click(toggle);
  const bn = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    h1: document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim(),
    stored: localStorage.getItem('rxly-lang'),
    price: document.querySelector('[data-i18n="pricing.solo_m"]').textContent,
  }));
  check(`${tag} switch to Bangla`, bn.lang === 'bn' && /ক্লিনিক/.test(bn.h1) && bn.stored === 'bn' && bn.price === '৳১,০০০', bn.h1);
  await page.reload({ waitUntil: 'networkidle0' });
  check(`${tag} Bangla persists after reload`, await page.evaluate(() => document.documentElement.lang === 'bn'));
  if (width < 768) await page.click('[data-menu-open]');
  await page.click(toggle);
  check(`${tag} back to English`, await page.evaluate(() => document.documentElement.lang === 'en' && /Run your clinic/.test(document.querySelector('h1').textContent)));

  // Anchors exist
  const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')).filter((h) => h !== '#' && !document.querySelector(h)));
  check(`${tag} all in-page anchors resolve`, missing.length === 0, missing.join(', '));

  // Images
  const broken = await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 800));
    return [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.getAttribute('src'));
  });
  check(`${tag} no broken images`, broken.length === 0, broken.join(', '));

  check(`${tag} no console/network errors`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await page.close();
}

for (const w of [390, 834, 1280, 1920]) await run(w);
await browser.close();
console.log(results.join('\n'));
process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0;
