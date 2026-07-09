import pandas as pd
import json

path = r'C:\Users\Precode TI\Downloads\DMO Union.xlsx'
xl = pd.ExcelFile(path)

# Full DigimonLines data
lines = xl.parse('DigimonLines')
print("=== DIGIMON LINES (full) ===")
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
    if name:
        print(f"{name} | unlocks={unlocks} | lvl1={lvl1} lvl2={lvl2} | R1={r1} R2={r2} R3={r3} R4={r4}")

print("\n\n=== DIGIMON COLLECTIONS (full) ===")
colls = xl.parse('DigimonCollections')
for i in range(len(colls)):
    row = colls.iloc[i]
    name = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ''
    members = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else ''
    lvl1 = int(row.iloc[2]) if pd.notna(row.iloc[2]) else 0
    lvl2 = int(row.iloc[3]) if pd.notna(row.iloc[3]) else 0
    num_members = int(row.iloc[4]) if pd.notna(row.iloc[4]) else 0
    r1 = str(row.iloc[9]).strip() if pd.notna(row.iloc[9]) else ''
    r2 = str(row.iloc[10]).strip() if pd.notna(row.iloc[10]) else ''
    r3 = str(row.iloc[11]).strip() if pd.notna(row.iloc[11]) else ''
    r4 = str(row.iloc[12]).strip() if pd.notna(row.iloc[12]) else ''
    if name:
        print(f"{name} | members={num_members} | lvl1={lvl1} lvl2={lvl2} | R1={r1} R2={r2} R3={r3} R4={r4}")
        print(f"  List: {members}")
