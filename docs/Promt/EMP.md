# ✅ EMPLOYEE (EMP) - FRONTEND AUDIT CHECKLIST

> **Mục đích**: Kiểm tra source code FE hiện tại đã implement đủ features cho vai trò Nhân viên (EMP) chưa
> **Cách dùng**: Đối chiếu từng mục với code của bạn, đánh dấu ✅ (có) hoặc ❌ (thiếu)
> **Dựa trên**: 
> 1. Epic - user stories.md
> 2.1. PHÂN RÃ & CHUẨN HÓA QUYỀN phase 1.md
> 2.2. RBAC Policy Governance phase 2.md
> 3.1. Database Design.md
> 3.2. Database Design 2.md

---

## 📋 THÔNG TIN VAI TRÒ

**Nhân viên (Employee - EMP)**
- **Scope**: ASSIGNED (Chỉ các task được gán hoặc subtask tự tạo)
- **Quyền hạn**: Thực thi công việc, log time, báo cáo progress.
- **Ràng buộc chính**:
  - Không được sửa Task chính (trừ các trường được PM phân quyền).
  - Chỉ được Log time khi Task/Subtask ở trạng thái DONE.
  - Chỉ được Log time/Sửa dữ liệu nếu kỳ làm việc chưa bị khóa.
  - Toàn quyền CRUD trên Subtask do mình tạo.

---

## 🔐 Epic EMP-00: Xác thực & Truy cập (Authentication)

### US-EMP-00-01: Đăng nhập
- [x] **Login Page**: ✅
  - [x] Input Email, Password
  - [x] Redirect về Dashboard cá nhân sau khi login
  - [x] Check role `EMPLOYEE`

### US-EMP-00-02: Đăng xuất
- [x] Clear auth state & redirect login ✅

### US-EMP-00-03: Khôi phục mật khẩu
- [x] Gửi email yêu cầu reset pass ✅

---

## 📁 Epic EMP-01: Quản lý công việc cá nhân

### US-EMP-01-01: Xem danh sách task được giao
- [x] Trang `/tasks`: ✅
  - [x] Chỉ hiển thị task user được assign hoặc thuộc dự án user làm member.
  - [x] Hiển thị thông tin cơ bản: Tên, Dự án, Status, Priority, Due Date.

### US-EMP-01-02: Tìm kiếm và lọc task
- [x] Filter theo: Trạng thái, Độ ưu tiên, Custom Fields. ✅
- [x] Search theo tên task. ✅

### US-EMP-01-03: Thêm subtask (đầu việc con)
- [x] Nút "Thêm subtask" trong chi tiết task. ✅
- [x] Input: Tên, Start Date, End Date. ✅
- [x] Logic: Chỉ cho phép add nếu Project không bị khóa. ✅

### US-EMP-01-04: Chỉnh sửa hoặc xóa subtask do mình tạo
- [x] Check ownership: `created_by == ME`. ✅
- [x] Chặn sửa/xóa nếu Project bị khóa. ✅

### US-EMP-01-05: Chuyển trạng thái subtask
- [x] Chuyển To Do -> In Progress -> Done. ✅
- [x] Task chính chỉ PM mới được chốt Done. ✅

### US-EMP-01-06: Đính kèm file/tài liệu
- [x] Upload file vào Task/Subtask. ✅
- [x] Preview/Download file đính kèm. ✅

### US-EMP-01-07..09: Bình luận và thảo luận
- [x] Comment Thread (trả lời bình luận). ✅ (Implemented feed UI)
- [x] Mention `@username` (chỉ những người trong project). ✅ (UI Input placeholder)
- [x] Thông báo khi bị tag. ✅

### US-EMP-01-10: Sắp xếp thứ tự các subtask
- [x] Nút bấm (Up/Down) để thay đổi thứ tự `sort_order` của subtask. ✅

### US-EMP-01-11: Sửa các trường được phân quyền trong task
- [x] UI cho phép sửa các field cụ thể (ví dụ: mô tả) nếu PM cấu hình trong `project_field_user_permissions`. ✅

---

## ⏳ Epic EMP-02: Ghi nhận thời gian & Tiến độ

### US-EMP-02-01 & 02: Log time Task & Subtask
- [x] Modal Log time: ✅
  - [x] Chọn Task/Subtask (chỉ hiện các item có status `DONE`).
  - [x] Nhập số phút/giờ.
  - [x] Chọn ngày (không cho phép tương lai).
  - [x] Chặn log nếu đã bị khóa kỳ.

### US-EMP-02-03: Xem lịch sử log time
- [x] Hiển thị danh sách log time cá nhân (Ngày, Task, Thời gian, Note). ✅

### US-EMP-02-04: Sửa/Xóa log time
- [x] Chỉ cho phép sửa/xóa log của chính mình (`owner_user_id == ME`). ✅
- [x] Chặn nếu kỳ đã lock. ✅

---

## 📊 Epic EMP-03: Báo cáo định kỳ & Phản hồi

### US-EMP-03-01: Tạo và gửi báo cáo (tuần/tháng)
- [x] Trang `/reports`: ✅
  - [x] Form chọn loại báo cáo.
  - [x] Soạn thảo nội dung báo cáo.
  - [x] Gửi báo cáo.

### US-EMP-03-02: Xem/Xuất lịch sử báo cáo
- [x] Danh sách báo cáo cá nhân. ✅
- [x] Chức năng Export (CSV). ✅

### US-EMP-03-03: Xem nhận xét của MNG/CEO
- [x] Hiển thị comment và reaction trên báo cáo đã gửi. ✅
- [x] Lọc báo cáo theo loại (Daily, Weekly, Monthly) và trạng thái. ✅

---

## 🕒 Epic EMP-04: Activity (Nhật ký hoạt động)

### US-EMP-04-01 & 02: Nhật ký cá nhân
- [x] Trang `/activity`: ✅
  - [x] Hiển thị dòng thời gian hoạt động của chính mình.
  - [x] Các sự kiện: Chốt subtask, Log time, Comment.

---

## 🔔 Epic EMP-05: Thông báo (Notifications)

### US-EMP-05-01..04: Quản lý thông báo
- [x] Notification Panel trong Navbar: ✅
  - [x] Hiển thị danh sách thông báo Real-time (mocked).
  - [x] Phân loại theo Task, Report, System.
  - [x] Đánh dấu đã đọc/Đọc tất cả.
  - [x] Điều hướng tới item liên quan.

---

## 🗑️ Epic EMP-06: Thùng rác cá nhân
- [x] Trang `/recycle-bin`: ✅
  - [x] Hiển thị subtask, time log đã xóa mềm.
  - [x] Nút Restore.

---

## 📌 Epic EMP-07: Quản lý Task cá nhân (Personal Tasks)
- [x] Trang `/personal-board`: ✅
  - [x] Kanban cá nhân riêng tư.
  - [x] Kéo thả trạng thái.

---

## 🛡️ RÀO CHẮN RBAC/ABAC (Technical Check)

| Feature | Middlewares / API Logic | Status |
| :--- | :--- | :--- |
| **Org Isolation** | `org_id` luôn được inject vào mọi query (RLS Sim)/Middleware. | [x] |
| **Ownership** | Check `created_by` hoặc `user_id` cho Subtask/Log/Report. | [x] |
| **Work Lock** | Check `work_period_locks` (Work Integrity) trước Mutation. | [x] |
| **Field Level** | Check `project_field_user_permissions` cho Task Update. | [x] |
| **Status Constraint**| Chặn Log Time nếu `status_code !== 'DONE'`. | [x] |
| **Lifecycle** | Member Status === 'ACTIVE' mới được thao tác. | [x] |
| **Data Integrity** | Dùng `row_version` (Optimistic Locking) cho Task/Log. | [x] |
| **Soft Delete** | Mọi lệnh Delete dùng Soft-delete (Recycle Bin). | [x] |