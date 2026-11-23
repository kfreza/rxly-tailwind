// Monthly / Yearly toggle. Both price blocks are in the HTML (translatable text);
// CSS shows .when-monthly or .when-yearly based on [data-billing] on the section.
export function initPricing() {
  const root = document.querySelector('[data-pricing]');
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-billing-option]')];

  const set = (billing) => {
    root.dataset.billing = billing;
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.billingOption === billing)));
  };

  buttons.forEach((b) => b.addEventListener('click', () => set(b.dataset.billingOption)));
  set(root.dataset.billing || 'monthly');
}
