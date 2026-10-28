// Botao do cabecalho que alterna entre os dois layouts da pagina:
//   fit     = cabe na tela (padrao): layout-fit.css ligada, as listas compridas rolam por dentro
//   classic = pagina rolavel como antes: layout-fit.css desligada (media="not all")
// A escolha fica em localStorage; o script no <head> do index.html ja a aplica antes da pagina aparecer.
import { $ } from './dom.js';
import { tr, i18n } from './i18n.js';
import { loadItem, saveItem } from './storage.js';

var KEY = 'dmo.layout';

export function initLayout() {
  var btn = $('#layoutToggle');
  var sheet = $('#fitCss');
  if (!btn || !sheet) return;
  var mode = loadItem(KEY) === 'classic' ? 'classic' : 'fit';

  function apply() {
    sheet.media = mode === 'fit' ? 'all' : 'not all';
    document.documentElement.setAttribute('data-layout', mode);
    // o botao diz para qual layout ele leva (igual ao botao de tema)
    btn.textContent = tr(mode === 'fit' ? 'layoutToClassic' : 'layoutToFit');
    btn.title = tr('layoutTitle');
  }

  btn.addEventListener('click', function() {
    mode = mode === 'fit' ? 'classic' : 'fit';
    saveItem(KEY, mode);
    apply();
  });

  i18n.onChange(apply);
  apply();
}
