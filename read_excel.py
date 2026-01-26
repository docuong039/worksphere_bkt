import pandas as pd
import json
import sys

# Set stdout to use utf-8 to avoid encoding errors on Windows
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'c:\Users\Admin\Documents\worksphere_bkt\docs\UI_STORY_MATRIX_UPDATED.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    sheets = xl.sheet_names
    print(f"Sheets: {sheets}")
    
    for sheet in sheets:
        print(f"\n--- Sheet: {sheet} ---")
        df = pd.read_excel(file_path, sheet_name=sheet)
        # Convert to markdown for better readability in output
        print(df.to_markdown(index=False))
except Exception as e:
    print(f"Error: {e}")

