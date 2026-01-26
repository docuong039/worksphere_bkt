Dựa trên tài liệu thiết kế hệ thống (User Stories, Phân quyền RBAC Phase 2, và Database Schema Phase 1 & 2), đây là mô tả **100% chi tiết** về giao diện, chức năng, logic xử lý và cấu trúc dữ liệu của **Phân hệ Nhân sự & Tài chính (HR & Finance)** dành riêng cho vai trò **CEO**.

Phân hệ này được thiết kế để CEO trả lời câu hỏi chiến lược: *"Chi phí nhân sự thực tế đang được phân bổ như thế nào và hiệu quả đầu tư (ROI) vào từng dự án ra sao?"*.

---

### 1. Chi tiết Giao diện & Chức năng (Front-end Specification)

Giao diện này cung cấp cái nhìn "xuyên thấu" (Tenant-wide) toàn bộ tổ chức, bỏ qua các rào cản dự án mà nhân viên thường gặp phải.

#### A. Dashboard Quản lý Lương & Cấp bậc (Compensation & Levels)
*Mục đích: Giám sát quỹ lương và cơ cấu nhân sự toàn công ty.*

*   **Giao diện hiển thị:**
    *   **Bảng danh sách tổng hợp:** Hiển thị danh sách tất cả nhân viên trong tổ chức (`users`).
    *   **Các cột dữ liệu nhạy cảm:**
        *   **Họ tên & Email:** Thông tin định danh.
        *   **Cấp bậc (Job Level):** Hiển thị mã bậc (ví dụ: Junior, Senior, J1, J2) dựa trên bảng `job_levels`.
        *   **Lương cứng (Monthly Salary):** Hiển thị mức lương tháng hiện tại.
        *   **Chi phí theo giờ (Hourly Cost Rate):** Con số quan trọng nhất để tính chi phí dự án. Hệ thống hiển thị giá trị đang có hiệu lực (`effective_from` <= hiện tại < `effective_to`).
    *   **Bộ lọc (Filter):** Lọc theo Phòng ban, Cấp bậc, hoặc Trạng thái (Active/Inactive).

#### B. Dashboard Phân tích Chi phí Dự án (Project Cost Analytics)
*Mục đích: So sánh chi phí thực tế của các dự án dựa trên thời gian làm việc,.*

*   **Giao diện hiển thị:**
    *   **Biểu đồ Chi phí (Cost Chart):** Biểu đồ cột/đường thể hiện tổng chi phí nhân sự theo tháng của từng dự án.
    *   **Bảng chi tiết (Detail Table):**
        *   **Tên Dự án:** Link đến chi tiết dự án.
        *   **Tổng giờ công (Total Hours):** Tổng số giờ log time của tất cả nhân viên trong dự án.
        *   **Tổng chi phí (Total Cost):** Số tiền thực tế đã tiêu tốn.
        *   **Breakdown theo nhân sự:** Khi click vào dự án, CEO thấy danh sách nhân viên tham gia và số tiền trả cho từng người trong dự án đó.
*   **Logic hiển thị:** Dữ liệu được tổng hợp từ bảng `time_logs` nhân với `employee_compensations` tương ứng tại thời điểm log time.

#### C. Hồ sơ Nhân sự 360 độ & Hợp đồng (Employee 360 Profile)
*Mục đích: Tra cứu thông tin pháp lý và lịch sử cống hiến,.*

*   **Giao diện hiển thị:**
    *   **Tab Thông tin cá nhân:** Ngày sinh, CCCD, Mã số thuế, Số tài khoản ngân hàng, Địa chỉ.
    *   **Tab Hợp đồng (Contracts):** Danh sách các hợp đồng đã ký (Thử việc, Chính thức), số hợp đồng, ngày hiệu lực, ngày hết hạn và link tải file scan đính kèm.
    *   **Tab Lịch sử lương:** Biểu đồ thay đổi mức lương và cost rate qua các năm (History of Compensation).

---

### 2. Logic Nghiệp vụ Cốt lõi (Backend Business Logic)

Hệ thống xử lý các tính toán phức tạp ở phía sau để đảm bảo con số CEO nhìn thấy là chính xác về mặt tài chính và thời gian.

#### A. Logic Tính toán Chi phí Dự án (Cost Calculation Engine)
Để trả về con số "Chi phí dự án" chính xác, hệ thống thực hiện thuật toán sau,:

1.  **Truy vấn Time Log:** Lấy tất cả bản ghi `time_logs` thuộc `project_id`.
2.  **Mapping Cost Rate theo thời gian (Effective Dating):**
    *   Với mỗi log time tại ngày `work_date`, hệ thống tìm bản ghi `employee_compensations` của nhân viên đó thỏa mãn điều kiện:
        `effective_from <= work_date AND (effective_to IS NULL OR effective_to > work_date)`
    *   *Lý do:* Lương nhân viên thay đổi theo năm. Log time năm 2023 phải tính theo mức lương 2023, log time 2024 tính theo lương 2024.
3.  **Công thức tính:**
    $$Cost = \sum \left( \frac{\text{time\_logs.minutes}}{60} \times \text{hourly\_cost\_rate} \right)$$
4.  **Tổng hợp:** Group by `project_id` để hiển thị cho CEO.

#### B. Logic Tenant Isolation (SaaS Security)
Mặc dù CEO có quyền xem tất cả, hệ thống vẫn áp dụng bộ lọc bắt buộc để đảm bảo không lộ dữ liệu sang công ty khác (Multi-tenant),:
*   Mọi query (Lương, Hợp đồng, Time log) đều tự động đính kèm điều kiện:
    `WHERE org_id = CEO.org_id`

#### C. Logic Bảo mật Dữ liệu Nhạy cảm (Field-level Security)
*   **API Restriction:** Các API trả về danh sách nhân viên (`GET /users`) cho user thường (EMP/PM) sẽ **ẩn** các trường `salary`, `bank_account`, `id_number`.
*   **Authorized Access:** Chỉ khi user có Role sở hữu quyền `COMPENSATION.READ` (là CEO hoặc Org Admin) thì API mới trả về các trường dữ liệu tài chính này,.

---

### 3. Phân quyền & Chính sách (RBAC & Policy)

Dựa trên thiết kế **RBAC Phase 2**, quyền hạn của CEO trong phân hệ này được cấu hình chặt chẽ như sau:

#### A. Ma trận Quyền hạn (Permissions)
CEO sở hữu các quyền "Read-Only" (Chỉ xem) đối với dữ liệu nhạy cảm để đảm bảo tính minh bạch và tránh rủi ro sửa đổi nhầm:

| Tài nguyên (Resource) | Quyền (Action) | Mô tả Logic |
| :--- | :--- | :--- |
| **COMPENSATION** | **READ** | Xem bảng `employee_compensations` (Lương & Cost Rate) của toàn bộ nhân viên trong Org. |
| **JOB_CONTRACT** | **READ** | Xem bảng `user_contracts` (Hợp đồng lao động). |
| **ORG_USER** | **READ** | Xem danh sách nhân viên (`users`, `org_memberships`). |
| **PROJECT** | **READ** | Xem danh sách dự án để tổng hợp chi phí (không cần là thành viên dự án). |
| **TIME_LOG** | **READ** | Xem log time của toàn bộ nhân viên để đối soát chi phí. |

*Lưu ý: CEO mặc định **không** có quyền `UPDATE` lương (Quyền này thường thuộc về HR chuyên trách hoặc cần cấu hình riêng nếu CEO kiêm nhiệm).*

#### B. Chính sách Quản trị (Policies)
*   **Policy `POL-CEO-GOV-01`:** Cho phép CEO truy cập tài nguyên vượt qua rào cản Project Scope, nhưng vẫn bị giới hạn trong Org Scope,.
*   **Audit Logging:** Mọi hành động xem chi tiết lương hoặc tải hợp đồng của CEO đều được ghi lại trong `audit_logs` để phục vụ thanh tra/kiểm soát nội bộ.

---

### 4. Cấu trúc Dữ liệu Nền tảng (Database Schema)

Dữ liệu của phân hệ này được lưu trữ trong 4 bảng chính thuộc nhóm **Finance & Tenant Core**,,,:

1.  **`employee_compensations`** (Bảng quan trọng nhất):
    *   `user_id`, `org_id`: Định danh nhân sự.
    *   `monthly_salary`, `hourly_cost_rate`: Dữ liệu tiền tệ.
    *   `effective_from`, `effective_to`: **Cực kỳ quan trọng** để lưu lịch sử tăng lương, đảm bảo tính toán chi phí chính xác theo dòng thời gian lịch sử.

2.  **`job_levels`**:
    *   `code` (J1, S1...), `name`, `sort_order`: Định nghĩa khung năng lực và cấp bậc của công ty.

3.  **`user_contracts`**:
    *   `contract_number`: Số hợp đồng.
    *   `signed_date`, `expiry_date`: Quản lý thời hạn hợp đồng.
    *   `document_id`: FK trỏ tới bảng `documents` để lưu file PDF hợp đồng scan.

4.  **`user_profiles`**:
    *   Chứa thông tin PII (Personally Identifiable Information): `id_number` (CCCD), `bank_account_number`, `tax_code`.

### Tóm tắt sự khác biệt: CEO vs. PM trong phân hệ Tài chính

| Đặc điểm | CEO View | PM View |
| :--- | :--- | :--- |
| **Phạm vi (Scope)** | Toàn bộ dự án trong Công ty (Org-wide) | Chỉ dự án mình được assign làm PM |
| **Chi tiết lương** | Xem được Lương tháng & Cost Rate của tất cả mọi người | Chỉ thấy Cost Rate (nếu được cấp quyền `VIEW_SALARY`) để tính budget dự án, thường không thấy Lương tháng. |
| **Mục đích** | Đánh giá lợi nhuận công ty, duyệt tăng lương | Kiểm soát ngân sách dự án (Burn rate) |

Mô tả trên đảm bảo bao phủ 100% các khía cạnh từ giao diện người dùng đến thiết kế cơ sở dữ liệu và bảo mật cho phân hệ Nhân sự & Tài chính của vai trò CEO.