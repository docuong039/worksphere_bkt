# ✅ PROJECT MANAGER (PM) - FRONTEND AUDIT CHECKLIST

> **Mục đích**: Kiểm tra source code FE hiện tại đã implement đủ features cho vai trò Project Manager chưa
> **Cách dùng**: Đối chiếu từng mục với code của bạn, đánh dấu ✅ (có) hoặc ❌ (thiếu)

---

## 📋 THÔNG TIN VAI TRÒ

**Project Manager (PM) / CTO**
- **Scope**: PROJECT (Chỉ trong các dự án được gán làm PM)
- **Quyền hạn**: Quản lý đầy đủ dự án, phân công, theo dõi tiến độ, phê duyệt
- **Đặc điểm**:
  - Toàn quyền CRUD tasks trong dự án mình quản lý
  - Assign tasks cho members
  - Khóa/Mở khóa kỳ làm việc
  - Xem báo cáo của team members
  - Xem lương/chi phí (theo permission)
  - **KHÔNG** quản lý users toàn org (chỉ project members)

**Khác CEO:**
- ✅ Có quyền tạo/sửa/xóa tasks
- ✅ Assign công việc
- ✅ Khóa kỳ làm việc
- ❌ Không xem dự án khác (chỉ dự án mình là PM)

**Khác ORG_ADMIN:**
- ❌ Không tạo/deactivate users
- ❌ Không cấu hình org-wide settings
- ✅ Quản lý project-level settings

---

## 🔐 Epic MNG-00: Authentication & Access Control

### US-MNG-00-01: Đăng nhập để điều phối dự án
- [ ] **Login Page** (dùng chung):
  - [ ] Input Email, Password
  - [ ] Submit button với loading state
- [ ] **Login Success**:
  - [ ] Check user.role có 'PM' hoặc 'PROJECT_MANAGER'
  - [ ] Redirect về PM Dashboard
  - [ ] Sidebar hiển thị menu cho PM

**💡 Kiểm tra code:**
```typescript
// Sau login, check:
// - user có role PM hoặc member_role = 'PM' trong project_members
// - Redirect về /projects hoặc /pm/dashboard
```

---

### US-MNG-00-02: Đăng xuất
- [ ] **Logout Button** ở header
- [ ] **Logout Functionality**:
  - [ ] Clear storage
  - [ ] Clear state
  - [ ] Redirect login

---

### US-MNG-00-03: Quên mật khẩu
- [ ] **Forgot Password Flow** (standard)

---

## 📁 Epic MNG-01: Quản lý Dự án & Phân công

### US-MNG-01-01: Tạo mới và cập nhật thông tin dự án
- [ ] **Projects List Page** (`/projects`):
  - [ ] Button "Create Project" (chỉ PM/Org Admin thấy)
  - [ ] List of projects (chỉ projects mà user là PM)
- [ ] **Create Project Modal/Page**:
  - [ ] Input: Project Code (required, unique trong org)
  - [ ] Input: Project Name (required)
  - [ ] Textarea: Description
  - [ ] Select: Status (ACTIVE, ARCHIVED)
  - [ ] Date Picker: Start Date
  - [ ] Date Picker: End Date (optional)
  - [ ] Button: Create Project
- [ ] **Validation**:
  - [ ] Code unique check
  - [ ] Name required
  - [ ] End date >= Start date (nếu có)
- [ ] **Success**:
  - [ ] Project xuất hiện trong list
  - [ ] PM tự động được assign vào project
  - [ ] Navigate to project detail

**💡 Kiểm tra code:**
```typescript
// Tìm: CreateProjectModal, ProjectForm
// Check có validation logic
// Check tự động add creator vào project_members với role PM
```

---

### US-MNG-01-02: Tạo task và gán cho nhân sự (multi-assign)
- [ ] **Project Detail Page** có section "Tasks":
  - [ ] Button "Create Task" hoặc "+ New Task"
- [ ] **Create Task Form/Modal**:
  - [ ] Input: Title (required)
  - [ ] Rich Text Editor: Description (hỗ trợ HTML/Markdown)
  - [ ] Select: Status (TODO, IN_PROGRESS, DONE, BLOCKED...)
  - [ ] Select: Priority (LOW, MEDIUM, HIGH, URGENT)
  - [ ] Select: Type (TASK, BUG, FEATURE)
  - [ ] **Multi-Select: Assignees** (quan trọng!):
    - [ ] Dropdown hoặc tags input
    - [ ] Chỉ hiển thị users trong project_members
    - [ ] Cho phép chọn NHIỀU người (checkbox list)
    - [ ] Avatar + name hiển thị
  - [ ] Date Picker: Start Date
  - [ ] Date Picker: Due Date
  - [ ] Button: Create Task
- [ ] **Task Created**:
  - [ ] Xuất hiện trong task list
  - [ ] Assignees hiển thị (avatars)
  - [ ] Notification gửi cho assignees

**💡 Kiểm tra code:**
```typescript
// Tìm: CreateTaskModal, TaskForm
// Tìm: AssigneesMultiSelect component
// Check có insert vào task_assignees cho mỗi assigned user
// Check có rich text editor (TipTap, Quill, Draft.js)
```

---

### US-MNG-01-03: Gắn thẻ (tags) và độ ưu tiên (priority)
- [ ] **Task Form có fields**:
  - [ ] **Tags Multi-Select**:
    - [ ] Dropdown hoặc autocomplete
    - [ ] List tags từ org (hoặc tạo mới)
    - [ ] Chọn nhiều tags
    - [ ] Tags hiển thị dạng chips/badges
  - [ ] **Priority Dropdown**:
    - [ ] Options: LOW, MEDIUM, HIGH, URGENT
    - [ ] Color-coded icons
    - [ ] Default: MEDIUM
- [ ] **Tags Management** (trong Project Settings):
  - [ ] List tags hiện có
  - [ ] Create new tag (name + color)
  - [ ] Edit/Delete tag
- [ ] **Task Display**:
  - [ ] Priority badge với màu sắc:
    - [ ] LOW: Gray
    - [ ] MEDIUM: Blue
    - [ ] HIGH: Orange
    - [ ] URGENT: Red (có thể blink/pulse)
  - [ ] Tags dạng chips với custom color

**💡 Kiểm tra code:**
```typescript
// Tìm: TagsMultiSelect, PrioritySelect
// Tìm: TagsManager (trong settings)
// Tìm: PriorityBadge, TagChip components
// Check có lưu vào task_tags (many-to-many)
```

---

### US-MNG-01-04: Chuyển trạng thái task (To Do → Done) và sắp xếp
- [ ] **Task List có Kanban View hoặc Table View**:
  - [ ] View switcher: Kanban / List / Gantt
- [ ] **Kanban Board** (nếu có):
  - [ ] Columns: TODO, IN_PROGRESS, DONE, BLOCKED
  - [ ] Drag & drop tasks giữa columns
  - [ ] Drop → update status tự động
- [ ] **Table View**:
  - [ ] Column "Status" có dropdown inline
  - [ ] Click dropdown → chọn status → auto save
- [ ] **Task Detail Modal/Page**:
  - [ ] Status dropdown
  - [ ] Save button
- [ ] **Chuyển sang DONE**:
  - [ ] Confirmation modal (optional)
  - [ ] Set completed_at timestamp
  - [ ] Cho phép assignees log time (theo rule)
- [ ] **Sắp xếp Tasks**:
  - [ ] Drag handle icon (⋮⋮) ở đầu mỗi row
  - [ ] Drag để thay đổi sort_order
  - [ ] Save order tự động

**💡 Kiểm tra code:**
```typescript
// Tìm: KanbanBoard, TaskTable
// Tìm: DragDropContext (react-beautiful-dnd, dnd-kit)
// Check có update task.status khi drop
// Check có update task.sort_order khi reorder
```

---

### US-MNG-01-05: Theo dõi trạng thái test và fix lỗi
- [ ] **Task có fields riêng cho Bug/Test**:
  - [ ] Checkbox: "Is Bug" hoặc Type = BUG
  - [ ] Input: Bug Severity (Low, Medium, High, Critical)
  - [ ] Input: Found In Version
  - [ ] Input: Fixed In Version
  - [ ] Select: Test Status (Not Tested, Passed, Failed)
- [ ] **Bug Tracking Dashboard** (optional):
  - [ ] Tab trong Project Detail
  - [ ] Table/Kanban chỉ tasks type BUG
  - [ ] Metrics:
    - [ ] Total Bugs
    - [ ] Open Bugs
    - [ ] Fixed Bugs
    - [ ] Critical Bugs count
- [ ] **Workflow**:
  - [ ] Tester tạo bug task
  - [ ] PM assign dev
  - [ ] Dev fix → change status "Fixed"
  - [ ] Tester verify → change test status "Passed"

**💡 Kiểm tra code:**
```typescript
// Tìm: BugFields trong TaskForm
// Tìm: BugTrackingDashboard
// Check có filter tasks by type = BUG
```

---

### US-MNG-01-06: Đính kèm file tài liệu/đầu bài
- [ ] **Task Form/Detail có File Upload**:
  - [ ] Button "Attach Files" hoặc "Upload"
  - [ ] File input accepts: docs, images, pdf, zip...
  - [ ] Multiple files upload
  - [ ] Progress bar khi upload
- [ ] **Attachments List**:
  - [ ] Mỗi file hiển thị:
    - [ ] File icon (theo type)
    - [ ] File name (truncated nếu dài)
    - [ ] File size (KB/MB)
    - [ ] Uploaded by + timestamp
    - [ ] Actions: Download, Delete (chỉ PM)
  - [ ] Preview cho images (lightbox)
  - [ ] Download button cho docs
- [ ] **Drag & Drop Upload** (optional):
  - [ ] Drop zone trong task detail
  - [ ] Drag file vào → auto upload

**💡 Kiểm tra code:**
```typescript
// Tìm: FileUpload component, AttachmentsList
// Check có lưu vào task_attachments
// Check có link to documents table
// Check có download/preview functionality
```

---

### US-MNG-01-07, 01-08, 01-09: Comment, Tag người, Thread
- [ ] **Comments Section** trong Task Detail:
  - [ ] Rich Text Editor cho comment
    - [ ] Toolbar: Bold, Italic, Link, Code
    - [ ] @mention autocomplete (type @ → list users)
  - [ ] Button: "Post Comment"
  - [ ] Character counter (optional)
- [ ] **Comments List**:
  - [ ] Mỗi comment hiển thị:
    - [ ] Avatar + Name
    - [ ] Comment content (rendered HTML/Markdown)
    - [ ] Timestamp
    - [ ] Actions: Reply, Edit (own), Delete (own)
  - [ ] Mentions highlighted (blue color, clickable)
- [ ] **Threading**:
  - [ ] Button "Reply" dưới comment
  - [ ] Reply form indent vào trong
  - [ ] Replies indented với border-left
  - [ ] Collapse/Expand threads (icon ▼/►)
- [ ] **@Mention Functionality**:
  - [ ] Autocomplete khi type @
  - [ ] Chỉ list users được assign vào task
  - [ ] Insert mention tag: @username
  - [ ] Notification gửi cho mentioned user
- [ ] **Real-time Updates** (optional):
  - [ ] New comments xuất hiện tự động
  - [ ] WebSocket hoặc polling

**💡 Kiểm tra code:**
```typescript
// Tìm: CommentSection, CommentList
// Tìm: RichTextEditor với mention plugin
// Tìm: MentionAutocomplete component
// Check có lưu mentions vào task_comment_mentions
// Check có threading logic (parent_comment_id)
```

---

### US-MNG-01-10: Tạo các trường tùy chỉnh (Custom Fields)
- [ ] **Project Settings Page** có tab "Custom Fields":
  - [ ] Button "Add Custom Field"
- [ ] **Create Custom Field Modal**:
  - [ ] Select: Entity Type (TASK hoặc SUBTASK)
  - [ ] Input: Field Name (VD: "Mã Jira", "Khách hàng")
  - [ ] Select: Field Type:
    - [ ] TEXT (single line)
    - [ ] NUMBER
    - [ ] DATE
    - [ ] SELECT (dropdown với options)
  - [ ] If SELECT: Textarea options (mỗi dòng 1 option)
  - [ ] Checkbox: Is Required
  - [ ] Button: Create
- [ ] **Custom Fields List**:
  - [ ] Table columns: Name, Type, Entity, Required, Actions
  - [ ] Edit button
  - [ ] Delete button (warning nếu có data)
- [ ] **Custom Fields trong Task Form**:
  - [ ] Dynamic fields render theo custom_field_definitions
  - [ ] Field type tương ứng (text input, number, date picker, select)
  - [ ] Required validation nếu is_required
  - [ ] Save vào custom_field_values

**💡 Kiểm tra code:**
```typescript
// Tìm: CustomFieldsSettings, CreateCustomFieldModal
// Tìm: DynamicFormFields component (render custom fields)
// Check có lưu vào:
// - custom_field_definitions (định nghĩa)
// - custom_field_values (giá trị thực tế)
```

---

### US-MNG-01-11: Tìm kiếm và lọc toàn bộ task
- [ ] **Filter Panel** trong Project Tasks Page:
  - [ ] Search Box: Tìm theo title (debounced)
  - [ ] Multi-Select: Assignees
  - [ ] Multi-Select: Status
  - [ ] Multi-Select: Priority
  - [ ] Multi-Select: Type
  - [ ] Multi-Select: Tags
  - [ ] Date Range: Due Date
  - [ ] **Custom Fields Filters** (nếu có):
    - [ ] Dynamic filters theo custom field type
  - [ ] Buttons: Apply Filters, Clear All
- [ ] **Active Filters Display**:
  - [ ] Chips hiển thị active filters
  - [ ] Click × để remove individual filter
- [ ] **Sort Options**:
  - [ ] Dropdown: Sort by (Title, Due Date, Priority, Created Date)
  - [ ] Direction toggle: Asc/Desc
- [ ] **Result Count**:
  - [ ] Text: "Showing 25 of 100 tasks"

**💡 Kiểm tra code:**
```typescript
// Tìm: TaskFilters, FilterPanel
// Tìm: ActiveFiltersChips
// Check có apply filter logic (AND conditions)
// Check có sort logic
```

---

### US-MNG-01-12: Xuất danh sách task ra .xlsx
- [ ] **Export Button** trong Tasks Page:
  - [ ] Button "Export" hoặc icon ⬇
  - [ ] Dropdown options: Excel (.xlsx), CSV (.csv)
- [ ] **Export Modal** (optional):
  - [ ] Checkboxes: Chọn columns cần export:
    - [ ] Basic: Title, Status, Priority, Assignees, Due Date
    - [ ] Custom Fields: (dynamic list)
  - [ ] Select All / Deselect All
  - [ ] Checkbox: "Export filtered results only"
  - [ ] Button: Download
- [ ] **Export Process**:
  - [ ] Progress indicator
  - [ ] Generate file (client-side: xlsx library)
  - [ ] Trigger download
  - [ ] Success notification
- [ ] **Excel Format**:
  - [ ] Row 1: Headers
  - [ ] Rows 2+: Data
  - [ ] Custom fields included nếu được chọn
  - [ ] Format cells (dates, numbers)

**💡 Kiểm tra code:**
```typescript
// Tìm: ExportTasksButton, ExportModal
// Check có library: xlsx, exceljs, hoặc papaparse (CSV)
// Check có map custom_field_values vào export
```

---

### US-MNG-01-13: Phân quyền Field-level (Chi tiết cột)
- [ ] **Project Settings → Permissions Tab**:
  - [ ] Section: "Field-level Permissions"
- [ ] **Permission Matrix/Table**:
  - [ ] Rows: Users (project members)
  - [ ] Columns: Fields (basic + custom)
    - [ ] Basic: Title, Description, Status, Priority, Due Date
    - [ ] Custom: Dynamic từ custom_field_definitions
  - [ ] Cells: Checkboxes (checked = user có quyền edit)
- [ ] **Bulk Actions**:
  - [ ] Select user → toggle all fields
  - [ ] Select field → toggle all users
- [ ] **Save Button**:
  - [ ] Save changes
  - [ ] Success notification
- [ ] **Enforcement trong Task Edit**:
  - [ ] Khi EMP edit task:
    - [ ] Chỉ fields được phép mới editable
    - [ ] Fields khác: read-only hoặc hidden
    - [ ] Tooltip: "You don't have permission"

**💡 Kiểm tra code:**
```typescript
// Tìm: FieldPermissionsMatrix
// Check có lưu vào: project_field_user_permissions
// Check có permission check khi render form:
// if (hasPermission(userId, fieldName)) {
//   return <EditableField />
// } else {
//   return <ReadOnlyField />
// }
```

---

### US-MNG-01-14: Sắp xếp thứ tự tasks
- [ ] **Task List có Reorder Functionality**:
  - [ ] Drag handle (⋮⋮) ở đầu mỗi row
  - [ ] Drag để thay đổi vị trí
  - [ ] Drop → update sort_order
  - [ ] Auto save
- [ ] **Persistence**:
  - [ ] sort_order lưu trong tasks table
  - [ ] Default sort: ORDER BY sort_order ASC
- [ ] **Visual Feedback**:
  - [ ] Dragging: row có shadow, opacity giảm
  - [ ] Drop zone: highlight border

**💡 Kiểm tra code:**
```typescript
// Tìm: DragDropContext cho task reorder
// Check có update task.sort_order
// Check có conflict resolution (cùng sort_order)
```

---

### US-MNG-01-15: Import danh sách task từ Excel/CSV
- [ ] **Import Button** trong Tasks Page:
  - [ ] Button "Import Tasks" hoặc icon ⬆
- [ ] **Import Modal**:
  - [ ] Step 1: Upload File
    - [ ] File input (.xlsx, .csv)
    - [ ] Validation: file type, size
  - [ ] Step 2: Map Columns
    - [ ] Table preview (first 5 rows)
    - [ ] For each column, dropdown:
      - [ ] Map to: Title, Status, Priority, Assignee, Due Date
      - [ ] Or: Skip this column
    - [ ] **Custom Fields Mapping**:
      - [ ] Dropdown chỉ hiển thị custom fields ĐÃ TẠO trước
      - [ ] Warning nếu Excel column name không match
  - [ ] Step 3: Review & Import
    - [ ] Preview mapped data
    - [ ] Validation errors hiển thị (red rows)
    - [ ] Button: Import X tasks
- [ ] **Import Process**:
  - [ ] Progress bar
  - [ ] Create tasks in batch
  - [ ] Success: Show summary (X created, Y failed)
  - [ ] Failed rows: Download error log
- [ ] **Important Rule**:
  - [ ] Custom fields PHẢI được tạo trước trong Project Settings
  - [ ] Excel column names PHẢI match exact với field names
  - [ ] Nếu không match → skip hoặc error

**💡 Kiểm tra code:**
```typescript
// Tìm: ImportTasksModal, FileUploadStep, ColumnMappingStep
// Check có parse Excel: xlsx library
// Check có validate custom field names:
// const validFields = customFieldDefs.map(f => f.field_name)
// if (!validFields.includes(excelColumn)) { error }
```

---

## 📊 Epic MNG-02: Dashboard Giám sát Hiệu suất

### US-MNG-02-01: Dashboard thống kê dự án (tiến độ, % hoàn thành)
- [ ] **Project Dashboard Page** (`/projects/:id/dashboard`):
  - [ ] Breadcrumb: Projects > [Project Name] > Dashboard
- [ ] **Metrics Cards**:
  - [ ] Total Tasks
    - [ ] Number + icon
  - [ ] Completed Tasks
    - [ ] Number + percentage (VD: 65/100 = 65%)
  - [ ] Overdue Tasks (màu đỏ)
    - [ ] Number + icon ⚠️
  - [ ] Team Members
    - [ ] Avatars stack
- [ ] **Progress Chart**:
  - [ ] **Pie Chart**: Task distribution by status
    - [ ] Slices: TODO, IN_PROGRESS, DONE
    - [ ] Legend, tooltips
  - [ ] **Bar Chart**: Tasks by assignee
    - [ ] X-axis: User names
    - [ ] Y-axis: Task count
    - [ ] Stacked by status (color-coded)
- [ ] **Timeline/Gantt** (optional):
  - [ ] Visual của project timeline
  - [ ] Start date → End date
  - [ ] Milestones
- [ ] **Recent Activity**:
  - [ ] 5-10 recent events trong project
  - [ ] Icons, timestamps

**💡 Kiểm tra code:**
```typescript
// Tìm: ProjectDashboard
// Tìm: MetricCard, TaskDistributionChart
// Check có aggregate tasks by status, assignee
```

---

### US-MNG-02-02: Thống kê chi tiết theo nhân sự (tỉ lệ hoàn thành, trễ hạn)
- [ ] **Team Performance Tab** trong Project Detail:
  - [ ] Table với columns:
    - [ ] Member Name + Avatar
    - [ ] Role
    - [ ] Total Tasks Assigned
    - [ ] Completed Tasks
    - [ ] Completion Rate (%)
    - [ ] Overdue Tasks
    - [ ] Avg Completion Time (optional)
  - [ ] Sort by: Completion Rate, Overdue count
  - [ ] Click user → detailed view
- [ ] **Member Detail Modal/Page**:
  - [ ] User info
  - [ ] Tasks breakdown:
    - [ ] Completed on time
    - [ ] Completed late
    - [ ] Still overdue
  - [ ] Chart: Task status distribution (pie)
  - [ ] List of tasks assigned to this user

**💡 Kiểm tra code:**
```typescript
// Tìm: TeamPerformanceTable, MemberDetailModal
// Check có tính:
// completionRate = completedTasks / totalTasks * 100
// overdueTasks = tasks.filter(t => t.dueDate < now && t.status !== DONE)
```

---

## 💰 Epic MNG-03: Quản lý Tài nguyên & Chi phí Dự án

### US-MNG-03-01: Quản lý thông tin hồ sơ nhân sự
- [ ] **Project Members Page** (`/projects/:id/members`):
  - [ ] List of members
  - [ ] Click member → User Profile
- [ ] **User Profile Page** (read-only for PM):
  - [ ] Avatar, Name, Email, Phone
  - [ ] Role in project (PM/Member)
  - [ ] Joined project date
  - [ ] Skills/Experience (from user_profiles)
  - [ ] Academic level
  - [ ] Bio
- [ ] **No Edit Permission**:
  - [ ] PM chỉ xem, không edit profile
  - [ ] No deactivate button

**💡 Kiểm tra code:**
```typescript
// Tìm: ProjectMembersPage, UserProfilePage (PM view)
// Check read-only mode (no edit buttons)
```

---

### US-MNG-03-02: Cập nhật bậc (level) và mức lương (với permission)
- [ ] **Permission Check**:
  - [ ] PM cần permission: MANAGE_COMPENSATION hoặc VIEW_SALARY_FINANCE
  - [ ] Nếu không có → section này hidden
- [ ] **Member Compensation Tab** (nếu có quyền):
  - [ ] Section trong User Profile
  - [ ] Display:
    - [ ] Current Job Level
    - [ ] Monthly Salary (có thể masked ***)
    - [ ] Hourly Cost Rate
    - [ ] Effective From date
  - [ ] **Edit Button** (nếu có MANAGE permission):
    - [ ] Modal: Update Compensation
    - [ ] Select: New Level
    - [ ] Input: New Salary
    - [ ] Input: New Hourly Rate
    - [ ] Date: Effective From
    - [ ] Button: Save
- [ ] **History Table**:
  - [ ] Previous compensations
  - [ ] Columns: Level, Salary, Rate, Effective Period, Changed By

**💡 Kiểm tra code:**
```typescript
// Tìm: CompensationSection (trong UserProfile)
// Check permission:
// if (hasPermission('MANAGE_COMPENSATION')) {
//   return <EditableCompensation />
// }
```

---

### US-MNG-03-03: Báo cáo chi phí trả lương cho dự án
- [ ] **Project Cost Tab** trong Project Detail:
  - [ ] Chỉ hiển thị với PM có permission VIEW_SALARY_FINANCE
- [ ] **Cost Summary**:
  - [ ] Total Cost (calculated)
    - [ ] Formula: SUM(time_logs.minutes / 60 * hourly_rate)
  - [ ] Total Hours Logged
  - [ ] Average Hourly Rate
  - [ ] Cost by Month (chart - optional)
- [ ] **Cost Breakdown Table**:
  - [ ] Columns:
    - [ ] Member Name
    - [ ] Role
    - [ ] Hours Logged
    - [ ] Hourly Rate
    - [ ] Total Cost
  - [ ] Sort by Total Cost desc
  - [ ] Footer: Total row
- [ ] **Cost Chart**:
  - [ ] Pie Chart: Cost distribution by member
  - [ ] Bar Chart: Cost by month (timeline)
- [ ] **Export Button**:
  - [ ] Export cost report to Excel

**💡 Kiểm tra code:**
```typescript
// Tìm: ProjectCostTab, CostBreakdownTable
// Check calculation:
// memberCost = SUM(
//   timeLogs
//     .filter(tl => tl.ownerUserId === userId)
//     .map(tl => (tl.minutes / 60) * user.hourlyRate)
// )
```

---

## 🔒 Epic MNG-04: Kiểm soát Chu kỳ làm việc

### US-MNG-04-01: Khóa tất cả task và log time theo tuần/tháng
- [ ] **Work Period Locks Page** (`/projects/:id/locks`):
  - [ ] Section: "Manage Work Periods"
- [ ] **Create Lock Modal**:
  - [ ] Select: Period Type (WEEK, MONTH, QUARTER)
  - [ ] Date Picker: Period Start
  - [ ] Date Picker: Period End
  - [ ] Textarea: Lock Reason (optional)
  - [ ] Warning: "This will prevent editing of all tasks and time logs in this period"
  - [ ] Button: Lock Period
- [ ] **Lock Process**:
  - [ ] Confirmation modal
  - [ ] Set is_locked = TRUE
  - [ ] Set locked_at timestamp
  - [ ] Set locked_by = current PM
  - [ ] Success notification
  - [ ] Notifications gửi cho affected users
- [ ] **Locks List**:
  - [ ] Table columns:
    - [ ] Period Type
    - [ ] Period (Start - End)
    - [ ] Status (Locked/Unlocked)
    - [ ] Locked At
    - [ ] Locked By
    - [ ] Actions (Unlock)
  - [ ] Filter by period type
- [ ] **Effect of Lock**:
  - [ ] Tasks trong period: Edit buttons disabled
  - [ ] Time logs trong period: Edit/Delete buttons disabled
  - [ ] Warning message: "This period is locked"

**💡 Kiểm tra code:**
```typescript
// Tìm: WorkPeriodLocksPage, CreateLockModal
// Check enforcement:
// canEditTask = !workPeriodLocks.some(lock => 
//   lock.isLocked && 
//   task.createdAt >= lock.periodStart &&
//   task.createdAt <= lock.periodEnd
// )
```

---

### US-MNG-04-02: Mở khóa task và log time
- [ ] **Unlock Button** trong Locks List:
  - [ ] Chỉ với locked periods
- [ ] **Unlock Confirmation Modal**:
  - [ ] Title: "Unlock Period [Dates]?"
  - [ ] Warning: "Users will be able to edit tasks and time logs again"
  - [ ] Textarea: Unlock Reason
  - [ ] Button: Confirm Unlock
- [ ] **Unlock Process**:
  - [ ] Set is_locked = FALSE
  - [ ] Set unlocked_at timestamp
  - [ ] Set unlocked_by = current PM
  - [ ] Set unlock_reason
  - [ ] Success notification
  - [ ] Notifications gửi cho users
- [ ] **Effect**:
  - [ ] Edit buttons enabled lại
  - [ ] Users có thể edit/delete tasks, time logs

**💡 Kiểm tra code:**
```typescript
// Tìm: UnlockPeriodModal
// Check update is_locked flag
// Check re-enable edit permissions
```

---

### US-MNG-04-03: Xem và phản hồi báo cáo định kỳ
- [ ] **Team Reports Page** (`/projects/:id/reports`):
  - [ ] Filter: By Member, Period Type, Date Range
  - [ ] Table columns:
    - [ ] Member Name
    - [ ] Period (Week 1 - Jan 2024)
    - [ ] Submitted At
    - [ ] Status (Draft, Submitted, Reviewed)
    - [ ] Actions (View)
- [ ] **Report Detail Page**:
  - [ ] Member info
  - [ ] Period info
  - [ ] Report content (rich text display)
  - [ ] Status badge
- [ ] **PM Actions**:
  - [ ] **Add Comment**:
    - [ ] Rich text editor
    - [ ] Button: Post Comment
  - [ ] **Mark as Reviewed** (optional):
    - [ ] Button: Mark Reviewed
    - [ ] Update status
- [ ] **Comment Section**:
  - [ ] Same as task comments
  - [ ] PM comments highlighted (different bg color)
  - [ ] Notification to report author

**💡 Kiểm tra code:**
```typescript
// Tìm: TeamReportsPage, ReportDetailPage (PM view)
// Check PM có thể comment vào reports của team members
// Check có lưu vào report_comments
```

---

## 📦 Epic MNG-05: Quản lý Tài sản & Quy trình Kỹ thuật

### US-MNG-05-01: Quản lý tài liệu/form mẫu (upload, share, preview)
- [ ] **Project Documents Tab** (`/projects/:id/documents`):
  - [ ] Button "Upload Document"
  - [ ] Documents list/grid
- [ ] **Upload Document Modal**:
  - [ ] File input (accepts: pdf, doc, docx, xls, xlsx, ppt, pptx, zip)
  - [ ] Input: Title
  - [ ] Textarea: Description
  - [ ] Select: Document Type (TEMPLATE, FORM, GUIDE, OTHER)
  - [ ] Button: Upload
- [ ] **Documents List**:
  - [ ] Grid or Table view toggle
  - [ ] Each document:
    - [ ] Icon (file type)
    - [ ] Title
    - [ ] Type badge
    - [ ] Size
    - [ ] Uploaded by + date
    - [ ] Actions: Download, Preview, Share, Delete
- [ ] **Preview Modal**:
  - [ ] For PDF: iframe or pdf viewer
  - [ ] For images: lightbox
  - [ ] For others: Download prompt
- [ ] **Share Document**:
  - [ ] Multi-select members
  - [ ] Generate share link (optional)
  - [ ] Send notification

**💡 Kiểm tra code:**
```typescript
// Tìm: ProjectDocumentsTab, UploadDocumentModal
// Check lưu vào documents table
// Check preview component (PDF viewer)
```

---

### US-MNG-05-02: Lưu trữ link mô tả dữ liệu dự án và quy trình
- [ ] **Project Resources Tab** (`/projects/:id/resources`):
  - [ ] Section: "Data Schema & Process Documents"
  - [ ] Button "Add Resource Link"
- [ ] **Add Resource Modal**:
  - [ ] Select: Resource Type (SHEET, DOC, OTHER)
  - [ ] Input: Name/Title
  - [ ] Input: URL (required, validate URL format)
  - [ ] Textarea: Notes/Description
  - [ ] Button: Save
- [ ] **Resources List**:
  - [ ] Table columns:
    - [ ] Type icon
    - [ ] Name (clickable link)
    - [ ] URL (shortened, click to copy)
    - [ ] Notes
    - [ ] Added By + Date
    - [ ] Actions (Edit, Delete)
  - [ ] Click name → open link in new tab
  - [ ] Copy URL button với tooltip "Copied!"

**💡 Kiểm tra code:**
```typescript
// Tìm: ProjectResourcesTab, AddResourceModal
// Check lưu vào project_resources
// Check URL validation
```

---

### US-MNG-05-03: Quản lý thông tin source code (Git link hoặc upload file)
- [ ] **Project Resources Tab có section "Source Code"**:
  - [ ] Button "Add Git Repository"
  - [ ] Button "Upload Code Archive" (cho game gdevelop)
- [ ] **Add Git Repo Modal**:
  - [ ] Input: Repository URL (GitHub, GitLab, Bitbucket)
  - [ ] Input: Branch (default: main)
  - [ ] Textarea: Notes
  - [ ] Button: Save
- [ ] **Upload Code Archive**:
  - [ ] File input (.zip, .rar, .tar.gz)
  - [ ] Input: Version/Tag
  - [ ] Textarea: Notes
  - [ ] Button: Upload
- [ ] **Code Resources List**:
  - [ ] Type: GIT / ARCHIVE
  - [ ] Name (link hoặc filename)
  - [ ] Version/Branch
  - [ ] Added by + date
  - [ ] Actions: Open (git) / Download (archive), Delete

**💡 Kiểm tra code:**
```typescript
// Tìm: CodeResourcesSection
// Check resource_type: 'GIT' | 'CODE_ARCHIVE'
// Check upload lớn file support (chunk upload optional)
```

---

### US-MNG-05-04: Quản lý thông tin deploy
- [ ] **Project Resources Tab có section "Deployment Info"**:
  - [ ] Button "Add Deployment"
- [ ] **Add Deployment Modal**:
  - [ ] Select: Environment (DEV, STAGING, PRODUCTION)
  - [ ] Input: URL/Domain
  - [ ] Input: Server IP (optional)
  - [ ] Input: Version/Build Number
  - [ ] Date: Deployed At
  - [ ] Textarea: Notes/Credentials
  - [ ] Button: Save
- [ ] **Deployments List**:
  - [ ] Cards or Table
  - [ ] Each deployment:
    - [ ] Environment badge (color-coded)
    - [ ] URL (clickable)
    - [ ] Version
    - [ ] Deployed at
    - [ ] Actions: Edit, Delete
  - [ ] Latest deployment highlighted

**💡 Kiểm tra code:**
```typescript
// Tìm: DeploymentSection, AddDeploymentModal
// Check lưu vào project_resources với type: 'DEPLOY'
```

---

### US-MNG-05-05: Chia sẻ thông tin cần thiết cho user nào đó
- [ ] **Share Resource Button** ở mỗi resource item:
  - [ ] Icon share
- [ ] **Share Modal**:
  - [ ] Resource preview (name, type, url)
  - [ ] Multi-select: Project Members
  - [ ] Textarea: Message (optional)
  - [ ] Checkbox: "Send notification email"
  - [ ] Button: Share
- [ ] **Shared Resources Indicator**:
  - [ ] Avatars của shared users
  - [ ] Tooltip: "Shared with John, Jane"
- [ ] **Notifications**:
  - [ ] "[PM Name] shared [Resource] with you"
  - [ ] Click → navigate to resource

**💡 Kiểm tra code:**
```typescript
// Tìm: ShareResourceModal
// Check có bảng resource_shares (many-to-many)
// Hoặc dùng notifications để tracking
```

---

## 📋 Epic MNG-06: Activity (Nhật ký hoạt động dự án)

### US-MNG-06-01: Xem Activity của mình và toàn bộ EMP trong dự án
- [ ] **Project Activity Tab** (`/projects/:id/activity`):
  - [ ] Feed/Timeline hiển thị activities
- [ ] **Date Filter**:
  - [ ] Quick filters: Today, Week, Month, Custom
  - [ ] Date range picker
- [ ] **Activity Feed**:
  - [ ] Group by date headers
  - [ ] Each activity:
    - [ ] Avatar
    - [ ] Action icon (✓ task done, 💬 comment, ⏱️ time log)
    - [ ] Text: "[User] [action] [object]"
    - [ ] Timestamp
    - [ ] Link to related object
  - [ ] Infinite scroll or pagination
- [ ] **Include Activities**:
  - [ ] Task created/updated/completed
  - [ ] Subtask created/completed
  - [ ] Time logged
  - [ ] Comments posted
  - [ ] Files uploaded
  - [ ] Members added/removed

**💡 Kiểm tra code:**
```typescript
// Tìm: ProjectActivityTab, ActivityFeed
// Check filter activities by project_id
// Check group by activity_date
```

---

### US-MNG-06-02: Lọc Activity theo dự án/nhân sự/loại sự kiện
- [ ] **Filter Panel** trong Activity Tab:
  - [ ] **Member Filter**:
    - [ ] Multi-select members
    - [ ] "All Members" option
  - [ ] **Activity Type Filter**:
    - [ ] Checkboxes:
      - [ ] Tasks
      - [ ] Subtasks
      - [ ] Time Logs
      - [ ] Comments
      - [ ] Documents
    - [ ] Select All / Deselect All
  - [ ] Date Range (already in 06-01)
  - [ ] Button: Apply Filters
- [ ] **Active Filters**:
  - [ ] Chips display
  - [ ] Remove individual filter
- [ ] **Empty State**:
  - [ ] No activities found message

**💡 Kiểm tra code:**
```typescript
// Tìm: ActivityFilters component
// Check filter logic:
// activities.filter(a => 
//   memberIds.includes(a.actorUserId) &&
//   types.includes(a.activityType)
// )
```

---

## 🔔 Epic MNG-07: Thông báo (Notifications)

### US-MNG-07-01: Nhận thông báo khi EMP hoàn thành Subtask hoặc log time
- [ ] **Notification Types cho PM**:
  - [ ] ✅ Subtask Completed
    - [ ] Text: "[User] completed subtask [Title]"
  - [ ] ⏱️ Time Logged
    - [ ] Text: "[User] logged X hours on [Task]"
  - [ ] 📝 Task Updated
    - [ ] Text: "[User] updated task [Title]"
- [ ] **Notification Bell**:
  - [ ] Unread count badge
  - [ ] Dropdown with recent notifications
- [ ] **Notification Settings** (optional):
  - [ ] Toggle notifications per type
  - [ ] Frequency (Real-time, Daily digest)

**💡 Kiểm tra code:**
```typescript
// Tìm: NotificationBell, NotificationsList
// Check filter notifications by:
// - project_id IN managed projects
// - notification_type IN relevant types
```

---

### US-MNG-07-02: Nhận thông báo khi EMP comment/báo vấn đề
- [ ] **Comment Notifications**:
  - [ ] 💬 New Comment on Task
    - [ ] Text: "[User] commented on [Task Title]"
    - [ ] Click → navigate to task detail, scroll to comment
  - [ ] 🔔 Mentioned in Comment
    - [ ] Text: "[User] mentioned you in a comment"
  - [ ] ⚠️ Issue Reported (optional)
    - [ ] If comment contains keywords: "issue", "problem", "blocked"
    - [ ] Higher priority notification

**💡 Kiểm tra code:**
```typescript
// Check notification creation on:
// - task_comments insert
// - task_comment_mentions insert
```

---

### US-MNG-07-03: Cấu hình bật/tắt một số loại thông báo theo dự án
- [ ] **Project Settings → Notifications Tab**:
  - [ ] Section: "Notification Preferences"
  - [ ] Table/List of notification types:
    - [ ] Subtask Completed
    - [ ] Time Logged
    - [ ] Comments
    - [ ] Task Updates
    - [ ] Files Uploaded
  - [ ] Each row:
    - [ ] Type name
    - [ ] Toggle switch (ON/OFF)
    - [ ] Description
- [ ] **Save Button**:
  - [ ] Auto-save on toggle (optional)
  - [ ] Or explicit Save button
- [ ] **Effect**:
  - [ ] Khi type bị tắt → không generate notifications
  - [ ] Applies to whole project

**💡 Kiểm tra code:**
```typescript
// Tìm: NotificationSettingsTab
// Check lưu vào: project_notification_settings
// Check enforcement: khi create notification, check setting trước
```

---

## 🗑️ Epic MNG-08: Quản trị Thùng rác dự án

### US-MNG-08-01: Xem danh sách dữ liệu đã xóa trong dự án
- [ ] **Project Recycle Bin Tab** (`/projects/:id/recycle-bin`):
  - [ ] Tabs: Tasks | Subtasks | Time Logs | Documents
- [ ] **Deleted Tasks Tab**:
  - [ ] Table columns:
    - [ ] Task Title
    - [ ] Assignees
    - [ ] Deleted At
    - [ ] Deleted By
    - [ ] Days Until Permanent Delete
    - [ ] Actions (Restore, Delete Permanently)
  - [ ] Retention countdown badge
- [ ] **Similar for Other Tabs**
- [ ] **Filters**:
  - [ ] Search by title
  - [ ] Date range deleted
  - [ ] Deleted by (user filter)

**💡 Kiểm tra code:**
```typescript
// Tìm: ProjectRecycleBinTab
// Check query: WHERE deleted_at IS NOT NULL AND project_id = X
// Hoặc query recycle_bin_items filtered by project_id
```

---

### US-MNG-08-02: Khôi phục dữ liệu đã xóa trong dự án
- [ ] **Restore Button** ở mỗi item
- [ ] **Restore Modal**:
  - [ ] Confirmation
  - [ ] Preview impact (restore subtasks, time logs...)
  - [ ] Optional reason
  - [ ] Button: Restore
- [ ] **Restore Process**:
  - [ ] Set deleted_at = NULL
  - [ ] Remove from recycle_bin_items
  - [ ] Success notification
  - [ ] Item xuất hiện lại trong main list

**💡 Kiểm tra code:**
```typescript
// Tìm: RestoreItemButton, RestoreConfirmModal
// Check update deleted_at = null
```

---

### US-MNG-08-03: Xóa vĩnh viễn dữ liệu
- [ ] **Permanent Delete Button** (danger color)
- [ ] **Multi-step Confirmation**:
  - [ ] Step 1: Warning impact
  - [ ] Step 2: Type task title to confirm
  - [ ] Step 3: Reason for permanent delete
  - [ ] Cannot undo warning
- [ ] **Delete Process**:
  - [ ] Hard DELETE from database
  - [ ] Cascade deletes (subtasks, time logs, attachments)
  - [ ] Remove from recycle_bin_items
  - [ ] Audit log
  - [ ] Success notification

**💡 Kiểm tra code:**
```typescript
// Tìm: PermanentDeleteModal (multi-step)
// Check hard delete (không phải soft delete)
```

---

## 📈 Epic MNG-09: Biểu đồ Gantt (Gantt Chart)

### US-MNG-09-01: Xem biểu đồ Gantt của dự án
- [ ] **Project Tasks Page có Gantt View**:
  - [ ] View switcher: List / Kanban / Gantt
  - [ ] Click Gantt → switch to Gantt layout
- [ ] **Gantt Chart Layout**:
  - [ ] Left panel: Task list (tree view nếu có subtasks)
  - [ ] Right panel: Timeline chart
  - [ ] Horizontal scrollable
  - [ ] Zoom controls (optional)

**💡 Kiểm tra code:**
```typescript
// Tìm: GanttView, GanttChart component
// Check library: gantt-task-react, dhtmlx-gantt, hoặc custom
```

---

### US-MNG-09-02: Thay đổi trục thời gian (Ngày, Tuần, Tháng, Quý)
- [ ] **Timescale Selector**:
  - [ ] Dropdown hoặc buttons: Day / Week / Month / Quarter
  - [ ] Selected option highlighted
- [ ] **Chart Updates**:
  - [ ] X-axis labels change (dates, weeks, months)
  - [ ] Grid intervals adjust
  - [ ] Bar widths adjust
- [ ] **Smooth Transition**:
  - [ ] Animation khi switch timescale

**💡 Kiểm tra code:**
```typescript
// Check có state: timescale: 'day' | 'week' | 'month' | 'quarter'
// Check chart re-renders on timescale change
```

---

### US-MNG-09-03: Chọn và hiển thị Task và Subtask trên trục Y
- [ ] **Tree View** ở left panel:
  - [ ] Tasks là parent nodes
  - [ ] Subtasks indented dưới tasks
  - [ ] Expand/collapse icons (▼/►)
  - [ ] Click to expand/collapse subtasks
- [ ] **Gantt Bars**:
  - [ ] Task bars: solid color, bold
  - [ ] Subtask bars: lighter color, thinner, indented
  - [ ] Dependencies lines (optional): arrows between related tasks

**💡 Kiểm tra code:**
```typescript
// Check tree structure:
// tasks.map(task => ({
//   ...task,
//   children: task.subtasks
// }))
```

---

### US-MNG-09-04: Hiển thị điểm bắt đầu, kết thúc, duration
- [ ] **Gantt Bars hiển thị**:
  - [ ] Start date (left edge of bar)
  - [ ] End date (right edge of bar)
  - [ ] Duration (width of bar)
- [ ] **Bar Labels**:
  - [ ] Task title inside or above bar
  - [ ] Duration text (VD: "5 days") inside bar (if fit)
- [ ] **Tooltip on Hover**:
  - [ ] Task title
  - [ ] Start date: Jan 15, 2024
  - [ ] Due date: Jan 20, 2024
  - [ ] Duration: 5 days
  - [ ] Assignees
  - [ ] Status

**💡 Kiểm tra code:**
```typescript
// Check calculation:
// duration = daysBetween(startDate, dueDate)
// barWidth = duration * pixelsPerDay
```

---

### US-MNG-09-05: Lọc biểu đồ Gantt theo nhân sự hoặc trạng thái
- [ ] **Filter Panel** trong Gantt View:
  - [ ] Multi-select: Assignees
  - [ ] Multi-select: Status
  - [ ] Button: Apply
- [ ] **Filtered Chart**:
  - [ ] Only tasks matching filters displayed
  - [ ] Tree structure maintained (parents shown if children match)
- [ ] **Active Filters**:
  - [ ] Chips display
  - [ ] Clear filters button

**💡 Kiểm tra code:**
```typescript
// Tìm: GanttFilters
// Check filter logic applies before rendering chart
```

---

## 📝 Epic MNG-10: Quản lý Task cá nhân (Personal Tasks)

### US-MNG-10-01: Tạo task cá nhân không thuộc dự án
- [ ] **Personal Tasks Page** (`/my-tasks`):
  - [ ] Separate from project tasks
  - [ ] Button "New Personal Task"
- [ ] **Create Form**:
  - [ ] Title, Description
  - [ ] Priority, Due Date
  - [ ] Status
  - [ ] No project field
  - [ ] No assignees field
- [ ] **Privacy**:
  - [ ] Lock icon, "Private" badge
  - [ ] Only visible to owner

**💡 Kiểm tra code:**
```typescript
// Tìm: PersonalTasksPage (same as CEO-07)
// Check lưu vào personal_tasks table
```

---

### US-MNG-10-02: Quản lý task cá nhân qua Kanban
- [ ] **Kanban Board cho Personal Tasks**:
  - [ ] Columns: TODO, IN_PROGRESS, DONE
  - [ ] Drag & drop
  - [ ] Task cards
- [ ] **No Collaboration Features**:
  - [ ] No assignees
  - [ ] No comments from others
  - [ ] No sharing

**💡 Kiểm tra code:**
```typescript
// Check reuse KanbanBoard component
// Filter: user_id = current_user
```

---

### US-MNG-10-03: Task cá nhân hoàn toàn riêng tư
- [ ] **Isolation**:
  - [ ] WHERE user_id = current_user
  - [ ] No API to list others' tasks
- [ ] **No Sharing**:
  - [ ] No share button
  - [ ] No assign button

---

## 🎨 GENERAL UI/UX CHECKS

### Layout & Navigation
- [ ] **PM Layout**:
  - [ ] Sidebar sections:
    - [ ] Dashboard (personal or projects overview)
    - [ ] Projects (list of managed projects)
    - [ ] My Tasks (personal)
    - [ ] (No org-wide management features)
  - [ ] Header:
    - [ ] Notifications bell
    - [ ] User menu
- [ ] **Project Detail Layout**:
  - [ ] Tabs:
    - [ ] Dashboard
    - [ ] Tasks (List/Kanban/Gantt)
    - [ ] Members
    - [ ] Documents
    - [ ] Resources
    - [ ] Activity
    - [ ] Reports
    - [ ] Work Locks
    - [ ] Settings
    - [ ] Recycle Bin

### Reusable Components
- [ ] **TaskCard** (Kanban)