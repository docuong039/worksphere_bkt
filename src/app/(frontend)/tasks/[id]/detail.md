# CHI TIẾT TASK

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-01-03**: Là nhân viên, tôi muốn **thêm subtask** vào task chính với ngày bắt đầu và ngày kết thúc
- **US-EMP-01-04**: Là nhân viên, tôi muốn **chỉnh sửa hoặc xóa subtask do mình tạo**
- **US-EMP-01-05**: Là nhân viên, tôi muốn **chuyển trạng thái subtask** (To Do -> In Progress -> Done)
- **US-EMP-01-06**: Là nhân viên, tôi muốn **đính kèm file/tài liệu** vào task hoặc subtask
- **US-EMP-01-07**: Là nhân viên, tôi muốn **bình luận và trao đổi** trực tiếp trên task/subtask
- **US-EMP-01-08**: Là nhân viên, tôi muốn **tag người được assign** bằng `@username`
- **US-EMP-01-09**: Là nhân viên, tôi muốn **comment trở thành thread** để dễ theo dõi

**Nguồn:** Epic EMP-01

**Route:** `/(frontend)/tasks/[id]`

**Quyền truy cập:**
- ✅ EMP được assign - Xem + CRUD subtask + comment
- ✅ PM của project - Full access
- ✅ CEO - View only
- ❌ Guest

---

## 2. PHÂN QUYỀN CHI TIẾT

### 👤 Employee (EMP)

**Business Rules:**
> "EMP không có quyền chỉnh sửa Task (title/priority/status/due_date...). Việc chỉnh sửa/đổi trạng thái Task thuộc quyền PM/MNG."
> "EMP toàn quyền (CRUD) Subtask do mình tạo trong Task được giao (theo rule ownership `created_by`)."
> **Nguồn:** Epic EMP-01, Lưu ý phân quyền

**Permissions:**
- ✅ Xem chi tiết task
- ✅ Thêm subtask
- ✅ Sửa/Xóa subtask do mình tạo (`created_by = current_user`)
- ✅ Chuyển status subtask
- ✅ Comment, tag, reply
- ✅ Đính kèm file
- ✅ Chỉnh sửa các trường Task cụ thể **nếu được PM cấp quyền** (Ma trận quyền Field-level)
- ❌ Đổi status Task (Trừ khi PM cấp quyền cụ thể)

### 👔 Manager (PM)

**Permissions:**
- ✅ Xem chi tiết task
- ✅ Sửa thông tin Task
- ✅ Chuyển status Task (To Do → Done)
- ✅ CRUD subtask
- ✅ Comment, tag
- ✅ Assign/Unassign members

---

## 3. DỮ LIỆU

### 3.1. Database Tables

#### Bảng: `tasks`
**Nguồn:** Section 3.2.4

| Column | Type | Hiển thị UI? |
|--------|------|--------------|
| id | uuid | ❌ |
| title | varchar(500) | ✅ Header |
| description | text | ✅ Rich text |
| status_code | varchar(30) | ✅ Badge |
| priority_code | varchar(30) | ✅ Badge |
| type_code | varchar(30) | ✅ Badge |
| start_date | date | ✅ Gantt |
| due_date | date | ✅ Deadline |
| created_at | timestamptz | ✅ Info |
| created_by | uuid | ✅ Author |

#### Bảng: `subtasks`
**Nguồn:** Section 3.2.6

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | PK |
| task_id | uuid | FK |
| title | varchar(500) | ✅ |
| status_code | varchar(30) | Trạng thái |
| start_date | date | Ngày bắt đầu |
| end_date | date | Ngày kết thúc |
| sort_order | int | Thứ tự |
| created_by | uuid | **ABAC ownership** |

#### Bảng: `task_comments`
**Nguồn:** Section 3.2.8

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | PK |
| parent_comment_id | uuid | Thread (reply) |
| content | text | Rich Text |
| author_user_id | uuid | Người bình luận |

#### Bảng: `task_attachments`
**Nguồn:** Section 3.6.3

| Column | Type |
|--------|------|
| task_id | uuid |
| document_id | uuid |

---

### 3.2. API Endpoints

**GET /api/tasks/:id**
```typescript
interface TaskDetailResponse {
  id: string;
  title: string;
  description: string;
  status: { code: string; name: string };
  priority: { code: string; name: string };
  type: { code: string; name: string };
  start_date: string | null;
  due_date: string | null;
  project: { id: string; name: string };
  assignees: Assignee[];
  subtasks: Subtask[];
  comments: Comment[];
  attachments: Attachment[];
}
```

**POST /api/tasks/:id/subtasks**
**PUT /api/tasks/:id/subtasks/:subtaskId**
**DELETE /api/tasks/:id/subtasks/:subtaskId**

**POST /api/tasks/:id/comments**

---

## 4. BUSINESS RULES

### Rule 1: Ownership Subtask
**Nguồn:** Section 3.2.6

> "Chỉ người tạo được sửa/xoá (ABAC ownership)"
```sql
-- Check trước khi update/delete
SELECT * FROM subtasks WHERE id = :subtask_id AND created_by = :current_user_id;
```

### Rule 2: Log time chỉ khi Done
**Nguồn:** Epic EMP-02

> "Chỉ khi đối tượng (Task/Subtask) ở trạng thái Hoàn thành (Done) thì mới được phép log time."

### Rule 3: PM đổi Task status
**Nguồn:** Epic EMP-01, Tóm tắt luồng hoạt động

> "Đối với Task chính: Chỉ Quản lý (PM/MNG) có quyền chuyển trạng thái sang Done."

---

## 5. GIAO DIỆN

### 5.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Tasks]                                [Edit] [Delete]
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔴 URGENT   IN_PROGRESS                                        │
│  Fix login bug when user enters wrong password                  │
│  ─────────────────────────────────────────────────────────────  │
│  Project: Auth System  |  Due: Jan 20, 2026  |  Created by: PM   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📝 Description                                           │   │
│  │ User không thể đăng nhập khi nhập sai mật khẩu...        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 👥 Assignees                                             │   │
│  │ [Avatar] John Doe  [Avatar] Jane Smith                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📋 Subtasks (2/5)                        [+ Add Subtask] │   │
│  │ ☑ Check error logs              Jan 15 - Jan 16  [✏️][🗑️]│   │
│  │ ☑ Identify root cause           Jan 16 - Jan 17         │   │
│  │ ☐ Fix validation logic          Jan 17 - Jan 18         │   │
│  │ ☐ Write unit tests              Jan 18 - Jan 19         │   │
│  │ ☐ Test on staging               Jan 19 - Jan 20         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📎 Attachments (2)                       [+ Upload File] │   │
│  │ 📄 error_screenshot.png (125 KB)                         │   │
│  │ 📄 requirements.pdf (2.5 MB)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 💬 Comments (3)                                          │   │
│  │                                                          │   │
│  │ [Avatar] John Doe - 2 hours ago                          │   │
│  │ Đã check logs, có vẻ lỗi ở validation layer @JaneSmith   │   │
│  │ [Reply]                                                  │   │
│  │    └─ [Avatar] Jane Smith - 1 hour ago                   │   │
│  │       Cảm ơn, mình sẽ check ngay!                        │   │
│  │                                                          │   │
│  │ ┌────────────────────────────────────────────────────┐   │   │
│  │ │ Write a comment...                        [Send]   │   │   │
│  │ └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. COMPONENTS

- **Badge** - Status, Priority, Type
- **Avatar** - Assignees
- **SubtaskList** - Danh sách subtask với **drag-and-drop sorting** (US-EMP-01-10)
- **SubtaskForm** - Thêm/sửa subtask
- **CommentThread** - Bình luận thread
- **FileUploader** - Upload attachment

---

## 7. DRAG-AND-DROP SUBTASK SORTING

**Nguồn:** US-EMP-01-10: "Là nhân viên, tôi muốn **sắp xếp thứ tự các subtask** do mình tạo"

### 7.1. Interaction

```
┌──────────────────────────────────────────────────────────────┐
│ 📋 Subtasks (2/5)                        [+ Add Subtask]    │
│                                                              │
│ ⋮⋮ ☑ Check error logs              Jan 15 - Jan 16  [✏️][🗑️] │ ← Drag handle
│ ⋮⋮ ☑ Identify root cause           Jan 16 - Jan 17         │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│ ← Drop zone
│ ⋮⋮ ☐ Fix validation logic          Jan 17 - Jan 18         │
│ ⋮⋮ ☐ Write unit tests              Jan 18 - Jan 19         │
│ ⋮⋮ ☐ Test on staging               Jan 19 - Jan 20         │
└──────────────────────────────────────────────────────────────┘
```

### 7.2. API

**PUT /api/tasks/:taskId/subtasks/reorder**

```typescript
interface ReorderSubtasksRequest {
  subtask_ids: string[];  // Thứ tự mới của subtask IDs
}
```

### 7.3. Rules

- EMP chỉ được sắp xếp subtask **do mình tạo** (`created_by = current_user`)
- PM có thể sắp xếp tất cả subtask trong task
- Cập nhật trường `sort_order` trong bảng `subtasks`

---

## 7. INTERACTIONS

### 7.1. Add Subtask
1. Click "+ Add Subtask"
2. Modal/Inline form xuất hiện
3. Nhập title, start_date, end_date
4. Save → Thêm vào list

### 7.2. Edit Subtask (Only owner)
1. Click ✏️ icon
2. Inline edit form
3. Save changes

### 7.3. Toggle Subtask Done
1. Click checkbox
2. API call cập nhật status_code
3. Optimistic update

### 7.4. Add Comment
1. Type comment
2. Use @mention để tag
3. Submit → Append to list

### 7.5. Reply to Comment
1. Click "Reply"
2. Reply form xuất hiện
3. Submit với parent_comment_id

---

## 8. RELATED PAGES

```
/tasks/[id] (This page)
  ├─→ /tasks             (← Back)
  ├─→ /tasks/[id]/edit   (Edit button - PM only)
  └─→ /time-logs         (Log time - when Done)
```

---

**END OF DOCUMENTATION**
