// ARIA tabs: [data-tabs] > [role=tablist] > [role=tab][aria-controls] ; panels [role=tabpanel]
// Optional motion hooks: [data-tab-pill] (blue pill that slides to the selected tab) and
// [data-tab-frame] (panel frame that eases to the new panel's height).
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

export function initTabs() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    if (!tabs.length) return;
    const scroller = root.querySelector('[data-tabs-scroll]');
    const list = root.querySelector('[role="tablist"]');
    const pill = root.querySelector('[data-tab-pill]');
    const frame = root.querySelector('[data-tab-frame]');
    const panelOf = (t) => root.querySelector(`#${t.getAttribute('aria-controls')}`);
    let current = null;
    let frameTimer;

    // Move the pill under the selected tab (no slide on first paint, resize or language change).
    const placePill = (animate) => {
      if (!pill || !current) return;
      if (!animate) list.classList.add('no-anim');
      // exact (sub-pixel) box, relative to the list's padding edge
      const t = current.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      pill.style.translate = `${t.left - l.left - list.clientLeft}px 0`;
      pill.style.width = `${t.width}px`;
      list.classList.add('has-pill');
      if (!animate) {
        void pill.offsetWidth;
        list.classList.remove('no-anim');
      }
    };

    // Swap panels; with motion, ease the frame from the old height to the new one.
    const showPanel = (tab, animate) => {
      if (!animate || !frame || reduced) {
        tabs.forEach((t) => panelOf(t) && (panelOf(t).hidden = t !== tab));
        return;
      }
      const from = frame.getBoundingClientRect().height;
      clearTimeout(frameTimer);
      frame.style.transition = 'none';
      frame.style.height = '';
      tabs.forEach((t) => panelOf(t) && (panelOf(t).hidden = t !== tab));
      const to = frame.getBoundingClientRect().height;
      const panel = panelOf(tab);
      if (panel) {
        panel.classList.remove('is-entering');
        void panel.offsetWidth; // restart the entrance if tabs are clicked quickly
        panel.classList.add('is-entering');
        setTimeout(() => panel.classList.remove('is-entering'), 700);
      }
      if (Math.abs(from - to) < 1) {
        frame.style.removeProperty('transition');
        return;
      }
      frame.style.height = `${from}px`;
      void frame.offsetHeight;
      frame.style.transition = `height 0.45s ${EASE}`;
      frame.style.height = `${to}px`;
      frameTimer = setTimeout(() => {
        frame.style.removeProperty('height');
        frame.style.removeProperty('transition');
      }, 500);
    };

    const select = (tab, { focus = false, reveal = false, animate = true } = {}) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
      });
      showPanel(tab, animate && tab !== current);
      current = tab;
      placePill(animate);
      if (focus) tab.focus({ preventScroll: true });
      // Only scroll the tab strip horizontally (never the page), and only on user action.
      if (reveal && scroller && scroller.scrollWidth > scroller.clientWidth) {
        const left = tab.offsetLeft - (scroller.clientWidth - tab.offsetWidth) / 2;
        scroller.scrollTo({ left, behavior: 'smooth' });
      }
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab, { reveal: true }));
      tab.addEventListener('keydown', (e) => {
        const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in keys)) return;
        e.preventDefault();
        select(tabs[(keys[e.key] + tabs.length) % tabs.length], { focus: true, reveal: true });
      });
    });

    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0], { animate: false });

    // Tab widths change with the window, the web font arriving and the language switch.
    if (pill) {
      const refit = () => placePill(false);
      window.addEventListener('resize', refit, { passive: true });
      document.addEventListener('rxly:lang', () => requestAnimationFrame(refit));
      document.fonts?.ready.then(refit);
      if ('ResizeObserver' in window) new ResizeObserver(refit).observe(list);
    }
  });
}
