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
  { key: 'CD', label: 'Critical Damage', pctOnly: true },
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

export var DSC_MODULE_PRESETS = [
  { kind: "attack", grade: "N", name: "Attack Module [N]", lines: [{ stat: "AT", value: 25, pct: false }] },
  { kind: "attack", grade: "A", name: "Attack Module [A]", lines: [{ stat: "AT", value: 35, pct: false }] },
  { kind: "attack", grade: "A+", name: "Attack Module [A+]", lines: [{ stat: "AT", value: 55, pct: false }] },
  { kind: "attack", grade: "S", name: "Attack Module [S]", lines: [{ stat: "AT", value: 80, pct: false }] },
  { kind: "attack", grade: "S+", name: "Attack Module [S+]", lines: [{ stat: "AT", value: 120, pct: false }] },
  { kind: "attack", grade: "SS", name: "Attack Module CAT [SS]", lines: [{ stat: "AT", value: 120, pct: false }, { stat: "CD", value: 1, pct: true }] },
  { kind: "attack", grade: "SS+", name: "Attack Module CAT [SS+]", lines: [{ stat: "AT", value: 180, pct: false }, { stat: "CD", value: 2, pct: true }] },
  { kind: "attack", grade: "SSS", name: "Attack Module CAT [SSS]", lines: [{ stat: "AT", value: 270, pct: false }, { stat: "CD", value: 3, pct: true }] },
  { kind: "attack", grade: "SSS+", name: "Attack Module CAT [SSS+]", lines: [{ stat: "AT", value: 400, pct: false }, { stat: "CD", value: 4, pct: true }] },
  { kind: "attack", grade: "U", name: "Attack Module CAT [U]", lines: [{ stat: "AT", value: 600, pct: false }, { stat: "CD", value: 6, pct: true }] },
  { kind: "attack", grade: "SS", name: "Attack Module HT [SS]", lines: [{ stat: "AT", value: 120, pct: false }, { stat: "HT", value: 100, pct: false }] },
  { kind: "attack", grade: "SS+", name: "Attack Module HT [SS+]", lines: [{ stat: "AT", value: 180, pct: false }, { stat: "HT", value: 170, pct: false }] },
  { kind: "attack", grade: "SSS", name: "Attack Module HT [SSS]", lines: [{ stat: "AT", value: 270, pct: false }, { stat: "HT", value: 250, pct: false }] },
  { kind: "attack", grade: "SSS+", name: "Attack Module HT [SSS+]", lines: [{ stat: "AT", value: 400, pct: false }, { stat: "HT", value: 375, pct: false }] },
  { kind: "attack", grade: "U", name: "Attack Module HT [U]", lines: [{ stat: "AT", value: 600, pct: false }, { stat: "HT", value: 560, pct: false }] },
  { kind: "attack", grade: "SS", name: "Attack Module CT [SS]", lines: [{ stat: "AT", value: 120, pct: false }, { stat: "CT", value: 100, pct: false }] },
  { kind: "attack", grade: "SS+", name: "Attack Module CT [SS+]", lines: [{ stat: "AT", value: 180, pct: false }, { stat: "CT", value: 70, pct: false }] },
  { kind: "attack", grade: "SSS", name: "Attack Module CT [SSS]", lines: [{ stat: "AT", value: 270, pct: false }, { stat: "CT", value: 250, pct: false }] },
  { kind: "attack", grade: "SSS+", name: "Attack Module CT [SSS+]", lines: [{ stat: "AT", value: 400, pct: false }, { stat: "CT", value: 275, pct: false }] },
  { kind: "attack", grade: "U", name: "Attack Module CT [U]", lines: [{ stat: "AT", value: 600, pct: false }, { stat: "CT", value: 560, pct: false }] },
  { kind: "attack", grade: "U", name: "Attack Module CAT/Element [U]", lines: [{ stat: "AT", value: 600, pct: false }, { stat: "CD", value: 6, pct: true }] },
  { kind: "attack", grade: "U", name: "Attack Module HT/Element [U]", lines: [{ stat: "AT", value: 600, pct: false }, { stat: "HT", value: 560, pct: false }] },
  { kind: "attack", grade: "U", name: "Attack Module CT/Element [U]", lines: [{ stat: "AT", value: 600, pct: false }, { stat: "CT", value: 560, pct: false }] },
  { kind: "defense", grade: "N", name: "Defense Module [N]", lines: [{ stat: "HP", value: 27, pct: false }] },
  { kind: "defense", grade: "A", name: "Defense Module [A]", lines: [{ stat: "HP", value: 36, pct: false }] },
  { kind: "defense", grade: "A+", name: "Defense Module [A+]", lines: [{ stat: "HP", value: 54, pct: false }] },
  { kind: "defense", grade: "S", name: "Defense Module [S]", lines: [{ stat: "HP", value: 81, pct: false }] },
  { kind: "defense", grade: "S+", name: "Defense Module [S+]", lines: [{ stat: "HP", value: 117, pct: false }] },
  { kind: "defense", grade: "SS", name: "Defense Module BL [SS]", lines: [{ stat: "HP", value: 180, pct: false }, { stat: "BL", value: 25, pct: false }] },
  { kind: "defense", grade: "SS+", name: "Defense Module BL [SS+]", lines: [{ stat: "HP", value: 270, pct: false }, { stat: "BL", value: 40, pct: false }] },
  { kind: "defense", grade: "SSS", name: "Defense Module BL [SSS]", lines: [{ stat: "HP", value: 405, pct: false }, { stat: "BL", value: 170, pct: false }] },
  { kind: "defense", grade: "SSS+", name: "Defense Module BL [SSS+]", lines: [{ stat: "HP", value: 603, pct: false }, { stat: "BL", value: 255, pct: false }, { stat: "HP", value: 1, pct: true }] },
  { kind: "defense", grade: "U", name: "Defense Module BL [U]", lines: [{ stat: "HP", value: 900, pct: false }, { stat: "BL", value: 235, pct: false }, { stat: "HP", value: 2, pct: true }] },
  { kind: "defense", grade: "SS", name: "Defense Module DE [SS]", lines: [{ stat: "HP", value: 180, pct: false }, { stat: "DE", value: 50, pct: false }] },
  { kind: "defense", grade: "SS+", name: "Defense Module DE [SS+]", lines: [{ stat: "HP", value: 270, pct: false }, { stat: "DE", value: 70, pct: false }] },
  { kind: "defense", grade: "SSS", name: "Defense Module DE [SSS]", lines: [{ stat: "HP", value: 405, pct: false }, { stat: "DE", value: 105, pct: false }] },
  { kind: "defense", grade: "SSS+", name: "Defense Module DE [SSS+]", lines: [{ stat: "HP", value: 603, pct: false }, { stat: "DE", value: 155, pct: false }, { stat: "HP", value: 1, pct: true }] },
  { kind: "defense", grade: "U", name: "Defense Module DE [U]", lines: [{ stat: "HP", value: 900, pct: false }, { stat: "DE", value: 235, pct: false }, { stat: "HP", value: 2, pct: true }] },
  { kind: "support", grade: "N", name: "Support Module [N]", lines: [{ stat: "DS", value: 27, pct: false }] },
  { kind: "support", grade: "A", name: "Support Module [A]", lines: [{ stat: "DS", value: 36, pct: false }] },
  { kind: "support", grade: "A+", name: "Support Module [A+]", lines: [{ stat: "DS", value: 54, pct: false }] },
  { kind: "support", grade: "S", name: "Support Module [S]", lines: [{ stat: "DS", value: 81, pct: false }] },
  { kind: "support", grade: "S+", name: "Support Module [S+]", lines: [{ stat: "DS", value: 117, pct: false }] },
  { kind: "support", grade: "SS", name: "Support Module EV [SS]", lines: [{ stat: "DS", value: 180, pct: false }, { stat: "EV", value: 70, pct: false }] },
  { kind: "support", grade: "SS+", name: "Support Module EV [SS+]", lines: [{ stat: "DS", value: 270, pct: false }, { stat: "EV", value: 100, pct: false }] },
  { kind: "support", grade: "SSS", name: "Support Module EV [SSS]", lines: [{ stat: "DS", value: 405, pct: false }, { stat: "EV", value: 155, pct: false }] },
  { kind: "support", grade: "SSS+", name: "Support Module EV [SSS+]", lines: [{ stat: "DS", value: 603, pct: false }, { stat: "EV", value: 230, pct: false }, { stat: "DS", value: 1, pct: true }] },
  { kind: "support", grade: "U", name: "Support Module EV [U]", lines: [{ stat: "DS", value: 900, pct: false }, { stat: "EV", value: 340, pct: false }, { stat: "DS", value: 2, pct: true }] },
  { kind: "support", grade: "SS", name: "Support Module EXP [SS]", lines: [{ stat: "DS", value: 180, pct: false }, { stat: "EXP", value: 90, pct: true }] },
  { kind: "support", grade: "SS+", name: "Support Module EXP [SS+]", lines: [{ stat: "DS", value: 270, pct: false }, { stat: "EXP", value: 135, pct: true }] },
  { kind: "support", grade: "SSS", name: "Support Module EXP [SSS]", lines: [{ stat: "DS", value: 405, pct: false }, { stat: "EXP", value: 200, pct: true }] },
  { kind: "support", grade: "SSS+", name: "Support Module EXP [SSS+]", lines: [{ stat: "DS", value: 603, pct: false }, { stat: "EXP", value: 300, pct: true }, { stat: "DS", value: 1, pct: true }] },
  { kind: "support", grade: "U", name: "Support Module EXP [U]", lines: [{ stat: "DS", value: 900, pct: false }, { stat: "EXP", value: 450, pct: true }, { stat: "DS", value: 2, pct: true }] },
  { kind: "attack", grade: "SSS+", name: "Attack/Defense/Support Module [SSS+]", lines: [{ stat: "SCD", value: 1, pct: true }, { stat: "HP", value: 1, pct: true }, { stat: "DS", value: 1, pct: true }, { stat: "EXP", value: 300, pct: true }] },
  { kind: "attack", grade: "SSS+", name: "Attack/Defense Module [SSS+]", lines: [{ stat: "SCD", value: 1, pct: true }, { stat: "HP", value: 1, pct: true }] },
  { kind: "defense", grade: "SSS+", name: "Defense/Support Module [SSS+]", lines: [{ stat: "HP", value: 1, pct: true }, { stat: "DS", value: 1, pct: true }] },
  { kind: "support", grade: "SSS+", name: "Support/Attack Module [SSS+]", lines: [{ stat: "SCD", value: 1, pct: true }, { stat: "DS", value: 1, pct: true }] },
];
