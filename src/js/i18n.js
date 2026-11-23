// EN ⇄ বাংলা switch.
// English text in the HTML is the source (also exported to src/i18n/en.json by scripts/extract-i18n.mjs).
// Bangla strings come from src/i18n/bn.json; any missing key falls back to English.
import bn from '../i18n/bn.json';

const KEY = 'rxly-lang';
const dictionaries = { bn };
const labels = { en: 'English', bn: 'বাংলা' };
const originals = new Map();

function apply(lang) {
  const dict = dictionaries[lang] ?? {};
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    if (!originals.has(el)) originals.set(el, el.textContent);
    const value = lang === 'en' ? null : dict[el.dataset.i18n];
    el.textContent = value ?? originals.get(el);
  });

  // Attributes: data-i18n-attr="aria-label:key;alt:key2"
  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      const store = `i18nOrig_${attr.replace(/-/g, '_')}`;
      if (!(store in el.dataset)) el.dataset[store] = el.getAttribute(attr) ?? '';
      const value = lang === 'en' ? null : dict[key];
      el.setAttribute(attr, value ?? el.dataset[store]);
    });
  });

  // The switch shows the current language (as in Figma); clicking toggles to the other one.
  // Accessible name = "Language: English" (sr-only prefix + visible label), so it contains the visible text.
  document.querySelectorAll('[data-lang-label]').forEach((el) => (el.textContent = labels[lang]));
  document.querySelectorAll('[data-lang-toggle]').forEach((el) =>
    el.setAttribute('title', lang === 'en' ? 'বাংলায় দেখুন' : 'Switch to English'),
  );

  try {
    localStorage.setItem(KEY, lang);
  } catch {}
  document.dispatchEvent(new CustomEvent('rxly:lang', { detail: { lang } }));
}

export function initI18n() {
  let lang = 'en';
  try {
    lang = localStorage.getItem(KEY) === 'bn' ? 'bn' : 'en';
  } catch {}
  apply(lang);

  document.querySelectorAll('[data-lang-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => apply(document.documentElement.lang === 'bn' ? 'en' : 'bn')),
  );
}
