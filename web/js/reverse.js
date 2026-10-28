// Aba Calculadora Reversa: descobre Base Lv1 e Growth/Lv a partir de valores conhecidos.
import { $, $$ } from './dom.js';
import { fmt, parseNum } from './utils.js';
import { tr } from './i18n.js';
import { STAT_KEYS, STAT_LABELS, EVO_OPTIONS } from './data.js';

export function initReverse() {
  var revModeRadios = $$('input[name="rev-mode"]');
  revModeRadios.forEach(function(r) {
    r.addEventListener('change', function() {
      var mode = document.querySelector('input[name="rev-mode"]:checked').value;
      $('#revPoint2').style.display = mode === '2p' ? 'block' : 'none';
      $('#revBase1').style.display = mode === '1p' ? 'block' : 'none';
    });
  });

  // Stat picker for reverse
  var revStatSelect = $('#revStat');
  STAT_KEYS.forEach(function(sk) {
    var o = document.createElement('option');
    o.value = sk;
    o.textContent = STAT_LABELS[sk];
    revStatSelect.appendChild(o);
  });

  var revEvoSelect = $('#revEvo');
  EVO_OPTIONS.forEach(function(opt) {
    var o = document.createElement('option');
    o.value = opt[1];
    o.textContent = opt[0];
    revEvoSelect.appendChild(o);
  });

  $('#calcularReversoBtn').addEventListener('click', calcularReverso);

  function calcularReverso() {
    var mode = document.querySelector('input[name="rev-mode"]:checked').value;
    var sk = revStatSelect.value;
    var isDs = sk === 'ds';
    var evoMult = parseFloat(revEvoSelect.value);

    var result = { baseLv1: null, growthLv: null };

    if (mode === '2p') {
      var l1 = parseInt($('#revL1').value) || 1;
      var s1 = parseNum($('#revS1').value) || 1.4;
      var t1 = parseNum($('#revT1').value);
      var l2 = parseInt($('#revL2').value) || 140;
      var s2 = parseNum($('#revS2').value) || 1.4;
      var t2 = parseNum($('#revT2').value);

      if (!t1 || !t2) {
        $('#revResult').textContent = tr('preenchaDois');
        return;
      }

      if (isDs) {
        var denom = evoMult * (l2 - l1);
        if (denom === 0) return;
        result.growthLv = (t2 - t1) / denom;
        result.baseLv1 = t1 - result.growthLv * (l1 - 1) * evoMult;
      } else {
        var denom = evoMult * ((l2 - 1) - (s2 / s1) * (l1 - 1));
        if (denom === 0) return;
        result.growthLv = (t2 - (s2 / s1) * t1) / denom;
        result.baseLv1 = (t1 - result.growthLv * (l1 - 1) * evoMult) / s1;
      }
    } else {
      var l1 = parseInt($('#revL1v').value) || 140;
      var s1 = parseNum($('#revS1v').value) || 1.4;
      var t1 = parseNum($('#revT1v').value);
      var bv = parseNum($('#revBaseVal').value);

      if (!t1) {
        $('#revResult').textContent = tr('preenchaTotal');
        return;
      }

      if (isDs) {
        var denom = evoMult * (l1 - 1);
        if (denom === 0) return;
        result.growthLv = (t1 - bv) / denom;
        result.baseLv1 = bv;
      } else {
        var denom = evoMult * (l1 - 1);
        if (denom === 0) return;
        result.growthLv = (t1 - s1 * bv) / denom;
        result.baseLv1 = bv;
      }
    }

    $('#revResult').textContent = tr('baseLv1Result') +
      fmt(result.baseLv1) + tr('growthLvResult') + fmt(result.growthLv);
  }
}
