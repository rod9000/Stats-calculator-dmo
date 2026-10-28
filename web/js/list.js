// Aba Lista de Digimons: tabela ordenavel com o que ha no cache.
import { $, $$ } from './dom.js';
import { tr } from './i18n.js';
import { DIGIMON_CACHE, DIGIMON_NAMES } from './data.js';

export function initList() {
  // ===================== LIST TAB =====================
  var listSortCol = null;
  var listSortRev = false;

  function populateList() {
    var tbody = $('#listBody');
    tbody.innerHTML = '';
    var cached = 0;

    DIGIMON_NAMES.forEach(function(name) {
      var dados = DIGIMON_CACHE[name];
      var tableRow = document.createElement('tr');
      if (!dados) tableRow.className = 'uncached';

      var tdName = document.createElement('td');
      tdName.className = 'name-cell';
      tdName.textContent = name;
      tableRow.appendChild(tdName);

      var fields = ['form', 'hp', 'ds', 'at', 'ct', 'ht', 'de', 'level_cap'];
      fields.forEach(function(f) {
        var td = document.createElement('td');
        if (dados) {
          td.textContent = dados[f] != null ? dados[f] : '---';
        } else {
          td.textContent = '---';
        }
        tableRow.appendChild(td);
      });

      tbody.appendChild(tableRow);
      if (dados) cached++;
    });

    $('#listStatus').textContent = cached + '/' + DIGIMON_NAMES.length + tr('emCache');
  }

  function sortList(colIdx, header) {
    var tbody = $('#listBody');
    var rows = Array.from(tbody.querySelectorAll('tr'));

    var isNumeric = colIdx >= 2; // HP, DS, AT, CT, HT, DE, Level Cap are numeric
    var reverse = listSortCol === colIdx ? !listSortRev : true;
    listSortCol = colIdx;
    listSortRev = reverse;

    rows.sort(function(a, b) {
      var va = a.cells[colIdx].textContent.trim().replace('%', '');
      var vb = b.cells[colIdx].textContent.trim().replace('%', '');
      if (isNumeric) {
        var na = parseFloat(va.replace(',', '.'));
        var nb = parseFloat(vb.replace(',', '.'));
        if (!isNaN(na) && !isNaN(nb)) return reverse ? nb - na : na - nb;
      }
      return reverse ? vb.localeCompare(va) : va.localeCompare(vb);
    });

    rows.forEach(function(r) { tbody.appendChild(r); });
  }

  // List header click
  var listHeaders = $$('#listTable th');
  listHeaders.forEach(function(th, idx) {
    th.addEventListener('click', function() {
      sortList(idx, th);
    });
  });

  populateList();

  // Refresh list
  $('#refreshListBtn').addEventListener('click', populateList);
}
