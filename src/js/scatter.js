// Scroll-linked "scatter" (used on "How it works"): cards start in Figma's fanned stack
// and spread into a row as you scroll.
//
// Markup:
//   <ol data-scatter data-start="0.8" data-end="0.2">
//     <li data-scatter-item data-offset="-100" data-rot="-5" data-y="0" data-z="1">…
//   data-start / data-end: grid top position (fraction of viewport height) where the
//                          spread starts (still stacked) and ends (fully spread)
//   data-offset: px from the container centre while stacked (− = left)
//   data-rot:    degrees while stacked
//   data-y:      px down while stacked
//   data-z:      stacking order while stacked
//
// Runs only from 1200px (cards in one row) and when motion is allowed.
const START = 0.8;
const END = 0.2;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic

export function initScatter() {
  const groups = [...document.querySelectorAll('[data-scatter]')];
  if (!groups.length) return;

  const desktop = window.matchMedia('(min-width: 75rem)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = groups.map((el) => ({ el, items: [...el.querySelectorAll('[data-scatter-item]')], dx: [] }));
  let ticking = false;

  const reset = () =>
    state.forEach(({ el, items }) => {
      el.removeAttribute('data-scattering');
      items.forEach((it) => {
        it.style.removeProperty('transform');
        it.style.removeProperty('z-index');
      });
    });

  // Distance from each card's resting centre to the stacked position (measured without transforms).
  const measure = () =>
    state.forEach((s) => {
      s.items.forEach((it) => it.style.removeProperty('transform'));
      const box = s.el.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      s.dx = s.items.map((it) => {
        const r = it.getBoundingClientRect();
        return mid + Number(it.dataset.offset || 0) - (r.left + r.width / 2);
      });
    });

  const render = () => {
    ticking = false;
    const vh = window.innerHeight;
    state.forEach(({ el, items, dx }) => {
      const top = el.getBoundingClientRect().top;
      const start = Number(el.dataset.start ?? START);
      const end = Number(el.dataset.end ?? END);
      const p = ease(clamp((vh * start - top) / (vh * (start - end)), 0, 1));
      const k = 1 - p; // 1 = stacked (Figma fan), 0 = spread
      el.toggleAttribute('data-scattering', k > 0.001);
      items.forEach((it, i) => {
        const rot = Number(it.dataset.rot || 0) * k;
        const y = Number(it.dataset.y || 0) * k;
        it.style.transform = k > 0.001 ? `translate3d(${(dx[i] * k).toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)` : '';
        it.style.zIndex = k > 0.001 ? it.dataset.z || '' : '';
      });
    });
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  };

  let active = false;
  const update = () => {
    const should = desktop.matches && !reduced.matches;
    if (should && !active) {
      active = true;
      measure();
      render();
      window.addEventListener('scroll', onScroll, { passive: true });
    } else if (!should && active) {
      active = false;
      window.removeEventListener('scroll', onScroll);
      reset();
    } else if (should) {
      measure();
      render();
    }
  };

  desktop.addEventListener('change', update);
  reduced.addEventListener('change', update);
  window.addEventListener('resize', () => active && (measure(), render()), { passive: true });
  update();
}
