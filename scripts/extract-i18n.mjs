// Extract all data-i18n strings from the HTML sources into src/i18n/en.json, then build
// src/i18n/bn.json from: (1) the official Rxly Bangla strings (design/i18n/bn-official.json,
// keyed by English text, exported from the live app) and (2) src/i18n/bn.manual.json overrides.
// Usage: node scripts/extract-i18n.mjs
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const files = ['index.html', ...['src/sections', 'src/partials'].flatMap((d) =>
  existsSync(d) ? readdirSync(d).filter((f) => f.endsWith('.html')).map((f) => join(d, f)) : [])];

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const norm = (s) => decode(s).replace(/\s+/g, ' ').trim();

const en = {};
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<([a-z0-9]+)[^>]*\sdata-i18n="([^"]+)"[^>]*>([^<]*)</gi)) {
    const [, , key, text] = m;
    const value = norm(text);
    if (en[key] && en[key] !== value) console.warn(`! key "${key}" has two different texts:\n   "${en[key]}"\n   "${value}"`);
    en[key] = value;
  }
}

const official = JSON.parse(readFileSync('design/i18n/bn-official.json', 'utf8'));
const manualPath = 'src/i18n/bn.manual.json';
const manual = existsSync(manualPath) ? JSON.parse(readFileSync(manualPath, 'utf8')) : {};

// Official dict is keyed by English source text; try exact, then without trailing punctuation.
const lookup = (text) => official[text] ?? official[text.replace(/[.:]$/, '')] ?? null;

const bn = {};
const missing = [];
for (const [key, text] of Object.entries(en)) {
  const v = manual[key] ?? lookup(text);
  if (v !== null && v !== undefined) bn[key] = v;
  else missing.push(key);
}

const sort = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync('src/i18n/en.json', JSON.stringify(sort(en), null, 2) + '\n');
writeFileSync('src/i18n/bn.json', JSON.stringify(sort(bn), null, 2) + '\n');
console.log(`en: ${Object.keys(en).length} keys | bn: ${Object.keys(bn).length} (official ${Object.keys(bn).length - Object.keys(manual).filter((k) => k in en).length}, manual ${Object.keys(manual).filter((k) => k in en).length}) | missing: ${missing.length}`);
if (missing.length) console.log('MISSING:\n' + missing.map((k) => `  ${k}: ${en[k]}`).join('\n'));
