// Aba Calculadora: busca de Digimon, modos Simples/Por Nivel, bonus flat e totais.
import { $, $$ } from './dom.js';
import { fmt, parseNum } from './utils.js';
import { tr, i18n } from './i18n.js';
import { FLAT_CATEGORIES, STAT_KEYS, STAT_LABELS, CLONE_NUM, EVO_OPTIONS, WIKI_SIZE } from './data.js';
import { setupAutocomplete, buscarDigimon, buscarDigimonOnline } from './digimon-search.js';

export function initCalculator() {
  var state = { dados: null };

  // ===================== FLAT GRID GENERATION =====================
  var flatGrid = $('#flatGrid');
  var flatCatKey = {'Selos':'flatSelos','Chipset':'flatChipset','D-Unit':'flatDUnit','Equipamentos':'flatEquip','Achievements':'flatAchieve','Buff Tamer':'flatBuff'};
  FLAT_CATEGORIES.forEach(function(cat) {
    var label = document.createElement('div');
    label.className = 'label-cell';
    label.textContent = tr(flatCatKey[cat] || cat);
    flatGrid.appendChild(label);
    STAT_KEYS.forEach(function(sk) {
      var cell = document.createElement('div');
      var inp = document.createElement('input');
      inp.type = 'number';
      inp.id = 'flat-' + cat + '-' + sk;
      inp.step = '1';
      inp.value = '0';
      cell.appendChild(inp);
      flatGrid.appendChild(cell);
    });
  });

  // ===================== CLONE HINT =====================
  var cloneHint = document.querySelector('#cloneLevel + .card-hint');
  function updateCloneHint() {
    var lvl = parseInt($('#cloneLevel').value) || 0;
    var row = CLONE_NUM[lvl] || CLONE_NUM[0];
    cloneHint.textContent = 'AT = x' + (1 + row[1]).toFixed(2) +
      ' | CT = x' + (1 + row[2]).toFixed(2) +
      ' | HP = x' + (1 + row[5]).toFixed(2);
  }
  $('#cloneLevel').addEventListener('change', updateCloneHint);
  updateCloneHint();

  // ===================== CALCULADORA =====================
  // Mode toggle
  var modeRadios = $$('input[name="calc-mode"]');
  modeRadios.forEach(function(r) {
    r.addEventListener('change', function() {
      var mode = document.querySelector('input[name="calc-mode"]:checked').value;
      $('#simple-fields').style.display = mode === 'simples' ? 'block' : 'none';
      $('#nivel-fields').style.display = mode === 'nivel' ? 'block' : 'none';
      if (mode === 'nivel' && state.dados) recalcNivel();
    });
  });

  function calcCloneMult(lvl) {
    var row = CLONE_NUM[lvl] || CLONE_NUM[0];
    var a = row[1], c = row[2], h = row[5];
    return { hp: 1 + h, ds: 1, at: 1 + a, ct: 1 + c, ht: 1, de: 1 };
  }

  // EVO options
  var evoSelect = $('#evoSelect');
  EVO_OPTIONS.forEach(function(opt) {
    var o = document.createElement('option');
    o.value = opt[1];
    o.textContent = opt[0];
    evoSelect.appendChild(o);
  });

  function getEvoMult() { return parseFloat(evoSelect.value); }

  function recalcNivel() {
    var dados = state.dados;
    if (!dados) return;
    var level = parseInt($('#nLevel').value) || 140;
    var size = parseNum($('#nSize').value) || 1.4;
    var mult = getEvoMult();
    var levelCap = dados.level_cap || 140;

    STAT_KEYS.forEach(function(sk) {
      var maxVal = dados[sk];
      var baseVal = dados[sk + '_base'];
      var baseInput = $('#nBase-' + sk);
      var growthInput = $('#nGrowth-' + sk);
      if (maxVal && baseVal) {
        var maxNum = sk === 'ct' ? parseFloat(maxVal) : parseFloat(maxVal);
        var baseNum = sk === 'ct' ? parseFloat(baseVal) : parseFloat(baseVal);
        var growth;
        if (sk === 'ds') {
          growth = (maxNum - baseNum) / (levelCap - 1) / mult;
        } else {
          growth = (maxNum - WIKI_SIZE * baseNum) / (levelCap - 1) / mult;
        }
        growthInput.value = growth.toFixed(3);
      }
      if (baseVal) {
        var val = sk === 'ct' ? parseFloat(baseVal).toFixed(2) : parseFloat(baseVal).toFixed(0);
        baseInput.value = val;
      }

      // Calculate final
      var bv = parseNum(baseInput.value);
      var gv = parseNum(growthInput.value);
      var statFromLv = gv * (level - 1) * mult;
      var gainPerLv = gv * mult;
      var finalLabel = $('#nFinal-' + sk);
      var baseWAdic;
      if (sk === 'ds') {
        baseWAdic = bv + statFromLv;
      } else {
        baseWAdic = size * bv + statFromLv;
      }
      finalLabel.textContent = fmt(baseWAdic);
    });
  }

  $('#nLevel').addEventListener('input', recalcNivel);
  $('#nSize').addEventListener('input', recalcNivel);
  evoSelect.addEventListener('change', recalcNivel);
  STAT_KEYS.forEach(function(sk) {
    $('#nBase-' + sk).addEventListener('input', recalcNivel);
    $('#nGrowth-' + sk).addEventListener('input', recalcNivel);
  });

  // Search on calculator tab
  setupAutocomplete('#calcSearch', '#calcAutoList', function(name) {
    buscarEFill(name, $('#calcStatus'));
  });

  $('#calcBuscarBtn').addEventListener('click', function() {
    var name = $('#calcSearch').value.trim();
    if (!name) return;
    buscarEFill(name, $('#calcStatus'));
  });

  function preencherDados(dados) {
    state.dados = dados;
    $('#calcStatus').textContent = tr('okCache') + (dados._source || 'cache') + ')';
    $('#calcStatus').className = 'status-ok';

    var mode = document.querySelector('input[name="calc-mode"]:checked').value;

    if (mode === 'simples') {
      STAT_KEYS.forEach(function(sk) {
        var raw = dados[sk];
        if (raw) {
          var val = sk === 'ct' ? raw.replace('%', '').trim() : raw;
          $('#sBase-' + sk).value = val;
        }
        $('#sAdic-' + sk).value = '';
      });
    } else {
      STAT_KEYS.forEach(function(sk) {
        var rawBase = dados[sk + '_base'];
        if (rawBase) {
          var val = sk === 'ct' ? rawBase.replace('%', '').trim() : rawBase;
          $('#nBase-' + sk).value = val;
        } else if (dados[sk]) {
          var valNum = sk === 'ct' ? parseFloat(dados[sk]) : parseFloat(dados[sk]);
          if (valNum) $('#nBase-' + sk).value = (valNum / WIKI_SIZE).toFixed(0);
        }
        $('#nGrowth-' + sk).value = '0';
      });
      $('#nSize').value = WIKI_SIZE;
      $('#nLevel').value = dados.level_cap || 140;
      // Set EVO from form
      var form = dados.form || '';
      var evoMatch = EVO_OPTIONS.find(function(o) {
        return o[0].indexOf(form) !== -1 || form.indexOf(o[0]) !== -1;
      }) || EVO_OPTIONS[3];
      evoSelect.value = evoMatch[1];
      recalcNivel();
    }
  }

  // ===================== BUSCAR E PREENCHER =====================
  function buscarEFill(nome, statusEl) {
    var dados = buscarDigimon(nome);
    if (dados) {
      if (statusEl) statusEl.textContent = '';
      preencherDados(dados);
      return;
    }
    if (statusEl) statusEl.textContent = tr('buscandoOnline');
    buscarDigimonOnline(nome).then(function(dados) {
      if (dados) {
        if (statusEl) statusEl.textContent = '';
        preencherDados(dados);
      } else {
        if (statusEl) statusEl.textContent = '';
        mostrarErroBusca(nome);
      }
    });
  }

  function mostrarErroBusca(name) {
    state.dados = null;
    $('#calcStatus').textContent = tr('naoEncontrado') + name;
    $('#calcStatus').className = 'status-err';
  }

  // ===================== CALCULAR =====================
  $('#calcularBtn').addEventListener('click', calcular);
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') calcular();
  });

  function calcular() {
    var mode = document.querySelector('input[name="calc-mode"]:checked').value;
    var cloneLvl = parseInt($('#cloneLevel').value) || 0;
    var cloneMult = calcCloneMult(cloneLvl);

    // Flat totals
    var flatTotals = {};
    STAT_KEYS.forEach(function(sk) { flatTotals[sk] = 0; });
    FLAT_CATEGORIES.forEach(function(cat) {
      STAT_KEYS.forEach(function(sk) {
        var cell = $('#flat-' + cat + '-' + sk);
        if (cell) flatTotals[sk] += parseNum(cell.value);
      });
    });

    var baseWAdic = {};
    var gainPerLv = {};

    if (mode === 'simples') {
      STAT_KEYS.forEach(function(sk) {
        var bv = parseNum($('#sBase-' + sk).value);
        var av = parseNum($('#sAdic-' + sk).value);
        baseWAdic[sk] = bv + av;
        gainPerLv[sk] = null;
      });
    } else {
      var level = parseInt($('#nLevel').value) || 140;
      var size = parseNum($('#nSize').value) || 1.4;
      var mult = getEvoMult();
      STAT_KEYS.forEach(function(sk) {
        var bv = parseNum($('#nBase-' + sk).value);
        var gv = parseNum($('#nGrowth-' + sk).value);
        var statFromLv = gv * (level - 1) * mult;
        gainPerLv[sk] = gv * mult;
        if (sk === 'ds') {
          baseWAdic[sk] = bv + statFromLv;
        } else {
          baseWAdic[sk] = size * bv + statFromLv;
        }
      });
    }

    // Build results
    var results = {};
    STAT_KEYS.forEach(function(sk) {
      var bw = baseWAdic[sk];
      var cm = cloneMult[sk];
      var total = bw * cm + flatTotals[sk];
      var cloneAdd = bw * (cm - 1);
      results[sk] = {
        base: bw,
        cloneMult: cm,
        cloneAdd: cloneAdd,
        flat: flatTotals[sk],
        total: total,
        gain: gainPerLv[sk],
      };
    });

    displayResults(results, mode);
  }

  function displayResults(results, mode) {
    STAT_KEYS.forEach(function(sk) {
      var r = results[sk];
      $('#resLabel-' + sk).textContent = STAT_LABELS[sk];
      $('#resBase-' + sk).textContent = fmt(r.base);
      if (mode === 'nivel' && r.gain != null) {
        $('#resGain-' + sk).textContent = fmt(r.gain);
      } else {
        $('#resGain-' + sk).textContent = '--';
      }
      $('#resCloneX-' + sk).textContent = 'x' + r.cloneMult.toFixed(2);
      $('#resCloneAdd-' + sk).textContent = fmt(r.cloneAdd);
      $('#resFlat-' + sk).textContent = fmt(r.flat);
      $('#resTotal-' + sk).textContent = fmt(r.total);
    });

    var hp = results.hp.total;
    var ds = results.ds.total;
    var at = results.at.total;
    var ct = results.ct.total;
    var ht = results.ht.total;
    var de = results.de.total;
    var nome = $('#calcSearch').value.trim();
    var prefix = nome ? nome + ': ' : '';
    $('#totalLine').textContent = prefix + fmt(hp) + ' HP | ' + fmt(ds) + ' DS | ' +
      fmt(at) + ' AT | ' + fmt(ct) + '% CT | ' + fmt(ht) + ' HT | ' + fmt(de) + ' DE';
  }

  // ===================== COPIAR RESULTADOS =====================
  function copyResults() {
    var hp = document.getElementById('resTotal-hp').textContent;
    var ds = document.getElementById('resTotal-ds').textContent;
    var at = document.getElementById('resTotal-at').textContent;
    var ct = document.getElementById('resTotal-ct').textContent;
    var ht = document.getElementById('resTotal-ht').textContent;
    var de = document.getElementById('resTotal-de').textContent;
    var nome = document.getElementById('calcSearch').value.trim();
    var prefix = nome ? nome + ': ' : '';
    var text = prefix + hp + ' HP | ' + ds + ' DS | ' + at + ' AT | ' + ct + '% CT | ' + ht + ' HT | ' + de + ' DE';
    navigator.clipboard.writeText(text).catch(function() {});
  }

  $('.copy-btn').addEventListener('click', copyResults);

  // ===================== IDIOMA =====================
  // Rotulos montados por JS que o data-i18n nao alcanca
  i18n.onChange(function() {
    ['hp','ds','at','ct','ht','de'].forEach(function(sk) {
      var label = document.getElementById('resLabel-' + sk);
      if (label) label.textContent = tr(sk);
    });
    flatGrid.querySelectorAll('.label-cell').forEach(function(cell, i) {
      if (i < FLAT_CATEGORIES.length) {
        cell.textContent = tr(flatCatKey[FLAT_CATEGORIES[i]] || FLAT_CATEGORIES[i]);
      }
    });
  });
}
