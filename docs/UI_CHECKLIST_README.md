# 📋 HƯỚNG DẪN FILE EXCEL UI CHECKLIST

> **File**: `docs/UI_CHECKLIST.csv` (mở bằng Excel)
> **Mục đích**: Tracking việc implement UI theo yêu cầu của PM

---

## 📊 CẤU TRÚC FILE EXCEL

File Excel checklist có **10 cột** như sau:

| # | Tên cột | Mô tả | Ví dụ |
|---|---------|-------|-------|
| 1 | **UI Element** | Tên thành phần UI | "Dashboard", "Danh sách Task" |
| 2 | **UI Type** | Loại thành phần | Sidebar Item, Page, Component |
| 3 | **Route/Path** | Đường dẫn URL hoặc file | `/dashboard`, `/tasks/[id]` |
| 4 | **Feature Name** | Mô tả chức năng | "Xem danh sách task được giao" |
| 5 | **User Story ID** | Tham chiếu US ID | "EMP-01-01, MNG-02-01" |
| 6 | **Database Tables** | Bảng DB liên quan | "tasks, task_assignees" |
| 7 | **data-testid** | ID cho Playwright test | "sidebar-tasks", "task-list-page" |
| 8 | **Vai trò** | Ai có quyền truy cập | ALL, MNG, CEO, SYS, ORG |
| 9 | **Status** | Trạng thái implement | ✅ Done, 🔄 In Progress, ❌ Not Started |
| 10 | **Notes** | Ghi chú thêm | "Cần thêm filter", "Mock data" |

---

## 🗂️ CÁC SECTION TRONG FILE

### 1. **SIDEBAR NAVIGATION** (~40 items)
```
=== SIDEBAR NAVIGATION ===
├─ Dashboard
├─ Công việc
│   ├─ Danh sách Task
│   ├─ Kanban Board
│   └─ Tạo Task mới
├─ Dự án
│   ├─ Danh sách Dự án
│   └─ Tạo Dự án mới
├─ Báo cáo
│   ├─ Danh sách Báo cáo
│   └─ Phân tích Chi phí
├─ ...
├─ Admin
│   ├─ Tổ chức
│   ├─ Người dùng
│   └─ ...
```

### 2. **PROJECT DETAIL PAGES** (~15 items)
- Các trang con của `/projects/[id]/...`
- Ví dụ: overview, gantt, documents, quality, cost

### 3. **PROJECT SETTINGS** (~5 items)
- Các trang cài đặt dự án
- Ví dụ: field-permissions, notifications, tags, workflow

### 4. **SPECIAL PAGES** (~6 items)
- Login, Join, Forgot Password, Executive Dashboard

### 5. **COMPONENTS** (~3 items)
- Reusable components: CommentThread, Notification Bell

---

## 📖 CÁCH ĐỌC FILE

### Ví dụ 1: Sidebar Item "Danh sách Task"
```csv
Danh sách Task, Sidebar Item, /tasks, Xem danh sách task, "EMP-01-01, EMP-01-02", "tasks, task_assignees", sidebar-tasks, ALL, ✅ Done
```
Giải thích:
- **UI Element**: "Danh sách Task" - Tên hiển thị trong sidebar
- **Route**: `/tasks` - URL của trang
- **US ID**: EMP-01-01, EMP-01-02 - Tham chiếu User Story
- **Database**: tasks, task_assignees - Bảng DB sử dụng
- **data-testid**: `sidebar-tasks` - ID cho Playwright
- **Vai trò**: ALL - Tất cả users đều thấy

### Ví dụ 2: Project Detail Page
```csv
Chi phí Dự án, Page, /projects/[id]/cost, Phân tích chi phí, CEO-02-02, "time_logs, hr_career_path", project-cost-page, CEO, ✅ Done
```
Giải thích:
- Trang `/projects/[id]/cost`
- Chỉ CEO mới thấy (vai trò = CEO)
- Tham chiếu US ID: CEO-02-02
- Sử dụng data từ bảng `time_logs` và `hr_career_path`

---

## 🔗 MAPPING VỚI 5 TÀI LIỆU

| Cột trong Excel | Lấy từ tài liệu nào |
|-----------------|---------------------|
| User Story ID | `1. Epic - user stories.md` |
| Vai trò | `2.1. Phân quyền Phase 1.md` |
| RBAC/ABAC | `2.2. Phân quyền Phase 2.md` |
| Database Tables | `3.1. Database Design.md` |
| Database Tables | `3.2. Database Design 2.md` |

---

## ✅ CÁCH SỬ DỤNG CHO PLAYWRIGHT

Mỗi UI element có `data-testid` để Playwright có thể find:

```typescript
// Ví dụ test Playwright
test('navigate to tasks page', async ({ page }) => {
  // Click sidebar item
  await page.click('[data-testid="sidebar-tasks"]');
  
  // Verify page loaded
  await expect(page.locator('[data-testid="task-list-page"]')).toBeVisible();
  
  // Check table exists
  await expect(page.locator('[data-testid="tasks-table"]')).toBeVisible();
});
```

---

## 📁 MỞ FILE BẰNG EXCEL

1. Mở file `docs/UI_CHECKLIST.csv` bằng Excel
2. Chọn "Data" → "Text to Columns"
3. Chọn "Delimited" → "Comma"
4. File sẽ hiển thị dạng bảng chuẩn

Hoặc đơn giản: **Double-click file .csv** → Excel tự mở

---

## 📊 THỐNG KÊ NHANH

| Section | Số items | Status |
|---------|----------|--------|
| Sidebar Navigation | 40 | ✅ 100% |
| Project Detail Pages | 15 | ✅ 100% |
| Project Settings | 5 | ✅ 100% |
| Special Pages | 6 | ✅ 100% |
| Components | 3 | ✅ 100% |
| **TỔNG** | **69** | **✅ 100%** |
