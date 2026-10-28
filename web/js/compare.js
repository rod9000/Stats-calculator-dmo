// Aba Comparacao: cards lado a lado com busca no cache.
import { $ } from './dom.js';
import { tr } from './i18n.js';
import { DIGIMON_NAMES, STAT_KEYS, STAT_LABELS } from './data.js';
import { buscarDigimon, buscarDigimonOnline } from './digimon-search.js';

export function initCompare() {
  var state = { compareCards: 2 };

  // ===================== COMPARISON =====================
  function addCompareCard() {
    state.compareCards++;
    renderCompareCards();
  }

  function removeCompareCard(idx) {
    if (state.compareCards <= 2) return;
    state.compareCards--;
    renderCompareCards();
  }

  function renderCompareCards() {
    var container = $('#compareContainer');
    container.innerHTML = '';
    for (var i = 0; i < state.compareCards; i++) {
      var card = document.createElement('div');
      card.className = 'compare-card';
      card.dataset.idx = i;

      var header = document.createElement('div');
      header.className = 'card-header';

      var wrap = document.createElement('div');
      wrap.className = 'autocomplete-wrap';
      wrap.style.flex = '1';

      var input = document.createElement('input');
      input.type = 'text';
      input.placeholder = tr('digimonPlaceholder');
      input.id = 'cmpSearch-' + i;
      input.autocomplete = 'off';
      input.style.width = '100%';

      var autoList = document.createElement('div');
      autoList.className = 'autocomplete-list';
      autoList.style.width = '100%';

      wrap.appendChild(input);
      wrap.appendChild(autoList);

      (function(inp, lst) {
        inp.addEventListener('input', function() {
          var val = inp.value.toLowerCase().trim();
          lst.innerHTML = '';
          if (!val) { lst.style.display = 'none'; return; }
          var matches = DIGIMON_NAMES.filter(function(n) {
            return n.toLowerCase().indexOf(val) !== -1;
          }).slice(0, 12);
          if (!matches.length) { lst.style.display = 'none'; return; }
          matches.forEach(function(name) {
            var div = document.createElement('div');
            div.textContent = name;
            div.addEventListener('click', function() {
              inp.value = name;
              lst.style.display = 'none';
            });
            lst.appendChild(div);
          });
          lst.style.display = 'block';
        });
        inp.addEventListener('blur', function() {
          setTimeout(function() { lst.style.display = 'none'; }, 200);
        });
        inp.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') { lst.style.display = 'none'; compareSearch(i); }
        });
      })(input, autoList);

      var btnBuscar = document.createElement('button');
      btnBuscar.className = 'btn-buscar';
      btnBuscar.textContent = 'Buscar';
      btnBuscar.style.padding = '4px 12px';
      btnBuscar.dataset.idx = i;
      btnBuscar.addEventListener('click', function() {
        var idx = parseInt(this.dataset.idx);
        compareSearch(idx);
      });

      var closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.textContent = '\u2715';
      closeBtn.dataset.idx = i;
      closeBtn.addEventListener('click', function() {
        removeCompareCard(parseInt(this.dataset.idx));
      });

      header.appendChild(wrap);
      header.appendChild(btnBuscar);
      header.appendChild(closeBtn);
      card.appendChild(header);

      var status = document.createElement('div');
      status.className = 'status';
      status.id = 'cmpStatus-' + i;
      card.appendChild(status);

      var info = document.createElement('div');
      info.className = 'info';
      info.id = 'cmpInfo-' + i;
      card.appendChild(info);

      // Stats table
      var table = document.createElement('table');
      table.className = 'compare-stats';
      var thead = document.createElement('thead');
      var tableRow = document.createElement('tr');
      ['', 'Final', 'Base'].forEach(function(t) {
        var th = document.createElement('th');
        th.textContent = t;
        tableRow.appendChild(th);
      });
      thead.appendChild(tableRow);
      table.appendChild(thead);
      var tbody = document.createElement('tbody');
      tbody.id = 'cmpBody-' + i;
      table.appendChild(tbody);
      card.appendChild(table);

      container.appendChild(card);
    }
  }

  function preencherCompareCard(idx, dados) {
    var status = $('#cmpStatus-' + idx);
    var info = $('#cmpInfo-' + idx);
    var tbody = $('#cmpBody-' + idx);

    if (!dados) {
      status.textContent = tr('naoEncontrado').replace(': ', '.');
      status.className = 'status';
      info.textContent = '';
      tbody.innerHTML = '';
      return;
    }

    var source = dados._source || 'cache';
    status.textContent = tr('encontrado') + source + ')';
    status.className = 'status';
    info.textContent = tr('form') + (dados.form || '') + '  |  ' + tr('lvCapLabel') + (dados.level_cap || '');

    tbody.innerHTML = '';
    STAT_KEYS.forEach(function(sk) {
      var tableRow = document.createElement('tr');
      var label = document.createElement('td');
      label.textContent = STAT_LABELS[sk];
      label.style.fontWeight = '600';
      tableRow.appendChild(label);
      var finalTd = document.createElement('td');
      finalTd.textContent = dados[sk] || '-';
      tableRow.appendChild(finalTd);
      var baseTd = document.createElement('td');
      baseTd.textContent = dados[sk + '_base'] != null ? dados[sk + '_base'] : '-';
      tableRow.appendChild(baseTd);
      tbody.appendChild(tableRow);
    });
  }

  function compareSearch(idx) {
    var input = $('#cmpSearch-' + idx);
    if (!input) return;
    var name = input.value.trim();
    if (!name) return;
    var status = $('#cmpStatus-' + idx);

    var dados = buscarDigimon(name);
    if (dados) {
      preencherCompareCard(idx, dados);
      return;
    }

    status.textContent = tr('buscandoOnline');
    buscarDigimonOnline(name).then(function(dados) {
      preencherCompareCard(idx, dados);
    });
  }

  $('#addCompareBtn').addEventListener('click', addCompareCard);
  renderCompareCards();
}
