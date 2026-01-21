# MA TRẬN QUYỀN CHỈNH SỬA TASK

## 1. CƠ BẢN

**User Stories được cover:**
- **US-MNG-01-13**: Là PM, tôi muốn **chỉ định cụ thể người dùng nào** được phép chỉnh sửa **trường thông tin nào** của Task hoặc Subtask trong dự án (ví dụ: User A sửa 'Mô tả', User B sửa 'Custom Field X', cả hai cùng sửa 'Tiêu đề').

**Nguồn:** Epic MNG-01

**Route:** `/(frontend)/projects/[id]/settings/field-permissions`

**Quyền truy cập:**
- ✅ PM - Full access
- ❌ EMP - Không truy cập
- ❌ CEO - Không truy cập
- ❌ Guest

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `project_field_user_permissions`
**Nguồn:** Section 3.9.3

| Column | Type | Ghi chú |
|--------|------|---------|
| org_id | uuid | PK part |
| project_id | uuid | PK part |
| user_id | uuid | PK part |
| entity_type | varchar(20) | 'TASK' hoặc 'SUBTASK' |
| field_name | varchar(100) | Tên cột (title, description...) |

**Nguồn Business Rule:**
> "Khi nhân viên (EMP) thực hiện cập nhật Task, hệ thống sẽ đối soát danh sách các trường gửi lên với 'Ma trận quyền' của User đó trong dự án."

---

### 2.2. API Endpoints

**GET /api/projects/:id/field-permissions**

```typescript
interface FieldPermission {
  user_id: string;
  user_name: string;
  permissions: {
    [field_name: string]: boolean;
  };
}

interface GetFieldPermissionsResponse {
  fields: string[];  // ['title', 'description', 'status_code', 'custom:xxx']
  users: FieldPermission[];
}
```

**PUT /api/projects/:id/field-permissions**

```typescript
interface UpdateFieldPermissionsRequest {
  user_id: string;
  permissions: {
    [field_name: string]: boolean;
  };
}
```

---

## 3. GIAO DIỆN

### 3.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  Project Alpha > ⚙️ Settings > Ma trận quyền                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  📋 Quyền chỉnh sửa trường thông tin Task                      │
│                                                                 │
│  ⓘ Chỉ định user nào được sửa field nào của Task.              │
│    PM luôn có full quyền.                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │             │ Title │ Desc │ Status│Priority│ Story Pts │  ││
│  ├─────────────┼───────┼──────┼───────┼────────┼───────────┤  ││
│  │ PM Sarah    │  ✅   │  ✅  │  ✅   │  ✅    │   ✅      │  ││
│  │ (Full)      │       │      │       │        │           │  ││
│  ├─────────────┼───────┼──────┼───────┼────────┼───────────┤  ││
│  │ John Doe    │  ☑️   │  ☑️  │  ☐   │  ☐    │   ☑️      │  ││
│  │ (EMP)       │       │      │       │        │           │  ││
│  ├─────────────┼───────┼──────┼───────┼────────┼───────────┤  ││
│  │ Jane Smith  │  ☐   │  ☑️  │  ☐   │  ☐    │   ☑️      │  ││
│  │ (EMP)       │       │      │       │        │           │  ││
│  ├─────────────┼───────┼──────┼───────┼────────┼───────────┤  ││
│  │ Bob Wilson  │  ☐   │  ☐  │  ☐   │  ☐    │   ☐       │  ││
│  │ (EMP)       │       │      │       │        │           │  ││
│  └─────────────┴───────┴──────┴───────┴────────┴───────────┘  ││
│                                                                 │
│  Legend:                                                        │
│  ✅ = Full access (PM)  ☑️ = Được phép  ☐ = Không được phép    │
│                                                                 │
│                                          [Hủy]  [Lưu thay đổi] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. BUSINESS RULES

### Rule 1: PM luôn có full quyền
PM không bị giới hạn bởi ma trận này.

### Rule 2: EMP mặc định không có quyền
Khi thêm EMP vào project, mặc định tất cả fields = `can_edit: false`

### Rule 3: Optimistic Locking
**Nguồn:** Section MNG-01, Quy tắc nghiệp vụ

> "Sử dụng cơ chế Optimistic Locking thông qua cột `row_version`. Nếu hai người cùng sửa một trường (hoặc các trường khác nhau trên cùng 1 row) tại cùng một thời điểm, người gửi sau sẽ bị từ chối nếu `row_version` đã thay đổi."

### Rule 4: Validation khi update
```typescript
// Backend validation
function validateFieldUpdate(userId, projectId, fields) {
  const permissions = getFieldPermissions(userId, projectId);
  
  for (const field of Object.keys(fields)) {
    if (!permissions[field]) {
      throw new ForbiddenError(`Bạn không có quyền sửa trường: ${field}`);
    }
  }
}
```

---

## 5. INTERACTIONS

### 5.1. Toggle Permission
1. Click checkbox
2. Optimistic update UI
3. API call
4. Success → Keep state
5. Error → Revert + show error

### 5.2. Bulk Update
Option to select all fields for a user.

---

## 6. RELATED PAGES

```
/projects/[id]/settings/field-permissions (This page)
  ├─→ /projects/[id]/settings            (Parent)
  └─→ /projects/[id]/overview            (Custom fields)
```

---

**END OF DOCUMENTATION**
