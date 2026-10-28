// Dados do Digisoul Circuit: tabuleiro, tipos de modulo, stats e modulos de exemplo (do print do jogo).
export var DSC_SLOTS = 9;        // tabuleiro 3x3
export var DSC_CENTER = 4;       // slot central (destacado, como no jogo)
export var DSC_MAX_LINES = 4;    // linhas de stat por modulo
export var DSC_MAX_MODULES = 200;

// icone + chave de traducao do nome de cada tipo de modulo
export var DSC_KINDS = {
  attack:  { icon: '⚔️',       labelKey: 'dscKindAttack' },
  defense: { icon: '🛡️', labelKey: 'dscKindDefense' },
  support: { icon: '🏃',       labelKey: 'dscKindSupport' },
  hybrid:  { icon: '✨',             labelKey: 'dscKindHybrid' }
};

// Stats que uma linha de modulo pode ter, na ordem em que os totais aparecem.
// pctOnly: so existe em % (Skill Damage e EXP).
export var DSC_STATS = [
  { key: 'HP', label: 'HP' },
  { key: 'DS', label: 'DS' },
  { key: 'AT', label: 'AT' },
  { key: 'DE', label: 'DE' },
  { key: 'CT', label: 'CT' },
  { key: 'HT', label: 'HT' },
  { key: 'EV', label: 'EV' },
  { key: 'BL', label: 'BL' },
  { key: 'SCD', label: 'Skill Damage', pctOnly: true },
  { key: 'EXP', label: 'EXP', pctOnly: true }
];

// Os 4 modulos que aparecem na lista do print
export var DSC_EXAMPLES = [
  { kind: 'hybrid', grade: 'U', name: '', lines: [
    { stat: 'SCD', value: 1, pct: true }, { stat: 'HP', value: 4, pct: true },
    { stat: 'DS', value: 4, pct: true }, { stat: 'EXP', value: 540, pct: true }] },
  { kind: 'hybrid', grade: 'U', name: '', lines: [
    { stat: 'SCD', value: 2, pct: true }, { stat: 'HP', value: 2, pct: true },
    { stat: 'DS', value: 2, pct: true }, { stat: 'EXP', value: 450, pct: true }] },
  { kind: 'defense', grade: 'SSS+', name: '', lines: [
    { stat: 'HP', value: 603, pct: false }, { stat: 'BL', value: 255, pct: false }, { stat: 'HP', value: 1, pct: true }] },
  { kind: 'defense', grade: 'SSS+', name: '', lines: [
    { stat: 'HP', value: 603, pct: false }, { stat: 'BL', value: 255, pct: false }, { stat: 'HP', value: 1, pct: true }] }
];
