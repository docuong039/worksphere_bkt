Dựa trên việc tổng hợp và phân tích toàn diện các tài liệu (User Stories, Phân quyền RBAC/ABAC, Thiết kế Database), dưới đây là danh sách chi tiết **100% các giao diện chức năng và logic xử lý** dành cho vai trò **CEO (Ban lãnh đạo/Chủ tịch)**.

Vai trò CEO được định nghĩa là người có tầm nhìn **Tenant-wide (Toàn tổ chức)**, tập trung vào giám sát chiến lược, tài chính, nhân sự và phê duyệt cấp cao, chứ không đi sâu vào quản lý vi mô từng task cụ thể,,.

---

### 1. Phân hệ Quản trị Tổng quan (Strategic Dashboard)

**Giao diện & Chức năng:**
*   **Dashboard tổng hợp:** Hiển thị bức tranh toàn cảnh về tiến độ của **tất cả dự án** trong công ty. CEO có thể thấy các chỉ số như % hoàn thành, trạng thái sức khỏe dự án.
*   **Lịch sử nhân sự trọn đời:** Xem timeline làm việc của bất kỳ nhân sự nào từ lúc gia nhập đến hiện tại để đánh giá sự cống hiến.

**Logic & Quy tắc nghiệp vụ:**
*   **Phạm vi dữ liệu (Scope):** CEO có quyền truy cập dữ liệu với điều kiện `org_id` (ID tổ chức) trùng với tổ chức của mình. CEO nhìn thấy tất cả Projects mà không cần phải được add vào làm thành viên dự án,.
*   **Quyền hạn:** Sử dụng quyền `PROJECT.READ` và `ACTIVITY.READ`.

### 2. Phân hệ Nhân sự & Tài chính (HR & Finance)

Đây là chức năng đặc thù, nhạy cảm mà thường chỉ CEO hoặc Org Admin cấp cao mới thấy.

**Giao diện & Chức năng:**
*   **Danh sách lương & Cấp bậc:** Xem toàn bộ danh sách nhân sự kèm theo cấp bậc (Level) và mức lương/chi phí theo giờ.
*   **Báo cáo chi phí dự án:** Xem tổng chi phí nhân sự thực tế cho từng dự án (được tính bằng: Time Log x Hourly Cost Rate) để biết dự án nào đang tiêu tốn ngân sách nhất.
*   **Hồ sơ & Hợp đồng:** Tra cứu chi tiết hồ sơ lý lịch (CV), thông tin cá nhân và hợp đồng lao động của nhân viên.

**Logic & Quy tắc nghiệp vụ:**
*   **Phân quyền trường dữ liệu (Field-level Security):** Hệ thống kiểm tra quyền `COMPENSATION.READ` và `JOB_CONTRACT.READ`. Chỉ user có quyền `VIEW_SALARY_FINANCE` mới truy vấn được bảng `employee_compensations`,.
*   **Dữ liệu nhạy cảm:** Các API trả về thông tin lương sẽ bị chặn nếu user không phải là CEO/Authorized Admin.

### 3. Phân hệ Giám sát Báo cáo & Phản hồi (Reporting & Feedback)

CEO tương tác trực tiếp với nhân viên thông qua luồng báo cáo định kỳ.

**Giao diện & Chức năng:**
*   **Xem báo cáo định kỳ:** Đọc các báo cáo Tuần/Tháng/Quý của bất kỳ nhân sự nào trong công ty mà không cần thông qua quản lý trung gian.
*   **Phê duyệt báo cáo:** Nút bấm để "Duyệt" (Approve) báo cáo, xác nhận đã ghi nhận kết quả,.
*   **Tương tác cảm xúc (Reaction):** Thả biểu tượng cảm xúc (Like, Clap, Heart...) vào báo cáo để động viên.
*   **Bình luận chỉ đạo:** Viết phản hồi (Comment) trực tiếp vào báo cáo để đưa ra chỉ thị từ cấp cao.

**Logic & Quy tắc nghiệp vụ:**
*   **Policy `POL-CEO-GOV-01`:** Cho phép CEO thực hiện hành động `APPROVE` trên tài nguyên `REPORT` trong phạm vi `org_id`,.
*   **Lưu trữ:** Reaction được lưu trong bảng `report_reactions`, Comment lưu trong `report_comments`,.

### 4. Phân hệ Nhật ký hoạt động & Thông báo (Activity & Notifications)

**Giao diện & Chức năng:**
*   **Activity Feed toàn công ty:** Xem nhật ký hoạt động của **toàn bộ nhân viên** (bao gồm cả PM và nhân viên thường) theo từng ngày. Có bộ lọc theo Dự án, Nhân sự, hoặc Loại sự kiện.
*   **Thông báo "Đỏ" (Critical Alerts):** Nhận thông báo đặc biệt khi có các sự kiện rủi ro như: Dự án bị trễ hạn nhiều task, dự án bị Block, hoặc khi có báo cáo quan trọng được gửi đến.

**Logic & Quy tắc nghiệp vụ:**
*   **Bộ lọc Scope:** Truy vấn bảng `activity_events` với điều kiện `org_id = current_org` (khác với PM chỉ xem được `project_id` mình quản lý).
*   **Cấu hình thông báo:** Hệ thống tự động đẩy thông báo loại quan trọng tới user có Role là CEO dựa trên bảng `notifications`.

### 5. Phân hệ Quản trị Dữ liệu & An toàn (Data Governance)

**Giao diện & Chức năng:**
*   **Thùng rác công ty (Org Recycle Bin):** Xem danh sách tất cả dữ liệu đã bị xóa (Soft delete) trong toàn công ty (Task, Subtask, Document, Report...).
*   **Khôi phục dữ liệu:** Nút "Khôi phục" để lấy lại dữ liệu quan trọng bị nhân viên xóa nhầm.

**Logic & Quy tắc nghiệp vụ:**
*   **Truy vấn:** Hệ thống query bảng `recycle_bin_items` với `org_id` của CEO.
*   **Quyền hạn:** CEO có quyền `RECYCLE_BIN.ALL` (bao gồm Read và Restore).

### 6. Phân hệ Công việc Cá nhân (Personal Tasks)

Dù là lãnh đạo, CEO vẫn cần không gian làm việc riêng tư.

**Giao diện & Chức năng:**
*   **Tạo Task cá nhân:** Tạo các đầu việc không thuộc bất kỳ dự án nào.
*   **Kanban Board riêng tư:** Kéo thả trạng thái (To Do -> Done) cho các công việc cá nhân,.
*   **Bảo mật:** Đảm bảo task này hoàn toàn riêng tư, ngay cả Admin hệ thống cũng không được xem nội dung (về mặt logic nghiệp vụ).

**Logic & Quy tắc nghiệp vụ:**
*   **Strict Isolation (Cách ly tuyệt đối):** Dữ liệu lưu tại bảng `personal_tasks`.
*   **Policy `POL-MYTASK-01`:** Chỉ cho phép truy cập khi `user_id` của người đăng nhập trùng với `user_id` của task. Không ai khác có quyền READ,.

### 7. Phân hệ Xác thực & Tài khoản (Authentication)

**Giao diện & Chức năng:**
*   **Đăng nhập/Đăng xuất:** Truy cập hệ thống an toàn.
*   **Quên mật khẩu:** Tự động reset mật khẩu qua email.

**Logic & Quy tắc nghiệp vụ:**
*   **Session Management:** Khi đăng nhập, hệ thống cấp Session kèm theo `org_id` và Role `CEO`. Mọi hành động sau đó đều được kiểm tra đối chiếu với Role này.

---

### Tóm tắt Quyền hạn Kỹ thuật (Technical Permissions) của CEO
Dựa trên bảng thiết kế RBAC Phase 2, vai trò CEO sở hữu tập hợp quyền sau:

1.  **READ (Xem):** `PROJECT`, `ORG_USER`, `ACTIVITY`, `COMPENSATION` (Lương), `JOB_CONTRACT` (Hợp đồng), `REPORT`, `NOTIFICATION`.
2.  **APPROVE (Duyệt):** `REPORT`.
3.  **CREATE (Tạo/Ghi):** `COMMENT` (trên báo cáo), `REACTION`.
4.  **ALL (Toàn quyền):** `RECYCLE_BIN` (Thùng rác), `MY_TASK` (Việc riêng).

**Lưu ý quan trọng về giới hạn:**
*   CEO **không** can thiệp trực tiếp vào việc sửa đổi Task/Subtask của dự án (Quyền này thuộc về PM/Employee). CEO chỉ giám sát (Read-only) ở cấp độ dự án,.
*   CEO xem được lương nhưng **không** trực tiếp sửa đổi cấu hình lương (Quyền `COMPENSATION.UPDATE` thường thuộc về PM hoặc bộ phận nhân sự chuyên trách, hoặc cần cấu hình riêng nếu CEO muốn sửa).