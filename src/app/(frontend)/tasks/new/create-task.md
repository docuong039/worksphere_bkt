# TẠO TASK MỚI

## 1. CƠ BẢN

**User Stories được cover:**
- **US-MNG-01-02**: Là PM, tôi muốn **tạo task và gán cho nhân sự** (có thể gán nhiều người 1 task)
- **US-MNG-01-03**: Là PM, tôi muốn **gắn thẻ (tags) và độ ưu tiên (priority)** cho task

**Nguồn:** Epic MNG-01

**Route:** `/(frontend)/tasks/new`

**Quyền truy cập:**
- ✅ PM/MNG - Có quyền tạo task
- ❌ EMP - Không có quyền
- ❌ CEO - Không có quyền (chỉ xem)
- ❌ Guest

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `tasks`
**Nguồn:** Section 3.2.4

| Column | Type | Required | Form Field |
|--------|------|----------|------------|
| title | varchar(500) | ✅ | Text input |
| description | text | ❌ | Rich text editor |
| project_id | uuid | ✅ | Select dropdown |
| status_code | varchar(30) | ✅ | Default 'TODO' |
| priority_code | varchar(30) | ✅ | Select dropdown |
| type_code | varchar(30) | ✅ | Select dropdown |
| start_date | date | ❌ | Date picker |
| due_date | date | ❌ | Date picker |

#### Bảng: `task_assignees`
**Nguồn:** Section 3.2.5

| Column | Type | Ghi chú |
|--------|------|---------|
| task_id | uuid | FK |
| user_id | uuid | Multi-select |
| assigned_by | uuid | Current user |

---

### 2.2. API Endpoint

**POST /api/tasks**

```typescript
interface CreateTaskRequest {
  project_id: string;
  title: string;
  description?: string;
  status_code: string;      // Default: 'TODO'
  priority_code: string;    // Default: 'MEDIUM'
  type_code: string;        // Default: 'TASK'
  start_date?: string;
  due_date?: string;
  assignee_ids: string[];   // Multi-select users
  tag_ids?: string[];       // Multi-select tags
}

interface CreateTaskResponse {
  id: string;
  title: string;
  // ... full task object
}
```

---

## 3. FORM FIELDS

### 3.1. Form Schema

```typescript
const createTaskFormSchema = {
  project_id: {
    type: 'select',
    label: 'Dự án *',
    required: true,
    options: [], // Load từ API projects user quản lý
  },
  title: {
    type: 'text',
    label: 'Tiêu đề *',
    required: true,
    maxLength: 500, // Nguồn: tasks.title varchar(500)
  },
  description: {
    type: 'richtext',
    label: 'Mô tả',
    required: false,
  },
  status_code: {
    type: 'select',
    label: 'Trạng thái',
    defaultValue: 'TODO',
    options: [
      { value: 'TODO', label: 'To Do' },
      { value: 'IN_PROGRESS', label: 'In Progress' },
      { value: 'DONE', label: 'Done' },
      { value: 'BLOCKED', label: 'Blocked' },
    ],
  },
  priority_code: {
    type: 'select',
    label: 'Độ ưu tiên',
    defaultValue: 'MEDIUM',
    options: [
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' },
      { value: 'URGENT', label: 'Urgent' },
    ],
  },
  type_code: {
    type: 'select',
    label: 'Loại',
    defaultValue: 'TASK',
    options: [
      { value: 'TASK', label: 'Task' },
      { value: 'BUG', label: 'Bug' },
      { value: 'FEATURE', label: 'Feature' },
    ],
  },
  start_date: {
    type: 'date',
    label: 'Ngày bắt đầu',
  },
  due_date: {
    type: 'date',
    label: 'Hạn chót',
  },
  assignee_ids: {
    type: 'multiselect',
    label: 'Giao cho',
    options: [], // Load từ project_members
  },
  tag_ids: {
    type: 'multiselect',
    label: 'Thẻ (Tags)',
    options: [], // Load từ tags in org
  },
};
```

---

## 4. GIAO DIỆN

### 4.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Tasks]                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📝 Tạo Task Mới                                                │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Dự án *                                                        │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Chọn dự án...                                    ▼  │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
│  Tiêu đề *                                                      │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ Nhập tiêu đề task...                                │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
│  Mô tả                                                          │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ [Rich text editor]                                  │       │
│  │                                                     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Trạng thái       │  │ Độ ưu tiên       │                    │
│  │ ┌────────────┐   │  │ ┌────────────┐   │                    │
│  │ │ To Do   ▼ │   │  │ │ Medium  ▼ │   │                    │
│  │ └────────────┘   │  │ └────────────┘   │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Ngày bắt đầu     │  │ Hạn chót         │                    │
│  │ ┌────────────┐   │  │ ┌────────────┐   │                    │
│  │ │ 📅        │   │  │ │ 📅        │   │                    │
│  │ └────────────┘   │  │ └────────────┘   │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
│  Giao cho                                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ [Avatar] John  [Avatar] Jane  [+ Thêm người...]     │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
│  Thẻ (Tags)                                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ [🏷️ Backend] [🏷️ Urgent] [+ Thêm thẻ...]           │       │
│  └─────────────────────────────────────────────────────┘       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                [Hủy]  [Tạo Task]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. VALIDATION

| Field | Rule | Error Message |
|-------|------|---------------|
| project_id | Required | "Vui lòng chọn dự án" |
| title | Required | "Vui lòng nhập tiêu đề" |
| title | Max 500 | "Tiêu đề tối đa 500 ký tự" |
| due_date | >= start_date | "Hạn chót phải sau ngày bắt đầu" |

---

## 6. STATES

- **Initial** - Form trống với defaults
- **Loading** - Loading projects/members
- **Submitting** - Button disabled + spinner
- **Success** - Navigate to task detail
- **Error** - Show error toast

---

## 7. INTERACTIONS

### 7.1. Select Project
1. Click dropdown
2. Load project_members vào assignee options
3. Load custom_field_definitions nếu có

### 7.2. Submit Form
1. Validate client-side
2. POST /api/tasks
3. Success → Navigate `/tasks/[id]`
4. Error → Show error message

---

## 8. RELATED PAGES

```
/tasks/new (This page)
  ├─→ /tasks             (← Cancel/Back)
  └─→ /tasks/[id]        (After create success)
```

---

**END OF DOCUMENTATION**
