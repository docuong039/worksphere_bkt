# AUDIT LOG HỆ THỐNG (SYSTEM ADMIN)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-SYS-02-02**: Là System Admin, tôi muốn **truy xuất Audit Log toàn hệ thống**, để biết ai đã can thiệp vào dữ liệu của các Org vào lúc nào.
- **Lưu ý kỹ thuật #1**: Impersonation (US-SYS-01-06) — khi đăng nhập vào Org của khách để hỗ trợ, hệ thống phải ghi log lại cực kỳ chi tiết để tránh các vấn đề pháp lý sau này về quyền riêng tư dữ liệu.

**Nguồn:** Epic SYS-02, Lưu ý kỹ thuật

**Route:** `/(frontend)/admin/audit-logs`

**Quyền truy cập:**
- ✅ SYS_ADMIN - Xem toàn bộ audit logs
- ✅ ORG_ADMIN - Xem audit logs trong Org của mình (scope)
- ❌ PM, EMP, CEO

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `audit_logs`
**Nguồn:** Section 3.8.2 Database Design

| Column | Type | Hiển thị UI? |
|--------|------|--------------|
| id | uuid | ❌ |
| occurred_at | timestamptz | ✅ Timestamp |
| org_id | uuid | ✅ Tên Org |
| actor_user_id | uuid | ✅ Người thực hiện |
| impersonation_session_id | uuid | ✅ Badge "IMPERSONATE" |
| action | varchar(100) | ✅ Hành động |
| entity_type | varchar(100) | ✅ Loại đối tượng |
| entity_id | uuid | ✅ Link tới đối tượng |
| before_data | jsonb | ✅ Expandable (Xem chi tiết) |
| after_data | jsonb | ✅ Expandable (Xem chi tiết) |
| ip_address | varchar(64) | ✅ |
| user_agent | text | ✅ (Tooltip) |

#### Bảng: `impersonation_sessions`
**Nguồn:** Section 3.8.1

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | PK |
| org_id | uuid | Org bị can thiệp |
| actor_user_id | uuid | System Admin |
| subject_user_id | uuid | User được hỗ trợ |
| reason | text | Lý do bắt buộc |
| started_at | timestamptz | |
| ended_at | timestamptz | |

---

### 2.2. API Endpoints

**GET /api/admin/audit-logs**

```typescript
interface AuditLog {
  id: string;
  occurred_at: string;
  org: { id: string; name: string; code: string } | null;
  actor: { id: string; email: string; full_name: string } | null;
  is_impersonation: boolean;
  impersonation_subject: { id: string; email: string } | null;
  action: string;           // CREATE, UPDATE, DELETE, LOGIN, IMPERSONATE...
  entity_type: string;      // USER, PROJECT, TASK, ORGANIZATION...
  entity_id: string | null;
  entity_title: string | null;  // Rendered từ before/after data
  before_data: object | null;
  after_data: object | null;
  ip_address: string | null;
  user_agent: string | null;
}

interface GetAuditLogsParams {
  org_id?: string;          // Filter theo Org
  actor_user_id?: string;   // Filter theo người thực hiện
  action?: string;          // Filter theo loại hành động
  entity_type?: string;     // Filter theo loại đối tượng
  date_from?: string;       // Filter từ ngày
  date_to?: string;         // Filter đến ngày
  impersonation_only?: boolean;  // Chỉ xem phiên hỗ trợ
  page?: number;
  limit?: number;
}

// Response
interface GetAuditLogsResponse {
  data: AuditLog[];
  total: number;
  page: number;
  limit: number;
}
```

**GET /api/admin/impersonation-sessions**

```typescript
interface ImpersonationSession {
  id: string;
  org: { id: string; name: string };
  actor: { id: string; email: string; full_name: string };
  subject: { id: string; email: string; full_name: string };
  reason: string;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  logs_count: number;       // Số audit logs trong phiên
}
```

---

## 3. GIAO DIỆN

### 3.1. Audit Logs List

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  📜 Nhật ký Kiểm tra (Audit Logs)                 │
│             │  ───────────────────────────────────────────────  │
│             │                                                   │
│             │  Bộ lọc                                           │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 📅 [17/01/2026] → [19/01/2026]              │  │
│             │  │ [Org ▼]  [User ▼]  [Action ▼]  [Entity ▼]   │  │
│             │  │ ☐ Chỉ xem phiên hỗ trợ (Impersonate)        │  │
│             │  │                             [🔍 Tìm kiếm]   │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  Kết quả: 1,234 bản ghi                [Export]  │
│             │  ─────────────────────────────────────────────── │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 🔴 19/01/2026 15:30:45                      │  │
│             │  │ 🔐 IMPERSONATE                               │  │
│             │  │ 👤 sysadmin@worksphere.com                  │  │
│             │  │    ↳ Đăng nhập dưới quyền: john@acme.com    │  │
│             │  │ 🏢 ACME Corporation                          │  │
│             │  │ 📝 Reason: Hỗ trợ debug dashboard           │  │
│             │  │ 🌐 IP: 192.168.1.100                        │  │
│             │  │                              [Xem chi tiết] │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 🟠 19/01/2026 14:20:10                      │  │
│             │  │ 🔄 UPDATE                                    │  │
│             │  │ 👤 sysadmin@worksphere.com                  │  │
│             │  │ 📦 ORGANIZATION: ACME Corporation           │  │
│             │  │    ↳ status: ACTIVE → SUSPENDED             │  │
│             │  │ 🌐 IP: 192.168.1.100                        │  │
│             │  │                              [Xem chi tiết] │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 🟢 19/01/2026 10:15:30                      │  │
│             │  │ ➕ CREATE                                    │  │
│             │  │ 👤 admin@acme.com                           │  │
│             │  │ 📦 PROJECT: Project Alpha (PJ001)           │  │
│             │  │ 🏢 ACME Corporation                          │  │
│             │  │ 🌐 IP: 10.0.0.50                            │  │
│             │  │                              [Xem chi tiết] │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 🔵 19/01/2026 09:00:00                      │  │
│             │  │ 🔑 LOGIN                                     │  │
│             │  │ 👤 jane@beta.com                            │  │
│             │  │ 🏢 Beta Inc                                  │  │
│             │  │ 🌐 IP: 172.16.0.25                          │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  [< Prev] Page 1 of 124 [Next >]                 │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

### 3.2. Audit Log Detail Dialog

```
┌──────────────────────────────────────────────────────────────┐
│  📜 Chi tiết Audit Log                               [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Thời gian:     19/01/2026 14:20:10 (GMT+7)                 │
│  Hành động:     🔄 UPDATE                                    │
│  Đối tượng:     ORGANIZATION                                 │
│  ID:            550e8400-e29b-41d4-a716-446655440000         │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  Người thực hiện                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 👤 System Admin                                    │     │
│  │ Email: sysadmin@worksphere.com                     │     │
│  │ IP: 192.168.1.100                                  │     │
│  │ Browser: Chrome 120 on Windows 11                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  Thay đổi dữ liệu                                            │
│                                                              │
│  Trước (before_data):                                        │
│  ┌────────────────────────────────────────────────────┐     │
│  │ {                                                  │     │
│  │   "status": "ACTIVE",                              │     │
│  │   "name": "ACME Corporation"                       │     │
│  │ }                                                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  Sau (after_data):                                           │
│  ┌────────────────────────────────────────────────────┐     │
│  │ {                                                  │     │
│  │   "status": "SUSPENDED",     ← Thay đổi           │     │
│  │   "name": "ACME Corporation"                       │     │
│  │ }                                                  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│                                              [Đóng]          │
└──────────────────────────────────────────────────────────────┘
```

### 3.3. Impersonation Session Detail

```
┌──────────────────────────────────────────────────────────────┐
│  🔐 Chi tiết Phiên Hỗ trợ                            [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⚠️ IMPERSONATION SESSION                                    │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  Thông tin phiên                                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │ System Admin:  sysadmin@worksphere.com             │     │
│  │ Hỗ trợ User:   john@acme.com (John Doe)            │     │
│  │ Tổ chức:       ACME Corporation                    │     │
│  │                                                    │     │
│  │ Bắt đầu:       19/01/2026 15:30:45                 │     │
│  │ Kết thúc:      19/01/2026 16:15:20                 │     │
│  │ Thời gian:     44 phút 35 giây                     │     │
│  │                                                    │     │
│  │ Lý do:                                             │     │
│  │ "Hỗ trợ khách hàng debug lỗi hiển thị dashboard,   │     │
│  │  ticket #SUPPORT-1234"                             │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  Các hành động trong phiên (12)                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ 15:31:02  VIEW     PROJECT      Project Alpha      │     │
│  │ 15:32:15  VIEW     TASK         Fix login bug      │     │
│  │ 15:33:45  UPDATE   TASK         Fix login bug      │     │
│  │ 15:35:10  VIEW     DASHBOARD    -                  │     │
│  │ ...                                                │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│                                              [Đóng]          │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. ACTION TYPES

**Nguồn:** Section 3.8.2 - action column

| Action | Icon | Color | Mô tả |
|--------|------|-------|-------|
| CREATE | ➕ | 🟢 Green | Tạo mới |
| UPDATE | 🔄 | 🟠 Orange | Cập nhật |
| DELETE | 🗑️ | 🔴 Red | Xóa |
| LOGIN | 🔑 | 🔵 Blue | Đăng nhập |
| LOGOUT | 🚪 | ⚪ Gray | Đăng xuất |
| IMPERSONATE | 🔐 | 🔴 Red | Đăng nhập dưới quyền |
| IMPERSONATE_END | 🔓 | 🟢 Green | Kết thúc phiên hỗ trợ |
| PASSWORD_RESET | 🔑 | 🟡 Yellow | Reset mật khẩu |
| ROLE_ASSIGN | 👤 | 🔵 Blue | Gán vai trò |
| ROLE_REVOKE | 👤 | 🟠 Orange | Thu hồi vai trò |
| LOCK_PERIOD | 🔒 | 🟠 Orange | Khóa chu kỳ |
| UNLOCK_PERIOD | 🔓 | 🟢 Green | Mở khóa chu kỳ |
| RESTORE | ♻️ | 🟢 Green | Khôi phục từ thùng rác |
| HARD_DELETE | 💥 | 🔴 Red | Xóa vĩnh viễn |

---

## 5. ENTITY TYPES

| Entity Type | Mô tả |
|-------------|-------|
| ORGANIZATION | Tổ chức |
| USER | Người dùng |
| PROJECT | Dự án |
| TASK | Công việc |
| SUBTASK | Đầu việc con |
| TIME_LOG | Bản ghi thời gian |
| REPORT | Báo cáo |
| ROLE | Vai trò |
| PERMISSION | Quyền hạn |
| DOCUMENT | Tài liệu |
| COMMENT | Bình luận |
| QUOTA | Quota |

---

## 6. BUSINESS RULES

### Rule 1: Retention Policy
**Nguồn:** Implied from compliance requirements

> Audit logs được giữ tối thiểu **365 ngày**.

- Sau 365 ngày, logs có thể được archive sang cold storage
- Không bao giờ hard delete audit logs

### Rule 2: Impersonation Logs Priority
**Nguồn:** Lưu ý kỹ thuật #1

> "Hệ thống phải ghi log lại cực kỳ chi tiết để tránh các vấn đề pháp lý."

- Mọi action trong phiên impersonation đều có `impersonation_session_id`
- Highlight đặc biệt trong UI (màu đỏ, icon 🔐)
- Filter riêng "Chỉ xem phiên hỗ trợ"

### Rule 3: Scope-based Access
- **SYS_ADMIN**: Xem tất cả audit logs
- **ORG_ADMIN**: Chỉ xem logs thuộc `org_id` của mình

### Rule 4: Sensitive Data Masking
- Password không bao giờ được log (kể cả hash)
- Token values được mask (`***REDACTED***`)

---

## 7. STATES

### 7.1. Loading
- Skeleton table rows

### 7.2. Empty (No Results)
```
📜 Không tìm thấy bản ghi nào
Thử thay đổi bộ lọc hoặc mở rộng khoảng thời gian.
```

### 7.3. Error
```
❌ Không thể tải dữ liệu
Vui lòng thử lại sau.
[Thử lại]
```

---

## 8. EXPORT

**Format hỗ trợ:**
- CSV
- Excel (.xlsx)
- JSON

**Fields in export:**
```
occurred_at, org_code, org_name, actor_email, actor_name, 
is_impersonation, action, entity_type, entity_id, 
ip_address, user_agent
```

> ⚠️ Không export `before_data` và `after_data` trong file export mặc định (sensitive data). Cần quyền đặc biệt hoặc request riêng.

---

## 9. RELATED PAGES

```
/admin/audit-logs (This page)
  ├─→ /admin/audit-logs/[id]           (Detail view)
  ├─→ /admin/impersonation-sessions    (Danh sách phiên hỗ trợ)
  ├─→ /admin/organizations             (Xem theo Org)
  └─→ /admin/users                     (Xem theo User)
```

---

**END OF DOCUMENTATION**
