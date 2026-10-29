// Aprendizado do modelo de chances do Breakthrough (sem DOM). Cada tentativa registrada no Ajudante guarda
// a chance que o jogo mostrou (quando o jogador a digitou) e o resultado; daqui saem:
//  - a escada real (para qual chance se vai ao errar ou acertar) e degraus que o modelo assumido nao tinha;
//  - a taxa de acerto observada em cada chance, para comparar com a chance mostrada.
// So a escada entra no modelo (com evidencia forte); as taxas apenas sao exibidas, pois precisam de muitos dados.
// Tudo fica no localStorage do navegador (loadItem/saveItem nunca lancam), com exportar/importar para nao perder.
import { loadItem, saveItem } from './storage.js';
import { BT_DEFAULT_MODEL } from './breakthrough-data.js';
import { modelKey } from './breakthrough-calc.js';

var KEY = 'dmo.bt.log';
var MAX_ATTEMPTS = 3000; // limite de tentativas guardadas (as mais antigas saem primeiro)
export var MIN_LEVEL_N = 2;   // vezes que um valor de chance precisa aparecer para virar degrau novo (filtra erro de digitacao)
export var MIN_TRANS = 3;     // observacoes de uma transicao para sobrescrever a regra assumida
export var MIN_SHARE = 0.8;   // fracao delas que precisa concordar
export var MIN_RATE_N = 30;   // tentativas num degrau para comparar a taxa observada com a chance mostrada

// ---------- registro ----------
// log = [{ id, a: [[chance|null, resultado 0..3], ...] }], uma entrada por rodada.
function validRun(r) {
  return r && typeof r.id === 'number' && Array.isArray(r.a) && r.a.every(function(x) {
    return Array.isArray(x) && x.length === 2 && (x[0] === null || (typeof x[0] === 'number' && x[0] > 0 && x[0] < 100)) &&
           (x[1] === 0 || x[1] === 1 || x[1] === 2 || x[1] === 3);
  });
}

export function loadLog() {
  try {
    var v = JSON.parse(loadItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter(validRun) : [];
  } catch (e) { return []; }
}

function saveLog(log) {
  var total = 0;
  for (var i = log.length - 1; i >= 0; i--) {
    total += log[i].a.length;
    if (total > MAX_ATTEMPTS) { log = log.slice(i + 1); break; }
  }
  saveItem(KEY, JSON.stringify(log));
  return log;
}

export function logAttempt(log, runId, chance, outcome) {
  var run = log.filter(function(r) { return r.id === runId; })[0];
  if (!run) { run = { id: runId, a: [] }; log.push(run); }
  run.a.push([chance, outcome]);
  return saveLog(log);
}

// Desfazer no Ajudante: tira a ultima tentativa da rodada.
export function unlogAttempt(log, runId) {
  var run = log.filter(function(r) { return r.id === runId; })[0];
  if (run) {
    run.a.pop();
    if (!run.a.length) log = log.filter(function(r) { return r !== run; });
  }
  return saveLog(log);
}

export function clearLog() {
  saveItem(KEY, '[]');
  return [];
}

export function exportText(log) {
  return JSON.stringify({ app: 'dmo-breakthrough', version: 1, runs: log });
}

// Junta o conteudo de um arquivo exportado ao registro atual (ignora rodadas que ja existem). Lanca se o arquivo nao servir.
export function importText(log, text) {
  var data = JSON.parse(text);
  var runs = Array.isArray(data) ? data : data && data.runs;
  if (!Array.isArray(runs)) throw new Error('formato');
  var have = {};
  log.forEach(function(r) { have[r.id] = true; });
  var added = 0;
  runs.forEach(function(r) {
    if (validRun(r) && !have[r.id]) { log.push({ id: r.id, a: r.a }); have[r.id] = true; added++; }
  });
  return { log: saveLog(log), added: added };
}

// ---------- resumo ----------
export function summarize(log) {
  var levels = {}, trans = {}, starts = {}, attempts = 0, withChance = 0;
  log.forEach(function(run) {
    if (run.a.length && run.a[0][0] !== null) starts[run.a[0][0]] = (starts[run.a[0][0]] || 0) + 1; // chance da 1a tentativa
    run.a.forEach(function(at, i) {
      var c = at[0], o = at[1];
      attempts++;
      if (c === null) return;
      withChance++;
      var L = levels[c] || (levels[c] = { c: c, n: 0, o: [0, 0, 0, 0] });
      L.n++;
      L.o[o]++;
      var next = run.a[i + 1];
      if (next && next[0] !== null) {
        var T = trans[c] || (trans[c] = { ok: {}, fail: {} });
        var bucket = o > 0 ? T.ok : T.fail;
        bucket[next[0]] = (bucket[next[0]] || 0) + 1;
      }
    });
  });
  return { levels: levels, trans: trans, starts: starts, attempts: attempts, withChance: withChance };
}

// Intervalo de Wilson (95%) para uma proporcao.
export function wilson(k, n) {
  if (!n) return [0, 1];
  var z = 1.96, p = k / n, d = 1 + z * z / n;
  var c = (p + z * z / (2 * n)) / d;
  var h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

function round1(n) { return Math.round(n * 10) / 10; }

// Degrau novo (chance que o modelo assumido nao tinha): divide a chance entre simples/duplo/triplo
// interpolando os degraus assumidos mais proximos. E palpite; so a chance total vem do jogo.
function interpTier(total) {
  var tiers = BT_DEFAULT_MODEL.tiers;
  var hi = tiers[0], lo = tiers[tiers.length - 1];
  for (var i = 0; i < tiers.length - 1; i++) {
    if (total <= tiers[i].total && total >= tiers[i + 1].total) { hi = tiers[i]; lo = tiers[i + 1]; break; }
  }
  var f = hi.total === lo.total ? 0 : Math.min(1, Math.max(0, (total - lo.total) / (hi.total - lo.total)));
  var dbl = round1(lo.double + f * (hi.double - lo.double));
  var tri = round1(lo.triple + f * (hi.triple - lo.triple));
  return { total: total, simple: round1(Math.max(0, total - dbl - tri)), double: dbl, triple: tri };
}

function topDest(bucket) {
  var total = 0, best = null, bestN = 0;
  Object.keys(bucket || {}).forEach(function(k) {
    total += bucket[k];
    if (bucket[k] > bestN) { bestN = bucket[k]; best = Number(k); }
  });
  return total ? { to: best, count: bestN, total: total } : null;
}

// Tira os degraus que nao se alcanca a partir do inicio (ex.: os assumidos que o jogo nunca mostrou): o solver fica menor e mais rapido.
function prune(m) {
  var seen = {}, queue = [m.start];
  seen[m.start] = true;
  while (queue.length) {
    var i = queue.pop();
    [m.onFail[i], m.onOk[i]].forEach(function(j) { if (!seen[j]) { seen[j] = true; queue.push(j); } });
  }
  var keep = [], map = {};
  m.tiers.forEach(function(t, i) { if (seen[i]) { map[i] = keep.length; keep.push(i); } });
  if (keep.length === m.tiers.length) return m;
  return {
    tiers: keep.map(function(i) { return m.tiers[i]; }),
    onFail: keep.map(function(i) { return map[m.onFail[i]]; }),
    onOk: keep.map(function(i) { return map[m.onOk[i]]; }),
    start: map[m.start], learned: true
  };
}

// Modelo ajustado: parte do assumido e so muda o que a evidencia sustenta. Sem mudanca, devolve o proprio padrao.
export function buildModel(sum) {
  var base = BT_DEFAULT_MODEL;
  var tiers = base.tiers.map(function(t) { return { total: t.total, simple: t.simple, double: t.double, triple: t.triple }; });
  var known = {};
  tiers.forEach(function(t) { known[t.total] = true; });
  var changed = false;

  Object.keys(sum.levels).forEach(function(k) {
    var L = sum.levels[k];
    if (L.n >= MIN_LEVEL_N && !known[L.c]) { tiers.push(interpTier(L.c)); known[L.c] = true; changed = true; }
  });
  tiers.sort(function(a, b) { return b.total - a.total; });

  var idxOf = {};
  tiers.forEach(function(t, i) { idxOf[t.total] = i; });
  var n = tiers.length;
  var baseFail = {}, baseOk = {};
  base.tiers.forEach(function(t, i) {
    baseFail[t.total] = base.tiers[base.onFail[i]].total;
    baseOk[t.total] = base.tiers[base.onOk[i]].total;
  });
  // degraus do modelo assumido mantem o destino assumido; degraus novos comecam com o vizinho (palpite)
  var onFail = tiers.map(function(t, i) { return baseFail[t.total] !== undefined ? idxOf[baseFail[t.total]] : Math.max(0, i - 1); });
  var onOk = tiers.map(function(t, i) { return baseOk[t.total] !== undefined ? idxOf[baseOk[t.total]] : Math.min(n - 1, i + 1); });

  Object.keys(sum.trans).forEach(function(k) {
    var from = Number(k);
    if (idxOf[from] === undefined) return;
    [['fail', onFail], ['ok', onOk]].forEach(function(pair) {
      var d = topDest(sum.trans[k][pair[0]]);
      if (d && d.total >= MIN_TRANS && d.count / d.total >= MIN_SHARE && idxOf[d.to] !== undefined && pair[1][idxOf[from]] !== idxOf[d.to]) {
        pair[1][idxOf[from]] = idxOf[d.to];
        changed = true;
      }
    });
  });

  var start = idxOf[base.tiers[base.start].total];
  var sd = topDest(sum.starts);
  if (sd && sd.total >= MIN_TRANS && sd.count / sd.total >= MIN_SHARE && idxOf[sd.to] !== undefined && idxOf[sd.to] !== start) {
    start = idxOf[sd.to];
    changed = true;
  }

  if (!changed) return base;
  var model = prune({ tiers: tiers, onFail: onFail, onOk: onOk, start: start, learned: true });
  return modelKey(model) === modelKey(base) ? base : model; // podado de volta ao assumido: nao ha o que dizer que mudou
}

// Linhas da tabela "assumido x observado": uma por chance vista, da maior para a menor.
export function levelRows(sum) {
  return Object.keys(sum.levels).map(function(k) {
    var L = sum.levels[k];
    var ok = L.o[1] + L.o[2] + L.o[3];
    var ci = wilson(ok, L.n);
    var t = sum.trans[L.c] || {};
    return {
      c: L.c, n: L.n, ok: ok, rate: ok / L.n, lo: ci[0], hi: ci[1],
      off: L.n >= MIN_RATE_N && (L.c / 100 < ci[0] || L.c / 100 > ci[1]),
      failTo: topDest(t.fail), okTo: topDest(t.ok)
    };
  }).sort(function(a, b) { return b.c - a.c; });
}
