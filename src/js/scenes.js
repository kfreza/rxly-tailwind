// Animated Figma scenes: a fixed 416×240 stage scaled to its container,
// and animations that only play while the scene is on screen.
export function initScenes() {
  const scenes = document.querySelectorAll('[data-scene]');
  if (!scenes.length) return;

  const fit = (scene) => {
    const stage = scene.firstElementChild;
    const w = stage.offsetWidth || 416;
    scene.style.setProperty('--s', String(scene.clientWidth / w));
  };

  const ro = new ResizeObserver((entries) => entries.forEach((e) => fit(e.target)));
  scenes.forEach((s) => {
    fit(s);
    ro.observe(s);
  });

  // The Figma keyframes (~110 KB) are not render-blocking: load them only when
  // motion is allowed and the first scene gets close to the viewport.
  const wantsMotion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motionLoaded = false;
  const loadMotion = () => {
    if (motionLoaded || !wantsMotion) return;
    motionLoaded = true;
    import('../styles/motion.css');
  };

  if (!('IntersectionObserver' in window)) {
    loadMotion();
    scenes.forEach((s) => s.classList.add('is-playing'));
    return;
  }
  const near = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        loadMotion();
        near.disconnect();
      }
    },
    { rootMargin: '800px 0px' },
  );
  scenes.forEach((s) => near.observe(s));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle('is-playing', e.isIntersecting)),
    { threshold: 0.15 },
  );
  scenes.forEach((s) => io.observe(s));
}
