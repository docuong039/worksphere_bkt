Dựa trên 5 tài liệu bạn cung cấp, tôi đã tổng hợp chi tiết **100%** các giao diện, chức năng và logic nghiệp vụ thuộc về vai trò **Project Manager (PM/MNG)**.

Vai trò này được định nghĩa là người "Quản lý & Điều phối", có quyền hạn trong phạm vi dự án được phân công (Project Scope).

Dưới đây là danh sách phân rã chi tiết:

### 1. Nhóm Quản lý Dự án & Công việc (Lõi)

**Giao diện & Chức năng:**
*   **Thiết lập dự án:** Tạo mới và cập nhật thông tin dự án (Tên, mô tả, trạng thái) để thiết lập không gian làm việc,.
*   **Quản lý Task (Công việc):**
    *   Tạo Task mới và gán (Assign) cho nhân sự (hỗ trợ gán nhiều người 1 task).
    *   Gắn thẻ (Tags) và thiết lập độ ưu tiên (Priority).
    *   Đính kèm tài liệu/đầu bài vào Task.
    *   **Import/Export:**
        *   Xuất danh sách Task ra file .xlsx (chọn được các trường thông tin).
        *   Import Task từ file Excel/CSV (bao gồm cả Custom Fields),.
*   **Quản lý Custom Fields (Trường tùy chỉnh):**
    *   Tạo các trường tùy chỉnh cho Task/Subtask theo đặc thù dự án.
    *   **Phân quyền trường thông tin (Field-level Permission):** Chỉ định cụ thể User nào được sửa trường nào (VD: User A sửa 'Mô tả', User B sửa 'Custom Field X'),.
*   **Sắp xếp & Tìm kiếm:**
    *   Sắp xếp thứ tự ưu tiên các Task.
    *   Tìm kiếm và lọc toàn bộ Task trong dự án theo: nhân sự, trạng thái, độ ưu tiên, custom fields.

**Logic nghiệp vụ & Ràng buộc:**
*   **Quyền chốt trạng thái:** Chỉ PM mới có quyền chuyển trạng thái Task chính sang **Done** (Hoàn thành). Nhân viên không có quyền này.
*   **Logic Import:** Khi Import Excel, tên cột trong file phải trùng khớp với Custom Fields đã tạo trước trên phần mềm thì mới import được (tránh rác database).
*   **Phạm vi (Scope):** PM chỉ được thao tác trên các dự án mà mình là thành viên với vai trò PM (`project_id = Managed Project`),.

### 2. Nhóm Kiểm soát Chu kỳ & Tiến độ (Governance)

**Giao diện & Chức năng:**
*   **Khóa/Mở khóa kỳ làm việc (Lock/Unlock):**
    *   Khóa toàn bộ Task và Log time của nhân sự theo tuần/tháng/quý.
    *   Mở khóa lại để nhân sự sửa sai sót (nếu cần thiết).
*   **Biểu đồ Gantt:**
    *   Xem biểu đồ Gantt của dự án để nắm tiến độ.
    *   Thay đổi trục thời gian (Ngày, Tuần, Tháng, Quý) và lọc theo nhân sự/trạng thái.
*   **Theo dõi & Phê duyệt:**
    *   Theo dõi trạng thái Test và Fix bug của dự án.
    *   Xem và viết phản hồi (Comment) vào báo cáo định kỳ của nhân viên.

**Logic nghiệp vụ & Ràng buộc:**
*   **Nguyên tắc "Sổ cái":** Khi PM thực hiện lệnh **Khóa (Lock)**, hệ thống vô hiệu hóa toàn bộ quyền chỉnh sửa/xóa Time log và Task của nhân viên trong kỳ đó. Chỉ khi PM **Mở khóa (Unlock)** thì nhân viên mới được sửa,.
*   **Logic Log Time:** PM chuyển Task sang Done là điều kiện cần để nhân viên log time (đối với Task không có subtask).

### 3. Nhóm Tài nguyên & Chi phí (Resource & Cost)

**Giao diện & Chức năng:**
*   **Quản lý Nhân sự:**
    *   Xem hồ sơ nhân sự trong dự án.
    *   Cập nhật bậc (Level) và mức lương/Cost-rate cho nhân sự (nếu có quyền `VIEW_SALARY`),.
*   **Quản lý Tài chính dự án:** Xem báo cáo chi phí trả lương dự án (dựa trên Time log x Lương/Cost rate).
*   **Quản lý Tài sản kỹ thuật (Assets):**
    *   Quản lý tài liệu, form mẫu dùng chung (Upload, Share).
    *   Quản lý link Source code (Git), thông tin Deploy, link tài liệu quy trình,.

**Logic nghiệp vụ:**
*   **Cost Calculation:** Chi phí dự án được tính tổng dựa trên thời gian log của Task/Subtask nhân với đơn giá nhân sự tại thời điểm đó (Effective dating),.

### 4. Nhóm Tương tác & Giám sát (Communication & Monitoring)

**Giao diện & Chức năng:**
*   **Dashboard:**
    *   Xem thống kê tiến độ dự án (% hoàn thành).
    *   Xem thống kê hiệu suất nhân sự (tỉ lệ hoàn thành, trễ hạn).
*   **Activity (Nhật ký hoạt động):** Xem lịch sử hoạt động của chính mình và toàn bộ nhân viên (EMP) trong dự án theo ngày,.
*   **Thảo luận (Social):**
    *   Bình luận chỉ đạo, Tag (@mention) thành viên vào Task/Subtask.
    *   Xem các cuộc thảo luận dưới dạng Thread.
*   **Thông báo (Notifications):**
    *   Nhận thông báo khi: EMP hoàn thành Subtask, có Log time mới, EMP comment báo lỗi.
    *   Cấu hình **Bật/Tắt** các loại thông báo cụ thể cho từng dự án để tránh bị làm phiền,.

### 5. Nhóm Quản lý Dữ liệu rác (Recycle Bin)

**Giao diện & Chức năng:**
*   **Thùng rác dự án:**
    *   Xem danh sách dữ liệu đã xóa trong dự án (Task, Subtask, Time log, Resource).
    *   **Khôi phục (Restore)** dữ liệu đã xóa.
    *   **Xóa vĩnh viễn (Destroy)** dữ liệu khỏi hệ thống.

**Logic nghiệp vụ:**
*   Chỉ PM quản lý dự án đó mới thấy và thao tác được với dữ liệu trong thùng rác của dự án đó (`project_id = Managed Project`).

### 6. Nhóm Cá nhân (Personal Space)

**Giao diện & Chức năng:**
*   **Task cá nhân:** Tạo, sửa, xóa, kéo thả trạng thái trên Kanban Board riêng.
*   **Bảo mật:** Đăng nhập, Đăng xuất, Quên mật khẩu.

**Logic nghiệp vụ:**
*   **Strict Isolation:** Task cá nhân của PM hoàn toàn riêng tư, ngay cả CEO hay Admin cũng không xem được (trừ khi can thiệp vào DB).

### Tóm tắt quyền hạn PM (Matrix Permissions)
Dựa trên thiết kế RBAC Phase 2, đây là các quyền (Permission) gắn cứng với Role `PROJECT_MANAGER`:

1.  **PROJECT:** READ, UPDATE
2.  **TASK:** CREATE, UPDATE, READ, ASSIGN, IMPORT, EXPORT
3.  **SUBTASK:** READ (Quyền sửa/xóa thuộc về người tạo - EMP, nhưng PM có quyền quản lý chung qua Task cha)
4.  **TAG:** READ, UPDATE
5.  **ASSET/RESOURCE:** CREATE, DOWNLOAD, UPDATE, SHARE
6.  **COMMENT:** CREATE, READ
7.  **CUSTOM_FIELD:** CREATE, UPDATE
8.  **PRJ_LOCK:** LOCK, UNLOCK
9.  **COMPENSATION:** READ, UPDATE (Có điều kiện)
10. **ACTIVITY/NOTIFICATION:** READ, UPDATE (Config)
11. **RECYCLE_BIN:** READ, RESTORE, DESTROY

Hệ thống đảm bảo **Separation of Duties (Phân tách trách nhiệm)**: PM có quyền duyệt (Done task), khóa sổ (Lock), nhưng không nên tự phê duyệt lương thưởng (Compensation Approve) nếu không được cấp quyền đặc biệt.