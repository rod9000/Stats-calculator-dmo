// Aba D-Unit Organizer: progresso por familia, tiers e stats acumulados.
import { $ } from './dom.js';
import { debounce } from './utils.js';
import { tr } from './i18n.js';
import { DU_RANK_COLORS, DU_TIERS, DU_STAT_LABELS, DU_GROUPS } from './dunit-data.js';

export function initDunit() {
  var DU_COMPLETED_KEY = 'dunit.completed';
  var duCompleted = {};
  try { duCompleted = JSON.parse(localStorage.getItem(DU_COMPLETED_KEY) || '{}'); } catch(e) {}
  function duSave() {
    try { localStorage.setItem(DU_COMPLETED_KEY, JSON.stringify(duCompleted)); } catch(e) {}
  }

  function duIsCondChecked(gid, ci) {
    return !!duCompleted[gid + '_' + ci];
  }
  function duSetCond(gid, ci, val) {
    if (val) duCompleted[gid + '_' + ci] = true;
    else delete duCompleted[gid + '_' + ci];
  }
  function duIsGroupDone(g) {
    return g.conds.every(function(_, ci) { return duIsCondChecked(g.id, ci); });
  }
  function duSetGroup(g, val) {
    g.conds.forEach(function(_, ci) { duSetCond(g.id, ci, val); });
  }

  function duGetTier(count) {
    var tier = null;
    for (var i = 0; i < DU_TIERS.length; i++) {
      if (count >= DU_TIERS[i].groups) tier = DU_TIERS[i];
    }
    return tier || { rank:'Unranked', groups:0, color:'#6b7280', rewards:'' };
  }
  function duGetNextTier(count) {
    for (var i = 0; i < DU_TIERS.length; i++) {
      if (count < DU_TIERS[i].groups) return DU_TIERS[i];
    }
    return null;
  }

  function duGetCompletedCount() {
    var c = 0;
    DU_GROUPS.forEach(function(g) { if (duIsGroupDone(g)) c++; });
    return c;
  }

  function duGetAccumStats() {
    var stats = {};
    DU_GROUPS.forEach(function(g) {
      g.conds.forEach(function(cond, ci) {
        if (!duIsCondChecked(g.id, ci)) return;
        if (cond.re) {
          Object.keys(cond.re).forEach(function(k) {
            stats[k] = (stats[k] || 0) + cond.re[k];
          });
        }
      });
    });
    return stats;
  }

  function duRenderProgress() {
    var count = duGetCompletedCount();
    var total = DU_GROUPS.length;
    var tier = duGetTier(count);
    var nextTier = duGetNextTier(count);
    var pct = Math.min(count / total, 1);
    var circumference = 2 * Math.PI * 60;

    $('#dunitRingCount').textContent = count;
    var ringFill = $('#dunitRingFill');
    ringFill.style.strokeDashoffset = circumference * (1 - pct);
    ringFill.style.stroke = tier.color;

    var badge = $('#dunitRankBadge');
    badge.textContent = tier.rank;
    badge.style.background = tier.color;
    badge.style.color = tier.rank === 'Gold' || tier.rank === 'Diamond' ? '#1a1a1a' : '#fff';

    var nextEl = $('#dunitRankNext');
    if (nextTier) {
      nextEl.textContent = tr('dunitRankNext') + nextTier.rank + ' (' + nextTier.groups + tr('dunitGrupos') + ')';
    } else {
      nextEl.textContent = tr('dunitRankMax');
    }

    var segPct = 0;
    if (nextTier) {
      var prevGroups = tier.groups || 0;
      segPct = Math.min(((count - prevGroups) / (nextTier.groups - prevGroups)) * 100, 100);
    }
    $('#dunitSegmentFill').style.width = segPct + '%';
    $('#dunitSegmentFill').style.background = tier.color;

    var stats = duGetAccumStats();
    var statsHtml = '';
    var statKeys = Object.keys(stats).sort();
    if (statKeys.length > 0) {
      statKeys.forEach(function(k) {
        var label = DU_STAT_LABELS[k] || k;
        var unit = k.indexOf('percent') !== -1 || k.indexOf('SCD') !== -1 ? '%' : '';
        statsHtml += '<span class="dunit-stat-chip">+' + stats[k] + unit + ' <small>' + label + '</small></span>';
      });
    } else {
      statsHtml = '<span style="color:var(--sub-fg);font-size:12px;">' + tr('dunitNoneCompleted') + '</span>';
    }
    $('#dunitStatsAccum').innerHTML = statsHtml;
  }

  function duRenderTierList() {
    var count = duGetCompletedCount();
    var html = '';
    DU_TIERS.forEach(function(t) {
      var active = count >= t.groups;
      html += '<div class="dunit-tier-item' + (active ? ' active' : '') + '">';
      html += '<span class="dunit-tier-dot" style="background:' + t.color + ';"></span>';
      html += '<span class="dunit-tier-name">' + t.rank + '</span>';
      html += '<span class="dunit-tier-groups">' + t.groups + '+</span>';
      html += '<span class="dunit-tier-rewards">' + t.rewards + '</span>';
      html += '</div>';
    });
    $('#dunitTierList').innerHTML = html;
  }

  function duRenderGrid(filter, searchQuery, statFilter) {
    filter = filter || 'all';
    searchQuery = (searchQuery || '').toLowerCase();
    statFilter = statFilter || '';
    var grid = $('#dunitGrid');
    grid.innerHTML = '';

    DU_GROUPS.forEach(function(g) {
      var isDone = duIsGroupDone(g);
      var condCount = g.conds.filter(function(_, ci) { return duIsCondChecked(g.id, ci); }).length;
      if (filter === 'done' && !isDone) return;
      if (filter === 'pending' && isDone) return;
      if (searchQuery && g.family.toLowerCase().indexOf(searchQuery) === -1) return;
      if (statFilter) {
        var hasStat = g.conds.some(function(c) { return c.re && c.re[statFilter]; });
        if (!hasStat) return;
      }

      var html = '<div class="dunit-card' + (isDone ? ' completed' : '') + '">';
      html += '<div class="dunit-card-head">';
      html += '<div class="dunit-card-family">' + g.family + '</div>';
      html += '<div class="dunit-card-count">' + condCount + '/' + g.conds.length + '</div>';
      html += '<label class="dunit-check">';
      html += '<input type="checkbox" data-gid="' + g.id + '" data-type="group"' + (isDone ? ' checked' : '') + '>';
      html += '<span class="dunit-checkmark"></span>';
      html += '</label>';
      html += '</div>';

      html += '<div class="dunit-digimon-list">';
      g.digimons.forEach(function(d) {
        if (typeof d === 'string') {
          html += '<div class="dunit-digi">';
          html += '<span class="dunit-digi-name">' + d + '</span>';
          html += '</div>';
        } else {
          var rc = DU_RANK_COLORS[d.r] || DU_RANK_COLORS.N;
          html += '<div class="dunit-digi">';
          html += '<span class="dunit-digi-name">' + d.n + '</span>';
          html += '<span class="dunit-digi-rank" style="background:' + rc.bg + ';color:' + rc.text + ';">' + d.r + '</span>';
          html += '<span class="dunit-digi-lv">Lv.' + d.l + '</span>';
          html += '</div>';
        }
      });
      html += '</div>';

      html += '<div class="dunit-conditions">';
      g.conds.forEach(function(c, ci) {
        var checked = duIsCondChecked(g.id, ci);
        var label = c.t === 'own' ? tr('dunitPossuir') + c.v + tr('dunitDigimons') :
                    c.t === 'lvl' ? tr('dunitNivelTotal') + c.v :
                    c.t === 'element' ? tr('dunitElemento') + c.v :
                    tr('dunitTranscender') + c.v + tr('dunitDigimons');
        var rewardText = '';
        if (c.re) {
          Object.keys(c.re).forEach(function(k) {
            var rl = DU_STAT_LABELS[k] || k;
            var u = k.indexOf('percent') !== -1 || k.indexOf('SCD') !== -1 ? '%' : '';
            rewardText += '+' + c.re[k] + u + ' ' + rl + ' ';
          });
        }
        html += '<div class="dunit-cond">';
        html += '<label class="dunit-cond-check">';
        html += '<input type="checkbox" data-gid="' + g.id + '" data-ci="' + ci + '" data-type="cond"' + (checked ? ' checked' : '') + '>';
        html += '<span class="dunit-cond-mark"></span>';
        html += '</label>';
        html += '<span class="dunit-cond-label">' + label + '</span>';
        html += '<span class="dunit-cond-reward">' + rewardText.trim() + '</span>';
        html += '</div>';
      });
      html += '</div>';

      html += '</div>';
      grid.innerHTML += html;
    });

    grid.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
      cb.addEventListener('change', function() {
        var gid = this.dataset.gid;
        var type = this.dataset.type;
        if (type === 'group') {
          var group = DU_GROUPS.find(function(g) { return g.id === gid; });
          if (group) duSetGroup(group, this.checked);
        } else {
          var ci = parseInt(this.dataset.ci);
          duSetCond(gid, ci, this.checked);
        }
        duSave();
        duRenderGrid(duFilter, duSearch, duStatFilter);
        duRenderProgress();
        duRenderTierList();
      });
    });
  }

  var duFilter = 'all';
  var duSearch = '';
  var duStatFilter = '';

  document.querySelector('#tab-dunit .dunit-filters').addEventListener('click', function(e) {
    var btn = e.target.closest('.dunit-filter-btn');
    if (!btn) return;
    document.querySelectorAll('#tab-dunit .dunit-filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    duFilter = btn.dataset.filter;
    duRenderGrid(duFilter, duSearch, duStatFilter);
  });

  $('#dunitSearch').addEventListener('input', debounce(function() {
    duSearch = this.value;
    duRenderGrid(duFilter, duSearch, duStatFilter);
  }, 200));

  $('#dunitStatFilter').addEventListener('change', function() {
    duStatFilter = this.value;
    duRenderGrid(duFilter, duSearch, duStatFilter);
  });

  duRenderProgress();
  duRenderTierList();
  duRenderGrid();
}
