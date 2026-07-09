import pandas as pd

path = r'C:\Users\Precode TI\Downloads\Union System V2.xlsx'
xl = pd.ExcelFile(path)
print("Sheets:", xl.sheet_names)
print()

for s in xl.sheet_names:
    df = xl.parse(s)
    print(f"=== {s} (rows={len(df)}, cols={len(df.columns)}) ===")
    print("Columns:", list(df.columns))
    print(df.head(15).to_string())
    print()
