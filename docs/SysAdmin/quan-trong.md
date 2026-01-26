Tiếp nối các phần trước về Quản lý Tổ chức và Người dùng, dưới đây là phần còn lại trong tài liệu mô tả 100% logic chức năng của vai trò **System Admin**, tập trung vào các giao diện: **Quản trị Role Master (Cấu hình hệ thống)**, **Giám sát Bảo mật (Audit & Dashboard)**, và **Thùng rác Hệ thống**.

---

### 3. Giao diện: Quản lý Role Master (System Roles Configuration)
**Mục đích:** System Admin định nghĩa "bộ khung" phân quyền chuẩn (Template) cho toàn bộ hệ thống SaaS. Các tổ chức con sẽ kế thừa hoặc sử dụng các role này làm chuẩn.

#### A. Logic Chức năng (Business Logic)
1.  **Định nghĩa Role Hệ thống (Master Roles):**
    *   **Hành động:** Tạo/Sửa các Role mặc định như `ORG_ADMIN`, `CEO`, `PROJECT_MANAGER`, `EMPLOYEE`.
    *   **User Story:** US-SYS-01-05.
    *   **Quyền hạn:** `ROLE_PERM.CREATE`, `ROLE_PERM.UPDATE`.
    *   **Logic Backend:**
        *   Thao tác với bảng `roles`.
        *   Thiết lập cột `scope_type = 'PLATFORM'` hoặc `is_system = true` để đánh dấu đây là Role cấp hệ thống, không thuộc riêng Org nào.
        *   Role này sẽ hoạt động như một "Template" mà các Org Admin có thể thấy và gán cho user của họ (nhưng Org Admin thường không được sửa các Role `is_system` này tùy theo cấu hình),.

2.  **Cấu hình Permission cho Role:**
    *   **Hành động:** Gán các quyền (Permission) cụ thể (ví dụ: `TASK.CREATE`, `REPORT.READ`) vào các Role Master.
    *   **Logic Backend:** Insert dữ liệu vào bảng `role_permissions`.

---

### 4. Giao diện: Dashboard & Giám sát Hệ thống (System Monitoring)
**Mục đích:** Cung cấp cái nhìn toàn cảnh về sức khỏe và sự phát triển của nền tảng SaaS (Business Intelligence).

#### A. Logic Hiển thị (View Logic)
1.  **Dashboard Tổng hợp (BI):**
    *   **User Story:** US-SYS-02-01.
    *   **Dữ liệu hiển thị:**
        *   **Tổng số Tổ chức (Total Orgs):** `COUNT(id)` từ bảng `organizations`.
        *   **Tổng số User Active:** `COUNT(id)` từ bảng `users` có `status='ACTIVE'`.
        *   **Tình trạng tài nguyên:** Thống kê dung lượng lưu trữ đã dùng so với Quota cấu hình trong `org_quotas`.
    *   **Permission:** `PLATFORM_ORG.READ`.
    *   **Logic Truy vấn:** System Admin thực hiện các query gom nhóm (Aggregation) trên phạm vi toàn cục (Global Scope), bỏ qua filter `org_id`,.

---

### 5. Giao diện: Nhật ký Kiểm tra Toàn cục (Global Audit Log)
**Mục đích:** "Hộp đen" của hệ thống, ghi lại mọi hành động nhạy cảm để phục vụ điều tra, tuân thủ pháp lý (Compliance) và minh bạch hóa hành động của chính Admin.

#### A. Logic Truy xuất & Bảo mật
1.  **Xem Audit Log toàn hệ thống:**
    *   **User Story:** US-SYS-02-02.
    *   **Quyền hạn:** `SYS_AUDIT.READ`.
    *   **Dữ liệu:** Truy xuất từ bảng `audit_logs`.
    *   **Logic hiển thị:** Xem được hành động của tất cả user ở tất cả các Org (Cross-tenant). Hiển thị chi tiết: `actor_user_id` (Ai làm), `action` (Làm gì), `entity_type` (Trên đối tượng nào), `before_data/after_data` (Thay đổi gì).

2.  **Giám sát Phiên "Đăng nhập dưới quyền" (Impersonation Audit):**
    *   **Logic cực kỳ quan trọng:** Khi System Admin dùng tính năng "Login as User" (Impersonate), hệ thống ghi log đặc biệt để truy vết trách nhiệm.
    *   **Cấu trúc Log:**
        *   `impersonation_session_id`: ID phiên hỗ trợ từ bảng `impersonation_sessions`.
        *   `original_actor_id`: ID thật của System Admin (để biết ai đang "núp bóng").
        *   `actor_user_id`: ID của User bị giả danh (để hệ thống chạy đúng quyền).
    *   **Ràng buộc SoD (Separation of Duties):** Hệ thống có cảnh báo rủi ro nếu một Admin có cả quyền `SESSION.IMPERSONATE` (Giả danh) và quyền `SYS_AUDIT.READ` (Xem/Xóa log), tránh việc Admin làm sai rồi tự xóa dấu vết.

---

### 6. Giao diện: Thùng rác Hệ thống (System Recycle Bin)
**Mục đích:** Quản lý vòng đời cuối cùng của các Tổ chức (Organizations) đã bị xóa. Đây là tầng bảo vệ cao nhất chống mất mát dữ liệu khách hàng.

#### A. Logic Chức năng
1.  **Xem danh sách Tổ chức đã xóa:**
    *   **User Story:** US-SYS-03-01.
    *   **Nguồn dữ liệu:** Bảng `recycle_bin_items` với điều kiện `entity_type = 'ORGANIZATION'` hoặc bảng `organizations` có `deleted_at IS NOT NULL`.

2.  **Khôi phục Tổ chức (Restore):**
    *   **Hành động:** Khôi phục lại một Org cùng toàn bộ dữ liệu (User, Project, Task...).
    *   **User Story:** US-SYS-03-02.
    *   **Quyền hạn:** `PLATFORM_ORG.RESTORE`.
    *   **Logic Backend:** Set `deleted_at = NULL` cho bản ghi trong bảng `organizations` và xóa bản ghi tương ứng trong `recycle_bin_items`.

3.  **Xóa vĩnh viễn (Hard Delete / Destroy):**
    *   **Hành động:** Xóa sạch dữ liệu khỏi ổ cứng (thường dùng khi khách hàng yêu cầu xóa dữ liệu theo GDPR hoặc hủy hợp đồng).
    *   **User Story:** US-SYS-03-03.
    *   **Quyền hạn:** `PLATFORM_ORG.DESTROY`.
    *   **Logic Backend:** Thực hiện lệnh `DELETE` vật lý. Logic ràng buộc khóa ngoại (`FK Restrict/Cascade`) được kích hoạt để dọn dẹp sạch sẽ các bảng con (Users, Projects, Tasks...).

---

### 7. Tổng kết: Kiến trúc "God Mode" của System Admin
Dưới đây là tóm tắt các đặc quyền kỹ thuật chỉ dành riêng cho vai trò này, dựa trên thiết kế Database và Security:

1.  **Bypass Tenant Isolation (Vượt qua cô lập dữ liệu):**
    *   Trong khi mọi user khác luôn bị gắn chặt với câu lệnh `WHERE org_id = ...`, System Admin có cơ chế đặc biệt (thường là Role DB hoặc cờ `app.is_sys_admin=true`) để truy vấn dữ liệu toàn cục.
2.  **Định danh (Identity):**
    *   Trong bảng `users`, System Admin thường có `org_id IS NULL` (không thuộc về Org nào) hoặc thuộc về một Org quản trị riêng biệt.
3.  **Quyền tối thượng (Permission Mapping):**
    *   Sở hữu các quyền độc quyền: `PLATFORM_ORG.*`, `SYS_AUDIT.READ`, `SESSION.IMPERSONATE`, `ROLE_PERM.CREATE` (Scope Platform).

Như vậy, chúng ta đã liệt kê đầy đủ 100% các chức năng, giao diện và logic vận hành của vai trò System Admin từ khởi tạo, quản lý, hỗ trợ đến giám sát và dọn dẹp hệ thống.