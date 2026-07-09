import pandas as pd
import json
import re

# Element mapping
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
    'Basic': 'AT',  # Basic Attribute maps to AT for counting
}

def parse_reward(reward_str):
    """Parse reward string like 'AT +50' or 'Light 1%' into {stat_key: value}"""
    reward_str = reward_str.strip()
    if not reward_str:
        return {}
    
    # Handle percentage rewards like "Light 1%" or "SCD 1%"
    pct_match = re.match(r'(\w[\w\s]*?)\s+(\d+)%', reward_str)
    if pct_match:
        name = pct_match.group(1).strip()
        val = int(pct_match.group(2))
        if name in ELEMENT_MAP:
            return {ELEMENT_MAP[name]: val}
        if name in STAT_MAP:
            return {STAT_MAP[name]: val}
        return {}
    
    # Handle flat rewards like "AT +50"
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
    base = re.sub(r'[^a-zA-Z0-9]', '_', name).upper()[:25]
    return base

# Read Excel2
path2 = r'C:\Users\Precode TI\Downloads\DMO Union.xlsx'
xl2 = pd.ExcelFile(path2)

# Parse Collections
colls = xl2.parse('DigimonCollections')

collections = []
for i in range(len(colls)):
    row = colls.iloc[i]
    name = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ''
    members_str = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else ''
    lvl1 = int(row.iloc[2]) if pd.notna(row.iloc[2]) else 0
    lvl2 = int(row.iloc[3]) if pd.notna(row.iloc[3]) else 0
    num_members = int(row.iloc[4]) if pd.notna(row.iloc[4]) else 0
    r1 = str(row.iloc[9]).strip() if pd.notna(row.iloc[9]) else ''
    r2 = str(row.iloc[10]).strip() if pd.notna(row.iloc[10]) else ''
    r3 = str(row.iloc[11]).strip() if pd.notna(row.iloc[11]) else ''
    r4 = str(row.iloc[12]).strip() if pd.notna(row.iloc[12]) else ''
    
    if not name:
        continue
    
    # Parse members
    members = [m.strip() for m in members_str.split(',') if m.strip()]
    
    # Parse rewards
    re1 = parse_reward(r1)
    re2 = parse_reward(r2)
    re3 = parse_reward(r3)
    re4 = parse_reward(r4)
    
    # Build conditions
    # R1: "own" - requires owning all members
    # R2: "lvl" - requires total level
    # R3: "trans" - requires transcending all
    # R4: "element" - element bonus
    conds = []
    if re1:
        conds.append({'t': 'own', 'v': num_members, 're': re1})
    if re2:
        conds.append({'t': 'lvl', 'v': lvl1, 're': re2})
    if re3:
        conds.append({'t': 'trans', 'v': num_members, 're': re3})
    if re4:
        conds.append({'t': 'element', 'v': 1, 're': re4})
    
    collections.append({
        'id': make_id(name),
        'family': name,
        'cats': ['U'],
        'digimons': members,
        'conds': conds
    })

# Output
print("// Generated from DMO Union.xlsx - DigimonCollections")
print("var DU_COLLECTIONS = [")
for c in collections:
    conds_str = json.dumps(c['conds'], ensure_ascii=False)
    digimons_str = json.dumps(c['digimons'], ensure_ascii=False)
    print(f"  {{id:'{c['id']}',family:'{c['family']}',cats:['U'],digimons:{digimons_str},conds:{conds_str}}},")
print("];")
print(f"\n// Total: {len(collections)} collections")
