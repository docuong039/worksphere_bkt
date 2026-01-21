# THÙNG RÁC TỔ CHỨC (ORG ADMIN)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-ORG-04-01**: Là Org Admin, tôi muốn **xem danh sách nhân sự đã bị vô hiệu hóa/xóa**, để quản lý danh sách thành viên trong quá khứ.
- **US-ORG-04-02**: Là Org Admin, tôi muốn **khôi phục tài khoản nhân sự** từ thùng rác, để họ có thể tiếp tục làm việc mà không mất dữ liệu cũ.
- **US-ORG-04-03**: Là Org Admin, tôi muốn **xem và khôi phục các dự án đã bị xóa**, để quản lý toàn diện tài nguyên của công ty.

**Nguồn:** Epic ORG-04

**Route:** `/(frontend)/admin/org-recycle-bin`

**Quyền truy cập:**
- ✅ ORG_ADMIN
- ✅ CEO (view only)
- ❌ PM, EMP
- ❌ Guest

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `org_memberships`
**Nguồn:** Section 3.1.4

| Column | Type | Ghi chú |
|--------|------|---------|
| member_status | varchar(30) | INVITED, ACTIVE, **DEACTIVATED** |
| deactivated_at | timestamptz | Thời điểm vô hiệu hóa |
| deactivated_by | uuid | Người thực hiện |

#### Bảng: `projects` (soft delete)
**Nguồn:** Section 3.2.1

| Column | Type | Ghi chú |
|--------|------|---------|
| deleted_at | timestamptz | Thời điểm xóa |

---

### 2.2. API Endpoints

**GET /api/admin/org-recycle-bin/users**

```typescript
interface DeactivatedUser {
  user_id: string;
  email: string;
  full_name: string;
  member_status: 'DEACTIVATED';
  deactivated_at: string;
  deactivated_by: { id: string; full_name: string };
  total_tasks: number;
  total_hours_logged: number;
}
```

**POST /api/admin/org-recycle-bin/users/:id/reactivate**

```typescript
interface ReactivateResponse {
  success: boolean;
  message: string;
}
```

**GET /api/admin/org-recycle-bin/projects**

```typescript
interface DeletedProject {
  id: string;
  code: string;
  name: string;
  deleted_at: string;
  deleted_by: { id: string; full_name: string };
  task_count: number;
  member_count: number;
}
```

**POST /api/admin/org-recycle-bin/projects/:id/restore**

---

## 3. GIAO DIỆN

### 3.1. Deactivated Users Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  🗑️ Thùng rác Tổ chức                           │
│             │  ─────────────────────────────────────────────── │
│             │  [👥 Nhân sự] [📁 Dự án]                         │
│             │                                                   │
│             │  Nhân sự đã vô hiệu hóa (2)                       │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ [Avatar] Bob White                          │  │
│             │  │ bob@company.com                             │  │
│             │  │ Vô hiệu: 01/12/2025 bởi: Org Admin          │  │
│             │  │ 📋 25 tasks | ⏱️ 320 hours logged           │  │
│             │  │                                              │  │
│             │  │             [🔄 Kích hoạt lại]               │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ [Avatar] Alice Green                        │  │
│             │  │ alice@company.com                           │  │
│             │  │ Vô hiệu: 15/11/2025 bởi: Org Admin          │  │
│             │  │ 📋 42 tasks | ⏱️ 560 hours logged           │  │
│             │  │                                              │  │
│             │  │             [🔄 Kích hoạt lại]               │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### 3.2. Deleted Projects Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  🗑️ Thùng rác Tổ chức                           │
│             │  ─────────────────────────────────────────────── │
│             │  [👥 Nhân sự] [📁 Dự án]                         │
│             │                                                   │
│             │  Dự án đã xóa (1)                                 │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 📁 OLD-PROJECT | Legacy System              │  │
│             │  │ Xóa: 10/01/2026 bởi: PM Sarah               │  │
│             │  │ 📋 85 tasks | 👥 8 members                  │  │
│             │  │ ⏳ Còn 20 ngày trước khi xóa vĩnh viễn       │  │
│             │  │                                              │  │
│             │  │            [🔄 Khôi phục dự án]              │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ⓘ Dự án sẽ bị xóa vĩnh viễn sau 30 ngày.        │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### 3.3. Reactivate User Dialog

```
┌──────────────────────────────────────────────────────────────┐
│  🔄 Kích hoạt lại tài khoản                          [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bạn đang kích hoạt lại tài khoản:                          │
│  • Bob White (bob@company.com)                               │
│                                                              │
│  Thông tin cũ sẽ được khôi phục:                            │
│  • 25 tasks đã được giao                                     │
│  • 320 giờ log time                                          │
│  • Quyền hạn cũ (nếu còn phù hợp)                           │
│                                                              │
│  Gán lại vai trò:                                            │
│  ● Giữ nguyên vai trò cũ (PM)                               │
│  ○ Đổi sang vai trò mới: [Select ▼]                         │
│                                                              │
│                      [Hủy]  [Kích hoạt lại]                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. BUSINESS RULES

### Rule 1: Deactivate vs Delete
**Nguồn:** US-ORG-01-03

> "Vô hiệu hóa (Deactivate) tài khoản... giữ lại dữ liệu lịch sử của họ."

- Deactivate: `member_status = 'DEACTIVATED'`, dữ liệu còn nguyên
- User không thể đăng nhập nhưng data vẫn hiển thị trong reports

### Rule 2: Reactivate flow
**Nguồn:** US-ORG-01-04

> "Kích hoạt lại (Reactivate) tài khoản, để nhân viên có thể quay lại làm việc"

- Set `member_status = 'ACTIVE'`
- User có thể đăng nhập lại
- Tất cả data cũ được khôi phục

### Rule 3: Project restore
Khi restore project:
- Set `deleted_at = NULL`
- Tất cả tasks trong project cũng được restore
- Members vẫn giữ nguyên

---

## 5. RELATED PAGES

```
/admin/org-recycle-bin (This page)
  ├─→ /admin/users           (After reactivate)
  └─→ /projects              (After restore project)
```

---

**END OF DOCUMENTATION**
