// Botoes PT / EN / ES no topo da pagina.
import { $, $$ } from './dom.js';
import { i18n } from './i18n.js';

export function initLangSwitcher() {
  $$('.lang-widget .lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.lang === i18n._lang);
  });
  $('#langWidget').addEventListener('click', function(e) {
    var btn = e.target.closest('.lang-btn');
    if (!btn) return;
    var lang = btn.dataset.lang;
    if (lang === i18n._lang) return;
    $$('.lang-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    i18n.setLang(lang);
  });
}
