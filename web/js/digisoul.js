// Aba Digisoul Circuit: monte o tabuleiro 3x3 com seus modulos e veja os efeitos aplicados.
// Os modulos e o que esta equipado ficam em localStorage (sem servidor).
import { $ } from './dom.js';
import { el } from './utils.js';
import { tr, i18n } from './i18n.js';
import { loadItem, saveItem } from './storage.js';
import { DU_RANKS, DU_RANK_COLORS } from './dunit-data.js';
import { DSC_SLOTS, DSC_CENTER, DSC_MAX_LINES, DSC_MAX_MODULES, DSC_KINDS, DSC_STATS, DSC_EXAMPLES } from './digisoul-data.js';
import { sanitizeState, cleanLine, sumEffects } from './digisoul-calc.js';

var STORAGE_KEY = 'dsc.state';
var SVG_NS = 'http://www.w3.org/2000/svg';

var STAT_LABEL = {};
DSC_STATS.forEach(function(s) { STAT_LABEL[s.key] = s; });

function formatAmount(v, pct) {
  return (v >= 0 ? '+' : '-') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 2 }) + (pct ? '%' : '');
}

function moduleTitle(m) {
  return (m.name || tr(DSC_KINDS[m.kind].labelKey)) + ' [' + m.grade + ']';
}

function gradeColors(grade) {
  return DU_RANK_COLORS[grade] || DU_RANK_COLORS.N;
}

function option(value, text) {
  var o = el('option', null, text);
  o.value = value;
  return o;
}

// Linhas decorativas do circuito: anel externo + cruz ate o slot central
function buildCircuitLines() {
  var svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'dsc-lines');
  svg.setAttribute('viewBox', '0 0 300 300');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  var path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('d', 'M50 50H250V250H50Z M150 50V250 M50 150H250');
  svg.appendChild(path);
  return svg;
}

export function initDigisoul() {
  var state;
  try { state = sanitizeState(JSON.parse(loadItem(STORAGE_KEY))); } catch (e) { state = sanitizeState(null); }
  var selected = null; // indice do slot selecionado
  var board = $('#dscBoard');
  var form = $('#dscForm');
  var slotEls = [];
  var lineRows = [];

  function commit() {
    saveItem(STORAGE_KEY, JSON.stringify(state));
    render();
  }

  function findModule(id) {
    return state.modules.filter(function(m) { return m.id === id; })[0] || null;
  }

  function notify(key) {
    $('#dscMsg').textContent = key ? tr(key) : '';
  }

  // ---------- acoes ----------
  function equip(id) {
    var target = selected !== null ? selected : state.slots.indexOf(null);
    if (target === -1) { notify('dscNoSlot'); return; }
    var current = state.slots.indexOf(id);
    if (current !== -1) state.slots[current] = null;
    state.slots[target] = id;
    commit();
  }

  function unequipSlot(i) {
    state.slots[i] = null;
    commit();
  }

  function removeModule(id) {
    state.modules = state.modules.filter(function(m) { return m.id !== id; });
    state.slots = state.slots.map(function(s) { return s === id ? null : s; });
    commit();
  }

  // ---------- tabuleiro ----------
  board.appendChild(buildCircuitLines());
  for (var i = 0; i < DSC_SLOTS; i++) {
    var slot = el('div', 'dsc-slot');
    slot.setAttribute('data-slot', i);
    slot.setAttribute('role', 'button');
    slot.tabIndex = 0;
    board.appendChild(slot);
    slotEls.push(slot);
  }

  board.addEventListener('click', function(e) {
    var x = e.target.closest('[data-unequip]');
    if (x) { unequipSlot(parseInt(x.getAttribute('data-unequip'))); return; }
    var slotEl = e.target.closest('.dsc-slot');
    if (!slotEl) return;
    var idx = parseInt(slotEl.getAttribute('data-slot'));
    selected = selected === idx ? null : idx;
    notify('');
    render();
  });
  board.addEventListener('keydown', function(e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('dsc-slot')) {
      e.preventDefault();
      e.target.click();
    }
  });

  function renderBoard() {
    slotEls.forEach(function(node, idx) {
      var m = state.slots[idx] === null ? null : findModule(state.slots[idx]);
      node.className = 'dsc-slot' + (idx === DSC_CENTER ? ' center' : '') + (m ? ' filled' : '') + (idx === selected ? ' selected' : '');
      node.style.borderColor = '';
      node.textContent = '';
      var label = tr('dscSlot') + ' ' + (idx + 1) + ': ' + (m ? moduleTitle(m) : tr('dscSlotEmpty'));
      node.setAttribute('aria-label', label);
      node.setAttribute('aria-pressed', String(idx === selected));
      if (m) {
        var rc = gradeColors(m.grade);
        node.style.borderColor = rc.bg;
        node.title = label;
        node.appendChild(el('span', 'dsc-slot-icon', DSC_KINDS[m.kind].icon));
        var grade = el('span', 'dsc-slot-grade', m.grade);
        grade.style.background = rc.bg;
        grade.style.color = rc.text;
        node.appendChild(grade);
        var x = el('button', 'dsc-slot-x', '×');
        x.type = 'button';
        x.setAttribute('data-unequip', idx);
        x.title = tr('dscUnequip');
        node.appendChild(x);
      } else {
        node.title = '';
        node.appendChild(el('span', 'dsc-slot-plus', '+'));
      }
    });
  }

  // ---------- efeitos aplicados ----------
  function renderEffects() {
    var box = $('#dscEffects');
    box.textContent = '';
    var totals = sumEffects(state);
    var any = false;
    DSC_STATS.forEach(function(s) {
      var t = totals[s.key];
      if (!t) return;
      any = true;
      var parts = [];
      if (t.flat) parts.push(formatAmount(t.flat, false));
      if (t.pct) parts.push(formatAmount(t.pct, true));
      var row = el('div', 'dsc-eff-row');
      row.appendChild(el('span', 'dsc-eff-label', s.label));
      row.appendChild(el('span', 'dsc-eff-val', parts.length ? parts.join(' · ') : '+0'));
      box.appendChild(row);
    });
    if (!any) box.appendChild(el('div', 'dsc-empty', tr('dscEffectsEmpty')));
  }

  // ---------- lista de modulos ----------
  function actionButton(action, id, glyph, title, disabled) {
    var b = el('button', 'dsc-ico-btn ' + action, glyph);
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', title);
    b.setAttribute('data-act', action);
    b.setAttribute('data-id', id);
    b.disabled = !!disabled;
    return b;
  }

  function buildModule(m) {
    var slotIdx = state.slots.indexOf(m.id);
    var item = el('div', 'dsc-mod' + (slotIdx !== -1 ? ' equipped' : ''));
    var icon = el('div', 'dsc-mod-icon', DSC_KINDS[m.kind].icon);
    icon.style.borderColor = gradeColors(m.grade).bg;
    item.appendChild(icon);

    var body = el('div', 'dsc-mod-body');
    var title = el('div', 'dsc-mod-title', moduleTitle(m));
    if (slotIdx !== -1) title.appendChild(el('span', 'dsc-mod-slot', tr('dscSlot') + ' ' + (slotIdx + 1)));
    body.appendChild(title);
    m.lines.forEach(function(l) {
      var row = el('div', 'dsc-mod-line');
      row.appendChild(el('span', null, STAT_LABEL[l.stat].label));
      row.appendChild(el('b', null, formatAmount(l.value, l.pct)));
      body.appendChild(row);
    });
    item.appendChild(body);

    var actions = el('div', 'dsc-mod-actions');
    actions.appendChild(actionButton('equip', m.id, '↓', tr('dscEquip')));
    actions.appendChild(actionButton('unequip', m.id, '↑', tr('dscUnequip'), slotIdx === -1));
    actions.appendChild(actionButton('delete', m.id, '✕', tr('dscDelete')));
    item.appendChild(actions);
    return item;
  }

  function renderList() {
    var list = $('#dscList');
    list.textContent = '';
    state.modules.forEach(function(m) { list.appendChild(buildModule(m)); });
    if (!state.modules.length) list.appendChild(el('div', 'dsc-empty', tr('dscListEmpty')));
    $('#dscCount').textContent = state.modules.length ? '(' + state.modules.length + ')' : '';
    $('#dscExampleBtn').style.display = state.modules.length ? 'none' : '';
    $('#dscClearBtn').style.display = state.modules.length ? '' : 'none';
  }

  $('#dscList').addEventListener('click', function(e) {
    var btn = e.target.closest('[data-act]');
    if (!btn || btn.disabled) return;
    var id = parseInt(btn.getAttribute('data-id'));
    var act = btn.getAttribute('data-act');
    notify('');
    if (act === 'equip') equip(id);
    else if (act === 'unequip') unequipSlot(state.slots.indexOf(id));
    else if (act === 'delete') removeModule(id);
  });

  // ---------- formulario ----------
  function fillKinds() {
    var sel = $('#dscKind');
    var prev = sel.value;
    sel.textContent = '';
    Object.keys(DSC_KINDS).forEach(function(k) { sel.appendChild(option(k, tr(DSC_KINDS[k].labelKey))); });
    if (prev) sel.value = prev;
  }

  var gradeSel = $('#dscGrade');
  DU_RANKS.forEach(function(r) { gradeSel.appendChild(option(r, r)); });
  gradeSel.value = 'SSS+';

  var linesBox = $('#dscLines');
  for (var r = 0; r < DSC_MAX_LINES; r++) {
    var row = el('div', 'dsc-line-row');
    var statSel = el('select', 'dsc-line-stat');
    statSel.appendChild(option('', '—'));
    DSC_STATS.forEach(function(s) { statSel.appendChild(option(s.key, s.label)); });
    var valueInput = el('input', 'dsc-line-value');
    valueInput.type = 'number';
    valueInput.step = 'any';
    valueInput.setAttribute('data-i18n', 'placeholder:dscValuePlaceholder');
    var unitSel = el('select', 'dsc-line-unit');
    unitSel.appendChild(option('flat', '+'));
    unitSel.appendChild(option('pct', '%'));
    row.appendChild(statSel);
    row.appendChild(valueInput);
    row.appendChild(unitSel);
    linesBox.appendChild(row);
    lineRows.push({ stat: statSel, value: valueInput, unit: unitSel });
    // Skill Damage e EXP so existem em %
    statSel.addEventListener('change', (function(s, u) {
      return function() {
        var only = !!s.value && STAT_LABEL[s.value].pctOnly;
        if (only) u.value = 'pct';
        u.disabled = only;
      };
    })(statSel, unitSel));
  }

  function resetForm() {
    $('#dscName').value = '';
    gradeSel.value = 'SSS+';
    lineRows.forEach(function(lr) {
      lr.stat.value = '';
      lr.value.value = '';
      lr.unit.value = 'flat';
      lr.unit.disabled = false;
    });
    notify('');
  }

  $('#dscAddBtn').addEventListener('click', function() {
    form.hidden = !form.hidden;
    notify('');
  });
  $('#dscCancelBtn').addEventListener('click', function() {
    form.hidden = true;
    resetForm();
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (state.modules.length >= DSC_MAX_MODULES) { notify('dscFull'); return; }
    var lines = lineRows.map(function(lr) {
      return cleanLine({ stat: lr.stat.value, value: lr.value.value, pct: lr.unit.value === 'pct' });
    }).filter(Boolean);
    if (!lines.length) { notify('dscNeedLine'); return; }
    state.modules.push({
      id: state.nextId++,
      kind: $('#dscKind').value,
      grade: gradeSel.value,
      name: $('#dscName').value.trim().slice(0, 40),
      lines: lines
    });
    form.hidden = true;
    resetForm();
    commit();
  });

  $('#dscExampleBtn').addEventListener('click', function() {
    DSC_EXAMPLES.forEach(function(ex) {
      state.modules.push({ id: state.nextId++, kind: ex.kind, grade: ex.grade, name: ex.name, lines: ex.lines.map(function(l) { return { stat: l.stat, value: l.value, pct: l.pct }; }) });
    });
    commit();
  });

  $('#dscClearBtn').addEventListener('click', function() {
    if (!confirm(tr('dscConfirmClear'))) return;
    state = sanitizeState(null);
    selected = null;
    commit();
  });

  function render() {
    fillKinds();
    renderBoard();
    renderEffects();
    renderList();
  }

  i18n.onChange(render);
  render();
}
