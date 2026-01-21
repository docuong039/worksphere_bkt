# ✅ PROJECT MANAGER (MNG) - FRONTEND AUDIT CHECKLIST

> **Mục đích**: Kiểm tra source code FE hiện tại đã implement đủ features cho vai trò PM chưa
> **Dựa trên**: 
> 1. Epic - user stories.md (Epic MNG-00 đến MNG-10)
> 2. PHÂN RÃ & CHUẨN HÓA QUYỀN phase 1.md
> 3. RBAC Policy Governance phase 2.md

---

## 📋 THÔNG TIN VAI TRÒ

**Project Manager (MNG)**
- **Scope**: PROJECT (Tất cả task/member trong dự án mình quản lý)
- **Quyền hạn**: Điều phối dự án, tạo task, assign, khóa kỳ, phản hồi báo cáo.
- **Ràng buộc chính**:
  - Chỉ quản lý các dự án mà mình là PM.
  - Có quyền chốt Task Done.
  - Có quyền khóa/mở khóa kỳ làm việc.
  - Có quyền phân quyền field-level cho EMP.

---

## 🔐 Epic MNG-00: Xác thực & Truy cập

### US-MNG-00-01..03: Authentication
- [x] Login/Logout/Forgot Password ✅ (Dùng chung với EMP)

---

## 📁 Epic MNG-01: Quản lý Dự án & Phân công

### US-MNG-01-01: Tạo/Cập nhật Project
- [x] Trang `/projects/new`: ✅
  - [x] Form tạo dự án với tên, mô tả, ngày bắt đầu/kết thúc.
  - [x] Chọn thành viên ban đầu.
  - [x] Redirect về danh sách sau khi tạo.

### US-MNG-01-02: Tạo Task & Assign
- [x] Trang `/tasks/new`: ✅
  - [x] Form tạo task với title, description, priority.
  - [x] Chọn project.
  - [x] Gán nhiều người (Multi-select).

### US-MNG-01-03: Gắn Tag/Priority
- [x] Select priority trong form tạo task. ✅
- [ ] Tag management UI. ❌ (Chưa có UI quản lý tag)

### US-MNG-01-04: Chuyển trạng thái Task (Chốt Done)
- [x] Status dropdown trong Task Detail. ✅
- [x] Chỉ PM mới thấy option chuyển Done. ✅

### US-MNG-01-05: Theo dõi Test/Fix lỗi
- [x] Trang `/projects/[id]/quality`: ✅
  - [x] Hiển thị thống kê Bug.
  - [x] Danh sách Bug với severity.

### US-MNG-01-06: Đính kèm tài liệu
- [x] UI Upload component có. ⚠️ (Logic upload chưa hoàn chỉnh)

### US-MNG-01-07..09: Comment & Thread
- [x] Comment section trong Task Detail. ✅
- [ ] Tag @username. ⚠️ (Placeholder)
- [ ] Reply to comment (Thread). ❌

### US-MNG-01-10: Custom Fields
- [x] API `/api/projects/:id/custom-fields`. ✅
- [ ] UI hiển thị/chỉnh sửa custom field values. ❌

### US-MNG-01-11: Tìm kiếm/Lọc toàn bộ
- [x] Filter component với Status, Priority, Search. ✅

### US-MNG-01-12: Export Excel
- [x] Trang `/projects/[id]/import-export`. ✅
- [x] Nút Export với mock logic.

### US-MNG-01-13: Field-level Permissions
- [x] Trang `/projects/[id]/settings/field-permissions`: ✅
  - [x] Ma trận User vs Field.
  - [x] Toggle quyền từng field.

### US-MNG-01-14: Sắp xếp Task
- [ ] Drag-drop reorder. ❌
- [x] `sort_order` field có trong DB design. ✅

### US-MNG-01-15: Import Excel
- [x] Trang `/projects/[id]/import-export`. ✅
- [x] Upload và preview.

---

## 📊 Epic MNG-02: Dashboard Giám sát

### US-MNG-02-01: Dashboard Project
- [x] Trang `/projects/[id]/overview`: ✅
  - [x] Thống kê task by status.
  - [x] Completion rate.
  - [x] Overdue count.

### US-MNG-02-02: Thống kê theo nhân sự
- [x] Table `by_member` trong Overview. ⚠️ (Cơ bản)
- [ ] Chart visualization. ❌

---

## 💰 Epic MNG-03: Tài nguyên & Chi phí

### US-MNG-03-01: Hồ sơ nhân sự
- [x] Trang `/hr-management`: ✅
  - [x] Danh sách nhân sự với level.

### US-MNG-03-02: Cập nhật Level/Lương
- [x] API `/api/hr/career-path/:userId`. ✅
- [ ] UI nâng cấp bậc. ⚠️ (Cơ bản)

### US-MNG-03-03: Báo cáo chi phí
- [x] API `/api/hr/project-costs`. ✅
- [ ] Chart chi phí. ⚠️ (Hiển thị table)

---

## 🔒 Epic MNG-04: Kiểm soát Chu kỳ

### US-MNG-04-01: Khóa kỳ
- [x] Trang `/projects/[id]/time-locks`: ✅
  - [x] Danh sách lock periods.
  - [x] Nút tạo lock mới.

### US-MNG-04-02: Mở khóa
- [x] Toggle button Unlock. ✅

### US-MNG-04-03: Phản hồi báo cáo
- [x] Trang `/reports/[id]`: ✅
  - [x] Xem chi tiết báo cáo.
  - [x] Comment chỉ đạo.
  - [x] Reaction buttons.

---

## 📂 Epic MNG-05: Tài sản & Quy trình

### US-MNG-05-01..04: Quản lý tài liệu/Git/Deploy
- [x] Trang `/projects/[id]/documents`: ⚠️
  - [x] Upload tài liệu.
  - [ ] Phân loại Resource type (GIT, DEPLOY, DOC). ❌
  - [ ] Share với user cụ thể. ❌

---

## 📜 Epic MNG-06: Activity dự án
- [x] Trang `/activity`: ✅
  - [x] Filter theo project.
  - [x] Filter theo user.
  - [x] Filter theo loại sự kiện.

---

## 🔔 Epic MNG-07: Thông báo

### US-MNG-07-01..02: Nhận thông báo
- [x] Notification Panel trong Navbar. ✅

### US-MNG-07-03: Cấu hình bật/tắt
- [ ] UI cấu hình notification per project. ❌
- [x] DB table `project_notification_settings` có trong design. ✅

---

## 🗑️ Epic MNG-08: Thùng rác dự án

### US-MNG-08-01..03: Quản trị Recycle Bin
- [x] Trang `/recycle-bin`: ⚠️
  - [x] Xem items đã xóa.
  - [x] Restore button.
  - [ ] Filter theo project. ❌
  - [ ] Xóa vĩnh viễn. ❌

---

## 📈 Epic MNG-09: Gantt Chart

### US-MNG-09-01..05: Biểu đồ Gantt
- [x] Trang `/projects/[id]/gantt`: ✅
  - [x] Timeline view.
  - [ ] Scale switch (Day/Week/Month). ⚠️
  - [ ] Filter theo user/status. ❌

---

## 📌 Epic MNG-10: Personal Tasks
- [x] Trang `/personal-board`: ✅
  - [x] Kanban cá nhân.
  - [x] Hoàn toàn riêng tư.

---

## 🛡️ RÀO CHẮN RBAC/ABAC (Technical Check)

| Feature | Implementation | Status |
| :--- | :--- | :--- |
| **Project Scope** | PM chỉ thấy task trong project mình quản lý. | [x] |
| **Task Status Control** | PM mới được chốt Done. | [x] |
| **Lock/Unlock** | Check `work_period_locks`. | [x] |
| **Field Permission** | Config via `/field-permissions`. | [x] |
| **View Salary** | Permission `VIEW_SALARY` check. | [x] |
| **Project Notification** | Per-project config. | [ ] |

---

## 📊 THỐNG KÊ

| Mục | Đã implement | Thiếu | Coverage |
|-----|--------------|-------|----------|
| Epic MNG-01 | 12/15 | 3 | 80% |
| Epic MNG-02 | 1.5/2 | 0.5 | 75% |
| Epic MNG-03 | 2/3 | 1 | 67% |
| Epic MNG-04 | 3/3 | 0 | 100% |
| Epic MNG-05 | 1/4 | 3 | 25% |
| Epic MNG-06 | 1/1 | 0 | 100% |
| Epic MNG-07 | 1/3 | 2 | 33% |
| Epic MNG-08 | 2/3 | 1 | 67% |
| Epic MNG-09 | 2/5 | 3 | 40% |
| Epic MNG-10 | 1/1 | 0 | 100% |
| **TỔNG** | **26.5/40** | **13.5** | **~66%** |

---

## ❌ CẦN BỔ SUNG (Ưu tiên)

1. **Tag Management UI** - CRUD tags cho dự án
2. **Comment Threading** - Reply to comment
3. **Custom Field Values UI** - Hiển thị/Edit giá trị
4. **Project Resource Types** - GIT, DEPLOY, DOC phân loại
5. **Notification Settings per Project** - Bật/tắt theo project
6. **Gantt Filters** - Filter theo user/status
7. **Task Drag-Drop Reorder** - Sắp xếp bằng kéo thả
