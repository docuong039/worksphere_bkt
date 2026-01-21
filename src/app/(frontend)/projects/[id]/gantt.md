# BIỂU ĐỒ GANTT (GANTT CHART)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-MNG-09-01**: Là PM, tôi muốn **xem biểu đồ Gantt của dự án**, để có cái nhìn tổng quan về tiến độ và thời gian thực hiện các Task/Subtask.
- **US-MNG-09-02**: Là PM, tôi muốn **thay đổi trục thời gian (X-axis)** của biểu đồ Gantt theo **Ngày, Tuần, Tháng, Quý**, để theo dõi dự án ở các cấp độ chi tiết khác nhau.
- **US-MNG-09-03**: Là PM, tôi muốn biểu đồ Gantt có thể chọn và hiển thị **Task và Subtask trên trục Y**, giúp quản lý phân cấp công việc trực quan.
- **US-MNG-09-04**: Là PM, tôi muốn mỗi thanh Gantt hiển thị rõ **điểm bắt đầu, điểm kết thúc và độ dài (duration)** của Task/Subtask, để dễ dàng đối soát với kế hoạch.
- **US-MNG-09-05**: Là PM, tôi muốn **lọc biểu đồ Gantt theo nhân sự hoặc trạng thái**, để tập trung vào các phần việc cụ thể trong dòng thời gian.

**Nguồn:** Epic MNG-09

**Route:** `/(frontend)/projects/[id]/gantt`

**Quyền truy cập:**
- ✅ PM - Full access (view + edit)
- ✅ CEO - View only
- ❌ EMP - Không truy cập
- ❌ Guest

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `tasks` - Fields cho Gantt
**Nguồn:** Section 3.2.4

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | |
| title | varchar(500) | Y-axis label |
| start_date | date | **Bar start** |
| due_date | date | **Bar end** |
| status_code | varchar(30) | Bar color |
| priority_code | varchar(30) | Badge |

#### Bảng: `subtasks` - Fields cho Gantt
**Nguồn:** Section 3.2.6

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | |
| task_id | uuid | Parent task |
| title | varchar(500) | Y-axis label |
| start_date | date | Bar start |
| end_date | date | Bar end |
| status_code | varchar(30) | Bar color |

---

### 2.2. API Endpoints

**GET /api/projects/:id/gantt**

```typescript
interface GanttTask {
  id: string;
  title: string;
  start_date: string | null;
  due_date: string | null;
  status_code: string;
  priority_code: string;
  assignees: { id: string; full_name: string; avatar_url: string }[];
  subtasks: GanttSubtask[];
}

interface GanttSubtask {
  id: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  status_code: string;
}

interface GetGanttResponse {
  project: { id: string; name: string; start_date: string; end_date: string };
  tasks: GanttTask[];
}
```

**PATCH /api/tasks/:id/dates** (Drag to update)

```typescript
interface UpdateTaskDatesRequest {
  start_date?: string;
  due_date?: string;
}
```

---

## 3. GIAO DIỆN

### 3.1. Wireframe Desktop - Project Gantt

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Project Alpha > 📊 Gantt Chart                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  [Today] [Week ▼] [<] Jan 13 - Feb 10, 2026 [>]         [🔍 Zoom: █░░░]   │
│                                                                             │
│  ┌────────────────┬──────────────────────────────────────────────────────┐  │
│  │ Task           │ Jan 13  │  Jan 20  │  Jan 27  │  Feb 03  │ Feb 10   │  │
│  ├────────────────┼──────────────────────────────────────────────────────┤  │
│  │                │    │         │         │         │         │        │  │
│  │ ▼ Fix login    │    ██████████████                                   │  │
│  │   [🔴 URGENT]  │    [======= IN PROGRESS =======]                    │  │
│  │   @John @Jane  │                                                      │  │
│  │                │                                                      │  │
│  │   └ Check logs │    ████                                              │  │
│  │                │    [DONE]                                            │  │
│  │                │                                                      │  │
│  │   └ Fix valid  │         ██████                                       │  │
│  │                │         [IN_PROGRESS]                                │  │
│  │                │                                                      │  │
│  │   └ Test       │                   ████████                           │  │
│  │                │                   [TODO]                             │  │
│  │                │                                                      │  │
│  ├────────────────┼──────────────────────────────────────────────────────┤  │
│  │                │                                                      │  │
│  │ ▼ Update docs  │              ██████████████████████                  │  │
│  │   [🟡 MEDIUM]  │              [======= TODO =======]                  │  │
│  │   @Jane        │                                                      │  │
│  │                │                                                      │  │
│  └────────────────┴──────────────────────────────────────────────────────┘  │
│                                                                             │
│  Legend: ██ TODO (gray) ██ IN_PROGRESS (blue) ██ DONE (green) ██ BLOCKED   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. GANTT BAR COLORS

**Nguồn:** Section 3.2.3 task_statuses

| Status | Color | CSS |
|--------|-------|-----|
| TODO | Gray | `#6B7280` |
| IN_PROGRESS | Blue | `#3B82F6` |
| DONE | Green | `#10B981` |
| BLOCKED | Red | `#EF4444` |

---

## 5. INTERACTIONS

### 5.1. Drag to Resize (Change Duration)
1. Hover on bar → Hiện resize handles
2. Drag left edge → Change `start_date`
3. Drag right edge → Change `due_date`
4. Release → API call PATCH
5. Optimistic update

### 5.2. Drag to Move (Change Position)
1. Click and hold bar
2. Drag left/right → Move cả start và end
3. Release → API call PATCH

### 5.3. Expand/Collapse Task
1. Click ▼ icon → Toggle subtasks visibility

### 5.4. Zoom
1. Slider: Day | Week | Month view
2. Scroll wheel: Zoom in/out

### 5.5. Navigate Timeline
1. Click `[<]` `[>]` → Prev/Next period
2. Click `[Today]` → Center on today

---

## 6. BUSINESS RULES

### Rule 1: Task Dates constrain Subtasks
**Nguồn:** Epic MNG-09-02

> Subtask dates phải nằm trong range của Task parent

Validation:
- `subtask.start_date >= task.start_date`
- `subtask.end_date <= task.due_date`

### Rule 2: Only PM can drag
- CEO: View only, no drag
- EMP: No access

---

## 7. STATES

### 7.1. Loading
- Skeleton bars

### 7.2. Empty
```
📊 Chưa có Task nào có ngày bắt đầu/kết thúc
Thiết lập ngày cho tasks để hiển thị trên Gantt.
```

### 7.3. No Dates Warning
- Tasks without dates → Listed at bottom với warning

---

## 8. COMPONENTS

- **GanttTimeline** - Header với dates
- **GanttRow** - Một hàng task/subtask
- **GanttBar** - Bar có thể drag
- **GanttTooltip** - Tooltip khi hover bar

---

## 9. RELATED PAGES

```
/projects/[id]/gantt (This page)
  ├─→ /projects/[id]/overview    (Tab navigation)
  ├─→ /projects/[id]/tasks       (Tab navigation)
  └─→ /tasks/[id]                (Click task name)
```

---

**END OF DOCUMENTATION**
