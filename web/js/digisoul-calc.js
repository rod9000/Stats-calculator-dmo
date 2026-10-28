// Regras do Digisoul Circuit (funcoes puras, sem DOM): validacao do estado salvo e soma dos efeitos.
import { DSC_SLOTS, DSC_MAX_LINES, DSC_MAX_MODULES, DSC_KINDS, DSC_STATS } from './digisoul-data.js';
import { DU_RANKS } from './dunit-data.js';

var STAT_BY_KEY = {};
DSC_STATS.forEach(function(s) { STAT_BY_KEY[s.key] = s; });

export function emptyState() {
  var slots = [];
  for (var i = 0; i < DSC_SLOTS; i++) slots.push(null);
  return { modules: [], slots: slots, nextId: 1 };
}

// Linha valida -> { stat, value, pct }; qualquer outra coisa -> null
export function cleanLine(l) {
  if (!l || !STAT_BY_KEY.hasOwnProperty(l.stat)) return null;
  var v = Math.round(Number(l.value) * 100) / 100;
  if (!isFinite(v) || v === 0 || Math.abs(v) > 1e9) return null;
  return { stat: l.stat, value: v, pct: STAT_BY_KEY[l.stat].pctOnly ? true : l.pct === true };
}

// Valida o que veio do localStorage: descarta o que nao faz sentido em vez de quebrar a aba.
export function sanitizeState(raw) {
  var state = emptyState();
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.modules)) return state;
  var ids = {};
  var maxId = 0;
  raw.modules.slice(0, DSC_MAX_MODULES).forEach(function(m) {
    if (!m || typeof m !== 'object') return;
    if (!Number.isInteger(m.id) || m.id < 1 || ids[m.id]) return;
    if (!DSC_KINDS.hasOwnProperty(m.kind) || DU_RANKS.indexOf(m.grade) === -1) return;
    var lines = (Array.isArray(m.lines) ? m.lines : []).slice(0, DSC_MAX_LINES).map(cleanLine).filter(Boolean);
    if (!lines.length) return;
    ids[m.id] = true;
    maxId = Math.max(maxId, m.id);
    state.modules.push({ id: m.id, kind: m.kind, grade: m.grade, name: typeof m.name === 'string' ? m.name.slice(0, 40) : '', lines: lines });
  });
  if (Array.isArray(raw.slots)) {
    for (var i = 0; i < DSC_SLOTS; i++) {
      var id = raw.slots[i];
      if (ids[id] && state.slots.indexOf(id) === -1) state.slots[i] = id;
    }
  }
  state.nextId = Math.max(maxId + 1, Number.isInteger(raw.nextId) ? raw.nextId : 1);
  return state;
}

// Soma as linhas dos modulos equipados: { HP: { flat: 2273, pct: 5 }, ... } (so os stats presentes).
// Valores fixos e em % ficam separados porque nao da para somar um com o outro.
export function sumEffects(state) {
  var byId = {};
  state.modules.forEach(function(m) { byId[m.id] = m; });
  var totals = {};
  state.slots.forEach(function(id) {
    var m = id === null ? null : byId[id];
    if (!m) return;
    m.lines.forEach(function(l) {
      var t = totals[l.stat] || (totals[l.stat] = { flat: 0, pct: 0 });
      t[l.pct ? 'pct' : 'flat'] += l.value;
    });
  });
  Object.keys(totals).forEach(function(k) {
    totals[k].flat = Math.round(totals[k].flat * 100) / 100;
    totals[k].pct = Math.round(totals[k].pct * 100) / 100;
  });
  return totals;
}
