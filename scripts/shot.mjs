// QA screenshots with real viewport emulation (uses your installed Chrome).
// Usage: node scripts/shot.mjs <width> <out.png> [url] [--motion] [--lang=bn] [--click=selector] [--el=selector] [--wait=ms]
import puppeteer from 'puppeteer-core';

const [width = '390', out = 'shot.png', url = 'http://localhost:4173/'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const flags = process.argv.filter((a) => a.startsWith('--'));
const lang = flags.find((f) => f.startsWith('--lang='))?.split('=')[1];
const click = flags.find((f) => f.startsWith('--click='))?.slice(8);
const el = flags.find((f) => f.startsWith('--el='))?.slice(5);
const wait = Number(flags.find((f) => f.startsWith('--wait='))?.slice(7) || 600);
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
const w = Number(width);
await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 768, hasTouch: w < 768 });
if (!flags.includes('--motion')) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
if (lang) await page.evaluateOnNewDocument((l) => localStorage.setItem('rxly-lang', l), lang);
await page.goto(url, { waitUntil: 'networkidle0' });
// trigger lazy images + reveal
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
  window.scrollTo(0, 0);
  document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
});
if (click) await page.click(click);
if (el) await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'start', behavior: 'instant' }), el);
await new Promise((r) => setTimeout(r, wait));
const overflow = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width && (r.right > vw + 1) && getComputedStyle(el).position !== 'fixed'; })
    .filter((el) => !el.closest('[aria-hidden="true"], .pointer-events-none, [role="tablist"]'))
    .slice(0, 8).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 3).join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
});
if (el) await (await page.$(el)).screenshot({ path: out });
else await page.screenshot({ path: out, fullPage: true });
const h = await page.evaluate(() => document.documentElement.scrollHeight);
console.log(JSON.stringify({ width: w, height: h, overflowingElements: overflow }, null, 1));
await browser.close();
