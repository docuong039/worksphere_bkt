import pandas as pd
from collections import defaultdict

# Đọc file Excel
xl = pd.ExcelFile('docs/UI_STORY_MATRIX.xlsx')

print('=== PHÂN TÍCH CHI TIẾT TỪNG ROUTE THEO 5 SHEET ===\n')

role_mapping = {
    '1. EMP': 'EMP',
    '2. PM (MNG)': 'MNG',
    '3. CEO': 'CEO',
    '4. SYS_ADMIN': 'SYS',
    '5. ORG_ADMIN': 'ORG'
}

# Thu thập mapping từ 5 sheet gốc
route_to_roles_original = defaultdict(set)

for sheet in xl.sheet_names[1:6]:
    df = pd.read_excel(xl, sheet_name=sheet)
    role = role_mapping[sheet]
    
    for idx in range(2, len(df)):
        route_url = df.iloc[idx, 1]
        
        if pd.isna(route_url):
            continue
        
        route = str(route_url).strip()
        
        # Kiểm tra có X nào không
        has_x = False
        for col in df.columns[2:]:
            cell = df[col].iloc[idx]
            if pd.notna(cell) and str(cell).strip().upper() == 'X':
                has_x = True
                break
        
        if has_x:
            route_to_roles_original[route].add(role)

# Đọc sheet Role Matrix
df_matrix = pd.read_excel(xl, sheet_name='6. Role Matrix', skiprows=1)

# So sánh
errors = []
correct = 0

for _, row in df_matrix.iterrows():
    route = row['Route/URL']
    
    # Roles từ sheet mới
    matrix_roles = set()
    if row['EMP'] == 'X': matrix_roles.add('EMP')
    if row['MNG'] == 'X': matrix_roles.add('MNG')
    if row['CEO'] == 'X': matrix_roles.add('CEO')
    if row['SYS'] == 'X': matrix_roles.add('SYS')
    if row['ORG'] == 'X': matrix_roles.add('ORG')
    
    # Roles từ 5 sheet gốc
    original_roles = route_to_roles_original.get(route, set())
    
    if matrix_roles != original_roles:
        errors.append({
            'route': route,
            'expected': sorted(original_roles),
            'actual': sorted(matrix_roles),
            'missing': sorted(original_roles - matrix_roles),
            'extra': sorted(matrix_roles - original_roles)
        })
    else:
        correct += 1

print(f'✅ Routes đúng: {correct}/{len(df_matrix)}')
print(f'❌ Routes sai: {len(errors)}/{len(df_matrix)}')

if errors:
    print(f'\n=== CHI TIẾT CÁC LỖI ===\n')
    for err in errors[:10]:  # Show 10 đầu
        print(f"Route: {err['route']}")
        print(f"  Expected (từ 5 sheet): {err['expected']}")
        print(f"  Actual (sheet mới):    {err['actual']}")
        if err['missing']:
            print(f"  ❌ Thiếu: {err['missing']}")
        if err['extra']:
            print(f"  ➕ Thừa:  {err['extra']}")
        print()
else:
    print('\n🎉 HOÀN HẢO! Sheet Role Matrix CHUẨN 100% với 5 sheet gốc!')
