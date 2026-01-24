Dựa trên 5 tài liệu bạn cung cấp, trang "Danh sách nhân viên" của vai trò **Project Manager (PM/MNG)** thực chất là giao diện **Quản lý Thành viên Dự án (Project Members)**. PM không có quyền quản lý danh sách nhân viên toàn công ty (đây là quyền của Org Admin).

Dưới đây là liệt kê chuẩn xác 100% về giao diện và logic chức năng của trang này:

### 1. Phạm vi dữ liệu (Scope Logic)
*   **Nguyên tắc hiển thị:** PM chỉ nhìn thấy và quản lý được các nhân viên đang tham gia trong **dự án mà mình quản lý** (`project_id = Managed Project`).
*   **Truy vấn nền tảng:** Hệ thống lấy dữ liệu từ bảng `project_members` kết hợp với bảng `users`.

### 2. Giao diện & Chức năng: Danh sách Thành viên (List View)
Đây là màn hình tổng quan khi PM vào tab "Thành viên" trong một dự án cụ thể.

*   **Hiển thị thông tin:**
    *   **Tên & Avatar:** Lấy từ bảng `users` và `user_profiles`,.
    *   **Vai trò (Role):** Hiển thị vai trò trong dự án (`PM`, `MEMBER`, `VIEWER`).
    *   **Ngày tham gia:** Cột `joined_at` từ bảng `project_members`.
*   **Quyền hạn (Permissions):** PM có quyền `ORG_USER.READ` trong phạm vi dự án.

### 3. Giao diện & Chức năng: Hồ sơ & Chi phí (Detail View)
Khi PM bấm vào một nhân viên cụ thể trong danh sách, hệ thống hiển thị chi tiết chia thành các phần sau:

#### A. Tab Thông tin cá nhân (Profile)
*   **Chức năng:** Xem hồ sơ lý lịch nhân sự (Background).
*   **Dữ liệu:** Hiển thị Bio, Kỹ năng, Email liên hệ.
*   **Logic:** PM xem để nắm năng lực nhân sự, phục vụ phân công công việc.

#### B. Tab Lương & Cấp bậc (Compensation & Level) - *Chức năng quan trọng*
Đây là khu vực nhạy cảm, thực hiện User Story `US-MNG-03-02` và `US-MNG-03-03`.

*   **Thiết lập Cấp bậc (Level):**
    *   **Giao diện:** Dropdown chọn Level (Junior, Senior, J1, J2...).
    *   **Nguồn:** Dữ liệu lấy từ bảng `job_levels`.
*   **Thiết lập Chi phí (Cost Rate):**
    *   **Giao diện:** Nhập mức lương tháng (`monthly_salary`) hoặc đơn giá theo giờ (`hourly_cost_rate`).
    *   **Mục đích:** Để hệ thống tính toán chi phí dự án = (Time Log) x (Cost Rate).
*   **Logic bảo mật (Security Constraint):**
    *   Không phải PM nào cũng thấy tab này. Hệ thống kiểm tra quyền `COMPENSATION.READ` và `COMPENSATION.UPDATE`.
    *   Phải có cờ cấp phép đặc biệt (Permission Flag) là `VIEW_SALARY` thì mới được truy cập,.
*   **Logic lưu trữ (Effective Dating):**
    *   Khi PM cập nhật lương, hệ thống **không ghi đè** dòng cũ mà tạo bản ghi mới trong bảng `employee_compensations` với ngày hiệu lực (`effective_from`) mới. Điều này giúp báo cáo chi phí của các tháng cũ không bị sai lệch.

### 4. Các logic ràng buộc (Constraints)
*   **Không tạo mới User:** PM **không thể** tạo tài khoản nhân viên mới (Create User). PM chỉ có thể chọn nhân viên đã có trong hệ thống (do Org Admin tạo) để thêm vào dự án,.
*   **Không xóa User khỏi hệ thống:** PM chỉ có thể loại bỏ thành viên khỏi dự án (xóa trong `project_members`), không được xóa user khỏi tổ chức.
*   **Phân quyền Field-level:** Dữ liệu lương (`employee_compensations`) được thiết kế tách biệt với bảng `users` để dễ dàng áp dụng phân quyền row-level security (RLS) dựa trên `project_id`.

**Tóm lại:** Tại trang này, PM đóng vai trò là người **quản lý tài nguyên dự án** (thiết lập chi phí, xem hồ sơ) chứ không phải là quản trị viên hệ thống (tạo/xóa tài khoản).