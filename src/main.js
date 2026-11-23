import './styles/app.css';
import { initNav } from './js/nav.js';
import { initTabs } from './js/tabs.js';
import { initAccordion } from './js/accordion.js';
import { initPricing } from './js/pricing.js';
import { initI18n } from './js/i18n.js';
import { initReveal } from './js/reveal.js';
import { initScenes } from './js/scenes.js';
import { initScatter } from './js/scatter.js';

document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));

initI18n();
initNav();
initTabs();
initAccordion();
initPricing();
initReveal();
initScenes();
initScatter();
