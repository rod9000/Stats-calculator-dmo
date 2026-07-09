import pandas as pd

path = r'C:\Users\Precode TI\Downloads\Union System V2.xlsx'
xl = pd.ExcelFile(path)

# Full data for each sheet
for s in xl.sheet_names:
    df = xl.parse(s)
    print(f"=== {s} (rows={len(df)}) ===")
    print(df.to_string())
    print("\n\n")
