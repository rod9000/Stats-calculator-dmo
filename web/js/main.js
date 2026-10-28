// Ponto de entrada: inicializa cada aba na mesma ordem do antigo app.js.
import { i18n, translateAll } from './i18n.js';
import { initTabs } from './tabs.js';
import { initTheme } from './theme.js';
import { initLayout } from './layout.js';
import { initLangSwitcher } from './lang-switcher.js';
import { checkServer } from './digimon-search.js';
import { initCalculator } from './calculator.js';
import { initReverse } from './reverse.js';
import { initCompare } from './compare.js';
import { initList } from './list.js';
import { initSeals } from './seals.js';
import { initDungeons } from './dungeons.js';
import { initDunit } from './dunit.js';
import { initDigisoul } from './digisoul.js';
import { initClothing } from './clothing.js';

function initApp() {
  initTabs();
  initTheme();
  initLayout();
  initLangSwitcher();
  checkServer();
  initCalculator();
  initReverse();
  initCompare();
  initList();
  initSeals();
  initDungeons();
  initDunit();
  initDigisoul();
  initClothing();

  // O HTML esta em portugues; aplica o idioma salvo depois que tudo foi montado
  if (i18n._lang !== 'pt') translateAll();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initApp);
else initApp();
