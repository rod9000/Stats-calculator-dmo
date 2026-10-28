// Internacionalizacao: tabela de strings, tr() e traducao do DOM.
// Modulos com texto dinamico se registram em i18n.onChange() para atualizar ao trocar de idioma.
import { STRINGS } from './i18n-strings.js';
import { loadItem, saveItem } from './storage.js';

var listeners = [];

export var i18n = {
  _lang: loadItem('dmo.lang') || 'pt',
  _strings: STRINGS,
  t: function(key) {
    var s = this._strings[this._lang];
    return s && s[key] !== undefined ? s[key] : (this._strings.pt[key] || key);
  },
  setLang: function(lang) {
    if (!this._strings[lang]) return;
    this._lang = lang;
    saveItem('dmo.lang', lang);
    translateAll();
  },
  onChange: function(fn) { listeners.push(fn); }
};

export function tr(key) { return i18n.t(key); }

export function translateAll() {
  var els = document.querySelectorAll('[data-i18n]');
  els.forEach(function(el) {
    var keys = el.getAttribute('data-i18n').split(' ');
    keys.forEach(function(k) {
      if (k.indexOf(':') !== -1) {
        var parts = k.split(':');
        var attr = parts[0];
        var key = parts[1];
        el.setAttribute(attr, tr(key));
      } else {
        el.textContent = tr(k);
      }
    });
  });

  // Title
  document.title = tr('title');

  // Textos montados por JS (tema, rotulos do calculador, cards de dungeons...)
  listeners.forEach(function(fn) { fn(); });
}
