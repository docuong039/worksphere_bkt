# KHÓA CHU KỲ LOG TIME (LOCK PERIOD)

## 1. CƠ BẢN

**User Stories được cover:**
- **US-MNG-04-01**: Là PM, tôi muốn **khóa kỳ log time** (tuần/tháng/quý) để chốt dữ liệu và ngăn chỉnh sửa
- **US-MNG-04-02**: Là PM, tôi muốn **mở khóa kỳ** nếu có lý do chính đáng (sửa lỗi nhập liệu)

**Nguồn:** Epic MNG-04

**Route:** `/(frontend)/projects/[id]/time-locks`

**Quyền truy cập:**
- ✅ PM - Full access (lock/unlock)
- ❌ EMP - Không truy cập
- ✅ CEO - View only
- ❌ Guest

---

## 2. DỮ LIỆU

### 2.1. Database Tables

#### Bảng: `work_period_locks`
**Nguồn:** Section 3.3.1

| Column | Type | Ghi chú |
|--------|------|---------|
| id | uuid | PK |
| org_id | uuid | |
| project_id | uuid | |
| period_type | varchar(20) | WEEK, MONTH, QUARTER |
| period_start | date | Ngày bắt đầu chu kỳ |
| period_end | date | Ngày kết thúc chu kỳ |
| is_locked | boolean | Trạng thái khóa |
| locked_at | timestamptz | |
| locked_by | uuid | PM thực hiện |
| unlocked_at | timestamptz | |
| unlocked_by | uuid | |
| unlock_reason | text | Lý do mở khóa |

---

### 2.2. API Endpoints

**GET /api/projects/:id/time-locks**

```typescript
interface WorkPeriodLock {
  id: string;
  period_type: 'WEEK' | 'MONTH' | 'QUARTER';
  period_start: string;
  period_end: string;
  is_locked: boolean;
  locked_at: string | null;
  locked_by: { id: string; full_name: string } | null;
  unlocked_at: string | null;
  unlocked_by: { id: string; full_name: string } | null;
  unlock_reason: string | null;
  total_hours: number;  // Tổng giờ trong kỳ
  entries_count: number;  // Số bản ghi log
}
```

**POST /api/projects/:id/time-locks/:periodId/lock**

**POST /api/projects/:id/time-locks/:periodId/unlock**

```typescript
interface UnlockRequest {
  reason: string;  // Bắt buộc
}
```

---

## 3. GIAO DIỆN

### 3.1. Wireframe Desktop

```
┌─────────────────────────────────────────────────────────────────┐
│  Project Alpha > ⏱️ Khóa Chu Kỳ Log Time                       │
│  ─────────────────────────────────────────────────────────────  │
│  [Week ▼]  [< 2025] [January 2026 ▼] [2027 >]                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                             ││
│  │  Tuần 1       Tuần 2       Tuần 3       Tuần 4              ││
│  │  06-12 Jan    13-19 Jan    20-26 Jan    27 Jan-02 Feb       ││
│  │                                                             ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         ││
│  │  │ 🔒      │  │ 🔒      │  │ 🔓      │  │ ⏳      │         ││
│  │  │ LOCKED  │  │ LOCKED  │  │ UNLOCKED│  │ PENDING │         ││
│  │  │         │  │         │  │         │  │         │         ││
│  │  │ 156h    │  │ 168h    │  │ 120h    │  │ 80h     │         ││
│  │  │ 45 logs │  │ 52 logs │  │ 38 logs │  │ 25 logs │         ││
│  │  │         │  │         │  │         │  │         │         ││
│  │  │ [View]  │  │ [View]  │  │ [View]  │  │ [View]  │         ││
│  │  │ [Unlock]│  │ [Unlock]│  │ [Lock]  │  │ -       │         ││
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Legend:                                                        │
│  🔒 LOCKED - Đã khóa, không thể chỉnh sửa log time              │
│  🔓 UNLOCKED - Có thể chỉnh sửa log time                        │
│  ⏳ PENDING - Chu kỳ hiện tại hoặc tương lai                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. LOCK/UNLOCK DIALOGS

### 4.1. Lock Confirmation

```
┌──────────────────────────────────────────────────────────────┐
│  🔒 Khóa Chu Kỳ                                      [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bạn đang khóa chu kỳ:                                      │
│  📅 Tuần 20-26 Jan 2026                                     │
│                                                              │
│  Thống kê:                                                   │
│  • Tổng giờ: 120 giờ                                        │
│  • Số bản ghi: 38 entries                                   │
│  • Nhân sự: 5 người                                         │
│                                                              │
│  ⚠️ Sau khi khóa, nhân viên sẽ không thể chỉnh sửa         │
│     log time trong khoảng thời gian này.                    │
│                                                              │
│                         [Hủy]  [Xác nhận Khóa]              │
└──────────────────────────────────────────────────────────────┘
```

### 4.2. Unlock Confirmation

```
┌──────────────────────────────────────────────────────────────┐
│  🔓 Mở Khóa Chu Kỳ                                  [X]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Bạn đang mở khóa chu kỳ:                                   │
│  📅 Tuần 13-19 Jan 2026                                     │
│                                                              │
│  Lý do mở khóa (bắt buộc) *                                 │
│  ┌────────────────────────────────────────────────────┐     │
│  │ Nhân viên báo lỗi nhập sai dự án                   │     │
│  └────────────────────────────────────────────────────┘     │
│                                                              │
│  ⚠️ Hành động này sẽ được ghi vào Audit Log.                │
│                                                              │
│                         [Hủy]  [Xác nhận Mở Khóa]           │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. BUSINESS RULES

### Rule 1: Locked period blocks edits
**Nguồn:** Section 13.4 Database Design

> "Check 'locked period' để chặn update time log"

```sql
-- Query check trước khi update/delete time_log
SELECT EXISTS (
  SELECT 1 FROM work_period_locks
  WHERE project_id = :project_id
    AND is_locked = TRUE
    AND :work_date BETWEEN period_start AND period_end
) AS is_locked;

-- Nếu is_locked = TRUE → Reject update
```

### Rule 2: Unlock requires reason
**Nguồn:** Epic MNG-04-02

> "Mở khóa kỳ nếu có lý do chính đáng"

- `unlock_reason` bắt buộc khi unlock
- Ghi vào audit log

### Rule 3: Cannot lock future periods
- Chỉ có thể lock periods đã kết thúc hoặc đang diễn ra
- Cannot lock periods trong tương lai

---

## 6. STATES

### Lock Status:
- 🔒 **LOCKED** - `is_locked = true`
- 🔓 **UNLOCKED** - `is_locked = false` và period đã qua
- ⏳ **PENDING** - Period hiện tại hoặc tương lai

---

## 7. NOTIFICATIONS

Khi PM lock/unlock:
- Gửi notification đến tất cả EMP trong project
- Type: `LOCK_UNLOCK`

---

## 8. RELATED PAGES

```
/projects/[id]/time-locks (This page)
  ├─→ /projects/[id]/overview   (Tab)
  └─→ /time-logs                (View affected logs)
```

---

**END OF DOCUMENTATION**
