// Capture the scroll-linked pricing scatter at several scroll positions.
// Usage: node scripts/scatter-check.mjs [outDir] [width]
import puppeteer from 'puppeteer-core';

const outDir = process.argv[2] || '.';
const width = Number(process.argv[3] || 1920);
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
await page.setViewport({ width, height: 1000 });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

// grid top position as a fraction of viewport height
for (const frac of [0.62, 0.2]) {
  await page.evaluate((f) => {
    const grid = document.querySelector('[data-scatter]');
    const top = grid.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top - window.innerHeight * f, behavior: 'instant' });
  }, frac);
  await sleep(250);
  const info = await page.evaluate(() =>
    [...document.querySelectorAll('[data-scatter-item]')].map((c) => c.style.transform || 'none').join(' | '),
  );
  console.log(`top@${frac}: ${info}`);
  await page.screenshot({ path: `${outDir}/scatter-${width}-${String(frac).replace('.', '')}.png` });
}
await browser.close();
