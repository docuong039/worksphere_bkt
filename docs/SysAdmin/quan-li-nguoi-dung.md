Dựa trên tài liệu BA và thiết kế hệ thống, chức năng "Quản lý Người dùng" của System Admin **khác biệt hoàn toàn** so với Org Admin. System Admin không quản lý nhân viên hàng ngày mà quản lý **Danh tính toàn cục (Global Identity)** và **Hỗ trợ kỹ thuật cấp cao**.

Dưới đây là **100% logic chức năng** của giao diện quản lý người dùng dành cho System Admin:

### 1. Giao diện: Khởi tạo Quản trị viên Tổ chức (Tenant Provisioning)
Đây là logic xảy ra khi System Admin bàn giao hệ thống cho một khách hàng mới.

*   **Chức năng Logic:** Tạo tài khoản Org Admin đầu tiên (Create First Org Admin).
*   **User Story:** US-SYS-01-03.
*   **Quyền hạn (Permission):** `ORG_USER.CREATE`.
*   **Logic Backend:**
    1.  **Kiểm tra Email:** Kiểm tra xem email đã tồn tại trong bảng `users` (toàn cục) chưa. Bảng `users` yêu cầu email là duy nhất (Unique) trên toàn hệ thống.
    2.  **Tạo Identity:** Nếu chưa có, insert bản ghi mới vào bảng `users` với `status = 'ACTIVE'`.
    3.  **Liên kết Tổ chức:** Insert bản ghi vào bảng `org_memberships` với `org_id` của khách hàng và `user_id` vừa tạo.
    4.  **Gán Quyền:** Insert vào bảng `user_roles` với Role là `ORG_ADMIN` (Quản trị tổ chức).
    5.  **Bàn giao:** Gửi email thông báo mật khẩu tạm thời hoặc link kích hoạt (theo quy trình nghiệp vụ).

### 2. Giao diện: Hỗ trợ & Cứu hộ Người dùng (Global User Support)
Đây là giao diện System Admin dùng để xử lý các sự cố khẩn cấp cho bất kỳ user nào trong hệ thống (Cross-tenant).

#### A. Chức năng: Reset Mật khẩu Khẩn cấp (Force Reset Password)
*   **User Story:** US-SYS-01-04.
*   **Quyền hạn (Permission):** `ORG_USER.UPDATE`.
*   **Mục đích:** Hỗ trợ khi user (bao gồm cả Org Admin của khách hàng) bị mất quyền truy cập và chức năng "Quên mật khẩu" tự động không hoạt động hoặc bị lỗi.
*   **Logic Backend:**
    1.  Tìm kiếm user theo Email hoặc ID trong bảng `users`.
    2.  Cập nhật trường `password_hash` với chuỗi mã hóa mới (Bcrypt/Argon2).
    3.  Ghi Audit Log hành động này để đảm bảo minh bạch.

#### B. Chức năng: Đăng nhập dưới quyền (Impersonation / "God Mode")
Đây là chức năng nhạy cảm nhất, cho phép Admin "nhập vai" user để nhìn thấy chính xác những gì user đang thấy.

*   **User Story:** US-SYS-01-06.
*   **Quyền hạn (Permission):** `SESSION.IMPERSONATE`.
*   **Chính sách (Policy):** `POL-SYS-IMP`.
*   **Quy trình Giao diện (UI Flow):**
    1.  Admin tìm kiếm User cần hỗ trợ.
    2.  Nhấn nút "Login as User" (Đăng nhập dưới quyền).
    3.  **Bắt buộc:** Hệ thống hiển thị Popup yêu cầu nhập **"Lý do hỗ trợ"** (Reason).
*   **Logic Backend & Bảo mật (Bắt buộc):**
    1.  **Khởi tạo Session:** Tạo một bản ghi trong bảng `impersonation_sessions` bao gồm: `actor_user_id` (Admin), `subject_user_id` (User bị giả danh), và `reason` (Lý do đã nhập).
    2.  **Audit Trail:** Mọi hành động thực hiện trong phiên này (Ví dụ: xem task, sửa báo cáo) đều được ghi vào bảng `audit_logs` với:
        *   `actor_user_id` = ID của User bị giả danh (để hệ thống chạy đúng logic quyền).
        *   `impersonation_session_id` = ID của phiên hỗ trợ.
        *   `original_actor_id` = ID của System Admin (để truy vết trách nhiệm sau này).
    3.  **Kiểm soát rủi ro (SoD):** Hệ thống cảnh báo hoặc chặn nếu System Admin cố tình dùng quyền này để xóa Audit Log của chính mình (Xung đột giữa `SESSION.IMPERSONATE` và `SYS_AUDIT.READ`).

### 3. Giao diện: Quản trị Danh tính Toàn cục (Global Identity Management)
Mặc dù tài liệu tập trung vào user stories hỗ trợ, thiết kế database cho thấy System Admin nắm quyền quản lý bảng `users` gốc.

*   **Logic Trạng thái Tài khoản:**
    *   System Admin có quyền quản lý cột `status` trong bảng `users` (Giá trị: `ACTIVE`, `LOCKED`).
    *   **Khóa toàn cục (Global Lock):** Nếu System Admin chuyển status sang `LOCKED`, user đó sẽ không thể đăng nhập vào **bất kỳ** tổ chức nào trên hệ thống SaaS. Đây là mức phạt cao nhất (Platform ban).

### Tóm tắt Quyền hạn & Tài nguyên (Resource Mapping)
Để thực hiện các chức năng trên, System Admin thao tác trên các tài nguyên sau:

| Mã Tài nguyên | Tên Tài nguyên | Bảng Database | Hành động cho phép |
| :--- | :--- | :--- | :--- |
| **ORG_USER** | Người dùng (Global) | `users`, `org_memberships` | `CREATE` (Tạo Org Admin), `UPDATE` (Reset Pass/Lock) |
| **SESSION** | Phiên làm việc | `impersonation_sessions` | `IMPERSONATE` (Đăng nhập hộ) |
| **SYS_AUDIT** | Nhật ký hệ thống | `audit_logs` | `READ` (Xem lịch sử truy cập) |

**Lưu ý quan trọng:**
System Admin **không** có giao diện để tạo/quản lý nhân viên (Employee) hàng ngày cho các công ty khách hàng. Việc thêm nhân viên, gán vào dự án, chấm công là quyền hạn riêng biệt của **Org Admin** và **Project Manager** (User Story ORG-01-01, MNG-01-02),.