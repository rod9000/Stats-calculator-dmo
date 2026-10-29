// Aba Breakthrough: simulador do sistema de Breakthrough (Richard Sampson). Regras em breakthrough-calc.js,
// estrategia otima (programacao dinamica) em breakthrough-advisor.js, calculada no Worker.
import { $ } from './dom.js';
import { el } from './utils.js';
import { tr, i18n } from './i18n.js';
import { BT_ATTEMPTS, BT_CELLS, BT_POSITIVES, BT_NEGATIVES, BT_STATS, BT_TIERS } from './breakthrough-data.js';
import { statInfo, cellValue, rowMax, newRun, roll, canRoll, runFinished, summary, randomStats } from './breakthrough-calc.js';
import { bestMove, evaluateMoves, utilityOf, NO_MOVE } from './breakthrough-advisor.js';

var DEFAULT_WEIGHT = { pos: 1, neg: 0.2 }; // negativos pesam menos: costumam ser ignorados ou usados como descarte
var MOVES_SAMPLE = 15000;                  // partidas simuladas por jogada ao comparar alternativas
var TIE_PP = 0.5;                          // diferenca (pontos percentuais) abaixo da qual duas jogadas sao equivalentes

export function initBreakthrough() {
  var posSelects = [];
  var negSelects = [];
  var run = null;
  var last = null; // ultimo resultado, para a mensagem acompanhar a troca de idioma
  var weights = [];
  var solver = { key: '', sol: null, worker: null, progress: 0, failed: false };

  for (var w = 0; w < BT_POSITIVES + BT_NEGATIVES; w++) weights.push(w < BT_POSITIVES ? DEFAULT_WEIGHT.pos : DEFAULT_WEIGHT.neg);

  function locale() { return i18n._lang === 'en' ? 'en-US' : (i18n._lang === 'es' ? 'es-ES' : 'pt-BR'); }

  function fmtValue(v, pct) {
    return v.toLocaleString(locale(), { maximumFractionDigits: pct ? 1 : 0 }) + (pct ? '%' : '');
  }

  function signed(v, pct) {
    return (v > 0 ? '+' : v < 0 ? '−' : '') + fmtValue(Math.abs(v), pct);
  }

  function statName(key) { return tr('btStat' + key); }

  // Nome da linha; quando o mesmo stat aparece duas vezes na mesma lista, numera (AT #1, AT #2).
  function rowLabel(index) {
    var row = run.rows[index];
    var same = run.rows.filter(function(r) { return r.kind === row.kind && r.stat === row.stat; });
    if (same.length < 2) return statName(row.stat);
    return statName(row.stat) + ' #' + (same.indexOf(row) + 1);
  }

  function percent(v) { return (v * 100).toLocaleString(locale(), { maximumFractionDigits: 0 }); }
  function points(v) { return (v * 100).toLocaleString(locale(), { maximumFractionDigits: 1 }); }

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
    ensureSolution();
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

  // ===================== ESTRATEGIA (Worker) =====================
  function solveKey() {
    return run.rows.map(function(r, i) { return r.kind + r.stat + ':' + weights[i]; }).join(',');
  }

  // Resolve de novo so quando muda algo que altera a conta (stats ou pesos). Reiniciar com os mesmos reaproveita.
  function ensureSolution() {
    var key = solveKey();
    if (solver.key === key) return;
    if (solver.worker) solver.worker.terminate();
    solver.key = key;
    solver.sol = null;
    solver.progress = 0;
    solver.failed = false;
    try {
      var worker = new Worker(new URL('./breakthrough-worker.js', import.meta.url), { type: 'module' });
      solver.worker = worker;
      worker.onmessage = function(e) {
        if (solver.worker !== worker) return;
        if (e.data.done) {
          solver.sol = e.data.sol;
          solver.worker = null;
          worker.terminate();
          render();
        } else {
          solver.progress = e.data.progress;
          renderAdvice();
        }
      };
      worker.onerror = function() {
        if (solver.worker !== worker) return;
        solver.failed = true;
        solver.worker = null;
        renderAdvice();
      };
      worker.postMessage({ rows: run.rows.map(function(r) { return { kind: r.kind, stat: r.stat }; }), weights: weights.slice() });
    } catch (err) {
      solver.failed = true;
    }
  }

  function adviceOn() { return $('#btAdviceOn').checked; }

  // Linha recomendada agora (ou -1 sem estrategia pronta / sem recomendacao).
  function recommended() {
    if (!adviceOn() || !solver.sol || runFinished(run)) return -1;
    var ptr = run.rows.map(function(r) { return r.next; });
    var best = bestMove(solver.sol, ptr, run.tier, run.attemptsLeft);
    return best === NO_MOVE ? -1 : best;
  }

  // ===================== RENDER =====================
  function renderRow(row, index, rec) {
    var info = statInfo(row.stat);
    var rowEl = el('tr', 'bt-row ' + row.kind);
    rowEl.setAttribute('data-row', index);
    rowEl.appendChild(el('th', 'bt-stat', rowLabel(index)));
    for (var i = 0; i < BT_CELLS; i++) {
      var state = row.cells[i];
      var v = cellValue(row.kind, row.stat, i);
      var cls = 'bt-cell' + (state ? ' ' + state : '') + (v === 0 ? ' zero' : '');
      var td = el('td', cls);
      if (state === 'fail') {
        td.textContent = '×';
      } else if (!state && i === row.next && canRoll(run, index)) {
        td.className += ' next' + (rec === index ? ' rec' : '');
        var btn = el('button', 'bt-cell-btn', fmtValue(v, info.pct));
        btn.type = 'button';
        btn.setAttribute('aria-label', tr('btRollAria').replace('{stat}', rowLabel(index)).replace('{cell}', i + 1));
        btn.addEventListener('click', function(n) { return function() { rollRow(n); }; }(index));
        td.appendChild(btn);
      } else {
        td.textContent = fmtValue(v, info.pct);
      }
      rowEl.appendChild(td);
    }
    rowEl.appendChild(el('td', 'bt-total', signed(row.kind === 'pos' ? row.total : -row.total, info.pct) + ' / ' + fmtValue(rowMax(row.kind, row.stat), info.pct)));

    var wCell = el('td', 'bt-weight-cell');
    var input = el('input', 'bt-weight');
    input.type = 'number';
    input.min = '0';
    input.max = '9';
    input.step = '0.1';
    input.value = String(weights[index]);
    input.setAttribute('aria-label', tr('btWeight') + ' ' + rowLabel(index));
    input.addEventListener('change', function() {
      var n = parseFloat(String(input.value).replace(',', '.'));
      weights[index] = isNaN(n) ? DEFAULT_WEIGHT[row.kind] : Math.min(9, Math.max(0, Math.round(n * 10) / 10));
      ensureSolution();
      render();
    });
    wCell.appendChild(input);
    rowEl.appendChild(wCell);
    return rowEl;
  }

  function renderTable(kind, rec) {
    var table = el('table', 'bt-table');
    var head = el('tr');
    head.appendChild(el('th', 'bt-stat', tr(kind === 'pos' ? 'btPositives' : 'btNegatives')));
    for (var i = 1; i <= BT_CELLS; i++) head.appendChild(el('th', 'bt-num', String(i)));
    head.appendChild(el('th', 'bt-total', tr('btTotal')));
    var weightHead = el('th', 'bt-weight-cell', tr('btWeight'));
    weightHead.title = tr('btWeightHint');
    head.appendChild(weightHead);
    var thead = el('thead');
    thead.appendChild(head);
    table.appendChild(thead);
    var tbody = el('tbody');
    run.rows.forEach(function(row, index) {
      if (row.kind === kind) tbody.appendChild(renderRow(row, index, rec));
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
        .replace('{stat}', rowLabel(last.row))
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

  function renderAdvice() {
    var box = $('#btAdvice');
    box.textContent = '';
    if (!adviceOn()) return;
    if (solver.failed) { box.appendChild(el('div', 'bt-advice-line', tr('btAdviceError'))); return; }
    if (!solver.sol) {
      box.appendChild(el('div', 'bt-advice-line',
        tr('btAdviceComputing').replace('{pct}', Math.round(solver.progress * 100))));
      return;
    }
    if (runFinished(run)) { box.appendChild(el('div', 'bt-advice-line', tr('btAdviceDone'))); return; }

    var sol = solver.sol;
    var maxPoints = 0;
    run.rows.forEach(function(r, i) { if (r.kind === 'pos') maxPoints += weights[i]; });
    if (maxPoints <= 0) maxPoints = 1;

    var ptr = run.rows.map(function(r) { return r.next; });
    var best = bestMove(sol, ptr, run.tier, run.attemptsLeft);
    var q = evaluateMoves(sol, ptr, run.tier, run.attemptsLeft, MOVES_SAMPLE, Math.random);
    var now = utilityOf(run, sol.pre);
    var bestQ = best === NO_MOVE || q[best] === null ? 0 : q[best];

    box.appendChild(el('div', 'bt-advice-line bt-advice-best',
      tr('btAdviceBest').replace('{row}', rowLabel(best)).replace('{cell}', run.rows[best].next + 1)));
    box.appendChild(el('div', 'bt-advice-line',
      tr('btAdviceExpected')
        .replace('{now}', percent((now + bestQ) / maxPoints))
        .replace('{start}', percent(sol.value / maxPoints))));

    var alts = el('div', 'bt-alts');
    alts.appendChild(el('span', 'bt-alts-title', tr('btAdviceAlt')));
    q.forEach(function(v, i) {
      if (v === null) return;
      var delta = (v - bestQ) / maxPoints * 100;
      var tie = Math.abs(delta) < TIE_PP;
      var chip = el('span', 'bt-alt' + (i === best ? ' best' : ''));
      chip.appendChild(el('span', 'bt-alt-name', rowLabel(i)));
      chip.appendChild(el('b', '', i === best ? '★' : (tie ? '≈' : (delta > 0 ? '+' : '') + points(delta / 100) + ' pp')));
      chip.title = i === best ? tr('btAdviceBestTip') : (tie ? tr('btAdviceTie') : '');
      alts.appendChild(chip);
    });
    box.appendChild(alts);
  }

  function render() {
    renderStatus();
    var rec = recommended();
    var board = $('#btBoard');
    board.textContent = '';
    board.appendChild(renderTable('pos', rec));
    board.appendChild(renderTable('neg', rec));
    renderMessage();
    renderSummary();
    renderAdvice();
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
  $('#btAdviceOn').addEventListener('change', render);

  startRun();

  i18n.onChange(function() {
    fillOptionNames();
    if (run) render();
  });
}
