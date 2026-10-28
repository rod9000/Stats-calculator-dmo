// Alternancia de tema claro/escuro.
import { $ } from './dom.js';
import { tr, i18n } from './i18n.js';

export function initTheme() {
  var themeBtn = $('#themeToggle');
  themeBtn.addEventListener('click', function() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? '' : 'dark');
    themeBtn.textContent = isDark ? tr('themeDark') : tr('themeLight');
  });

  i18n.onChange(function() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = isDark ? tr('themeLight') : tr('themeDark');
  });
}
