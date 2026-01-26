Dựa trên tài liệu User Stories (Epic CEO-04), Phân quyền RBAC Phase 2 và Thiết kế Database, dưới đây là mô tả chi tiết 100% về **Phân hệ Nhật ký Hoạt động (Activity Log)** dành riêng cho vai trò **CEO**.

Khác với nhân viên (chỉ xem bản thân) hay PM (chỉ xem dự án quản lý), trang này của CEO đóng vai trò như **"Nhịp đập doanh nghiệp" (Company Pulse)**, giúp lãnh đạo cảm nhận được tốc độ và không khí làm việc của toàn bộ tổ chức theo thời gian thực.

---

### 1. Giao diện & Chức năng (Front-end View)

Trang này hiển thị dòng thời gian (Timeline) của mọi hoạt động sản xuất kinh doanh diễn ra trong công ty.

#### A. Bộ lọc Toàn cục (Global Filters)
Để tránh bị quá tải thông tin (Information Overload), CEO được trang bị bộ lọc mạnh mẽ:
*   **Lọc theo Dự án:** Chọn xem hoạt động của một dự án cụ thể hoặc "Tất cả dự án".
*   **Lọc theo Nhân sự:** Chọn tên một nhân viên (bất kể là PM hay nhân viên thường) để xem hôm nay họ làm gì.
*   **Lọc theo Loại sự kiện:** Chỉ xem các sự kiện quan trọng như:
    *   `TASK_DONE` / `SUBTASK_DONE`: Để biết kết quả công việc.
    *   `COMMENT`: Để xem thảo luận, tranh luận.
    *   `REPORT_SUBMITTED`: Để biết ai vừa nộp báo cáo.
    *   `LOG_TIME`: Để xem ai vừa chấm công.

#### B. Danh sách Dòng chảy Hoạt động (Activity Stream)
Hiển thị danh sách các sự kiện được nhóm theo **Ngày** (Hôm nay, Hôm qua, Tuần trước). Mỗi dòng hoạt động bao gồm:
*   **Avatar & Tên:** Người thực hiện hành động.
*   **Hành động:** Ví dụ: *"Nguyễn Văn A đã hoàn thành task Thiết kế Database"*, *"Trần Thị B đã log 4 giờ vào dự án Website"*.
*   **Liên kết (Hyperlink):** Click vào tên Task/Dự án/Báo cáo để nhảy sang trang chi tiết xem nội dung cụ thể.
*   **Thời gian:** Thời điểm thực hiện (ví dụ: "10 phút trước").

---

### 2. Logic Nghiệp vụ & Phân quyền (Backend Logic)

Logic tại đây tuân thủ nguyên tắc **Tenant-wide Visibility** (Tầm nhìn toàn tổ chức).

#### A. Quyền truy cập (Permissions)
*   **Quyền hạn:** CEO sở hữu quyền **`ACTIVITY.READ`** trong bảng phân quyền RBAC,.
*   **Phạm vi (Scope):**
    *   Hệ thống thực hiện truy vấn với điều kiện: `WHERE org_id = CEO.org_id`.
    *   **Không** áp dụng bộ lọc `project_id` mặc định như PM. CEO nhìn thấy hoạt động của tất cả dự án, kể cả dự án CEO không tham gia.

#### B. Phân biệt với Audit Log
Tài liệu phân biệt rõ hai khái niệm này:
*   **Activity Log (CEO xem):** Là các sự kiện **nghiệp vụ** (Làm task, sửa lỗi, comment) để phục vụ giám sát vận hành.
*   **Audit Log (Admin xem):** Là các sự kiện **hệ thống/bảo mật** (Đăng nhập, đổi quyền, xóa dữ liệu) phục vụ thanh tra. CEO thường không xem Audit Log trừ khi có sự cố đặc biệt hoặc kiêm nhiệm Admin.

---

### 3. Thiết kế Dữ liệu Nền tảng (Database Schema)

Dữ liệu hiển thị cho CEO được truy xuất trực tiếp từ bảng **`activity_events`**,.

| Trường thông tin | Logic xử lý hiển thị cho CEO |
| :--- | :--- |
| **`org_id`** | Khóa chính để lọc dữ liệu thuộc công ty của CEO. |
| **`project_id`** | Dùng cho bộ lọc "Theo dự án". Nếu `NULL`, đó là hoạt động mức công ty (VD: nộp báo cáo). |
| **`actor_user_id`** | ID nhân viên thực hiện. Dùng cho bộ lọc "Theo nhân sự". |
| **`activity_date`** | Dùng để gom nhóm hiển thị theo từng ngày trên giao diện. |
| **`activity_type`** | Mã loại sự kiện (`TASK_DONE`, `COMMENT`...) dùng cho bộ lọc loại. |
| **`summary`** | Nội dung tóm tắt hiển thị trực tiếp (VD: "đã đóng task ABC"). |
| **`entity_id` / `entity_type`** | Dùng để tạo Hyperlink trỏ đến đối tượng gốc (Task, Report). |

### Tóm tắt: CEO thấy gì khác PM và Employee?

| Vai trò | Phạm vi Activity Log | Mục đích trong tài liệu |
| :--- | :--- | :--- |
| **Employee** | Chỉ thấy activity của **chính mình**. | Tự theo dõi lịch sử làm việc (Self-tracking). |
| **PM** | Thấy activity của **mình + thành viên** trong **dự án quản lý**. | Giám sát tiến độ dự án được giao. |
| **CEO** | Thấy activity của **toàn bộ nhân viên (MNG + EMP)** trong **toàn công ty**,. | Đánh giá nhịp độ vận hành doanh nghiệp (Business Pulse). |