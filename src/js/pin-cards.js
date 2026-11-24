// Pricing: 3D cards rising into the Figma row.
// Motion modelled on the testimonials section of norio-nextjs-dev.pages.dev (GSAP ScrollTrigger
// there); re-implemented here without a library. Everything always renders at real Figma size.
//
// Modes (chosen from the window size, never while scrolling):
//  • pinned  — desktop (≥1200px), motion allowed, AND the whole Figma section fits under the nav
//              (120px top + heading + toggle + cards + 121px bottom). [data-pin-stage] becomes
//              sticky (CSS, .is-pinned) for the spacer's scroll distance; cards start below the
//              stage and rise into their slots one after another.
//  • flow    — desktop, motion allowed, shorter window. No pinning: the section scrolls normally
//              with Figma's exact layout and spacing; the cards rise/flatten (same 3D values,
//              staggered) as they scroll into view.
//  • mobile  — <1200px: lighter tilt per card as it scrolls in.
//  • reduced — prefers-reduced-motion: static Figma layout, no animation.
const DESK = '(min-width: 75rem)';
const SMOOTH = 0.35; // seconds to catch up with the scroll position (≈ scrub: 0.35)
const PAD_TOP = 120; // Figma: section top → pill
const PAD_BOTTOM = 121; // Figma: cards → section bottom
// Pinned: each card's share of the pinned scroll progress [start, end]; 0.82…1 holds the row.
const WINDOWS = [
  [0.0, 0.42],
  [0.2, 0.62],
  [0.4, 0.82],
];
const DESK_FROM = { rx: 58, y: 120, z: -180, scale: 0.82 };
const MOBILE_FROM = { rx: 32, y: 64, z: -80, scale: 0.82 };

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
  let mode = 'reduced';
  let raf = 0;
  let last = 0;
  let visible = false;

  const navHeight = () => (nav ? nav.offsetHeight : 109);

  // Pick the mode. Pinned only when the full Figma section fits at real size.
  const layout = () => {
    const navH = navHeight();
    section.style.setProperty('--nav-h', `${navH}px`);
    if (reduced.matches) mode = 'reduced';
    else if (!desk.matches) mode = 'mobile';
    else {
      const need = PAD_TOP + fit.offsetHeight + PAD_BOTTOM;
      mode = window.innerHeight - navH >= need ? 'pinned' : 'flow';
    }
    section.classList.toggle('is-pinned', mode === 'pinned');
  };

  const measure = () => {
    const vh = window.innerHeight;
    if (mode === 'pinned') {
      // 0 when the section top is 60% down the screen, 1 at the end of the spacer.
      const top = section.getBoundingClientRect().top;
      const begin = vh * 0.6;
      const span = begin - navHeight() + (spacer ? spacer.offsetHeight : 0);
      const p = clamp((begin - top) / Math.max(1, span), 0, 1);
      WINDOWS.forEach(([a, b], i) => (state[i].target = clamp((p - a) / (b - a), 0, 1)));
    } else if (mode === 'flow') {
      // Cards sit in one row: animate from "top at 95% of the screen" to "top at 45%",
      // each card starting a little after the previous one.
      const range = vh * 0.5;
      tracks.forEach((track, i) => {
        const top = track.getBoundingClientRect().top; // wrapper is never transformed
        const start = vh * 0.95 - i * range * 0.18;
        state[i].target = clamp((start - top) / range, 0, 1);
      });
    } else if (mode === 'mobile') {
      tracks.forEach((track, i) => {
        const top = track.getBoundingClientRect().top;
        const start = vh * 0.85;
        state[i].target = clamp((start - top) / Math.max(1, start - 80), 0, 1);
      });
    }
  };

  const apply = () => {
    const drop = mode === 'pinned' ? stage.clientHeight : DESK_FROM.y; // pinned: start below the stage
    cards.forEach((card, i) => {
      const k = mode === 'reduced' ? 0 : 1 - easeOut(state[i].current); // 1 = start pose, 0 = in place
      if (k < 0.0005) {
        card.style.transform = '';
        return;
      }
      if (mode === 'mobile') {
        const f = MOBILE_FROM;
        card.style.transform =
          `perspective(900px) translate3d(0, ${(f.y * k).toFixed(1)}px, ${(f.z * k).toFixed(1)}px) ` +
          `rotateX(${(f.rx * k).toFixed(2)}deg) scale(${(1 - (1 - f.scale) * k).toFixed(4)})`;
        return;
      }
      const ry = Number(card.dataset.ry || 0);
      card.style.transform =
        `perspective(900px) translate3d(0, ${(drop * k).toFixed(1)}px, ${(DESK_FROM.z * k).toFixed(1)}px) ` +
        `rotateX(${(DESK_FROM.rx * k).toFixed(2)}deg) rotateY(${(ry * k).toFixed(2)}deg) ` +
        `scale(${(1 - (1 - DESK_FROM.scale) * k).toFixed(4)})`;
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
    if (!raf && visible && mode !== 'reduced') raf = requestAnimationFrame(tick);
  };

  const relayout = () => {
    layout();
    const animated = mode !== 'reduced';
    cards.forEach((c) => {
      c.style.transformOrigin = animated ? '50% 100%' : '';
      c.style.willChange = animated ? 'transform' : '';
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
