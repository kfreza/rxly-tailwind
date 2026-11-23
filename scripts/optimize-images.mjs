// Convert heavy PNG/JPG in public/images (flat folder, <section>-<what>.<ext>) to WebP at 2× their largest display size,
// move the originals to design/source-images/, and rewrite references in src/ + index.html.
// Usage: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdirSync, statSync, readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const PUB = 'public/images';
const SRC_KEEP = 'design/source-images';
const MIN_BYTES = 40 * 1024;
// largest CSS width the image is shown at (px); output = 2× (capped at source width)
const DISPLAY = {
  'faq-dome.png': 467, 'how-stethoscope.png': 293,
  'feature-pad.png': 416, 'feature-cash.png': 416, 'feature-video.png': 538,
  'feature-cash-bg.png': 464, 'feature-glow-card-bg.png': 1300, 'feature-video-bg.png': 586,
  'screens-panel-bg.png': 1440, 'screens-card-waves.png': 554, 'screens-book.png': 200, 'screens-status.png': 200,
  'screens-desk.jpg': 798, 'screens-room.jpg': 798, 'screens-pad.jpg': 798,
  'hero-desk.png': 1174, 'hero-bg-waves.png': 1920, 'cta-bg.png': 1820, 'pricing-bg.png': 1920,
};

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const targets = walk(PUB).filter((f) => /\.(png|jpe?g)$/i.test(f) && statSync(f).size > MIN_BYTES);

const renames = [];
for (const file of targets) {
  const rel = relative(PUB, file).split('\\').join('/');
  const out = file.replace(/\.(png|jpe?g)$/i, '.webp');
  const meta = await sharp(file).metadata();
  const width = Math.min(meta.width, (DISPLAY[rel] ?? 960) * 2);
  await sharp(file).resize({ width, withoutEnlargement: true }).webp({ quality: 80, effort: 6, alphaQuality: 90 }).toFile(out);
  const before = statSync(file).size, after = statSync(out).size;
  const keep = join(SRC_KEEP, rel);
  mkdirSync(dirname(keep), { recursive: true });
  renameSync(file, keep);
  renames.push([`/images/${rel}`, `/images/${rel.replace(/\.(png|jpe?g)$/i, '.webp')}`]);
  console.log(`${rel.padEnd(28)} ${(before / 1024).toFixed(0).padStart(6)} KB -> ${(after / 1024).toFixed(0).padStart(5)} KB  (${width}px)`);
}

const codeFiles = ['index.html', ...walk('src').filter((f) => /\.(html|css|js)$/.test(f))];
for (const f of codeFiles) {
  let s = readFileSync(f, 'utf8'); const orig = s;
  for (const [a, b] of renames) s = s.split(a).join(b);
  if (s !== orig) { writeFileSync(f, s); console.log(`updated refs: ${f}`); }
}
