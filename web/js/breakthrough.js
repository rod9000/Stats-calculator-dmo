// Aba Breakthrough: simulador do sistema de Breakthrough (Richard Sampson). Regras em breakthrough-calc.js,
// estrategia otima (programacao dinamica) em breakthrough-advisor.js, calculada no Worker.
import { $ } from './dom.js';
import { el } from './utils.js';
import { tr, i18n } from './i18n.js';
import { BT_ATTEMPTS, BT_CELLS, BT_POSITIVES, BT_NEGATIVES, BT_STATS, BT_DEFAULT_MODEL } from './breakthrough-data.js';
import { statInfo, cellValue, rowMax, newRun, modelKey, swapModel, roll, applyOutcome, cloneRun, setTierByPercent, canRoll, runFinished, summary, randomStats } from './breakthrough-calc.js';
import { bestMove, evaluateMoves, utilityOf, NO_MOVE } from './breakthrough-advisor.js';
import { loadLog, logAttempt, unlogAttempt, clearLog, exportText, importText, summarize, buildModel, levelRows } from './breakthrough-learn.js';
import { loadItem, saveItem } from './storage.js';

var DEFAULT_WEIGHT = { pos: 1, neg: 0.2 }; // negativos pesam menos: costumam ser ignorados ou usados como descarte
var MOVES_SAMPLE = 15000;                  // partidas simuladas por jogada ao comparar alternativas
var TIE_PP = 0.5;                          // diferenca (pontos percentuais) abaixo da qual duas jogadas sao equivalentes

export function initBreakthrough() {
  var posSelects = [];
  var negSelects = [];
  var run = null;
  var last = null; // ultimo resultado, para a mensagem acompanhar a troca de idioma
  var weights = [];
  var mode = 'sim';    // 'sim' = simulador (sorteia), 'real' = ajudante (o jogador informa o resultado)
  var saved = { sim: null, real: null }; // cada modo guarda a sua rodada; alternar nao mistura as duas
  var history = [];   // modo ajudante: estados anteriores, para desfazer
  var realPick = null; // linha escolhida a mao no modo jogo real (null = a recomendada)
  var snapNote = '';   // aviso quando a chance digitada foi arredondada para um degrau do modelo
  var log = loadLog();     // tentativas registradas no Ajudante (localStorage); e delas que o modelo aprende
  var runId = 0;           // id da rodada atual do Ajudante dentro do registro
  var typedChance = null;  // chance que o jogador digitou para a proxima tentativa (so o que ele digita vira evidencia)
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
    run = newRun(selected(posSelects), selected(negSelects), currentModel());
    runId = Date.now();
    last = null;
    history = [];
    realPick = null;
    snapNote = '';
    typedChance = null;
    ensureSolution();
    render();
  }

  function realOn() { return mode === 'real'; }

  // Troca simulador <-> ajudante. Cada um volta de onde parou; na primeira vez comeca uma rodada nova com os mesmos stats.
  function setMode(next) {
    if (next === mode) return;
    saved[mode] = { run: run, last: last, history: history, realPick: realPick, snapNote: snapNote, runId: runId, typedChance: typedChance };
    mode = next;
    var s = saved[mode];
    if (s) {
      run = s.run; last = s.last; history = s.history; realPick = s.realPick; snapNote = s.snapNote; runId = s.runId; typedChance = s.typedChance;
      posSelects.concat(negSelects).forEach(function(sel, i) { sel.value = run.rows[i].stat; });
      ensureSolution();
      render();
    } else {
      startRun();
    }
  }

  function renderMode() {
    var real = realOn();
    $('#btModeSim').classList.toggle('active', !real);
    $('#btModeHelper').classList.toggle('active', real);
    $('#btModeSim').setAttribute('aria-pressed', String(!real));
    $('#btModeHelper').setAttribute('aria-pressed', String(real));
    $('#btRandomBtn').hidden = real; // sortear stats so faz sentido no simulador
    $('#btHint').textContent = tr(real ? 'btHintHelper' : 'btHint');
  }

  function rollRow(index) {
    if (realOn()) { // no jogo real o clique so escolhe a linha; o resultado e informado no painel
      realPick = index;
      renderReal();
      return;
    }
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
    return run.rows.map(function(r, i) { return r.kind + r.stat + ':' + weights[i]; }).join(',') + '|' + modelKey(run.model);
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
      worker.postMessage({ rows: run.rows.map(function(r) { return { kind: r.kind, stat: r.stat }; }), weights: weights.slice(), model: run.model });
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
    var t = run.model.tiers[run.tier];
    $('#btChance').textContent = t.total + '%';
    $('#btSimple').textContent = t.simple + '%';
    $('#btDouble').textContent = t.double + '%';
    $('#btTriple').textContent = t.triple + '%';
    var ladder = $('#btLadder');
    ladder.textContent = '';
    run.model.tiers.forEach(function(tier, i) {
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
    box.textContent = text || tr(realOn() ? 'btRealMsgStart' : 'btMsgStart');
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

  // ===================== MODO JOGO REAL =====================
  function fmtNum(n) { return n.toLocaleString(locale(), { maximumFractionDigits: 1 }); }

  function renderReal() {
    var box = $('#btReal');
    box.hidden = !realOn();
    if (!realOn()) return;
    var finished = runFinished(run);
    var t = run.model.tiers[run.tier];
    $('#btRealNext').textContent = finished ? tr('btMsgDone') :
      tr('btRealNext').replace('{ok}', fmtNum(t.total)).replace('{fail}', fmtNum(100 - t.total))
        .replace('{simple}', fmtNum(t.simple)).replace('{double}', fmtNum(t.double)).replace('{triple}', fmtNum(t.triple));

    var rec = recommended();
    var pending = [];
    run.rows.forEach(function(r, i) { if (canRoll(run, i)) pending.push(i); });
    var pick = pending.indexOf(realPick) !== -1 ? realPick : (pending.indexOf(rec) !== -1 ? rec : pending[0]);
    var sel = $('#btRealRow');
    sel.textContent = '';
    pending.forEach(function(i) {
      var o = el('option', '', rowLabel(i) + ' · ' + tr('btRealCell').replace('{cell}', run.rows[i].next + 1) + (i === rec ? ' ★' : ''));
      o.value = String(i);
      sel.appendChild(o);
    });
    if (pick !== undefined) sel.value = String(pick);
    sel.disabled = finished;

    var chanceInput = $('#btRealChance');
    chanceInput.placeholder = String(t.total); // previsto pelo modelo; so o valor digitado conta como evidencia
    if (document.activeElement !== chanceInput) chanceInput.value = typedChance === null ? '' : String(typedChance);
    chanceInput.disabled = finished;
    box.querySelectorAll('.bt-res').forEach(function(b) { b.disabled = finished; });
    $('#btRealUndo').disabled = history.length === 0;
    $('#btRealNote').textContent = snapNote;
  }

  function learnOn() { return $('#btLearnOn').checked; }

  // Modelo da rodada do Ajudante: o aprendido (se ligado e houver evidencia) ou o assumido. O simulador usa sempre o assumido.
  function currentModel() {
    return realOn() && learnOn() ? buildModel(summarize(log)) : BT_DEFAULT_MODEL;
  }

  // Depois de registrar, desfazer ou importar: se o modelo aprendido mudou, a rodada passa a usa-lo (mantendo a chance atual).
  function refreshModel() {
    if (!realOn()) return;
    var m = currentModel();
    if (modelKey(m) !== modelKey(run.model)) swapModel(run, m);
    ensureSolution();
  }

  function recordOutcome(outcome) {
    var row = parseInt($('#btRealRow').value, 10);
    if (isNaN(row)) return;
    var before = cloneRun(run);
    var res = applyOutcome(run, row, outcome);
    if (!res) return;
    log = logAttempt(log, runId, typedChance, outcome);
    history.push({ run: before, last: last, typed: typedChance, logged: true });
    last = res;
    realPick = null;
    snapNote = '';
    typedChance = null;
    refreshModel();
    render();
  }

  function undoReal() {
    var h = history.pop();
    if (!h) return;
    if (h.logged) log = unlogAttempt(log, runId);
    run = h.run;
    last = h.last;
    typedChance = h.typed;
    realPick = null;
    snapNote = '';
    refreshModel();
    render();
  }

  // O jogador digita a chance que o jogo mostra; o modelo usa o degrau mais proximo e avisa quando nao bate exato.
  function setChanceFromGame() {
    var input = $('#btRealChance');
    var text = String(input.value).replace(',', '.').trim();
    var snapshot = { run: cloneRun(run), last: last, typed: typedChance, logged: false };
    if (text === '') { // apagou: volta a nao ter evidencia para esta tentativa
      if (typedChance !== null) { history.push(snapshot); typedChance = null; }
      snapNote = '';
    } else {
      var n = Math.round(parseFloat(text) * 10) / 10;
      if (isNaN(n) || n <= 0 || n >= 100) {
        snapNote = tr('btRealRange');
      } else {
        history.push(snapshot);
        var r = setTierByPercent(run, n);
        typedChance = n;
        snapNote = r.exact ? '' : tr('btRealSnap').replace('{typed}', fmtNum(n)).replace('{tier}', run.model.tiers[r.tier].total);
      }
    }
    input.value = typedChance === null ? '' : String(typedChance);
    render();
  }

  // ===================== APRENDIZADO =====================
  // Destino que o modelo assumido preve para a chance c (null se c nao e um degrau assumido).
  function assumedDest(c, which) {
    var tiers = BT_DEFAULT_MODEL.tiers;
    for (var i = 0; i < tiers.length; i++) {
      if (tiers[i].total === c) return tiers[BT_DEFAULT_MODEL[which][i]].total;
    }
    return null;
  }

  function destCell(d, assumed) {
    var td = el('td', 'bt-learn-dest');
    if (!d) { td.textContent = '—'; return td; }
    td.textContent = d.to + '% (' + d.count + '/' + d.total + ')';
    if (assumed !== null && assumed !== d.to) {
      td.classList.add('diff');
      td.title = tr('btLearnDiff').replace('{a}', assumed);
    }
    return td;
  }

  function renderLearn() {
    if (!realOn()) return;
    var sum = summarize(log);
    $('#btLearnStatus').textContent = tr('btLearnStatus')
      .replace('{n}', sum.withChance).replace('{all}', sum.attempts).replace('{runs}', log.length) + ' ' +
      tr(run.model.learned ? 'btLearnModelLearned' : 'btLearnModelDefault');
    var box = $('#btLearnTable');
    box.textContent = '';
    var rows = levelRows(sum);
    if (!rows.length) { box.appendChild(el('div', 'card-hint', tr('btLearnEmpty'))); return; }
    var table = el('table', 'bt-table bt-learn-table');
    var head = el('tr');
    ['btLearnColChance', 'btLearnColN', 'btLearnColRate', 'btLearnColFail', 'btLearnColOk'].forEach(function(k) {
      head.appendChild(el('th', '', tr(k)));
    });
    var thead = el('thead');
    thead.appendChild(head);
    table.appendChild(thead);
    var tbody = el('tbody');
    rows.forEach(function(r) {
      var rowEl = el('tr');
      rowEl.appendChild(el('td', 'bt-learn-c', r.c + '%'));
      rowEl.appendChild(el('td', '', String(r.n)));
      var rate = el('td', 'bt-learn-rate' + (r.off ? ' off' : ''),
        Math.round(r.rate * 100) + '% (' + Math.round(r.lo * 100) + '–' + Math.round(r.hi * 100) + ')' + (r.off ? ' ⚠' : ''));
      if (r.off) rate.title = tr('btLearnOff');
      rowEl.appendChild(rate);
      rowEl.appendChild(destCell(r.failTo, assumedDest(r.c, 'onFail')));
      rowEl.appendChild(destCell(r.okTo, assumedDest(r.c, 'onOk')));
      tbody.appendChild(rowEl);
    });
    table.appendChild(tbody);
    var wrap = el('div', 'bt-table-wrap');
    wrap.appendChild(table);
    box.appendChild(wrap);
  }

  function learnMessage(key, n) { $('#btLearnMsg').textContent = key ? tr(key).replace('{n}', n) : ''; }

  function downloadLog() {
    var blob = new Blob([exportText(log)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'dmo-breakthrough-dados.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
  }

  function importFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function() {
      try {
        var res = importText(log, String(reader.result));
        log = res.log;
        learnMessage('btLearnImported', res.added);
        refreshModel();
        render();
      } catch (err) {
        learnMessage('btLearnImportError', 0);
      }
    };
    reader.readAsText(file);
  }

  function render() {
    renderMode();
    renderStatus();
    renderReal();
    renderLearn();
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
  $('#btModeSim').addEventListener('click', function() { setMode('sim'); });
  $('#btModeHelper').addEventListener('click', function() { setMode('real'); });
  $('#btRealRow').addEventListener('change', function() { realPick = parseInt(this.value, 10); });
  $('#btRealChance').addEventListener('change', setChanceFromGame);
  $('#btRealUndo').addEventListener('click', undoReal);
  $('#btLearnOn').checked = loadItem('dmo.bt.learn') !== '0';
  $('#btLearnOn').addEventListener('change', function() {
    saveItem('dmo.bt.learn', this.checked ? '1' : '0');
    refreshModel();
    render();
  });
  $('#btLearnExport').addEventListener('click', downloadLog);
  $('#btLearnImport').addEventListener('click', function() { $('#btLearnFile').click(); });
  $('#btLearnFile').addEventListener('change', function() { importFile(this.files[0]); this.value = ''; });
  $('#btLearnClear').addEventListener('click', function() {
    if (!window.confirm(tr('btLearnConfirmClear'))) return;
    log = clearLog();
    learnMessage('', 0);
    refreshModel();
    render();
  });

  $('#btReal').querySelectorAll('.bt-res').forEach(function(b) {
    b.addEventListener('click', function() { recordOutcome(parseInt(b.getAttribute('data-outcome'), 10)); });
  });

  startRun();

  i18n.onChange(function() {
    fillOptionNames();
    if (run) render();
  });
}
