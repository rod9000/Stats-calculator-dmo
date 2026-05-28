import json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with open('../digimon_stats_cache.json', 'r', encoding='utf-8') as f:
    cache = json.load(f)

with open('../digimon_list.json', 'r', encoding='utf-8') as f:
    names = json.load(f).get('digimon', [])

lines = ['// Auto-generated']
lines.append('const DIGIMON_CACHE = ' + json.dumps(cache, indent=2, ensure_ascii=False) + ';')
lines.append('')
lines.append('const DIGIMON_NAMES = ' + json.dumps(names, indent=2, ensure_ascii=False) + ';')
lines.append('')
lines.append('const STAT_KEYS = ["hp", "ds", "at", "ct", "ht", "de"];')
lines.append('const STAT_LABELS = {"hp": "HP", "ds": "DS", "at": "AT", "ct": "CT(%)", "ht": "HT", "de": "DE"};')
lines.append('')
lines.append('const FLAT_CATEGORIES = ["Selos", "Chipset", "D-Unit", "Equipamentos", "Achievements", "Buff Tamer"];')
lines.append('const WIKI_SIZE = 1.4;')
lines.append('')
lines.append('const EVO_OPTIONS = [')
lines.append('  ["Rookie", 1.0],')
lines.append('  ["Champion", 1.5],')
lines.append('  ["Ultimate / Armor", 1.85],')
lines.append('  ["Mega", 2.0],')
lines.append('  ["Burst Mode / Side Mega", 2.5],')
lines.append('  ["Jogress / Fusion", 3.0],')
lines.append('];')
lines.append('')
lines.append('const EVO_DATA = {')
lines.append('  "Rookie": 1.0,  "Champion": 1.5,  "Ultimate": 1.85,  "Armor": 1.85,')
lines.append('  "Spirit": 1.85,  "Mega": 2.0,  "Burst Mode": 2.5,  "Side Mega": 2.5,')
lines.append('  "Variant": 2.5,  "Jogress": 3.0,  "Fusion": 3.0,')
lines.append('};')
lines.append('')

clone_rows = [
    [0,'0%','0%','0%','0%','0%'],[1,'3%','15%','2%','12%','2%'],
    [2,'6%','30%','4%','24%','4%'],[3,'9%','45%','6%','36%','6%'],
    [4,'14%','70%','9%','56%','9%'],[5,'19%','95%','12%','76%','12%'],
    [6,'24%','120%','15%','96%','15%'],[7,'34%','170%','21%','136%','19%'],
    [8,'44%','220%','27%','176%','23%'],[9,'54%','270%','33%','216%','27%'],
    [10,'69%','345%','42%','276%','31%'],[11,'84%','420%','51%','336%','35%'],
    [12,'99%','495%','60%','396%','39%'],[13,'114%','570%','69%','456%','44%'],
    [14,'129%','645%','78%','516%','49%'],[15,'144%','720%','87%','576%','54%'],
]
lines.append('const CLONE_DATA = [')
for r in clone_rows:
    lines.append(f'  [{r[0]},"{r[1]}","{r[2]}","{r[3]}","{r[4]}","{r[5]}"],')
lines.append('];')
lines.append('const CLONE_NUM = CLONE_DATA.map(function(r) {')
lines.append('  return [r[0], parseFloat(r[1])/100, parseFloat(r[2])/100, parseFloat(r[3])/100, parseFloat(r[4])/100, parseFloat(r[5])/100];')
lines.append('});')
lines.append('')
lines.append('const NAME_ALIASES = {')
lines.append('  "alphamon ouryouken x extreme": "Alphamon Ouryuken (Extreme)",')
lines.append('  "alphamon ouryuken x extreme": "Alphamon Ouryuken (Extreme)",')
lines.append('  "alphamon ouryouken extreme": "Alphamon Ouryuken (Extreme)",')
lines.append('  "alphamon ouryuken extreme": "Alphamon Ouryuken (Extreme)",')
lines.append('  "alphamon ouryouken awaken": "Alphamon Ouryuken (Awaken)",')
lines.append('  "alphamon ouryuken awaken": "Alphamon Ouryuken (Awaken)",')
lines.append('};')

with open('digimon_data.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f'Regenerated digimon_data.js ({len(cache)} entries, {len(names)} names)')
