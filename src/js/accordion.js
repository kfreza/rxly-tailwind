// FAQ accordion: [data-accordion] > [data-acc-item] > button[aria-expanded][aria-controls] + [data-acc-panel]
// One item open at a time; open/close animates smoothly (CSS grid-rows transition).
// The block keeps one height whichever answer is open (room is reserved for the longest answer),
// so the sections below never jump when you switch questions.
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

    // Reserve the height of the longest answer: current height − open answer + longest answer.
    const inners = [...root.querySelectorAll('[data-acc-panel] > *, .faq-a > *')];
    const reserve = () => {
      const open = root.querySelector('[data-acc-item][data-open] .faq-a > *, [data-acc-item][data-open] [data-acc-panel] > *');
      if (!open || !inners.length) return; // measure only in a resting, one-open state
      root.style.minHeight = '';
      const longest = Math.max(...inners.map((el) => el.scrollHeight));
      root.style.minHeight = `${Math.ceil(root.getBoundingClientRect().height - open.scrollHeight + longest)}px`;
    };

    buttons.forEach((btn) => {
      set(btn, btn.getAttribute('aria-expanded') === 'true');
      btn.addEventListener('click', () => {
        const willOpen = btn.getAttribute('aria-expanded') !== 'true';
        buttons.forEach((b) => set(b, false));
        set(btn, willOpen);
      });
    });

    reserve();
    // re-measure once things settle (after any open/close animation has finished)
    let t;
    const later = () => {
      clearTimeout(t);
      t = setTimeout(reserve, 450);
    };
    window.addEventListener('resize', later, { passive: true });
    document.addEventListener('rxly:lang', later);
    document.fonts?.ready.then(reserve);
  });
}
