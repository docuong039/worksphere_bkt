# SẮP XẾP THỨ TỰ TASKS & SUBTASKS

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-01-10**: Là nhân viên, tôi muốn **sắp xếp thứ tự các subtask** do mình tạo, để tổ chức công việc theo trình tự thực hiện cá nhân.
- **US-MNG-01-14**: Là PM, tôi muốn **sắp xếp thứ tự các task** trong dự án, để ưu tiên hiển thị các hạng mục quan trọng lên trên.

**Nguồn:** Epic EMP-01, MNG-01

**Tính năng:** Drag & Drop reorder trong danh sách Tasks/Subtasks

**Quyền truy cập:**
- ✅ EMP - Sắp xếp subtask của mình
- ✅ PM - Sắp xếp tất cả tasks trong project
- ❌ CEO - View only
- ❌ Guest

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `tasks`
**Nguồn:** Section 3.2.4

| Column | Type | Ghi chú |
|--------|------|---------|
| sort_order | int | Thứ tự hiển thị |

#### Bảng: `subtasks`
**Nguồn:** Section 3.2.6

| Column | Type | Ghi chú |
|--------|------|---------|
| sort_order | int | Thứ tự hiển thị |

---

### 2.2. API Endpoints

**PATCH /api/projects/:projectId/tasks/reorder**

```typescript
interface ReorderTasksRequest {
  task_orders: {
    task_id: string;
    sort_order: number;
  }[];
}
```

**PATCH /api/tasks/:taskId/subtasks/reorder**

```typescript
interface ReorderSubtasksRequest {
  subtask_orders: {
    subtask_id: string;
    sort_order: number;
  }[];
}
```

---

## 3. GIAO DIỆN

### 3.1. Task List with Drag Handle

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Tasks trong Project Alpha                                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ⋮⋮ ┌─────────────────────────────────────────────────────┐    │
│     │ 1. Fix login bug                  🔴 URGENT         │    │
│     │    Due: Jan 20 | Status: IN_PROGRESS                │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  ⋮⋮ ┌─────────────────────────────────────────────────────┐    │
│     │ 2. Update documentation           🟡 MEDIUM         │    │
│     │    Due: Jan 25 | Status: TODO                       │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  ⋮⋮ ┌─────────────────────────────────────────────────────┐    │
│  ↕  │ 3. Implement new feature          🟢 LOW            │    │
│  ↕  │    Due: Feb 01 | Status: TODO                       │    │
│     └─────────────────────────────────────────────────────┘    │
│     ↑ Đang kéo thả để sắp xếp                                  │
│                                                                 │
│  ⋮⋮ ┌─────────────────────────────────────────────────────┐    │
│     │ 4. Code review                    🟡 MEDIUM         │    │
│     │    Due: Jan 22 | Status: TODO                       │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  Legend: ⋮⋮ = Drag handle (hover to show)                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2. Subtask List with Drag

```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Subtasks                                    [+ Add Subtask] │
│                                                                 │
│  ⋮⋮ ☑ 1. Check error logs          Jan 15 - Jan 16            │
│  ⋮⋮ ☑ 2. Identify root cause       Jan 16 - Jan 17            │
│  ⋮⋮ ☐ 3. Fix validation logic       Jan 17 - Jan 18            │
│  ↕  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ (Drop zone)      │
│  ⋮⋮ ☐ 4. Write unit tests          Jan 18 - Jan 19            │
│  ⋮⋮ ☐ 5. Test on staging           Jan 19 - Jan 20            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. INTERACTIONS

### 4.1. Drag & Drop Flow
1. Hover vào row → Hiện drag handle (⋮⋮)
2. Click and hold drag handle
3. Kéo lên/xuống → Các items khác dịch chuyển
4. Thả → Optimistic update UI
5. API call lưu `sort_order` mới
6. Success → Giữ state
7. Error → Revert + show error

### 4.2. Touch Devices
- Long press để bắt đầu drag
- Scroll khi kéo gần edge

### 4.3. Keyboard Support
- Select item với Enter
- Arrow Up/Down để di chuyển
- Enter để confirm

---

## 5. BUSINESS RULES

### Rule 1: EMP chỉ sắp xếp subtask của mình
**Nguồn:** US-EMP-01-10

> "Sắp xếp thứ tự các subtask **do mình tạo**"

```sql
-- Validate ownership
SELECT * FROM subtasks 
WHERE id = :subtask_id AND created_by = :current_user_id;
```

### Rule 2: PM sắp xếp tất cả tasks
**Nguồn:** US-MNG-01-14

> PM có quyền sắp xếp toàn bộ tasks trong project mình quản lý.

### Rule 3: sort_order là số nguyên
- Giá trị mới = (prev_order + next_order) / 2
- Hoặc reindex toàn bộ khi quá nhiều decimals

---

## 6. COMPONENTS

- **DraggableList** - Wrapper cho danh sách có thể kéo thả
- **DraggableItem** - Wrapper cho từng item
- **DragHandle** - Icon kéo thả

---

## 7. STATES

### 7.1. Dragging
- Cursor: grabbing
- Item: opacity 0.8, shadow, slight rotation
- Placeholder: dashed border

### 7.2. Drop Zone
- Highlight khi hover
- Transition animation

---

**END OF DOCUMENTATION**
