// Carrega e valida web/dungeons.json. Para adicionar uma dungeon, basta incluir um item em "dungeons":
//
//   id, name, full   texto (id unico)
//   tier             entry | mid | hard | extreme
//   boss             nivel do boss (numero)
//   bossEstimated    opcional (true): o nivel do boss e uma estimativa; o card mostra "~"
//   htReq            Hit Rate exigido (numero > 0)
//   ctReq            Critical Rate exigido (numero > 0) ou null quando CT nao se aplica
//   hpReq, dpsReq    opcionais (numero > 0): so sao avaliados se o jogador informar HP / DPS
//   recommendedLevel, desc, build   opcionais (texto)
//   notes            opcional (lista de textos)
//
// Dificuldade: a lista e ordenada pelo tier (entry < mid < hard < extreme) e, dentro de cada tier, pela
// ordem em que as dungeons aparecem neste arquivo: da mais facil para a mais dificil.
export var TIERS = {
  entry:   { label: 'Entry',   color: '#3b82f6' },
  mid:     { label: 'Mid',     color: '#f59e0b' },
  hard:    { label: 'Hard',    color: '#f97316' },
  extreme: { label: 'Extreme', color: '#ef4444' }
};

// Da mais facil para a mais dificil (estavel: dungeons do mesmo tier mantem a ordem do arquivo)
export function byDifficulty(dungeons) {
  var rank = {};
  Object.keys(TIERS).forEach(function(k, i) { rank[k] = i; });
  return dungeons
    .map(function(d, i) { return { d: d, i: i }; })
    .sort(function(a, b) { return rank[a.d.tier] - rank[b.d.tier] || a.i - b.i; })
    .map(function(x) { return x.d; });
}

function isNum(v) { return typeof v === 'number' && isFinite(v); }
function isText(v) { return typeof v === 'string' && v !== ''; }
function missing(v) { return v === undefined || v === null; }

// Lista de problemas do item (vazia = valido)
function checkDungeon(d, seen) {
  var p = [];
  if (!d || typeof d !== 'object') return ['nao e um objeto'];
  if (!isText(d.id)) p.push('"id" ausente');
  else if (seen[d.id]) p.push('"id" repetido');
  if (!isText(d.name)) p.push('"name" ausente');
  if (!isText(d.full)) p.push('"full" ausente');
  if (!TIERS.hasOwnProperty(d.tier)) p.push('"tier" invalido (use ' + Object.keys(TIERS).join(' | ') + ')');
  if (!isNum(d.boss)) p.push('"boss" deve ser numero');
  if (!missing(d.bossEstimated) && typeof d.bossEstimated !== 'boolean') p.push('"bossEstimated" deve ser true ou false');
  if (!isNum(d.htReq) || d.htReq <= 0) p.push('"htReq" deve ser numero > 0');
  ['ctReq', 'hpReq', 'dpsReq'].forEach(function(k) {
    if (!missing(d[k]) && (!isNum(d[k]) || d[k] <= 0)) p.push('"' + k + '" deve ser numero > 0' + (k === 'ctReq' ? ' ou null' : ''));
  });
  if (!missing(d.notes) && (!Array.isArray(d.notes) || !d.notes.every(isText))) p.push('"notes" deve ser lista de textos');
  return p;
}

function normalize(d) {
  return {
    id: d.id, name: d.name, full: d.full, tier: d.tier, boss: d.boss,
    bossEstimated: d.bossEstimated === true,
    htReq: d.htReq,
    ctReq: missing(d.ctReq) ? null : d.ctReq,
    hpReq: missing(d.hpReq) ? null : d.hpReq,
    dpsReq: missing(d.dpsReq) ? null : d.dpsReq,
    recommendedLevel: isText(d.recommendedLevel) ? d.recommendedLevel : '',
    desc: isText(d.desc) ? d.desc : '',
    build: isText(d.build) ? d.build : '',
    notes: Array.isArray(d.notes) ? d.notes : []
  };
}

// Itens invalidos sao ignorados e descritos em "problems"; os demais continuam funcionando.
export function parseDungeons(raw) {
  if (!raw || !Array.isArray(raw.dungeons)) throw new Error('dungeons.json: o campo "dungeons" deve ser uma lista');
  var seen = {}, dungeons = [], problems = [];
  raw.dungeons.forEach(function(d, i) {
    var p = checkDungeon(d, seen);
    if (p.length) {
      problems.push('#' + (i + 1) + (d && d.id ? ' (' + d.id + ')' : '') + ': ' + p.join('; '));
    } else {
      seen[d.id] = true;
      dungeons.push(normalize(d));
    }
  });
  return { dungeons: dungeons, problems: problems };
}

export function loadDungeons() {
  // no-cache: revalida a cada visita (304 se nao mudou), entao edicoes no JSON aparecem na hora
  return fetch(new URL('../dungeons.json', import.meta.url), { cache: 'no-cache' }).then(function(r) {
    if (!r.ok) throw new Error('dungeons.json: HTTP ' + r.status);
    return r.json();
  }).then(parseDungeons);
}
