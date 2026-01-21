# QUẢN LÝ MASTER ROLES & PERMISSIONS (SYSTEM ADMIN)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-SYS-01-05**: Là System Admin, tôi muốn **định nghĩa danh sách Roles và Permissions mặc định** cho toàn hệ thống, để các Org sử dụng chung bộ khung chuẩn.
- **US-ORG-02-01**: Là Org Admin, tôi muốn **xem và chỉnh sửa Roles nội bộ** cho tổ chức của mình (Override từ Master).
- **US-ORG-02-02**: Là Org Admin, tôi muốn **gán Permission cho Role**.
- **US-ORG-02-03**: Là Org Admin, tôi muốn **tạo Role Override** từ bảng master do System Admin định nghĩa.

**Nguồn:** Epic SYS-01, ORG-02

**Route:** `/(frontend)/admin/roles`

**Quyền truy cập:**
- ✅ SYS_ADMIN - Full CRUD trên Platform Roles & Permissions
- ✅ ORG_ADMIN - View/Override Tenant Roles (scope theo org)
- ❌ PM, EMP, CEO

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `roles`
**Nguồn:** Section 3.7.1 Database Design

| Column | Type | Hiển thị UI? |
|--------|------|--------------|
| id | uuid | ❌ |
| scope_type | varchar(20) | ✅ Badge (PLATFORM/TENANT) |
| org_id | uuid | ✅ Tên Org (nếu TENANT) |
| code | varchar(50) | ✅ Mã Role |
| name | varchar(100) | ✅ Tên hiển thị |
| is_system | boolean | ✅ 🔒 System default |
| created_at | timestamptz | ✅ |
| created_by | uuid | ✅ |

**Scope Type:**
- `PLATFORM` - Role dùng chung toàn hệ thống (System Admin định nghĩa)
- `TENANT` - Role riêng của Org (Override hoặc Custom)

#### Bảng: `permissions`
**Nguồn:** Section 3.7.2

| Column | Type | Hiển thị UI? |
|--------|------|--------------|
| id | uuid | ❌ |
| code | varchar(100) | ✅ Mã quyền (VD: MANAGE_PROJECT) |
| description | varchar(500) | ✅ Mô tả |

#### Bảng: `role_permissions`
**Nguồn:** Section 3.7.3

| Column | Type | Ghi chú |
|--------|------|---------|
| role_id | uuid | FK |
| permission_id | uuid | FK |
| granted_at | timestamptz | |
| granted_by | uuid | |

---

### 2.2. API Endpoints

**GET /api/admin/roles**

```typescript
interface Role {
  id: string;
  scope_type: 'PLATFORM' | 'TENANT';
  org_id: string | null;
  org_name: string | null;  // Nếu TENANT
  code: string;
  name: string;
  is_system: boolean;
  permissions: string[];    // Danh sách permission codes
  user_count: number;       // Số user đang được gán role này
  created_at: string;
}

interface GetRolesParams {
  scope_type?: 'PLATFORM' | 'TENANT';
  org_id?: string;          // Filter theo Org (cho Org Admin)
}
```

**POST /api/admin/roles**

```typescript
interface CreateRoleRequest {
  scope_type: 'PLATFORM' | 'TENANT';
  org_id?: string;          // Bắt buộc nếu TENANT
  code: string;
  name: string;
  permission_ids: string[];
}
```

**PUT /api/admin/roles/:id**

```typescript
interface UpdateRoleRequest {
  name: string;
  permission_ids: string[];
}
```

**GET /api/admin/permissions**

```typescript
interface Permission {
  id: string;
  code: string;
  description: string;
  category: string;  // Nhóm: PROJECT, TASK, REPORT, ADMIN...
}
```

---

## 3. GIAO DIỆN

### 3.1. Platform Roles List (System Admin View)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  🔐 Quản lý Vai trò                [+ Tạo Role]   │
│             │  ───────────────────────────────────────────────  │
│             │  [Scope: PLATFORM ▼]  [🔍 Search...]              │
│             │                                                   │
│             │  📋 PLATFORM ROLES (5)                            │
│             │  ─────────────────────                            │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ SYS_ADMIN              🔒 System default    │  │
│             │  │ Quản trị viên Hệ thống                      │  │
│             │  │ 👥 2 users | Permissions: ALL               │  │
│             │  │                              [View Details] │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ ORG_ADMIN              🔒 System default    │  │
│             │  │ Quản trị viên Tổ chức                       │  │
│             │  │ 👥 15 users | Permissions: 12               │  │
│             │  │                              [View Details] │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ CEO                    🔒 System default    │  │
│             │  │ Giám đốc điều hành                          │  │
│             │  │ 👥 8 users | Permissions: 10                │  │
│             │  │                              [View Details] │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ PM                     🔒 System default    │  │
│             │  │ Project Manager                             │  │
│             │  │ 👥 25 users | Permissions: 8                │  │
│             │  │                              [View Details] │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ EMP                    🔒 System default    │  │
│             │  │ Employee                                    │  │
│             │  │ 👥 120 users | Permissions: 5               │  │
│             │  │                              [View Details] │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### 3.2. Create/Edit Role Form

```
┌──────────────────────────────────────────────────────────────┐
│  🔐 Tạo Vai trò Mới                                  [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Phạm vi *                                                   │
│  ● PLATFORM (Dùng chung toàn hệ thống)                      │
│  ○ TENANT (Riêng cho 1 tổ chức)                             │
│                                                              │
│  Mã vai trò *                                                │
│  ┌────────────────────────────────────────────────────┐     │
│  │ SENIOR_DEV                                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Tên hiển thị *                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Senior Developer                                    │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  Quyền hạn                                                   │
│                                                              │
│  📁 PROJECT                                                  │
│  ☐ MANAGE_PROJECT - Quản lý thông tin dự án                 │
│  ☑ VIEW_PROJECT - Xem thông tin dự án                       │
│                                                              │
│  📋 TASK                                                     │
│  ☐ MANAGE_TASK - Tạo/sửa/xóa task                           │
│  ☑ VIEW_TASK - Xem task                                     │
│  ☑ CREATE_SUBTASK - Tạo subtask                             │
│  ☑ LOG_TIME - Ghi nhận thời gian                            │
│                                                              │
│  📊 REPORT                                                   │
│  ☑ CREATE_REPORT - Tạo báo cáo                              │
│  ☐ VIEW_ALL_REPORTS - Xem tất cả báo cáo                    │
│                                                              │
│  💰 FINANCE                                                  │
│  ☐ VIEW_SALARY - Xem thông tin lương                        │
│  ☐ MANAGE_COMPENSATION - Quản lý lương                      │
│                                                              │
│  ⚙️ ADMIN                                                    │
│  ☐ MANAGE_USERS - Quản lý người dùng                        │
│  ☐ MANAGE_ROLES - Quản lý vai trò                           │
│                                                              │
│                                    [Hủy]  [Lưu]              │
└──────────────────────────────────────────────────────────────┘
```

### 3.3. Role Detail View

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Quay lại]                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔐 PM (Project Manager)                  🔒 System default    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Thông tin cơ bản                                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Mã vai trò:    PM                                         │  │
│  │ Phạm vi:       🌐 PLATFORM                                │  │
│  │ Loại:          🔒 System default (Không thể xóa)          │  │
│  │ Số user:       👥 25 users                                │  │
│  │ Tạo lúc:       01/01/2026                                 │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Quyền hạn (8)                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ✅ MANAGE_PROJECT    Quản lý thông tin dự án              │  │
│  │ ✅ MANAGE_TASK       Tạo/sửa/xóa task                     │  │
│  │ ✅ ASSIGN_TASK       Gán task cho nhân sự                 │  │
│  │ ✅ VIEW_PROJECT      Xem thông tin dự án                  │  │
│  │ ✅ VIEW_TASK         Xem task                             │  │
│  │ ✅ LOCK_PERIOD       Khóa chu kỳ làm việc                 │  │
│  │ ✅ VIEW_TEAM_REPORT  Xem báo cáo của team                 │  │
│  │ ✅ VIEW_PROJECT_COST Xem chi phí dự án                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Users được gán vai trò này (25)                 [Xem tất cả]  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ [Avatar] John Doe (john@acme.com)       ACME Corp         │  │
│  │ [Avatar] Jane Smith (jane@beta.com)     Beta Inc          │  │
│  │ [Avatar] Bob Wilson (bob@gamma.com)     Gamma LLC         │  │
│  │ ... và 22 users khác                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. PERMISSIONS MASTER LIST

**Nguồn:** Section 3.7.2 Database Design

### Nhóm PROJECT
| Code | Mô tả |
|------|-------|
| MANAGE_PROJECT | Tạo/sửa/xóa thông tin dự án |
| VIEW_PROJECT | Xem thông tin dự án |
| MANAGE_PROJECT_MEMBERS | Thêm/xóa thành viên dự án |

### Nhóm TASK
| Code | Mô tả |
|------|-------|
| MANAGE_TASK | Tạo/sửa/xóa task |
| VIEW_TASK | Xem task |
| ASSIGN_TASK | Gán task cho nhân sự |
| CHANGE_TASK_STATUS | Chuyển trạng thái task |
| CREATE_SUBTASK | Tạo subtask |
| LOG_TIME | Ghi nhận thời gian làm việc |

### Nhóm REPORT
| Code | Mô tả |
|------|-------|
| CREATE_REPORT | Tạo báo cáo định kỳ |
| VIEW_OWN_REPORT | Xem báo cáo của mình |
| VIEW_TEAM_REPORT | Xem báo cáo của team (PM) |
| VIEW_ALL_REPORTS | Xem tất cả báo cáo (CEO) |
| COMMENT_REPORT | Nhận xét báo cáo |
| REACT_REPORT | Thả reaction báo cáo |

### Nhóm FINANCE
| Code | Mô tả |
|------|-------|
| VIEW_SALARY | Xem thông tin lương |
| MANAGE_COMPENSATION | Quản lý lương và chi phí |
| VIEW_PROJECT_COST | Xem chi phí dự án |

### Nhóm ADMIN
| Code | Mô tả |
|------|-------|
| MANAGE_USERS | Quản lý người dùng trong Org |
| MANAGE_ROLES | Quản lý vai trò trong Org |
| MANAGE_ORG_SETTINGS | Quản lý cấu hình Org |
| VIEW_AUDIT_LOGS | Xem nhật ký kiểm tra |

### Nhóm SYSTEM (SYS_ADMIN only)
| Code | Mô tả |
|------|-------|
| MANAGE_ORGANIZATIONS | Quản lý tổ chức |
| MANAGE_QUOTAS | Quản lý quota |
| IMPERSONATE | Đăng nhập dưới quyền |
| VIEW_SYSTEM_AUDIT | Xem audit log toàn hệ thống |

---

## 5. BUSINESS RULES

### Rule 1: System Roles không thể xóa/đổi code
**Nguồn:** Section 3.7.1 Database Design

> "`is_system = true` → Đánh dấu vai trò mặc định của hệ thống"

- Roles với `is_system = true` không thể DELETE
- Có thể UPDATE permissions nhưng không thể đổi `code`

### Rule 2: Platform vs Tenant Scope
- **PLATFORM roles**: Chỉ SYS_ADMIN mới tạo/sửa được
- **TENANT roles**: ORG_ADMIN có thể tạo role riêng cho Org của mình

### Rule 3: Org Admin Override
**Nguồn:** US-ORG-02-03

> Org Admin có thể tạo Role Override từ bảng master.

- Org Admin có thể tạo một TENANT role với `code` giống Platform role
- Khi check permission, TENANT role có độ ưu tiên cao hơn

### Rule 4: Permission Inheritance
- Khi gán role cho user, user được kế thừa tất cả permissions của role
- Không có negative permission (chỉ cấp quyền, không thu quyền)

---

## 6. STATES

### 6.1. Loading
- Skeleton list

### 6.2. Empty (Tenant Roles)
```
🔐 Chưa có vai trò tùy chỉnh
Tổ chức của bạn đang sử dụng bộ vai trò mặc định.
[+ Tạo Role mới]
```

### 6.3. System Role Badge
- 🔒 Icon khóa + màu xám để chỉ System default

---

## 7. RELATED PAGES

```
/admin/roles (This page)
  ├─→ /admin/roles/new            (Create)
  ├─→ /admin/roles/[id]           (Detail/Edit)
  ├─→ /admin/permissions          (Permissions master list)
  ├─→ /admin/users                (Gán role cho user)
  └─→ /admin/organizations        (Xem roles theo Org)
```

---

**END OF DOCUMENTATION**
