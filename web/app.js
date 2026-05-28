// ===================== DIGIMON CALCULATOR WEB =====================

document.addEventListener('DOMContentLoaded', function() {
  initApp();
});

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

function initApp() {
  // State
  const state = {
    currentTab: 'calculadora',
    dados: null,
    compareCards: 2,
  };

  // DOM refs
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ===================== TABS =====================
  function switchTab(tabId) {
    state.currentTab = tabId;
    $$('.tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    $$('.tab-content').forEach(function(c) {
      c.classList.toggle('active', c.id === 'tab-' + tabId);
    });
  }

  document.querySelector('.tabs-nav').addEventListener('click', function(e) {
    var btn = e.target.closest('.tab-btn');
    if (btn) switchTab(btn.dataset.tab);
  });

  // ===================== THEME =====================
  var themeBtn = $('#themeToggle');
  themeBtn.addEventListener('click', function() {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? '' : 'dark');
    themeBtn.textContent = isDark ? 'Modo Escuro' : 'Modo Claro';
  });

  // ===================== FORMAT =====================
  function fmt(n) {
    if (n == null || isNaN(n)) return '0';
    return n.toLocaleString('pt-BR', {maximumFractionDigits: 0, minimumFractionDigits: 0});
  }
  function parseNum(v) {
    if (typeof v === 'string') v = v.replace(',', '.');
    var n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }

  // ===================== AUTOCOMPLETE =====================
  function setupAutocomplete(inputId, listId, onSelect) {
    var input = $(inputId);
    var list = $(listId);
    if (!input || !list) return;

    input.addEventListener('input', function() {
      var val = input.value.toLowerCase().trim();
      list.innerHTML = '';
      if (!val) { list.style.display = 'none'; return; }
      var matches = DIGIMON_NAMES.filter(function(n) {
        return n.toLowerCase().indexOf(val) !== -1;
      }).slice(0, 12);
      if (!matches.length) { list.style.display = 'none'; return; }
      matches.forEach(function(name) {
        var div = document.createElement('div');
        div.textContent = name;
        div.addEventListener('click', function() {
          input.value = name;
          list.style.display = 'none';
          if (onSelect) onSelect(name);
        });
        list.appendChild(div);
      });
      list.style.display = 'block';
    });

    input.addEventListener('blur', function() {
      setTimeout(function() { list.style.display = 'none'; }, 200);
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        list.style.display = 'none';
        if (onSelect) onSelect(input.value.trim());
      }
    });
  }

  // ===================== SEARCH (BUSCAR) =====================
  function buscarDigimon(nome) {
    if (!nome) return null;
    var dados = DIGIMON_CACHE[nome];
    if (dados) {
      dados._name = nome;
      dados._source = 'cache';
      return dados;
    }
    // Try alias
    var key = nome.toLowerCase().replace(/\s+/g, ' ').replace(/['":]/g, '')
                .replace(/\(/g, ' ').replace(/\)/g, ' ').replace(/\s+/g, ' ').trim();
    var alias = NAME_ALIASES[key];
    if (alias && DIGIMON_CACHE[alias]) {
      dados = DIGIMON_CACHE[alias];
      dados._name = nome;
      dados._source = 'cache';
      return dados;
    }
    return null;
  }

  // ===================== FLAT GRID GENERATION =====================
  var flatGrid = $('#flatGrid');
  FLAT_CATEGORIES.forEach(function(cat) {
    var label = document.createElement('div');
    label.className = 'label-cell';
    label.textContent = cat;
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
    var dados = buscarDigimon(name);
    if (dados) preencherDados(dados);
    else mostrarErroBusca(name);
  });

  $('#calcBuscarBtn').addEventListener('click', function() {
    var name = $('#calcSearch').value.trim();
    if (!name) return;
    var dados = buscarDigimon(name);
    if (dados) preencherDados(dados);
    else mostrarErroBusca(name);
  });

  function preencherDados(dados) {
    state.dados = dados;
    $('#calcStatus').textContent = 'OK! (' + (dados._source || 'cache') + ')';
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
        $('#sSize').value = WIKI_SIZE;
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

  function mostrarErroBusca(name) {
    state.dados = null;
    $('#calcStatus').textContent = 'Nao encontrado: ' + name;
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
      var size = parseNum($('#sSize').value) || 1.4;
      STAT_KEYS.forEach(function(sk) {
        var bv = parseNum($('#sBase-' + sk).value);
        var av = parseNum($('#sAdic-' + sk).value);
        if (sk === 'ds') {
          baseWAdic[sk] = bv + av;
        } else {
          baseWAdic[sk] = size * bv + av;
        }
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

  // ===================== REVERSE CALCULATOR =====================
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
        $('#revResult').textContent = 'Preencha os dois pontos.';
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
        $('#revResult').textContent = 'Preencha o valor total.';
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

    $('#revResult').textContent = 'Base Lv1 (Size 1.0): ' +
      fmt(result.baseLv1) + '  |  Growth/Lv: ' + fmt(result.growthLv);
  }

  // ===================== COMPARISON =====================
  function addCompareCard() {
    state.compareCards++;
    renderCompareCards();
  }

  function removeCompareCard(idx) {
    if (state.compareCards <= 2) return;
    state.compareCards--;
    renderCompareCards();
  }

  function renderCompareCards() {
    var container = $('#compareContainer');
    container.innerHTML = '';
    for (var i = 0; i < state.compareCards; i++) {
      var card = document.createElement('div');
      card.className = 'compare-card';
      card.dataset.idx = i;

      var header = document.createElement('div');
      header.className = 'card-header';

      var wrap = document.createElement('div');
      wrap.className = 'autocomplete-wrap';
      wrap.style.flex = '1';

      var input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Digimon...';
      input.id = 'cmpSearch-' + i;
      input.autocomplete = 'off';
      input.style.width = '100%';

      var autoList = document.createElement('div');
      autoList.className = 'autocomplete-list';
      autoList.style.width = '100%';

      wrap.appendChild(input);
      wrap.appendChild(autoList);

      (function(inp, lst) {
        inp.addEventListener('input', function() {
          var val = inp.value.toLowerCase().trim();
          lst.innerHTML = '';
          if (!val) { lst.style.display = 'none'; return; }
          var matches = DIGIMON_NAMES.filter(function(n) {
            return n.toLowerCase().indexOf(val) !== -1;
          }).slice(0, 12);
          if (!matches.length) { lst.style.display = 'none'; return; }
          matches.forEach(function(name) {
            var div = document.createElement('div');
            div.textContent = name;
            div.addEventListener('click', function() {
              inp.value = name;
              lst.style.display = 'none';
            });
            lst.appendChild(div);
          });
          lst.style.display = 'block';
        });
        inp.addEventListener('blur', function() {
          setTimeout(function() { lst.style.display = 'none'; }, 200);
        });
        inp.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') { lst.style.display = 'none'; compareSearch(i); }
        });
      })(input, autoList);

      var btnBuscar = document.createElement('button');
      btnBuscar.className = 'btn-buscar';
      btnBuscar.textContent = 'Buscar';
      btnBuscar.style.padding = '4px 12px';
      btnBuscar.dataset.idx = i;
      btnBuscar.addEventListener('click', function() {
        var idx = parseInt(this.dataset.idx);
        compareSearch(idx);
      });

      var closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      closeBtn.textContent = '\u2715';
      closeBtn.dataset.idx = i;
      closeBtn.addEventListener('click', function() {
        removeCompareCard(parseInt(this.dataset.idx));
      });

      header.appendChild(wrap);
      header.appendChild(btnBuscar);
      header.appendChild(closeBtn);
      card.appendChild(header);

      var status = document.createElement('div');
      status.className = 'status';
      status.id = 'cmpStatus-' + i;
      card.appendChild(status);

      var info = document.createElement('div');
      info.className = 'info';
      info.id = 'cmpInfo-' + i;
      card.appendChild(info);

      // Stats table
      var table = document.createElement('table');
      table.className = 'compare-stats';
      var thead = document.createElement('thead');
      var tr = document.createElement('tr');
      ['', 'Final', 'Base'].forEach(function(t) {
        var th = document.createElement('th');
        th.textContent = t;
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);
      var tbody = document.createElement('tbody');
      tbody.id = 'cmpBody-' + i;
      table.appendChild(tbody);
      card.appendChild(table);

      container.appendChild(card);
    }
  }

  function compareSearch(idx) {
    var input = $('#cmpSearch-' + idx);
    if (!input) return;
    var name = input.value.trim();
    if (!name) return;
    var dados = buscarDigimon(name);
    var status = $('#cmpStatus-' + idx);
    var info = $('#cmpInfo-' + idx);
    var tbody = $('#cmpBody-' + idx);

    if (!dados) {
      status.textContent = 'Nao encontrado.';
      status.className = 'status';
      info.textContent = '';
      tbody.innerHTML = '';
      return;
    }

    var source = dados._source || 'cache';
    status.textContent = 'Encontrado (' + source + ')';
    status.className = 'status';
    info.textContent = 'Form: ' + (dados.form || '') + '  |  Lv Cap: ' + (dados.level_cap || '');

    tbody.innerHTML = '';
    STAT_KEYS.forEach(function(sk) {
      var tr = document.createElement('tr');
      var label = document.createElement('td');
      label.textContent = STAT_LABELS[sk];
      label.style.fontWeight = '600';
      tr.appendChild(label);

      var finalTd = document.createElement('td');
      finalTd.textContent = dados[sk] || '-';
      tr.appendChild(finalTd);

      var baseTd = document.createElement('td');
      baseTd.textContent = dados[sk + '_base'] != null ? dados[sk + '_base'] : '-';
      tr.appendChild(baseTd);

      tbody.appendChild(tr);
    });
  }

  $('#addCompareBtn').addEventListener('click', addCompareCard);
  renderCompareCards();

  // ===================== LIST TAB =====================
  var listSortCol = null;
  var listSortRev = false;

  function populateList() {
    var tbody = $('#listBody');
    tbody.innerHTML = '';
    var cached = 0;

    DIGIMON_NAMES.forEach(function(name) {
      var dados = DIGIMON_CACHE[name];
      var tr = document.createElement('tr');
      if (!dados) tr.className = 'uncached';

      var tdName = document.createElement('td');
      tdName.className = 'name-cell';
      tdName.textContent = name;
      tr.appendChild(tdName);

      var fields = ['form', 'hp', 'ds', 'at', 'ct', 'ht', 'de', 'level_cap'];
      fields.forEach(function(f) {
        var td = document.createElement('td');
        if (dados) {
          td.textContent = dados[f] != null ? dados[f] : '---';
        } else {
          td.textContent = '---';
        }
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
      if (dados) cached++;
    });

    $('#listStatus').textContent = cached + '/' + DIGIMON_NAMES.length + ' em cache';
  }

  function sortList(colIdx, header) {
    var tbody = $('#listBody');
    var rows = Array.from(tbody.querySelectorAll('tr'));

    var isNumeric = colIdx >= 2; // HP, DS, AT, CT, HT, DE, Level Cap are numeric
    var reverse = listSortCol === colIdx ? !listSortRev : true;
    listSortCol = colIdx;
    listSortRev = reverse;

    rows.sort(function(a, b) {
      var va = a.cells[colIdx].textContent.trim().replace('%', '');
      var vb = b.cells[colIdx].textContent.trim().replace('%', '');
      if (isNumeric) {
        var na = parseFloat(va.replace(',', '.'));
        var nb = parseFloat(vb.replace(',', '.'));
        if (!isNaN(na) && !isNaN(nb)) return reverse ? nb - na : na - nb;
      }
      return reverse ? vb.localeCompare(va) : va.localeCompare(vb);
    });

    rows.forEach(function(r) { tbody.appendChild(r); });
  }

  // List header click
  var listHeaders = $$('#listTable th');
  listHeaders.forEach(function(th, idx) {
    th.addEventListener('click', function() {
      sortList(idx, th);
    });
  });

  populateList();

  // Refresh list
  $('#refreshListBtn').addEventListener('click', populateList);
}
