// "Built for Bangladesh": the outer ring around the globe should run into the card dots, as in
// Figma. The globe frame has a fixed size but the card columns flex with the window, so from 1200px
// up we size the ring to pass through the corner dots (Figma: a 600px ring, the dots 61px down the
// cards). Below 1200 the cards stack and the dots are hidden, so the CSS size is kept.
export function initBdRing() {
  const ring = document.querySelector('[data-bd-ring]');
  if (!ring) return;
  const lines = [...document.querySelectorAll('[data-bd-line]')];
  const dots = () => [...document.querySelectorAll('#bangladesh .bd-dot')].filter((d) => d.offsetParent);
  const fit = () => {
    ring.style.removeProperty('inset');
    lines.forEach((l) => l.style.removeProperty('top'));
    const ds = dots();
    if (!ds.length) return;
    const r = ring.parentElement.getBoundingClientRect(); // the globe frame (inset is measured from it)
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    // the corner dots (top and bottom of each column); the middle ones sit on the straight lines
    const dist = ds
      .map((d) => {
        const b = d.getBoundingClientRect();
        // ignore the card's scroll-in slide (translate) so the ring matches the resting position
        const [tx = 0, ty = 0] = (getComputedStyle(d.parentElement).translate.match(/-?[d.]+/g) || []).map(Number);
        return Math.hypot(b.left + b.width / 2 - tx - cx, b.top + b.height / 2 - ty - cy);
      })
      .sort((a, b) => b - a)
      .slice(0, 4);
    const radius = dist.reduce((a, b) => a + b, 0) / dist.length + 0.5; // + half the 1px border
    ring.style.inset = `${(r.width / 2 - radius).toFixed(2)}px`;

    // middle connector lines: on the row through the middle dots' centres, snapped to a whole pixel
    const middle = ds
      .map((d) => {
        const b = d.getBoundingClientRect();
        const [, ty = 0] = (getComputedStyle(d.parentElement).translate.match(/-?[d.]+/g) || []).map(Number);
        return b.top + b.height / 2 - ty;
      })
      .sort((a, b) => Math.abs(a - cy) - Math.abs(b - cy))[0];
    const lineTop = Math.round(middle - 0.5) - r.top; // page row of the 1px line, relative to the frame
    lines.forEach((l) => (l.style.top = `${lineTop}px`));
  };
  fit();
  window.addEventListener('resize', fit, { passive: true });
  document.fonts?.ready.then(fit);
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(document.querySelector('#bangladesh'));
}
