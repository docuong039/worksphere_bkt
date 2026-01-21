# GHI NHẬN THỜI GIAN (TIME LOGS)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-02-01**: Là nhân viên, tôi muốn **log time (nhập thời gian làm việc)** vào từng task
- **US-EMP-02-02**: Là nhân viên, tôi muốn **log time** vào từng subtask
- **US-EMP-02-03**: Là nhân viên, tôi muốn **xem lịch sử log time** của mình trong ngày/tuần
- **US-EMP-02-04**: Là nhân viên, tôi muốn **chỉnh sửa hoặc xóa các bản ghi log time** đã nhập

**Nguồn:** Epic EMP-02

**Route:** `/(frontend)/time-logs`

**Quyền truy cập:**
- ✅ EMP - Log time và xem của mình
- ✅ PM - Xem log time của team trong project
- ✅ CEO - Xem tất cả log time trong org
- ❌ Guest

---

## 2. PHÂN QUYỀN

### 👤 Employee (EMP)

**Business Rules:**
> "Chỉ khi đối tượng (Task/Subtask) ở trạng thái Hoàn thành (Done) thì mới được phép log time."
> "EMP có quyền tự chuyển trạng thái hoàn thành cho Subtask do mình phụ trách."
> **Nguồn:** Epic EMP-02, Tóm tắt luồng hoạt động

**Permissions:**
- ✅ Log time vào Task Done (không có subtask)
- ✅ Log time vào Subtask Done
- ✅ Xem lịch sử log time của mình
- ✅ Sửa/Xóa log time (khi chưa bị lock)
- ❌ Xem log time của người khác

### 👔 Manager (PM)

- ✅ Xem log time của toàn team trong project
- ✅ Lock/Unlock log time theo chu kỳ

---

## 3. DỮ LIỆU

### 3.1. Database Tables

#### Bảng: `time_logs`
**Nguồn:** Section 3.3.2

| Column | Type | Hiển thị UI? | Ghi chú |
|--------|------|--------------|---------|
| id | uuid | ❌ | PK |
| project_id | uuid | ✅ | Tên project |
| task_id | uuid | ✅ | Tên task |
| subtask_id | uuid | ✅ | Tên subtask (nếu có) |
| owner_user_id | uuid | ✅ | **ABAC ownership** |
| work_date | date | ✅ | Ngày làm việc |
| minutes | int | ✅ | Số phút (>0) |
| note | text | ✅ | Ghi chú |

#### Bảng: `work_period_locks`
**Nguồn:** Section 3.3.1

| Column | Type | Ghi chú |
|--------|------|---------|
| project_id | uuid | Khóa theo dự án |
| period_type | varchar(20) | WEEK, MONTH, QUARTER |
| period_start | date | Ngày bắt đầu chu kỳ |
| period_end | date | Ngày kết thúc chu kỳ |
| is_locked | boolean | Trạng thái khóa |

---

### 3.2. API Endpoints

**GET /api/time-logs**

```typescript
interface TimeLog {
  id: string;
  project: { id: string; name: string };
  task: { id: string; title: string };
  subtask: { id: string; title: string } | null;
  work_date: string;
  minutes: number;
  note: string | null;
  is_locked: boolean;
  created_at: string;
}

interface GetTimeLogsParams {
  date_from?: string;
  date_to?: string;
  project_id?: string;
}
```

**POST /api/time-logs**

```typescript
interface CreateTimeLogRequest {
  task_id: string;
  subtask_id?: string;
  work_date: string;
  minutes: number;
  note?: string;
}
```

---

## 4. BUSINESS RULES

### Rule 1: Chỉ log khi Done
**Nguồn:** Epic EMP-02, Quy tắc Log Time

> "Chỉ khi đối tượng (Task/Subtask) ở trạng thái Hoàn thành (Done) thì mới được phép log time."

**Implementation:**
```sql
-- Validate trước khi insert
SELECT status_code FROM tasks WHERE id = :task_id;
-- Phải là 'DONE'

-- Hoặc nếu log vào subtask
SELECT status_code FROM subtasks WHERE id = :subtask_id;
-- Phải là 'DONE'
```

### Rule 2: Task có Subtask phải log vào Subtask
**Nguồn:** Section 3.3.2 Database Design

> "Nếu Task có Subtask: Bắt buộc log vào Subtask (subtask_id NOT NULL)."
> "Nếu Task không có Subtask: Log trực tiếp vào Task (subtask_id IS NULL)."

### Rule 3: Ownership - chỉ owner sửa/xóa
**Nguồn:** Section 3.3.2 Database Design

> "ABAC: chỉ owner sửa/xóa"

```sql
-- Check trước khi update/delete
SELECT * FROM time_logs 
WHERE id = :log_id AND owner_user_id = :current_user_id;
```

### Rule 4: Không sửa khi bị Lock
**Nguồn:** Section 3.3.1, Epic MNG-04-01

> "Khi PM thực hiện lệnh khóa theo chu kỳ, hệ thống sẽ vô hiệu hóa quyền chỉnh sửa"

**Implementation:**
```sql
-- Check lock trước khi update/delete
SELECT EXISTS (
  SELECT 1 FROM work_period_locks
  WHERE project_id = :project_id
    AND is_locked = TRUE
    AND :work_date BETWEEN period_start AND period_end
) AS is_locked;
```

---

## 5. GIAO DIỆN

### 5.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  ⏱️ Nhật ký thời gian                            │
│             │  ─────────────────────────────────────────────── │
│             │  📅 Tuần: Jan 13 - Jan 19, 2026   [< Prev] [Next >]
│             │                                                   │
│             │  Tổng tuần này: 32h 30m                           │
│             │                                                   │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │ Thứ Hai, 13/01/2026              Tổng: 8h 0m │ │
│             │  │ ┌────────────────────────────────────────┐   │ │
│             │  │ │ Project Alpha | Fix login bug         │   │ │
│             │  │ │ Subtask: Check error logs   4h 30m    │   │ │
│             │  │ │ Note: Đã review toàn bộ logs  [✏️][🗑️]│   │ │
│             │  │ └────────────────────────────────────────┘   │ │
│             │  │ ┌────────────────────────────────────────┐   │ │
│             │  │ │ Project Alpha | Fix login bug         │   │ │
│             │  │ │ Subtask: Fix validation     3h 30m    │   │ │
│             │  │ │ Note: Hoàn thành fix        [✏️][🗑️]│   │ │
│             │  │ └────────────────────────────────────────┘   │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                   │
│             │  ┌──────────────────────────────────────────────┐ │
│             │  │ Thứ Ba, 14/01/2026              Tổng: 7h 0m  │ │
│             │  │ ...                                          │ │
│             │  └──────────────────────────────────────────────┘ │
│             │                                                   │
│             │                               [+ Log Time]        │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 6. LOG TIME FORM

```
┌──────────────────────────────────────────────────────────────┐
│  ⏱️ Ghi nhận thời gian                               [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Task/Subtask *                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Chọn task hoặc subtask đã hoàn thành...         ▼ │     │
│  └────────────────────────────────────────────────────┘     │
│  ⚠️ Chỉ hiển thị Task/Subtask có trạng thái Done            │
│                                                              │
│  Ngày làm việc *                                             │
│  ┌──────────────────┐                                        │
│  │ 📅 13/01/2026    │                                        │
│  └──────────────────┘                                        │
│                                                              │
│  Thời gian *                                                 │
│  ┌────────┐  ┌────────┐                                      │
│  │ 4      │h │ 30     │m                                     │
│  └────────┘  └────────┘                                      │
│                                                              │
│  Ghi chú                                                     │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Mô tả công việc đã làm...                          │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│                                    [Hủy]  [Lưu]              │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. STATES

### 7.1. Loading
- Skeleton list

### 7.2. Empty
```
📭 Chưa có log time nào
Bắt đầu ghi nhận thời gian làm việc!
[+ Log Time]
```

### 7.3. Locked Entry
- Badge 🔒 "Đã khóa"
- Buttons Edit/Delete disabled
- Tooltip: "Chu kỳ đã bị khóa bởi PM"

---

## 8. VALIDATION

| Field | Rule | Error Message |
|-------|------|---------------|
| task_id | Required | "Vui lòng chọn task" |
| work_date | Required | "Vui lòng chọn ngày" |
| work_date | Not future | "Không thể log time cho ngày tương lai" |
| minutes | > 0 | "Thời gian phải lớn hơn 0" |
| minutes | <= 24*60 | "Không thể log quá 24 giờ/ngày" |

---

## 9. RELATED PAGES

```
/time-logs (This page)
  ├─→ /tasks/[id]        (Click task name)
  └─→ /projects/[id]     (Click project name)
```

---

**END OF DOCUMENTATION**
