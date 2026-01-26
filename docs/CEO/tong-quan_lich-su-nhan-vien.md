Dựa trên yêu cầu đi sâu vào **Phân hệ Quản trị Tổng quan (Strategic Dashboard)** dành riêng cho vai trò **CEO**, dưới đây là mô tả chi tiết chuẩn xác về giao diện, chức năng và logic vận hành được tổng hợp từ các tài liệu User Stories, RBAC/ABAC và Database Design.

Phân hệ này được thiết kế để trả lời câu hỏi chiến lược: *"Sức khỏe toàn diện của công ty (Dự án, Tài chính, Con người) đang ra sao?"*

---

### 1. Cấu trúc Giao diện & Chức năng (Front-end View)

CEO sẽ có một Dashboard trung tâm với khả năng nhìn xuyên suốt (Global View) toàn bộ tổ chức (Tenant-wide) mà không bị giới hạn bởi việc có tham gia dự án cụ thể hay không.

#### A. Dashboard Sức khỏe Dự án (Project Health Overview)
Đây là màn hình hạ cánh (landing page) chính của CEO.
*   **Chức năng:**
    *   **Thống kê tổng hợp:** Hiển thị tổng số dự án đang chạy (Active), dự án đã đóng (Archived), và các dự án đang gặp vấn đề (ví dụ: bị block, quá hạn),.
    *   **Tiến độ vĩ mô:** Xem thanh phần trăm (%) hoàn thành của **tất cả dự án** trong công ty. CEO không cần đi sâu vào từng task nhỏ, mà nhìn vào bức tranh tổng thể tiến độ.
    *   **Trạng thái "Đỏ":** Hệ thống tự động đẩy các dự án có rủi ro cao (trễ hạn nhiều task) lên đầu để CEO can thiệp sớm.

#### B. Dashboard Tài chính & Hiệu quả Đầu tư (Financial & ROI Dashboard)
Đây là chức năng độc quyền của CEO (và Org Admin), các vai trò khác (PM, EMP) không thể truy cập.
*   **Chức năng:**
    *   **Báo cáo chi phí thực tế:** Hiển thị biểu đồ "Tiền đang chảy về đâu". Hệ thống tính toán tổng chi phí nhân sự cho từng dự án dựa trên công thức:
        $$Chi Phí = \sum (Time Log \times Hourly Cost Rate)$$
        Điều này giúp CEO biết dự án nào đang "ngốn" ngân sách nhất.
    *   **Danh sách quỹ lương (Payroll View):** Bảng tổng hợp danh sách nhân sự kèm theo Cấp bậc (Level) và Mức lương/Cost rate. CEO dùng dữ liệu này để cân nhắc kế hoạch tăng/giảm nhân sự.

#### C. Dashboard Hiệu suất Nhân sự (People Analytics)
*   **Chức năng:**
    *   **Lịch sử trọn đời (Employee Lifetime History):** CEO có thể click vào bất kỳ nhân sự nào để xem timeline hoạt động từ ngày đầu gia nhập (Onboarding) đến hiện tại. Dữ liệu bao gồm các dự án đã tham gia, số lượng task hoàn thành, và tần suất hoạt động,.
    *   **Hồ sơ & Pháp lý:** Truy cập nhanh vào hồ sơ lý lịch (CV), hợp đồng lao động (Contract) để nắm thông tin nền tảng của nhân sự chủ chốt.

---

### 2. Logic Nghiệp vụ & Phân quyền (Back-end Logic)

Để CEO nhìn thấy các dữ liệu trên, hệ thống vận hành dựa trên các quy tắc RBAC (Role-Based Access Control) và ABAC (Attribute-Based Access Control) chặt chẽ sau:

#### A. Quyền truy cập Tài nguyên (Permissions)
Dựa trên thiết kế Phase 2, CEO sở hữu bộ quyền "Read-All" (Xem tất cả) trong phạm vi tổ chức:
1.  **`PROJECT.READ`**: Cho phép xem dữ liệu bảng `projects` của tất cả dự án, bất kể ai là PM.
2.  **`COMPENSATION.READ`**: Quyền nhạy cảm cho phép truy vấn bảng `employee_compensations` để xem lương và cost rate,.
3.  **`JOB_CONTRACT.READ`**: Cho phép xem bảng `user_contracts`.
4.  **`ACTIVITY.READ`**: Cho phép xem bảng `activity_events` của toàn bộ nhân viên.
5.  **`ORG_USER.READ`**: Xem danh sách nhân sự toàn công ty.

#### B. Cơ chế "Tenant Isolation" (ABAC Constraint)
Khác với PM (chỉ thấy dự án mình quản lý), CEO có tầm nhìn **Tenant-wide**.
*   **Logic truy vấn:** Mọi câu lệnh SQL hoặc API gọi dữ liệu cho CEO sẽ **không** filter theo `project_id`. Thay vào đó, hệ thống chỉ áp dụng filter duy nhất:
    `WHERE org_id = current_user.org_id`,.
*   **Ý nghĩa:** CEO đăng nhập vào công ty A sẽ thấy 100% dữ liệu của công ty A, nhưng tuyệt đối không thấy dữ liệu của công ty B (Isolation).

#### C. Chính sách Quản trị (Policies)
Hệ thống áp dụng Policy mã **`POL-CEO-GOV-01`**:
*   Quy định rằng CEO có quyền xem báo cáo và phê duyệt (`APPROVE`) nhưng **không** được can thiệp sửa đổi chi tiết kỹ thuật của Task/Subtask (Quyền `UPDATE` task thuộc về PM/EMP).
*   Điều này đảm bảo CEO giữ vai trò giám sát chiến lược, không sa đà vào vi quản lý (micromanagement).

---

### 3. Thiết kế Dữ liệu Nền tảng (Database Underlying)

Dashboard của CEO được tổng hợp từ các bảng dữ liệu sau:

1.  **`projects`**: Cung cấp tên, trạng thái (Active/Archived), ngày bắt đầu/kết thúc để vẽ timeline dự án.
2.  **`employee_compensations`**: Lưu trữ `monthly_salary` (lương tháng) và `hourly_cost_rate` (chi phí giờ). Bảng này có trường `effective_from/to` để tính chi phí chính xác theo từng giai đoạn lịch sử (ví dụ: lương năm 2023 khác lương 2024).
3.  **`time_logs`**: Dữ liệu gốc về thời gian làm việc của nhân viên. Dashboard tài chính sẽ Join bảng này với `employee_compensations` để ra con số tiền bạc.
4.  **`activity_events`**: Bảng lưu vết "Ai làm gì lúc nào". Dashboard sẽ query bảng này với điều kiện `org_id = CEO_org_id` để hiển thị dòng chảy hoạt động toàn công ty.
5.  **`user_contracts`**: Lưu trữ số hợp đồng, ngày ký, ngày hết hạn để CEO kiểm tra pháp lý nhân sự.

### Tóm tắt sự khác biệt: CEO vs. PM Dashboard

| Đặc điểm | Dashboard CEO (Chiến lược) | Dashboard PM (Quản lý dự án) |
| :--- | :--- | :--- |
| **Phạm vi (Scope)** | **Toàn công ty** (All Projects in Org) | **Dự án được giao** (Managed Projects only) |
| **Tài chính** | Thấy Lương, Chi phí nhân sự (Cost) | Chỉ thấy Cost dự án (nếu được phân quyền), không thấy lương toàn cty |
| **Nhân sự** | Lịch sử trọn đời, Hợp đồng, Salary | Chỉ thấy tiến độ làm việc trong dự án |
| **Độ chi tiết** | Tổng quan, % hoàn thành, Rủi ro lớn | Chi tiết Task, Subtask, Bug, Deadline từng ngày |

Đây là bức tranh toàn cảnh về phân hệ quản trị dành cho CEO, đảm bảo cả 3 yếu tố: **Tầm nhìn rộng (Scope)**, **Dữ liệu sâu (Finance/HR)**, và **Bảo mật chặt (RBAC/Isolation)**.