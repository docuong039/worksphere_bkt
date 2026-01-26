import pandas as pd
import os

excel_path = r'c:\Users\Admin\Documents\worksphere_bkt\docs\UI_STORY_MATRIX.xlsx'
frontend_dir = r'c:\Users\Admin\Documents\worksphere_bkt\src\app\(frontend)'

def get_routes_from_code(base_dir):
    routes = []
    for root, dirs, files in os.walk(base_dir):
        if 'page.tsx' in files:
            rel_path = os.path.relpath(root, base_dir)
            if rel_path == '.':
                route = '/'
            else:
                parts = rel_path.split(os.sep)
                route_parts = [p for p in parts if not (p.startswith('(') and p.endswith(')'))]
                route = '/' + '/'.join(route_parts)
            routes.append(route)
    return sorted(list(set(routes)))

def get_routes_from_excel(path):
    all_excel_routes = set()
    xl = pd.ExcelFile(path)
    for sheet in xl.sheet_names:
        if any(x in sheet for x in ['EMP', 'PM', 'CEO', 'SYS', 'ORG']):
            df = pd.read_excel(path, sheet_name=sheet, skiprows=1)
            if 'Route/URL' in df.columns:
                routes = df['Route/URL'].dropna().unique().tolist()
                for r in routes:
                    r_str = str(r).strip()
                    if r_str and r_str.lower() != 'route/url':
                        if not r_str.startswith('/'): r_str = '/' + r_str
                        all_excel_routes.add(r_str.replace('\\', '/'))
    return all_excel_routes

code_routes = get_routes_from_code(frontend_dir)
excel_routes = get_routes_from_excel(excel_path)

print(f"Code routes: {len(code_routes)}")
print(f"Excel routes (all sheets): {len(excel_routes)}")

missing_in_code = [r for r in excel_routes if r not in code_routes]
new_in_code = [r for r in code_routes if r not in excel_routes]

print("\nMissing in code (should delete):")
for r in missing_in_code: print(f"  {r}")

print("\nNew in code (should add):")
for r in new_in_code: print(f"  {r}")
