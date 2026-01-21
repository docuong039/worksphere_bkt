# NHẬT KÝ HOẠT ĐỘNG (ACTIVITY)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-04-01**: Là nhân viên, tôi muốn **xem Activity của chính mình theo từng ngày**
- **US-EMP-04-02**: Là nhân viên, tôi muốn Activity hiển thị các sự kiện như **chốt subtask, log time, comment**
- **US-MNG-06-01**: Là PM, tôi muốn **xem Activity của chính mình và toàn bộ EMP trong dự án mà tôi quản lý**
- **US-MNG-06-02**: Là PM, tôi muốn lọc Activity theo **dự án / nhân sự / loại sự kiện**
- **US-CEO-04-01**: Là CEO, tôi muốn **xem Activity của chính mình và toàn bộ nhân viên trong công ty**
- **US-CEO-04-02**: Là CEO, tôi muốn lọc Activity theo **dự án / phòng ban / nhân sự / loại sự kiện**

**Nguồn:** Epic EMP-04, MNG-06, CEO-04

**Route:** `/(frontend)/activity`

**Quyền truy cập:**
- ✅ EMP - Xem activity của mình
- ✅ PM - Xem activity của team trong project
- ✅ CEO - Xem activity toàn công ty
- ❌ Guest

---

## 2. PHÂN QUYỀN

### 👤 Employee (EMP)
- ✅ Xem activity của chính mình
- ❌ Xem activity của người khác

### 👔 Manager (PM)
- ✅ Xem activity của mình
- ✅ Xem activity của EMP trong projects mình quản lý (project scope)
- ✅ Filter theo project/user/event type

### 👨‍💼 CEO
- ✅ Xem activity toàn bộ nhân sự trong org
- ✅ Filter theo project/user/event type

---

## 3. DỮ LIỆU

### 3.1. Database Tables

#### Bảng: `activity_events`
**Nguồn:** Section 3.3.3

| Column | Type | Hiển thị UI? | Ghi chú |
|--------|------|--------------|---------|
| id | uuid | ❌ | PK |
| org_id | uuid | ❌ | Filter |
| project_id | uuid | ✅ | Project liên quan |
| actor_user_id | uuid | ✅ | Người thực hiện |
| activity_date | date | ✅ | Ngày hoạt động |
| occurred_at | timestamptz | ✅ | Thời điểm cụ thể |
| activity_type | varchar(50) | ✅ | Loại sự kiện |
| entity_type | varchar(50) | ✅ | TASK, SUBTASK, etc. |
| entity_id | uuid | ❌ | Link đến entity |
| summary | varchar(500) | ✅ | Mô tả ngắn |
| metadata | jsonb | ❌ | Dữ liệu bổ sung |

---

### 3.2. Activity Types
**Nguồn:** Section 3.3.3

| activity_type | Mô tả | Icon |
|---------------|-------|------|
| TASK_CREATED | Tạo task mới | 📋 |
| TASK_DONE | Hoàn thành task | ✅ |
| SUBTASK_DONE | Hoàn thành subtask | ☑️ |
| LOG_TIME | Ghi nhận thời gian | ⏱️ |
| COMMENT | Bình luận | 💬 |
| REPORT_SUBMITTED | Gửi báo cáo | 📊 |

---

### 3.3. API Endpoints

**GET /api/activity**

```typescript
interface ActivityEvent {
  id: string;
  actor: { id: string; full_name: string; avatar_url: string };
  project: { id: string; name: string } | null;
  activity_date: string;
  occurred_at: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  summary: string;
}

interface GetActivityParams {
  date_from?: string;
  date_to?: string;
  project_id?: string;
  user_id?: string;        // PM/CEO only
  activity_type?: string;
}
```

---

## 4. GIAO DIỆN

### 4.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  📰 Nhật ký hoạt động                            │
│             │  ─────────────────────────────────────────────── │
│             │  [📅 Jan 13-19] [Project ▼] [User ▼] [Type ▼]    │
│             │                                                   │
│             │  ─────────── Thứ Sáu, 17/01/2026 ───────────     │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ [Avatar] John Doe              17:30        │  │
│             │  │ ✅ Hoàn thành task "Fix login bug"          │  │
│             │  │ 📁 Project Alpha                            │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ [Avatar] John Doe              16:00        │  │
│             │  │ ⏱️ Log 4h 30m vào subtask "Fix validation"  │  │
│             │  │ 📁 Project Alpha                            │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ [Avatar] Jane Smith            14:20        │  │
│             │  │ 💬 Comment trên task "Update docs"          │  │
│             │  │ 📁 Project Beta                             │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ─────────── Thứ Năm, 16/01/2026 ───────────     │
│             │  ...                                              │
│             │                                                   │
│             │  [Load more...]                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 5. ACTIVITY ITEM TEMPLATE

```
┌─────────────────────────────────────────────────────────────┐
│ [Avatar] {actor_name}                      {time}           │
│ {icon} {summary}                                            │
│ 📁 {project_name}                  [View →] (optional)      │
└─────────────────────────────────────────────────────────────┘
```

Ví dụ:
- ✅ John Doe **hoàn thành task** "Fix login bug"
- ⏱️ John Doe **log 4h 30m** vào subtask "Fix validation"
- 💬 Jane Smith **comment** trên task "Update docs"

---

## 6. FILTERS (PM/CEO)

### 6.1. Filter by Date Range
- Date picker range
- Quick options: Today, This week, This month

### 6.2. Filter by Project
- Dropdown với projects trong scope
- PM: projects mình quản lý
- CEO: tất cả projects

### 6.3. Filter by User
- Multi-select users
- PM: users trong project
- CEO: tất cả users trong org

### 6.4. Filter by Activity Type
- Checkboxes: Task Done, Subtask Done, Log Time, Comment, Report

---

## 7. STATES

### 7.1. Loading
- Skeleton list

### 7.2. Empty
```
📭 Không có hoạt động nào
(trong khoảng thời gian đã chọn)
```

### 7.3. Empty with filters
```
🔍 Không tìm thấy kết quả
[Clear Filters]
```

---

## 8. INTERACTIONS

### 8.1. Click on Activity Item
→ Navigate to entity detail (task, report, etc.)

### 8.2. Infinite Scroll
- Load more khi scroll đến cuối
- 20 items mỗi lần load

### 8.3. Real-time Updates
- WebSocket hoặc polling 30s
- New items xuất hiện ở đầu

---

## 9. RELATED PAGES

```
/activity (This page)
  ├─→ /tasks/[id]        (Click task activity)
  ├─→ /reports/[id]      (Click report activity)
  └─→ /projects/[id]     (Click project name)
```

---

**END OF DOCUMENTATION**
