// FAQ accordion: [data-accordion] > [data-acc-item] > button[aria-expanded][aria-controls] + [data-acc-panel]
// One item open at a time; open/close animates smoothly (CSS grid-rows transition).
export function initAccordion() {
  document.querySelectorAll('[data-accordion]').forEach((root) => {
    const buttons = [...root.querySelectorAll('[data-acc-item] > h3 > button, [data-acc-item] > button')];

    const set = (btn, open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.closest('[data-acc-item]').toggleAttribute('data-open', open);
      const panel = root.querySelector(`#${btn.getAttribute('aria-controls')}`);
      if (panel) {
        panel.hidden = false; // height animates via CSS (grid rows), see .faq-a
        panel.inert = !open; // closed answers: not focusable / not read out
        panel.setAttribute('aria-hidden', String(!open));
      }
    };

    buttons.forEach((btn) => {
      set(btn, btn.getAttribute('aria-expanded') === 'true');
      btn.addEventListener('click', () => {
        const willOpen = btn.getAttribute('aria-expanded') !== 'true';
        buttons.forEach((b) => set(b, false));
        set(btn, willOpen);
      });
    });
  });
}
