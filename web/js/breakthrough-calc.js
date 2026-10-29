// Regras do Breakthrough, sem DOM (a tela fica em breakthrough.js).
import {
  BT_ATTEMPTS, BT_CELLS, BT_POSITIVES, BT_NEGATIVES, BT_STATS,
  BT_POSITIVE_CELLS, BT_NEGATIVE_CELLS, BT_TIERS
} from './breakthrough-data.js';

export function statInfo(key) {
  for (var i = 0; i < BT_STATS.length; i++) if (BT_STATS[i].key === key) return BT_STATS[i];
  return null;
}

export function cellValue(kind, stat, i) {
  var table = kind === 'pos' ? BT_POSITIVE_CELLS : BT_NEGATIVE_CELLS;
  return table[stat][i];
}

function round1(n) { return Math.round(n * 10) / 10; }

// Soma maxima da linha (todas as casas com sucesso)
export function rowMax(kind, stat) {
  var t = 0;
  for (var i = 0; i < BT_CELLS; i++) t += cellValue(kind, stat, i);
  return round1(t);
}

// Uma execucao nova: as linhas nao se confundem mesmo quando o mesmo stat aparece duas vezes.
export function newRun(positives, negatives) {
  var rows = [];
  positives.forEach(function(s) { rows.push(makeRow('pos', s)); });
  negatives.forEach(function(s) { rows.push(makeRow('neg', s)); });
  return { rows: rows, attemptsLeft: BT_ATTEMPTS, tier: 0, rolls: 0 };
}

function makeRow(kind, stat) {
  var cells = [];
  for (var i = 0; i < BT_CELLS; i++) cells.push(null); // null | 'ok' | 'fail'
  return { kind: kind, stat: stat, cells: cells, next: 0, total: 0 };
}

// 0 = falha, 1/2/3 = sucesso simples/duplo/triplo. rnd e um numero em [0, 1).
export function rollOutcome(tierIndex, rnd) {
  var t = BT_TIERS[tierIndex];
  var r = rnd * 100;
  if (r < t.triple) return 3;
  if (r < t.triple + t.double) return 2;
  if (r < t.total) return 1;
  return 0;
}

export function rowDone(row) { return row.next >= BT_CELLS; }

export function runFinished(run) {
  return run.attemptsLeft <= 0 || run.rows.every(rowDone);
}

export function canRoll(run, rowIndex) {
  return run.attemptsLeft > 0 && !rowDone(run.rows[rowIndex]);
}

// Tenta a proxima casa da linha. Falha tambem gasta a casa; sucesso duplo/triplo preenche as seguintes.
// Sucesso baixa um degrau de chance, falha sobe um. Devolve o que aconteceu (para a mensagem da tela).
export function roll(run, rowIndex, rnd) {
  if (!canRoll(run, rowIndex)) return null;
  var row = run.rows[rowIndex];
  var outcome = rollOutcome(run.tier, rnd);
  var from = row.next;
  var gained = 0;
  var span = outcome === 0 ? 1 : outcome;
  var last = from;
  for (var k = 0; k < span && row.next < BT_CELLS; k++) {
    var idx = row.next;
    if (outcome === 0) {
      row.cells[idx] = 'fail';
    } else {
      row.cells[idx] = 'ok';
      gained += cellValue(row.kind, row.stat, idx);
    }
    last = idx;
    row.next++;
  }
  gained = round1(gained);
  row.total = round1(row.total + gained);
  run.attemptsLeft--;
  run.rolls++;
  run.tier = outcome === 0 ? Math.max(0, run.tier - 1) : Math.min(BT_TIERS.length - 1, run.tier + 1);
  return { outcome: outcome, row: rowIndex, from: from, to: last, gained: gained };
}

// Resultado liquido por stat (positivos menos negativos), so os stats que mudaram.
export function summary(run) {
  var net = {};
  run.rows.forEach(function(row) {
    if (!row.total) return;
    net[row.stat] = round1((net[row.stat] || 0) + (row.kind === 'pos' ? row.total : -row.total));
  });
  return BT_STATS.filter(function(s) { return net[s.key] !== undefined; })
    .map(function(s) { return { key: s.key, pct: s.pct, value: net[s.key] }; });
}

// Stats aleatorios, com repeticao permitida (no jogo cada stat aparece com a mesma chance).
export function randomStats(count, rnd) {
  var out = [];
  for (var i = 0; i < count; i++) out.push(BT_STATS[Math.floor(rnd() * BT_STATS.length)].key);
  return out;
}

export { BT_POSITIVES, BT_NEGATIVES };
