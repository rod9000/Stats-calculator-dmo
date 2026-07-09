import pandas as pd

path = r'C:\Users\Precode TI\Downloads\DMO Union.xlsx'
xl = pd.ExcelFile(path)
print("Sheets:", xl.sheet_names)
print()

for s in xl.sheet_names:
    df = xl.parse(s)
    print(f"=== {s} (rows={len(df)}, cols={len(df.columns)}) ===")
    print("Columns:", list(df.columns))
    print(df.head(20).to_string())
    print("\n")
