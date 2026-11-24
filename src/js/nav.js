// Sticky header shadow + accessible mobile menu (focus trap, Esc, scroll lock).
export function initNav() {
  const header = document.querySelector('[data-nav]');
  if (!header) return;

  // Active section: the header link of the section that crosses a line ~35% down the screen keeps its
  // underline (aria-current). None on the hero or below the FAQ.
  const links = [...header.querySelectorAll('nav a.nav-link[href^="#"]')].filter((a) => !a.closest('[data-menu]'));
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const spy = () => {
    const line = window.innerHeight * 0.35;
    let current = -1;
    sections.forEach((s, i) => {
      if (!s) return;
      const r = s.getBoundingClientRect();
      if (r.top <= line && r.bottom > line) current = i;
    });
    links.forEach((a, i) => (i === current ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  };

  const onScroll = () => {
    header.toggleAttribute('data-scrolled', window.scrollY > 8);
    spy();
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', spy, { passive: true });

  const menu = header.querySelector('[data-menu]');
  const openBtn = header.querySelector('[data-menu-open]');
  if (!menu || !openBtn) return;

  const focusables = () =>
    [...menu.querySelectorAll('a[href], button:not([disabled])')].filter((el) => el.offsetParent !== null);

  const open = () => {
    menu.hidden = false;
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    focusables()[0]?.focus();
  };
  const close = ({ restoreFocus = true } = {}) => {
    if (menu.hidden) return;
    menu.hidden = true;
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    if (restoreFocus) openBtn.focus();
  };

  openBtn.addEventListener('click', open);
  menu.querySelectorAll('[data-menu-close]').forEach((el) => el.addEventListener('click', () => close()));
  menu.querySelectorAll('[data-menu-link]').forEach((el) =>
    el.addEventListener('click', () => close({ restoreFocus: false })),
  );

  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return close();
    if (e.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Close if the viewport grows to desktop while open.
  window.matchMedia('(min-width: 75rem)').addEventListener('change', (e) => e.matches && close({ restoreFocus: false }));
}
