Dựa trên các tài liệu User Stories, Thiết kế Phân quyền (RBAC Phase 2) và Thiết kế Database, dưới đây là mô tả chi tiết về **giao diện, chức năng và logic quản trị dự án** dành riêng cho vai trò **CEO**.

Khác với Project Manager (PM) tập trung vào vi quản lý (tác vụ, tiến độ chi tiết), giao diện dự án của CEO được thiết kế theo hướng **"Strategic Overview"** (Tổng quan chiến lược) và **"Tenant-wide Scope"** (Phạm vi toàn tổ chức).

---

### 1. Giao diện Dashboard Tổng hợp Dự án (Strategic Project Dashboard)

Đây là màn hình chính khi CEO truy cập vào module Dự án.

**Chức năng & Hiển thị:**
*   **Danh sách toàn bộ dự án:** Hiển thị danh sách tất cả dự án trong công ty (`Active` và `Archived`) dưới dạng bảng hoặc lưới thẻ (Grid view).
*   **Chỉ số sức khỏe (Health Metrics):** Với mỗi dự án, giao diện hiển thị các chỉ số vĩ mô:
    *   **Tiến độ tổng thể (%):** Thanh phần trăm hoàn thành dựa trên số lượng Task Done / Tổng Task.
    *   **Trạng thái:** Đang chạy (Active), Đã đóng (Archived), hoặc Tạm dừng.
    *   **Cảnh báo rủi ro:** Đánh dấu đỏ các dự án có nhiều task bị trễ hạn (Overdue) hoặc bị chặn (Blocked).
*   **Bộ lọc cấp cao:** Lọc theo PM phụ trách, Phòng ban, hoặc Trạng thái dự án.

**Logic Nghiệp vụ (Backend Logic):**
*   **Phạm vi truy cập (Scope):** Hệ thống truy vấn bảng `projects` với điều kiện duy nhất là `org_id` trùng với tổ chức của CEO. CEO **không cần** phải có tên trong bảng thành viên dự án (`project_members`) mới xem được,.
*   **Quyền hạn:** Sử dụng quyền `PROJECT.READ` được cấp riêng cho Role CEO trong bảng phân quyền Phase 2.

### 2. Giao diện Phân tích Tài chính Dự án (Project Financial Analytics)

Đây là chức năng độc quyền dành cho CEO (và Org Admin), giúp trả lời câu hỏi: *"Dự án nào đang tiêu tốn nhiều tiền lương nhất?"*.

**Chức năng & Hiển thị:**
*   **Biểu đồ Chi phí Thực tế (Actual Cost):** Hiển thị tổng chi phí nhân sự đã chi trả cho dự án.
*   **So sánh hiệu quả:** CEO có thể so sánh chi phí giữa các dự án để đánh giá hiệu quả đầu tư (ROI).
*   **Drill-down (Xem chi tiết):** Khi bấm vào một dự án, CEO thấy danh sách nhân sự tham gia và số tiền lương tương ứng phân bổ cho dự án đó (dựa trên thời gian họ làm việc).

**Logic Nghiệp vụ (Backend Logic):**
*   **Công thức tính:**
    $$Cost = \sum (\text{Time Log Minutes} \times \text{Hourly Cost Rate})$$
    Hệ thống lấy dữ liệu từ bảng `time_logs` (thời gian làm việc) nhân với `hourly_cost_rate` trong bảng `employee_compensations` (bảng lương),.
*   **Bảo mật dữ liệu (Field-level Security):** Chỉ user có quyền `COMPENSATION.READ` (như CEO) mới kích hoạt được logic tính toán này. Các user khác (kể cả PM nếu không được cấp quyền đặc biệt) sẽ không thấy con số tiền tệ,.

### 3. Giao diện Giám sát Hoạt động & Rủi ro (Activity & Risk Monitoring)

Thay vì xem danh sách Task chi tiết (như "Sửa lỗi login", "Viết API"), CEO xem dòng chảy hoạt động để nắm nhịp độ làm việc.

**Chức năng & Hiển thị:**
*   **Activity Feed dự án:** Xem lịch sử hoạt động của dự án (Ai vừa hoàn thành milestone, ai vừa log time lớn, ai vừa comment báo cáo vấn đề),.
*   **Thông báo "Đỏ" (Critical Alerts):** Hệ thống tự động đẩy thông báo cho CEO khi dự án gặp sự cố nghiêm trọng như:
    *   Dự án bị đánh dấu "Blocked" (Tắc nghẽn).
    *   Số lượng task quá hạn vượt ngưỡng an toàn.

**Logic Nghiệp vụ (Backend Logic):**
*   **Nguồn dữ liệu:** Truy xuất từ bảng `activity_events` và `notifications`,.
*   **Cơ chế lọc:** Hệ thống lọc các sự kiện quan trọng (như trạng thái Task chuyển sang `BLOCKED` trong bảng `task_statuses`) để hiển thị, lọc bớt các sự kiện nhiễu (như sửa lỗi chính tả).

---

### Tổng hợp: Sự khác biệt về Logic Dự án giữa CEO và PM

Để làm rõ logic thiết kế, bảng dưới đây so sánh sự khác biệt cốt lõi:

| Đặc điểm | CEO (Giám sát Chiến lược) | PM (Quản lý Thực thi) |
| :--- | :--- | :--- |
| **Quyền truy cập (Access)** | **Tenant-wide:** Xem được tất cả dự án trong công ty mà không cần được invite. | **Project-based:** Chỉ xem được dự án mình được gán làm PM. |
| **Quyền thao tác (Action)** | **Read-Only:** Chỉ xem (`PROJECT.READ`), không được tạo/sửa Task hay thay đổi trạng thái dự án. | **Full Control:** Được tạo, sửa, xóa Task, cấu hình dự án (`PROJECT.UPDATE`, `TASK.CREATE`). |
| **Góc nhìn Tài chính** | **Full Visibility:** Thấy tổng chi phí nhân sự (Tiền lương). | **Limited/None:** Thường chỉ thấy giờ công (Time), không thấy tiền lương (trừ khi được phân quyền đặc biệt). |
| **Mục tiêu** | Đánh giá hiệu quả đầu tư, sức khỏe nhân sự. | Đảm bảo dự án đúng tiến độ (Deadline), chất lượng. |

**Tóm lại:** Giao diện dự án của CEO là một **Dashboard Business Intelligence (BI)** tích hợp sẵn trong phần mềm, tập trung vào **con số tài chính** và **trạng thái rủi ro**, tuân thủ nguyên tắc "Giám sát nhưng không can thiệp sâu" (No Micromanagement) thông qua cơ chế phân quyền RBAC chỉ cho phép `READ` và `APPROVE` báo cáo.