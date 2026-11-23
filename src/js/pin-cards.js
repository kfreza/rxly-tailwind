// Pricing: pinned stage with 3D cards rising into the row.
// Motion modelled on the testimonials section of norio-nextjs-dev.pages.dev (GSAP ScrollTrigger
// there); re-implemented here without a library.
//
// Desktop (≥1200px, motion allowed) — CSS makes [data-pin-stage] sticky under the nav with the
// height of the screen; [data-pin-spacer] gives it scroll distance. Background, heading and the
// Figma 3-card row live inside the stage, so they can never drift apart or overlap.
//   - The cards start below the stage, tipped back (rotateX 58°, rotateY −32° / 0° / +32°,
//     z −180px, scale 0.82) and rise one after another into their slots, flattening as they go.
//   - If the stage content is taller than the screen, it is scaled down uniformly to fit.
// Mobile / tablet: no pinning; each card gets a lighter tilt (rotateX 32°, y 64px, z −80px)
// as it scrolls in. prefers-reduced-motion: no animation.
const DESK = '(min-width: 75rem)';
const SMOOTH = 0.35; // seconds to catch up with the scroll position (≈ scrub: 0.35)
// Each card's share of the pinned scroll progress (0…1): [start, end]
const WINDOWS = [
  [0.0, 0.42],
  [0.2, 0.62],
  [0.4, 0.82],
]; // 0.82…1 = hold the finished row
const MOBILE = { rx: 32, y: 64, z: -80, scale: 0.82, start: 0.85, end: 80 };

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

export function initPinCards() {
  const section = document.querySelector('[data-pin-section]');
  if (!section) return;
  const stage = section.querySelector('[data-pin-stage]');
  const fit = section.querySelector('[data-pin-fit]');
  const spacer = section.querySelector('[data-pin-spacer]');
  const tracks = [...section.querySelectorAll('[data-pin-track]')];
  const cards = tracks.map((t) => t.querySelector('[data-pin-card]'));
  if (!stage || !fit || !cards.length || cards.some((c) => !c)) return;

  const nav = document.querySelector('[data-nav]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desk = window.matchMedia(DESK);
  const state = cards.map(() => ({ target: 0, current: 0 }));
  let fitScale = 1;
  let raf = 0;
  let last = 0;
  let visible = false;

  const pinned = () => desk.matches && !reduced.matches;

  // Nav height → CSS (--nav-h) and fit-to-screen scale for the stage content.
  const layout = () => {
    const navH = nav ? nav.offsetHeight : 109;
    section.style.setProperty('--nav-h', `${navH}px`);
    fit.style.transform = '';
    fitScale = 1;
    if (!pinned()) return;
    const pad = parseFloat(getComputedStyle(stage).paddingTop) || 0;
    const room = stage.clientHeight - pad - 24; // 24px breathing room at the bottom
    const need = fit.offsetHeight;
    fitScale = clamp(room / need, 0.55, 1);
    if (fitScale < 1) fit.style.transform = `scale(${fitScale.toFixed(4)})`;
  };

  const measure = () => {
    const vh = window.innerHeight;
    if (pinned()) {
      // Progress 0 when the section top is 60% down the screen, 1 at the end of the spacer.
      const navH = nav ? nav.offsetHeight : 109;
      const top = section.getBoundingClientRect().top;
      const begin = vh * 0.6;
      const span = begin - navH + (spacer ? spacer.offsetHeight : 0);
      const p = clamp((begin - top) / Math.max(1, span), 0, 1);
      WINDOWS.forEach(([a, b], i) => {
        if (state[i]) state[i].target = clamp((p - a) / (b - a), 0, 1);
      });
    } else {
      tracks.forEach((track, i) => {
        const top = track.getBoundingClientRect().top; // wrapper is never transformed
        const start = vh * MOBILE.start;
        state[i].target = clamp((start - top) / Math.max(1, start - MOBILE.end), 0, 1);
      });
    }
  };

  const apply = () => {
    if (reduced.matches) return;
    const isPinned = pinned();
    // Start position: below the bottom of the stage (in the scaled coordinate space).
    const drop = isPinned ? stage.clientHeight / fitScale : 0;
    cards.forEach((card, i) => {
      const k = 1 - easeOut(state[i].current); // 1 = start pose, 0 = in place
      if (k < 0.0005) {
        card.style.transform = '';
        return;
      }
      if (isPinned) {
        const ry = Number(card.dataset.ry || 0);
        card.style.transform =
          `perspective(900px) translate3d(0, ${(drop * k).toFixed(1)}px, ${(-180 * k).toFixed(1)}px) ` +
          `rotateX(${(58 * k).toFixed(2)}deg) rotateY(${(ry * k).toFixed(2)}deg) scale(${(1 - 0.18 * k).toFixed(4)})`;
      } else {
        card.style.transform =
          `perspective(900px) translate3d(0, ${(MOBILE.y * k).toFixed(1)}px, ${(MOBILE.z * k).toFixed(1)}px) ` +
          `rotateX(${(MOBILE.rx * k).toFixed(2)}deg) scale(${(1 - (1 - MOBILE.scale) * k).toFixed(4)})`;
      }
    });
  };

  const tick = (now) => {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016;
    last = now;
    measure();
    const a = 1 - Math.exp(-dt / (SMOOTH / 3)); // ~95% caught up after SMOOTH seconds
    let moving = false;
    state.forEach((s) => {
      s.current += (s.target - s.current) * a;
      if (Math.abs(s.target - s.current) > 0.0005) moving = true;
      else s.current = s.target;
    });
    apply();
    raf = visible && moving ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  };
  const kick = () => {
    if (!raf && visible) raf = requestAnimationFrame(tick);
  };

  const reset = () => {
    cards.forEach((c) => {
      c.style.transform = '';
      c.style.transformOrigin = '';
      c.style.willChange = '';
    });
  };

  const relayout = () => {
    layout();
    if (reduced.matches) {
      reset();
      return;
    }
    cards.forEach((c) => {
      c.style.transformOrigin = '50% 100%';
      c.style.willChange = 'transform';
    });
    measure();
    state.forEach((s) => (s.current = s.target));
    apply();
  };

  new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) kick();
    },
    { rootMargin: '200px 0px' },
  ).observe(section);

  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', relayout, { passive: true });
  desk.addEventListener('change', relayout);
  reduced.addEventListener('change', relayout);
  window.addEventListener('load', relayout);
  document.fonts?.ready.then(relayout);
  document.addEventListener('rxly:lang', () => requestAnimationFrame(relayout)); // Bangla heading height differs
  relayout();
}
