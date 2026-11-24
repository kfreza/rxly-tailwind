import './styles/app.css';
import { initNav } from './js/nav.js';
import { initTabs } from './js/tabs.js';
import { initAccordion } from './js/accordion.js';
import { initPricing } from './js/pricing.js';
import { initI18n } from './js/i18n.js';
import { initReveal } from './js/reveal.js';
import { initScatter } from './js/scatter.js';
import { initPinCards } from './js/pin-cards.js';
import { initTitleMotion } from './js/title-motion.js';
import { initDotGlobes } from './js/dot-globe.js';

initI18n();
initTitleMotion(); // after i18n, so Bangla titles split by word
initNav();
initTabs();
initAccordion();
initPricing();
initReveal();
initScatter();
initPinCards();
initDotGlobes();
