// Aba Digisoul Circuit: monte o tabuleiro 3x3 com seus modulos e veja os efeitos aplicados.
// Os modulos e o que esta equipado ficam em localStorage (sem servidor).
import { $ } from './dom.js';
import { el } from './utils.js';
import { tr, i18n } from './i18n.js';
import { loadItem, saveItem } from './storage.js';
import { DU_RANKS, DU_RANK_COLORS } from './dunit-data.js';
import { DSC_SLOTS, DSC_CENTER, DSC_MAX_LINES, DSC_MAX_MODULES, DSC_KINDS, DSC_STATS, DSC_EXAMPLES } from './digisoul-data.js';
import { sanitizeState, sumEffects, addModule, updateModule, duplicateModule } from './digisoul-calc.js';

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
  var editingId = null; // modulo aberto no formulario (null = o formulario cria um modulo novo)
  var board = $('#dscBoard');
  var form = $('#dscForm');
  var slotEls = [];
  var lineRows = [];

  // Salva, redesenha e (se pedido) mostra o modulo `revealId` na lista, piscando para indicar onde ele esta.
  function commit(revealId) {
    saveItem(STORAGE_KEY, JSON.stringify(state));
    render();
    if (revealId) reveal(revealId);
  }

  function reveal(id) {
    var node = $('#dscList').querySelector('[data-mod="' + id + '"]');
    if (!node) return;
    node.scrollIntoView({ block: 'nearest' });
    node.classList.add('flash');
    setTimeout(function() { node.classList.remove('flash'); }, 1200);
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
    var replaced = state.slots[target]; // quem ocupava o slot sai do circuito e volta para a lista
    state.slots[target] = id;
    commit(replaced);
  }

  function unequipSlot(i) {
    var id = state.slots[i];
    state.slots[i] = null;
    commit(id); // o modulo volta para a lista, piscando para mostrar onde
  }

  function removeModule(id) {
    if (editingId === id) closeForm();
    state.modules = state.modules.filter(function(m) { return m.id !== id; });
    state.slots = state.slots.map(function(s) { return s === id ? null : s; });
    commit();
  }

  function copyModule(id) {
    var copy = duplicateModule(state, id);
    if (!copy) { notify('dscFull'); return; }
    commit(copy.id);
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
      // o modulo equipado sai da lista, entao as linhas dele ficam no tooltip do slot
      var detail = m ? m.lines.map(function(l) { return STAT_LABEL[l.stat].label + ' ' + formatAmount(l.value, l.pct); }) : [];
      node.setAttribute('aria-label', detail.length ? label + ' — ' + detail.join(', ') : label);
      node.setAttribute('aria-pressed', String(idx === selected));
      if (m) {
        var rc = gradeColors(m.grade);
        node.style.borderColor = rc.bg;
        node.title = [label].concat(detail).join('\n');
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
  function actionButton(action, id, glyph, title) {
    var b = el('button', 'dsc-ico-btn ' + action, glyph);
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', title);
    b.setAttribute('data-act', action);
    b.setAttribute('data-id', id);
    return b;
  }

  // A lista so mostra os modulos fora do circuito: os equipados ficam apenas no tabuleiro.
  function buildModule(m) {
    var item = el('div', 'dsc-mod' + (m.id === editingId ? ' editing' : ''));
    item.setAttribute('data-mod', m.id);
    var icon = el('div', 'dsc-mod-icon', DSC_KINDS[m.kind].icon);
    icon.style.borderColor = gradeColors(m.grade).bg;
    item.appendChild(icon);

    var body = el('div', 'dsc-mod-body');
    body.appendChild(el('div', 'dsc-mod-title', moduleTitle(m)));
    m.lines.forEach(function(l) {
      var row = el('div', 'dsc-mod-line');
      row.appendChild(el('span', null, STAT_LABEL[l.stat].label));
      row.appendChild(el('b', null, formatAmount(l.value, l.pct)));
      body.appendChild(row);
    });
    item.appendChild(body);

    var actions = el('div', 'dsc-mod-actions');
    actions.appendChild(actionButton('equip', m.id, '↓', tr('dscEquip')));
    actions.appendChild(actionButton('edit', m.id, '✎', tr('dscEdit')));
    actions.appendChild(actionButton('copy', m.id, '❐', tr('dscCopy')));
    actions.appendChild(actionButton('delete', m.id, '✕', tr('dscDelete')));
    item.appendChild(actions);
    return item;
  }

  function renderList() {
    var list = $('#dscList');
    var scroll = list.scrollTop; // redesenhar a lista nao pode jogar quem rolou de volta para o topo
    list.textContent = '';
    var free = state.modules.filter(function(m) { return state.slots.indexOf(m.id) === -1; });
    free.forEach(function(m) { list.appendChild(buildModule(m)); });
    if (!free.length) list.appendChild(el('div', 'dsc-empty', tr(state.modules.length ? 'dscListAllEquipped' : 'dscListEmpty')));
    list.scrollTop = scroll;
    $('#dscCount').textContent = free.length ? '(' + free.length + ')' : '';
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
    else if (act === 'edit') startEdit(id);
    else if (act === 'copy') copyModule(id);
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
    statSel.addEventListener('change', (function(lr) {
      return function() { lockUnit(lr); };
    })(lineRows[r]));
  }

  // Skill Damage e EXP so existem em %: forca a unidade e trava o seletor
  function lockUnit(lr) {
    var only = !!lr.stat.value && STAT_LABEL[lr.stat.value].pctOnly;
    if (only) lr.unit.value = 'pct';
    lr.unit.disabled = only;
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

  function closeForm() {
    editingId = null;
    form.hidden = true;
    resetForm();
  }

  function readForm() {
    return {
      kind: $('#dscKind').value,
      grade: gradeSel.value,
      name: $('#dscName').value,
      lines: lineRows.map(function(lr) { return { stat: lr.stat.value, value: lr.value.value, pct: lr.unit.value === 'pct' }; })
    };
  }

  // Abre o formulario ja preenchido com os dados do modulo; salvar troca o modulo no lugar (mesmo id, mesmo slot)
  function startEdit(id) {
    var m = findModule(id);
    if (!m) return;
    resetForm();
    editingId = id;
    $('#dscKind').value = m.kind;
    gradeSel.value = m.grade;
    $('#dscName').value = m.name;
    m.lines.forEach(function(l, i) {
      var lr = lineRows[i];
      lr.stat.value = l.stat;
      lr.value.value = l.value;
      lr.unit.value = l.pct ? 'pct' : 'flat';
      lockUnit(lr);
    });
    form.hidden = false;
    render();
    form.scrollIntoView({ block: 'nearest' });
    $('#dscName').focus();
  }

  function renderFormMode() {
    var m = editingId === null ? null : findModule(editingId);
    $('#dscFormTitle').textContent = m ? tr('dscFormEdit') + ': ' + moduleTitle(m) : tr('dscFormNew');
    $('#dscSaveBtn').textContent = tr(m ? 'dscSaveEdit' : 'dscSave');
  }

  $('#dscAddBtn').addEventListener('click', function() {
    if (editingId !== null) {
      // estava editando: o botao passa a abrir o formulario em branco, em vez de fechar
      editingId = null;
      resetForm();
      form.hidden = false;
      render();
      return;
    }
    form.hidden = !form.hidden;
    notify('');
  });
  $('#dscCancelBtn').addEventListener('click', function() {
    closeForm();
    render();
  });

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var editing = editingId !== null;
    if (!editing && state.modules.length >= DSC_MAX_MODULES) { notify('dscFull'); return; }
    var saved = editing ? updateModule(state, editingId, readForm()) : addModule(state, readForm());
    if (!saved) { notify('dscNeedLine'); return; }
    closeForm();
    commit(saved.id);
  });

  $('#dscExampleBtn').addEventListener('click', function() {
    DSC_EXAMPLES.forEach(function(ex) { addModule(state, ex); });
    commit();
  });

  $('#dscClearBtn').addEventListener('click', function() {
    if (!confirm(tr('dscConfirmClear'))) return;
    state = sanitizeState(null);
    selected = null;
    closeForm();
    commit();
  });

  function render() {
    fillKinds();
    renderFormMode();
    renderBoard();
    renderEffects();
    renderList();
  }

  i18n.onChange(render);
  render();
}
