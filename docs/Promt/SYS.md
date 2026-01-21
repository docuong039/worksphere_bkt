# ✅ SYSTEM ADMIN (SYS) - FRONTEND AUDIT CHECKLIST

> **Mục đích**: Kiểm tra source code FE hiện tại đã implement đủ features cho vai trò SYS Admin chưa
> **Dựa trên**: 
> 1. Epic - user stories.md (Epic SYS-00 đến SYS-03)
> 2. PHÂN RÃ & CHUẨN HÓA QUYỀN phase 1.md
> 3. RBAC Policy Governance phase 2.md

---

## 📋 THÔNG TIN VAI TRÒ

**System Admin (SYS)**
- **Scope**: PLATFORM (Cross-tenant, God Mode)
- **Quyền hạn**: Quản trị nền tảng SaaS, tạo/suspend Org, impersonate.
- **Ràng buộc chính**:
  - Bypass tenant isolation.
  - Phải log mọi hành động (đặc biệt impersonation).
  - Quản lý master data (Roles, Permissions).
  - Không can thiệp vào data nghiệp vụ của Org (trừ hỗ trợ).

---

## 🔐 Epic SYS-00: Xác thực & Truy cập

### US-SYS-00-01..03: Authentication
- [x] Login với quyền cao. ✅
- [x] Logout. ✅
- [x] Forgot Password. ✅

---

## 🏛️ Epic SYS-01: Quản trị Nền tảng & Khách hàng

### US-SYS-01-01: Tạo/Duyệt Org
- [x] Trang `/admin/organizations`: ⚠️
  - [x] Danh sách Organizations.
  - [x] Nút tạo Org mới.
  - [ ] Approval workflow cho pending Org. ❌
  - [ ] Status filter (PENDING, ACTIVE, SUSPENDED). ⚠️

### US-SYS-01-02: Suspend/Activate Org
- [ ] Toggle button Suspend. ❌
- [ ] Confirm dialog với reason. ❌
- [x] Status field có trong DB. ✅

### US-SYS-01-03: Tạo Org Admin đầu tiên
- [ ] Workflow tạo user đầu tiên cho Org mới. ❌
- [ ] Assign role ORG_ADMIN tự động. ❌

### US-SYS-01-04: Reset Password khẩn cấp
- [x] Nút Reset Password trong user list. ⚠️
- [ ] Cross-tenant scope (reset bất kỳ ai). ⚠️

### US-SYS-01-05: Master Roles & Permissions
- [x] Trang `/admin/roles`: ✅
  - [x] Danh sách roles.
  - [x] Xem permissions của role.
  - [ ] Edit/Create role. ⚠️

### US-SYS-01-06: Impersonate
- [x] Trang `/admin/impersonation`: ✅
  - [x] Chọn Org.
  - [x] Chọn User.
  - [x] Nhập reason.
  - [ ] Logging chi tiết. ⚠️
  - [ ] Notify target user. ❌

### US-SYS-01-07: Quota Configuration
- [x] Trang `/admin/quotas`: ✅
  - [x] Danh sách Org với quotas.
  - [x] Edit max_users, max_storage, max_projects.

---

## 🔍 Epic SYS-02: Giám sát & Bảo mật Toàn cục

### US-SYS-02-01: Platform Dashboard
- [ ] Dashboard riêng cho SYS Admin. ❌
- [ ] Tổng số Org active. ❌
- [ ] Tổng số User active. ❌
- [ ] Storage usage. ❌
- [ ] Growth trends. ❌

### US-SYS-02-02: Audit Log System
- [x] Trang `/admin/audit-logs`: ✅
  - [x] Danh sách audit logs.
  - [x] Filter theo Org.
  - [x] Filter theo User.
  - [ ] Filter theo action type. ⚠️
  - [ ] Export audit logs. ❌

---

## 🗑️ Epic SYS-03: Thùng rác Platform

### US-SYS-03-01: Xem Org đã xóa
- [ ] Filter deleted_at IS NOT NULL. ❌
- [ ] Danh sách Org đã xóa. ❌

### US-SYS-03-02: Restore Org
- [ ] Restore button. ❌
- [ ] Restore toàn bộ data của Org. ❌
- [ ] Audit log khi restore. ❌

### US-SYS-03-03: Hard Delete Org
- [ ] Confirm dialog với warning. ❌
- [ ] Legal compliance check. ❌
- [ ] Cascade delete logic. ❌

---

## 🛡️ RÀO CHẮN RBAC/ABAC (Technical Check)

| Feature | Implementation | Status |
| :--- | :--- | :--- |
| **Cross-Tenant** | Bypass org_id filter. | [x] |
| **Impersonation Audit** | Log to `impersonation_sessions`. | [ ] |
| **Role Management** | CRUD roles/permissions. | [x] |
| **Audit Trail** | View all audit logs. | [x] |
| **Quota Enforcement** | Check before create. | [ ] |

---

## 📊 THỐNG KÊ

| Mục | Đã implement | Thiếu | Coverage |
|-----|--------------|-------|----------|
| Epic SYS-01 | 4.5/7 | 2.5 | 64% |
| Epic SYS-02 | 1/2 | 1 | 50% |
| Epic SYS-03 | 0/3 | 3 | 0% |
| **TỔNG** | **5.5/12** | **6.5** | **~46%** |

---

## ❌ CẦN BỔ SUNG (Ưu tiên)

### Ưu tiên CAO:
1. **Platform Dashboard**
   - Stats: Total Orgs, Total Users, Storage Used
   - Charts: Growth over time, Active users/day
   - Alerts: Quota warnings, Failed logins

2. **Org Lifecycle Management**
   - Status toggle (PENDING → ACTIVE → SUSPENDED)
   - Approval queue cho pending Orgs
   - Audit log cho mọi status change

3. **Deleted Orgs Management**
   - View deleted orgs
   - Restore org + all data
   - Hard delete với confirmation

### Ưu tiên TRUNG BÌNH:
4. **Impersonation Enhancement**
   - Better logging với session ID
   - Notify target user via email
   - Quick exit impersonation button

5. **Audit Log Export**
   - Export to CSV/JSON
   - Date range filter
   - Action type filter

6. **First Org Admin Workflow**
   - Create first user khi tạo Org
   - Auto-assign ORG_ADMIN role
   - Send welcome email
