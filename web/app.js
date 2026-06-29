// ===================== DIGIMON CALCULATOR WEB =====================

// ===================== i18n =====================
var i18n = {
  _lang: localStorage.getItem('dmo.lang') || 'pt',
  _strings: {
    pt: {
      title: 'Digimon Master Online - Calculadora',
      themeDark: 'Modo Escuro',
      themeLight: 'Modo Claro',
      h1: 'Digimon Master Online',
      sub: 'Calculadora de Status',
      tabCalc: 'Calculadora',
      tabReverse: 'Calculadora Reversa',
      tabCompare: 'Comparação',
      tabList: 'Lista de Digimons',
      tabSeals: 'Seals',
      tabDg: 'DG Calculator',
      tabDunit: 'D-Unit',
      searchDigimon: 'Buscar Digimon',
      searchPlaceholder: 'Nome do Digimon...',
      buscar: 'Buscar',
      baseStat: 'Base Stat',
      simples: 'Simples',
      porNivel: 'Por Nível',
      base: 'Base',
      adicional: 'Adicional',
      level: 'Level:',
      evo: 'Evo:',
      size: 'Size:',
      hp: 'HP', ds: 'DS', at: 'AT', ct: 'CT(%)', ht: 'HT', de: 'DE',
      baseLv1: 'Base Lv1',
      growthLv: 'Growth/Lv',
      final: 'Final',
      clone: 'Clone',
      cloneLevel: 'Nível do Clone:',
      flatBonuses: 'Flat Bonuses',
      flatHint: 'Selos, Chipset, D-Unit, Equipamentos, Achievements, Buff Tamer',
      flatSelos: 'Selos',
      flatChipset: 'Chipset',
      flatDUnit: 'D-Unit',
      flatEquip: 'Equipamentos',
      flatAchieve: 'Achievements',
      flatBuff: 'Buff Tamer',
      calcular: 'Calcular',
      ctrlEnter: 'Ctrl+Enter',
      resultadoFinal: 'Resultado Final',
      stat: 'Stat',
      baseCol: 'Base',
      perLv: '+/Lv',
      cloneX: 'Clone (x)',
      cloneAdd: 'Clone (+)',
      flat: 'Flat',
      total: 'Total',
      copiar: 'Copiar',
      calcReverse: 'Calculadora Reversa',
      revHint: 'Descubra Base Lv1 e Growth/Lv a partir de valores conhecidos.',
      modo: 'Modo:',
      rev2p: 'Descobridor (2 pontos)',
      rev1p: 'Verificador (1 ponto + Base)',
      statLabel: 'Stat:',
      evoLabel: 'Evo:',
      ponto1: 'Ponto 1',
      ponto2: 'Ponto 2',
      totalLabel: 'Total:',
      calcularReverso: 'Calcular Reverso',
      compareTitle: 'Comparação de Digimons',
      compareHint: 'Dois cards por linha, busca direta no cache.',
      digimonPlaceholder: 'Digimon...',
      listTitle: 'Lista de Digimons',
      atualizar: 'Atualizar',
      nome: 'Nome',
      forma: 'Forma',
      lvCap: 'Lv Cap',
      sealCalc: 'Seal Calculator',
      sealCalcTab: 'Calculator',
      sealBrowser: 'Seal Browser',
      targetValue: 'Target Value:',
      calculate: 'Calculate',
      searchSeal: 'Search seal names...',
      ownedOnly: 'Owned only',
      exportJson: 'Exportar .json',
      importJson: 'Carregar .json',
      sealName: 'Name',
      sealMax: 'Max',
      sealPrice: 'Price (M)',
      sealEff: 'Eff.',
      sealOwned: 'Owned',
      dgTitle: 'Dungeon Checker',
      dgSub: 'Insira os stats do seu Digimon — a diferença de nível é aplicada automaticamente.',
      dgYourStats: 'Seus Stats',
      dgLevel: 'Nível',
      dgCt: 'Critical Rate',
      dgHt: 'Hit Rate',
      dgLevelHint: 'Nível atual do seu Digimon',
      dgCtHint: 'Janela de status do Digimon',
      dgHtHint: 'Janela de status do Digimon',
      dgReady: 'Pronto',
      dgClose: 'Quase',
      dgNotReady: 'Não Pronto',
      dgDisclaimer: 'Dados da comunidade. Limite verificado via Holy Guardians. Verifique in-game após patches.',
      dgEndgame: 'Dungeons Endgame',
      dgEmptyTitle: 'Insira seus stats para começar',
      dgEmptyText: 'Preencha Nível, CT e HT na esquerda para ver quais dungeons você está pronto. Resultados atualizam em tempo real.',
      dunitProgress: 'Progresso D-Unit',
      dunitRankNext: 'Próximo: ',
      dunitRankMax: 'Rank Máximo!',
      dunitNoneCompleted: 'Nenhum grupo completado ainda.',
      dunitSearch: 'Buscar familia...',
      dunitAllStats: 'Todas as stats',
      dunitTodos: 'Todos',
      dunitPendentes: 'Pendentes',
      dunitCompletados: 'Completados',
      dunitRewards: 'Recompensas por Tier',
      dunitPossuir: 'Possuir ',
      dunitDigimons: ' Digimons',
      dunitNivelTotal: 'Nivel total ',
      dunitTranscender: 'Transcender ',
      dunitGrupos: ' grupos',
      okCache: 'OK! (',
      naoEncontrado: 'Nao encontrado: ',
      buscandoOnline: 'Buscando online...',
      encontrado: 'Encontrado (',
      form: 'Form: ',
      lvCapLabel: 'Lv Cap: ',
      emCache: ' em cache',
      preenchaDois: 'Preencha os dois pontos.',
      preenchaTotal: 'Preencha o valor total.',
      baseLv1Result: 'Base Lv1 (Size 1.0): ',
      growthLvResult: '  |  Growth/Lv: ',
      seuSeal: 'Your ',
      seals: ' seals: +',
      owned: 'Owned: +',
      need: ' &rarr; Need: +',
      targetAlready: 'Target already reached!',
      yourOwned: 'Your owned seals provide +',
      totalStat: 'Total ',
      totalCost: 'Total Cost',
      sealsNeeded: 'Seals Needed',
      recommended: 'Recommended Seals (by efficiency)',
      enterTarget: 'Enter a target value and click Calculate.',
    },
    en: {
      title: 'Digimon Master Online - Calculator',
      themeDark: 'Dark Mode',
      themeLight: 'Light Mode',
      h1: 'Digimon Master Online',
      sub: 'Stats Calculator',
      tabCalc: 'Calculator',
      tabReverse: 'Reverse Calculator',
      tabCompare: 'Comparison',
      tabList: 'Digimon List',
      tabSeals: 'Seals',
      tabDg: 'DG Calculator',
      tabDunit: 'D-Unit',
      searchDigimon: 'Search Digimon',
      searchPlaceholder: 'Digimon name...',
      buscar: 'Search',
      baseStat: 'Base Stat',
      simples: 'Simple',
      porNivel: 'By Level',
      base: 'Base',
      adicional: 'Bonus',
      level: 'Level:',
      evo: 'Evo:',
      size: 'Size:',
      hp: 'HP', ds: 'DS', at: 'AT', ct: 'CT(%)', ht: 'HT', de: 'DE',
      baseLv1: 'Base Lv1',
      growthLv: 'Growth/Lv',
      final: 'Final',
      clone: 'Clone',
      cloneLevel: 'Clone Level:',
      flatBonuses: 'Flat Bonuses',
      flatHint: 'Seals, Chipset, D-Unit, Equipment, Achievements, Tamer Buff',
      flatSelos: 'Seals',
      flatChipset: 'Chipset',
      flatDUnit: 'D-Unit',
      flatEquip: 'Equipment',
      flatAchieve: 'Achievements',
      flatBuff: 'Tamer Buff',
      calcular: 'Calculate',
      ctrlEnter: 'Ctrl+Enter',
      resultadoFinal: 'Final Result',
      stat: 'Stat',
      baseCol: 'Base',
      perLv: '+/Lv',
      cloneX: 'Clone (x)',
      cloneAdd: 'Clone (+)',
      flat: 'Flat',
      total: 'Total',
      copiar: 'Copy',
      calcReverse: 'Reverse Calculator',
      revHint: 'Find Base Lv1 and Growth/Lv from known values.',
      modo: 'Mode:',
      rev2p: 'Finder (2 points)',
      rev1p: 'Checker (1 point + Base)',
      statLabel: 'Stat:',
      evoLabel: 'Evo:',
      ponto1: 'Point 1',
      ponto2: 'Point 2',
      totalLabel: 'Total:',
      calcularReverso: 'Calculate Reverse',
      compareTitle: 'Digimon Comparison',
      compareHint: 'Two cards per row, direct cache search.',
      digimonPlaceholder: 'Digimon...',
      listTitle: 'Digimon List',
      atualizar: 'Refresh',
      nome: 'Name',
      forma: 'Form',
      lvCap: 'Lv Cap',
      sealCalc: 'Seal Calculator',
      sealCalcTab: 'Calculator',
      sealBrowser: 'Seal Browser',
      targetValue: 'Target Value:',
      calculate: 'Calculate',
      searchSeal: 'Search seal names...',
      ownedOnly: 'Owned only',
      exportJson: 'Export .json',
      importJson: 'Import .json',
      sealName: 'Name',
      sealMax: 'Max',
      sealPrice: 'Price (M)',
      sealEff: 'Eff.',
      sealOwned: 'Owned',
      dgTitle: 'Dungeon Checker',
      dgSub: 'Enter your Digimon stats — level difference is applied automatically.',
      dgYourStats: 'Your Stats',
      dgLevel: 'Level',
      dgCt: 'Critical Rate',
      dgHt: 'Hit Rate',
      dgLevelHint: 'Your digimon\'s current level',
      dgCtHint: 'From your digimon status window',
      dgHtHint: 'From your digimon status window',
      dgReady: 'Ready',
      dgClose: 'Close',
      dgNotReady: 'Not Ready',
      dgDisclaimer: 'Community data. Threshold verified via Holy Guardians. Check in-game after patches.',
      dgEndgame: 'Endgame Dungeons',
      dgEmptyTitle: 'Enter your stats to begin',
      dgEmptyText: 'Fill in Level, CT and HT on the left to see which dungeons you are ready for. Results update in real time.',
      dunitProgress: 'D-Unit Progress',
      dunitRankNext: 'Next: ',
      dunitRankMax: 'Max Rank!',
      dunitNoneCompleted: 'No groups completed yet.',
      dunitSearch: 'Search family...',
      dunitAllStats: 'All stats',
      dunitTodos: 'All',
      dunitPendentes: 'Pending',
      dunitCompletados: 'Completed',
      dunitRewards: 'Tier Rewards',
      dunitPossuir: 'Own ',
      dunitDigimons: ' Digimons',
      dunitNivelTotal: 'Total level ',
      dunitTranscender: 'Transcend ',
      dunitGrupos: ' groups',
      okCache: 'OK! (',
      naoEncontrado: 'Not found: ',
      buscandoOnline: 'Searching online...',
      encontrado: 'Found (',
      form: 'Form: ',
      lvCapLabel: 'Lv Cap: ',
      emCache: ' in cache',
      preenchaDois: 'Fill in both points.',
      preenchaTotal: 'Fill in the total value.',
      baseLv1Result: 'Base Lv1 (Size 1.0): ',
      growthLvResult: '  |  Growth/Lv: ',
      seuSeal: 'Your ',
      seals: ' seals: +',
      owned: 'Owned: +',
      need: ' &rarr; Need: +',
      targetAlready: 'Target already reached!',
      yourOwned: 'Your owned seals provide +',
      totalStat: 'Total ',
      totalCost: 'Total Cost',
      sealsNeeded: 'Seals Needed',
      recommended: 'Recommended Seals (by efficiency)',
      enterTarget: 'Enter a target value and click Calculate.',
    },
    es: {
      title: 'Digimon Master Online - Calculadora',
      themeDark: 'Modo Oscuro',
      themeLight: 'Modo Claro',
      h1: 'Digimon Master Online',
      sub: 'Calculadora de Estadísticas',
      tabCalc: 'Calculadora',
      tabReverse: 'Calculadora Inversa',
      tabCompare: 'Comparación',
      tabList: 'Lista de Digimons',
      tabSeals: 'Seals',
      tabDg: 'DG Calculator',
      tabDunit: 'D-Unit',
      searchDigimon: 'Buscar Digimon',
      searchPlaceholder: 'Nombre del Digimon...',
      buscar: 'Buscar',
      baseStat: 'Estadística Base',
      simples: 'Simple',
      porNivel: 'Por Nivel',
      base: 'Base',
      adicional: 'Adicional',
      level: 'Nivel:',
      evo: 'Evo:',
      size: 'Tamaño:',
      hp: 'HP', ds: 'DS', at: 'AT', ct: 'CT(%)', ht: 'HT', de: 'DE',
      baseLv1: 'Base Lv1',
      growthLv: 'Crecimiento/Lv',
      final: 'Final',
      clone: 'Clone',
      cloneLevel: 'Nivel del Clone:',
      flatBonuses: 'Bonificaciones Planas',
      flatHint: 'Sellos, Chipset, D-Unit, Equipos, Logros, Buff Tamer',
      flatSelos: 'Sellos',
      flatChipset: 'Chipset',
      flatDUnit: 'D-Unit',
      flatEquip: 'Equipos',
      flatAchieve: 'Logros',
      flatBuff: 'Buff Tamer',
      calcular: 'Calcular',
      ctrlEnter: 'Ctrl+Enter',
      resultadoFinal: 'Resultado Final',
      stat: 'Stat',
      baseCol: 'Base',
      perLv: '+/Lv',
      cloneX: 'Clone (x)',
      cloneAdd: 'Clone (+)',
      flat: 'Plana',
      total: 'Total',
      copiar: 'Copiar',
      calcReverse: 'Calculadora Inversa',
      revHint: 'Descubra Base Lv1 y Crecimiento/Lv a partir de valores conocidos.',
      modo: 'Modo:',
      rev2p: 'Descubridor (2 puntos)',
      rev1p: 'Verificador (1 punto + Base)',
      statLabel: 'Stat:',
      evoLabel: 'Evo:',
      ponto1: 'Punto 1',
      ponto2: 'Punto 2',
      totalLabel: 'Total:',
      calcularReverso: 'Calcular Inverso',
      compareTitle: 'Comparación de Digimons',
      compareHint: 'Dos tarjetas por fila, búsqueda directa en caché.',
      digimonPlaceholder: 'Digimon...',
      listTitle: 'Lista de Digimons',
      atualizar: 'Actualizar',
      nome: 'Nombre',
      forma: 'Forma',
      lvCap: 'Lv Máx',
      sealCalc: 'Calculadora de Sellos',
      sealCalcTab: 'Calculadora',
      sealBrowser: 'Navegador',
      targetValue: 'Valor Objetivo:',
      calculate: 'Calcular',
      searchSeal: 'Buscar sellos...',
      ownedOnly: 'Solo propios',
      exportJson: 'Exportar .json',
      importJson: 'Cargar .json',
      sealName: 'Nombre',
      sealMax: 'Máx',
      sealPrice: 'Precio (M)',
      sealEff: 'Efic.',
      sealOwned: 'Propio',
      dgTitle: 'Dungeon Checker',
      dgSub: 'Ingrese las stats de su Digimon — la diferencia de nivel se aplica automáticamente.',
      dgYourStats: 'Tus Stats',
      dgLevel: 'Nivel',
      dgCt: 'Tasa Crítica',
      dgHt: 'Tasa de Acierto',
      dgLevelHint: 'Nivel actual de tu Digimon',
      dgCtHint: 'Ventana de estado del Digimon',
      dgHtHint: 'Ventana de estado del Digimon',
      dgReady: 'Listo',
      dgClose: 'Cerca',
      dgNotReady: 'No Listo',
      dgDisclaimer: 'Datos de la comunidad. Límite verificado mediante Holy Guardians. Verifique en el juego después de parches.',
      dgEndgame: 'Dungeons Endgame',
      dgEmptyTitle: 'Ingrese sus stats para comenzar',
      dgEmptyText: 'Complete Nivel, CT y HT a la izquierda para ver qué mazmorras puede superar. Los resultados se actualizan en tiempo real.',
      dunitProgress: 'Progreso D-Unit',
      dunitRankNext: 'Siguiente: ',
      dunitRankMax: '¡Rango Máximo!',
      dunitNoneCompleted: 'Ningún grupo completado aún.',
      dunitSearch: 'Buscar familia...',
      dunitAllStats: 'Todas las stats',
      dunitTodos: 'Todos',
      dunitPendentes: 'Pendientes',
      dunitCompletados: 'Completados',
      dunitRewards: 'Recompensas por Rango',
      dunitPossuir: 'Poseer ',
      dunitDigimons: ' Digimons',
      dunitNivelTotal: 'Nivel total ',
      dunitTranscender: 'Trascender ',
      dunitGrupos: ' grupos',
      okCache: '¡OK! (',
      naoEncontrado: 'No encontrado: ',
      buscandoOnline: 'Buscando en línea...',
      encontrado: 'Encontrado (',
      form: 'Forma: ',
      lvCapLabel: 'Lv Máx: ',
      emCache: ' en caché',
      preenchaDois: 'Complete los dos puntos.',
      preenchaTotal: 'Complete el valor total.',
      baseLv1Result: 'Base Lv1 (Size 1.0): ',
      growthLvResult: '  |  Crecimiento/Lv: ',
      seuSeal: 'Tus ',
      seals: ' sellos: +',
      owned: 'Propios: +',
      need: ' &rarr; Necesario: +',
      targetAlready: '¡Objetivo ya alcanzado!',
      yourOwned: 'Tus sellos proporcionan +',
      totalStat: 'Total ',
      totalCost: 'Costo Total',
      sealsNeeded: 'Sellos Necesarios',
      recommended: 'Sellos Recomendados (por eficiencia)',
      enterTarget: 'Ingrese un valor objetivo y haga clic en Calcular.',
    },
  },
  t: function(key) {
    var s = this._strings[this._lang];
    return s && s[key] !== undefined ? s[key] : (this._strings.pt[key] || key);
  },
  setLang: function(lang) {
    if (!this._strings[lang]) return;
    this._lang = lang;
    try { localStorage.setItem('dmo.lang', lang); } catch(e) {}
    translateAll();
  }
};

function tr(key) { return i18n.t(key); }

function translateAll() {
  var els = document.querySelectorAll('[data-i18n]');
  els.forEach(function(el) {
    var keys = el.getAttribute('data-i18n').split(' ');
    keys.forEach(function(k) {
      if (k.indexOf(':') !== -1) {
        var parts = k.split(':');
        var attr = parts[0];
        var key = parts[1];
        el.setAttribute(attr, tr(key));
      } else {
        el.textContent = tr(k);
      }
    });
  });

  // Title
  document.title = tr('title');

  // Theme toggle
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = isDark ? tr('themeLight') : tr('themeDark');
  }

  // Dynamic labels
  var statLabels = ['hp','ds','at','ct','ht','de'];
  statLabels.forEach(function(sk) {
    var label = document.getElementById('resLabel-' + sk);
    if (label) label.textContent = tr(sk);
  });

  // Flat grid labels (re-generate)
  var flatGrid = document.getElementById('flatGrid');
  if (flatGrid) {
    var flatCatKey = {'Selos':'flatSelos','Chipset':'flatChipset','D-Unit':'flatDUnit','Equipamentos':'flatEquip','Achievements':'flatAchieve','Buff Tamer':'flatBuff'};
    var labelCells = flatGrid.querySelectorAll('.label-cell');
    labelCells.forEach(function(cell, i) {
      if (i < FLAT_CATEGORIES.length) {
        cell.textContent = tr(flatCatKey[FLAT_CATEGORIES[i]] || FLAT_CATEGORIES[i]);
      }
    });
  }

  // Clone hint - find and update
  var cloneSelect = document.getElementById('cloneLevel');
  var cloneHintEl = cloneSelect ? cloneSelect.nextElementSibling : null;
  if (cloneHintEl && cloneHintEl.classList.contains('card-hint')) {
    var lvl = parseInt(cloneSelect.value) || 0;
    var row = typeof CLONE_NUM !== 'undefined' ? (CLONE_NUM[lvl] || CLONE_NUM[0]) : [0,0,0,0,0,0];
    cloneHintEl.textContent = 'AT = x' + (1 + row[1]).toFixed(2) +
      ' | CT = x' + (1 + row[2]).toFixed(2) +
      ' | HP = x' + (1 + row[5]).toFixed(2);
  }

  // Compare hint
  var compareHint = document.querySelector('#tab-comparacao .card-hint');
  if (compareHint) compareHint.textContent = tr('compareHint');

}

document.addEventListener('DOMContentLoaded', function() {
  initApp();
  // Apply saved language after init
  if (i18n._lang !== 'pt') {
    translateAll();
    document.querySelectorAll('.lang-widget .lang-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.lang === i18n._lang);
    });
  }
});

function initApp() {
  // ===================== UTILS =====================
  function escapeHtml(s) {
    var d = document.createElement('div'); d.appendChild(document.createTextNode(s)); return d.innerHTML;
  }

  function debounce(fn, ms) {
    var t;
    return function() {
      var a = arguments, c = this;
      clearTimeout(t);
      t = setTimeout(function() { fn.apply(c, a); }, ms);
    };
  }

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

  // State
  var state = {
    currentTab: 'calculadora',
    dados: null,
    compareCards: 2,
  };

  // DOM refs
  var $ = function(s) { return document.querySelector(s); };
  var $$ = function(s) { return document.querySelectorAll(s); };

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
    themeBtn.textContent = isDark ? tr('themeDark') : tr('themeLight');
  });

  // ===================== LANG SWITCHER =====================
  // Set active language button
  document.querySelectorAll('.lang-widget .lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.lang === i18n._lang);
  });
  document.getElementById('langWidget').addEventListener('click', function(e) {
    var btn = e.target.closest('.lang-btn');
    if (!btn) return;
    var lang = btn.dataset.lang;
    if (lang === i18n._lang) return;
    document.querySelectorAll('.lang-btn').forEach(function(b) {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    i18n.setLang(lang);
    // Re-apply theme button text
    var isDark = document.body.getAttribute('data-theme') === 'dark';
    themeBtn.textContent = isDark ? tr('themeLight') : tr('themeDark');
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

    input.addEventListener('input', debounce(function() {
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
    }, 200));

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
  var serverOnline = false;

  function checkServer() {
    fetch('/api/search?name=_ping_').then(function(r) {
      serverOnline = r.status === 400; // 400 = missing name (expected)
    }).catch(function() {
      serverOnline = false;
    });
  }
  checkServer();

  function buscarDigimon(nome) {
    if (!nome) return null;
    var dados = DIGIMON_CACHE[nome];
    if (dados) {
      dados._name = nome;
      dados._source = 'cache';
      return dados;
    }
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

  function buscarDigimonOnline(nome) {
    return fetch('/api/search?name=' + encodeURIComponent(nome))
      .then(function(r) {
        if (!r.ok) return null;
        return r.json();
      })
      .then(function(data) {
        if (!data || data.error) return null;
        data._name = nome;
        data._source = data._source || 'server';
        // Add to local cache for next time
        DIGIMON_CACHE[nome] = data;
        return data;
      })
      .catch(function() {
        return null;
      });
  }

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
      input.placeholder = tr('digimonPlaceholder');
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

  function preencherCompareCard(idx, dados) {
    var status = $('#cmpStatus-' + idx);
    var info = $('#cmpInfo-' + idx);
    var tbody = $('#cmpBody-' + idx);

    if (!dados) {
      status.textContent = tr('naoEncontrado').replace(': ', '.');
      status.className = 'status';
      info.textContent = '';
      tbody.innerHTML = '';
      return;
    }

    var source = dados._source || 'cache';
    status.textContent = tr('encontrado') + source + ')';
    status.className = 'status';
    info.textContent = tr('form') + (dados.form || '') + '  |  ' + tr('lvCapLabel') + (dados.level_cap || '');

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

  function compareSearch(idx) {
    var input = $('#cmpSearch-' + idx);
    if (!input) return;
    var name = input.value.trim();
    if (!name) return;
    var status = $('#cmpStatus-' + idx);

    var dados = buscarDigimon(name);
    if (dados) {
      preencherCompareCard(idx, dados);
      return;
    }

    status.textContent = tr('buscandoOnline');
    buscarDigimonOnline(name).then(function(dados) {
      preencherCompareCard(idx, dados);
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

    $('#listStatus').textContent = cached + '/' + DIGIMON_NAMES.length + tr('emCache');
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

  // ===================== SEALS TAB =====================
  var SEAL_STATS = ['AT','CT','HT','HP','DS','DE','BL','EV'];
  var SEAL_COLORS = {
    AT:'#ef4444', CT:'#f97316', HT:'#eab308', HP:'#ec4899',
    DS:'#3b82f6', DE:'#06b6d4', BL:'#10b981', EV:'#a855f7'
  };

  function getSealsForStat(stat) {
    return SEALS.filter(function(s) { return s.stat === stat; }).map(function(s) {
      return { id:s.id, name:s.name, stat:s.stat, max:s.max, price:s.price,
        buyable:s.buyable, efficiency: s.price > 0 ? s.max / s.price : 0 };
    }).sort(function(a, b) { return b.efficiency - a.efficiency; });
  }

  function findOptimalSeals(stat, target, ownedIds) {
    var available = getSealsForStat(stat).filter(function(s) {
      return s.price > 0 && !ownedIds.has(s.id);
    });
    var selected = [], totalStat = 0, totalCost = 0;
    for (var i = 0; i < available.length; i++) {
      if (totalStat >= target) break;
      selected.push(available[i]);
      totalStat += available[i].max;
      totalCost += available[i].price;
    }
    return { seals: selected, totalStat: totalStat, totalCost: totalCost };
  }

  // Load owned from localStorage
  var sealOwned = {};
  try { sealOwned = JSON.parse(localStorage.getItem('dmoseals') || '{}'); } catch(e) {}

  function saveSealOwned() {
    localStorage.setItem('dmoseals', JSON.stringify(sealOwned));
  }

  // Export seals as JSON file
  $('#sealExportBtn').addEventListener('click', function() {
    var data = JSON.stringify(sealOwned, null, 2);
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'dmoseals_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import seals from JSON file
  $('#sealImportBtn').addEventListener('click', function() {
    $('#sealImportFile').click();
  });
  $('#sealImportFile').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var imported = JSON.parse(ev.target.result);
        if (typeof imported !== 'object' || Array.isArray(imported)) {
          alert('Formato inválido. O arquivo deve ser um objeto JSON.');
          return;
        }
        sealOwned = imported;
        saveSealOwned();
        renderSealBrowser();
        if (document.querySelector('[data-subtab="seal-calc"].active')) runSealCalc();
        alert('Dados importados com sucesso! (' + Object.keys(imported).length + ' seals)');
      } catch(err) {
        alert('Erro ao ler o arquivo: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  var sealStat = 'AT';
  function renderSealStats() {
    var container = $('#sealStats');
    container.innerHTML = '';
    SEAL_STATS.forEach(function(st) {
      var btn = document.createElement('button');
      btn.className = 'seal-stat-btn' + (st === sealStat ? ' active' : '');
      btn.textContent = st;
      btn.style.background = st === sealStat ? SEAL_COLORS[st] : '';
      btn.style.color = st === sealStat ? '#fff' : '';
      btn.addEventListener('click', function() {
        sealStat = st;
        renderSealStats();
        renderSealBrowser();
        runSealCalc();
      });
      container.appendChild(btn);
    });
  }

  // Sub-tab switching
  document.querySelector('.sub-tabs-nav').addEventListener('click', function(e) {
    var btn = e.target.closest('.sub-tab-btn');
    if (!btn) return;
    $$('.sub-tab-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
    $$('.sub-tab-content').forEach(function(c) {
      c.classList.toggle('active', c.id === 'subtab-' + btn.dataset.subtab);
    });
    if (btn.dataset.subtab === 'seal-calc') runSealCalc();
  });

  function ownedStatTotal() {
    var total = 0;
    SEALS.forEach(function(s) {
      if (s.stat === sealStat && (sealOwned[s.id] || 0) > 0) total += s.max;
    });
    return total;
  }

  function ownedIds() {
    var ids = new Set();
    Object.keys(sealOwned).forEach(function(id) {
      if (sealOwned[id] > 0) ids.add(parseInt(id));
    });
    return ids;
  }

  var sealSortBy = 'efficiency', sealSortAsc = false;

  // Delegated event listener for seal owned inputs (added once)
  $('#sealBody').addEventListener('input', function(e) {
    var inp = e.target.closest('.seal-table-owned');
    if (!inp) return;
    var id = parseInt(inp.dataset.id);
    sealOwned[id] = parseInt(inp.value) || 0;
    if (!sealOwned[id]) delete sealOwned[id];
    saveSealOwned();
    renderSealBrowser();
    if (document.querySelector('[data-subtab="seal-calc"].active')) runSealCalc();
  });

  function renderSealBrowser() {
    var tbody = $('#sealBody');
    var ownedTotal = ownedStatTotal();
    var query = ($('#sealSearch').value || '').toLowerCase();
    var onlyOwned = $('#sealOwnedOnly').checked;

    var list = getSealsForStat(sealStat);
    if (query) list = list.filter(function(s) { return s.name.toLowerCase().includes(query); });
    if (onlyOwned) list = list.filter(function(s) { return (sealOwned[s.id] || 0) > 0; });

    list.sort(function(a, b) {
      var cmp = 0;
      if (sealSortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sealSortBy === 'max') cmp = a.max - b.max;
      else if (sealSortBy === 'price') cmp = a.price - b.price;
      else if (sealSortBy === 'efficiency') cmp = a.efficiency - b.efficiency;
      return sealSortAsc ? cmp : -cmp;
    });

    tbody.innerHTML = '';
    list.forEach(function(s) {
      var tr = document.createElement('tr');
      var owned = sealOwned[s.id] || 0;
      if (owned > 0) tr.style.background = 'var(--accent-soft)';
      tr.innerHTML =
        '<td class="name-cell">' + escapeHtml(s.name) + '</td>' +
        '<td class="sort-right">+' + s.max + '</td>' +
        '<td class="sort-right">' + (s.price > 0 ? s.price.toFixed(1) : '&mdash;') + '</td>' +
        '<td class="sort-right">' + (s.efficiency > 0 ? s.efficiency.toFixed(1) : '&mdash;') + '</td>' +
        '<td><input type="number" class="seal-table-owned" value="' + (owned || '') + '" min="0" data-id="' + s.id + '"></td>';
      tbody.appendChild(tr);
    });

    // Owned input handler
    // (delegated listener added once outside renderSealBrowser)

    // Summary
    var summary = $('#sealOwnedSummary');
    if (ownedTotal > 0) {
      summary.textContent = tr('seuSeal') + sealStat + tr('seals') + ownedTotal;
      summary.style.color = SEAL_COLORS[sealStat];
    } else {
      summary.textContent = '';
    }
  }

  // Table header sort
  $('#sealTable').addEventListener('click', function(e) {
    var th = e.target.closest('th[data-sort]');
    if (!th) return;
    var col = th.dataset.sort;
    if (sealSortBy === col) sealSortAsc = !sealSortAsc;
    else { sealSortBy = col; sealSortAsc = false; }
    renderSealBrowser();
  });

  // Live search and owned-only filter
  $('#sealSearch').addEventListener('input', debounce(renderSealBrowser, 200));
  $('#sealOwnedOnly').addEventListener('change', renderSealBrowser);

  function runSealCalc() {
    var targetInput = $('#sealTarget');
    var target = parseInt(targetInput.value) || 0;
    var container = $('#sealResult');
    var ownedTotal = ownedStatTotal();
    var effectiveTarget = Math.max(0, target - ownedTotal);

    if (target <= 0) {
      container.innerHTML = '<p style="color:var(--sub-fg);padding:20px 0;">' + tr('enterTarget') + '</p>';
      return;
    }

    if (effectiveTarget <= 0) {
      container.innerHTML =
        '<div class="seal-stat-card" style="border-color:var(--success);">' +
        '<p style="font-weight:700;color:var(--success);font-size:16px;margin-bottom:4px;">' + tr('targetAlready') + '</p>' +
        '<p style="font-size:13px;color:var(--sub-fg);">' + tr('yourOwned') + ownedTotal + ' ' + sealStat + '</p></div>';
      return;
    }

    var result = findOptimalSeals(sealStat, effectiveTarget, ownedIds());

    var html = '';
    if (ownedTotal > 0) {
      html += '<p style="font-size:12px;color:var(--sub-fg);margin-bottom:6px;">' + tr('owned') + ownedTotal + ' ' + sealStat +
        tr('need') + effectiveTarget + '</p>';
    }

    // Summary cards
    var totalWithOwned = result.totalStat + ownedTotal;
    html += '<div class="seal-result-summary">';
    html += '<div class="seal-stat-card"><div class="label">' + tr('totalStat') + sealStat + '</div><div class="value">+' + totalWithOwned + '</div></div>';
    html += '<div class="seal-stat-card"><div class="label">' + tr('totalCost') + '</div><div class="value" style="color:#f59e0b;">' +
      (result.totalCost >= 1000 ? (result.totalCost / 1000).toFixed(1) + 'B' : result.totalCost.toFixed(1) + 'M') +
      '</div></div>';
    html += '<div class="seal-stat-card"><div class="label">' + tr('sealsNeeded') + '</div><div class="value">' + result.seals.length + '</div></div>';
    html += '</div>';

    // Progress bar
    var pct = Math.min(100, (totalWithOwned / target) * 100);
    html += '<div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%;background:' + SEAL_COLORS[sealStat] + '"></div></div>';
    html += '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--sub-fg);margin-bottom:10px;"><span>0</span><span>Target: ' + target + '</span></div>';

    if (result.seals.length > 0) {
      html += '<div style="font-weight:600;font-size:13px;margin-bottom:6px;">' + tr('recommended') + '</div>';
      html += '<div class="list-table-wrap" style="max-height:350px;"><table class="list-table"><thead><tr>';
      html += '<th>#</th><th>Seal</th><th>' + sealStat + '</th><th>Price (M)</th><th>Eff.</th>';
      html += '</tr></thead><tbody>';
      result.seals.forEach(function(s, i) {
        html += '<tr><td>' + (i+1) + '</td><td class="name-cell">' + escapeHtml(s.name) +
          '</td><td>+' + s.max + '</td><td>' + s.price.toFixed(1) +
          '</td><td>' + s.efficiency.toFixed(1) + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    container.innerHTML = html;
  }

  $('#sealCalcBtn').addEventListener('click', runSealCalc);
  $('#sealTarget').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') runSealCalc();
  });

  renderSealStats();
  renderSealBrowser();

  // ===================== DG CALCULATOR =====================
  var DG_TIER_COLORS = { entry:'#3b82f6', mid:'#f59e0b', hard:'#f97316', extreme:'#ef4444' };
  var DG_TIER_LABELS = { entry:'Entry', mid:'Mid', hard:'Hard', extreme:'Extreme' };

  var DG_DUNGEONS = [
    { id:'fdgh', name:'FDGH', full:'Fanglongmon Dungeon Hard', boss:130, ctReq:396, htReq:16250, tier:'entry', desc:'Dungeon endgame de entrada. Melhor ponto de come&ccedil;ar antes de conte&uacute;do intermedi&aacute;rio.' },
    { id:'susano', name:'Susano', full:'Susanoomon Dungeon', boss:140, ctReq:418, htReq:18000, tier:'mid', desc:'Dungeon intermedi&aacute;ria com Susanoomon como boss final. Exige gear s&oacute;lido e coordena&ccedil;&atilde;o em party.' },
    { id:'rbh', name:'RBH', full:'Royal Base Hard', boss:140, ctReq:410, htReq:17000, tier:'mid', desc:'Royal Base em modo Hard. Requisitos similares ao Susano com limiares de stat diferentes.' },
    { id:'colo', name:'COLO', full:'Colosseum Hard', boss:140, ctReq:418, htReq:21111, tier:'mid', desc:'O dungeon Colosseum exige alto hit-rate para acertar consistentemente inimigos evasivos.' },
    { id:'mdg', name:'MDG', full:'MetalGreymon Dungeon', boss:150, ctReq:451, htReq:21000, tier:'hard', desc:'Dungeon tier hard com boss no N&iacute;vel 150. Exige stats acumulados fortes para superar a diferen&ccedil;a de n&iacute;vel.' },
    { id:'gulus_easy', name:'Gulus Easy', full:'Gulus Dungeon (Easy)', boss:150, ctReq:422.4, htReq:22000, tier:'hard', desc:'Modo Easy do Gulus &mdash; ainda exige altos stats. Portal para o conte&uacute;do mais dif&iacacute;cil do DMO.' },
    { id:'gulus', name:'Gulus', full:'Gulus Dungeon', boss:160, ctReq:533, htReq:28452, tier:'extreme', desc:'O p&iacute;ncaro do conte&uacute;do endgame do DMO. Boss N&iacute;vel 160 cria penalidades severas para jogadores abaixo do n&iacute;vel.' }
  ];

  var DG_BRACKETS = [
    [-30,1.3,0.7],[-25,1.2,0.8],[-20,1.2,0.8],[-15,1.1,0.9],[-10,1.1,0.9],
    [-5,1,1],[-1,1,1],[0,1,1],[4,1,1],[9,1,1],
    [14,0.9,1.1],[19,0.8,1.2],[24,0.7,1.3],[29,0.6,1.4]
  ];

  function dgGetBracket(levelDiff) {
    for (var i = 0; i < DG_BRACKETS.length; i++) {
      if (levelDiff <= DG_BRACKETS[i][0]) {
        return { ctMult: DG_BRACKETS[i][1], htMult: DG_BRACKETS[i][2] };
      }
    }
    return { ctMult: 0.5, htMult: 1.5 };
  }

  function dgCalcDungeon(playerLevel, playerCT, playerHT, dungeon) {
    var levelDiff = dungeon.boss - playerLevel;
    var bracket = dgGetBracket(levelDiff);
    var effectiveCT = playerCT * bracket.ctMult;
    var adjustedHTReq = dungeon.htReq * bracket.htMult;
    var effectiveHT = Math.floor(playerHT / bracket.htMult);
    var ctPasses = effectiveCT >= dungeon.ctReq;
    var htPasses = playerHT >= adjustedHTReq;
    var ctPct = dungeon.ctReq > 0 ? Math.min((effectiveCT / dungeon.ctReq) * 100, 150) : 100;
    var htPct = adjustedHTReq > 0 ? Math.min((playerHT / adjustedHTReq) * 100, 150) : 100;
    var status;
    if (ctPasses && htPasses) status = 'ready';
    else if (Math.min(ctPct, htPct) >= 90) status = 'close';
    else status = 'not-ready';
    return {
      levelDiff: levelDiff,
      ctMult: bracket.ctMult,
      htMult: bracket.htMult,
      effectiveCT: effectiveCT,
      effectiveHT: effectiveHT,
      adjustedHTReq: adjustedHTReq,
      ctDiff: effectiveCT - dungeon.ctReq,
      htDiff: playerHT - adjustedHTReq,
      ctPct: Math.min(ctPct, 100),
      htPct: Math.min(htPct, 100),
      status: status,
      ctPasses: ctPasses,
      htPasses: htPasses
    };
  }

  function dgFormatNum(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function dgFormatDiff(n) {
    var abs = Math.abs(n).toFixed(n % 1 !== 0 ? 2 : 0);
    return (n >= 0 ? '+' : '-') + abs;
  }

  function dgRenderCard(dungeon, result) {
    var color = DG_TIER_COLORS[dungeon.tier];
    var tierLabel = DG_TIER_LABELS[dungeon.tier];
    var hasResult = result !== null;
    var ctPct = hasResult ? Math.min(result.ctPct, 100) : 0;
    var htPct = hasResult ? Math.min(result.htPct, 100) : 0;
    var statusInfo = hasResult ? (result.status === 'ready' ? { icon:'&#10003;', label:'Pronto', cls:'ready' } :
      result.status === 'close' ? { icon:'&#9888;', label:'Quase', cls:'close' } :
      { icon:'&#10007;', label:'N&atilde;o Pronto', cls:'not-ready' }) : null;

    var html = '<div class="dgcalc-dg-card">';
    html += '<div class="dgcalc-dg-stripe" style="background:' + color + ';"></div>';
    html += '<div class="dgcalc-dg-body">';
    html += '<div class="dgcalc-dg-head">';
    html += '<div><div class="dgcalc-dg-name">' + dungeon.name + '</div>';
    html += '<div class="dgcalc-dg-full">' + dungeon.full + '</div></div>';
    html += '<span class="dgcalc-dg-tier" style="background:' + color + '18;color:' + color + ';border:1px solid ' + color + '35;">' + tierLabel + '</span>';
    html += '</div>';
    html += '<div class="dgcalc-dg-status-row">';
    html += '<span class="dgcalc-dg-boss">Boss Lv.' + dungeon.boss + '</span>';
    if (hasResult) html += '<span class="dgcalc-dg-diff">Diff ' + (result.levelDiff > 0 ? '+' + result.levelDiff : result.levelDiff) + '</span>';
    if (statusInfo) html += '<span class="dgcalc-dg-badge" data-status="' + statusInfo.cls + '">' + statusInfo.icon + ' ' + statusInfo.label + '</span>';
    html += '</div>';

    // CT bar
    html += '<div class="dgcalc-dg-statbar">';
    html += '<div class="dgcalc-dg-bar-header"><span>Critical (CT)</span>';
    if (hasResult) {
      html += '<span><span class="dgcalc-dg-eff">' + result.effectiveCT.toFixed(2) + '</span> / ' + dungeon.ctReq.toFixed(2) + ' <span class="dgcalc-dg-diff-text" data-pass="' + result.ctPasses + '">(' + dgFormatDiff(result.ctDiff) + ')</span></span>';
    } else {
      html += '<span>Need ' + dungeon.ctReq.toFixed(2) + '</span>';
    }
    html += '</div>';
    html += '<div class="dgcalc-dg-bar-track"><div class="dgcalc-dg-bar-fill" data-pass="' + (hasResult ? result.ctPasses : 'false') + '" data-close="' + (hasResult && !result.ctPasses && result.ctPct >= 90) + '" style="width:' + ctPct + '%;"></div></div>';
    if (hasResult) html += '<div class="dgcalc-dg-bar-pct">' + result.ctPct.toFixed(0) + '%</div>';
    html += '</div>';

    // HT bar
    html += '<div class="dgcalc-dg-statbar">';
    html += '<div class="dgcalc-dg-bar-header"><span>Hit Rate (HT)</span>';
    if (hasResult) {
      html += '<span><span class="dgcalc-dg-eff">' + dgFormatNum(result.effectiveHT) + '</span> / ' + dgFormatNum(dungeon.htReq) + ' <span class="dgcalc-dg-diff-text" data-pass="' + result.htPasses + '">(' + dgFormatDiff(result.htDiff) + ')</span></span>';
    } else {
      html += '<span>Need ' + dgFormatNum(dungeon.htReq) + '</span>';
    }
    html += '</div>';
    html += '<div class="dgcalc-dg-bar-track"><div class="dgcalc-dg-bar-fill" data-pass="' + (hasResult ? result.htPasses : 'false') + '" data-close="' + (hasResult && !result.htPasses && result.htPct >= 90) + '" style="width:' + htPct + '%;"></div></div>';
    if (hasResult) html += '<div class="dgcalc-dg-bar-pct">' + result.htPct.toFixed(0) + '%</div>';
    html += '</div>';

    html += '</div></div>';
    return html;
  }

  var dgLevelInput = $('#dg-level');
  var dgCTInput = $('#dg-ct');
  var dgHTInput = $('#dg-ht');

  function dgUpdate() {
    var lv = parseFloat(dgLevelInput.value);
    var ct = parseFloat(dgCTInput.value);
    var ht = parseFloat(dgHTInput.value);
    var valid = isFinite(lv) && isFinite(ct) && isFinite(ht) && lv > 0;

    // Save to localStorage
    try {
      localStorage.setItem('dg.level', dgLevelInput.value);
      localStorage.setItem('dg.ct', dgCTInput.value);
      localStorage.setItem('dg.ht', dgHTInput.value);
    } catch(e) {}

    var chips = $('#dgChips');
    var counters = $('#dgCounters');
    var empty = $('#dgEmpty');
    var grid = $('#dgGrid');

    if (!valid) {
      chips.style.display = 'none';
      counters.style.display = 'none';
      empty.style.display = 'flex';
      grid.innerHTML = '';
      DG_DUNGEONS.forEach(function(d) {
        grid.innerHTML += dgRenderCard(d, null);
      });
      return;
    }

    chips.style.display = 'flex';
    counters.style.display = 'flex';
    empty.style.display = 'none';
    $('#dgChipLv').textContent = Math.round(lv);
    $('#dgChipCt').textContent = ct.toFixed(1);
    $('#dgChipHt').textContent = dgFormatNum(ht);

    var counts = { ready: 0, close: 0, 'not-ready': 0 };
    var results = {};
    DG_DUNGEONS.forEach(function(d) {
      var r = dgCalcDungeon(lv, ct, ht, d);
      results[d.id] = r;
      counts[r.status]++;
    });

    $('#dgReady').textContent = counts.ready;
    $('#dgClose').textContent = counts.close;
    $('#dgNotReady').textContent = counts['not-ready'];

    grid.innerHTML = '';
    DG_DUNGEONS.forEach(function(d) {
      grid.innerHTML += dgRenderCard(d, results[d.id]);
    });
  }

  dgLevelInput.addEventListener('input', dgUpdate);
  dgCTInput.addEventListener('input', dgUpdate);
  dgHTInput.addEventListener('input', dgUpdate);

  // Load from localStorage
  try {
    var savedLv = localStorage.getItem('dg.level');
    var savedCt = localStorage.getItem('dg.ct');
    var savedHt = localStorage.getItem('dg.ht');
    if (savedLv) dgLevelInput.value = savedLv;
    if (savedCt) dgCTInput.value = savedCt;
    if (savedHt) dgHTInput.value = savedHt;
  } catch(e) {}

  dgUpdate();

  // ===================== D-UNIT ORGANIZER =====================
  var DU_RANKS = ['N','A','A+','S','S+','SS','SS+','SSS','SSS+','U','U+'];
  var DU_RANK_POINTS = { N:0.5, A:1, 'A+':1.5, S:3, 'S+':5, SS:8, 'SS+':15, SSS:20, 'SSS+':25, U:40, 'U+':50 };
  var DU_RANK_COLORS = {
    N:{bg:'#4a5568',text:'#e2e8f0'}, A:{bg:'#276749',text:'#c6f6d5'}, 'A+':{bg:'#2b6cb0',text:'#bee3f8'},
    S:{bg:'#6b46c1',text:'#e9d8fd'}, 'S+':{bg:'#97266d',text:'#fed7e2'}, SS:{bg:'#c05621',text:'#feebc8'},
    'SS+':{bg:'#c53030',text:'#fed7d7'}, SSS:{bg:'#926e1d',text:'#fffff0'}, 'SSS+':{bg:'#614ba6',text:'#fef3c7'},
    U:{bg:'#7f1d1d',text:'#fecaca'}, 'U+':{bg:'#1a1a2e',text:'#f5d38e'}
  };
  var DU_TIERS = [
    { rank:'Bronze', groups:1, color:'#cd7f32', rewards:'HP +700' },
    { rank:'Silver', groups:30, color:'#c0c0c0', rewards:'HP +1000, DS +1500' },
    { rank:'Gold', groups:60, color:'#ffd700', rewards:'HP +1500, EXP 700%, AT +300' },
    { rank:'Platinum', groups:100, color:'#e5e4e2', rewards:'HP +2500, SKD 15%, HT +400' },
    { rank:'Diamond', groups:140, color:'#b9f2ff', rewards:'CT +600, SKD 20%, HT +600' },
    { rank:'Master', groups:190, color:'#ff6b6b', rewards:'CT +1000, SKD 25%, HT +1000' }
  ];
  var DU_STAT_LABELS = {
    HP:'HP', DS:'DS', AT:'AT', DE:'DE', CT:'CT', HT:'HT', EV:'EV', BL:'BL',
    EXP_percent:'EXP %', SCD_percent:'SCD %',
    fire_skill_damage_percent:'Fire SCD', water_skill_damage_percent:'Water SCD',
    ice_skill_damage_percent:'Ice SCD', wood_skill_damage_percent:'Wood SCD',
    light_skill_damage_percent:'Light SCD', dark_skill_damage_percent:'Dark SCD',
    electric_skill_damage_percent:'Elec SCD', wind_skill_damage_percent:'Wind SCD',
    steel_skill_damage_percent:'Steel SCD', unknown_skill_damage_percent:'Neutral SCD',
    vaccine_skill_damage_percent:'Vaccine SCD', virus_skill_damage_percent:'Virus SCD',
    data_skill_damage_percent:'Data SCD'
  };

  var DU_GROUPS = [
    {id:'AGU_U1',family:'Agumon',cats:['U'],digimons:[{n:'Agumon',r:'N',l:150},{n:'Greymon',r:'N',l:150},{n:'MetalGreymon',r:'N',l:150},{n:'WarGreymon',r:'A+',l:150},{n:'SkullGreymon',r:'S',l:150},{n:'MetalGarurumon',r:'SS+',l:150},{n:'VictoryGreymon',r:'S+',l:150},{n:'Agumon - Bond of Bravery',r:'SSS+',l:150}],conds:[{t:'own',v:8,re:{AT:50}},{t:'lvl',v:960,re:{DE:150}},{t:'trans',v:8,re:{AT:70}},{t:'lvl',v:1200,re:{light_skill_damage_percent:1}}]},
    {id:'AGU_U2',family:'Agumon',cats:['U'],digimons:[{n:'Agumon',r:'N',l:150},{n:'Greymon',r:'N',l:150},{n:'MetalGreymon',r:'N',l:150},{n:'WarGreymon',r:'A+',l:150},{n:'SkullGreymon',r:'S',l:150},{n:'MetalGarurumon',r:'SS+',l:150},{n:'VictoryGreymon',r:'S+',l:150},{n:'Omegamon Merciful Mode',r:'U',l:150}],conds:[{t:'own',v:8,re:{CT:30}},{t:'lvl',v:1040,re:{HT:50}},{t:'trans',v:8,re:{SCD_percent:1}},{t:'lvl',v:1280,re:{vaccine_skill_damage_percent:2}}]},
    {id:'AGU_B_U1',family:'Agumon (Black)',cats:['U'],digimons:[{n:'BlackAgumon',r:'N',l:70},{n:'BlackGreymon',r:'N',l:70},{n:'MetalGreymon (Virus)',r:'N',l:70},{n:'BlackWarGreymon',r:'A+',l:70},{n:'Omegamon Zwart',r:'SS',l:70}],conds:[{t:'own',v:5,re:{DS:80}},{t:'lvl',v:550,re:{DS:120}},{t:'trans',v:5,re:{AT:50}},{t:'lvl',v:700,re:{electric_skill_damage_percent:1}}]},
    {id:'AGU_B_U2',family:'Agumon (Black)',cats:['U'],digimons:[{n:'BlackAgumon',r:'N',l:70},{n:'BlackGreymon',r:'N',l:70},{n:'MetalGreymon (Virus)',r:'N',l:70},{n:'BlackWarGreymon',r:'A+',l:70},{n:'Omegamon Zwart',r:'SS',l:70}],conds:[{t:'own',v:5,re:{HP:200}},{t:'lvl',v:400,re:{AT:30}},{t:'trans',v:5,re:{CT:15}},{t:'lvl',v:560,re:{electric_skill_damage_percent:1}}]},
    {id:'GABU_U1',family:'Gabumon',cats:['U'],digimons:[{n:'Gabumon',r:'N',l:133},{n:'Garurumon',r:'N',l:133},{n:'WereGarurumon',r:'N',l:133},{n:'MetalGarurumon',r:'A+',l:133},{n:'MetalGarurumon (Virus)',r:'S',l:133},{n:'Omegamon',r:'SS+',l:133}],conds:[{t:'own',v:6,re:{HT:40}},{t:'lvl',v:800,re:{AT:35}},{t:'trans',v:6,re:{CT:20}},{t:'lvl',v:1000,re:{ice_skill_damage_percent:1}}]},
    {id:'GABU_U2',family:'Gabumon',cats:['U'],digimons:[{n:'Gabumon',r:'N',l:133},{n:'Garurumon',r:'N',l:133},{n:'WereGarurumon',r:'N',l:133},{n:'MetalGarurumon',r:'A+',l:133},{n:'MetalGarurumon (Virus)',r:'S',l:133},{n:'Omegamon',r:'SS+',l:133}],conds:[{t:'own',v:6,re:{DS:60}},{t:'lvl',v:660,re:{HP:150}},{t:'trans',v:6,re:{HT:30}},{t:'lvl',v:880,re:{ice_skill_damage_percent:1}}]},
    {id:'SALA_U1',family:'Salamon',cats:['U'],digimons:[{n:'Salamon',r:'N',l:120},{n:'Gatomon',r:'N',l:120},{n:'Silphymon',r:'A+',l:120},{n:'MagnaAngemon',r:'S',l:120},{n:'Seraphimon',r:'SS',l:120}],conds:[{t:'own',v:5,re:{DE:40}},{t:'lvl',v:600,re:{CT:15}},{t:'trans',v:5,re:{HT:25}},{t:'lvl',v:800,re:{light_skill_damage_percent:1}}]},
    {id:'SALA_U2',family:'Salamon',cats:['U'],digimons:[{n:'Salamon',r:'N',l:120},{n:'Gatomon',r:'N',l:120},{n:'Silphymon',r:'A+',l:120},{n:'MagnaAngemon',r:'S',l:120},{n:'Seraphimon',r:'SS',l:120}],conds:[{t:'own',v:5,re:{HP:180}},{t:'lvl',v:500,re:{AT:25}},{t:'trans',v:5,re:{CT:10}},{t:'lvl',v:700,re:{light_skill_damage_percent:1}}]},
    {id:'PATA_U1',family:'Patamon',cats:['U'],digimons:[{n:'Patamon',r:'N',l:51},{n:'Angemon',r:'N',l:51},{n:'MagnaAngemon',r:'A+',l:51},{n:'Seraphimon',r:'S',l:51}],conds:[{t:'own',v:4,re:{CT:10}},{t:'lvl',v:200,re:{HT:20}},{t:'trans',v:4,re:{DE:30}},{t:'lvl',v:300,re:{light_skill_damage_percent:1}}]},
    {id:'PALM_U1',family:'Palmon',cats:['U'],digimons:[{n:'Palmon',r:'N',l:100},{n:'Togemon',r:'N',l:100},{n:'Lillymon',r:'A+',l:100},{n:'Rosemon',r:'S',l:100}],conds:[{t:'own',v:4,re:{AT:20}},{t:'lvl',v:400,re:{DE:35}},{t:'trans',v:4,re:{CT:12}},{t:'lvl',v:550,re:{wood_skill_damage_percent:1}}]},
    {id:'BIYO_U1',family:'Biyomon',cats:['U'],digimons:[{n:'Biyomon',r:'N',l:80},{n:'Birdramon',r:'N',l:80},{n:'Garudamon',r:'A+',l:80},{n:'Phoenixmon',r:'S',l:80}],conds:[{t:'own',v:4,re:{DS:50}},{t:'lvl',v:320,re:{AT:20}},{t:'trans',v:4,re:{HT:15}},{t:'lvl',v:440,re:{fire_skill_damage_percent:1}}]},
    {id:'GOMA_U1',family:'Gomamon',cats:['U'],digimons:[{n:'Gomamon',r:'N',l:90},{n:'Ikkakumon',r:'N',l:90},{n:'Zudahmon',r:'A+',l:90},{n:'Plesiomon',r:'S',l:90}],conds:[{t:'own',v:4,re:{HP:150}},{t:'lvl',v:360,re:{DS:40}},{t:'trans',v:4,re:{AT:15}},{t:'lvl',v:480,re:{water_skill_damage_percent:1}}]},
    {id:'TOYA_U1',family:'ToyAgumon',cats:['U'],digimons:[{n:'ToyAgumon',r:'N',l:50},{n:'ToyGreymon',r:'N',l:50},{n:'ToyGarurumon',r:'A+',l:50}],conds:[{t:'own',v:3,re:{HP:80}},{t:'lvl',v:150,re:{DE:20}},{t:'trans',v:3,re:{AT:10}},{t:'lvl',v:200,re:{fire_skill_damage_percent:1}}]}
  ];

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
        var rc = DU_RANK_COLORS[d.r] || DU_RANK_COLORS.N;
        html += '<div class="dunit-digi">';
        html += '<span class="dunit-digi-name">' + d.n + '</span>';
        html += '<span class="dunit-digi-rank" style="background:' + rc.bg + ';color:' + rc.text + ';">' + d.r + '</span>';
        html += '<span class="dunit-digi-lv">Lv.' + d.l + '</span>';
        html += '</div>';
      });
      html += '</div>';

      html += '<div class="dunit-conditions">';
      g.conds.forEach(function(c, ci) {
        var checked = duIsCondChecked(g.id, ci);
        var label = c.t === 'own' ? tr('dunitPossuir') + c.v + tr('dunitDigimons') :
                    c.t === 'lvl' ? tr('dunitNivelTotal') + c.v :
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
