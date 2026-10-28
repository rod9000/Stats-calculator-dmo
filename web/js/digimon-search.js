// Busca de Digimon: cache local, aliases e fallback online (/api/search).
import { $ } from './dom.js';
import { debounce } from './utils.js';
import { DIGIMON_CACHE, DIGIMON_NAMES, NAME_ALIASES } from './data.js';

export function setupAutocomplete(inputId, listId, onSelect) {
  var input = $(inputId);
  var list = $(listId);
  if (!input || !list) return;

  input.addEventListener('input', debounce(function() {
    var val = input.value.toLowerCase().trim();
    list.innerHTML = '';
    if (!val) { list.style.display = 'none'; return; }
    var matches = DIGIMON_NAMES.filter(function(n) {
      return n.toLowerCase().indexOf(val) !== -1;
    }).slice(0, 12);
    if (!matches.length) { list.style.display = 'none'; return; }
    matches.forEach(function(name) {
      var div = document.createElement('div');
      div.textContent = name;
      div.addEventListener('click', function() {
        input.value = name;
        list.style.display = 'none';
        if (onSelect) onSelect(name);
      });
      list.appendChild(div);
    });
    list.style.display = 'block';
  }, 200));

  input.addEventListener('blur', function() {
    setTimeout(function() { list.style.display = 'none'; }, 200);
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      list.style.display = 'none';
      if (onSelect) onSelect(input.value.trim());
    }
  });
}

var serverOnline = false;

export function checkServer() {
  fetch('/api/search?name=_ping_').then(function(r) {
    serverOnline = r.status === 400; // 400 = missing name (expected)
  }).catch(function() {
    serverOnline = false;
  });
}

export function buscarDigimon(nome) {
  if (!nome) return null;
  var dados = DIGIMON_CACHE[nome];
  if (dados) {
    dados._name = nome;
    dados._source = 'cache';
    return dados;
  }
  var key = nome.toLowerCase().replace(/\s+/g, ' ').replace(/['":]/g, '')
              .replace(/\(/g, ' ').replace(/\)/g, ' ').replace(/\s+/g, ' ').trim();
  var alias = NAME_ALIASES[key];
  if (alias && DIGIMON_CACHE[alias]) {
    dados = DIGIMON_CACHE[alias];
    dados._name = nome;
    dados._source = 'cache';
    return dados;
  }
  return null;
}

export function buscarDigimonOnline(nome) {
  return fetch('/api/search?name=' + encodeURIComponent(nome))
    .then(function(r) {
      if (!r.ok) return null;
      return r.json();
    })
    .then(function(data) {
      if (!data || data.error) return null;
      data._name = nome;
      data._source = data._source || 'server';
      // Add to local cache for next time
      DIGIMON_CACHE[nome] = data;
      return data;
    })
    .catch(function() {
      return null;
    });
}
