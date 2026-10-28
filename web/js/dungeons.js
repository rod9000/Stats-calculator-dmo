// Aba DG Calculator (Dungeon Checker): compara seus stats com os requisitos de cada dungeon.
// A lista de dungeons vem de dungeons.json; as regras de calculo ficam em dungeon-calc.js.
import { $ } from './dom.js';
import { el } from './utils.js';
import { tr, i18n } from './i18n.js';
import { loadItem, saveItem } from './storage.js';
import { TIERS, loadDungeons } from './dungeon-data.js';
import { calcDungeon } from './dungeon-calc.js';

var STATUS_ICONS = { ready: '✓', close: '⚠', 'not-ready': '✗' };
var STATUS_KEYS = { ready: 'dgReady', close: 'dgClose', 'not-ready': 'dgNotReady' };

function formatNum(n) {
  return Math.round(n).toLocaleString('en-US');
}

function formatDiff(n) {
  var abs = Math.abs(n).toFixed(n % 1 !== 0 ? 2 : 0);
  return (n >= 0 ? '+' : '-') + abs;
}

// check: { eff, req, diff, passes, pct } ou null quando a stat nao foi avaliada
function statBar(label, need, check, idle) {
  var bar = el('div', 'dgcalc-dg-statbar');
  if (idle) bar.setAttribute('data-idle', 'true');

  var head = el('div', 'dgcalc-dg-bar-header');
  head.appendChild(el('span', null, label));
  var right = el('span');
  if (check) {
    right.appendChild(el('span', 'dgcalc-dg-eff', check.eff));
    right.appendChild(document.createTextNode(' / ' + check.req + ' '));
    var diff = el('span', 'dgcalc-dg-diff-text', '(' + check.diff + ')');
    diff.setAttribute('data-pass', String(check.passes));
    right.appendChild(diff);
  } else {
    right.textContent = need;
  }
  head.appendChild(right);
  bar.appendChild(head);

  var track = el('div', 'dgcalc-dg-bar-track');
  var fill = el('div', 'dgcalc-dg-bar-fill');
  fill.setAttribute('data-pass', check ? String(check.passes) : 'false');
  fill.setAttribute('data-close', String(!!check && !check.passes && check.pct >= 90));
  fill.style.width = (check ? check.pct : 0) + '%';
  track.appendChild(fill);
  bar.appendChild(track);
  if (check) bar.appendChild(el('div', 'dgcalc-dg-bar-pct', check.pct.toFixed(0) + '%'));
  return bar;
}

// Stat que a dungeon nao exige (ex.: CT do Belial)
function notApplicableBar(label) {
  var bar = el('div', 'dgcalc-dg-statbar');
  var head = el('div', 'dgcalc-dg-bar-header');
  head.appendChild(el('span', null, label));
  head.appendChild(el('span', null, 'N/A'));
  bar.appendChild(head);
  return bar;
}

function detailRow(label, value) {
  var p = el('p');
  p.appendChild(el('strong', null, label + ': '));
  p.appendChild(document.createTextNode(value));
  return p;
}

function hasDetails(d) {
  return !!(d.recommendedLevel || d.desc || d.build || d.notes.length);
}

function buildDetails(d, isOpen) {
  var details = el('details', 'dgcalc-dg-details');
  details.open = isOpen;
  details.appendChild(el('summary', null, tr('dgDetails')));
  var body = el('div', 'dgcalc-dg-details-body');
  if (d.recommendedLevel) body.appendChild(detailRow(tr('dgRecLevel'), d.recommendedLevel));
  if (d.desc) body.appendChild(el('p', null, d.desc));
  if (d.build) body.appendChild(detailRow(tr('dgBuild'), d.build));
  if (d.notes.length) {
    var list = el('ul', 'dgcalc-dg-notes');
    d.notes.forEach(function(n) { list.appendChild(el('li', null, n)); });
    body.appendChild(list);
  }
  details.appendChild(body);
  return details;
}

// result e stats sao null enquanto o jogador nao preencheu Nivel, CT e HT
function buildCard(dungeon, result, stats, openIds, onToggle) {
  var tier = TIERS[dungeon.tier];
  var card = el('div', 'dgcalc-dg-card');
  var stripe = el('div', 'dgcalc-dg-stripe');
  stripe.style.background = tier.color;
  card.appendChild(stripe);
  var body = el('div', 'dgcalc-dg-body');

  var head = el('div', 'dgcalc-dg-head');
  var names = el('div');
  names.appendChild(el('div', 'dgcalc-dg-name', dungeon.name));
  names.appendChild(el('div', 'dgcalc-dg-full', dungeon.full));
  head.appendChild(names);
  var tierTag = el('span', 'dgcalc-dg-tier', tier.label);
  tierTag.style.background = tier.color + '18';
  tierTag.style.color = tier.color;
  tierTag.style.border = '1px solid ' + tier.color + '35';
  head.appendChild(tierTag);
  body.appendChild(head);

  var row = el('div', 'dgcalc-dg-status-row');
  var boss = el('span', 'dgcalc-dg-boss', 'Boss Lv.' + (dungeon.bossEstimated ? '~' : '') + dungeon.boss);
  if (dungeon.bossEstimated) boss.title = tr('dgBossEstimated');
  row.appendChild(boss);
  if (result) {
    row.appendChild(el('span', 'dgcalc-dg-diff', 'Diff ' + (result.levelDiff > 0 ? '+' + result.levelDiff : result.levelDiff)));
    var badge = el('span', 'dgcalc-dg-badge', STATUS_ICONS[result.status] + ' ' + tr(STATUS_KEYS[result.status]));
    badge.setAttribute('data-status', result.status);
    row.appendChild(badge);
  }
  body.appendChild(row);

  if (dungeon.ctReq == null) {
    body.appendChild(notApplicableBar('Critical (CT)'));
  } else {
    body.appendChild(statBar('Critical (CT)', 'Need ' + dungeon.ctReq.toFixed(2), result && {
      eff: result.effectiveCT.toFixed(2), req: dungeon.ctReq.toFixed(2),
      diff: formatDiff(result.ctDiff), passes: result.ctPasses, pct: result.ctPct
    }));
  }

  body.appendChild(statBar('Hit Rate (HT)', 'Need ' + formatNum(dungeon.htReq), result && {
    eff: formatNum(result.effectiveHT), req: formatNum(dungeon.htReq),
    diff: formatDiff(result.htDiff), passes: result.htPasses, pct: result.htPct
  }));

  // HP e DPS so sao avaliados se o jogador informou o valor; senao a barra fica esmaecida
  [['HP', 'hp', 'hpReq'], ['DPS', 'dps', 'dpsReq']].forEach(function(m) {
    var req = dungeon[m[2]];
    if (req == null) return;
    var check = result && result[m[1]] && {
      eff: formatNum(stats[m[1]]), req: formatNum(req),
      diff: formatDiff(result[m[1]].diff), passes: result[m[1]].passes, pct: result[m[1]].pct
    };
    body.appendChild(statBar(m[0], 'Need ' + formatNum(req), check, !!result && !check));
  });

  if (hasDetails(dungeon)) {
    var details = buildDetails(dungeon, !!openIds[dungeon.id]);
    details.addEventListener('toggle', function() { onToggle(dungeon.id, details.open); });
    body.appendChild(details);
  }

  card.appendChild(body);
  return card;
}

export function initDungeons() {
  var fields = { level: $('#dg-level'), ct: $('#dg-ct'), ht: $('#dg-ht'), hp: $('#dg-hp'), dps: $('#dg-dps') };
  var dungeons = null; // null enquanto carrega (ou se o carregamento falhar)
  var problems = [];
  var failure = null;
  var openIds = {}; // detalhes abertos sobrevivem aos re-renders a cada digitacao

  function readOptional(input) {
    var v = parseFloat(input.value);
    return isFinite(v) && v >= 0 ? v : null;
  }

  function onToggle(id, open) {
    if (open) openIds[id] = true;
    else delete openIds[id];
  }

  function showChip(suffix, value) {
    var box = $('#dgChip' + suffix + 'Box');
    box.style.display = value === null ? 'none' : '';
    if (value !== null) $('#dgChip' + suffix).textContent = formatNum(value);
  }

  function renderMessages() {
    var warn = $('#dgProblems');
    warn.textContent = '';
    warn.style.display = problems.length ? 'block' : 'none';
    if (!problems.length) return;
    warn.appendChild(el('strong', null, tr('dgProblems')));
    var list = el('ul');
    problems.forEach(function(p) { list.appendChild(el('li', null, p)); });
    warn.appendChild(list);
  }

  function render() {
    var grid = $('#dgGrid');
    if (failure) {
      grid.textContent = '';
      var box = el('div', 'dgcalc-error');
      box.appendChild(el('strong', null, tr('dgLoadError')));
      box.appendChild(el('div', null, failure.message));
      grid.appendChild(box);
      $('#dgEmpty').style.display = 'none';
      return;
    }
    if (!dungeons) return;
    renderMessages();

    var lv = parseFloat(fields.level.value);
    var ct = parseFloat(fields.ct.value);
    var ht = parseFloat(fields.ht.value);
    var valid = isFinite(lv) && isFinite(ct) && isFinite(ht) && lv > 0;
    var chips = $('#dgChips');
    var counters = $('#dgCounters');
    var empty = $('#dgEmpty');
    var stats = null;
    var results = {};

    if (valid) {
      stats = { level: lv, ct: ct, ht: ht, hp: readOptional(fields.hp), dps: readOptional(fields.dps) };
      chips.style.display = 'flex';
      counters.style.display = 'flex';
      empty.style.display = 'none';
      $('#dgChipLv').textContent = Math.round(lv);
      $('#dgChipCt').textContent = ct.toFixed(1);
      $('#dgChipHt').textContent = formatNum(ht);
      showChip('Hp', stats.hp);
      showChip('Dps', stats.dps);

      var counts = { ready: 0, close: 0, 'not-ready': 0 };
      dungeons.forEach(function(d) {
        var r = calcDungeon(stats, d);
        results[d.id] = r;
        counts[r.status]++;
      });
      $('#dgReady').textContent = counts.ready;
      $('#dgClose').textContent = counts.close;
      $('#dgNotReady').textContent = counts['not-ready'];
    } else {
      chips.style.display = 'none';
      counters.style.display = 'none';
      empty.style.display = 'flex';
    }

    var frag = document.createDocumentFragment();
    dungeons.forEach(function(d) {
      frag.appendChild(buildCard(d, results[d.id] || null, stats, openIds, onToggle));
    });
    grid.textContent = '';
    grid.appendChild(frag);
  }

  function update() {
    Object.keys(fields).forEach(function(k) { saveItem('dg.' + k, fields[k].value); });
    render();
  }

  Object.keys(fields).forEach(function(k) {
    fields[k].addEventListener('input', update);
    var saved = loadItem('dg.' + k);
    if (saved) fields[k].value = saved;
  });

  i18n.onChange(render);

  loadDungeons().then(function(loaded) {
    dungeons = loaded.dungeons;
    problems = loaded.problems;
    if (problems.length) console.warn('dungeons.json:', problems);
    $('#dgDungeonCount').textContent = dungeons.length + ' dungeons';
    render();
  }, function(err) {
    failure = err;
    console.error(err);
    render();
  });
}
