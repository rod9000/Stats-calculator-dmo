// Dados do Breakthrough (aba Breakthrough).
// Regras: aviso oficial do DMO (Richard Sampson) e wiki. Valores por casa: tabela usada pelo simulador
// de referencia (allanoliveira33.github.io/dmo_breakthrough_simulator), que por sua vez le a tabela da wiki
// (publicada como imagem). NAO conferi esses numeros no jogo: se a Joymax/GameKing mudar algo, e so ajustar aqui.

export var BT_ATTEMPTS = 40;   // tentativas por Breakthrough
export var BT_CELLS = 10;      // casas por linha de stat
export var BT_POSITIVES = 3;   // linhas que aumentam stat
export var BT_NEGATIVES = 2;   // linhas que diminuem stat

// Ordem do seletor. pct = o valor e uma porcentagem.
export var BT_STATS = [
  { key: 'HP', pct: false },
  { key: 'DS', pct: false },
  { key: 'AT', pct: false },
  { key: 'CT', pct: true },
  { key: 'DE', pct: false },
  { key: 'EV', pct: true },
  { key: 'HT', pct: false },
  { key: 'BL', pct: true },
  { key: 'SDE', pct: true },  // dano de skill por elemento
  { key: 'SDA', pct: true }   // dano de skill por atributo
];

// Valor de cada casa (1 a 10) nas linhas positivas. As casas 9 e 10 ja somam o bonus do estagio amarelo.
export var BT_POSITIVE_CELLS = {
  HP:  [0, 0, 0, 0, 50, 100, 200, 300, 900, 1100],
  DS:  [0, 0, 0, 0, 50, 100, 200, 300, 900, 1100],
  AT:  [0, 0, 0, 0, 30, 50, 100, 300, 350, 500],
  CT:  [0, 0, 0, 0, 0.2, 0.3, 0.5, 1.5, 1.5, 5],
  DE:  [0, 0, 0, 0, 20, 30, 50, 150, 300, 500],
  EV:  [0, 0, 0, 0, 0.2, 0.3, 0.5, 1.5, 1.5, 5],
  HT:  [0, 0, 0, 0, 20, 30, 50, 150, 150, 500],
  BL:  [0, 0, 0, 0, 0.2, 0.3, 0.5, 1.5, 1.5, 5],
  SDE: [0, 0, 0, 0, 0, 0, 1, 1, 2, 3],
  SDA: [0, 0, 0, 0, 0, 0, 1, 1, 2, 3]
};

// Nas linhas negativas as casas 4 a 10 valem todas o mesmo.
var NEGATIVE_STEP = { HP: 150, DS: 150, AT: 75, CT: 0.5, DE: 50, EV: 0.5, HT: 50, BL: 0.5, SDE: 1, SDA: 1 };

export var BT_NEGATIVE_CELLS = {};
Object.keys(NEGATIVE_STEP).forEach(function(k) {
  BT_NEGATIVE_CELLS[k] = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1].map(function(on) { return on * NEGATIVE_STEP[k]; });
});

// Degraus de chance: a cada sucesso desce um degrau, a cada falha sobe um (maximo 75%, minimo 25%).
// simple/double/triple = chance de avancar 1, 2 ou 3 casas de uma vez; a soma e o total do degrau.
export var BT_TIERS = [
  { total: 75, simple: 59,   double: 15, triple: 1 },
  { total: 65, simple: 54.2, double: 10, triple: 0.8 },
  { total: 55, simple: 49.4, double: 5,  triple: 0.6 },
  { total: 45, simple: 41.6, double: 3,  triple: 0.4 },
  { total: 35, simple: 32.8, double: 2,  triple: 0.2 },
  { total: 25, simple: 23.9, double: 1,  triple: 0.1 }
];
