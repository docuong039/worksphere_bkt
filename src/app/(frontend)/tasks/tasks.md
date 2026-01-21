# DANH SÁCH TASK CỦA TÔI

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-01-01**: Là nhân viên, tôi muốn **xem danh sách các task được giao** (theo dự án hoặc tất cả), để biết mình cần làm gì trong ngày.
- **US-EMP-01-02**: Là nhân viên, tôi muốn **tìm kiếm và lọc task** (theo trạng thái, độ ưu tiên, tên, và các trường tùy chỉnh), để nhanh chóng tìm thấy công việc cụ thể.
- **US-MNG-01-11**: Là PM, tôi muốn **tìm kiếm và lọc toàn bộ task trong dự án** (theo nhân sự, trạng thái, độ ưu tiên), để giám sát tiến độ.

**Nguồn:** Epic EMP-01, MNG-01

**Route:** `/(frontend)/tasks`

**Quyền truy cập:**
- ✅ Employee (EMP) - Xem task của mình
- ✅ Manager (PM/MNG) - Xem task của projects mình quản lý
- ✅ CEO - Xem tất cả task trong org
- ❌ Guest

---

## 2. PHÂN QUYỀN CHI TIẾT

### 👤 Employee (EMP)

**Business Rule từ tài liệu:**
> "EMP chỉ được xem các Task mà PM/MNG giao (assigned)."
> 
> **Nguồn:** File `1. Epic - user stories.md`, Epic EMP-01, Lưu ý phân quyền

**SQL Query:**
```sql
-- Nguồn: Section 3.2.4 (tasks), 3.2.5 (task_assignees)
SELECT t.id, t.title, t.status_code, t.priority_code, t.due_date
FROM tasks t
JOIN task_assignees ta ON ta.org_id = t.org_id AND ta.task_id = t.id
WHERE t.org_id = :current_org_id
  AND ta.user_id = :current_user_id
  AND t.deleted_at IS NULL
ORDER BY t.due_date NULLS LAST;
```

**UI Permissions:**
- ✅ Xem danh sách task
- ✅ Tìm kiếm, filter, sort
- ❌ KHÔNG có button "Create Task"
- ❌ KHÔNG có button "Edit/Delete Task"

---

### 👔 Manager (PM/MNG)

**Nguồn:** Section 3.2.2 (project_members)

**SQL Query:**
```sql
SELECT t.*
FROM tasks t
JOIN project_members pm ON pm.org_id = t.org_id AND pm.project_id = t.project_id
WHERE t.org_id = :current_org_id
  AND pm.user_id = :current_user_id
  AND pm.member_role = 'PM'
  AND t.deleted_at IS NULL;
```

**UI Permissions:**
- ✅ Xem danh sách task
- ✅ **CÓ** button "Create Task"
- ✅ **CÓ** button "Edit/Delete" trên mỗi card

---

### Bảng tổng hợp UI Elements:

| UI Element | EMP | PM | CEO |
|------------|-----|----|----|
| Xem danh sách | ✅ | ✅ | ✅ |
| Search & Filter | ✅ | ✅ | ✅ |
| Button "Create Task" | ❌ | ✅ | ❌ |
| Button "Edit/Delete" | ❌ | ✅ | ❌ |
| Filter "By Project" | ❌ | ✅ | ✅ |

---

## 3. DỮ LIỆU

### 3.1. Database Tables

#### Bảng chính: `tasks`
**Nguồn:** Section 3.2.4 trong `3. Database Design.md`

| Column | Type | Hiển thị UI? | Ghi chú |
|--------|------|--------------|---------|
| id | uuid | ❌ | Routing `/tasks/[id]` |
| project_id | uuid | ✅ | Hiển thị tên project |
| title | varchar(500) | ✅ | **Tiêu đề chính** |
| status_code | varchar(30) | ✅ | Badge màu sắc |
| priority_code | varchar(30) | ✅ | Icon + Badge |
| due_date | date | ✅ | **Quan trọng** |
| created_at | timestamptz | ✅ | "Tạo lúc..." |

#### Lookup Table: `task_statuses`
**Nguồn:** Section 3.2.3

| code | name | UI Color |
|------|------|----------|
| TODO | To Do | Gray `#6B7280` |
| IN_PROGRESS | In Progress | Blue `#3B82F6` |
| DONE | Done | Green `#10B981` |
| BLOCKED | Blocked | Red `#EF4444` |

#### Lookup Table: `task_priorities`
**Nguồn:** Section 3.2.3

| code | name | Icon |
|------|------|------|
| LOW | Low | ⬇️ |
| MEDIUM | Medium | ➡️ |
| HIGH | High | ⬆️ |
| URGENT | Urgent | 🔴 |

---

### 3.2. API Endpoints

#### **GET /api/tasks** - Lấy danh sách task

**Request:**
```typescript
interface GetTasksParams {
  status?: string[];    // ['TODO', 'IN_PROGRESS']
  priority?: string[];  // ['HIGH', 'URGENT']
  project_id?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

**Response:**
```typescript
interface Task {
  id: string;
  title: string;
  status: { code: string; name: string };
  priority: { code: string; name: string };
  due_date: string | null;
  project: { id: string; name: string };
  assignees: { user_id: string; full_name: string }[];
  subtasks_count: number;
  subtasks_done: number;
}

interface GetTasksResponse {
  data: Task[];
  pagination: { total: number; page: number; total_pages: number };
}
```

---

## 4. BUSINESS RULES

### Rule 1: EMP chỉ xem task được giao
**Nguồn:** Epic EMP-01

> "EMP chỉ được xem các Task mà PM/MNG giao (assigned)."

### Rule 2: Soft delete
**Nguồn:** Section 2.3, Database Design

> "Các bảng nghiệp vụ chính sử dụng `deleted_at` để lưu vết xóa mềm."

---

## 5. GIAO DIỆN

### 5.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  📋 My Tasks (12)              [+ Create Task]   │
│             │  ─────────────────────────────────────────────── │
│             │  [🔍 Search...]  [Project ▼] [Status ▼] [Priority ▼]
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 🔴 URGENT  Fix login bug    Due: Today      │  │
│             │  │ Project: Auth | Status: IN PROGRESS         │  │
│             │  │ ━━━━━━━━ 40%  2/5 subtasks                  │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ 🟡 MEDIUM  Update docs     Due: Jan 25      │  │
│             │  │ Project: Docs | Status: TODO                 │  │
│             │  │ ━━━━━━━━  0%  0/3 subtasks                  │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  [← Previous]  Page 1 of 3  [Next →]              │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 6. COMPONENTS

### Từ `_shared/components/ui/`:
- **Input** - Search box
- **Select** - Filter dropdowns
- **Badge** - Status, Priority
- **Card** - Task item container
- **Pagination** - Phân trang

### Từ `tasks/_components/`:
- **TaskCard** - Hiển thị 1 task item
- **TaskFilter** - Bộ lọc

---

## 7. STATES

### 7.1. Loading State
- Skeleton cards

### 7.2. Empty State
```
📭 No tasks assigned yet
You're all caught up!
```

### 7.3. Filter Empty
```
🔍 No tasks match filters
[Clear Filters]
```

---

## 8. INTERACTIONS

### 8.1. Click vào Task Card
→ Navigate `/tasks/[id]`

### 8.2. Search
- Debounce 300ms
- Min 2 characters

### 8.3. Filter
- Multiple select checkboxes
- Apply button

---

## 10. DRAG-AND-DROP TASK SORTING (PM Only)

**Nguồn:** US-MNG-01-14: "Là PM, tôi muốn **sắp xếp thứ tự các task** trong dự án, để ưu tiên hiển thị các hạng mục quan trọng lên trên."

### 10.1. Interaction

PM có thể kéo thả task cards để thay đổi thứ tự hiển thị:

```
┌─────────────────────────────────────────────────────────────────┐
│ ⋮⋮ 🔴 URGENT  Fix login bug    Due: Today                     │ ← Drag handle (PM only)
├─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┄─┤ ← Drop zone
│ ⋮⋮ 🟡 MEDIUM  Update docs     Due: Jan 25                     │
│ ⋮⋮ 🟢 LOW     Review PR        Due: Jan 28                     │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2. API

**PUT /api/projects/:projectId/tasks/reorder**

```typescript
interface ReorderTasksRequest {
  task_ids: string[];  // Thứ tự mới của task IDs
}
```

### 10.3. Rules

- Chỉ **PM** mới thấy drag handle và có quyền sắp xếp
- EMP và CEO không thấy drag handle
- Cập nhật trường `sort_order` trong bảng `tasks`
- Khi bật filter/sort khác, disable drag-and-drop

---

**END OF DOCUMENTATION**
