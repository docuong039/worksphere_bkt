# ✅ ORG ADMIN - FRONTEND AUDIT CHECKLIST

> **Mục đích**: Kiểm tra source code FE hiện tại đã implement đủ features cho vai trò Org Admin chưa
> **Dựa trên**: 
> 1. Epic - user stories.md (Epic ORG-00 đến ORG-04)
> 2. PHÂN RÃ & CHUẨN HÓA QUYỀN phase 1.md
> 3. RBAC Policy Governance phase 2.md

---

## 📋 THÔNG TIN VAI TRÒ

**Org Admin (ORG)**
- **Scope**: TENANT (Toàn bộ trong tổ chức mình)
- **Quyền hạn**: Quản trị nội bộ, vòng đời nhân sự, phân quyền, cấu hình workspace.
- **Ràng buộc chính**:
  - Quản lý user lifecycle trong Org.
  - Gán/thay đổi role cho nhân sự.
  - Cấu hình thông tin tổ chức.
  - Quản lý thùng rác của Org.

---

## 🔐 Epic ORG-00: Xác thực & Truy cập

### US-ORG-00-01..03: Authentication
- [x] Login/Logout/Forgot Password ✅ (Dùng chung)

---

## 👥 Epic ORG-01: Quản lý vòng đời nhân sự

### US-ORG-01-01: Tạo User (Manual)
- [x] Trang `/admin/users`: ⚠️
  - [x] Form tạo user mới (Email, Full name).
  - [ ] Generate temporary password. ❌
  - [ ] Send welcome email. ❌

### US-ORG-01-02: Gửi Invite Link
- [ ] UI tạo invite link. ❌
- [ ] Quản lý invite codes. ❌
- [ ] Revoke invite. ❌
- [ ] DB table `org_invites` có trong design. ✅

### US-ORG-01-03: Deactivate User
- [ ] Toggle button Deactivate. ❌
- [ ] Confirm dialog. ❌
- [ ] Giữ lại data lịch sử. ❌

### US-ORG-01-04: Reactivate User
- [ ] Toggle button Reactivate. ❌
- [ ] Chỉ cho user đã deactivated. ❌

### US-ORG-01-05: Reset Password cho EMP
- [x] Nút Reset Password. ⚠️
- [ ] Scope chỉ trong Org. ⚠️

---

## 🔐 Epic ORG-02: Quản lý phân quyền nội bộ

### US-ORG-02-01: Gán Role
- [x] Dropdown chọn Role. ⚠️
  - [x] Options: EMP, PM, CEO.
  - [ ] Confirm dialog khi change. ❌

### US-ORG-02-02: Thay đổi Role
- [x] Có thể thay đổi qua dropdown. ⚠️
- [ ] Audit log khi thay đổi. ❌

### US-ORG-02-03: Tùy chỉnh quyền Role
- [ ] Custom permissions per Org. ❌
- [ ] Override default permissions. ❌
- [x] DB structure hỗ trợ. ✅

---

## ⚙️ Epic ORG-03: Cấu hình Workspace

### US-ORG-03-01: Cập nhật thông tin Org
- [x] Trang `/settings/workspace`: ✅
  - [x] Tên tổ chức.
  - [x] Logo upload.
  - [ ] Timezone setting. ⚠️

### US-ORG-03-02: Thiết lập Khóa Log Time
- [ ] Auto-lock schedule (mỗi Chủ Nhật). ❌
- [x] Manual lock có trong `/time-locks`. ✅

### US-ORG-03-03: Quản lý Danh mục
- [ ] CRUD Task Statuses. ❌
- [ ] CRUD Task Priorities. ❌
- [ ] CRUD Task Types. ❌
- [x] DB tables có trong design. ✅

---

## 🗑️ Epic ORG-04: Thùng rác Org

### US-ORG-04-01: Xem User đã deactivate
- [ ] Filter `member_status = DEACTIVATED`. ❌
- [ ] Danh sách riêng. ❌

### US-ORG-04-02: Khôi phục User
- [ ] Restore button. ❌
- [ ] Set `member_status = ACTIVE`. ❌

### US-ORG-04-03: Xem/Khôi phục Project đã xóa
- [ ] Filter `deleted_at IS NOT NULL`. ❌
- [ ] Restore project + tasks. ❌

---

## 🛡️ RÀO CHẮN RBAC/ABAC (Technical Check)

| Feature | Implementation | Status |
| :--- | :--- | :--- |
| **Tenant Scope** | Chỉ quản lý trong Org mình. | [x] |
| **User Lifecycle** | Create/Deactivate/Reactivate. | [ ] |
| **Invite Management** | Create/Revoke invite links. | [ ] |
| **Role Assignment** | Assign PM/EMP/CEO. | [x] |
| **Lookup Management** | CRUD Status/Priority/Type. | [ ] |
| **Recycle Bin** | View/Restore deleted items. | [ ] |

---

## 📊 THỐNG KÊ

| Mục | Đã implement | Thiếu | Coverage |
|-----|--------------|-------|----------|
| Epic ORG-01 | 1.5/5 | 3.5 | 30% |
| Epic ORG-02 | 1.5/3 | 1.5 | 50% |
| Epic ORG-03 | 1/3 | 2 | 33% |
| Epic ORG-04 | 0/3 | 3 | 0% |
| **TỔNG** | **4/14** | **10** | **~29%** |

---

## ❌ CẦN BỔ SUNG (Ưu tiên)

### Ưu tiên CAO:
1. **Invite Link Management**
   - Trang `/admin/invites`
   - Tạo invite code với TTL
   - Copy link button
   - Email hint
   - Revoke invite

2. **User Lifecycle UI**
   - Status badges (INVITED, ACTIVE, DEACTIVATED)
   - Deactivate button với confirm
   - Reactivate button
   - Audit log cho mọi action

3. **Lookup Management**
   - Trang `/settings/lookups`
   - Tabs: Statuses, Priorities, Types
   - CRUD với drag-drop reorder
   - Color picker cho status

### Ưu tiên TRUNG BÌNH:
4. **Role Customization**
   - Trang `/admin/roles/customize`
   - Toggle permissions per role
   - Clone role
   - Delete custom role

5. **Auto-Lock Schedule**
   - Cấu hình auto-lock mỗi tuần/tháng
   - Preview affected periods
   - Email notification trước khi lock

6. **Org Recycle Bin**
   - Trang `/settings/recycle-bin`
   - Tabs: Users, Projects, Tasks
   - Restore với confirm
   - Hard delete (với permission)

### Ưu tiên THẤP:
7. **Timezone Configuration**
   - Dropdown timezone
   - Preview current time
   - Affect activity timestamps

8. **Welcome Email Template**
   - Customize welcome email
   - Preview trước khi send
   - Variables: {name}, {org_name}, {login_url}
