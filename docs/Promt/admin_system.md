# ✅ SYSTEM ADMIN (SYS) - FRONTEND AUDIT CHECKLIST

> **Mục đích**: Kiểm tra source code FE hiện tại đã implement đủ features cho vai trò System Admin chưa
> **Cách dùng**: Đối chiếu từng mục với code của bạn, đánh dấu ✅ (có) hoặc ❌ (thiếu)

---

## 📋 CHECKLIST TỔNG QUAN

### 🔐 Epic SYS-00: Authentication & Access Control

#### US-SYS-00-01: Đăng nhập System Admin
- [ ] **Page/Route tồn tại**: `/admin/login` hoặc tương tự
- [ ] **Form đăng nhập** có các elements:
  - [ ] Input Email với validation format
  - [ ] Input Password với toggle show/hide (icon con mắt)
  - [ ] Button Submit với text rõ ràng (VD: "Đăng nhập", "Sign In")
  - [ ] Loading state khi submit (spinner, disabled button)
  - [ ] Error message hiển thị khi login fail
- [ ] **Validation client-side**:
  - [ ] Email phải đúng format `xxx@xxx.xxx`
  - [ ] Password bắt buộc nhập (required)
  - [ ] Hiển thị lỗi validation ngay dưới input
- [ ] **Login success behavior**:
  - [ ] Lưu token/session vào localStorage hoặc sessionStorage
  - [ ] Lưu thông tin user (ít nhất: id, email, role)
  - [ ] Redirect về trang Dashboard admin
- [ ] **Security features** (optional nhưng tốt nếu có):
  - [ ] "Remember me" checkbox
  - [ ] Session timeout warning (modal/toast)
  - [ ] Rate limiting UI (disable button sau X lần fail)

**💡 Gợi ý kiểm tra code:**
```typescript
// Tìm component tên: LoginPage, AdminLogin, SystemAdminLogin
// Kiểm tra có useState cho: email, password, error, loading
// Kiểm tra có handleSubmit function
// Kiểm tra có navigate/redirect sau login success
```

---

#### US-SYS-00-02: Đăng xuất
- [ ] **Logout button tồn tại** ở:
  - [ ] Header/Navbar (góc phải thường)
  - [ ] Sidebar menu
  - [ ] User dropdown menu
- [ ] **Logout functionality**:
  - [ ] Clear token khỏi storage (localStorage.removeItem)
  - [ ] Clear user info khỏi state (Redux/Zustand/Context)
  - [ ] Redirect về login page
  - [ ] Không còn access được protected routes
- [ ] **Confirmation modal** (optional):
  - [ ] Hỏi "Bạn có chắc muốn đăng xuất?"
  - [ ] Buttons: "Hủy" và "Đăng xuất"

**💡 Kiểm tra code:**
```typescript
// Tìm: LogoutButton, handleLogout, signOut
// Kiểm tra có clear storage
// Kiểm tra có redirect
```

---

#### US-SYS-00-03: Quên mật khẩu
- [ ] **Link "Quên mật khẩu"** ở trang login
- [ ] **Forgot Password Page** (`/forgot-password` hoặc `/reset-password`)
- [ ] **Form nhập email**:
  - [ ] Input email với validation
  - [ ] Button submit
  - [ ] Success message sau khi gửi
  - [ ] Loading state
- [ ] **Reset Password Page** (với token):
  - [ ] Input mật khẩu mới
  - [ ] Input xác nhận mật khẩu (phải khớp)
  - [ ] Password strength indicator (optional)
  - [ ] Button submit
  - [ ] Success message → redirect về login

**💡 Kiểm tra code:**
```typescript
// Tìm: ForgotPasswordPage, ResetPasswordPage
// Kiểm tra validation password match
// Kiểm tra có password strength meter
```

---

### 🏢 Epic SYS-01: Platform & Customer Management

#### US-SYS-01-01: Tạo/Phê duyệt Organization
- [ ] **Organizations List Page** (`/admin/organizations` hoặc `/admin/orgs`)
- [ ] **Bảng danh sách Organizations** với columns:
  - [ ] Organization Code
  - [ ] Organization Name
  - [ ] Status (với badge màu: PENDING/ACTIVE/SUSPENDED)
  - [ ] Created Date
  - [ ] Actions (buttons: View, Approve, Reject, Edit...)
- [ ] **Filters/Search**:
  - [ ] Search box (tìm theo name/code)
  - [ ] Filter by Status dropdown (All, Pending, Active, Suspended)
  - [ ] Sort by (Created Date, Name...)
- [ ] **Pagination**:
  - [ ] Page numbers hoặc Previous/Next buttons
  - [ ] Items per page selector (10, 20, 50)
  - [ ] Total count hiển thị
- [ ] **Create Organization Button**:
  - [ ] Button "Tạo Organization mới" hoặc "+ Create Org"
  - [ ] Mở modal hoặc navigate to create page
- [ ] **Create Organization Form**:
  - [ ] Input: Organization Code (required, unique)
  - [ ] Input: Organization Name (required)
  - [ ] Select: Timezone
  - [ ] Inputs: Quota settings (Max Users, Max Storage, Max Projects)
  - [ ] Button Submit
  - [ ] Validation errors hiển thị
- [ ] **Approve Organization**:
  - [ ] Button "Approve" ở row item hoặc detail page
  - [ ] Confirmation modal: "Approve organization [Name]?"
  - [ ] Success notification sau approve
  - [ ] Status badge chuyển sang ACTIVE
- [ ] **Reject Organization**:
  - [ ] Button "Reject"
  - [ ] Modal yêu cầu nhập reason (textarea)
  - [ ] Success notification

**💡 Kiểm tra code:**
```typescript
// Tìm: OrganizationsPage, OrgList, OrgTable
// Tìm: CreateOrgModal, CreateOrgForm
// Tìm: ApproveOrgModal, RejectOrgModal
// Kiểm tra có state để lưu danh sách orgs
// Kiểm tra có mock data cho organizations
```

---

#### US-SYS-01-02: Suspend/Activate Organization
- [ ] **Suspend Action** (trong org detail hoặc table row):
  - [ ] Button "Suspend" màu đỏ/warning
  - [ ] Confirmation modal với:
    - [ ] Warning text: "This will lock all users..."
    - [ ] Input reason (required)
    - [ ] Buttons: Cancel, Confirm Suspend
  - [ ] Success notification
  - [ ] Status badge chuyển SUSPENDED
- [ ] **Activate Action**:
  - [ ] Button "Activate" màu xanh
  - [ ] Confirmation modal
  - [ ] Optional reason input
  - [ ] Success notification
  - [ ] Status badge chuyển ACTIVE
- [ ] **Status History** (optional):
  - [ ] Timeline/list hiển thị:
    - [ ] Timestamp
    - [ ] Action (ACTIVE → SUSPENDED)
    - [ ] By whom (admin email)
    - [ ] Reason

**💡 Kiểm tra code:**
```typescript
// Tìm: SuspendOrgModal, ActivateOrgModal
// Tìm: StatusHistoryTimeline, StatusBadge
// Kiểm tra có state để lưu status history
```

---

#### US-SYS-01-03: Tạo Org Admin đầu tiên
- [ ] **Trong Organization Detail Page**:
  - [ ] Section "Organization Admin"
  - [ ] Button "Create First Admin" hoặc "+ Add Admin"
- [ ] **Create Admin Modal/Form**:
  - [ ] Input: Full Name (required)
  - [ ] Input: Email (required, unique validation)
  - [ ] Input: Password (có toggle show/hide)
  - [ ] Checkbox: "Auto-generate password"
  - [ ] Checkbox: "Send welcome email"
  - [ ] Button: Create Admin
- [ ] **Success behavior**:
  - [ ] Success notification
  - [ ] Hiển thị temporary password nếu auto-generated
  - [ ] Admin xuất hiện trong org's user list

**💡 Kiểm tra code:**
```typescript
// Tìm: CreateAdminModal, CreateOrgAdminForm
// Tìm trong: OrgDetailPage
// Kiểm tra có password generator logic
```

---

#### US-SYS-01-04: Reset Password cho User bất kỳ
- [ ] **User Search Page** (`/admin/users`):
  - [ ] Search box (tìm by email/name)
  - [ ] Filter by Organization
  - [ ] User table với columns: Name, Email, Org, Role, Status
- [ ] **User Detail Page** (`/admin/users/:id`):
  - [ ] Hiển thị user info
  - [ ] Button "Reset Password"
- [ ] **Reset Password Modal**:
  - [ ] Radio options:
    - [ ] "Send reset email to user"
    - [ ] "Generate temporary password"
  - [ ] If temporary: hiển thị password sau generate
  - [ ] Button: Confirm Reset
  - [ ] Success notification

**💡 Kiểm tra code:**
```typescript
// Tìm: UserSearchPage, UserDetailPage
// Tìm: ResetPasswordModal
// Kiểm tra có search/filter functionality
```

---

#### US-SYS-01-05: Master Roles & Permissions
- [ ] **Roles Management Page** (`/admin/roles`):
  - [ ] List of roles (cards hoặc table):
    - [ ] SYS_ADMIN
    - [ ] ORG_ADMIN
    - [ ] CEO
    - [ ] PROJECT_MANAGER
    - [ ] EMPLOYEE
  - [ ] Mỗi role card hiển thị:
    - [ ] Role name
    - [ ] Role code
    - [ ] Number of permissions (VD: "15 permissions")
    - [ ] Scope type (PLATFORM/TENANT)
- [ ] **Permission Matrix** (grid view):
  - [ ] Rows: Permissions (grouped by resource: PROJECT, TASK, USER...)
  - [ ] Columns: Roles
  - [ ] Cells: Checkboxes (checked = role có permission)
  - [ ] Có thể toggle checkboxes để assign/revoke
- [ ] **Create Role Modal** (nếu hỗ trợ custom roles):
  - [ ] Input: Role name
  - [ ] Input: Role code
  - [ ] Select: Scope (PLATFORM/TENANT)
  - [ ] Multi-select: Permissions
  - [ ] Button: Create Role
- [ ] **Read-only indicators**:
  - [ ] System roles có badge "System" hoặc lock icon
  - [ ] Checkboxes disabled cho system roles

**💡 Kiểm tra code:**
```typescript
// Tìm: RolesPage, PermissionMatrix
// Tìm: CreateRoleModal
// Kiểm tra có mock data cho roles và permissions
```

---

#### US-SYS-01-06: Impersonation (Đăng nhập hỗ trợ)
- [ ] **User Detail Page có button "Impersonate"**:
  - [ ] Button màu warning/orange
  - [ ] Chỉ hiển thị với users khác SYS_ADMIN
- [ ] **Impersonate Confirmation Modal**:
  - [ ] Preview user info (Name, Email, Org)
  - [ ] Textarea: Reason for impersonation (required, min 20 chars)
  - [ ] Checkbox: "I understand this will be logged"
  - [ ] Buttons: Cancel, Start Impersonation
- [ ] **Impersonation Mode Active**:
  - [ ] **Banner ở top** màu đỏ/vàng:
    - [ ] Text: "You are viewing as [User Name] - [Org Name]"
    - [ ] Button "Exit Impersonation" luôn visible
  - [ ] Banner persistent (không thể close)
  - [ ] Layout/theme có thể khác để phân biệt
- [ ] **Exit Impersonation**:
  - [ ] Click button ở banner
  - [ ] Optional: Modal hỏi reason for exit
  - [ ] Success notification
  - [ ] Redirect về System Admin dashboard
- [ ] **Impersonation State Management**:
  - [ ] Store impersonation info (target user, session id, reason)
  - [ ] Tất cả actions ghi log với flag "impersonating"

**💡 Kiểm tra code:**
```typescript
// Tìm: ImpersonateButton, ImpersonateModal
// Tìm: ImpersonationBanner (persistent banner)
// Tìm: ExitImpersonationButton
// Kiểm tra store có impersonationState
// Kiểm tra banner render trong layout chính
```

---

#### US-SYS-01-07: Quota Management
- [ ] **Trong Organization Detail Page**:
  - [ ] Section "Quota Settings"
  - [ ] Button "Edit Quota" hoặc pencil icon
- [ ] **Quota Edit Form/Modal**:
  - [ ] Input: Max Users (number)
  - [ ] Input: Max Storage (MB) (number)
  - [ ] Input: Max Projects (number)
  - [ ] Date inputs: Effective From, Effective To
  - [ ] Validation: không được nhỏ hơn current usage
  - [ ] Button: Save Quota
- [ ] **Usage Indicators**:
  - [ ] Progress bars cho từng quota:
    - [ ] Users: 35/50 (70%) - màu xanh/vàng/đỏ theo %
    - [ ] Storage: 5120/10240 MB (50%)
    - [ ] Projects: 12/20 (60%)
  - [ ] Warning badge nếu > 80% (màu vàng)
  - [ ] Danger badge nếu > 95% (màu đỏ)
- [ ] **Quota History Table**:
  - [ ] Columns: Date, Max Users, Max Storage, Max Projects, Changed By
  - [ ] Sortable by date
  - [ ] Expandable rows để xem reason (optional)

**💡 Kiểm tra code:**
```typescript
// Tìm trong: OrgDetailPage
// Tìm: QuotaSettingsPanel, EditQuotaModal
// Tìm: UsageProgressBar component
// Kiểm tra có mock quota data
```

---

### 📊 Epic SYS-02: Platform Monitoring & Audit

#### US-SYS-02-01: Platform Dashboard
- [ ] **Dashboard Page** (`/admin/dashboard`):
  - [ ] Page title: "System Dashboard" hoặc "Platform Overview"
- [ ] **Metrics Cards** (4 cards row):
  - [ ] Card 1: Total Organizations
    - [ ] Large number (VD: 125)
    - [ ] Breakdown: Active (100), Pending (20), Suspended (5)
    - [ ] Icon: Building/Office
  - [ ] Card 2: Total Users
    - [ ] Large number
    - [ ] Trend indicator (↑ +5% from last month)
    - [ ] Icon: Users
  - [ ] Card 3: Total Projects
    - [ ] Large number
    - [ ] Icon: Folder/Briefcase
  - [ ] Card 4: Storage Usage
    - [ ] GB used / GB total
    - [ ] Progress bar
    - [ ] Icon: Database/HardDrive
- [ ] **Charts Section**:
  - [ ] **Org Growth Chart** (Line chart):
    - [ ] X-axis: Time (Last 30 days)
    - [ ] Y-axis: Number of orgs
    - [ ] Tooltip on hover
  - [ ] **User Distribution** (Bar chart):
    - [ ] X-axis: Organizations (top 10)
    - [ ] Y-axis: Number of users
- [ ] **Recent Activities Timeline**:
  - [ ] List of 5-10 recent activities:
    - [ ] Icon theo loại (+ org created, ⚠ suspended, 👤 impersonation)
    - [ ] Text: "Organization ABC created"
    - [ ] Timestamp: "2 hours ago"
    - [ ] Actor: "admin@system.com"
- [ ] **Quick Actions Panel**:
  - [ ] Button: Create Organization
  - [ ] Link: View Pending Approvals (badge với count)
  - [ ] Link: System Audit Logs

**💡 Kiểm tra code:**
```typescript
// Tìm: DashboardPage, SystemDashboard
// Tìm: MetricCard component
// Tìm: OrgGrowthChart, UserDistributionChart
// Tìm: RecentActivitiesTimeline
// Kiểm tra có chart library (Recharts, Chart.js...)
```

---

#### US-SYS-02-02: System Audit Logs
- [ ] **Audit Logs Page** (`/admin/audit-logs`):
  - [ ] Page title: "System Audit Logs"
- [ ] **Filter Panel** (sidebar hoặc top):
  - [ ] Date Range Picker (From - To)
  - [ ] Action Type Multi-Select:
    - [ ] CREATE_ORG, SUSPEND_ORG, IMPERSONATE, etc.
  - [ ] Organization Select (dropdown all orgs)
  - [ ] Actor Search (input email)
  - [ ] Entity Type Filter (ORG, USER, ROLE...)
  - [ ] Button: Apply Filters, Clear Filters
- [ ] **Audit Logs Table**:
  - [ ] Columns:
    - [ ] Timestamp (sortable)
    - [ ] Actor (email)
    - [ ] Action (với badge màu)
    - [ ] Entity Type
    - [ ] Entity ID (hoặc Name)
    - [ ] Organization
    - [ ] IP Address
  - [ ] Pagination
  - [ ] Expandable rows để xem details
- [ ] **Expandable Row Details**:
  - [ ] Before/After Data (JSON diff viewer)
  - [ ] User Agent (full string)
  - [ ] Request ID
  - [ ] Impersonation Session ID (nếu có)
- [ ] **Export Functionality**:
  - [ ] Button "Export Logs"
  - [ ] Modal chọn format (CSV/JSON)
  - [ ] Date range limit warning (max 90 days)
  - [ ] Success: Download file

**💡 Kiểm tra code:**
```typescript
// Tìm: AuditLogsPage
// Tìm: AuditLogTable, FilterPanel
// Tìm: JsonDiffViewer component
// Tìm: ExportLogsModal
// Kiểm tra có date range picker library
```

---

### 🗑️ Epic SYS-03: Platform Recycle Bin

#### US-SYS-03-01: Xem Organizations đã xóa
- [ ] **Recycle Bin Page** (`/admin/recycle-bin`):
  - [ ] Tab navigation (nếu nhiều loại): Organizations, Users, Projects
  - [ ] Focus: Deleted Organizations tab
- [ ] **Deleted Orgs Table**:
  - [ ] Columns:
    - [ ] Organization Name
    - [ ] Organization Code
    - [ ] Status (before deletion: ACTIVE/SUSPENDED)
    - [ ] Deleted At (timestamp)
    - [ ] Deleted By (admin email)
    - [ ] Retention Days Left (countdown)
    - [ ] Actions (Restore, Delete Permanently)
  - [ ] Retention badges:
    - [ ] Green: > 30 days
    - [ ] Yellow: 7-30 days
    - [ ] Red: < 7 days
  - [ ] Pagination
- [ ] **Preview Modal**:
  - [ ] Click org name để preview
  - [ ] Snapshot data:
    - [ ] Org details
    - [ ] User count (at deletion)
    - [ ] Project count
    - [ ] Storage used
  - [ ] Button: Close

**💡 Kiểm tra code:**
```typescript
// Tìm: RecycleBinPage
// Tìm: DeletedOrgsTable
// Tìm: OrgPreviewModal
// Kiểm tra có retention countdown logic
```

---

#### US-SYS-03-02: Khôi phục Organization
- [ ] **Restore Button** ở table row
- [ ] **Restore Confirmation Modal**:
  - [ ] Title: "Restore Organization [Name]?"
  - [ ] Impact preview:
    - [ ] "This will restore:"
    - [ ] "- 35 users"
    - [ ] "- 12 projects"
    - [ ] "- 5.1 GB data"
  - [ ] Input: Reason (optional)
  - [ ] Checkbox: "Send notification to Org Admin"
  - [ ] Buttons: Cancel, Confirm Restore
- [ ] **Restore Process**:
  - [ ] Progress modal/spinner: "Restoring... Please wait"
  - [ ] Success notification: "Organization restored successfully"
  - [ ] Link: "View restored organization"
  - [ ] Removed from Recycle Bin table

**💡 Kiểm tra code:**
```typescript
// Tìm: RestoreOrgModal
// Tìm: RestoreProgressModal
// Kiểm tra có state để remove item khỏi recycle bin
```

---

#### US-SYS-03-03: Xóa vĩnh viễn Organization
- [ ] **Permanent Delete Button** (danger, red color)
- [ ] **Multi-Step Confirmation**:
  - [ ] **Step 1 Modal**: Warning
    - [ ] Title: "⚠️ Permanent Delete Warning"
    - [ ] Text: "This action CANNOT be undone. All data will be lost forever:"
    - [ ] Impact list: Users, Projects, Storage, Logs
    - [ ] Button: Next
  - [ ] **Step 2 Modal**: Type Confirmation
    - [ ] Input: "Type organization code to confirm"
    - [ ] Validation: must match exact code
    - [ ] Button: Next (disabled until typed correctly)
  - [ ] **Step 3 Modal**: Final Reason
    - [ ] Textarea: Reason for permanent deletion (required)
    - [ ] Text: "This will be logged in audit trail"
    - [ ] Buttons: Cancel, Permanently Delete
- [ ] **Success**:
  - [ ] Success notification
  - [ ] Row removed from table
  - [ ] Audit log created

**💡 Kiểm tra code:**
```typescript
// Tìm: PermanentDeleteModal (multi-step)
// Tìm: ConfirmationCodeInput component
// Kiểm tra có validation logic cho code matching
```

---

## 🎨 GENERAL UI/UX CHECKS

### Layout & Navigation
- [ ] **Admin Layout riêng biệt**:
  - [ ] Sidebar menu với sections:
    - [ ] Dashboard
    - [ ] Organizations
    - [ ] Users
    - [ ] Roles & Permissions
    - [ ] Audit Logs
    - [ ] Recycle Bin
  - [ ] Header với:
    - [ ] Logo/Brand "System Admin"
    - [ ] User menu (avatar, name, logout)
    - [ ] Notifications bell (optional)
- [ ] **Breadcrumbs**:
  - [ ] Hiển thị path: Dashboard > Organizations > Detail
- [ ] **Active menu highlighting**:
  - [ ] Current page highlighted trong sidebar

### Components Reusable
- [ ] **Modal Component** (base modal reusable)
- [ ] **Confirmation Dialog** (reusable)
- [ ] **Data Table** (với sort, pagination, expandable rows)
- [ ] **Status Badge** (với color mapping)
- [ ] **Form Input Components**:
  - [ ] TextInput
  - [ ] PasswordInput (với toggle)
  - [ ] Select/Dropdown
  - [ ] DatePicker
  - [ ] Checkbox
  - [ ] Textarea
- [ ] **Button Component** (variants: primary, danger, secondary, ghost)
- [ ] **Toast/Notification** system
- [ ] **Loading Spinner** (page-level và button-level)
- [ ] **Empty State** component (khi table empty)
- [ ] **Error Boundary** (catch errors)

### State Management
- [ ] **Auth State**:
  - [ ] isAuthenticated
  - [ ] user (id, email, role)
  - [ ] token
  - [ ] isImpersonating
  - [ ] impersonationTarget
- [ ] **Organizations State**:
  - [ ] organizations list
  - [ ] currentOrg (selected)
  - [ ] filters (status, search)
- [ ] **Audit Logs State**:
  - [ ] logs list
  - [ ] filters
  - [ ] pagination
- [ ] **Recycle Bin State**:
  - [ ] deletedOrgs
  - [ ] filters

### Routing & Guards
- [ ] **Protected Routes**:
  - [ ] Admin routes yêu cầu authentication
  - [ ] Redirect về login nếu chưa đăng nhập
  - [ ] Role guard: chỉ SYS_ADMIN access được `/admin/*`
- [ ] **Route Structure**:
  - [ ] `/admin/login`
  - [ ] `/admin/dashboard`
  - [ ] `/admin/organizations`
  - [ ] `/admin/organizations/:id`
  - [ ] `/admin/users`
  - [ ] `/admin/users/:id`
  - [ ] `/admin/roles`
  - [ ] `/admin/audit-logs`
  - [ ] `/admin/recycle-bin`

### Mock Data
- [ ] **Mock Organizations** (ít nhất 3: PENDING, ACTIVE, SUSPENDED)
- [ ] **Mock Users** (ít nhất 1 SYS_ADMIN, 1 ORG_ADMIN)
- [ ] **Mock Roles** (5 roles chuẩn)
- [ ] **Mock Permissions** (grouped by resource)
- [ ] **Mock Audit Logs** (various actions)
- [ ] **Mock Deleted Orgs** (recycle bin)

### Responsive & Accessibility
- [ ] **Desktop-first** (admin dùng desktop chủ yếu)
- [ ] **Tablet support** (optional)
- [ ] **Keyboard navigation** (Tab, Enter, Esc)
- [ ] **Focus states** visible
- [ ] **ARIA labels** cho screen readers

---

## 📝 SUMMARY CHECKLIST

### Must-Have (Bắt buộc)
- [ ] Login/Logout functionality
- [ ] Organizations List (với CRUD)
- [ ] Approve/Reject Organizations
- [ ] Suspend/Activate Organizations
- [ ] Create Org Admin
- [ ] Dashboard với metrics
- [ ] Audit Logs page
- [ ] Protected routing

### Should-Have (Nên có)
- [ ] User Search & Reset Password
- [ ] Roles & Permissions Management
- [ ] Impersonation feature
- [ ] Quota Management
- [ ] Recycle Bin với Restore/Permanent Delete
- [ ] Charts trong Dashboard

### Nice-to-Have (Tốt nếu có)
- [ ] Advanced filters
- [ ] Export functionality
- [ ] Real-time notifications
- [ ] Session timeout warning
- [ ] Dark mode
- [ ] Multi-language support

---

## 🚀 CÁC DÙNG CHECKLIST NÀY

1. **In hoặc mở trên màn hình thứ 2**
2. **Mở source code của bạn**
3. **Đi qua từng Epic một**:
   - Mở folder/file tương ứng
   - Check từng mục
   - Đánh dấu ✅ hoặc ❌
4. **Note lại missing features**
5. **Prioritize**: P0 (critical), P1 (important), P2 (nice to have)
6. **Implement missing features** theo thứ tự priority

---

## 📤 KẾT QUẢ KIỂM TRA

**Bạn có thể share kết quả theo format:**

```
✅ Epic SYS-00: 3/3 user stories (100%)
⚠️ Epic SYS-01: 5/7 user stories (71%)
  ❌ Missing: US-SYS-01-06 (Impersonation)
  ❌ Missing: US-SYS-01-07 (Quota Management)
✅ Epic SYS-02: 2/2 user stories (100%)
❌ Epic SYS-03: 0/3 user stories (0%)

Overall: 10/15 user stories implemented (67%)
```

Hoặc bạn có thể **share code** và tôi sẽ giúp review chi tiết!