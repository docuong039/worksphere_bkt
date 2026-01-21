# THÙNG RÁC (RECYCLE BIN)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-EMP-06-01**: Là nhân viên, tôi muốn **xem danh sách các mục đã xóa** (Subtask, comment) của mình
- **US-EMP-06-02**: Là nhân viên, tôi muốn **khôi phục hoặc xóa vĩnh viễn** các mục trong thùng rác
- **US-MNG-08-01**: Là PM, tôi muốn **xem danh sách các mục đã xóa** (Task, Subtask, Comment) trong dự án
- **US-MNG-08-02**: Là PM, tôi muốn **khôi phục hoặc xóa vĩnh viễn** các mục trong thùng rác
- **US-MNG-08-03**: Là PM, tôi muốn hệ thống **giới hạn thời gian lưu trữ** (30 ngày)
- **US-CEO-06-01**: Là CEO, tôi muốn **xem toàn bộ thùng rác** của công ty
- **US-CEO-06-02**: Là CEO, tôi muốn **khôi phục hoặc xóa vĩnh viễn** các mục
- **US-CEO-06-03**: Là CEO, tôi muốn hệ thống **giới hạn thời gian lưu trữ** (30 ngày)

**Nguồn:** Epic EMP-06, MNG-08, CEO-06

**Route:** `/(frontend)/recycle-bin`

**Quyền truy cập:**
- ✅ EMP - Xem thùng rác của mình
- ✅ PM - Xem thùng rác của project mình quản lý
- ✅ CEO - Xem toàn bộ thùng rác trong org
- ✅ SYS_ADMIN - Xem thùng rác toàn hệ thống
- ❌ Guest

---

## 2. PHÂN QUYỀN

### 👤 Employee (EMP)
- ✅ Xem items mình đã xóa (`deleted_by = current_user`)
- ✅ Khôi phục/Xóa vĩnh viễn subtask của mình
- ❌ Xem items do người khác xóa

### 👔 Manager (PM)
- ✅ Xem items trong projects mình quản lý
- ✅ Khôi phục/Xóa vĩnh viễn tasks, subtasks trong project

### 👨‍💼 CEO
- ✅ Xem tất cả items trong org
- ✅ Khôi phục/Xóa vĩnh viễn bất kỳ item nào

---

## 3. DỮ LIỆU

### 3.1. Database Tables

#### Bảng: `recycle_bin_items`
**Nguồn:** Section 3.8.3

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | PK |
| org_id | uuid | |
| project_id | uuid | Có thể NULL |
| entity_type | varchar(50) | TASK, SUBTASK, PROJECT, etc. |
| entity_id | uuid | ID bản ghi gốc |
| entity_title | varchar(500) | Tiêu đề tại thời điểm xóa |
| deleted_at | timestamptz | Thời điểm xóa |
| deleted_by | uuid | Người xóa |
| original_data | jsonb | Snapshot dữ liệu cũ |

---

### 3.2. Soft Delete Workflow

**Nguồn:** Section 7.3 Database Design

> "Không 'hard delete' các bảng lịch sử: time_logs, reports, audit_logs (cấm)."

Workflow:
1. User xóa item → Set `deleted_at = NOW()` trên bảng gốc
2. Insert record vào `recycle_bin_items`
3. Item trong thùng rác 30 ngày
4. Sau 30 ngày → Hard delete tự động (scheduled job)
5. User có thể hard delete thủ công

---

### 3.3. API Endpoints

**GET /api/recycle-bin**

```typescript
interface RecycleBinItem {
  id: string;
  entity_type: 'TASK' | 'SUBTASK' | 'PROJECT' | 'DOCUMENT';
  entity_id: string;
  entity_title: string;
  deleted_at: string;
  deleted_by: { id: string; full_name: string };
  project: { id: string; name: string } | null;
  days_remaining: number;  // Tính từ 30 ngày
}

interface GetRecycleBinParams {
  entity_type?: string;
  project_id?: string;
  deleted_by?: string;      // PM/CEO only
}
```

**POST /api/recycle-bin/:id/restore**
**DELETE /api/recycle-bin/:id** (Hard delete)
**DELETE /api/recycle-bin/empty** (Empty all)

---

## 4. GIAO DIỆN

### 4.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  [Sidebar]  │  🗑️ Thùng rác                    [Làm trống]    │
│             │  ─────────────────────────────────────────────── │
│             │  [Type ▼] [Project ▼]            ⚠️ Giữ 30 ngày │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ ☐ 📋 Task: Fix login bug                    │  │
│             │  │   Project: Alpha | Xóa bởi: PM Sarah        │  │
│             │  │   Xóa lúc: 15/01/2026 | ⏳ Còn 28 ngày      │  │
│             │  │                          [Khôi phục] [Xóa]  │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ ☐ ☑️ Subtask: Check error logs              │  │
│             │  │   Task: Fix login bug | Xóa bởi: John Doe   │  │
│             │  │   Xóa lúc: 14/01/2026 | ⏳ Còn 27 ngày      │  │
│             │  │                          [Khôi phục] [Xóa]  │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  ┌─────────────────────────────────────────────┐  │
│             │  │ ☐ 📎 Document: requirements.pdf             │  │
│             │  │   Xóa bởi: Jane Smith                       │  │
│             │  │   Xóa lúc: 10/01/2026 | ⏳ Còn 23 ngày      │  │
│             │  │                          [Khôi phục] [Xóa]  │  │
│             │  └─────────────────────────────────────────────┘  │
│             │                                                   │
│             │  Showing 3 of 3 items                             │
└─────────────┴───────────────────────────────────────────────────┘
```

---

## 5. INTERACTIONS

### 5.1. Restore Item
1. Click "Khôi phục"
2. Confirm dialog (optional)
3. API: POST /api/recycle-bin/:id/restore
4. Item biến mất khỏi list
5. Toast: "Đã khôi phục [item name]"

### 5.2. Hard Delete
1. Click "Xóa"
2. Confirm dialog: "Hành động này không thể hoàn tác. Xác nhận xóa vĩnh viễn?"
3. API: DELETE /api/recycle-bin/:id
4. Item biến mất
5. Toast: "Đã xóa vĩnh viễn"

### 5.3. Empty Recycle Bin
1. Click "Làm trống"
2. Confirm dialog: "Xóa vĩnh viễn TẤT CẢ items? Không thể hoàn tác."
3. API: DELETE /api/recycle-bin/empty
4. List empty
5. Toast: "Đã làm trống thùng rác"

### 5.4. Bulk Actions
1. Chọn nhiều items bằng checkbox
2. Hiển thị bulk action bar
3. [Khôi phục đã chọn] [Xóa đã chọn]

---

## 6. RESTORATION RULES

**Nguồn:** Section 9.1 Database Design - FK Cascade

### 6.1. Restore Task
- Restore task record (`deleted_at = NULL`)
- Subtasks của task **KHÔNG** tự động restore
- User phải restore từng subtask riêng

### 6.2. Restore Subtask
- Validate task cha còn tồn tại
- Nếu task đã bị hard delete → Error "Task cha không còn tồn tại"

### 6.3. Restore Project
- Restore project record
- Không restore tasks trong project

---

## 7. STATES

### 7.1. Loading
- Skeleton list

### 7.2. Empty
```
🗑️ Thùng rác trống
Các mục đã xóa sẽ xuất hiện ở đây.
```

### 7.3. Item Expired
- Items < 3 ngày còn lại → Badge đỏ "⚠️ Sắp xóa"

---

## 8. BUSINESS RULES

### Rule 1: 30 Days Retention
**Nguồn:** Epic MNG-08-03, CEO-06-03

> "Hệ thống giới hạn thời gian lưu trữ (30 ngày) trước khi xóa vĩnh viễn."

### Rule 2: Cascade on Hard Delete
**Nguồn:** Section 9.1 Database Design

> "subtasks → tasks: ON DELETE CASCADE"
> "time_logs → tasks: RESTRICT" - Không cho xóa nếu có log time

---

## 9. RELATED PAGES

```
/recycle-bin (This page)
  (Standalone - không navigate đến entity đã xóa)
```

---

**END OF DOCUMENTATION**
