// Navegacao entre abas. A aba atual fica no hash da URL (#dgcalc) e em localStorage,
// entao atualizar a pagina (F5) volta para a mesma aba.
import { $, $$ } from './dom.js';
import { loadItem, saveItem } from './storage.js';

var TAB_KEY = 'dmo.tab';
var DEFAULT_TAB = 'calculadora';

function isTab(id) {
  return !!id && !!$('#tab-' + id) && !!$('.tab-btn[data-tab="' + id + '"]');
}

function hashTab() {
  var id = location.hash.slice(1);
  return isTab(id) ? id : null;
}

// Prioridade: hash da URL (esta aba do navegador) > ultima aba salva > padrao
function initialTab() {
  var saved = loadItem(TAB_KEY);
  return hashTab() || (isTab(saved) ? saved : DEFAULT_TAB);
}

function showTab(tabId) {
  $$('.tab-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  $$('.tab-content').forEach(function(c) {
    c.classList.toggle('active', c.id === 'tab-' + tabId);
  });
}

function remember(tabId) {
  saveItem(TAB_KEY, tabId);
  if (hashTab() === tabId) return;
  // replaceState: nao empilha historico nem rola ate um elemento com esse id
  try { history.replaceState(null, '', '#' + tabId); } catch (e) {}
}

function switchTab(tabId) {
  showTab(tabId);
  remember(tabId);
}

export function initTabs() {
  var first = initialTab();
  showTab(first);
  saveItem(TAB_KEY, first);
  if (first !== DEFAULT_TAB) remember(first);

  $('.tabs-nav').addEventListener('click', function(e) {
    var btn = e.target.closest('.tab-btn');
    if (btn) switchTab(btn.dataset.tab);
  });

  // Hash editado a mao (ou link para #aba) troca de aba sem recarregar
  window.addEventListener('hashchange', function() {
    var id = hashTab();
    if (id) { showTab(id); saveItem(TAB_KEY, id); }
  });
}
