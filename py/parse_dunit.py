import pandas as pd
import json

path = r'C:\Users\Precode TI\Downloads\Union System V2.xlsx'
xl = pd.ExcelFile(path)

# Parse the "Conjuntos" (Sets) sheet - this is the main group data
conj = xl.parse('Conjuntos')
print("=== CONJUNTOS (Set/Group data) ===")
print(f"Rows: {len(conj)}, Cols: {len(conj.columns)}")
print()

# Skip header row (row 0) and total row (row 1)
for i in range(2, len(conj)):
    row = conj.iloc[i]
    name = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ''
    if not name:
        continue
    
    # Parse stat categories
    cats = {}
    for col_start, cat_name in [(1, 'todas_evos'), (3, 'nivel_total'), (5, 'transcendencia'), (7, 'elemento')]:
        stat = str(row.iloc[col_start]).strip() if pd.notna(row.iloc[col_start]) else ''
        val = row.iloc[col_start + 1] if pd.notna(row.iloc[col_start + 1]) else 0
        if stat:
            cats[cat_name] = {'stat': stat, 'value': val}
    
    # Parse digimon list (columns 9-18)
    digimons = []
    for j in range(9, min(19, len(row))):
        d = str(row.iloc[j]).strip() if pd.notna(row.iloc[j]) else ''
        if d and d != 'nan':
            digimons.append(d)
    
    print(f"--- {name} ---")
    print(f"  Stats: {cats}")
    print(f"  Digimons ({len(digimons)}): {digimons}")
    print()
