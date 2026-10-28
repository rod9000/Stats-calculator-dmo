// Regras do Dungeon Checker (funcoes puras, sem DOM).

// [diferenca de nivel (boss - jogador) <=, multiplicador de CT, multiplicador de HT]
export var BRACKETS = [
  [-30,1.3,0.7],[-25,1.2,0.8],[-20,1.2,0.8],[-15,1.1,0.9],[-10,1.1,0.9],
  [-5,1,1],[-1,1,1],[0,1,1],[4,1,1],[9,1,1],
  [14,0.9,1.1],[19,0.8,1.2],[24,0.7,1.3],[29,0.6,1.4]
];

export function getBracket(levelDiff) {
  for (var i = 0; i < BRACKETS.length; i++) {
    if (levelDiff <= BRACKETS[i][0]) {
      return { ctMult: BRACKETS[i][1], htMult: BRACKETS[i][2] };
    }
  }
  return { ctMult: 0.5, htMult: 1.5 };
}

// Compara um valor com o requisito (HP e DPS nao sofrem ajuste de nivel)
function plainCheck(value, req) {
  var pct = req > 0 ? Math.min((value / req) * 100, 150) : 100;
  return { passes: value >= req, pct: pct, diff: value - req };
}

// stats: { level, ct, ht, hp, dps }. hp/dps sao opcionais (null = nao informado):
// so entram no resultado quando o jogador informou o valor E a dungeon define o requisito.
// dungeon.ctReq === null significa que CT nao se aplica.
export function calcDungeon(stats, dungeon) {
  var levelDiff = dungeon.boss - stats.level;
  var bracket = getBracket(levelDiff);
  var effectiveCT = stats.ct * bracket.ctMult;
  var adjustedHTReq = dungeon.htReq * bracket.htMult;
  var effectiveHT = Math.floor(stats.ht / bracket.htMult);
  var ctApplies = dungeon.ctReq != null;
  var ctPasses = ctApplies ? effectiveCT >= dungeon.ctReq : true;
  var htPasses = stats.ht >= adjustedHTReq;
  var ctPct = ctApplies ? Math.min((effectiveCT / dungeon.ctReq) * 100, 150) : 100;
  var htPct = adjustedHTReq > 0 ? Math.min((stats.ht / adjustedHTReq) * 100, 150) : 100;
  var hp = stats.hp != null && dungeon.hpReq != null ? plainCheck(stats.hp, dungeon.hpReq) : null;
  var dps = stats.dps != null && dungeon.dpsReq != null ? plainCheck(stats.dps, dungeon.dpsReq) : null;

  var checks = [{ passes: ctPasses, pct: ctPct }, { passes: htPasses, pct: htPct }];
  if (hp) checks.push(hp);
  if (dps) checks.push(dps);
  var status;
  if (checks.every(function(c) { return c.passes; })) status = 'ready';
  else if (Math.min.apply(null, checks.map(function(c) { return c.pct; })) >= 90) status = 'close';
  else status = 'not-ready';

  return {
    levelDiff: levelDiff,
    ctMult: bracket.ctMult,
    htMult: bracket.htMult,
    effectiveCT: effectiveCT,
    effectiveHT: effectiveHT,
    adjustedHTReq: adjustedHTReq,
    ctApplies: ctApplies,
    ctDiff: effectiveCT - (ctApplies ? dungeon.ctReq : 0),
    htDiff: stats.ht - adjustedHTReq,
    ctPct: Math.min(ctPct, 100),
    htPct: Math.min(htPct, 100),
    status: status,
    ctPasses: ctPasses,
    htPasses: htPasses,
    hp: hp && { passes: hp.passes, pct: Math.min(hp.pct, 100), diff: hp.diff },
    dps: dps && { passes: dps.passes, pct: Math.min(dps.pct, 100), diff: dps.diff }
  };
}
