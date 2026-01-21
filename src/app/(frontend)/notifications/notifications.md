# THÔNG BÁO (NOTIFICATIONS)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-05-01**: Là nhân viên, tôi muốn **nhận thông báo** khi tôi được **gán vào một Task**
- **US-EMP-05-02**: Là nhân viên, tôi muốn **nhận thông báo** khi PM/MNG **chốt Task Done** hoặc **mở khóa/khóa kỳ**
- **US-EMP-05-03**: Là nhân viên, tôi muốn **nhận thông báo** khi có **comment** trên Task/Subtask của tôi
- **US-EMP-05-04**: Là nhân viên, tôi muốn **xem danh sách thông báo** theo trạng thái **chưa đọc/đã đọc**
- **US-MNG-07-01**: Là PM, tôi muốn nhận thông báo khi **EMP hoàn thành Subtask** hoặc có **log time**
- **US-MNG-07-02**: Là PM, tôi muốn nhận thông báo khi **EMP comment/báo vấn đề**
- **US-MNG-07-03**: Là PM, tôi muốn cấu hình **bật/tắt** một số loại thông báo theo dự án

**Nguồn:** Epic EMP-05, MNG-07, CEO-05

**Route:** `/(frontend)/notifications`

**Quyền truy cập:**
- ✅ All authenticated users
- ❌ Guest

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `notifications`
**Nguồn:** Section 3.3.4

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | PK |
| org_id | uuid | |
| project_id | uuid | Có thể NULL |
| notification_type | varchar(50) | Loại thông báo |
| title | varchar(255) | Tiêu đề |
| body | text | Nội dung |
| entity_type | varchar(50) | TASK, SUBTASK, REPORT |
| entity_id | uuid | Link đến entity |
| actor_user_id | uuid | Người tạo event |
| created_at | timestamptz | |

#### Bảng: `notification_recipients`
**Nguồn:** Section 3.3.4

| Column | Type | Ghi chú |
|--------|------|---------|
| notification_id | uuid | FK |
| user_id | uuid | FK |
| is_read | boolean | ✅ Quan trọng |
| read_at | timestamptz | |

---

### 2.2. Notification Types
**Nguồn:** Section 3.3.4

| Type | Mô tả | Người nhận |
|------|-------|------------|
| TASK_ASSIGNED | Được gán task mới | EMP |
| TASK_DONE | Task được chốt Done | EMP |
| SUBTASK_DONE | Subtask hoàn thành | PM |
| LOG_TIME | Có log time mới | PM |
| COMMENT | Comment mới | Assignees |
| MENTION | Được tag @username | Mentioned user |
| LOCK_UNLOCK | Kỳ bị khóa/mở khóa | All EMP in project |
| REPORT_SUBMITTED | Báo cáo mới được gửi | PM, CEO |

---

### 2.3. API Endpoints

**GET /api/notifications**

```typescript
interface Notification {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  entity_type: string;
  entity_id: string;
  actor: { id: string; full_name: string; avatar_url: string } | null;
  project: { id: string; name: string } | null;
  is_read: boolean;
  created_at: string;
}

interface GetNotificationsParams {
  is_read?: boolean;
  limit?: number;
  offset?: number;
}

interface GetNotificationsResponse {
  data: Notification[];
  unread_count: number;
  total: number;
}
```

**PUT /api/notifications/:id/read**
**PUT /api/notifications/mark-all-read**

---

## 3. GIAO DIỆN

### 3.1. Notification Bell (Header)

```
┌──────────────────────────────────────────┐
│                                   🔔 3   │  ← Badge với số unread
│                                    │     │
│                                    ▼     │
│  ┌──────────────────────────────────┐    │
│  │ 🔔 Thông báo            [✓ All] │    │
│  ├──────────────────────────────────┤    │
│  │ ● [Avatar] PM Sarah    2m ago   │    │  ← ● = unread
│  │   Gán bạn vào task "Fix bug"    │    │
│  │                                  │    │
│  │ ● [Avatar] Jane        15m ago  │    │
│  │   Comment: "@you check này..."  │    │
│  │                                  │    │
│  │ ○ [Avatar] System      1h ago   │    │  ← ○ = read
│  │   Task "Update docs" đã Done    │    │
│  ├──────────────────────────────────┤    │
│  │      [Xem tất cả thông báo]     │    │
│  └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

### 3.2. Notifications Page

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  🔔 Thông báo                   [✓ Đánh dấu tất cả]
│             │  ─────────────────────────────────────────────── │
│             │  [All] [Unread (3)]                              │
│             │                                                   │
│             │  ─────────── Hôm nay ───────────                 │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ ● [Avatar] PM Sarah              2 phút     │  │
│             │  │   📋 Gán bạn vào task "Fix login bug"       │  │
│             │  │   Dự án: Project Alpha                      │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ ● [Avatar] Jane Smith           15 phút     │  │
│             │  │   💬 "@JohnDoe xem lại phần validation"     │  │
│             │  │   Task: Fix login bug                       │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ─────────── Hôm qua ───────────                 │
│             │  ...                                              │
│             │                                                   │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 4. NOTIFICATION ITEM

```
┌─────────────────────────────────────────────────────────────┐
│ ● [Avatar] {actor_name}                    {time_ago}       │  ← ● = unread
│ {icon} {title}                                              │
│ {body}                                                      │
│ (Project: {project_name}) (optional)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. INTERACTIONS

### 5.1. Click on Notification
1. Mark as read (`is_read = true`)
2. Navigate to entity (task, report, etc.)

### 5.2. Mark All as Read
1. Click "✓ Đánh dấu tất cả"
2. API call: PUT /api/notifications/mark-all-read
3. Update badge to 0

### 5.3. Filter Unread
1. Click tab "Unread"
2. Filter only `is_read = false`

---

## 6. NOTIFICATION SETTINGS

**Nguồn:** Epic MNG-07-03

PM có thể bật/tắt thông báo theo project:

```
┌──────────────────────────────────────────────────────────────┐
│  ⚙️ Cài đặt Thông báo - Project Alpha                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ☑️ Subtask hoàn thành                                       │
│  ☑️ Log time mới                                             │
│  ☑️ Comment mới                                              │
│  ☐ Lock/Unlock period                                        │
│                                                              │
│                                    [Lưu]                     │
└──────────────────────────────────────────────────────────────┘
```

**Nguồn:** Section 3.3.5 (`project_notification_settings`)

---

## 7. STATES

### 7.1. Loading
- Skeleton items

### 7.2. Empty
```
🔔 Không có thông báo mới
Bạn sẽ nhận được thông báo khi có hoạt động liên quan.
```

### 7.3. All Read
- Badge ẩn hoặc hiển thị 0
- Tab "Unread" hiển thị empty

---

## 8. REAL-TIME UPDATES

- WebSocket connection để nhận notifications mới
- Animation khi có notification mới
- Sound notification (optional, configurable)

---

## 9. RELATED PAGES

```
/notifications (This page)
  ├─→ /tasks/[id]        (Click task notification)
  ├─→ /reports/[id]      (Click report notification)
  └─→ /settings          (Notification settings)
```

---

**END OF DOCUMENTATION**
