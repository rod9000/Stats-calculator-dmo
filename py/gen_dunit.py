import pandas as pd
import json
import re

path = r'C:\Users\Precode TI\Downloads\Union System V2.xlsx'
xl = pd.ExcelFile(path)

# Element name mapping to stat keys
ELEMENT_MAP = {
    'Luz': 'light_skill_damage_percent',
    'Trevas': 'dark_skill_damage_percent',
    'Virus': 'virus_skill_damage_percent',
    'Fogo': 'fire_skill_damage_percent',
    'Gelo': 'ice_skill_damage_percent',
    'Agua': 'water_skill_damage_percent',
    'Terra': 'earth_skill_damage_percent',
    'Madeira': 'wood_skill_damage_percent',
    'Trovão': 'electric_skill_damage_percent',
    'Vento': 'wind_skill_damage_percent',
    'Dados': 'data_skill_damage_percent',
    'Aço': 'steel_skill_damage_percent',
    'Desconhecido': 'unknown_skill_damage_percent',
}

# Stat name mapping
STAT_MAP = {
    'HP': 'HP', 'DS': 'DS', 'AT': 'AT', 'CT': 'CT', 'HT': 'HT', 'DE': 'DE',
    'BL': 'BL', 'EV': 'EV', 'EXP': 'EXP_percent', 'Hp': 'HP',
    'Skill DMG': 'SCD_percent', 'ATT': 'AT',
}

def map_stat(stat_name):
    if stat_name in ELEMENT_MAP:
        return ELEMENT_MAP[stat_name]
    if stat_name in STAT_MAP:
        return STAT_MAP[stat_name]
    return stat_name

# Parse "Conjuntos" sheet
conj = xl.parse('Conjuntos')

groups = []
for i in range(2, len(conj)):
    row = conj.iloc[i]
    name = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ''
    if not name or name == 'nan':
        continue
    
    # Parse 4 stat categories
    conds = []
    for col_start, cond_type in [(1, 'own'), (3, 'lvl'), (5, 'trans'), (7, 'element')]:
        stat = str(row.iloc[col_start]).strip() if pd.notna(row.iloc[col_start]) else ''
        val = row.iloc[col_start + 1] if pd.notna(row.iloc[col_start + 1]) else 0
        
        if stat and stat != 'nan':
            mapped_stat = map_stat(stat)
            val = float(val) if val else 0
            
            if cond_type == 'element':
                # Element conditions: stat is the element, value is the count
                conds.append({'t': 'element', 'v': int(val), 're': {mapped_stat: 1}})
            else:
                conds.append({'t': cond_type, 'v': int(val) if val == int(val) else val, 're': {mapped_stat: int(val) if val == int(val) else val}})
    
    # Parse digimon list
    digimons = []
    for j in range(9, min(19, len(row))):
        d = str(row.iloc[j]).strip() if pd.notna(row.iloc[j]) else ''
        if d and d != 'nan' and d != 'NaN':
            digimons.append(d)
    
    # Generate ID from name
    group_id = re.sub(r'[^a-zA-Z0-9]', '_', name).upper()[:20]
    
    groups.append({
        'id': group_id,
        'family': name,
        'cats': ['U'],
        'digimons': digimons,
        'conds': conds
    })

# Output as JS
print("// Generated from Excel - Union System V2")
print("var DU_GROUPS = [")
for g in groups:
    conds_str = json.dumps(g['conds'], ensure_ascii=False)
    digimons_str = json.dumps(g['digimons'], ensure_ascii=False)
    print(f"  {{id:'{g['id']}',family:'{g['family']}',cats:['U'],digimons:{digimons_str},conds:{conds_str}}},")
print("];")
print(f"\n// Total: {len(groups)} groups")
