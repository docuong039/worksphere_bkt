# SETTINGS - WORKSPACE CONFIGURATION

## 1. CƠ BẢN

**User Stories được cover:**
- **US-ORG-03-01**: Là Org Admin, tôi muốn **cấu hình múi giờ mặc định** cho toàn tổ chức
- **US-ORG-03-02**: Là Org Admin, tôi muốn **thiết lập chính sách khóa log time** (tuần/tháng/quý)
- **US-ORG-03-03**: Là Org Admin, tôi muốn **quản lý template các loại Task Status, Priority mới** nếu có

**Nguồn:** Epic ORG-03

**Route:** `/(frontend)/settings/workspace`

**Quyền truy cập:**
- ✅ ORG_ADMIN - Full access
- ❌ PM, EMP, CEO - Không truy cập
- ❌ Guest

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `organizations`
**Nguồn:** Section 3.1.1

| Column | Type | Editable |
|--------|------|----------|
| timezone | varchar(64) | ✅ |

#### Bảng: `task_statuses` (Org-level override)
**Nguồn:** Section 3.2.3

| Column | Type |
|--------|------|
| code | varchar(30) |
| name | varchar(100) |
| sort_order | int |
| is_terminal | boolean |

---

### 2.2. API Endpoints

**GET /api/settings/workspace**

```typescript
interface WorkspaceSettings {
  organization: {
    id: string;
    name: string;
    code: string;
    timezone: string;
  };
  lock_policy: {
    period_type: 'WEEK' | 'MONTH' | 'QUARTER';
    auto_lock: boolean;
    auto_lock_after_days: number;
  };
  task_statuses: TaskStatus[];
  task_priorities: TaskPriority[];
}
```

**PUT /api/settings/workspace**

```typescript
interface UpdateWorkspaceRequest {
  timezone?: string;
  lock_policy?: {
    period_type: 'WEEK' | 'MONTH' | 'QUARTER';
    auto_lock: boolean;
    auto_lock_after_days: number;
  };
}
```

---

## 3. GIAO DIỆN

### 3.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  ⚙️ Cài đặt Workspace                            │
│             │  ─────────────────────────────────────────────── │
│             │                                                   │
│             │  📍 Thông tin tổ chức                             │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │ Tên tổ chức: ACME Corporation                │ │
│             │  │ Mã tổ chức:  ACME-001                        │ │
│             │  │                                              │ │
│             │  │ Múi giờ                                      │ │
│             │  │ ┌────────────────────────────────────────┐   │ │
│             │  │ │ Asia/Ho_Chi_Minh (GMT+7)            ▼ │   │ │
│             │  │ └────────────────────────────────────────┘   │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                   │
│             │  ─────────────────────────────────────────────── │
│             │                                                   │
│             │  🔒 Chính sách khóa Log Time                     │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │                                              │ │
│             │  │ Chu kỳ khóa mặc định                         │ │
│             │  │ ○ Tuần  ● Tháng  ○ Quý                       │ │
│             │  │                                              │ │
│             │  │ ☑ Tự động khóa sau khi kết thúc chu kỳ       │ │
│             │  │                                              │ │
│             │  │ Số ngày sau khi kết thúc                     │ │
│             │  │ ┌────────┐                                   │ │
│             │  │ │ 3      │ ngày                              │ │
│             │  │ └────────┘                                   │ │
│             │  │                                              │ │
│             │  │ ⓘ PM vẫn có thể thay đổi chính sách riêng   │ │
│             │  │   cho từng dự án.                           │ │
│             │  │                                              │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                   │
│             │  ─────────────────────────────────────────────── │
│             │                                                   │
│             │  🏷️ Trạng thái Task                              │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │ Code         Name           Terminal  Order │ │
│             │  │ TODO         To Do          ☐         1     │ │
│             │  │ IN_PROGRESS  In Progress    ☐         2     │ │
│             │  │ DONE         Done           ☑         3     │ │
│             │  │ BLOCKED      Blocked        ☐         4     │ │
│             │  │                                              │ │
│             │  │ 🔒 Không thể thêm/sửa/xóa (system default)  │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                   │
│             │  ─────────────────────────────────────────────── │
│             │                                                   │
│             │                            [Hủy] [Lưu thay đổi]  │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 4. SETTINGS SECTIONS

### 4.1. Timezone Setting
**Nguồn:** Section 3.1.1 - `organizations.timezone`

- Default: `Asia/Ho_Chi_Minh`
- Dropdown với tất cả timezones
- Ảnh hưởng đến hiển thị datetime trong toàn org

### 4.2. Lock Policy
**Nguồn:** Epic ORG-03-02

- Period type: WEEK / MONTH / QUARTER
- Auto lock: On/Off
- Auto lock delay: số ngày sau khi kết thúc chu kỳ

### 4.3. Task Statuses (View Only)
**Nguồn:** Section 3.2.3

- System default statuses (locked)
- ⚠️ Chưa định nghĩa khả năng tạo custom statuses

---

## 5. BUSINESS RULES

### Rule 1: Timezone affects display
- Tất cả datetime hiển thị theo timezone của org
- Stored in UTC, displayed in org timezone

### Rule 2: Lock policy is default
- PM có thể override cho project cụ thể
- Nếu không override → Dùng chính sách org

---

## 6. RELATED PAGES

```
/settings/workspace (This page)
  ├─→ /settings/profile          (User settings)
  └─→ /admin/users               (User management)
```

---

**END OF DOCUMENTATION**
