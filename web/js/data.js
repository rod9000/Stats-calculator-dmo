// digimon_data.js e seal_data.js sao scripts classicos que declaram globais.
// Os modulos importam daqui, em vez de depender de globais soltos.
var digimonCache = DIGIMON_CACHE;
var digimonNames = DIGIMON_NAMES;
var nameAliases = NAME_ALIASES;
var statKeys = STAT_KEYS;
var statLabels = STAT_LABELS;
var flatCategories = FLAT_CATEGORIES;
var wikiSize = WIKI_SIZE;
var evoOptions = EVO_OPTIONS;
var cloneNum = CLONE_NUM;
var seals = SEALS;

export {
  digimonCache as DIGIMON_CACHE,
  digimonNames as DIGIMON_NAMES,
  nameAliases as NAME_ALIASES,
  statKeys as STAT_KEYS,
  statLabels as STAT_LABELS,
  flatCategories as FLAT_CATEGORIES,
  wikiSize as WIKI_SIZE,
  evoOptions as EVO_OPTIONS,
  cloneNum as CLONE_NUM,
  seals as SEALS
};
