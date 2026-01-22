import pandas as pd
import re
from collections import Counter

# Đọc BA document
with open('docs/He_thong_quan_ly_cong_viec_full/1. Epic - user stories.md', 'r', encoding='utf-8') as f:
    ba_content = f.read()

# Extract all User Stories
stories = re.findall(r'\*\*US-(\w+)-\d+-\d+\*\*', ba_content)

# Count by role
story_count = Counter(stories)

print('=== USER STORIES TRONG TÀI LIỆU BA ===')
print(f'EMP: {story_count["EMP"]} stories')
print(f'MNG: {story_count["MNG"]} stories')
print(f'CEO: {story_count["CEO"]} stories')
print(f'SYS: {story_count["SYS"]} stories')
print(f'ORG: {story_count["ORG"]} stories')
print(f'TỔNG: {sum(story_count.values())} stories')

# Đọc Excel
xl = pd.ExcelFile('docs/UI_STORY_MATRIX.xlsx')
role_mapping = {
    '1. EMP': 'EMP',
    '2. PM (MNG)': 'MNG',
    '3. CEO': 'CEO',
    '4. SYS_ADMIN': 'SYS',
    '5. ORG_ADMIN': 'ORG'
}

print('\n=== USER STORIES TRONG EXCEL ===')
excel_stories = {}
for sheet in xl.sheet_names[1:6]:
    # Row 0 = Sheet title, Row 1 = Epic names, Row 2 = Story IDs
    df = pd.read_excel(xl, sheet_name=sheet, header=None)
    
    # Get row 2 (index 2) which contains story IDs
    if len(df) > 2:
        story_row = df.iloc[2]
        story_ids = [str(col) for col in story_row[2:] if pd.notna(col) and re.match(r'US-\w+-\d+-\d+', str(col))]
        role = role_mapping[sheet]
        excel_stories[role] = len(story_ids)
        print(f'{role}: {len(story_ids)} stories')
    else:
        excel_stories[role_mapping[sheet]] = 0
        print(f'{role_mapping[sheet]}: 0 stories')

total_excel = sum(excel_stories.values())
print(f'TỔNG: {total_excel} stories')

# So sánh
print('\n=== SO SÁNH BA vs EXCEL ===')
all_match = True
for role in ['EMP', 'MNG', 'CEO', 'SYS', 'ORG']:
    ba_count = story_count[role]
    excel_count = excel_stories[role]
    match = ba_count == excel_count
    status = '✅' if match else '❌'
    print(f'{status} {role}: BA={ba_count}, Excel={excel_count}')
    if not match:
        all_match = False

if all_match:
    print('\n🎉 HOÀN HẢO! Số lượng User Stories khớp 100% giữa BA và Excel!')
