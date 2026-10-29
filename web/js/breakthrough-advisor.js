// Estrategia otima do Breakthrough (sem DOM: roda no Worker e no Node).
// Estado = (tentativas restantes, degrau de chance, casa atual de cada linha). A utilidade e aditiva por linha:
//   +peso * total/maximo nas positivas, -peso * total/maximo nas negativas
// (1 ponto = encher por completo uma linha positiva de peso 1). Programacao dinamica de tras para frente:
// para cada estado guarda qual linha clicar. Nao ha como mudar a chance de uma tentativa, so a escolha da linha.
import { BT_CELLS, BT_ATTEMPTS, BT_TIERS } from './breakthrough-data.js';
import { cellValue, rowMax, rollOutcome } from './breakthrough-calc.js';

var NO_MOVE = 255;
var W = BT_CELLS + 1; // valores possiveis do ponteiro de uma linha: 0..10

// rows = [{kind, stat}], weights = [numero por linha]. Devolve a recompensa de cada casa e as somas acumuladas.
export function rewardTables(rows, weights) {
  return rows.map(function(row, r) {
    var sign = row.kind === 'pos' ? 1 : -1;
    var max = rowMax(row.kind, row.stat);
    var pre = new Float64Array(W);
    for (var c = 0; c < BT_CELLS; c++) {
      pre[c + 1] = pre[c] + sign * weights[r] * cellValue(row.kind, row.stat, c) / max;
    }
    return pre; // pre[b] - pre[a] = recompensa de preencher as casas a..b-1
  });
}

function strides(R) {
  var s = new Array(R), v = 1;
  for (var r = R - 1; r >= 0; r--) { s[r] = v; v *= W; }
  return { stride: s, size: v };
}

// Devolve { policy: [Uint8Array por tentativas restantes (1..40)], value: utilidade esperada ao comecar }.
export function solve(rows, weights, onProgress) {
  var R = rows.length;
  var pre = rewardTables(rows, weights);
  var sz = strides(R), stride = sz.stride, S = sz.size, T = BT_TIERS.length;
  var prev = new Float32Array(T * S), cur = new Float32Array(T * S);
  var policy = [null];
  var ptr = new Int32Array(R);
  var pf = [], p1 = [], p2 = [], p3 = [];
  BT_TIERS.forEach(function(t) {
    pf.push((100 - t.total) / 100); p1.push(t.simple / 100); p2.push(t.double / 100); p3.push(t.triple / 100);
  });

  for (var a = 1; a <= BT_ATTEMPTS; a++) {
    var pol = new Uint8Array(T * S);
    for (var t = 0; t < T; t++) {
      var base = t * S;
      var down = Math.max(0, t - 1) * S, up = Math.min(T - 1, t + 1) * S;
      var qf = pf[t], q1 = p1[t], q2 = p2[t], q3 = p3[t];
      ptr.fill(0);
      for (var idx = 0; idx < S; idx++) {
        var best = -Infinity, bestR = NO_MOVE;
        for (var r = 0; r < R; r++) {
          var c = ptr[r];
          if (c >= BT_CELLS) continue;
          var st = stride[r], pr = pre[r];
          var s2 = c + 2 <= BT_CELLS ? 2 : 1;
          var s3 = c + 3 <= BT_CELLS ? 3 : (c + 2 <= BT_CELLS ? 2 : 1);
          var q = qf * prev[down + idx + st] +
                  q1 * (pr[c + 1] - pr[c] + prev[up + idx + st]) +
                  q2 * (pr[c + s2] - pr[c] + prev[up + idx + s2 * st]) +
                  q3 * (pr[c + s3] - pr[c] + prev[up + idx + s3 * st]);
          if (q > best) { best = q; bestR = r; }
        }
        cur[base + idx] = bestR === NO_MOVE ? 0 : best;
        pol[base + idx] = bestR;
        // odometro: o ultimo ponteiro e o digito menos significativo
        for (var d = R - 1; d >= 0; d--) {
          if (++ptr[d] < W) break;
          ptr[d] = 0;
        }
      }
    }
    policy.push(pol);
    var tmp = prev; prev = cur; cur = tmp;
    if (onProgress) onProgress(a / BT_ATTEMPTS);
  }
  return { policy: policy, value: prev[0], stride: stride, size: S, pre: pre };
}

// Joga o resto da rodada. first = linha forcada na primeira jogada (ou -1 para seguir a politica).
// chooser(a, t, idx, ptr) devolve a linha. Devolve a utilidade ganha daqui para frente.
function playout(ptr0, tier0, attempts0, first, chooser, pre, stride, size, rnd) {
  var R = ptr0.length, ptr = ptr0.slice(), t = tier0, gain = 0;
  var idx = 0;
  for (var r = 0; r < R; r++) idx += ptr[r] * stride[r];
  for (var a = attempts0; a >= 1; a--) {
    var row = (a === attempts0 && first >= 0) ? first : chooser(a, t, idx, ptr);
    if (row === NO_MOVE || row < 0 || ptr[row] >= BT_CELLS) break;
    var k = rollOutcome(t, rnd());
    var c = ptr[row];
    var span = k === 0 ? 1 : Math.min(k, BT_CELLS - c);
    if (k > 0) gain += pre[row][c + span] - pre[row][c];
    ptr[row] += span;
    idx += span * stride[row];
    t = k === 0 ? Math.max(0, t - 1) : Math.min(BT_TIERS.length - 1, t + 1);
  }
  return gain;
}

// Utilidade ja conquistada na rodada (casas com sucesso), na mesma escala da estrategia.
export function utilityOf(run, pre) {
  var u = 0;
  run.rows.forEach(function(row, r) {
    row.cells.forEach(function(state, i) { if (state === 'ok') u += pre[r][i + 1] - pre[r][i]; });
  });
  return u;
}

// Resultado esperado de cada jogada possivel agora (e de seguir a politica depois). ptr/tier/attempts = estado atual.
export function evaluateMoves(sol, ptr, tier, attempts, n, rnd) {
  var S = sol.size;
  var chooser = function(a, t, idx) { return sol.policy[a][t * S + idx]; };
  return ptr.map(function(c, r) {
    if (c >= BT_CELLS || attempts <= 0) return null;
    var sum = 0;
    for (var i = 0; i < n; i++) sum += playout(ptr, tier, attempts, r, chooser, sol.pre, sol.stride, S, rnd);
    return sum / n;
  });
}

// Linha que a politica otima manda clicar agora (NO_MOVE = nenhuma).
export function bestMove(sol, ptr, tier, attempts) {
  if (attempts <= 0) return NO_MOVE;
  var idx = 0;
  for (var r = 0; r < ptr.length; r++) idx += ptr[r] * sol.stride[r];
  return sol.policy[attempts][tier * sol.size + idx];
}

// Para comparar: utilidade esperada (Monte Carlo) de uma estrategia simples, partindo do zero.
export function evaluateStrategy(sol, chooser, n, rnd) {
  var R = sol.pre.length, ptr = new Array(R).fill(0), sum = 0;
  for (var i = 0; i < n; i++) sum += playout(ptr, 0, BT_ATTEMPTS, -1, chooser, sol.pre, sol.stride, sol.size, rnd);
  return sum / n;
}

export { NO_MOVE };
