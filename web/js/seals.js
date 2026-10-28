// Aba Seals: calculadora de seals otimos e navegador com os seals que voce possui.
import { $, $$ } from './dom.js';
import { escapeHtml, debounce } from './utils.js';
import { tr } from './i18n.js';
import { loadItem, saveItem } from './storage.js';
import { SEALS } from './data.js';

var SUBTAB_KEY = 'dmo.sealSubtab';

export function initSeals() {
  // ===================== SEALS TAB =====================
  var SEAL_STATS = ['AT','CT','HT','HP','DS','DE','BL','EV'];
  var SEAL_COLORS = {
    AT:'#ef4444', CT:'#f97316', HT:'#eab308', HP:'#ec4899',
    DS:'#3b82f6', DE:'#06b6d4', BL:'#10b981', EV:'#a855f7'
  };

  function getSealsForStat(stat) {
    return SEALS.filter(function(s) { return s.stat === stat; }).map(function(s) {
      return { id:s.id, name:s.name, stat:s.stat, max:s.max, price:s.price,
        buyable:s.buyable, efficiency: s.price > 0 ? s.max / s.price : 0 };
    }).sort(function(a, b) { return b.efficiency - a.efficiency; });
  }

  function findOptimalSeals(stat, target, ownedIds) {
    var available = getSealsForStat(stat).filter(function(s) {
      return s.price > 0 && !ownedIds.has(s.id);
    });
    var selected = [], totalStat = 0, totalCost = 0;
    for (var i = 0; i < available.length; i++) {
      if (totalStat >= target) break;
      selected.push(available[i]);
      totalStat += available[i].max;
      totalCost += available[i].price;
    }
    return { seals: selected, totalStat: totalStat, totalCost: totalCost };
  }

  // Load owned from localStorage
  var sealOwned = {};
  try { sealOwned = JSON.parse(localStorage.getItem('dmoseals') || '{}'); } catch(e) {}

  function saveSealOwned() {
    localStorage.setItem('dmoseals', JSON.stringify(sealOwned));
  }

  // Export seals as JSON file
  $('#sealExportBtn').addEventListener('click', function() {
    var data = JSON.stringify(sealOwned, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'dmoseals_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import seals from JSON file
  $('#sealImportBtn').addEventListener('click', function() {
    $('#sealImportFile').click();
  });
  $('#sealImportFile').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var imported = JSON.parse(ev.target.result);
        if (typeof imported !== 'object' || Array.isArray(imported)) {
          alert('Formato inválido. O arquivo deve ser um objeto JSON.');
          return;
        }
        sealOwned = imported;
        saveSealOwned();
        renderSealBrowser();
        if (document.querySelector('[data-subtab="seal-calc"].active')) runSealCalc();
        alert('Dados importados com sucesso! (' + Object.keys(imported).length + ' seals)');
      } catch(err) {
        alert('Erro ao ler o arquivo: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  var sealStat = 'AT';
  function renderSealStats() {
    var container = $('#sealStats');
    container.innerHTML = '';
    SEAL_STATS.forEach(function(st) {
      var btn = document.createElement('button');
      btn.className = 'seal-stat-btn' + (st === sealStat ? ' active' : '');
      btn.textContent = st;
      btn.style.background = st === sealStat ? SEAL_COLORS[st] : '';
      btn.style.color = st === sealStat ? '#fff' : '';
      btn.addEventListener('click', function() {
        sealStat = st;
        renderSealStats();
        renderSealBrowser();
        runSealCalc();
      });
      container.appendChild(btn);
    });
  }

  // Sub-tab switching (a escolhida e lembrada para sobreviver ao F5)
  function showSubtab(name) {
    $$('.sub-tab-btn').forEach(function(b) { b.classList.toggle('active', b.dataset.subtab === name); });
    $$('.sub-tab-content').forEach(function(c) {
      c.classList.toggle('active', c.id === 'subtab-' + name);
    });
    if (name === 'seal-calc') runSealCalc();
  }

  document.querySelector('.sub-tabs-nav').addEventListener('click', function(e) {
    var btn = e.target.closest('.sub-tab-btn');
    if (!btn) return;
    showSubtab(btn.dataset.subtab);
    saveItem(SUBTAB_KEY, btn.dataset.subtab);
  });

  function ownedStatTotal() {
    var total = 0;
    SEALS.forEach(function(s) {
      if (s.stat === sealStat && (sealOwned[s.id] || 0) > 0) total += s.max;
    });
    return total;
  }

  function ownedIds() {
    var ids = new Set();
    Object.keys(sealOwned).forEach(function(id) {
      if (sealOwned[id] > 0) ids.add(parseInt(id));
    });
    return ids;
  }

  var sealSortBy = 'efficiency', sealSortAsc = false;

  // Delegated event listener for seal owned inputs (added once)
  $('#sealBody').addEventListener('input', function(e) {
    var inp = e.target.closest('.seal-table-owned');
    if (!inp) return;
    var id = parseInt(inp.dataset.id);
    sealOwned[id] = parseInt(inp.value) || 0;
    if (!sealOwned[id]) delete sealOwned[id];
    saveSealOwned();
    renderSealBrowser();
    if (document.querySelector('[data-subtab="seal-calc"].active')) runSealCalc();
  });

  function renderSealBrowser() {
    var tbody = $('#sealBody');
    var ownedTotal = ownedStatTotal();
    var query = ($('#sealSearch').value || '').toLowerCase();
    var onlyOwned = $('#sealOwnedOnly').checked;

    var list = getSealsForStat(sealStat);
    if (query) list = list.filter(function(s) { return s.name.toLowerCase().includes(query); });
    if (onlyOwned) list = list.filter(function(s) { return (sealOwned[s.id] || 0) > 0; });

    list.sort(function(a, b) {
      var cmp = 0;
      if (sealSortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sealSortBy === 'max') cmp = a.max - b.max;
      else if (sealSortBy === 'price') cmp = a.price - b.price;
      else if (sealSortBy === 'efficiency') cmp = a.efficiency - b.efficiency;
      return sealSortAsc ? cmp : -cmp;
    });

    tbody.innerHTML = '';
    list.forEach(function(s) {
      var tableRow = document.createElement('tr');
      var owned = sealOwned[s.id] || 0;
      if (owned > 0) tableRow.style.background = 'var(--accent-soft)';
      tableRow.innerHTML =
        '<td class="name-cell">' + escapeHtml(s.name) + '</td>' +
        '<td class="sort-right">+' + s.max + '</td>' +
        '<td class="sort-right">' + (s.price > 0 ? s.price.toFixed(1) : '&mdash;') + '</td>' +
        '<td class="sort-right">' + (s.efficiency > 0 ? s.efficiency.toFixed(1) : '&mdash;') + '</td>' +
        '<td><input type="number" class="seal-table-owned" value="' + (owned || '') + '" min="0" data-id="' + s.id + '"></td>';
      tbody.appendChild(tableRow);
    });

    // Owned input handler
    // (delegated listener added once outside renderSealBrowser)

    // Summary
    var summary = $('#sealOwnedSummary');
    if (ownedTotal > 0) {
      summary.textContent = tr('seuSeal') + sealStat + tr('seals') + ownedTotal;
      summary.style.color = SEAL_COLORS[sealStat];
    } else {
      summary.textContent = '';
    }
  }

  // Table header sort
  $('#sealTable').addEventListener('click', function(e) {
    var th = e.target.closest('th[data-sort]');
    if (!th) return;
    var col = th.dataset.sort;
    if (sealSortBy === col) sealSortAsc = !sealSortAsc;
    else { sealSortBy = col; sealSortAsc = false; }
    renderSealBrowser();
  });

  // Live search and owned-only filter
  $('#sealSearch').addEventListener('input', debounce(renderSealBrowser, 200));
  $('#sealOwnedOnly').addEventListener('change', renderSealBrowser);

  function runSealCalc() {
    var targetInput = $('#sealTarget');
    var target = parseInt(targetInput.value) || 0;
    var container = $('#sealResult');
    var ownedTotal = ownedStatTotal();
    var effectiveTarget = Math.max(0, target - ownedTotal);

    if (target <= 0) {
      container.innerHTML = '<p style="color:var(--sub-fg);padding:20px 0;">' + tr('enterTarget') + '</p>';
      return;
    }

    if (effectiveTarget <= 0) {
      container.innerHTML =
        '<div class="seal-stat-card" style="border-color:var(--success);">' +
        '<p style="font-weight:700;color:var(--success);font-size:16px;margin-bottom:4px;">' + tr('targetAlready') + '</p>' +
        '<p style="font-size:13px;color:var(--sub-fg);">' + tr('yourOwned') + ownedTotal + ' ' + sealStat + '</p></div>';
      return;
    }

    var result = findOptimalSeals(sealStat, effectiveTarget, ownedIds());

    var html = '';
    if (ownedTotal > 0) {
      html += '<p style="font-size:12px;color:var(--sub-fg);margin-bottom:6px;">' + tr('owned') + ownedTotal + ' ' + sealStat +
        tr('need') + effectiveTarget + '</p>';
    }

    // Summary cards
    var totalWithOwned = result.totalStat + ownedTotal;
    html += '<div class="seal-result-summary">';
    html += '<div class="seal-stat-card"><div class="label">' + tr('totalStat') + sealStat + '</div><div class="value">+' + totalWithOwned + '</div></div>';
    html += '<div class="seal-stat-card"><div class="label">' + tr('totalCost') + '</div><div class="value" style="color:#f59e0b;">' +
      (result.totalCost >= 1000 ? (result.totalCost / 1000).toFixed(1) + 'B' : result.totalCost.toFixed(1) + 'M') +
      '</div></div>';
    html += '<div class="seal-stat-card"><div class="label">' + tr('sealsNeeded') + '</div><div class="value">' + result.seals.length + '</div></div>';
    html += '</div>';

    // Progress bar
    var pct = Math.min(100, (totalWithOwned / target) * 100);
    html += '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;background:' + SEAL_COLORS[sealStat] + '"></div></div>';
    html += '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--sub-fg);margin-bottom:10px;"><span>0</span><span>Target: ' + target + '</span></div>';

    if (result.seals.length > 0) {
      html += '<div style="font-weight:600;font-size:13px;margin-bottom:6px;">' + tr('recommended') + '</div>';
      html += '<div class="list-table-wrap" style="max-height:350px;"><table class="list-table"><thead><tr>';
      html += '<th>#</th><th>Seal</th><th>' + sealStat + '</th><th>Price (M)</th><th>Eff.</th>';
      html += '</tr></thead><tbody>';
      result.seals.forEach(function(s, i) {
        html += '<tr><td>' + (i+1) + '</td><td class="name-cell">' + escapeHtml(s.name) +
          '</td><td>+' + s.max + '</td><td>' + s.price.toFixed(1) +
          '</td><td>' + s.efficiency.toFixed(1) + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    container.innerHTML = html;
  }

  $('#sealCalcBtn').addEventListener('click', runSealCalc);
  $('#sealTarget').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') runSealCalc();
  });

  renderSealStats();
  renderSealBrowser();

  var savedSubtab = loadItem(SUBTAB_KEY);
  if (savedSubtab && savedSubtab !== 'seal-calc' && document.getElementById('subtab-' + savedSubtab)) {
    showSubtab(savedSubtab);
  }
}
