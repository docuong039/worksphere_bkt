Dựa trên 5 tài liệu đã cung cấp, dưới đây là danh sách phân rã **100% đầy đủ** về Giao diện, Chức năng và Logic nghiệp vụ trong **Trang Dự án** dành riêng cho vai trò **Project Manager (PM/MNG)**.

Tôi sẽ chia theo các phân vùng (Zones) trên giao diện để bạn dễ hình dung và triển khai.

---

### PHÂN VÙNG 1: HEADER & DASHBOARD DỰ ÁN (Tổng quan)

**Giao diện & Chức năng:**
1.  **Thông tin dự án:**
    *   Hiển thị: Tên dự án, Mô tả, Mã dự án (Code), Trạng thái (Active/Archived).
    *   Hành động: **Chỉnh sửa (Update)** thông tin dự án.
2.  **Dashboard thống kê (Mini-Dashboard):**
    *   Hiển thị % hoàn thành của dự án.
    *   Thống kê chi tiết theo nhân sự: Tỉ lệ hoàn thành, số lượng task trễ hạn.
    *   Hiển thị trạng thái Test và Fix lỗi (Bug tracking).
3.  **Thanh công cụ (Toolbar):**
    *   Bộ lọc (Filter): Lọc theo Nhân sự, Trạng thái, Độ ưu tiên, Custom Fields.
    *   Sắp xếp (Sort): Sắp xếp thứ tự ưu tiên Task.
    *   Tìm kiếm (Search): Tìm kiếm toàn bộ Task trong dự án.

**Logic nghiệp vụ:**
*   **Phạm vi (Scope):** Dữ liệu hiển thị được lọc cứng theo `project_id = Managed Project` (Dự án mà PM được phân công quản lý).
*   **Quyền hạn:** PM có quyền chỉnh sửa thông tin dự án, trong khi Member chỉ được xem.

---

### PHÂN VÙNG 2: QUẢN LÝ CÔNG VIỆC (TASK MANAGEMENT - CORE)

Đây là khu vực làm việc chính (dạng List hoặc Kanban).

**Giao diện & Chức năng:**
1.  **Thao tác với Task (Công việc chính):**
    *   **Tạo mới (Create):** Nhập tiêu đề, mô tả (Rich Text), chọn loại task (Task, Bug, Feature).
    *   **Gán (Assign):** Chọn nhân sự thực hiện (hỗ trợ gán **nhiều người** cho 1 Task).
    *   **Thuộc tính:** Thiết lập Độ ưu tiên (Priority), Ngày bắt đầu, Hạn chót (Due date), Gắn thẻ (Tags).
    *   **Đính kèm (Attachment):** Upload file tài liệu/đầu bài vào Task.
    *   **Chuyển trạng thái:** Kéo thả hoặc chọn trạng thái (To Do -> In Progress -> Done).
2.  **Quản lý Subtask (Đầu việc con):**
    *   Xem danh sách Subtask dưới Task cha.
    *   PM nắm quyền quản lý chung qua Task cha, nhưng quyền sửa/xóa Subtask thuộc về người tạo (EMP).
3.  **Tương tác & Thảo luận (Social):**
    *   **Comment:** Viết bình luận chỉ đạo, Tag (@mention) thành viên.
    *   **Thread:** Xem các cuộc hội thoại dạng luồng (Thread).
4.  **Các tính năng nâng cao (Advanced):**
    *   **Custom Fields:** Tạo thêm trường dữ liệu tùy chỉnh cho dự án (Text, Number, Date, Select).
    *   **Phân quyền trường (Field-level Permission):** Giao diện ma trận để chỉ định User nào sửa trường nào (VD: User A sửa 'Mô tả', User B sửa 'Custom Field X').
    *   **Import/Export:**
        *   Nút **Export Excel**: Xuất danh sách Task (chọn trường thông tin cần xuất).
        *   Nút **Import Excel**: Nhập Task từ file (bao gồm cả Custom Fields).

**Logic nghiệp vụ:**
*   **Quyền chốt trạng thái (Status Rule):** Chỉ PM/MNG mới có quyền chuyển Task chính sang **Done**. Nhân viên không có quyền tự chốt Task chính.
*   **Logic Log Time:** Task phải ở trạng thái **Done** thì nhân viên mới được Log time (đối với Task không có subtask).
*   **Import Constraint:** Khi Import, tên cột trong file Excel phải trùng khớp với tên Custom Fields đã tạo trên phần mềm trước đó.
*   **Concurrency (Đồng thời):** Sử dụng cơ chế *Optimistic Locking* (dựa trên `row_version`). Nếu 2 người cùng sửa 1 task, người lưu sau sẽ bị từ chối và yêu cầu tải lại.

---

### PHÂN VÙNG 3: BIỂU ĐỒ GANTT (TIẾN ĐỘ)

**Giao diện & Chức năng:**
1.  **Hiển thị:**
    *   Trục Y: Danh sách Task và Subtask.
    *   Trục X: Thời gian (Ngày, Tuần, Tháng, Quý) - PM có thể thay đổi view này.
    *   Thanh Gantt: Hiển thị điểm bắt đầu, điểm kết thúc, độ dài (duration).
2.  **Lọc dữ liệu:** Lọc biểu đồ theo Nhân sự hoặc Trạng thái.

**Logic nghiệp vụ:**
*   Dữ liệu Gantt được tổng hợp từ `start_date` và `due_date` của Task/Subtask trong dự án đó.

---

### PHÂN VÙNG 4: TÀI NGUYÊN & KỸ THUẬT (RESOURCES)

**Giao diện & Chức năng:**
1.  **Quản lý Tài liệu (Assets):** Upload, xem, tải xuống các tài liệu, form mẫu dùng chung.
2.  **Quản lý Tài nguyên kỹ thuật:**
    *   Lưu trữ và chia sẻ Link Source Code (Git).
    *   Thông tin Deploy (Môi trường, phiên bản).
    *   Link tài liệu quy trình/Sheet dữ liệu.
    *   Chia sẻ tài nguyên cụ thể cho User.

**Logic nghiệp vụ:**
*   Quyền hạn trên Resource: PM có quyền `CREATE`, `UPDATE`, `SHARE` trong phạm vi dự án.

---

### PHÂN VÙNG 5: NHÂN SỰ & TÀI CHÍNH (MEMBERS & COST)

**Giao diện & Chức năng:**
1.  **Danh sách thành viên:** Xem danh sách nhân sự trong dự án, vai trò (Role) của họ.
2.  **Hồ sơ nhân sự:** Xem thông tin hồ sơ (Background) của member.
3.  **Quản lý Lương/Cost (Nếu có quyền):**
    *   Cập nhật bậc (Level) và Mức lương/Cost-rate cho nhân sự.
    *   **Báo cáo chi phí:** Xem tổng chi phí dự án = (Time log) x (Cost-rate).

**Logic nghiệp vụ:**
*   **Bảo mật lương:** PM chỉ xem/sửa được lương nếu có Permission đặc biệt `VIEW_SALARY` hoặc `COMPENSATION.READ/UPDATE`.
*   **Tính toán chi phí:** Dựa trên cơ chế *Effective Dating* (lương theo khoảng thời gian hiệu lực) trong bảng `employee_compensations`.

---

### PHÂN VÙNG 6: KIỂM SOÁT & CẤU HÌNH (GOVERNANCE)

**Giao diện & Chức năng:**
1.  **Khóa kỳ làm việc (Lock Period):**
    *   Nút **Khóa (Lock)**: Chọn kỳ (Tuần/Tháng/Quý) để khóa toàn bộ Task và Log time.
    *   Nút **Mở khóa (Unlock)**: Mở lại để nhân sự sửa sai sót.
2.  **Cấu hình Thông báo (Notifications):**
    *   Danh sách các loại thông báo (Comment, Subtask Done, Log time...).
    *   Toggle **Bật/Tắt** từng loại thông báo cho dự án này.
3.  **Thùng rác dự án (Recycle Bin):**
    *   Xem danh sách: Task, Subtask, Time log, Resource đã xóa.
    *   Hành động: **Khôi phục (Restore)** hoặc **Xóa vĩnh viễn (Destroy)**.

**Logic nghiệp vụ:**
*   **Logic Khóa:** Khi `is_locked = TRUE`, hệ thống vô hiệu hóa quyền Create/Update/Delete đối với Task và Time log trong khoảng thời gian đó.
*   **Phạm vi Thùng rác:** PM chỉ thấy rác của dự án mình quản lý (`project_id = Managed Project`).

---

### PHÂN VÙNG 7: NHẬT KÝ HOẠT ĐỘNG (ACTIVITY LOG)

**Giao diện & Chức năng:**
1.  **Activity Feed:** Xem lịch sử hoạt động của chính PM và toàn bộ nhân viên (EMP) trong dự án.
2.  **Bộ lọc:** Lọc theo Nhân sự hoặc Loại sự kiện (Ví dụ: chỉ xem ai đã Done task hôm nay).

**Logic nghiệp vụ:**
*   Hiển thị sự kiện theo từng ngày (`activity_date`).
*   Phạm vi xem: `project_id = Managed Project`.

---

### TÓM TẮT QUYỀN HẠN CỦA PM (MATRIX PERMISSIONS)
Dựa trên thiết kế Phase 2, các nút bấm/chức năng trên sẽ hiển thị dựa trên bộ quyền sau của PM:

1.  **PROJECT:** READ, UPDATE
2.  **TASK:** CREATE, UPDATE, READ, ASSIGN, IMPORT, EXPORT
3.  **SUBTASK:** READ (Quyền sửa thuộc về EMP, PM quản lý task cha)
4.  **TAG:** READ, UPDATE
5.  **CUSTOM_FIELD:** CREATE, UPDATE
6.  **PRJ_LOCK:** LOCK, UNLOCK
7.  **ASSET/RESOURCE:** CREATE, DOWNLOAD, UPDATE, SHARE
8.  **COMMENT:** CREATE, READ
9.  **COMPENSATION:** READ, UPDATE (Có điều kiện)
10. **PRJ_NOTIF_CFG:** READ, UPDATE
11. **RECYCLE_BIN:** READ, RESTORE, DESTROY