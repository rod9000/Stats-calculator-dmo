// Dados da aba Clothing: set Frontier (pecas Spirit).
// Fonte: wiki dmowiki.com/Clothing (faixas por tier) e tabela de reforma colada pelo usuario (+10 em diante).
// Por nivel: a wiki so da a faixa de cada tier. Os valores de cada nivel sao INTERPOLADOS dentro do tier (estimativa).

export var CLO_MAX_LEVEL = 15;

// Tiers de upgrade da wiki (niveis inclusive)
export var CLO_TIERS = [
  { from: 0,  to: 4 },
  { from: 5,  to: 9 },
  { from: 10, to: 15 }
];

// Efeito de set com 4 pecas Frontier
export var CLO_FRONTIER_SET = {
  pieces: 4,
  effects: [
    'Redução de dano de skill recebido +20%',
    'Redução de dano recebido +30%',
    'HP máximo +4500',
    'Hit Rate +1000',
    'Dano final +25%'
  ]
};

// Cada peca tem 3 atributos. tiers[i] = { min, max } do tier i. min = max = 0 significa "sem atributo nesse tier".
// unit: 'flat' (valor fixo) ou 'pct' (porcentagem)
export var CLO_FRONTIER_PIECES = [
  {
    id: 'helmet', name: 'Spirit Helmet', slot: 'Cabeça',
    stats: [
      { label: 'CT', unit: 'flat', tiers: [{ min: 1000, max: 1500 }, { min: 1600, max: 2000 }, { min: 2500, max: 3000 }] },
      { label: 'CT-DMG', unit: 'pct', tiers: [{ min: 0, max: 0 }, { min: 30, max: 40 }, { min: 50, max: 55 }] },
      { label: 'CT', unit: 'flat', tiers: [{ min: 0, max: 0 }, { min: 0, max: 0 }, { min: 2000, max: 2500 }] }
    ]
  },
  {
    id: 'accessory', name: 'Spirit Accessory', slot: 'Fashion',
    stats: [
      { label: 'HT', unit: 'flat', tiers: [{ min: 1000, max: 1250 }, { min: 1300, max: 1500 }, { min: 2500, max: 3000 }] },
      { label: 'ATK', unit: 'flat', tiers: [{ min: 0, max: 0 }, { min: 1000, max: 1500 }, { min: 2000, max: 2500 }] },
      { label: 'HT', unit: 'flat', tiers: [{ min: 0, max: 0 }, { min: 0, max: 0 }, { min: 2000, max: 2500 }] }
    ]
  },
  {
    id: 'top', name: 'Spirit Top', slot: 'Top',
    stats: [
      { label: 'HP', unit: 'flat', tiers: [{ min: 2000, max: 2250 }, { min: 2300, max: 2500 }, { min: 4000, max: 4500 }] },
      { label: 'DEF', unit: 'flat', tiers: [{ min: 0, max: 0 }, { min: 600, max: 700 }, { min: 1500, max: 2000 }] },
      { label: 'HP', unit: 'flat', tiers: [{ min: 0, max: 0 }, { min: 0, max: 0 }, { min: 3000, max: 3500 }] }
    ]
  },
  {
    id: 'bottom', name: 'Spirit Bottom', slot: 'Bottom',
    stats: [
      { label: 'DS', unit: 'flat', tiers: [{ min: 2000, max: 2250 }, { min: 2300, max: 2500 }, { min: 4000, max: 4500 }] },
      { label: 'Skill DMG', unit: 'pct', tiers: [{ min: 0, max: 0 }, { min: 20, max: 30 }, { min: 40, max: 45 }] },
      { label: 'DS', unit: 'flat', tiers: [{ min: 0, max: 0 }, { min: 0, max: 0 }, { min: 3000, max: 3500 }] }
    ]
  },
  {
    id: 'gloves', name: 'Spirit Gloves', slot: 'Luvas',
    stats: [
      { label: 'ATK', unit: 'flat', tiers: [{ min: 1500, max: 1750 }, { min: 1800, max: 2000 }, { min: 3000, max: 3500 }] },
      { label: 'ATK-Speed', unit: 'pct', tiers: [{ min: 0, max: 0 }, { min: 3, max: 3 }, { min: 5, max: 5 }] },
      { label: 'ATK', unit: 'flat', tiers: [{ min: 0, max: 0 }, { min: 0, max: 0 }, { min: 1000, max: 1500 }] }
    ]
  },
  {
    id: 'shoes', name: 'Spirit Shoes', slot: 'Sapatos',
    stats: [
      { label: 'Speed', unit: 'pct', tiers: [{ min: 30, max: 30 }, { min: 30, max: 30 }, { min: 30, max: 30 }] },
      { label: 'Affinity', unit: 'flat', tiers: [{ min: 0, max: 0 }, { min: 40, max: 40 }, { min: 40, max: 40 }] },
      { label: 'EXP', unit: 'pct', tiers: [{ min: 0, max: 0 }, { min: 0, max: 0 }, { min: 3000, max: 3500 }] }
    ]
  }
];

// Reforma +10 em diante. Valores "antes" e "agora" como na tabela colada.
// Custo em T. fragments: [refeitos, Kai Preto, reforma] (ordem assumida, a confirmar).
export var CLO_REFORM_FRAGMENTS = ['Fragmentos refeitos', 'Dados Kai: Preto', 'Dados de reforma'];

export var CLO_REFORM = [
  { stage: 'Lição 11',        from: 10, to: 11, success: { before: 9, now: 80 }, fail: 20, destroy: 0,  cost: { before: 30.8,  now: 110 }, fragments: [50, 60, 39] },
  { stage: 'Oitavas de final', from: 11, to: 12, success: { before: 7, now: 80 }, fail: 20, destroy: 0,  cost: { before: 40.0,  now: 180 }, fragments: [69, 82, 55] },
  { stage: 'Oitavas de final', from: 12, to: 13, success: { before: 5, now: 80 }, fail: 20, destroy: 0,  cost: { before: 56.0,  now: 360 }, fragments: [102, 122, 83] },
  { stage: 'Oitavas de final', from: 13, to: 14, success: { before: 3, now: 50 }, fail: 30, destroy: 20, cost: { before: 78.4,  now: 520 }, fragments: [133, 167, 100] },
  { stage: 'Oitavas de final', from: 14, to: 15, success: { before: 2, now: 30 }, fail: 45, destroy: 25, cost: { before: 117.7, now: 705 }, fragments: [240, 300, 180] }
];
