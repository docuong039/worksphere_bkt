# ✅ ORG ADMIN - FRONTEND AUDIT CHECKLIST

> **Mục đích**: Kiểm tra source code FE hiện tại đã implement đủ features cho vai trò Org Admin chưa
> **Cách dùng**: Đối chiếu từng mục với code của bạn, đánh dấu ✅ (có) hoặc ❌ (thiếu)

---

## 📋 THÔNG TIN VAI TRÒ

**Org Admin (ORG) - Quản trị viên Tổ chức**
- **Scope**: TENANT (Chỉ trong 1 organization cụ thể)
- **Quyền hạn**: Quản lý nhân sự, phân quyền nội bộ, cấu hình workspace
- **Khác System Admin**: 
  - Không thấy orgs khác
  - Không tạo/suspend orgs
  - Không impersonate cross-tenant

---

## 🔐 Epic ORG-00: Authentication & Access Control

### US-ORG-00-01: Đăng nhập Org Admin
- [ ] **Login Page** (có thể dùng chung với users khác):
  - [ ] Input Email
  - [ ] Input Password với toggle show/hide
  - [ ] Button "Đăng nhập"
  - [ ] Loading state
  - [ ] Error message hiển thị
- [ ] **Validation**:
  - [ ] Email format validation
  - [ ] Password required
- [ ] **Login Success**:
  - [ ] Lưu token + user info (bao gồm role: ORG_ADMIN)
  - [ ] Lưu orgId của user
  - [ ] Redirect về Org Admin dashboard (không phải system dashboard)
- [ ] **Role Detection**:
  - [ ] Check user.role === 'ORG_ADMIN'
  - [ ] Hiển thị menu/features tương ứng với Org Admin

**💡 Kiểm tra code:**
```typescript
// Sau khi login, check:
// - user.role === 'ORG_ADMIN'
// - user.orgId tồn tại
// - Redirect về /org/dashboard (không phải /admin/dashboard)
```

---

### US-ORG-00-02: Đăng xuất
- [ ] **Logout Button** ở header/sidebar
- [ ] **Logout Functionality**:
  - [ ] Clear token khỏi storage
  - [ ] Clear user state
  - [ ] Redirect về login
- [ ] **Confirmation** (optional):
  - [ ] Modal "Bạn có chắc muốn đăng xuất?"

---

### US-ORG-00-03: Quên mật khẩu
- [ ] **Link "Quên mật khẩu"** ở login page
- [ ] **Forgot Password Page**:
  - [ ] Input email
  - [ ] Button submit
  - [ ] Success message
- [ ] **Reset Password Page**:
  - [ ] Input mật khẩu mới
  - [ ] Confirm mật khẩu (phải match)
  - [ ] Button submit
  - [ ] Success → redirect login

---

## 👥 Epic ORG-01: Quản lý vòng đời nhân sự (Employee Lifecycle)

### US-ORG-01-01: Tạo trực tiếp tài khoản mới (Manual Create)
- [ ] **Users/Members Page** (`/org/users` hoặc `/org/members`):
  - [ ] Button "Thêm nhân viên" hoặc "+ Add User"
- [ ] **Create User Form/Modal**:
  - [ ] Input: Full Name (required)
  - [ ] Input: Email (required, unique validation)
  - [ ] Input: Password (required, min 8 chars)
  - [ ] Checkbox: "Show password" toggle
  - [ ] Button: "Auto-generate password"
  - [ ] Select: Role (ORG_ADMIN, CEO, PM, EMPLOYEE)
  - [ ] Checkbox: "Send welcome email with credentials"
  - [ ] Button: Create User
- [ ] **Validation**:
  - [ ] Email unique check (trong cùng org)
  - [ ] Password strength validation
  - [ ] Full name không được trống
- [ ] **Success**:
  - [ ] Success notification: "User created successfully"
  - [ ] Hiển thị temporary password nếu auto-gen
  - [ ] User xuất hiện trong danh sách
  - [ ] Optional: Show welcome email preview

**💡 Kiểm tra code:**
```typescript
// Tìm: CreateUserModal, AddUserForm, CreateMemberModal
// Check có: password generator, email validation
// Check có hiển thị temp password sau create
```

---

### US-ORG-01-02: Gửi link mời gia nhập (Invite)
- [ ] **Users Page có Button "Invite User"**
- [ ] **Invite Modal/Form**:
  - [ ] Input: Email (hoặc multiple emails)
  - [ ] Optional: Name hint
  - [ ] Select: Role (mặc định EMPLOYEE)
  - [ ] Button: "Generate Invite Link" hoặc "Send Invitation"
- [ ] **Generated Invite Link**:
  - [ ] Display invite URL (có thể copy)
  - [ ] Copy button với tooltip "Copied!"
  - [ ] Expiration time hiển thị (VD: "Expires in 7 days")
  - [ ] Button: "Send via Email"
- [ ] **Invite Management**:
  - [ ] Tab/Section "Pending Invitations"
  - [ ] Table với columns:
    - [ ] Email
    - [ ] Role
    - [ ] Invite Code
    - [ ] Expires At
    - [ ] Actions (Resend, Revoke)
  - [ ] Resend button: gửi lại email
  - [ ] Revoke button: vô hiệu hóa link
- [ ] **Invite Acceptance Flow** (optional):
  - [ ] Public page `/invite/:code`
  - [ ] Hiển thị org name
  - [ ] Form: Full Name, Password
  - [ ] Accept button → tạo user → auto login

**💡 Kiểm tra code:**
```typescript
// Tìm: InviteUserModal, InviteLink component
// Tìm: PendingInvitesTable, InviteAcceptPage
// Check có copy-to-clipboard functionality
// Check có expire countdown
```

---

### US-ORG-01-03: Vô hiệu hóa tài khoản (Deactivate)
- [ ] **User Detail Page hoặc User Table Row**:
  - [ ] Button "Deactivate" hoặc "Suspend" (màu warning/red)
  - [ ] Chỉ hiển thị với users đang ACTIVE
- [ ] **Deactivate Confirmation Modal**:
  - [ ] Title: "Deactivate User [Name]?"
  - [ ] Warning text: "This user will lose access immediately"
  - [ ] Input: Reason (optional)
  - [ ] Buttons: Cancel, Confirm Deactivate
- [ ] **Success**:
  - [ ] Status badge chuyển sang "DEACTIVATED" hoặc "INACTIVE"
  - [ ] User không login được nữa
  - [ ] Success notification
- [ ] **Visual Indicators**:
  - [ ] User row có badge "Deactivated" màu xám/đỏ
  - [ ] Avatar có overlay hoặc grayscale
  - [ ] Actions khác bị disable (không edit được)

**💡 Kiểm tra code:**
```typescript
// Tìm: DeactivateUserModal
// Check có update user status trong state/mock data
// Check có disable login logic cho deactivated users
```

---

### US-ORG-01-04: Kích hoạt lại (Reactivate)
- [ ] **User Detail/Table có Button "Reactivate"**:
  - [ ] Chỉ hiển thị với users DEACTIVATED
  - [ ] Màu success/green
- [ ] **Reactivate Confirmation Modal**:
  - [ ] Title: "Reactivate User [Name]?"
  - [ ] Optional reason input
  - [ ] Buttons: Cancel, Confirm Reactivate
- [ ] **Success**:
  - [ ] Status badge về "ACTIVE"
  - [ ] User có thể login lại
  - [ ] Success notification
  - [ ] Avatar/row về trạng thái bình thường

**💡 Kiểm tra code:**
```typescript
// Tìm: ReactivateUserButton, ReactivateModal
// Check có toggle status logic
```

---

### US-ORG-01-05: Reset mật khẩu cho nhân viên
- [ ] **User Detail Page**:
  - [ ] Button "Reset Password"
- [ ] **Reset Password Modal**:
  - [ ] Option 1: "Send reset email to user"
  - [ ] Option 2: "Generate temporary password"
  - [ ] Radio buttons để chọn
  - [ ] Buttons: Cancel, Confirm
- [ ] **If Generate Temp Password**:
  - [ ] Success modal hiển thị password
  - [ ] Copy button
  - [ ] Warning: "Share this securely with user"
- [ ] **If Send Email**:
  - [ ] Success notification: "Reset email sent"

**💡 Kiểm tra code:**
```typescript
// Tìm: ResetPasswordModal
// Check có 2 options (email/temp password)
// Check có password generator
```

---

## 🔑 Epic ORG-02: Quản lý phân quyền nội bộ (Internal RBAC)

### US-ORG-02-01: Gán Role cho nhân viên
- [ ] **User Detail Page hoặc Edit User Modal**:
  - [ ] Section "Role & Permissions"
  - [ ] Dropdown/Select: Role
    - [ ] Options: ORG_ADMIN, CEO, PM, EMPLOYEE
    - [ ] Current role selected by default
  - [ ] Button: Save Changes
- [ ] **Role Assignment trong User Table** (optional):
  - [ ] Column "Role" có dropdown inline edit
  - [ ] Click dropdown → chọn role → auto save
  - [ ] Loading indicator khi save
- [ ] **Validation**:
  - [ ] Không được để trống role
  - [ ] Warning nếu gán ORG_ADMIN cho nhiều người
- [ ] **Success**:
  - [ ] Success notification
  - [ ] Role badge cập nhật
  - [ ] User menu/permissions thay đổi theo

**💡 Kiểm tra code:**
```typescript
// Tìm: RoleSelect, EditUserRoleModal
// Check có dropdown với 4 roles (ORG_ADMIN, CEO, PM, EMPLOYEE)
// Check có update user role trong state
```

---

### US-ORG-02-02: Thay đổi Role
- [ ] **Same as US-ORG-02-01** (cùng UI)
- [ ] **Additional: Role Change History** (optional):
  - [ ] Timeline trong user detail
  - [ ] Hiển thị: Date, Old Role → New Role, Changed By
- [ ] **Confirmation khi thay đổi**:
  - [ ] Modal: "Change role from [Old] to [New]?"
  - [ ] Warning nếu downgrade (VD: PM → EMPLOYEE)

---

### US-ORG-02-03: Tùy chỉnh quyền hạn Role (Advanced)
- [ ] **Custom Permissions Page** (`/org/roles` hoặc `/org/permissions`):
  - [ ] Chỉ hiển thị nếu org cho phép custom
  - [ ] Warning: "Advanced feature - changes affect all users with this role"
- [ ] **Role Cards/List**:
  - [ ] Mỗi role có card:
    - [ ] Role name
    - [ ] Number of users with this role
    - [ ] Number of permissions
    - [ ] Button: "Edit Permissions"
- [ ] **Permission Editor Modal**:
  - [ ] Checklist grouped by resource:
    - [ ] **Projects**: Create, Edit, Delete, View
    - [ ] **Tasks**: Create, Edit, Delete, Assign
    - [ ] **Users**: View, Edit (limited)
    - [ ] **Reports**: View, Comment
  - [ ] Select/Deselect all per group
  - [ ] Button: Save Changes
- [ ] **Read-only cho System Roles**:
  - [ ] ORG_ADMIN, CEO có badge "System" hoặc lock icon
  - [ ] Checkboxes disabled
  - [ ] Tooltip: "System roles cannot be modified"

**💡 Kiểm tra code:**
```typescript
// Tìm: CustomPermissionsPage, RolePermissionsEditor
// Check có permission checklist grouped by resource
// Check có lock logic cho system roles
```

---

## ⚙️ Epic ORG-03: Cấu hình Workspace nội bộ

### US-ORG-03-01: Cấu hình thông tin tổ chức
- [ ] **Organization Settings Page** (`/org/settings`):
  - [ ] Section "General Information"
- [ ] **Editable Fields**:
  - [ ] Organization Name (text input)
  - [ ] Logo Upload (file input + preview)
  - [ ] Timezone Select (dropdown)
  - [ ] Contact Email (text input)
  - [ ] Description (textarea)
- [ ] **Logo Upload**:
  - [ ] File input accepts: .jpg, .png, .svg
  - [ ] Image preview sau upload
  - [ ] Remove button
  - [ ] Size limit warning (VD: max 2MB)
- [ ] **Save Button**:
  - [ ] Bottom of form
  - [ ] Loading state khi save
  - [ ] Success notification
- [ ] **Preview Changes** (optional):
  - [ ] Show logo in header sau save
  - [ ] Timezone áp dụng cho date/time display

**💡 Kiểm tra code:**
```typescript
// Tìm: OrgSettingsPage, GeneralSettings
// Check có file upload component
// Check có timezone dropdown
```

---

### US-ORG-03-02: Thiết lập quy trình Khóa Log Time
- [ ] **Settings Page có Section "Work Period Lock"**:
  - [ ] Label: "Auto-lock time logs after period ends"
- [ ] **Lock Configuration**:
  - [ ] Checkbox: "Enable automatic lock"
  - [ ] Select: Lock frequency
    - [ ] Weekly (every Sunday)
    - [ ] Bi-weekly
    - [ ] Monthly (last day of month)
  - [ ] Time input: Lock at (VD: 23:59)
- [ ] **Manual Lock Override** (optional):
  - [ ] Table "Lock History"
  - [ ] Button: "Lock Current Period Now"
- [ ] **Save Button**:
  - [ ] Success notification
  - [ ] Confirmation: "Lock policy will apply from next period"

**💡 Kiểm tra code:**
```typescript
// Tìm: WorkPeriodLockSettings
// Check có checkbox enable/disable
// Check có frequency selector
```

---

### US-ORG-03-03: Quản lý Danh mục phù hợp
- [ ] **Settings Page có Section "Custom Categories"**:
  - [ ] Tabs hoặc Accordion:
    - [ ] Task Statuses
    - [ ] Task Priorities
    - [ ] Task Types
    - [ ] Project Categories (optional)
    - [ ] Skill Groups (optional)
- [ ] **Task Statuses Manager**:
  - [ ] Table với columns:
    - [ ] Status Name
    - [ ] Status Code
    - [ ] Color (color picker)
    - [ ] Sort Order
    - [ ] Actions (Edit, Delete)
  - [ ] Button: "Add Status"
  - [ ] System statuses (TODO, IN_PROGRESS, DONE) có badge "System" - không xóa được
- [ ] **Add/Edit Status Modal**:
  - [ ] Input: Name
  - [ ] Input: Code (auto-generated từ name)
  - [ ] Color picker
  - [ ] Number input: Sort order
  - [ ] Checkbox: "Is terminal status" (final state)
  - [ ] Buttons: Cancel, Save
- [ ] **Similar UI cho Priorities & Types**

**💡 Kiểm tra code:**
```typescript
// Tìm: CustomCategoriesSettings, StatusManager
// Tìm: AddStatusModal, EditStatusModal
// Check có color picker component
// Check có drag-drop để reorder (optional)
```

---

## 🗑️ Epic ORG-04: Quản trị Thùng rác tổ chức

### US-ORG-04-01: Xem nhân sự đã vô hiệu hóa
- [ ] **Users Page có Tab "Deactivated Users"**:
  - [ ] Tab navigation: Active | Deactivated
- [ ] **Deactivated Users Table**:
  - [ ] Columns:
    - [ ] Name
    - [ ] Email
    - [ ] Role
    - [ ] Deactivated At
    - [ ] Deactivated By
    - [ ] Actions (Reactivate, View Details)
  - [ ] Pagination
  - [ ] Search box
- [ ] **Empty State**:
  - [ ] Icon + text: "No deactivated users"

**💡 Kiểm tra code:**
```typescript
// Tìm: DeactivatedUsersTab, InactiveUsersTable
// Check có filter users by status
```

---

### US-ORG-04-02: Khôi phục tài khoản nhân sự
- [ ] **Reactivate Button** trong deactivated users table
- [ ] **Confirmation Modal**:
  - [ ] Title: "Reactivate [User Name]?"
  - [ ] Text: "User will regain access to their account"
  - [ ] Optional reason input
  - [ ] Buttons: Cancel, Confirm
- [ ] **Success**:
  - [ ] Move user từ Deactivated tab → Active tab
  - [ ] Success notification
  - [ ] Status badge về ACTIVE

**💡 Kiểm tra code:**
```typescript
// Same as US-ORG-01-04
// Check có move user giữa active/deactivated lists
```

---

### US-ORG-04-03: Xem và khôi phục các dự án đã xóa
- [ ] **Recycle Bin Page** (`/org/recycle-bin`):
  - [ ] Tabs: Projects | Users | Documents (optional)
- [ ] **Deleted Projects Table**:
  - [ ] Columns:
    - [ ] Project Name
    - [ ] Project Code
    - [ ] Deleted At
    - [ ] Deleted By
    - [ ] Retention Days Left
    - [ ] Actions (Restore, Delete Permanently)
  - [ ] Retention countdown badges (red if < 7 days)
- [ ] **Restore Project Modal**:
  - [ ] Title: "Restore Project [Name]?"
  - [ ] Preview: "This will restore X tasks, Y members"
  - [ ] Optional reason
  - [ ] Buttons: Cancel, Restore
- [ ] **Permanent Delete Modal**:
  - [ ] Multi-step confirmation (như System Admin)
  - [ ] Type project code to confirm
  - [ ] Final reason input
  - [ ] Warning: "Cannot be undone"

**💡 Kiểm tra code:**
```typescript
// Tìm: RecycleBinPage, DeletedProjectsTable
// Tìm: RestoreProjectModal, PermanentDeleteModal
```

---

## 🎨 GENERAL UI/UX CHECKS

### Layout & Navigation
- [ ] **Org Admin Layout riêng**:
  - [ ] Sidebar menu với sections:
    - [ ] Dashboard (org metrics)
    - [ ] Members/Users
    - [ ] Projects (nếu có quyền xem all)
    - [ ] Settings
    - [ ] Recycle Bin
  - [ ] Header với:
    - [ ] Org logo (nếu đã upload)
    - [ ] Org name hiển thị
    - [ ] User menu (avatar, logout)
- [ ] **Không có menu**:
  - [ ] System Admin features (cross-tenant)
  - [ ] Platform audit logs
  - [ ] Other organizations
- [ ] **Breadcrumbs**:
  - [ ] Hiển thị: Dashboard > Members > User Detail

### Role Badge Component
- [ ] **Role Badge** với color coding:
  - [ ] ORG_ADMIN: Purple/Violet
  - [ ] CEO: Gold/Orange
  - [ ] PM: Blue
  - [ ] EMPLOYEE: Gray/Green
- [ ] **Status Badge**:
  - [ ] ACTIVE: Green
  - [ ] DEACTIVATED: Red/Gray
  - [ ] INVITED: Yellow

### Reusable Components
- [ ] **User Card/List Item**:
  - [ ] Avatar (hoặc initials)
  - [ ] Name
  - [ ] Email
  - [ ] Role badge
  - [ ] Status badge
- [ ] **Invite Link Display**:
  - [ ] URL display với copy button
  - [ ] Expiration countdown
- [ ] **Confirmation Modals** (reusable base)
- [ ] **Form Components**:
  - [ ] TextInput
  - [ ] PasswordInput với toggle
  - [ ] Select/Dropdown
  - [ ] FileUpload (cho logo)
  - [ ] ColorPicker (cho custom categories)

### State Management
- [ ] **Auth State**:
  - [ ] user.role === 'ORG_ADMIN'
  - [ ] user.orgId (current org)
- [ ] **Members State**:
  - [ ] activeMembers list
  - [ ] deactivatedMembers list
  - [ ] pendingInvites list
- [ ] **Settings State**:
  - [ ] orgInfo (name, logo, timezone)
  - [ ] lockPolicy
  - [ ] customCategories (statuses, priorities, types)
- [ ] **Recycle Bin State**:
  - [ ] deletedProjects
  - [ ] deletedUsers (optional)

### Routing & Guards
- [ ] **Protected Routes** yêu cầu:
  - [ ] isAuthenticated
  - [ ] user.role === 'ORG_ADMIN' (hoặc roles có quyền tương tự)
- [ ] **Route Structure**:
  ```
  /org/
    /dashboard
    /members (hoặc /users)
    /members/:id
    /invites
    /roles (nếu có custom permissions)
    /settings
    /recycle-bin
  ```
- [ ] **Redirect** nếu:
  - [ ] Chưa login → /login
  - [ ] Role không phải ORG_ADMIN → forbidden page

### Mock Data Requirements
- [ ] **Mock Org Admin User**:
  ```typescript
  {
    id: 'user-org-admin-001',
    email: 'admin@acme.com',
    fullName: 'Jane Smith',
    role: 'ORG_ADMIN',
    orgId: 'org-001',
    status: 'ACTIVE'
  }
  ```
- [ ] **Mock Members** (ít nhất 5):
  - [ ] 1 ORG_ADMIN
  - [ ] 1 CEO
  - [ ] 2 PM
  - [ ] 3 EMPLOYEE
  - [ ] 1-2 DEACTIVATED users
- [ ] **Mock Pending Invites** (2-3):
  ```typescript
  {
    id: 'invite-001',
    email: 'newuser@acme.com',
    role: 'EMPLOYEE',
    inviteCode: 'abc123xyz',
    expiresAt: '2024-03-01T00:00:00Z',
    createdBy: 'user-org-admin-001'
  }
  ```
- [ ] **Mock Custom Categories**:
  - [ ] Task Statuses (TODO, IN_PROGRESS, DONE, + 1-2 custom)
  - [ ] Task Priorities (LOW, MEDIUM, HIGH, URGENT)
  - [ ] Task Types (TASK, BUG, FEATURE)

### Form Validation
- [ ] **Email validation**:
  - [ ] Format check
  - [ ] Unique check (trong org)
  - [ ] Real-time feedback
- [ ] **Password validation**:
  - [ ] Min 8 characters
  - [ ] Must contain: uppercase, lowercase, number (optional)
  - [ ] Strength indicator
- [ ] **Required fields** có asterisk (*)
- [ ] **Error messages** rõ ràng, inline

### Error Handling
- [ ] **Network errors**: Toast/notification với retry
- [ ] **Validation errors**: Inline dưới inputs
- [ ] **403 Forbidden**: "You don't have permission"
- [ ] **404 Not Found**: "User not found" page

---

## 📝 SUMMARY CHECKLIST

### Critical Features (P0 - Bắt buộc)
- [ ] Login/Logout
- [ ] View Members List
- [ ] Create User (Manual)
- [ ] Deactivate/Reactivate Users
- [ ] Assign Roles
- [ ] Organization Settings (name, logo, timezone)

### Important Features (P1 - Nên có)
- [ ] Invite Users (với link)
- [ ] Pending Invites Management
- [ ] Reset Password for members
- [ ] Custom Categories (statuses, priorities)
- [ ] Deactivated Users List
- [ ] Recycle Bin (Projects)

### Nice-to-Have (P2 - Tốt nếu có)
- [ ] Custom Permissions Editor
- [ ] Work Period Lock Settings
- [ ] Role Change History
- [ ] Advanced filters (search, sort)
- [ ] Bulk actions (deactivate multiple users)
- [ ] Export members list
- [ ] Activity log (org level)

---

## 🔍 CÁCH DÙNG CHECKLIST

1. **Mở source code của bạn**
2. **Đi qua từng Epic** (ORG-00 → ORG-04)
3. **Check từng checkbox**:
   - ✅ Có component/feature này
   - ❌ Thiếu/chưa làm
   - ⚠️ Làm một phần
4. **Ghi chú** missing items
5. **Tính % completion** mỗi Epic
6. **Prioritize** theo P0, P1, P2

---

## 📊 KẾT QUẢ MẪU

```
Epic ORG-00: Authentication
  ✅ Login (100%)
  ✅ Logout (100%)
  ⚠️ Reset Password (50% - có form nhưng chưa có email flow)
  → Overall: 2.5/3 = 83%

Epic ORG-01: Employee Lifecycle
  ✅ Create User Manual (100%)
  ❌ Invite User (0% - chưa làm)
  ✅ Deactivate (100%)
  ✅ Reactivate (100%)
  ⚠️ Reset Password (50%)
  → Overall: 3.5/5 = 70%

Epic ORG-02: RBAC
  ✅ Assign Role (100%)
  ✅ Change Role (100%)
  ❌ Custom Permissions (0%)
  → Overall: 2/3 = 67%

Epic ORG-03: Workspace Config
  ⚠️ Org Settings (60% - có form nhưng thiếu logo upload)
  ❌ Lock Policy (0%)
  ⚠️ Custom Categories (40% - chỉ có view, chưa CRUD)
  → Overall: 1/3 = 33%

Epic ORG-04: Recycle Bin
  ❌ Deactivated Users (0%)
  ❌ Restore User (0%)
  ❌ Deleted Projects (0%)
  → Overall: 0/3 = 0%

TOTAL: 9/17 User Stories = 53% Complete
```

---

**Bạn có thể share code hoặc kết quả audit, tôi sẽ:**
1. ✅ Review chi tiết từng component
2. 🎯 Point out missing features
3. 💡 Suggest improvements
4. 🚀 Generate code cho missing parts nếu cần!