import pandas as pd
import json
import re

path = r'C:\Users\Precode TI\Downloads\DMO Union.xlsx'
xl = pd.ExcelFile(path)

lines = xl.parse('DigimonLines')

# Parse rewards
ELEMENT_MAP = {
    'Light': 'light_skill_damage_percent', 'Luz': 'light_skill_damage_percent',
    'Dark': 'dark_skill_damage_percent', 'Trevas': 'dark_skill_damage_percent',
    'Virus': 'virus_skill_damage_percent', 'Fire': 'fire_skill_damage_percent', 'Fogo': 'fire_skill_damage_percent',
    'Ice': 'ice_skill_damage_percent', 'Gelo': 'ice_skill_damage_percent',
    'Water': 'water_skill_damage_percent', 'Agua': 'water_skill_damage_percent',
    'Land': 'earth_skill_damage_percent', 'Terra': 'earth_skill_damage_percent',
    'Wood': 'wood_skill_damage_percent', 'Madeira': 'wood_skill_damage_percent',
    'Thunder': 'electric_skill_damage_percent', 'Trovão': 'electric_skill_damage_percent',
    'Wind': 'wind_skill_damage_percent', 'Vento': 'wind_skill_damage_percent',
    'Data': 'data_skill_damage_percent', 'Dados': 'data_skill_damage_percent',
    'Steel': 'steel_skill_damage_percent', 'Aço': 'steel_skill_damage_percent',
    'Unknown': 'unknown_skill_damage_percent', 'Desconhecido': 'unknown_skill_damage_percent',
    'Vaccine': 'vaccine_skill_damage_percent', 'Vacina': 'vaccine_skill_damage_percent',
}
STAT_MAP = {
    'HP': 'HP', 'DS': 'DS', 'AT': 'AT', 'CT': 'CT', 'HT': 'HT', 'DE': 'DE',
    'BL': 'BL', 'EV': 'EV', 'EXP': 'EXP_percent', 'SCD': 'SCD_percent',
    'Basic': 'AT',
}

def parse_reward(reward_str):
    reward_str = reward_str.strip()
    if not reward_str:
        return {}
    pct_match = re.match(r'(\w[\w\s]*?)\s+(\d+)%', reward_str)
    if pct_match:
        name = pct_match.group(1).strip()
        val = int(pct_match.group(2))
        if name in ELEMENT_MAP:
            return {ELEMENT_MAP[name]: val}
        if name in STAT_MAP:
            return {STAT_MAP[name]: val}
        return {}
    flat_match = re.match(r'(\w+)\s*\+\s*(\d+)', reward_str)
    if flat_match:
        stat = flat_match.group(1).strip()
        val = int(flat_match.group(2))
        if stat in STAT_MAP:
            return {STAT_MAP[stat]: val}
        if stat in ELEMENT_MAP:
            return {ELEMENT_MAP[stat]: val}
        return {}
    return {}

def make_id(name):
    return re.sub(r'[^a-zA-Z0-9]', '_', name).upper()[:25]

groups = []
seen_ids = set()

for i in range(len(lines)):
    row = lines.iloc[i]
    name = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ''
    unlocks = int(row.iloc[1]) if pd.notna(row.iloc[1]) else 0
    lvl1 = int(row.iloc[2]) if pd.notna(row.iloc[2]) else 0
    lvl2 = int(row.iloc[3]) if pd.notna(row.iloc[3]) else 0
    r1 = str(row.iloc[7]).strip() if pd.notna(row.iloc[7]) else ''
    r2 = str(row.iloc[8]).strip() if pd.notna(row.iloc[8]) else ''
    r3 = str(row.iloc[9]).strip() if pd.notna(row.iloc[9]) else ''
    r4 = str(row.iloc[10]).strip() if pd.notna(row.iloc[10]) else ''
    
    if not name:
        continue
    
    re1 = parse_reward(r1)
    re2 = parse_reward(r2)
    re3 = parse_reward(r3)
    re4 = parse_reward(r4)
    
    conds = []
    if re1:
        conds.append({'t': 'own', 'v': unlocks, 're': re1})
    if re2:
        conds.append({'t': 'lvl', 'v': lvl1, 're': re2})
    if re3:
        conds.append({'t': 'trans', 'v': unlocks, 're': re3})
    if re4:
        conds.append({'t': 'element', 'v': 1, 're': re4})
    
    base_id = make_id(name)
    group_id = base_id
    counter = 1
    while group_id in seen_ids:
        group_id = f"{base_id[:23]}_{counter}"
        counter += 1
    seen_ids.add(group_id)
    
    groups.append({
        'id': group_id,
        'family': name,
        'cats': ['L'],
        'digimons': [name],
        'conds': conds
    })

# Output as JS
print("  // === DIGIMON LINES ===")
for g in groups:
    conds_str = json.dumps(g['conds'], ensure_ascii=False)
    digimons_str = json.dumps(g['digimons'], ensure_ascii=False)
    print(f"    {{id:'{g['id']}',family:'{g['family']}',cats:['L'],digimons:{digimons_str},conds:{conds_str}}},")
print(f"  // Total lines: {len(groups)}")
