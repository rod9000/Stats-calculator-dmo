// Aba Breakthrough: simulador do sistema de Breakthrough (Richard Sampson). Regras em breakthrough-calc.js.
import { $ } from './dom.js';
import { el } from './utils.js';
import { tr, i18n } from './i18n.js';
import { BT_ATTEMPTS, BT_CELLS, BT_POSITIVES, BT_NEGATIVES, BT_STATS, BT_TIERS } from './breakthrough-data.js';
import { statInfo, cellValue, rowMax, newRun, roll, canRoll, runFinished, summary, randomStats } from './breakthrough-calc.js';

export function initBreakthrough() {
  var posSelects = [];
  var negSelects = [];
  var run = null;
  var last = null; // ultimo resultado, para a mensagem acompanhar a troca de idioma

  function locale() { return i18n._lang === 'en' ? 'en-US' : (i18n._lang === 'es' ? 'es-ES' : 'pt-BR'); }

  function fmtValue(v, pct) {
    return v.toLocaleString(locale(), { maximumFractionDigits: pct ? 1 : 0 }) + (pct ? '%' : '');
  }

  function signed(v, pct) {
    return (v > 0 ? '+' : v < 0 ? '−' : '') + fmtValue(Math.abs(v), pct);
  }

  function statName(key) { return tr('btStat' + key); }

  // ===================== SELETORES =====================
  function buildSelects(box, list, count, label) {
    box.textContent = '';
    for (var i = 0; i < count; i++) {
      var sel = el('select', 'bt-select');
      sel.setAttribute('aria-label', label + ' ' + (i + 1));
      BT_STATS.forEach(function(s) {
        var o = el('option', '', statName(s.key));
        o.value = s.key;
        sel.appendChild(o);
      });
      sel.addEventListener('change', startRun);
      box.appendChild(sel);
      list.push(sel);
    }
  }

  function fillOptionNames() {
    posSelects.concat(negSelects).forEach(function(sel) {
      Array.prototype.forEach.call(sel.options, function(o) { o.textContent = statName(o.value); });
    });
  }

  function selected(list) { return list.map(function(s) { return s.value; }); }

  function startRun() {
    run = newRun(selected(posSelects), selected(negSelects));
    last = null;
    render();
  }

  function rollRow(index) {
    var res = roll(run, index, Math.random());
    if (!res) return;
    last = res;
    render();
    // devolve o foco para a casa que ficou ativa, para dar para jogar so com o teclado
    var target = document.querySelector('#btBoard [data-row="' + index + '"] .bt-cell-btn') ||
                 document.querySelector('#btBoard .bt-cell-btn');
    if (target) target.focus();
  }

  // ===================== RENDER =====================
  function renderRow(row, index) {
    var info = statInfo(row.stat);
    var rowEl = el('tr', 'bt-row ' + row.kind);
    rowEl.setAttribute('data-row', index);
    rowEl.appendChild(el('th', 'bt-stat', statName(row.stat)));
    for (var i = 0; i < BT_CELLS; i++) {
      var state = row.cells[i];
      var v = cellValue(row.kind, row.stat, i);
      var cls = 'bt-cell' + (state ? ' ' + state : '') + (v === 0 ? ' zero' : '');
      var td = el('td', cls);
      if (state === 'fail') {
        td.textContent = '×';
      } else if (!state && i === row.next && canRoll(run, index)) {
        td.className += ' next';
        var btn = el('button', 'bt-cell-btn', fmtValue(v, info.pct));
        btn.type = 'button';
        btn.setAttribute('aria-label', tr('btRollAria').replace('{stat}', statName(row.stat)).replace('{cell}', i + 1));
        btn.addEventListener('click', function(n) { return function() { rollRow(n); }; }(index));
        td.appendChild(btn);
      } else {
        td.textContent = fmtValue(v, info.pct);
      }
      rowEl.appendChild(td);
    }
    var tot = el('td', 'bt-total', signed(row.kind === 'pos' ? row.total : -row.total, info.pct) + ' / ' + fmtValue(rowMax(row.kind, row.stat), info.pct));
    rowEl.appendChild(tot);
    return rowEl;
  }

  function renderTable(kind) {
    var table = el('table', 'bt-table');
    var head = el('tr');
    head.appendChild(el('th', 'bt-stat', tr(kind === 'pos' ? 'btPositives' : 'btNegatives')));
    for (var i = 1; i <= BT_CELLS; i++) head.appendChild(el('th', 'bt-num', String(i)));
    head.appendChild(el('th', 'bt-total', tr('btTotal')));
    var thead = el('thead');
    thead.appendChild(head);
    table.appendChild(thead);
    var tbody = el('tbody');
    run.rows.forEach(function(row, index) {
      if (row.kind === kind) tbody.appendChild(renderRow(row, index));
    });
    table.appendChild(tbody);
    var wrap = el('div', 'bt-table-wrap');
    wrap.appendChild(table);
    return wrap;
  }

  function renderStatus() {
    var used = BT_ATTEMPTS - run.attemptsLeft;
    $('#btAttempts').textContent = run.attemptsLeft + '/' + BT_ATTEMPTS;
    $('#btAttemptsBar').style.width = (run.attemptsLeft / BT_ATTEMPTS * 100) + '%';
    var t = BT_TIERS[run.tier];
    $('#btChance').textContent = t.total + '%';
    $('#btSimple').textContent = t.simple + '%';
    $('#btDouble').textContent = t.double + '%';
    $('#btTriple').textContent = t.triple + '%';
    var ladder = $('#btLadder');
    ladder.textContent = '';
    BT_TIERS.forEach(function(tier, i) {
      ladder.appendChild(el('span', 'bt-step' + (i === run.tier ? ' on' : ''), tier.total + '%'));
    });
    $('#btResetBtn').disabled = used === 0;
    var locked = used > 0;
    posSelects.concat(negSelects).forEach(function(s) { s.disabled = locked; });
    $('#btRandomBtn').disabled = locked;
  }

  function renderMessage() {
    var box = $('#btMsg');
    var text = '';
    if (last) {
      var r = run.rows[last.row];
      var pct = statInfo(r.stat).pct;
      var key = last.outcome === 0 ? 'btMsgFail' : 'btMsgOk' + last.outcome;
      text = tr(key)
        .replace('{stat}', statName(r.stat))
        .replace('{from}', last.from + 1)
        .replace('{to}', last.to + 1)
        .replace('{value}', signed(r.kind === 'pos' ? last.gained : -last.gained, pct));
    }
    if (runFinished(run)) text += (text ? ' ' : '') + tr('btMsgDone');
    box.textContent = text || tr('btMsgStart');
    box.className = 'bt-msg' + (last ? (last.outcome === 0 ? ' fail' : ' ok') : '');
  }

  function renderSummary() {
    var box = $('#btSummary');
    box.textContent = '';
    var items = summary(run);
    if (!items.length) {
      box.appendChild(el('div', 'card-hint', tr('btSummaryEmpty')));
      return;
    }
    items.forEach(function(it) {
      var chip = el('span', 'bt-chip ' + (it.value >= 0 ? 'up' : 'down'));
      chip.appendChild(el('span', 'bt-chip-name', statName(it.key)));
      chip.appendChild(el('b', '', signed(it.value, it.pct)));
      box.appendChild(chip);
    });
  }

  function render() {
    renderStatus();
    var board = $('#btBoard');
    board.textContent = '';
    board.appendChild(renderTable('pos'));
    board.appendChild(renderTable('neg'));
    renderMessage();
    renderSummary();
  }

  // ===================== INICIO =====================
  buildSelects($('#btPosSelects'), posSelects, BT_POSITIVES, tr('btPositives'));
  buildSelects($('#btNegSelects'), negSelects, BT_NEGATIVES, tr('btNegatives'));
  // combinacao padrao popular: AT/AT + CT; negativos que costumam ser ignorados
  var defaults = ['AT', 'AT', 'CT', 'EV', 'BL'];
  posSelects.concat(negSelects).forEach(function(sel, i) { sel.value = defaults[i]; });

  $('#btResetBtn').addEventListener('click', startRun);
  $('#btRandomBtn').addEventListener('click', function() {
    var pos = randomStats(BT_POSITIVES, Math.random);
    var neg = randomStats(BT_NEGATIVES, Math.random);
    posSelects.forEach(function(s, i) { s.value = pos[i]; });
    negSelects.forEach(function(s, i) { s.value = neg[i]; });
    startRun();
  });

  startRun();

  i18n.onChange(function() {
    fillOptionNames();
    if (run) render();
  });
}
