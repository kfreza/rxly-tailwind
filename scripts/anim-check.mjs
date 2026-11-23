// Check that the Figma scene animations load and play (motion enabled).
// Usage: node scripts/anim-check.mjs [outDir]
import puppeteer from 'puppeteer-core';

const outDir = process.argv[2] || '.';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
await page.evaluate(() => document.querySelector('#product .scene').scrollIntoView({ block: 'center' }));
await sleep(500);
const loaded = await page.evaluate(() => [...document.styleSheets].some((s) => /motion/.test(s.href || '')));
console.log('motion css loaded:', loaded);

for (const t of [1, 2]) {
  await sleep(t === 1 ? 1200 : 3000);
  const scenes = await page.$$('[data-scene]');
  for (let i = 0; i < scenes.length; i++) await scenes[i].screenshot({ path: `${outDir}/anim-${i}-t${t}.png` });
  const state = await page.evaluate(() =>
    [...document.querySelectorAll('[data-scene]')].map((s) => {
      const m = s.querySelector('[data-m]');
      return `${s.classList.contains('is-playing') ? 'playing' : 'paused'}/${getComputedStyle(m).animationName.split(',')[0]}/${getComputedStyle(m).opacity}`;
    }),
  );
  console.log(`t${t}:`, state.join(' | '));
}
await browser.close();
