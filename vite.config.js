import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

/**
 * Tiny HTML include: <!-- @include sections/hero.html -->
 * Keeps each landing-page section in its own file (easy to port to React later).
 */
function htmlInclude() {
  const pattern = /<!--\s*@include\s+([\w./-]+)\s*-->/g;
  const expand = (html, depth = 0) =>
    depth > 5
      ? html
      : html.replace(pattern, (_, file) =>
          expand(readFileSync(resolve(root, 'src', file), 'utf8'), depth + 1),
        );

  return {
    name: 'html-include',
    transformIndexHtml: { order: 'pre', handler: (html) => expand(html) },
    handleHotUpdate({ file, server }) {
      if (file.endsWith('.html')) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  plugins: [htmlInclude(), tailwindcss()],
});
