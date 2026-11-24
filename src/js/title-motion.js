// Section title entrances — see styles/title-motion.css for the eight animations.
// Splits each [data-title-anim] title into words (or letters for "wave") *inside* its translatable
// spans, always keeping the blue highlighted word (.mark / the CTA's underlined span) whole.
// Bangla titles are split by word only, so conjuncts never break. Plays once in view (or once
// scrolled past), checked on every scroll frame.
const SPLIT = { rise: 'masked', blur: 'words', wave: 'chars', flip: 'words', track: 'chars' };

const isHighlight = (el) => el.classList?.contains('mark') || !!el.querySelector?.(':scope > img, :scope > svg');

function splitText(textNode, mode, counter) {
  const frag = document.createDocumentFragment();
  textNode.textContent.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      frag.appendChild(document.createTextNode(part));
      return;
    }
    if (mode === 'chars') {
      const word = document.createElement('span');
      word.className = 'tm-w';
      for (const ch of part) {
        const c = document.createElement('span');
        c.className = 'tm-c';
        c.textContent = ch;
        c.style.setProperty('--i', counter.n++);
        word.appendChild(c);
      }
      frag.appendChild(word);
      return;
    }
    const w = document.createElement('span');
    w.className = 'tm-w';
    w.textContent = part;
    w.style.setProperty('--i', counter.n++);
    if (mode === 'masked') {
      const m = document.createElement('span');
      m.className = 'tm-mask';
      m.appendChild(w);
      frag.appendChild(m);
    } else frag.appendChild(w);
  });
  textNode.replaceWith(frag);
}

function split(node, mode, counter) {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.textContent.trim()) splitText(child, mode, counter);
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE || /^(br|img|svg)$/i.test(child.tagName)) return;
    if (isHighlight(child)) {
      // the highlighted word moves as one unit
      child.classList.add('tm-hl');
      child.style.setProperty('--i', counter.n++);
      if (mode === 'masked') {
        const m = document.createElement('span');
        m.className = 'tm-mask';
        child.replaceWith(m);
        m.appendChild(child);
        child.classList.add('tm-w');
      }
      return;
    }
    split(child, mode, counter);
  });
}

function prepare(title) {
  const anim = title.dataset.titleAnim;
  let mode = SPLIT[anim];
  if (mode === 'chars' && document.documentElement.lang === 'bn') mode = 'words';
  if (mode) split(title, mode, { n: 0 });
  if (anim === 'track') {
    // Each letter (or the highlighted word, or a Bangla word) gets its place in its line, so the CSS
    // can start it where wide letter-spacing would put it, using transform only: no reflow.
    title.querySelectorAll('.tm-line').forEach((line) => {
      line.querySelectorAll('.tm-c, .tm-w:not(:has(.tm-c)), .tm-hl').forEach((u, i) => u.style.setProperty('--o', i));
    });
  }
  if (anim === 'lines') {
    // one masked line holding the whole title
    const inner = document.createElement('span');
    inner.className = 'tm-in';
    while (title.firstChild) inner.appendChild(title.firstChild);
    const mask = document.createElement('span');
    mask.className = 'tm-mask';
    mask.appendChild(inner);
    title.appendChild(mask);
  }
}

// After the entrance: turn the split pieces back into plain text in place (keeps kerning and
// ligatures exact, and the translatable [data-i18n] spans untouched).
function unsplit(title) {
  title.querySelectorAll('.tm-c').forEach((c) => c.replaceWith(document.createTextNode(c.textContent)));
  title.querySelectorAll('.tm-w').forEach((w) => {
    if (w.classList.contains('mark') || w.querySelector('svg, img')) {
      w.classList.remove('tm-w');
      w.style.removeProperty('--i');
    } else w.replaceWith(document.createTextNode(w.textContent));
  });
  title.querySelectorAll('.tm-mask, .tm-in').forEach((m) => m.replaceWith(...m.childNodes));
  title.querySelectorAll('.tm-hl').forEach((el) => el.classList.remove('tm-hl'));
  title.querySelectorAll('[style]').forEach((el) => {
    el.style.removeProperty('--i');
    el.style.removeProperty('--o');
    if (!el.getAttribute('style')) el.removeAttribute('style');
  });
  title.normalize();
}

export function initTitleMotion() {
  const titles = [...document.querySelectorAll('[data-title-anim]')];
  if (!titles.length) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    titles.forEach((t) => t.classList.add('tm-play'));
    return;
  }
  titles.forEach(prepare);

  // Start the entrance; when every animation in the title has finished, mark it done so the
  // CSS drops the animation layers and the text renders crisp again.
  const finish = (t) => {
    if (t.classList.contains('tm-done')) return;
    t.classList.add('tm-done');
    unsplit(t);
  };
  const play = (t) => {
    t.classList.add('tm-play');
    requestAnimationFrame(() => {
      const running = t.getAnimations({ subtree: true });
      Promise.all(running.map((a) => a.finished.catch(() => {}))).then(() => finish(t));
    });
    setTimeout(() => finish(t), 4000); // safety net
  };

  // Play once a title reaches 88% of the screen height — or if it has already been scrolled past
  // (fast flicks can skip over it between frames), so no title is ever left hidden.
  // (At most eight titles, so checking directly on each scroll event is cheap; no frame wait.)
  let pending = titles.slice();
  const check = () => {
    const line = window.innerHeight * 0.88;
    pending = pending.filter((t) => {
      if (t.getBoundingClientRect().top < line) {
        play(t);
        return false;
      }
      return true;
    });
    if (!pending.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
  const onScroll = () => check();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  check();
}
