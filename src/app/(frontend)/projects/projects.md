# DANH SÁCH DỰ ÁN

## 1. CƠ BẢN

**User Stories được cover:**
- **US-MNG-01-01**: Là PM, tôi muốn **tạo mới và cập nhật thông tin dự án**, để thiết lập không gian làm việc cho team.

**Nguồn:** Epic MNG-01

**Route:** `/(frontend)/projects`

**Quyền truy cập:**
- ✅ PM/MNG - Xem và quản lý project mình tham gia
- ✅ CEO - Xem tất cả projects trong org
- ✅ ORG_ADMIN - Xem và quản lý tất cả projects
- ❌ EMP - Không truy cập trực tiếp (chỉ thấy qua Tasks)
- ❌ Guest

---

## 2. PHÂN QUYỀN

### 👔 Manager (PM)
- ✅ Xem projects mình quản lý (member_role = 'PM')
- ✅ Tạo project mới
- ✅ Sửa project mình quản lý

### 👨‍💼 CEO
- ✅ Xem tất cả projects
- ❌ Không tạo/sửa (chỉ xem)

---

## 3. DỮ LIỆU

### 3.1. Database Tables

#### Bảng: `projects`
**Nguồn:** Section 3.2.1

| Column | Type | Hiển thị UI? |
|--------|------|--------------|
| id | uuid | ❌ Routing |
| code | varchar(50) | ✅ Mã dự án |
| name | varchar(255) | ✅ Tên dự án |
| description | text | ✅ Mô tả ngắn |
| status | varchar(30) | ✅ Badge |
| start_date | date | ✅ |
| end_date | date | ✅ |
| created_at | timestamptz | ✅ |

#### Bảng: `project_members`
**Nguồn:** Section 3.2.2

| Column | Type | Ghi chú |
|--------|------|---------|
| project_id | uuid | FK |
| user_id | uuid | FK |
| member_role | varchar(30) | PM, MEMBER, VIEWER |

---

### 3.2. API Endpoint

**GET /api/projects**

```typescript
interface Project {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  start_date: string | null;
  end_date: string | null;
  member_count: number;
  task_count: number;
  completion_rate: number;
}

interface GetProjectsResponse {
  data: Project[];
  pagination: { total: number; page: number };
}
```

---

## 4. GIAO DIỆN

### 4.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  📁 Dự án (3)                    [+ Tạo Dự án]   │
│             │  ─────────────────────────────────────────────── │
│             │  [🔍 Search...]  [Status ▼]                      │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 🟢 ACTIVE                                   │  │
│             │  │ PJ001 - Project Alpha                       │  │
│             │  │ Phát triển tính năng quản lý công việc      │  │
│             │  │ 👥 5 members | 📋 45 tasks | ━━━━ 75%       │  │
│             │  │ Jan 1 - Mar 31, 2026                        │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 🟢 ACTIVE                                   │  │
│             │  │ PJ002 - Project Beta                        │  │
│             │  │ Thiết kế giao diện người dùng               │  │
│             │  │ 👥 3 members | 📋 28 tasks | ━━━ 50%        │  │
│             │  │ Feb 1 - Apr 30, 2026                        │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 5. COMPONENTS

- **ProjectCard** - Card hiển thị thông tin project
- **Progress** - Thanh tiến độ
- **Badge** - Status badge

---

## 6. INTERACTIONS

### 6.1. Click Project Card
→ Navigate `/projects/[id]/overview`

### 6.2. Create Project (PM only)
→ Navigate `/projects/new`

---

## 7. RELATED PAGES

```
/projects (This page)
  ├─→ /projects/[id]/overview   (Click card)
  ├─→ /projects/new             (Create button)
  └─→ /projects/[id]/edit       (Edit button)
```

---

**END OF DOCUMENTATION**
