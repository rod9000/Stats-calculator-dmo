// Aba Clothing: set Frontier (Spirit). Mostra o efeito do set, os valores por nivel de cada peca e a reforma de +10 a +15.
import { $ } from './dom.js';
import { el } from './utils.js';
import { CLO_MAX_LEVEL, CLO_TIERS, CLO_FRONTIER_SET, CLO_FRONTIER_PIECES, CLO_REFORM, CLO_REFORM_FRAGMENTS } from './clothing-data.js';

function tierOf(level) {
  for (var i = 0; i < CLO_TIERS.length; i++) {
    if (level >= CLO_TIERS[i].from && level <= CLO_TIERS[i].to) return i;
  }
  return -1;
}

// Valor do atributo no nivel. Interpola do minimo ao maximo dentro do tier (estimativa: a wiki so da a faixa).
function statValue(stat, level) {
  var i = tierOf(level);
  if (i < 0) return null;
  var r = stat.tiers[i];
  if (!r || (r.min === 0 && r.max === 0)) return null;
  var t = CLO_TIERS[i];
  var span = t.to - t.from;
  var frac = span ? (level - t.from) / span : 1;
  return r.min + (r.max - r.min) * frac;
}

function fmtValue(v, unit) {
  if (unit === 'pct') return (Math.round(v * 10) / 10).toLocaleString('pt-BR') + '%';
  return Math.round(v).toLocaleString('pt-BR');
}

// Texto da celula: valor do nivel e o ganho em relacao ao nivel anterior
function cellText(stat, level) {
  var v = statValue(stat, level);
  if (v === null) return '—';
  var txt = fmtValue(v, stat.unit);
  var prev = level > 0 ? statValue(stat, level - 1) : null;
  if (prev !== null && Math.abs(v - prev) > 0.0001) txt += '  (+' + fmtValue(v - prev, stat.unit) + ')';
  return txt;
}

function card(title, hint) {
  var c = el('div', 'card');
  c.appendChild(el('div', 'card-title', title));
  if (hint) c.appendChild(el('div', 'card-hint', hint));
  return c;
}

function table(headers, rows) {
  var wrap = el('div', 'list-table-wrap');
  var t = el('table', 'list-table');
  var thead = el('thead');
  var hr = el('tr');
  headers.forEach(function(h) { hr.appendChild(el('th', null, h)); });
  thead.appendChild(hr);
  t.appendChild(thead);
  var tb = el('tbody');
  rows.forEach(function(r) {
    var tr = el('tr');
    r.forEach(function(c) { tr.appendChild(el('td', null, c)); });
    tb.appendChild(tr);
  });
  t.appendChild(tb);
  wrap.appendChild(t);
  return wrap;
}

function setCard() {
  var c = card('Set Frontier: efeito de ' + CLO_FRONTIER_SET.pieces + ' peças');
  var ul = el('ul');
  CLO_FRONTIER_SET.effects.forEach(function(e) { ul.appendChild(el('li', null, e)); });
  c.appendChild(ul);
  return c;
}

function renderPiece(container, piece) {
  container.textContent = '';
  var headers = ['Nível'].concat(piece.stats.map(function(s) { return s.label; }));
  var rows = [];
  for (var lv = 0; lv <= CLO_MAX_LEVEL; lv++) {
    var row = ['+' + lv];
    piece.stats.forEach(function(s) { row.push(cellText(s, lv)); });
    rows.push(row);
  }
  container.appendChild(table(headers, rows));
}

function pieceCard() {
  var c = card('Peças do set Frontier',
    'Valores por nível: a wiki dá só a faixa de cada tier (0–4, 5–9, 10–15). Os valores de cada nível são interpolados (estimativa). Entre parênteses, o ganho em relação ao nível anterior.');
  var sel = el('select', 'clo-select');
  CLO_FRONTIER_PIECES.forEach(function(p, i) {
    var o = el('option', null, p.name + ' (' + p.slot + ')');
    o.value = String(i);
    sel.appendChild(o);
  });
  var body = el('div');
  sel.addEventListener('change', function() { renderPiece(body, CLO_FRONTIER_PIECES[Number(sel.value)]); });
  c.appendChild(sel);
  c.appendChild(body);
  renderPiece(body, CLO_FRONTIER_PIECES[0]);
  return c;
}

function reformCard() {
  var c = card('Reforma +10 em diante',
    'Valores de sucesso e custo: antes → agora. Vale para a reforma das peças do set. Ordem dos fragmentos ainda a confirmar.');
  var headers = ['Etapa', 'Nível', 'Sucesso', 'Fracasso', 'Destruição', 'Custo/sessão'].concat(CLO_REFORM_FRAGMENTS);
  var rows = CLO_REFORM.map(function(s) {
    return [
      s.stage,
      '+' + s.from + ' → +' + s.to,
      s.success.before + '% → ' + s.success.now + '%',
      s.fail + '%',
      s.destroy + '%',
      s.cost.before + ' T → ' + s.cost.now + ' T'
    ].concat(s.fragments.map(String));
  });
  c.appendChild(table(headers, rows));
  return c;
}

function fmtNum(n) {
  return (Math.round(n * 10) / 10).toLocaleString('pt-BR');
}

function numInput(value, min, max, step, onInput) {
  var i = el('input');
  i.type = 'number';
  i.min = String(min);
  i.max = String(max);
  i.step = String(step);
  i.value = String(value);
  i.style.width = '6em';
  i.addEventListener('input', function() {
    var v = Number(i.value);
    if (!isFinite(v)) v = 0;
    onInput(Math.min(max, Math.max(min, v)));
  });
  return i;
}

function setVal(inp, v) {
  if (inp.value !== String(v)) inp.value = String(v);
}

function div(cls, text) { return el('div', cls, text); }

var PIECE_ICON = { helmet: '🧢', accessory: '🕶️', top: '👕', bottom: '👖', gloves: '🧤', shoes: '👟' };

function statLines(piece, level) {
  var out = [];
  piece.stats.forEach(function(s) {
    var v = statValue(s, level);
    if (v !== null) out.push(s.label + ' ' + fmtValue(v, s.unit));
  });
  return out;
}

function fillSide(node, title, lines) {
  node.textContent = '';
  node.appendChild(div('clo-cmp-title', title));
  lines.forEach(function(l) { node.appendChild(div('clo-cmp-line', l)); });
}

// Simulador de reforma no formato da tela "Equipment Enchant" do jogo.
// Cada etapa (A, B, C...) tem chance de sucesso, de destruicao (fracasso = o que sobra) e custo.
// Backup Chip e Hacking Tool: efeitos configuraveis (Backup Chip evita a destruicao; Hacking Tool soma % de sucesso). Tudo so na memoria da pagina.
function simCard() {
  var first = CLO_REFORM[0].from;
  var last = CLO_REFORM[CLO_REFORM.length - 1].to;
  var c = card('Simulador de reforma',
    'Segue a tela de Equipment Enchant do jogo: cada clique gasta o custo e os fragmentos da etapa e sorteia o resultado. Os atributos (antes → depois) são estimados.');
  var steps = CLO_REFORM.map(function(s) {
    return { from: s.from, to: s.to, success: s.success.now, destroy: s.destroy, cost: s.cost.now, fragments: s.fragments };
  });
  var cfg = { piece: 0, backupOwned: 1, toolOwned: 0, backupUsed: 0, toolUsed: 0, toolBonus: 0 };
  var mats = [10000, 10000, 10000];
  var matInputs = [];
  var needEls = [];
  var state = null;

  // ----- seletores de item e nivel inicial
  var pieceSel = el('select');
  CLO_FRONTIER_PIECES.forEach(function(p, i) {
    var o = el('option', null, p.name + ' (' + p.slot + ')');
    o.value = String(i);
    pieceSel.appendChild(o);
  });
  var startSel = el('select');
  steps.forEach(function(st) {
    var o = el('option', null, 'Começar em +' + st.from);
    o.value = String(st.from);
    startSel.appendChild(o);
  });
  var resetBtn = el('button', 'dsc-btn', 'Novo item');
  resetBtn.type = 'button';
  var bar = div('clo-sim-bar');
  bar.appendChild(pieceSel);
  bar.appendChild(startSel);
  bar.appendChild(resetBtn);
  c.appendChild(bar);

  // ----- painel estilo jogo
  var panel = div('clo-enchant');
  panel.appendChild(div('clo-enchant-title', 'Reforço de equipamento'));
  var nameEl = div('clo-enchant-name');
  var iconEl = div('clo-item-icon');
  panel.appendChild(nameEl);
  panel.appendChild(iconEl);

  function makeSlot(glyph, label, usedKey, ownedKey) {
    var root = div('clo-side');
    var row = div('clo-counter');
    var down = el('button', 'clo-arrow', '▼');
    var up = el('button', 'clo-arrow', '▲');
    down.type = 'button';
    up.type = 'button';
    var txt = el('span', 'clo-count', '');
    row.appendChild(down);
    row.appendChild(txt);
    row.appendChild(up);
    root.appendChild(div('clo-slot', glyph));
    root.appendChild(row);
    root.appendChild(div('clo-label', label));
    function refresh() {
      cfg[usedKey] = Math.min(cfg[usedKey], cfg[ownedKey]);
      txt.textContent = cfg[usedKey] + '/' + cfg[ownedKey];
    }
    down.addEventListener('click', function() { cfg[usedKey] = Math.max(0, cfg[usedKey] - 1); update(); });
    up.addEventListener('click', function() { cfg[usedKey] = Math.min(cfg[ownedKey], cfg[usedKey] + 1); update(); });
    return { root: root, refresh: refresh };
  }

  var chipPct = div('clo-chip-pct');
  var chip = div('clo-chip');
  chip.appendChild(chipPct);
  var backup = makeSlot('💾', 'Backup Chip', 'backupUsed', 'backupOwned');
  var tool = makeSlot('🛠️', 'Hacking Tool', 'toolUsed', 'toolOwned');
  var mid = div('clo-mid');
  mid.appendChild(backup.root);
  mid.appendChild(chip);
  mid.appendChild(tool.root);
  panel.appendChild(mid);

  var matsRow = div('clo-mats');
  CLO_REFORM_FRAGMENTS.forEach(function(name, k) {
    var m = div('clo-mat');
    m.appendChild(div('clo-mat-box clo-mat-' + k, '▣'));
    var line = div('clo-mat-count');
    var inp = numInput(mats[k], 0, 1000000000, 1, function(v) { mats[k] = v; update(); });
    inp.style.width = '5em';
    var need = el('span', null, '');
    line.appendChild(inp);
    line.appendChild(document.createTextNode(' / '));
    line.appendChild(need);
    m.appendChild(line);
    m.appendChild(div('clo-label', name));
    matsRow.appendChild(m);
    matInputs.push(inp);
    needEls.push(need);
  });
  panel.appendChild(matsRow);

  var cmpL = div('clo-cmp-side');
  var cmpR = div('clo-cmp-side');
  var cmp = div('clo-compare');
  cmp.appendChild(cmpL);
  cmp.appendChild(div('clo-cmp-arrow', '»'));
  cmp.appendChild(cmpR);
  panel.appendChild(cmp);

  var btn = el('button', 'clo-enchant-btn');
  btn.type = 'button';
  panel.appendChild(btn);
  var costEl = div('clo-cost');
  panel.appendChild(costEl);
  c.appendChild(panel);

  // ----- ajustes: chances/custos por etapa e itens de apoio
  var details = el('details', 'clo-settings');
  details.appendChild(el('summary', null, 'Ajustar chances, custos e itens'));
  var wrap = el('div', 'list-table-wrap');
  var t = el('table', 'list-table');
  var thead = el('thead');
  var hr = el('tr');
  ['Etapa', 'Nível', 'Sucesso %', 'Destruição %', 'Fracasso %', 'Custo (T)'].concat(CLO_REFORM_FRAGMENTS).forEach(function(h) {
    hr.appendChild(el('th', null, h));
  });
  thead.appendChild(hr);
  t.appendChild(thead);
  var tb = el('tbody');
  var rowEls = [];
  steps.forEach(function(st, i) {
    var tr = el('tr');
    var failTd = el('td', null, '');
    var sIn, dIn, cIn;
    function sync() { failTd.textContent = fmtNum(100 - st.success - st.destroy) + '%'; }
    sIn = numInput(st.success, 0, 100, 1, function(v) {
      st.success = v;
      if (st.success + st.destroy > 100) { st.destroy = 100 - st.success; dIn.value = String(st.destroy); }
      sync();
      update();
    });
    dIn = numInput(st.destroy, 0, 100, 1, function(v) {
      st.destroy = Math.min(v, 100 - st.success);
      if (st.destroy !== v) dIn.value = String(st.destroy);
      sync();
    });
    cIn = numInput(st.cost, 0, 1000000000, 0.1, function(v) { st.cost = v; update(); });
    tr.appendChild(el('td', null, String.fromCharCode(65 + i)));
    tr.appendChild(el('td', null, '+' + st.from + ' → +' + st.to));
    [sIn, dIn].forEach(function(inp) { var td = el('td'); td.appendChild(inp); tr.appendChild(td); });
    tr.appendChild(failTd);
    var tdC = el('td');
    tdC.appendChild(cIn);
    tr.appendChild(tdC);
    st.fragments.forEach(function(f) { tr.appendChild(el('td', null, String(f))); });
    sync();
    tb.appendChild(tr);
    rowEls.push(tr);
  });
  t.appendChild(tb);
  wrap.appendChild(t);
  details.appendChild(wrap);

  function field(text, input) {
    var l = el('label', 'clo-field', text + ' ');
    l.appendChild(input);
    return l;
  }
  var backupIn = numInput(cfg.backupOwned, 0, 999999, 1, function(v) { cfg.backupOwned = v; update(); });
  var toolIn = numInput(cfg.toolOwned, 0, 999999, 1, function(v) { cfg.toolOwned = v; update(); });
  var bonusIn = numInput(cfg.toolBonus, 0, 100, 0.5, function(v) { cfg.toolBonus = v; update(); });
  var extra = div('clo-extra');
  extra.appendChild(field('Backup Chip possuídos', backupIn));
  extra.appendChild(field('Hacking Tool possuídos', toolIn));
  extra.appendChild(field('Bônus de sucesso por Hacking Tool (%)', bonusIn));
  details.appendChild(extra);
  details.appendChild(div('card-hint', 'Backup Chip: quando usado, uma destruição vira fracasso. Hacking Tool: soma o bônus acima à chance de sucesso. Ambos são gastos a cada tentativa em que forem usados. Efeitos supostos: ajuste se o jogo for diferente (bônus começa em 0).'));
  c.appendChild(details);

  var status = div('card-hint');
  var logBox = div('card-hint');
  logBox.style.whiteSpace = 'pre-line';
  c.appendChild(status);
  c.appendChild(logBox);

  // ----- logica
  function fresh() {
    state = { level: Number(startSel.value) || first, destroyed: false, tries: 0, ok: 0, fail: 0, boom: 0, costT: 0, frag: [0, 0, 0], log: [] };
  }
  function stepOf(level) { return steps[level - first] || null; }
  function isDone() { return state.destroyed || state.level >= last; }
  function chance() {
    var st = stepOf(state.level);
    return st ? Math.min(100, st.success + cfg.toolUsed * cfg.toolBonus) : 0;
  }
  function lacking() {
    var st = stepOf(state.level);
    if (!st) return false;
    for (var k = 0; k < 3; k++) if (mats[k] < st.fragments[k]) return true;
    return false;
  }

  function update() {
    var piece = CLO_FRONTIER_PIECES[cfg.piece];
    var done = isDone();
    var st = stepOf(state.level);
    var lack = !done && lacking();
    nameEl.textContent = '(Frontier) ' + piece.name;
    iconEl.textContent = PIECE_ICON[piece.id] || '▣';
    chipPct.textContent = done ? '—' : chance().toFixed(2) + '%';
    backup.refresh();
    tool.refresh();
    setVal(backupIn, cfg.backupOwned);
    setVal(toolIn, cfg.toolOwned);
    for (var k = 0; k < 3; k++) {
      setVal(matInputs[k], mats[k]);
      needEls[k].textContent = (st && !done) ? String(st.fragments[k]) : '—';
      matInputs[k].className = (st && !done && mats[k] < st.fragments[k]) ? 'clo-mat-input lack' : 'clo-mat-input';
    }
    fillSide(cmpL, 'Reforço +' + state.level, statLines(piece, state.level));
    fillSide(cmpR, done ? 'Reforço —' : 'Reforço +' + (state.level + 1), done ? [] : statLines(piece, state.level + 1));
    if (state.destroyed) btn.textContent = 'Item destruído';
    else if (state.level >= last) btn.textContent = 'Nível máximo (+' + last + ')';
    else if (lack) btn.textContent = 'Materiais insuficientes';
    else btn.textContent = 'Reforçar +' + state.level + ' → +' + (state.level + 1);
    btn.disabled = done || lack;
    costEl.textContent = (st && !done) ? 'Custo: ' + fmtNum(st.cost) + ' T · Fragmentos: ' + st.fragments.join(' / ') : '';
    rowEls.forEach(function(tr, i) { tr.style.fontWeight = (!done && steps[i].from === state.level) ? 'bold' : ''; });
    status.textContent = 'Nível: +' + state.level + (state.destroyed ? ' (destruído)' : '') +
      ' · Tentativas: ' + state.tries + ' · Sucessos: ' + state.ok + ' · Falhas: ' + state.fail + ' · Destruições: ' + state.boom +
      ' · Gasto: ' + fmtNum(state.costT) + ' T · Fragmentos: ' + state.frag.join(' / ');
    logBox.textContent = state.log.join('\n');
  }

  function attempt() {
    if (isDone() || lacking()) return;
    var st = stepOf(state.level);
    var usedBackup = cfg.backupUsed;
    var usedTool = cfg.toolUsed;
    var success = chance();
    var destroy = Math.min(st.destroy, 100 - success);
    var roll = Math.random() * 100;
    var res;
    state.tries++;
    state.costT += st.cost;
    st.fragments.forEach(function(f, k) { mats[k] -= f; state.frag[k] += f; });
    cfg.backupOwned -= usedBackup;
    cfg.toolOwned -= usedTool;
    if (roll < success) { state.level++; state.ok++; res = 'sucesso'; }
    else if (roll < success + destroy) {
      if (usedBackup > 0) { state.fail++; res = 'fracasso (destruição evitada pelo Backup Chip)'; }
      else { state.destroyed = true; state.boom++; res = 'DESTRUÍDO'; }
    } else { state.fail++; res = 'fracasso'; }
    state.log.unshift('#' + state.tries + ' +' + st.from + ' → +' + st.to + ': ' + res + ' (sorteio ' + roll.toFixed(1) + ', sucesso até ' + fmtNum(success) + ')');
    if (state.log.length > 30) state.log.length = 30;
    update();
  }

  btn.addEventListener('click', attempt);
  resetBtn.addEventListener('click', function() { fresh(); update(); });
  startSel.addEventListener('change', function() { fresh(); update(); });
  pieceSel.addEventListener('change', function() { cfg.piece = Number(pieceSel.value); update(); });
  fresh();
  update();
  return c;
}

export function initClothing() {
  var root = $('#clothingRoot');
  if (!root) return;
  root.textContent = '';
  root.appendChild(setCard());
  root.appendChild(pieceCard());
  root.appendChild(reformCard());
  root.appendChild(simCard());
}
