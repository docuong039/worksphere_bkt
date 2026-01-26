import os
import pandas as pd
import sys

sys.stdout.reconfigure(encoding='utf-8')

frontend_dir = r'c:\Users\Admin\Documents\worksphere_bkt\src\app\(frontend)'
excel_path = r'c:\Users\Admin\Documents\worksphere_bkt\docs\UI_STORY_MATRIX.xlsx'

def get_routes(base_dir):
    routes = []
    for root, dirs, files in os.walk(base_dir):
        if 'page.tsx' in files:
            # Get path relative to base_dir
            rel_path = os.path.relpath(root, base_dir)
            if rel_path == '.':
                route = '/'
            else:
                # Remove (group) folders from route
                parts = rel_path.split(os.sep)
                route_parts = [p for p in parts if not (p.startswith('(') and p.endswith(')'))]
                route = '/' + '/'.join(route_parts)
            routes.append(route)
    return sorted(list(set(routes)))

def clean_route(route):
    if pd.isna(route): return ""
    r = str(route).strip()
    if not r.startswith('/'): r = '/' + r
    # Normalize slashes
    r = r.replace('\\', '/')
    return r

# 1. Get current routes from source code
current_routes = get_routes(frontend_dir)
print(f"Current routes in source code ({len(current_routes)}):")
for r in current_routes:
    print(f"  {r}")

# 2. Read existing routes from Excel (from Sheet 1. EMP as base, assuming it has all routes)
try:
    df_emp = pd.read_excel(excel_path, sheet_name='1. EMP', skiprows=1)
    excel_routes = df_emp['Route/URL'].dropna().unique().tolist()
    excel_routes = [clean_route(r) for r in excel_routes if r and str(r).lower() != 'route/url']
    print(f"\nRoutes in Excel ({len(excel_routes)}):")
    # for r in excel_routes:
    #     print(f"  {r}")

    # 3. Compare
    missing_in_code = [r for r in excel_routes if r not in current_routes]
    new_in_code = [r for r in current_routes if r not in excel_routes]

    print(f"\n--- Giao diện có trong Excel nhưng KHÔNG có trong code (Cần xóa): ---")
    for r in missing_in_code:
        print(f"  {r}")

    print(f"\n--- Giao diện mới có trong code nhưng KHÔNG có trong Excel (Cần thêm): ---")
    for r in new_in_code:
        print(f"  {r}")

except Exception as e:
    print(f"Error reading Excel: {e}")
