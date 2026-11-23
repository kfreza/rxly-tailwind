// ARIA tabs: [data-tabs] > [role=tablist] > [role=tab][aria-controls] ; panels [role=tabpanel]
export function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    if (!tabs.length) return;
    const scroller = root.querySelector('[data-tabs-scroll]');

    const select = (tab, { focus = false, reveal = false } = {}) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = root.querySelector(`#${t.getAttribute('aria-controls')}`);
        if (panel) panel.hidden = !selected;
      });
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

    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') ?? tabs[0]);
  });
}
